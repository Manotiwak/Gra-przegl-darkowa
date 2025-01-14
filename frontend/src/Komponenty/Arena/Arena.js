import React, { useState, useEffect } from 'react'
import LeweMenu from '../Nawigacja/LeweMenu/LeweMenu'
import GorneMenu from '../Nawigacja/GorneMenu/GorneMenu'
import Stopka from '../Nawigacja/Stopka/Stopka'
import axios from 'axios';
import { Autoryzacja } from '../Autoryzacja/Autoryzacja'
import "./Arena.css"
import zdjecia from '../Wyglad/Zdjecia'
import Ladowanie from '../Ladowanie/Ladowanie'


export default function Arena() {

  const { autoryzacja, nazwa, handleLogout } = Autoryzacja();

  const [reload, setReload] = useState(false);

  const [alertOpis, setAlertOpis] = useState({
    stan: false,
    minut: 0,
    sekund: 0,
    animacja: false
  });

  const [przebiegWalki, setPrzebiegWalki] = useState();

  const [turaGracza, setTuraGracza] = useState('atak'); // Początkowo gracz A jest aktywny

  const [aktualnyAtak, setAktualnyAtak] = useState(0);

  const [wyswietlKoniec, setWyswietlKoniec] = useState(false);

  const [poczekalnia, setPoczeklania] = useState(true);

  const [maxZdrowieA, setMaxZdrowieA] = useState();
  const [maxZdrowieB, setMaxZdrowieB] = useState();
  const [progresZdrowieA, setProgresZdrowieA] = useState();
  const [progresZdrowieB, setProgresZdrowieB] = useState();

  const [pom, setPom] = useState();



  const [arenaData, setArenaData] = useState({
    daneGraczy: {},
  });

  const [czasOstatniegoPojedynku, setCzasOstatniegoPojedynku] = useState();

  useEffect(() => {
    if (nazwa) {
      const nazwaUzytkownika = nazwa;
      axios.get(`http://localhost:8081/losowanieGraczy/${nazwaUzytkownika}`)
        .then(response => {

          console.log(response.data.OstatniPojedynek)
          setCzasOstatniegoPojedynku(response.data.OstatniPojedynek);

          const zmArenaData = { ...arenaData };
          zmArenaData.daneGraczy = { ...arenaData.daneGraczy };

          const maxPrzeciwnikow = Math.min(3, response.data.WylosowaniPrzeciwnicyZPunktami.length);

          response.data.WylosowaniPrzeciwnicyZPunktami.slice(0, maxPrzeciwnikow).forEach((przeciwnik, index) => {
            const zdjecieURL = zdjecia.find((item) => item.id === parseInt(przeciwnik.wyglad)).url;

            zmArenaData.daneGraczy[`Gracz${index + 1}`] = {
              ...przeciwnik,
              zdjecieURL,
              sumaPunktow: {
                sila: przeciwnik.sumaPunktow.OgolnaSumaPKT.sila,
                zdrowie: przeciwnik.sumaPunktow.OgolnaSumaPKT.zdrowie,
                zwinnosc: przeciwnik.sumaPunktow.OgolnaSumaPKT.zwinnosc,
                zrecznosc: przeciwnik.sumaPunktow.OgolnaSumaPKT.zrecznosc,
                inteligencja: przeciwnik.sumaPunktow.OgolnaSumaPKT.inteligencja,
                pancerz: przeciwnik.sumaPunktow.OgolnaSumaPKT.pancerz,
                obrazeniaMin: przeciwnik.sumaPunktow.OgolnaSumaPKT.obrazeniaMin,
                obrazeniaMax: przeciwnik.sumaPunktow.OgolnaSumaPKT.obrazeniaMax
              }
            };
          });

          setArenaData(zmArenaData);
          setReload(true);
        })
        .catch(error => {
          console.error('Błąd tworzenia zestawienia:', error);
        });
    }
  }, [nazwa]);


  function wyborGracza(gracz) {

    if (pozostalyCzasPrzedPojedynkiem()) {
      const graczData = {
        gracz: gracz,
      };
      const nazwaUzytkownika = nazwa;
      // Wyślij dane gracza do serwera za pomocą Axios
      axios.post(`http://localhost:8081/pojedynek/${nazwaUzytkownika}`, graczData)
        .then((response) => {
          if(response.data==='Zabezpieczenie'){
            window.location.reload()
          }
          console.log(response.data.PrzebiegWalki)
          setMaxZdrowieA(response.data.PrzebiegWalki.a_zdrowie)
          setMaxZdrowieB(response.data.PrzebiegWalki.p_zdrowie)
          setProgresZdrowieA(response.data.PrzebiegWalki.a_zdrowie)
          setProgresZdrowieB(response.data.PrzebiegWalki.p_zdrowie)
          setPrzebiegWalki(response.data.PrzebiegWalki);
        })
        .catch((error) => {
          console.error('Błąd podczas komunikacji z serwerem:', error);
        });
    }
  }


  function pozostalyCzasPrzedPojedynkiem() {
    if (reload) {
      const czasOstatniego = new Date(czasOstatniegoPojedynku); // Pierwsza data
      //const czasNastepnego = (czasOstatniego * 1) + (1000 * 60 * 10)
      const czasNastepnego = (czasOstatniego * 1) + (1000 * 60 * 10) // na ta chwile 5s
      const czasAktualny = new Date(); // Druga data (teraz)

      console.log("Czas nastepnego pojedynku" + czasNastepnego)
      console.log("Czas aktualny czas" + czasAktualny)

      const czasDoNastepnego = czasNastepnego - czasAktualny;

      const ileSekundDoNastepnego = czasDoNastepnego / 1000; // na sekundy
      const ileS = ileSekundDoNastepnego % 60
      const ileM = ileSekundDoNastepnego / 60



      console.log(ileSekundDoNastepnego)

      if (ileSekundDoNastepnego <= 0) {
        setAlertOpis({
          stan: false,
          minut: 0,
          sekund: 0,
          animacja: false,
        });
        return true
      } else {
        setAlertOpis({
          stan: true,
          minut: ileM,
          sekund: ileS,
          animacja: true,
        });
        return false
        //return `Musisz odczekać jeszcze  ${parseInt(ileM)} minut i ${ileS.toFixed(1)} sekund przed kolejnym pojedynkiem.`;
      }
    }
  }




  useEffect(() => {
    if (alertOpis.animacja) {

      const czasTrwania = 2000;

      const timer = setTimeout(() => {
        setAlertOpis({ ...alertOpis, animacja: false });
      }, czasTrwania);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [alertOpis]);


  useEffect(() => {
    if (przebiegWalki && przebiegWalki.ataki) {
      const interval = setInterval(() => {
        if ((przebiegWalki.ataki[aktualnyAtak + 1] === null)) {
          setPoczeklania(false);
        }

        if (aktualnyAtak === przebiegWalki.ataki.length - 1) {
          setPoczeklania(false);
        }

        if ((aktualnyAtak < przebiegWalki.ataki.length) && !(przebiegWalki.ataki[aktualnyAtak] === null)) {
          if (aktualnyAtak % 2 === 1) {
            setProgresZdrowieA(progresZdrowieA - przebiegWalki.ataki[aktualnyAtak])
          }
          if (aktualnyAtak % 2 === 0) {
            setProgresZdrowieB(progresZdrowieB - przebiegWalki.ataki[aktualnyAtak])
          }
          console.log(progresZdrowieA)
          console.log(progresZdrowieB)
          // Wykonaj kolejny krok i zwiększ indeks
          setPom(aktualnyAtak);
          setAktualnyAtak((prev) => prev + 1);
        } else {
          // Gdy osiągniemy koniec, wyczyść interwał
          setWyswietlKoniec(true);
          setPoczeklania(false);
          clearInterval(interval);
        }
      }, 4000); // Wykonuj co 4 sekundy
      return () => {
        clearInterval(interval); // Czyszczenie interwału przy wyłączeniu komponentu
      };
    }
  }, [przebiegWalki, aktualnyAtak]);

  useEffect(() => {
    if (przebiegWalki && (!wyswietlKoniec)) {
      const interval = setInterval(() => {
        setTuraGracza((prevPlayer) => (prevPlayer === 'atak' ? 'obrona' : 'atak'));
      }, 4000); // Zmienia gracza co 3 sekundy
      return () => {
        clearInterval(interval); // Czyszczenie interwału przy wyłączeniu komponentu
      };
    }
  }, [przebiegWalki, wyswietlKoniec]);


  useEffect(() => {
    if (reload) {
      console.log(arenaData)
      console.log(przebiegWalki)
    }
  }, [reload]
  )

  function pomijanieAnimacji() {
    setWyswietlKoniec(true);
  }



  if (reload) {
    return (
      <div className='Arena'>
        <GorneMenu handleLogout={handleLogout} nazwa={nazwa} />

        <div id="kontener">
          <LeweMenu />
          <div id="prawyEkran">
            <div id="zawartoscEkranu">
              <div id="boxZawartosc">
                <div id="boxGora"></div>
                {!przebiegWalki && <div id="boxInfo">Wybierz przeciwnika</div>}
                <div id="boxWyboru">
                  {!przebiegWalki &&
                    Object.keys(arenaData.daneGraczy).map((graczKey) => {
                      const gracz = arenaData.daneGraczy[graczKey];
                      return (
                        <div
                          className="wyborPostaci"
                          id={`boxPostac${graczKey}`}
                          key={graczKey}
                          onClick={() => wyborGracza(gracz)}
                        >
                          <div id={`boxWyglad${graczKey}`}>
                            <div id="boxObrazek">
                              <img src={gracz.zdjecieURL} alt={gracz.nazwa} />
                            </div>

                            <div className='boxNazwa'>{gracz.nazwa}</div>
                            
                            <div className="boxOpisStatystyk">
                                <div className='Statystyka'>{gracz.sumaPunktow.sila} Siła</div>
                                <div className='Statystyka'>{gracz.sumaPunktow.zdrowie} Zdrowie</div>
                                <div className='Statystyka'>{gracz.sumaPunktow.zwinnosc} Zwinnosc</div>
                                <div className='Statystyka'>{gracz.sumaPunktow.zrecznosc} Zrecznosc</div>
                                <div className='Statystyka'>{gracz.sumaPunktow.inteligencja} Inteligencja</div>
                                <div className='Statystyka'>{gracz.sumaPunktow.pancerz} Pancerz</div>
                                <div className='Statystyka'>{gracz.sumaPunktow.obrazeniaMin}-{gracz.sumaPunktow.obrazeniaMax} Obrazenia</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  {!wyswietlKoniec && przebiegWalki ? (
                    <div>
                      <div className='animacjaPojedynku'>
                        <div className="profilePostaci">
                          <div className={`graczA ${poczekalnia && turaGracza}`}>
                            <img
                              src={
                                przebiegWalki && przebiegWalki.a_wyglad
                                  ? zdjecia.find((item) => item.id === parseInt(przebiegWalki.a_wyglad)).url
                                  : 'x.jpg'
                              }
                              alt="img1"
                            />
                            <div className="boxMaxZdrowieA">
                              <div
                                className="boxProgresZdrowieA"
                                style={{
                                  width: `${Math.max((progresZdrowieA / maxZdrowieA) * 100, 0)}%`
                                }}
                              >
                                <div className="liczbaZdrowie">
                                  {progresZdrowieA}/{maxZdrowieA}
                                </div>
                              </div>
                            </div>

                            <div className='boxObrazeniaA'>
                              {aktualnyAtak % 2 === 1 ? przebiegWalki.ataki[aktualnyAtak] : ''}
                            </div>
                          </div>

                          <div className={`graczB ${poczekalnia && (turaGracza === 'atak' ? 'obrona' : 'atak')}`}>
                            <img
                              src={
                                przebiegWalki && przebiegWalki.p_wyglad
                                  ? zdjecia.find((item) => item.id === parseInt(przebiegWalki.p_wyglad)).url
                                  : 'x.jpg'
                              }
                              alt="img2"
                            />

                            <div className="boxMaxZdrowieB">
                              <div
                                className="boxProgresZdrowieB"
                                style={{
                                  width: `${Math.max((progresZdrowieB / maxZdrowieB) * 100, 0)}%`
                                }}
                              >
                                <div className="liczbaZdrowie">
                                  {progresZdrowieB}/{maxZdrowieB}
                                </div>
                              </div>
                            </div>

                            <div className='boxObrazeniaB'>
                              {aktualnyAtak % 2 === 0 ? przebiegWalki.ataki[aktualnyAtak] : ''}
                            </div>
                          </div>
                        </div>
                        <div className='boxPrzycisk' onClick={() => pomijanieAnimacji()}>Pomiń</div>
                      </div>
                    </div>
                  ) : null}

                  {wyswietlKoniec ? (<div>{przebiegWalki.wygrana === 1 ?
                    <div className='boxWygrana'>
                      <div className='napisW'>
                        Wygrana
                      </div>
                      <div className='boxNagroda'>
                        <h1>Nagroda</h1>
                        <p>Miedziaki: {przebiegWalki.nagrodaMiedziaki}</p>
                        <p>Doświadczenie: {przebiegWalki.nagrodaDoswiadczenie} </p>
                        <div className='boxPrzycisk' onClick={() => window.location.reload()}>OK</div>
                      </div>
                    </div>
                    :
                    <div className='boxPrzegrana'>
                      <div className='napisP'>
                        Przegrana
                      </div>
                      <div className='boxNagroda'>
                        <h1>Brak nagrody</h1>
                        <div className='boxPrzycisk' onClick={() => window.location.reload()}>OK</div>
                      </div>
                    </div>}</div>)
                    : null}

                </div>

                {alertOpis.animacja && (<div className='boxPojedynkiAlert'>
                  <div id="boxAlert" className="alert">
                    Musisz odczekać jeszcze {parseInt(alertOpis.minut)} minut i {alertOpis.sekund.toFixed(1)} sekund przed kolejnym pojedynkiem
                  </div></div>
                )}

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

