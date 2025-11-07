import { useEffect, useState } from "react"
import {QRCodeCanvas} from 'qrcode.react';
import { useNavigate } from "react-router-dom";
export const QRPage= ()=>{
    const navigator= useNavigate();
    const [QRvalue,setQRValue]= useState('');
    const [isQrLoading, setIsQrLoading] = useState(true);
    useEffect(()=>{
    window.api.getQR( qr=>{
      setQRValue(qr)
      setIsQrLoading(false);
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
        {QRvalue!=''?<QRCodeCanvas value={QRvalue} size={500}/>:<div style={{width:500,height:500,display:'flex',alignItems:'center',justifyContent:'center',background:'#fff'}}> </div>}
        {isQrLoading && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}>
            <div style={{
              background: '#fff',
              padding: 20,
              borderRadius: 8,
              boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
              display: 'flex',
              gap: 12,
              alignItems: 'center'
            }}>
              <div style={{width:32,height:32,border:'4px solid #ddd',borderTop:'4px solid #3b82f6',borderRadius:'50%',animation:'spin 1s linear infinite'}} />
              <div style={{fontSize:16,fontWeight:600}}>Generando código QR...</div>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}
      </section>
    )
}