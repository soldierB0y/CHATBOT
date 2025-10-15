import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
export const Home= ()=>{
    //example msg {recipients:[],msg:""}
    const nav= useNavigate();
    const [customers,setCustomers]= useState([]);
    const [customersName,setCustomersName]= useState([]);
    const [filterCustomerName,setFilterCustomerName]=useState([]);
    const [inputNameValue,setInputNameValue]= useState("");
    const [excepCustomers,setExcepCustomers]=useState([]);
    const [excCodigo,setExcCodigo]=useState([]);
    const [customerSelected,setCustomerSelected]= useState(undefined);
    const [dateSends,setDateSends]= useState([]);
    const [sentToday,setSentToday]= useState("");
    const [mustSendToday,setMustSendToday]= useState("");
    const [msgState,setMsgState]= useState("");
    const [debtors,setDebtors]= useState([]);
    const [updateResult,setUpdateResult]=useState("");
    const [sendMsgResults,setSendMsgResults]= useState({enviados:[],fallidos:[]});
    const [copyName,setCopyName]=useState("Copiar Nombres");
    const [copyArr,setCopyArr]=useState("Copiar Arreglo");
    useEffect( ()=>{
        getCustomers();
        getExcCustomers();
        getDateSends();
        window.api.onMsgResult( (e,data)=>{
            setMsgState("realizado!");
            setSendMsgResults(data);
        });
        window.api.onSessionClose((e,data)=>{

            if (data==true) nav('/')
            else alert('error:'+data);
         })

    },[])
    useEffect(()=>{
        console.log(customers);
        if (customers)
        {
            const arrCustomers= customers || [];
            //console.log(arrCustomers);
            setCustomersName(arrCustomers.map(c=>c));
            setFilterCustomerName(arrCustomers.map(c=>c))
        }

    },[customers])

    useEffect(()=>{
        //console.log(inputNameValue);
        setFilterCustomerName(customersName.filter(cn=>  cn.Nombre_Representante.toLowerCase().includes(inputNameValue.toLocaleLowerCase())))
    },[inputNameValue])

    useEffect(()=>{
        if(customers.res==true)
        {
          setExcepCustomers(customers.result.filter(c=>{
                let isIqual=false;
                excCodigo.find(excC=>{
                    if(c.Codigo==excC) isIqual=true
                })
                if (isIqual==true) return c;
            }))
        }
    },[excCodigo])

    //funciones 
    const getCustomers=async()=>{
        const response= await window.api.getCustomers();
        console.log(response.res);
        const arr= response.res==true?response.result:[];
        setCustomers(arr);
        return arr;
    }
    const getExcCustomers = async () => {
        const cust =await getCustomers();
        const excCodigos = await window.api.getExcCustomers();
        console.log(cust);
        setExcCodigo(excCodigos || []);
        if (cust) {
            setExcepCustomers(cust.filter(c=>{
                let isIqual=false;
                for(let i= 0;i < excCodigos.length;i++)
                {
                    if (c.Codigo==excCodigos[i])
                    {
                        isIqual = true;
                        break;
                    }
                }
                return isIqual;
            }))
        }
    }
    const updateExc=async()=>{
        console.log(excepCustomers.map(excC=>excC.Codigo));
        const res= await window.api.updateExcCustomers(excepCustomers.map(excC=>excC.Codigo)); 
        if (res.res==true){setUpdateResult("Actualizado exitosamente")}
        else {
            setUpdateResult("Error al actualizar exceptuados")
        }
    }


    const sendMsg= async()=>{ 
        const res= await window.api.sendMsg();
        console.log(res);
    }

    const getDateSends=async()=>{
        const response=await window.api.getDateSends();
        if(response.res==true){
            setDateSends(response.result.map(ds=>{
                return excelToDate(ds);
            }));
        }
    }

    const excelToDate=(excelDate)=> {
        const result=  new Date((excelDate - 25569+1) * 86400 * 1000);
        console.log(result);
        return result;
    }

    return(
        <>
            <section style={{display:'flex',alignItems:'center',flexDirection:'column',gap:'5px',width:'99vw',overflowX:'hidden'}}>
                <span style={{width:'100vw',display:'flex',flexDirection:'row',justifyContent:'flex-end',paddingRight:'90px'}}><button style={{alignSelf:'flex-start',marginLeft:'30px',padding:'8px 30px',cursor:'pointer'}}
                    onClick={()=>{window.api.closeSession()}}
                >Cerrar Sesion</button></span>
                <h2 style={{width:'100vw',paddingLeft:'80px'}}>NO enviar a:</h2>
                    <div style={{width:'90vw',display:'flex',flexDirection:'row',flexWrap:'wrap',gap:'3px',alignSelf:'flex-start',paddingLeft:'30px'}}>
                    {
                        excepCustomers.map((c,index)=><span key={index} style={{backgroundColor:'#c9c9c9ff',borderRadius:'5px',padding:'5px 10px',cursor:'pointer'}}
                            onClick={()=>{
                                setExcepCustomers(excepCustomers.filter(ec=>ec.Codigo!==c.Codigo))
                            }}
                        >{c.Nombre_Representante}</span>)
                    }
                    </div>
                    {excepCustomers.length==0?<p style={{width:'100vw',paddingLeft:'80px',userSelect:'none'}}>No hay clientes agregados</p>:<></>}
                    <p style={{width:'100vw',paddingLeft:'80px'}}>{updateResult}</p>
                    <button style={{alignSelf:'flex-start',marginLeft:'30px',padding:'8px 30px',cursor:'pointer'}}
                        onClick={()=>{updateExc()}}
                    >Actualizar</button>
                <h3 style={{width:'100vw',paddingLeft:'80px'}}>Agregar a la lista:</h3>
                <input value={inputNameValue} style={{width:'90vw',height:'30px',alignSelf:'flex-start',marginLeft:'30px',paddingLeft:'10px'}} placeholder="Nombre"
                    onChange={(e)=>{setInputNameValue(e.target.value)}}
                ></input>
                <div style={{width:'90vw',maxHeight:'200px',overflowY:'scroll',display:'flex',flexDirection:'column',alignSelf:'flex-start',paddingLeft:'30px',overflowX:'hidden'}}>
                    {
                        filterCustomerName.map((c,index)=><span style={{width:'100%',backgroundColor:customerSelected==index?'#e6e6e6ff':'white',cursor:'pointer',padding:'5px 5px',userSelect:'none'}} key={index}
                            onClick={()=>{
                                if (customerSelected!=index)
                                {
                                    setCustomerSelected(index)
                                }
                                else
                                {
                                    const existExcept= excepCustomers.filter(ec=>ec.Codigo==c.Codigo) || [];
                                   if (existExcept.length==0) setExcepCustomers([...excepCustomers,c]);
                                }

                            }}
                        >{c.Nombre_Representante}</span>)
                    }
                </div>

                {
                sendMsgResults.fallidos.length > 0?
                <><table style={{width:'100%',margin:'0 85px',minHeight:'100px'}}>    
                    <thead style={{backgroundColor:'#ededed'}}>
                        <th>Nombre</th>
                        <th>Numero Corregido</th>
                        <th>Balance pendiente</th>
                    </thead>
                    <tbody>
                    {
                        sendMsgResults.fallidos.map((f,index)=><tr  key={index}
                            style={{cursor:"pointer",userSelect:'none'}}
                        >
                            <th>{f.name}</th>
                            <th>{f.number}</th>
                            <th>{f.remainingDebt}</th>
                        </tr>)
                    }
                    </tbody>
                </table>
                <span style={{width:'100vw',height:'100px',display:'flex',flexDirection:'row',alignItems:"center",justifyContent:"flex-start",paddingLeft:'85px',gap:'50px',marginBottom:'20px'}}>
                    <button style={{width:'150px',height:'35px',cursor:'pointer'}}
                        onClick={()=>{
                            const names= sendMsgResults.fallidos.map(c=>c.name);
                            navigator.clipboard.writeText(names);
                            setCopyName("Copiado")
                            setTimeout(() => {
                                setCopyName("Copiar Nombre")
                            }, 2000);
                        }}
                    >{copyName}</button>
                    <button style={{width:'150px',height:'35px',cursor:'pointer'}}
                            onClick={()=>{
                                const textoPlano = sendMsgResults.fallidos.map(
                                  f => `{name:"${f.name}",number:${f.number},remainingDebt:${f.remainingDebt}}`
                                ).join(',');
                                navigator.clipboard.writeText(textoPlano);
                                setCopyArr("Copiado")
                                setTimeout(() => {
                                setCopyArr("Copiar Arreglo")
                            }, 2000);
                            }}
                    >{copyArr}</button>
                </span>
                </>:<></>
                }
                    <button style={{alignSelf:'flex-start',marginLeft:'30px',padding:'8px 30px',cursor:'pointer'}}
                        onClick={()=>{sendMsg()}}
                    >Enviar Mensajes</button>
                    <p>{msgState}</p>
                
                <h3 style={{width:'100vw',paddingLeft:'80px'}}>Clientes que deben pagar:</h3>
                    {
                        debtors.length > 0?<>
                        <div style={{width:'90vw',maxHeight:'200px',overflowY:'scroll',display:'flex',flexDirection:'column',alignSelf:'flex-start',paddingLeft:'30px',overflowX:'hidden'}}>
                            {
                                debtors.map((debtor,index)=><span style={{width:'100%',backgroundColor:customerSelected==index?'#e6e6e6ff':'white',cursor:'pointer',padding:'5px 5px',userSelect:'none',color:'black'}}  key={index}
                                    onClick={()=>{setCustomerSelected(index)
                                        console.log(debtor)
                                    }}
                                >{debtor.Nombre_Cliente}</span>)
                            }
                            
                        </div>
                        </>:<span style={{textAlign:'left',width:'100%',paddingLeft:'80px'}}>Nada por aqui c:</span>
                    }
                                  
                    <button style={{alignSelf:'flex-start',marginLeft:'30px',padding:'8px 30px',cursor:'pointer'}}
                        onClick={ ()=>{
                            window.api.getDebtors().then(debtors=>{setDebtors(debtors.filter(d=>d!=undefined));

                            })
                        }}
                    >Ver Clientes</button>

            </section>
        </>
    )
}