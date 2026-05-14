import { app, shell, BrowserWindow, ipcMain, webContents } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import {Client, LocalAuth} from 'whatsapp-web.js';
import * as XLSX from 'xlsx';
import QRCode from 'qrcode-terminal';
import path from 'path';
import { testConnection, getDebtorCustomers, getCustomers, getExcCustomers, updateExcCustomers, getDatesSent, sendMsg, sendMsgFromExcel, getTableRows, parseExcelBuffer } from './backend/controller';

//important variables
let mainWindow;
let excelFilePath = app.isPackaged ? path.join(process.resourcesPath, 'app.asar.unpacked', 'excel', 'debtorsExceptions.xlsx') : path.join(process.cwd(), 'excel', 'debtorsExceptions.xlsx');
let newQr;
let client;
let isClientReady = false;

//app
app.whenReady().then(() => {

  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })
  createWindow()
  app.on('activate', function () {

    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

function createWindow() {
  // Create the browser window.
   mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      devTools:true
    }
  })
  

//../renderer/index.html
  mainWindow.on('ready-to-show', async() => {
    mainWindow.show();
     client= createClient().client;
  })

  mainWindow.once('ready',()=>{
    const isDev= !app.isPackaged;
    mainWindow.webContents.send('isDev',{isDev});

  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    // Ajuste: usar ruta relativa desde __dirname
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }
}
//cerrar todo
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})


//handles
ipcMain.handle('getNewQR', async (e)=>{
  return newQr;
})
ipcMain.handle('getReadyState', async () => {
  return { ready: isClientReady };
});

ipcMain.handle('closeSession',async ()=>{
      client.logout()
        .then(() => {
          mainWindow.webContents.send('onSessionClose',true);
          mainWindow.close();
        })
        .catch(err => {mainWindow.webContents.send('onSessionClose', err)});
})

ipcMain.handle('getExcCustomers', async (e) => {
  return await getExcCustomers();
});
ipcMain.handle('updateExcCustomers', async (event, excC) => {
  return await updateExcCustomers(excC);
});
ipcMain.handle('getCustomers', async (e) => {
  return await getCustomers();
});
ipcMain.handle('testDbConnection', async (e, config) => {
  return await testConnection(config);
});
ipcMain.handle('getTableRows', async (e, config, tableName) => {
  return await getTableRows(config, tableName);
});
ipcMain.handle('getDateSends', async (e) => {
  return await getDatesSent();
});

ipcMain.handle('getDebtors', async (e, config, tableName) => {
  if (config && tableName) {
    const result = await getTableRows(config, tableName);
    return result.res ? result.result : [];
  }
  const debtors = await getDebtorsToSendMsg();
  return debtors;
})

ipcMain.handle('sendMsg', async (event, msgTemplate, dbConfig, dbTable) => {
    const debtors = dbConfig && dbTable ? (await getTableRows(dbConfig, dbTable)).result : await getDebtorsToSendMsg();
    const debtorsToSendMsg = (debtors || []).filter(d => d != undefined);
    if (mainWindow && mainWindow.webContents) {
      mainWindow.webContents.send('msgStatus', { status: 'Preparando envío de mensajes...', total: debtorsToSendMsg.length });
    }
    const result = await sendMsg(client, debtorsToSendMsg, msgTemplate, (progress) => {
      if (mainWindow && mainWindow.webContents) {
        mainWindow.webContents.send('msgProgress', progress);
      }
    });
    if (mainWindow && mainWindow.webContents) {
      mainWindow.webContents.send('onMsgResult', result);
    }
    return result;
})

ipcMain.handle('parseExcelBuffer', async (e, uint8arr) => {
  try {
    const buffer = Buffer.from(uint8arr);
    return await parseExcelBuffer(buffer);
  } catch (err) {
    console.error('Error parsing excel buffer:', err);
    return { res: false, result: [], message: String(err) };
  }
});

ipcMain.handle('sendMsgFromExcel', async (e, fileDir) => {
  sendMsgFromExcel(fileDir);
})

// Handler to receive an ArrayBuffer/Uint8Array from renderer, parse Excel and send messages
ipcMain.handle('sendExcelBuffer', async (e, uint8arr, msgTemplate) => {
  try {
    if (!client) {
      throw new Error('WhatsApp client not initialized');
    }
    const buffer = Buffer.from(uint8arr);
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet);
    const result = { enviados: [], fallidos: [] };
    if (mainWindow && mainWindow.webContents) {
      mainWindow.webContents.send('msgStatus', { status: 'Preparando envío desde Excel...', total: rows.length });
    }
    // Normalize header keys (remove spaces, toLowerCase, remove accents) to allow flexible column names
    const normalizeKey = (k) => k.toString().toLowerCase().replace(/\s+/g, '').replace(/á/g,'a').replace(/é/g,'e').replace(/í/g,'i').replace(/ó/g,'o').replace(/ú/g,'u').replace(/ñ/g,'n');
    let excelIndex = 0;
    for (const row of rows) {
      excelIndex += 1;
      // Build a normalized row map
      const norm = {};
      for (const key of Object.keys(row)) {
        const nk = normalizeKey(key);
        norm[nk] = row[key];
      }

      // Determine fields using common header names from your Excel:
      // name: 'nombrecliente'  (from 'Nombre cliente')
      // phone: 'telefono'
      // remainingDebt: 'balancependiente' or 'montodeuda' (or compute montodeuda - abono)
      const name = norm['nombrecliente'] || norm['nombre_representante'] || norm['nombre_cliente'] || norm['nombre'] || norm['name'] || 'Cliente';
      let tel = String(norm['telefono'] || norm['telefono'] || norm['phone'] || norm['numero'] || norm['number'] || '').trim();

      // Determine remaining debt: prefer 'balancependiente', fallback to 'montodeuda' - 'abono' if available
      let remainingDebt = '';
      if (norm['balancependiente'] != null && norm['balancependiente'] !== '') {
        remainingDebt = norm['balancependiente'];
      } else if (norm['restante'] != null && norm['restante'] !== '') {
        remainingDebt = norm['restante'];
      } else if (norm['montodeuda'] != null) {
        const monto = parseFloat(String(norm['montodeuda']).toString().replace(/[^0-9.-]+/g, '')) || 0;
        const abono = parseFloat(String(norm['abono'] || 0).toString().replace(/[^0-9.-]+/g, '')) || 0;
        remainingDebt = monto - abono;
      } else if (norm['remainingdebt'] != null) {
        remainingDebt = norm['remainingdebt'];
      }

      // Clean phone: remove non-digits
      tel = tel.replace(/[^0-9]/g, '');
      if (!tel) {
        result.fallidos.push({ name, number: tel, remainingDebt, reason: 'Número vacío o inválido' });
        if (mainWindow && mainWindow.webContents) {
          mainWindow.webContents.send('msgProgress', {
            current: excelIndex,
            total: rows.length,
            name,
            number: tel,
            status: `Número inválido en fila ${excelIndex}`
          });
        }
        continue;
      }
      // Ensure country code / format (your app prepends '1' historically)
      if (!tel.startsWith('1')) tel = '1' + tel;
      const numberCorrected = tel + '@c.us';
      try {
        let msg = msgTemplate || `Estimado Cliente {name}, le hablamos desde Ferreteria Yenri, para recordarle realizar el pago correspondiente al monto de {remainingDebt} DOP lo mas pronto posible.`;
        msg = msg.replace(/{name}/g, name)
                 .replace(/{telephone}/g, tel)
                 .replace(/{remainingDebt}/g, remainingDebt);
        if (mainWindow && mainWindow.webContents) {
          mainWindow.webContents.send('msgProgress', {
            current: excelIndex,
            total: rows.length,
            name,
            number: numberCorrected,
            status: `Enviando mensaje a ${name} (${excelIndex}/${rows.length})`
          });
        }
        await client.sendMessage(numberCorrected, msg);
        result.enviados.push({ name, number: numberCorrected, remainingDebt });
      } catch (err) {
        console.error('Error sending to', numberCorrected, err);
        result.fallidos.push({ name, number: numberCorrected, remainingDebt, reason: String(err) });
        if (mainWindow && mainWindow.webContents) {
          mainWindow.webContents.send('msgProgress', {
            current: excelIndex,
            total: rows.length,
            name,
            number: numberCorrected,
            status: `Error enviando a ${name}: ${String(err)}`
          });
        }
      }
    }
    mainWindow.webContents.send('onMsgResult', result);
    return result;
  } catch (err) {
    console.error('Error in sendExcelBuffer handler:', err);
    mainWindow.webContents.send('onMsgResult', { enviados: [], fallidos: [], error: String(err) });
    return { res: false, error: String(err) };
  }
})



const sendQRFront = (qr)=>{
    mainWindow.webContents.send('QR',qr);
}

const getDebtorsToSendMsg= async()=>{
    const allDebtors= await getDebtorCustomers();
      if(allDebtors.res==true)
      {
        const workBook= XLSX.readFile(excelFilePath);
        const sheet = workBook.Sheets["Sheet1"];
        const data= XLSX.utils.sheet_to_json(sheet);
        const customersExceptions=(()=>{
          const column0= data.map(row=>row['clientes excepciones']);
          return column0;
        })();
        //console.log('data:',customersExceptions);
        const debtorsToSendMsg = allDebtors.value.map(deptor=>{
            let isIqual= false;
            for(var i= 0; i < customersExceptions.length;i++)
            {
              //console.log(deptor.Numero_Cliente+"//"+customersExceptions[i],);
              if (deptor.Numero_Cliente==customersExceptions[i])
              {
                isIqual=true;
                break;

              }
            }
            if(isIqual==false) return deptor;
        }) 

        //console.log('debtors to send msg:',debtorsToSendMsg);
        return (debtorsToSendMsg);
      }
}



//whatsappChatBot
const createClient= ()=>{
  try {
const getChromePath = () => {
  if (app.isPackaged) {
    // ✅ RUTA CORRECTA para tu caso específico
    const chromePath = path.join(
      process.resourcesPath, 
      'app.asar.unpacked', 
      'node_modules', 
      'puppeteer', 
      'node_modules', 
      'puppeteer-core', 
      '.local-chromium', 
      'win64-1045629', 
      'chrome-win', 
      'chrome.exe'
    )
    


    
    return chromePath
  } else {
    // En desarrollo
    return undefined // Que use Chromium por defecto
  }
}

 client = new Client({
  authStrategy: new LocalAuth({ clientId: "miSesion", dataPath: app.getPath('userData') }),
  puppeteer: {
    executablePath:getChromePath(),
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox', 
      '--disable-dev-shm-usage'
    ],
    headless:false
  }
})
  

      // ✅ TODOS LOS EVENTOS DE ERROR POSIBLES
    client.on('auth_failure', (msg) => {
      console.error('❌ FALLA DE AUTENTICACIÓN:', msg);
      if (mainWindow && mainWindow.webContents) {
        mainWindow.webContents.send('authError', { error: msg });
        mainWindow.webContents.send('wsLoading', { loading: false, message: `Falla de autenticación: ${msg}` });
      }
    });

    client.on('authenticated', () => {
      console.log('✅ Sesión autenticada');
      if (mainWindow && mainWindow.webContents) {
        mainWindow.webContents.send('wsLoading', { loading: true, message: 'Sesión autenticada, esperando carga de WhatsApp...' });
      }
    });

    client.on('disconnected', (reason) => {
      console.error('🔌 DESCONECTADO:', reason);
      if (mainWindow && mainWindow.webContents) {
        mainWindow.webContents.send('disconnected', { reason });
        mainWindow.webContents.send('wsLoading', { loading: false, message: `Sesión desconectada: ${reason}` });
      }
    });

    client.on('change_state', (state) => {
      if (state === 'UNPAIRED' || state === 'UNLAUNCHED') {
        console.error('❌ ESTADO CRÍTICO:', state);
        if (mainWindow && mainWindow.webContents) {
          mainWindow.webContents.send('changeState', { state });
        }
      }
    });

  client.once('ready',async() => {

    // Luego del Logeo
    console.log('once ready')
    isClientReady = true;
    if (mainWindow && mainWindow.webContents) {
      mainWindow.webContents.send('ready',{ready:true});
      mainWindow.webContents.send('wsLoading', { loading: false, message: 'WhatsApp listo' });
    }
  });

client.on('qr', (qr) => {
  newQr = qr;
  if (mainWindow && mainWindow.webContents) {
    sendQRFront(qr);
    mainWindow.webContents.send('wsLoading', { loading: false, message: 'QR generado. Escanéalo con WhatsApp para continuar.' });
  }
  QRCode.generate(qr, { small: true }, (x) => {
    console.log(x);
  });
});

client.on('ready',()=>{
  console.log(' is ready')
})

// se encarga de inicializar el navegador de puppeteer, en caso de que fracase envia un mensaje al front

    // Notificar al renderer que se está cargando la página/cliente de WhatsApp
    if (mainWindow && mainWindow.webContents) mainWindow.webContents.send('wsLoading', { loading: true, message: 'Inicializando sesión de WhatsApp...' });
    client.initialize().catch(error => {
      console.error('❌ ERROR EN INITIALIZE:', error);
      // Indicar que la carga terminó con error
      if (mainWindow && mainWindow.webContents) mainWindow.webContents.send('wsLoading', { loading: false, message: `Error inicializando WhatsApp: ${error.message}` });
      // Enviar este error al frontend
      mainWindow.webContents.send('initError', { 
        error: error.message,
        type: 'INITIALIZE_ERROR'
      });
    });
  return {res:true,client:client,message:""}
    
} 
catch (error) {
    return{res:false,client:undefined,message:error}
  }

}
