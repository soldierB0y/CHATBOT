import { fn, literal, col, Op } from "sequelize";
import { DB } from "./db"
import { Customer, Venta } from "./model";
import * as XLSX from 'xlsx';
import path from 'path';
import {app} from 'electron'


export const testConnection= async ()=>{
    try {
        await DB.authenticate();
        console.log("connected")
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }

}

export const getDebtorCustomers = async () => {
    try {
        // Obtener clientes con restante > 0: si la suma de total menos la suma de Abono es mayor que 0
        const customerIDs = await Venta.findAll({
            attributes: [
                'Numero_Cliente',
                'Telefono',
                'Nombre_Cliente',
                [fn('SUM', col('total')), 'total_facturas'],
                // COALESCE SUM(Abono) to 0 so restante computes correctly when Abono is NULL
                [literal('COALESCE(SUM(Abono), 0)'), 'total_abonos'],
                [literal('SUM(total) - COALESCE(SUM(Abono), 0)'), 'restante']
            ],
            group: ['Numero_Cliente', 'Telefono', 'Nombre_Cliente'],
            having: literal('SUM(total) - COALESCE(SUM(Abono), 0) > 0'),
            raw: true
        });
        // Normalizar Telefono: convertir a string, eliminar no-dígitos y convertir literales 'null' a vacío
        const normalized = customerIDs.map(c => {
            const raw = c.Telefono;
            let tel = '';
            if (raw != null) {
                tel = String(raw).trim();
                const lower = tel.toLowerCase();
                if (lower === 'null' || lower === 'undefined') {
                    tel = '';
                } else {
                    tel = tel.replace(/[^0-9]/g, '');
                }
            }
            return { ...c, Telefono: tel };
        });

        return { res: true, value: normalized, message: '' }
    } catch (error) {
        console.log(error)
        return { res: false, value: undefined, message: error }
    }
}


//excel
//C:\Users\UserGPC\Documents\projects\CHATBOT ELECTRON\cobrador\dist\win-unpacked\resources\app.asar.unpacked\excel
let excelFilePath;
if(app.isPackaged)
{
   excelFilePath = path.join(process.resourcesPath, 'app.asar.unpacked', 'excel', 'debtorsExceptions.xlsx'); // refers to a function used to concatenate path segments into a single, valid path string,
}
else
{
  excelFilePath= path.join(process.cwd(),'excel','debtorsExceptions.xlsx');
}
//console.log(excelFilePath)
const workBook= XLSX.readFile(excelFilePath);
const sheet = workBook.Sheets["Sheet1"];
const data= XLSX.utils.sheet_to_json(sheet);

export const getCustomers= async()=>{
    try {
        const customers= await Customer.findAll({attributes:['Codigo','Telefono','Nombre_Representante'],raw:true});
        return {res:true,result:customers,message:''}
    } catch (error) {
        return {res:false,result:undefined,message:error}
    }
}

export const getExcCustomers=async ()=>{
    const customersExceptions=(()=>{
      const column0= data.map(row=>row['clientes excepciones']);
      return column0;
    })
    //console.log('customers exc',customersExceptions())
    return customersExceptions();
}

export const getDatesSent= async ()=>{
    try {
        const column1= data.map(row=>row['dateSents']);
        return {res:true,result:column1,message:''};        
    } catch (error) {
        return {res:false,result:[],message:error}
    }

}

export const updateExcCustomers = async (excC) => {
    //console.log('exc customers', excC.length);
    try {
        // Limpiar el rango existente primero (opcional pero recomendado)
        for (let rowNum = 2; rowNum <= 32; rowNum++) {
            const cellAddress = 'A' + rowNum;
            if (sheet[cellAddress]) {
                delete sheet[cellAddress];
            }
        }

        // Escribir los nuevos valores
        for (let rowNum = 0; rowNum < excC.length; rowNum++) {
            const cellAddress = 'A' + (rowNum + 2); // +2 para empezar en la fila 2
            // Usar 's' para string o verificar el tipo de dato
            sheet[cellAddress] = { 
                t: typeof excC[rowNum] === 'number' ? 'n' : 's', 
                v: excC[rowNum] 
            };
        }

        // Asegurar que el rango de la hoja esté definido
        if (!sheet['!ref']) {
            sheet['!ref'] = 'A1:A' + (excC.length + 1);
        } else {
            // Actualizar la referencia del rango
            const range = XLSX.utils.decode_range(sheet['!ref']);
            range.e.r = Math.max(range.e.r, excC.length + 1);
            sheet['!ref'] = XLSX.utils.encode_range(range);
        }

        XLSX.writeFile(workBook, excelFilePath);
        return { res: true, result: [], message: "" };
    } catch (error) {
        console.log(error);
        return { res: false, result: [], message: error.message };
    }
}


export const sendMsgFromExcel= async (excelDir)=>{
    try {
        const wookbook= XLSX.readFile(excelDir);
        const sheet= wookbook.Sheets["Sheet1"];
        const data= XLSX.utils.sheet_to_json(sheet);
        console.log(data);
    } catch (error) {
        console.log(error);
    }
}


export const sendMsg= async (client, debtorsToSendMsg)=>{
    const result = { enviados: [], fallidos: [] };

    // Normaliza y valida un teléfono. Retorna { valid: boolean, phone?: string, reason?: string }
    const normalizePhone = (raw) => {
        const s = (raw == null ? '' : String(raw)).trim();
        if (!s) return { valid: false, reason: 'vacío' };
        const lower = s.toLowerCase();
        if (lower === 'null' || lower === 'undefined') return { valid: false, reason: 'valor literal null/undefined' };

        // Extraer sólo dígitos
        let digits = s.replace(/[^0-9]/g, '');
        if (!digits) return { valid: false, reason: 'sin dígitos' };

        // Regla común: si vienen 10 dígitos (ej: RD local) añadir prefijo '1'
        if (digits.length === 10) digits = '1' + digits;

        // Aceptamos 11 dígitos que comiencen con '1' (ej: código país + número)
        if (digits.length === 11 && digits.startsWith('1')) {
            return { valid: true, phone: digits + '@c.us' };
        }

        return { valid: false, reason: `longitud inválida: ${digits.length}` };
    };

    for (let i = 0; i < (debtorsToSendMsg || []).length; i++) {
        const name = debtorsToSendMsg[i].Nombre_Cliente;
        const rawTel = debtorsToSendMsg[i].Telefono || '';
        const totalOfBill = debtorsToSendMsg[i].total_facturas;
        const payed = debtorsToSendMsg[i].total_abonos;
        const remainingDebt = debtorsToSendMsg[i].restante;

        const normalized = normalizePhone(rawTel);
        if (!normalized.valid) {
            console.warn('Teléfono inválido para', name, rawTel, normalized.reason);
            result.fallidos.push({ name: name, number: rawTel, remainingDebt: remainingDebt, reason: normalized.reason });
            continue;
        }

        const numberCorrected = normalized.phone;

        try {
            const msg = `Estimado Cliente ${name}, le hablamos desde Ferreteria Yenri, para recordarle realizar el pago correspondiente al monto de ${remainingDebt}DOP lo mas pronto posible. `;
            await client.sendMessage(numberCorrected, msg);
            await client.sendMessage(numberCorrected, "Numeros de cuenta para transferencias: Banco popular ==> 745959635 (Richar Batista), Banreservas==> 1630452690 (Richar Batista), Banco BHD==> 13686600032 (Richar Batista)")
            result.enviados.push({ name: name, number: numberCorrected, remainingDebt: remainingDebt })
        } catch (error) {
            console.error('Error sending to', numberCorrected, error && error.message ? error.message : error);
            result.fallidos.push({ name: name, number: numberCorrected, remainingDebt: remainingDebt, reason: error && error.message ? error.message : String(error) })
        }
    }

    // envia el resultado al front
    return result;
}