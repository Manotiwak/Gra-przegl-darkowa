import React, { useState, useEffect } from 'react'
import LeweMenu from '../Nawigacja/LeweMenu/LeweMenu'
import GorneMenu from '../Nawigacja/GorneMenu/GorneMenu'
import Stopka from '../Nawigacja/Stopka/Stopka'
import { Autoryzacja } from '../Autoryzacja/Autoryzacja'
import axios from 'axios';
import "./Drzewo.css"
import Ladowanie from '../Ladowanie/Ladowanie'
import { PoziomPostaci } from '../Poziom/Poziom'
import startDrzewa from './Zdjecia/startDrzewa.png'
import silaIMG from './Zdjecia/sila.jpg'
import zdrowieIMG from './Zdjecia/zdrowie.jpg'
import zwinnoscIMG from './Zdjecia/zwinnosc.jpg'
import zrecznoscIMG from './Zdjecia/zrecznosc.jpg'
import inteligencjaIMG from './Zdjecia/inteligencja.jpg'
import pancerzIMG from './Zdjecia/pancerz.jpg'




export default function Drzewo() {


  const { autoryzacja, nazwa, handleLogout } = Autoryzacja();

  const [reload, setReload] = useState(false); // stan odpowiadajacy za zaladowanie strony po wczesniejszym zaladowaniu danych

  const [daneDrzewo, setDaneDrzewo] = useState([]); // stan przechowywujacy strukture drzewa umiejetnosci

  const [rozdanePunkty, setRozdanePunkty] = useState([]); // stan przechowywujacy rozdane umiejetnosci gracza

  const { poziomPostaci } = PoziomPostaci(nazwa); // stan przechowywujacy poziom postaci

  const [kliknietePunkty, setKliknietePunkty] = useState([]); // stan przechowywujacy bieżące rozdane punkty umiejetnosci

  const [danePunktu, setDanePunktu] = useState([]); // stan przechowywujacy aktualnie wyswitlana informacje na temat punktu

  const [ktoryPodswietl, setKtoryPodswietl] = useState(); // stan przechowywujacy aktualnie wyswitlana informacje na temat punktu

  const [wyswietlAlert, setWyswietlAlert] = useState(false); // stan przechowywujacy aktualnie wyswitlana informacje na temat punktu

  const [przyciskZapisz, setPrzyciskZapisz] = useState(0);


  useEffect(() => {
    // zapytanie do serwera pobierające strukture drzewa
    if (nazwa) {
      const nazwaUzytkownika = nazwa;
      axios.get(`http://localhost:8081/drzewo/${nazwaUzytkownika}`)
        .then(response => {
          setDaneDrzewo(prev => ({ ...prev, ...response.data.Drzewo }));
          console.log(response.data.Drzewo)
          setRozdanePunkty(response.data.RozdanePunkty.punkt.map(punkt => punkt.Drzewo_id))
          console.log(response.data.RozdanePunkty)
          setKliknietePunkty([...kliknietePunkty, ...response.data.RozdanePunkty.punkt.map(punkt => punkt.Drzewo_id)]);
          setReload(true);
        })
        .catch(error => {
          console.error('Błąd pobierania danych drzewa:', error);
        });
    }
  }, [nazwa]);

  useEffect(() => {
    // ustawienie poczatkowych wyswietlanych wartosci punktu
    setDanePunktu({
      id: "brak",
      nazwa: "",
      nazwa_u: "",
      opis: "",
    });
  }, [reload]);


  let liczbaPunktow = poziomPostaci - 1 // liczba punktów którą uzytkownik moze rozdać

  const liczbaDoKlikniecia = liczbaPunktow - kliknietePunkty.length; // liczba punktow którą użytkownij jeszcze może rozdać


  const handlePunktClick = (punktId, czyKliknietyPoprzedni) => {
    // funckja obsługująca wybór umiejętności

    let minId = punktId * 10 // minimalny punkt kolejnego poziomu który może zostać kliknięty
    let maxId = punktId * 10 + 9 // maksymalny punkt kolejnego poziomu który może zostać kliknięty

    if (!czyKliknietyPoprzedni) {
      // ograniczenie do możliwości rozdania punktu piętro po piętrze
      return;
    }

    if (kliknietePunkty.includes(punktId)) {
      // Możliwość odkliknięca rozdanej umiejetności
      if (!(kliknietePunkty.some(id => id >= minId && id <= maxId))) { // Zablokowanie mozliwosci odklikiwania elementow ktore posiadaja element pod soba
        const punktZapisany = rozdanePunkty.some(punkt => punkt === punktId);
        if (!punktZapisany) {
          setKliknietePunkty(kliknietePunkty.filter(id => id !== punktId));
          setPrzyciskZapisz(przyciskZapisz - 1)
          console.log(przyciskZapisz)
        }
      }

    } else {
      // Rozdanie umiejętności
      if (kliknietePunkty.length < liczbaPunktow) {
        setKliknietePunkty([...kliknietePunkty, punktId]);
        setPrzyciskZapisz(przyciskZapisz + 1)
        console.log(przyciskZapisz)
      }
    }
  };

  // funkcja odpowiadająca za piszypisanie informacji o punkcie do wyswietlenia
  const handleMouseEnter = (punkt) => {
    setDanePunktu({
      nazwa: punkt.nazwa,
      nazwa_u: punkt.nazwa_u,
      opis: punkt.opis,
    });
    setKtoryPodswietl(punkt.id);
  };

  // funkcja odpowiadająca za wyczyszczenie opisu
  const handleMouseLeave = () => {
    setDanePunktu({
      id: "brak",
      nazwa: "",
      nazwa_u: "",
      opis: "",
    });
    setKtoryPodswietl(0);
  };

  const zapiszDoBazy = () => {
    const nazwaUzytkownika = nazwa;
    const noweKliknietePunkty = kliknietePunkty.filter((punktId) => !rozdanePunkty.includes(punktId));
    axios.post(`http://localhost:8081/drzewoGracza/${nazwaUzytkownika}`,
      { noweDane: noweKliknietePunkty })
      .then(response => {
        //console.log('Zaktualizowano drzewo gracza:', response.data);
        if (response.data) {
          window.location.reload();
        }
      })
      .catch(error => {
        console.error('Błąd zapisania nowych danych drzewa gracza:', error);
      });
  }


  //zbudowanie strony po załadowaniu danych
  if (reload) {
    return (
      <div className='Drzewo'>
        <GorneMenu handleLogout={handleLogout} nazwa={nazwa} />
        <div id="kontener">
          <LeweMenu />
          <div id="prawyEkran">
            <div id="zawartoscEkranu">
              <div id="powrot" onClick={() => { window.location.pathname = "/postac" }}> &larr;</div>

              <div id="boxObramowanie">
                <div id="boxGlowny">
                  <div id="boxObramowanie"></div>
                  <div id="boxPunkty">
                    <div id="punktyLiczba">
                      <div id="ldK">{liczbaDoKlikniecia}</div>
                      <div id="lP">{liczbaPunktow}</div>
                    </div>

                  </div>

                  <div id={`${danePunktu.id !== "brak" ? 'daneOpis' : ''}`}>{danePunktu.nazwa} {danePunktu.nazwa_u} {danePunktu.opis}</div>

                  {wyswietlAlert && (
                    <div className="overlay">
                      <div className="modal">
                        <p>Czy na pewno chcesz rozdac punkty umiejetnosc?</p>
                        <button id="tak" onClick={() => zapiszDoBazy()}>Tak</button>
                        <button id="nie" onClick={() => setWyswietlAlert(false)}>Nie</button>
                      </div>
                    </div>
                  )}


                  <div id="boxDrzewo">
                    <div id="boxGalezie" className="pietra-container">
                      <div className="pietro-1 pietro">
                        <div className='startDrzewa'>
                          <img src={startDrzewa} />
                        </div>
                      </div>
                      {daneDrzewo.drzewoPunkt.map((pietro) => (
                        <div key={pietro.dlugoscId} className={`pietro-${pietro.dlugoscId} pietro`}>
                          {pietro.punkty.map((punkt) => {
                            let imgSrc = null;
                            const nazwaLowercase = punkt.nazwa.toLowerCase();
                            if (nazwaLowercase.includes("siła")) {
                              imgSrc = silaIMG;
                            } else if (nazwaLowercase.includes("zdrowie")) {
                              imgSrc = zdrowieIMG;
                            } else if (nazwaLowercase.includes("zwinność")) {
                              imgSrc = zwinnoscIMG;
                            } else if (nazwaLowercase.includes("zręczność")) {
                              imgSrc = zrecznoscIMG;
                            } else if (nazwaLowercase.includes("inteligencja")) {
                              imgSrc = inteligencjaIMG;
                            } else if (nazwaLowercase.includes("pancerz")) {
                              imgSrc = pancerzIMG;
                            }

                            let czyKliknietyPoprzedni = kliknietePunkty.includes(parseInt(punkt.id / 10, 10));


                            let czyKlikniety = kliknietePunkty.includes(punkt.id);

                            let podswietlPkt = false;
                            if (ktoryPodswietl * 10 <= punkt.id && punkt.id <= ((ktoryPodswietl * 10) + 9)) {
                              podswietlPkt = true;
                              czyKliknietyPoprzedni = false;
                            }

                            return (
                              <div key={punkt.id}
                                className={`punktDrzewa ${czyKlikniety ? 'klikniety' : ''} ${czyKliknietyPoprzedni && !czyKlikniety || (parseInt(punkt.id / 10, 10) === 1 && !czyKlikniety) ? 'kliknietyPoprzedni' : ''} ${liczbaDoKlikniecia !== 0 ? 'animacja' : ''} ${podswietlPkt ? 'podswietlPkt' : ''}`}
                                onMouseEnter={() => handleMouseEnter(punkt)}
                                onMouseLeave={handleMouseLeave}
                                onClick={() => handlePunktClick(punkt.id, (czyKliknietyPoprzedni || punkt.id === 11 || punkt.id === 12))}>
                                <img src={imgSrc} alt={`Obrazek ${punkt.nazwa}`} />
                              </div>
                            );
                          })}
                        </div>
                      ))}
                      
                    </div>
                    {przyciskZapisz ? <div id="przyciskZapisz" onClick={() => setWyswietlAlert(true)}>Zapisz</div> : <div id="przyciskZapiszSchowany"></div>}
                  </div>
                  
                </div>
              </div>
            </div >
          </div >
        </div >
        <Stopka />
      </div >
    )
  }
  return (
    <div>
      <Ladowanie />
    </div>
  )
}