import React, { useState, useEffect } from 'react'
import "./GorneMenu.css"
import { Miedziaki } from '../Miedziaki/Miedziaki'
import miedziakIMG  from './miedziak.png';
import { IoIosLogOut } from "react-icons/io";

function GorneMenu({ handleLogout, nazwa, nowyStanMiedziaki }) {
  let { miedziaki } = Miedziaki(nazwa);
  const [wartoscMiedziakow,setWartoscMiedziakow] = useState(miedziaki)

  useEffect(() => { // aktualizacja miedziakow
    if(nowyStanMiedziaki){
    setWartoscMiedziakow(nowyStanMiedziaki)
    //console.log("Gorne panel")
    //console.log(nowyStanMiedziaki)
    }
  }, [nowyStanMiedziaki]);

  return (
    <div className='TopBar'>
      <div id="MoneyView">
        {wartoscMiedziakow||miedziaki}<img src={miedziakIMG} alt='waluta'></img>
      </div>
      <div id="GameTitle" onClick={()=> { window.location.pathname = "/front" }}>
        Wojownicy światła: Walka z ciemnością
      </div>
      <div id="ActionButons">
        <div className='wyloguj'  onClick={handleLogout}><IoIosLogOut/></div>
      </div>
    </div>

  )
}

export default GorneMenu

