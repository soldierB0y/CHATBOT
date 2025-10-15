import { BrowserRouter, Route, Routes,HashRouter } from 'react-router-dom';
import { QRPage } from './components/QRPage.jsx';
import { Home } from './components/home.jsx';
import { useEffect, useState } from 'react';
function App() {

  const [isDev,setIsDev]= useState(false);
  useEffect(()=>{
    (
      async()=>{
        window.api.isDev(isDev=>{setIsDev(isDev)});
        window.api.onAuthError((e,error)=>{console.log(error)});
        window.api.onDisconnected((e,error)=>{console.log(error)});
        window.api.onChangeState((e,error)=>{console.log(error)})
        window.api.onInitError((e,error)=>{console.log(error)});
      }
    )()
  },[])

  useEffect(()=>{console.log(isDev)},[isDev])
  return (

    isDev==true?
    <BrowserRouter basename="/">
      <Routes>
        <Route path="/" element={<QRPage/>} />
        <Route path='/home' element={<Home></Home>}/>
      </Routes>
    </BrowserRouter>
    :<HashRouter>
      <Routes>
        <Route path="/" element={<QRPage/>} />
        <Route path='/home' element={<Home></Home>}/>
      </Routes>
    </HashRouter>
    
  );
}

export default App;
