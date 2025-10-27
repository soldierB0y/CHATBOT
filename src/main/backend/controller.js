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
        const customerIDs = await Venta.findAll({
            where: { pagado: false },
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
            raw: true
        });
        //console.log(customerIDs);
        return { res: true, value: customerIDs, message: '' }
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


export const sendMsg= async (debtorsToSendMsg)=>{
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
      return result;
}