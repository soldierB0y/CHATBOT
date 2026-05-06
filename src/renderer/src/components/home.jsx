import { use, useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

export const Home = () => {

    const nav = useNavigate();
    const [customers, setCustomers] = useState([]);
    const [customersName, setCustomersName] = useState([]);
    const [filterCustomerName, setFilterCustomerName] = useState([]);
    const [inputNameValue, setInputNameValue] = useState("");
    const [excepCustomers, setExcepCustomers] = useState([]);
    const [excCodigo, setExcCodigo] = useState([]);
    const [customerSelected, setCustomerSelected] = useState(undefined);
    const [dateSends, setDateSends] = useState([]);
    const [msgState, setMsgState] = useState("");
    const [debtors, setDebtors] = useState([]);
    const [updateResult, setUpdateResult] = useState("");
    const [sendMsgResults, setSendMsgResults] = useState({ enviados: [], fallidos: [] });
    const [copyName, setCopyName] = useState("Copiar Nombres");
    const [copyArr, setCopyArr] = useState("Copiar Arreglo");
    const [fuente, setFuente] = useState("excel");
    const [fileUrl, setFileUrl] = useState("");
    const [file, setFile] = useState(undefined);
    const [buttonResult, setButtonResult] = useState("");
    const [isWsLoading, setIsWsLoading] = useState(false);
    const [wsLoadingMsg, setWsLoadingMsg] = useState('Iniciando WhatsApp...');
    const DEFAULT_TEMPLATE = 'Estimado Cliente {name}, le hablamos desde Ferreteria Yenri, para recordarle realizar el pago correspondiente al monto de {remainingDebt} DOP lo mas pronto posible.';
    const [messageTemplate, setMessageTemplate] = useState(() => localStorage.getItem('msgTemplate') || DEFAULT_TEMPLATE);
    const [saveStatus, setSaveStatus] = useState('');
    const [dbHost, setDbHost] = useState('localhost');
    const [dbPort, setDbPort] = useState('3306');
    const [dbUser, setDbUser] = useState('');
    const [dbPassword, setDbPassword] = useState('');
    const [dbName, setDbName] = useState('sp_up_sys');
    const [dbTable, setDbTable] = useState('clientes');
    const [dbConnected, setDbConnected] = useState(false);
    const [dbStatus, setDbStatus] = useState('');
    const [dbStep, setDbStep] = useState('host');
    const [dbRows, setDbRows] = useState([]);
    const [excelRows, setExcelRows] = useState([]);
    useEffect(() => {
        getCustomers();
        getExcCustomers();
        getDateSends();
        window.api.onMsgResult((e, data) => {
            setMsgState("realizado!");
            setSendMsgResults(data);
        });
        window.api.onSessionClose((e, data) => {

            if (data == true) nav('/')
            else alert('error:' + data);
        })
        // listen for whatsapp web loading state emitted from main
        window.api.onWsLoading((e, loading) => {
            setIsWsLoading(Boolean(loading));
            if (loading) setWsLoadingMsg('Cargando WhatsApp...');
        });

    }, [])
    useEffect(() => {
        console.log(customers);
        if (customers) {
            const arrCustomers = customers || [];
            //console.log(arrCustomers);
            setCustomersName(arrCustomers.map(c => c));
            setFilterCustomerName(arrCustomers.map(c => c))
        }

    }, [customers])

    useEffect(() => {
        //console.log(inputNameValue);
        setFilterCustomerName(customersName.filter(cn => cn.Nombre_Representante.toLowerCase().includes(inputNameValue.toLocaleLowerCase())))
    }, [inputNameValue])

    useEffect(() => {
        if (customers.res == true) {
            setExcepCustomers(customers.result.filter(c => {
                let isIqual = false;
                excCodigo.find(excC => {
                    if (c.Codigo == excC) isIqual = true
                })
                if (isIqual == true) return c;
            }))
        }
    }, [excCodigo])

    useEffect(() => {
        setButtonResult("");

    }, [file])

    useEffect(() => {
        console.log(file);
    }, [file])
    //funciones 
    const getCustomers = async () => {
        const response = await window.api.getCustomers();
        console.log(response.res);
        const arr = response.res == true ? response.result : [];
        setCustomers(arr);
        return arr;
    }
    const getExcCustomers = async () => {
        const cust = await getCustomers();
        const excCodigos = await window.api.getExcCustomers();
        console.log(cust);
        setExcCodigo(excCodigos || []);
        if (cust) {
            setExcepCustomers(cust.filter(c => {
                let isIqual = false;
                for (let i = 0; i < excCodigos.length; i++) {
                    if (c.Codigo == excCodigos[i]) {
                        isIqual = true;
                        break;
                    }
                }
                return isIqual;
            }))
        }
    }
    const updateExc = async () => {
        console.log(excepCustomers.map(excC => excC.Codigo));
        const res = await window.api.updateExcCustomers(excepCustomers.map(excC => excC.Codigo));
        if (res.res == true) { setUpdateResult("Actualizado exitosamente") }
        else {
            setUpdateResult("Error al actualizar exceptuados")
        }
    }


    const sendMsg = async () => {
        const res = await window.api.sendMsg(
            messageTemplate,
            fuente === 'db' ? fullDbConfig : undefined,
            fuente === 'db' ? dbTable : undefined
        );
        console.log(res);
    }

    const getDateSends = async () => {
        const response = await window.api.getDateSends();
        if (response.res == true) {
            setDateSends(response.result.map(ds => {
                return excelToDate(ds);
            }));
        }
    }

    const excelToDate = (excelDate) => {
        const result = new Date((excelDate - 25569 + 1) * 86400 * 1000);
        console.log(result);
        return result;
    }

    const sendMsgFromExcel = async () => {
        if (!file) {
            setButtonResult('Debe elegir un archivo');
            return;
        }
        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const arrayBuffer = evt.target.result;
                const uint8 = new Uint8Array(arrayBuffer);
                setButtonResult('Enviando...');
                const res = await window.api.sendExcelBuffer(uint8, messageTemplate);
                console.log('sendExcelBuffer result', res);
                setButtonResult('Envío finalizado');
            } catch (err) {
                console.error(err);
                setButtonResult('Error al enviar');
            }
        };
        reader.onerror = (err) => {
            console.error('FileReader error', err);
            setButtonResult('Error leyendo el archivo');
        };
        reader.readAsArrayBuffer(file);
    }

    const authDbConfig = {
        host: dbHost,
        port: Number(dbPort) || 3306,
        username: dbUser,
        password: dbPassword,
    };

    const fullDbConfig = {
        ...authDbConfig,
        database: dbName,
    };

    const handleHostContinue = () => {
        if (!dbHost || dbHost.trim() === '') {
            setDbStatus('Debe ingresar el host antes de continuar');
            return;
        }
        setDbStep('credentials');
        setDbStatus('Host guardado. Ahora ingrese usuario y contraseña.');
    };

    const testDbConnection = async () => {
        if (!dbUser || !dbPassword) {
            setDbStatus('Ingrese usuario y contraseña antes de conectar');
            return;
        }
        setDbStatus('Probando conexión...');
        const result = await window.api.testDbConnection(authDbConfig);
        if (result.res) {
            setDbConnected(true);
            setDbStep('dbselect');
            setDbStatus('Conectado al host. Seleccione base de datos y tabla.');
        } else {
            setDbConnected(false);
            const message = `Error de conexión: ${result.message}`;
            setDbStatus(message);
            alert(message);
        }
    };

    const loadDbClients = async () => {
        if (!dbConnected) {
            setDbStatus('Debe conectarse al host primero');
            return;
        }
        if (!dbName) {
            setDbStatus('Debe seleccionar la base de datos antes de sincronizar');
            return;
        }
        if (!dbTable) {
            setDbStatus('Debe seleccionar la tabla antes de sincronizar');
            return;
        }
        const response = await window.api.getTableRows(fullDbConfig, dbTable);
        if (response.res) {
            setDebtors(response.result);
            setDbStatus(`Tabla ${dbTable} cargada: ${response.result.length} filas`);
        } else {
            setDebtors([]);
            setDbStatus(`Error cargando tabla: ${response.message}`);
        }
    };

    const viewExcelClients = async () => {
        if (!file) {
            setButtonResult('Debe elegir un archivo');
            return;
        }
        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const arrayBuffer = evt.target.result;
                const uint8 = new Uint8Array(arrayBuffer);
                const response = await window.api.parseExcelBuffer(uint8);
                if (response.res) {
                    setExcelRows(response.result);
                    setButtonResult(`Clientes cargados: ${response.result.length}`);
                } else {
                    setExcelRows([]);
                    setButtonResult(`Error: ${response.message}`);
                }
            } catch (err) {
                console.error(err);
                setExcelRows([]);
                setButtonResult('Error leyendo el archivo');
            }
        };
        reader.onerror = (err) => {
            console.error('FileReader error', err);
            setExcelRows([]);
            setButtonResult('Error leyendo el archivo');
        };
        reader.readAsArrayBuffer(file);
    };

    return (
        <>
            <section style={{ display: 'flex', alignItems: 'center', flexDirection: 'column', gap: '5px', width: '99vw', overflowX: 'hidden' }}>
                <span style={{ width: '100vw', display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', paddingRight: '90px' }}><button style={{ alignSelf: 'flex-start', marginLeft: '30px', padding: '8px 30px', cursor: 'pointer' }}
                    onClick={() => { window.api.closeSession() }}
                >Cerrar Sesion</button></span>
                <h1>ChatBot</h1>
                <h3 style={{ width: '100vw', paddingLeft: '80px' }}>Elige la fuente de los clientes deudores:</h3>
                <select style={{ width: "93vw", height: '35px', paddingLeft: '10px' }} value={fuente}
                    onChange={(e) => {
                        setFuente(e.target.value);
                    }}
                >
                    <option value={"db"}>Base de datos</option>
                    <option value={"excel"}>excel</option>
                </select>
                <div style={{ width: '93vw', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px', border: '1px solid #eee' }}>
                    <label style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Mensaje configurable:</label>
                    <textarea
                        id="msg-template-textarea"
                        style={{ width: '100%', height: '100px', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px', lineHeight: '1.5', outline: 'none', transition: 'border-color 0.2s' }}
                        value={messageTemplate}
                        onChange={(e) => setMessageTemplate(e.target.value)}
                        placeholder="Escribe tu mensaje aquí..."
                        onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                        onBlur={(e) => e.target.style.borderColor = '#ddd'}
                    ></textarea>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <small style={{ color: '#666' }}>Variables (haz clic para insertar):</small>
                        {['{name}', '{telephone}', '{remainingDebt}'].map(variable => (
                            <span
                                key={variable}
                                style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', fontWeight: '600', border: '1px solid #bae6fd' }}
                                onClick={() => {
                                    const textarea = document.getElementById('msg-template-textarea');
                                    const start = textarea.selectionStart;
                                    const end = textarea.selectionEnd;
                                    const text = textarea.value;
                                    const before = text.substring(0, start);
                                    const after = text.substring(end, text.length);
                                    setMessageTemplate(before + variable + after);
                                    setTimeout(() => {
                                        textarea.focus();
                                        textarea.setSelectionRange(start + variable.length, start + variable.length);
                                    }, 0);
                                }}
                            >
                                {variable}
                            </span>
                        ))}
                        <button
                            style={{ marginLeft: 'auto', padding: '5px 16px', borderRadius: '6px', border: 'none', background: '#22c55e', color: 'white', fontWeight: '600', cursor: 'pointer', fontSize: '13px', transition: 'opacity 0.2s' }}
                            onClick={() => {
                                localStorage.setItem('msgTemplate', messageTemplate);
                                setSaveStatus('✓ Guardado');
                                setTimeout(() => setSaveStatus(''), 2000);
                            }}
                        >
                            💾 Guardar mensaje
                        </button>
                        {saveStatus && <span style={{ color: '#16a34a', fontWeight: '600', fontSize: '13px' }}>{saveStatus}</span>}
                    </div>
                </div>
                {
                    fuente == "db" ? <>
                        <div style={{ width: '93vw', display: 'flex', flexDirection: 'column', gap: '10px', paddingLeft: '30px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <label style={{ fontWeight: 'bold' }}>Host</label>
                                <input value={dbHost} onChange={(e) => setDbHost(e.target.value)} placeholder="localhost" style={{ height: '32px', padding: '6px' }} />
                            </div>
                            {dbStep !== 'host' && (
                                <>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <label style={{ fontWeight: 'bold' }}>Usuario</label>
                                        <input value={dbUser} onChange={(e) => setDbUser(e.target.value)} placeholder="root" style={{ height: '32px', padding: '6px' }} />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <label style={{ fontWeight: 'bold' }}>Contraseña</label>
                                        <input type="password" value={dbPassword} onChange={(e) => setDbPassword(e.target.value)} placeholder="********" style={{ height: '32px', padding: '6px' }} />
                                    </div>
                                </>
                            )}
                            {dbStep === 'host' ? (
                                <button style={{ alignSelf: 'flex-start', width: '200px', padding: '8px 12px', cursor: 'pointer' }} onClick={handleHostContinue}>Siguiente</button>
                            ) : dbStep === 'credentials' ? (
                                <button style={{ alignSelf: 'flex-start', width: '200px', padding: '8px 12px', cursor: 'pointer' }} onClick={testDbConnection}>Conectar</button>
                            ) : null}
                            {dbStep === 'dbselect' && (
                                <>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <label style={{ fontWeight: 'bold' }}>Base de datos</label>
                                        <select value={dbName} onChange={(e) => setDbName(e.target.value)} style={{ height: '32px', padding: '6px' }}>
                                            <option value="sp_up_sys">sp_up_sys</option>
                                            <option value="clientes_db">clientes_db</option>
                                            <option value="ventas_db">ventas_db</option>
                                        </select>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <label style={{ fontWeight: 'bold' }}>Tabla</label>
                                        <select value={dbTable} onChange={(e) => setDbTable(e.target.value)} style={{ height: '32px', padding: '6px' }}>
                                            <option value="clientes">clientes</option>
                                            <option value="ventas">ventas</option>
                                            <option value="ventas_articulos">ventas_articulos</option>
                                        </select>
                                    </div>
                                    <button style={{ alignSelf: 'flex-start', width: '200px', padding: '8px 12px', cursor: 'pointer' }} onClick={loadDbClients}>Sincronizar</button>
                                </>
                            )}
                        </div>
                        <div style={{ width: '93vw', display: 'flex', gap: '10px', alignItems: 'center', paddingLeft: '30px', marginTop: '10px' }}>
                            <span style={{ color: dbConnected ? '#15803d' : '#b91c1c', fontWeight: '600' }}>{dbStatus}</span>
                        </div>
                        <h2 style={{ width: '100vw', paddingLeft: '80px' }}>NO enviar a:</h2>
                        <div style={{ width: '90vw', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '3px', alignSelf: 'flex-start', paddingLeft: '30px' }}>
                            {
                                excepCustomers.map((c, index) => <span key={index} style={{ backgroundColor: '#c9c9c9ff', borderRadius: '5px', padding: '5px 10px', cursor: 'pointer' }}
                                    onClick={() => {
                                        setExcepCustomers(excepCustomers.filter(ec => ec.Codigo !== c.Codigo))
                                    }}
                                >{c.Nombre_Representante}</span>)
                            }
                        </div>
                        {excepCustomers.length == 0 ? <p style={{ width: '100vw', paddingLeft: '80px', userSelect: 'none' }}>No hay clientes agregados</p> : <></>}
                        <p style={{ width: '100vw', paddingLeft: '80px' }}>{updateResult}</p>
                        <button style={{ alignSelf: 'flex-start', marginLeft: '30px', padding: '8px 30px', cursor: 'pointer' }}
                            onClick={() => { updateExc() }}
                        >Actualizar</button>
                        <h3 style={{ width: '100vw', paddingLeft: '80px' }}>Agregar a la lista:</h3>
                        <input value={inputNameValue} style={{ width: '90vw', height: '30px', alignSelf: 'flex-start', marginLeft: '30px', paddingLeft: '10px' }} placeholder="Nombre"
                            onChange={(e) => { setInputNameValue(e.target.value) }}
                        ></input>
                        <div style={{ width: '90vw', maxHeight: '200px', overflowY: 'scroll', display: 'flex', flexDirection: 'column', alignSelf: 'flex-start', paddingLeft: '30px', overflowX: 'hidden' }}>
                            {
                                filterCustomerName.map((c, index) => <span style={{ width: '100%', backgroundColor: customerSelected == index ? '#e6e6e6ff' : 'white', cursor: 'pointer', padding: '5px 5px', userSelect: 'none' }} key={index}
                                    onClick={() => {
                                        if (customerSelected != index) {
                                            setCustomerSelected(index)
                                        }
                                        else {
                                            const existExcept = excepCustomers.filter(ec => ec.Codigo == c.Codigo) || [];
                                            if (existExcept.length == 0) setExcepCustomers([...excepCustomers, c]);
                                        }

                                    }}
                                >{c.Nombre_Representante}</span>)
                            }
                        </div>

                        {
                            sendMsgResults.fallidos.length > 0 ?
                                <><table style={{ width: '100%', margin: '0 85px', minHeight: '100px' }}>
                                    <thead style={{ backgroundColor: '#ededed' }}>
                                        <th>Nombre</th>
                                        <th>Numero Corregido</th>
                                        <th>Balance pendiente</th>
                                        <th>Razón</th>
                                    </thead>
                                    <tbody>
                                        {
                                            sendMsgResults.fallidos.map((f, index) => <tr key={index}
                                                style={{ cursor: "pointer", userSelect: 'none' }}
                                            >
                                                <td>{f.name}</td>
                                                <td>{f.number}</td>
                                                <td>{f.remainingDebt}</td>
                                                <td style={{ color: 'red' }}>{f.reason}</td>
                                            </tr>)
                                        }
                                    </tbody>
                                </table>
                                    <span style={{ width: '100vw', height: '100px', display: 'flex', flexDirection: 'row', alignItems: "center", justifyContent: "flex-start", paddingLeft: '85px', gap: '50px', marginBottom: '20px' }}>
                                        <button style={{ width: '150px', height: '35px', cursor: 'pointer' }}
                                            onClick={() => {
                                                const names = sendMsgResults.fallidos.map(c => c.name);
                                                navigator.clipboard.writeText(names);
                                                setCopyName("Copiado")
                                                setTimeout(() => {
                                                    setCopyName("Copiar Nombre")
                                                }, 2000);
                                            }}
                                        >{copyName}</button>
                                        <button style={{ width: '150px', height: '35px', cursor: 'pointer' }}
                                            onClick={() => {
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
                                </> : <></>
                        }
                        <button style={{ alignSelf: 'flex-start', marginLeft: '30px', padding: '8px 30px', cursor: 'pointer' }}
                            onClick={() => { sendMsg() }}
                        >Enviar Mensajes</button>
                        <p>{msgState}</p>

                        <h3 style={{ width: '100vw', paddingLeft: '80px' }}>Clientes que deben pagar:</h3>
                        {
                            debtors.length > 0 ? <>
                                <div style={{ width: '90vw', maxHeight: '200px', overflowY: 'scroll', display: 'flex', flexDirection: 'column', alignSelf: 'flex-start', paddingLeft: '30px', overflowX: 'hidden' }}>
                                    {
                                        debtors.map((debtor, index) => <span style={{ width: '100%', backgroundColor: customerSelected == index ? '#e6e6e6ff' : 'white', cursor: 'pointer', padding: '5px 5px', userSelect: 'none', color: 'black' }} key={index}
                                            onClick={() => {
                                                setCustomerSelected(index)
                                                console.log(debtor)
                                            }}
                                        >{debtor.Nombre_Cliente}</span>)
                                    }

                                </div>
                            </> : <span style={{ textAlign: 'left', width: '100%', paddingLeft: '80px' }}>Nada por aqui c:</span>
                        }

                        <button style={{ alignSelf: 'flex-start', marginLeft: '30px', padding: '8px 30px', cursor: 'pointer' }}
                            onClick={() => {
                                window.api.getDebtors().then(debtors => {
                                    setDebtors(debtors.filter(d => d != undefined));

                                })
                            }}
                        >Ver Clientes</button>
                    </> : <>
                        <h4 style={{ width: '100vw', paddingLeft: '80px' }}>Archivo:</h4>
                        <input type='file' style={{ width: '93vw', height: '35px' }} accept=".xlsx" onChange={(e) => {
                            const f = e.target.files && e.target.files[0];
                            setFile(f);
                            setFileUrl(f ? f.name : '');
                            setExcelRows([]);
                        }} ></input>
                        <p>{buttonResult}</p>
                        <div style={{ display: 'flex', gap: '10px', paddingLeft: '30px', flexWrap: 'wrap' }}>
                            <button style={{ alignSelf: 'flex-start', padding: '8px 30px', cursor: 'pointer' }}
                                onClick={() => {
                                    if (fileUrl == "") setButtonResult("Debe elegir un archivo")
                                    else {
                                        sendMsgFromExcel();
                                    }
                                }}
                            >
                                enviar mensaje
                            </button>
                            <button style={{ alignSelf: 'flex-start', padding: '8px 30px', cursor: 'pointer' }}
                                onClick={() => { viewExcelClients(); }}
                            >Ver Clientes</button>
                        </div>
                        {excelRows.length > 0 && (
                            <div style={{ width: '90vw', maxHeight: '250px', overflowY: 'auto', display: 'flex', flexDirection: 'column', alignSelf: 'flex-start', paddingLeft: '30px', overflowX: 'hidden', gap: '4px' }}>
                                {excelRows.map((row, index) => (
                                    <span key={index} style={{ width: '100%', backgroundColor: index % 2 ? '#f6f6f6' : '#fff', padding: '6px 8px', borderRadius: '4px', wordBreak: 'break-word' }}>
                                        {row.name || row.Nombre_Cliente || row.nombre_cliente || row.Nombre_Representante || JSON.stringify(row)} - {row.remainingDebt ?? ''}
                                    </span>
                                ))}
                            </div>
                        )}
                    </>
                }

                {(sendMsgResults && ((sendMsgResults.enviados && sendMsgResults.enviados.length > 0) || (sendMsgResults.fallidos && sendMsgResults.fallidos.length > 0) || sendMsgResults.error)) && (
                    <section style={{ width: '100vw', padding: '20px 80px', boxSizing: 'border-box', backgroundColor: '#f7f7f7', marginTop: '10px' }}>
                        <h3>Resultado del envío</h3>
                        {sendMsgResults.error && <p style={{ color: 'red' }}>Error: {String(sendMsgResults.error)}</p>}
                        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                            <div style={{ flex: 1, minWidth: '300px' }}>
                                <h4>Enviados ({sendMsgResults.enviados ? sendMsgResults.enviados.length : 0})</h4>
                                <div style={{ maxHeight: '200px', overflowY: 'auto', background: 'white', padding: '8px', borderRadius: 4 }}>
                                    {sendMsgResults.enviados && sendMsgResults.enviados.length > 0 ? (
                                        <table style={{ width: '100%' }}>
                                            <thead style={{ backgroundColor: '#eee' }}><tr><th>Nombre</th><th>Numero</th><th>Saldo</th></tr></thead>
                                            <tbody>
                                                {sendMsgResults.enviados.map((s, i) => (
                                                    <tr key={i}><td>{s.name}</td><td>{s.number}</td><td>{s.remainingDebt}</td></tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : <p>No hay enviados</p>}
                                </div>
                                <div style={{ marginTop: 8 }}>
                                    <button style={{ padding: '6px 12px', cursor: 'pointer' }} onClick={() => {
                                        const txt = (sendMsgResults.enviados || []).map(s => `${s.name} ${s.number} ${s.remainingDebt || ''}`).join('\n');
                                        navigator.clipboard.writeText(txt);
                                    }}>Copiar Enviados</button>
                                </div>
                            </div>

                            <div style={{ flex: 1, minWidth: '300px' }}>
                                <h4>Fallidos ({sendMsgResults.fallidos ? sendMsgResults.fallidos.length : 0})</h4>
                                <div style={{ maxHeight: '200px', overflowY: 'auto', background: 'white', padding: '8px', borderRadius: 4 }}>
                                    {sendMsgResults.fallidos && sendMsgResults.fallidos.length > 0 ? (
                                        <table style={{ width: '100%' }}>
                                            <thead style={{ backgroundColor: '#eee' }}><tr><th>Nombre</th><th>Numero</th><th>Saldo</th><th>Razón</th></tr></thead>
                                            <tbody>
                                                {sendMsgResults.fallidos.map((f, i) => (
                                                    <tr key={i}><td>{f.name}</td><td>{f.number}</td><td>{f.remainingDebt}</td><td style={{ color: 'red' }}>{f.reason}</td></tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : <p>No hay fallidos</p>}
                                </div>
                                <div style={{ marginTop: 8 }}>
                                    <button style={{ padding: '6px 12px', cursor: 'pointer' }} onClick={() => {
                                        const txt = (sendMsgResults.fallidos || []).map(s => `${s.name} ${s.number} ${s.remainingDebt || ''} - ${s.reason || ''}`).join('\n');
                                        navigator.clipboard.writeText(txt);
                                    }}>Copiar Fallidos</button>
                                </div>
                            </div>
                        </div>
                    </section>
                )}
                {isWsLoading && (
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
                            padding: 24,
                            borderRadius: 8,
                            boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
                            display: 'flex',
                            gap: 12,
                            alignItems: 'center'
                        }}>
                            <div style={{ width: 32, height: 32, border: '4px solid #ddd', borderTop: '4px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                            <div style={{ fontSize: 16, fontWeight: 600 }}>{wsLoadingMsg}</div>
                        </div>
                        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    </div>
                )}
            </section>
        </>
    )
}