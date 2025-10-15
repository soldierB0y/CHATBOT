import { useEffect, useState } from "react"
import {QRCodeCanvas} from 'qrcode.react';
import { useNavigate } from "react-router-dom";
export const QRPage= ()=>{
    const navigator= useNavigate();
    const [QRvalue,setQRValue]= useState('');
    useEffect(()=>{
    window.api.getQR( qr=>{
      setQRValue(qr)
    });

    window.api.isReady(data=>{
      console.log(data);
      if(data.ready==true)
        navigator('/home');
    })
  },[])
    return(
        <section style={
        {
          width:'100%',
          height:'100%',
          backgroundColor:'white',
          display:"flex",
          flexDirection:'column',
          alignItems:'center',
          justifyContent:'center',
        }
      }>
        <p style={{fontWeight:700}}>Escanee este codigo para iniciar sesion:</p>
        {QRvalue!=''?<QRCodeCanvas value={QRvalue} size={500}/>:<>Cargando...</>}
      </section>
    )
}