import React, { useState, useEffect } from 'react'
import LeweMenu from '../Nawigacja/LeweMenu/LeweMenu'
import GorneMenu from '../Nawigacja/GorneMenu/GorneMenu'
import Stopka from '../Nawigacja/Stopka/Stopka'
import { Autoryzacja } from '../Autoryzacja/Autoryzacja'
import axios from 'axios';
import "./Magazyn.css"
import strzalka from './strzalka.png'
import Ladowanie from '../Ladowanie/Ladowanie'
import przedmioty from '../Przedmioty/Przedmioty'
import { PoziomPostaci } from '../Poziom/Poziom'



export default function Magazyn() {


  const { autoryzacja, nazwa, handleLogout } = Autoryzacja();

  const [daneMagazyn, setDaneMagazyn] = useState([]);

  const [reload, setReload] = useState(false);

  const { poziomPostaci } = PoziomPostaci(nazwa);



  useEffect(() => {
    if (nazwa) {
      const nazwaUzytkownika = nazwa;
      axios.get(`http://localhost:8081/magazyn/${nazwaUzytkownika}`)
        .then(response => {
          setDaneMagazyn(prev => ({ ...prev, ...response.data.Magazyn }));
          console.log(response.data.Magazyn)
      
          setReload(true);
        })
        .catch(error => {
          console.error('Błąd pobierania danych magazynu:', error);
        });
    }
  }, [nazwa]);

  useEffect(() => {
    if (nazwa) {
      const nazwaUzytkownika = nazwa;
      axios.get(`http://localhost:8081/magazyn/${nazwaUzytkownika}`)
        .then(response => {
          setDaneMagazyn(prev => ({ ...prev, ...response.data.Magazyn }));
          console.log(response.data.Magazyn)
      
          setReload(true);
        })
        .catch(error => {
          console.error('Błąd pobierania danych magazynu:', error);
        });
    }
  }, [nazwa]);
  

  const sprawdzTyp = (przedmiot) => {
    if (przedmiot.typ === "Hełm" || przedmiot.typ === "Naszyjnik" || przedmiot.typ === "Odzież" || przedmiot.typ === "Pas" || przedmiot.typ === "Spodnie" || przedmiot.typ === "Rękawice" || przedmiot.typ === "Buty" || przedmiot.typ === "Broń" || przedmiot.typ === "Zwierze" || przedmiot.typ === "Narzędzie") {
      return true
    }
    return false
  }

  const sprzawdzZaloz = (przedmiot) => {
    if (przedmiot.zalozone === 0) {
      return false
    }
    return true
  }

  const handleZmienStatus = (index) => {
    const noweDaneMagazyn = { ...daneMagazyn };
    const przedmiot = noweDaneMagazyn.przedmioty[index];
  
    const innyZalozone1 = noweDaneMagazyn.przedmioty.find((item) => item.typ === przedmiot.typ && item.zalozone === 1);
  
    const czyAktualnyZalozone1 = przedmiot.zalozone === 1;

    if (poziomPostaci >= przedmiot.poziom) {
    if (innyZalozone1 && !czyAktualnyZalozone1) {
      innyZalozone1.zalozone = 0;
    }
    

    przedmiot.zalozone = przedmiot.zalozone === 0 ? 1 : 0;
    const magazynID = przedmiot.mID;

    const idMagazynu2 = innyZalozone1 ? innyZalozone1.mID : 0;
  
    if (nazwa && reload) {
      axios
        .put(`http://localhost:8081/ustawStatusPrzedmiotu`, {
          idMagazynu: magazynID,
          nowyStatus: przedmiot.zalozone,
          idMagazynu2: idMagazynu2,
          nowyStatus2: 0,
        })
        .then((response) => {
          console.log('Zaktualizowano status przedmiotu:', response.data);
        })
        .catch((error) => {
          console.error('Błąd przy zmianie statusu przedmiotu:', error);
        });
    }
  
    setDaneMagazyn(noweDaneMagazyn);
  }
  else{
    console.log("Zbyt wysoki poziom przedmiotu");
  }
  };


  if (reload) {
    return (
      <div className='Magazyn'>
        <GorneMenu handleLogout={handleLogout} nazwa={nazwa} />
        <div id="kontener">
          <LeweMenu />
          <div id="prawyEkran">
            <div id="zawartoscEkranu">
              <div id="boxDolny">
              <div id="powrot" onClick={() => { window.location.pathname = "/postac" }}> &larr;</div>
                <div id="boxMagazyn">
                  {[...Array(50)].map((_, index) => {
                    if (index < daneMagazyn.przedmioty.length) {
                      const przedmiot = daneMagazyn.przedmioty[index];
                      const cenaSprzedazy = Math.floor(przedmiot.cena / 2);
                      const rzadkosc = `${przedmiot.rzadkosc.toLowerCase()}`;
                      return (
                        <div id="przedmiot-container" key={index}>
                          <div id="ikona">
                            {(sprawdzTyp(przedmiot) && !sprzawdzZaloz(przedmiot)) && <div className="zaznaczEkwipunek" onClick={() => handleZmienStatus(index)}></div>}
                            {(sprawdzTyp(przedmiot) && sprzawdzZaloz(przedmiot)) && <div className="odznaczEkwipunek" onClick={() => handleZmienStatus(index)}><div id="napisX">X</div></div>}
                            <img
                              src={przedmioty.find((item) => item.nazwa === przedmiot.ikona).url}
                              alt={`przedmiot`}
                            />
                          </div>
                          <div id="opis" className={rzadkosc}>
                            <h2>{przedmiot.nazwa}</h2>
                            {przedmiot.zestaw!=="brak" ? <div>Zestaw: {przedmiot.zestaw}</div> : <div></div>}
                            <div id={rzadkosc}>{przedmiot.rzadkosc}</div>
                            <hr></hr>
                            <div>Poziom ulepszenia: {przedmiot.poziom_ulepszenia}</div>
                            <hr></hr>
                            {przedmiot.obrazeniaMin ? <div>{przedmiot.obrazeniaMin}-{przedmiot.obrazeniaMax} Obrażenia</div>: <div></div>}
                            <div id="boxStatystyki">
                            {przedmiot.statystyki.sila ? <div id="itemStatystyka">+{przedmiot.statystyki.sila} Sila</div> : <div></div>}
                            {przedmiot.statystyki.zdrowie ? <div id="itemStatystyka">+{przedmiot.statystyki.zdrowie} Zdrowie</div> : <div></div>}
                            {przedmiot.statystyki.zwinnosc ? <div id="itemStatystyka">+{przedmiot.statystyki.zwinnosc} Zwinnosc</div> : <div></div>}
                            {przedmiot.statystyki.zrecznosc ? <div id="itemStatystyka">+{przedmiot.statystyki.zrecznosc} Zręczność</div> : <div></div>}
                            {przedmiot.statystyki.inteligencja ? <div id="itemStatystyka">+{przedmiot.statystyki.inteligencja} Inteligencja</div> : <div></div>}
                            {przedmiot.statystyki.pancerz ? <div id="itemStatystyka">+{przedmiot.statystyki.pancerz} Pancerz</div> : <div></div>}
                            </div>
                            <hr></hr>
                            <div>Kupno: {przedmiot.cena}$ Sprzedaż: {cenaSprzedazy}$</div>
                            <hr></hr>
                            {przedmiot.poziom ? <div>Wymagany poziom: {przedmiot.poziom}</div> : <div></div>}
                            <div>{przedmiot.typ}</div>
                          </div>
                          {przedmiot.ilosc !== 1 && <p className="ilosc">{przedmiot.ilosc}</p>}
                        </div>
                      );
                    } else {
                      return (
                        <div id="przedmiot-container" key={index}>
                          <div id="ikona">
                            <img
                              src={przedmioty[0].url}
                              alt={`przedmiot`}
                            />
                          </div>
                        </div>
                      );
                    }
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
        <Stopka />
      </div>
    )
  }
  return (
    <div>
      <Ladowanie />
    </div>
  )
}

