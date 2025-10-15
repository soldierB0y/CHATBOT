import { app, shell, BrowserWindow, ipcMain, webContents } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import {Client, LocalAuth} from 'whatsapp-web.js';
import * as XLSX from 'xlsx';
import QRCode from 'qrcode-terminal';
import path from 'path';
import { testConnection,getDebtorCustomers, getCustomers,getExcCustomers, updateExcCustomers, getDatesSent } from './backend/controller';

//important variables
let mainWindow;
let excelFilePath= app.isPackaged?path.join(process.resourcesPath, 'app.asar.unpacked', 'excel', 'debtorsExceptions.xlsx'):path.join(process.cwd(),'excel','debtorsExceptions.xlsx');
let newQr; 
let client

//app
app.whenReady().then(() => {

  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })
  createWindow()
  mainWindow.webContents.openDevTools();
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
/*
ipcMain.handle('sendMsg', async (e) => {
  return await sendMsg();
});*/
ipcMain.handle('getDateSends', async (e) => {
  return await getDatesSent();
});

ipcMain.handle('getDebtors',async ()=>{
  const debtors= await getDebtorsToSendMsg();
  return debtors;
})

ipcMain.handle('sendMsg',async()=>{
    const debtors = await getDebtorsToSendMsg();
    const debtorsToSendMsg= debtors.filter(d=>d!=undefined);
    const result= {enviados:[],fallidos:[]};

     for( let i=0; i < debtorsToSendMsg.length; i++)
          {
              const name= debtorsToSendMsg[i].Nombre_Cliente;
              let tel= debtorsToSendMsg[i].Telefono || ""
              if (tel[0]!="1")  tel="1"+tel; 
              const numberCorrected =tel+'@c.us';
              const totalOfBill= debtorsToSendMsg[i].total_facturas;
              const payed= debtorsToSendMsg[i].total_abonos;
              const remainingDebt = debtorsToSendMsg[i].restante;
            try {
              const msg = `Estimado Cliente ${name}, le hablamos desde Ferreteria Yenri, para recordarle realizar el pago correspondiente al monto de ${remainingDebt}DOP lo mas pronto posible. `; 
              await client.sendMessage(numberCorrected,msg);
              await client.sendMessage(numberCorrected,"Numeros de cuenta para transferencias: Banco popular ==> 745959635 (Richar Batista), Banreservas==> 1630452690 (Richar Batista), Banco BHD==> 13686600032 (Richar Batista)")
              result.enviados.push({name:name,number:numberCorrected,remainingDebt:remainingDebt})
              
            } catch (error) {
              result.fallidos.push({name:name,number:numberCorrected,remainingDebt:remainingDebt})
            }

          }

//envia el resultado al front
          mainWindow.webContents.send('onMsgResult',result)

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
  authStrategy: new LocalAuth({ clientId: "miSesion" }),
  puppeteer: {
    executablePath:getChromePath(),
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox', 
      '--disable-dev-shm-usage'
    ],
    headless: true
  }
})
  

      // ✅ TODOS LOS EVENTOS DE ERROR POSIBLES
    client.on('auth_failure', (msg) => {
      console.error('❌ FALLA DE AUTENTICACIÓN:', msg);
      mainWindow.webContents.send('authError', { error: msg });
    });

    client.on('disconnected', (reason) => {
      console.error('🔌 DESCONECTADO:', reason);
      mainWindow.webContents.send('disconnected', { reason });
    });

    // ✅ NUEVOS EVENTOS DE ERROR
    client.on('change_state', (state) => {
      if (state === 'UNPAIRED' || state === 'UNLAUNCHED') {
        console.error('❌ ESTADO CRÍTICO:', state);
        mainWindow.webContents.send('changeState', { state });
      }})

  client.once('ready',async() => {

    //Luego del Logeo
    console.log('once ready')
      mainWindow.webContents.send('ready',{ready:true});
  });

client.on('qr', (qr) => {
  newQr= qr;
    QRCode.generate(qr, { small: true },(x)=>{
        console.log(x);
    });
    sendQRFront(qr);
});

client.on('ready',()=>{
  console.log(' is ready')
})

// se encarga de inicializar el navegador de puppeteer, en caso de que fracase envia un mensaje al front

    client.initialize().catch(error => {
      console.error('❌ ERROR EN INITIALIZE:', error);
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
