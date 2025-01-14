import React, { useState, useEffect } from 'react'
import LeweMenu from '../Nawigacja/LeweMenu/LeweMenu'
import GorneMenu from '../Nawigacja/GorneMenu/GorneMenu'
import Stopka from '../Nawigacja/Stopka/Stopka'
import { Autoryzacja } from '../Autoryzacja/Autoryzacja'
import "./Postac.css"
import kapanka from './Kapanka.png'
import drzewo from './drzewo.jpg'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios';
import zdjecia from '../Wyglad/Zdjecia'
import przedmioty from '../Przedmioty/Przedmioty'
import Ladowanie from '../Ladowanie/Ladowanie'



export default function Postac() {


    const [danePostaci, setDanePostaci] = useState({
    }); 


    const [daneEkwipunek, setDaneEkwipunek] = useState({
    });

    const { autoryzacja, nazwa, handleLogout } = Autoryzacja();

    const [daneStatystyki, setDaneStatystyki] = useState([]);

    const [reload, setReload] = useState(false);
    const [sila, setSila] = useState();
    const [zdrowie, setZdrowie] = useState();
    const [zwinnosc, setZwinnosc] = useState();
    const [zrecznosc, setZrecznosc] = useState();
    const [inteligencja, setInteligencja] = useState();
    const [pancerz, setPancerz] = useState();


    useEffect(() => {
        if (nazwa) {
            const nazwaUzytkownika = nazwa;
            axios.get(`http://localhost:8081/postac/${nazwaUzytkownika}`)
                .then(response => {
                    setDanePostaci(prev => ({ ...prev, ...response.data.Postac }));
                })
                .catch(error => {
                    console.error('Błąd pobierania danych użytkownika:', error);
                });
        }
    }, [nazwa]);

    useEffect(() => {
        if (nazwa) {
            const nazwaUzytkownika = nazwa;
            axios.get(`http://localhost:8081/podsumowaniePunktow/${nazwaUzytkownika}`)
                .then(response => {
                    setDaneStatystyki(response.data);
                    
                })
                .catch(error => {
                    console.error('Błąd pobierania danych o statystykach:', error);
                });
        }
    }, [nazwa]);

    useEffect(() => {
        if (danePostaci.id) {
            const id = danePostaci.id;
            axios.get(`http://localhost:8081/ekwipunek/${id}`)
                .then(response => {
                    setDaneEkwipunek(response.data);
                    setReload(true);
                })
                .catch(error => {
                    console.error('Błąd pobierania danych o ekwipunku:', error);
                });
        }
    }, [danePostaci.uzytkownik_id]);



    useEffect(() => {
        if (reload) {
            setSila(daneStatystyki.SumaDrzewaPKT.sumaSila+daneStatystyki.SumaEkwipunekPKT.sumaSila+daneStatystyki.SumaPostacPKT.sila)
            setZdrowie(daneStatystyki.SumaDrzewaPKT.sumaZdrowie+daneStatystyki.SumaEkwipunekPKT.sumaZdrowie+daneStatystyki.SumaPostacPKT.zdrowie);
            setZwinnosc(daneStatystyki.SumaDrzewaPKT.sumaZwinnosc+daneStatystyki.SumaEkwipunekPKT.sumaZwinnosc+daneStatystyki.SumaPostacPKT.zwinnosc);
            setZrecznosc(daneStatystyki.SumaDrzewaPKT.sumaZrecznosc+daneStatystyki.SumaEkwipunekPKT.sumaZrecznosc+daneStatystyki.SumaPostacPKT.zrecznosc);
            setInteligencja(daneStatystyki.SumaDrzewaPKT.sumaInteligencja+daneStatystyki.SumaEkwipunekPKT.sumaInteligencja+daneStatystyki.SumaPostacPKT.inteligencja);
            setPancerz(daneStatystyki.SumaDrzewaPKT.sumaPancerz+daneStatystyki.SumaEkwipunekPKT.sumaPancerz+daneStatystyki.SumaPostacPKT.pancerz);
        }
    }, [reload]
    )

    const zdjecie = zdjecia.find((item) => item.id === parseInt(danePostaci.wyglad));
    const helmImg = daneEkwipunek.Helm ? przedmioty.find((item) => item.nazwa === daneEkwipunek.Helm.ikona) : przedmioty.find((item) => item.nazwa === "x.jpg");
    const naszyjnikImg = daneEkwipunek.Naszyjnik ? przedmioty.find((item) => item.nazwa === daneEkwipunek.Naszyjnik.ikona) : przedmioty.find((item) => item.nazwa === "x.jpg");
    const odziezImg = daneEkwipunek.Odziez ? przedmioty.find((item) => item.nazwa === daneEkwipunek.Odziez.ikona) : przedmioty.find((item) => item.nazwa === "x.jpg");
    const pasImg = daneEkwipunek.Pas ? przedmioty.find((item) => item.nazwa === daneEkwipunek.Pas.ikona) : przedmioty.find((item) => item.nazwa === "x.jpg");
    const spodnieImg = daneEkwipunek.Spodnie ? przedmioty.find((item) => item.nazwa === daneEkwipunek.Spodnie.ikona) : przedmioty.find((item) => item.nazwa === "x.jpg");
    const rekawiceImg = daneEkwipunek.Rekawice ? przedmioty.find((item) => item.nazwa === daneEkwipunek.Rekawice.ikona) : przedmioty.find((item) => item.nazwa === "x.jpg");
    const butyImg = daneEkwipunek.Buty ? przedmioty.find((item) => item.nazwa === daneEkwipunek.Buty.ikona) : przedmioty.find((item) => item.nazwa === "x.jpg");
    const bronImg = daneEkwipunek.Bron ? przedmioty.find((item) => item.nazwa === daneEkwipunek.Bron.ikona) : przedmioty.find((item) => item.nazwa === "x.jpg");
    const zwierzeImg = daneEkwipunek.Zwierze ? przedmioty.find((item) => item.nazwa === daneEkwipunek.Zwierze.ikona) : przedmioty.find((item) => item.nazwa === "x.jpg");
    const narzedzieImg = daneEkwipunek.Narzedzie ? przedmioty.find((item) => item.nazwa === daneEkwipunek.Narzedzie.ikona) : przedmioty.find((item) => item.nazwa === "x.jpg");




    if (reload) {
        return (
            <div className='Postac'>
                <GorneMenu handleLogout={handleLogout} nazwa={nazwa} />

                <div id="kontener">
                    <LeweMenu />
                    <div id="prawyEkran">
                        <div id="zawartoscEkranu">
                            <div id="gornaCzesc">
                                <div id="lewoGornaCzesc">
                                    <div id="Przyciski">
                                        <div id="Magazyn">
                                            <div id="ikona">
                                                <img src={kapanka} onClick={() => { window.location.pathname = "/magazyn" }}></img>
                                            </div>
                                        </div>

                                        <div id="Drzewo">
                                            <div id="ikona">
                                                <img src={drzewo} onClick={() => { window.location.pathname = "/drzewo" }}></img>
                                            </div>
                                        </div>
                                    </div>
                                    <div id="boxStatystyki">
                                        <div id="Statystyki">
                                            <p>{sila} Siła</p>
                                            <p>{zdrowie} Zdrowie</p>
                                            <p>{zwinnosc} Zwinnosc</p>
                                            <p>{zrecznosc} Zręczność</p>
                                            <p>{inteligencja} Inteligencja</p>
                                            <p>{pancerz} Pancerz</p>
                                        </div>
                                    </div>
                                </div>
                                <div id="prawoGornaCzesc">

                                    <div id="lewaKolumna">
                                        <div id="boxHelm">
                                            <img src={helmImg.url} alt={`Wyglad helm`} />
                                        </div>

                                        <div id="boxOdziez">
                                            <img src={odziezImg.url} alt={`Wyglad odziez`} />
                                        </div>

                                        <div id="boxSpodnie">
                                            <img src={spodnieImg.url} alt={`Wyglad spodnie`} />
                                        </div>

                                        <div id="boxButy">
                                            <img src={butyImg.url} alt={`Wyglad buty`} />
                                        </div>
                                    </div>

                                    <div id="srodekKolumna">
                                        <div id="boxGorny">
                                            <div id="boxWyglad">
                                                <img src={zdjecie.url} alt={`Wyglad postaci`} />
                                                <div id="boxDoswiadczenie">
                                                    <div className='pasekDoswiadczenie'>
                                                        <div className='procentDoswiadczenia'
                                                        style={{
                                                            width: `${Math.max((danePostaci.doswiadczenie/ danePostaci.nastepnyPoziom) * 100, 0)}%`
                                                          }}></div>
                                                    <div className='liczbaDoswiadczenia'>
                                                    {danePostaci.doswiadczenie}/{danePostaci.nastepnyPoziom}
                                                    </div>
                                                    </div>
                                                    </div>
                                            </div>
                                        </div>
                                        <div id="boxDolny">
                                            <div id="boxBron">
                                                <img src={bronImg.url} alt={`Wyglad bron`} />
                                            </div>

                                            <div id="boxPoziom">
                                                <div id="boxGwiazda">
                                                    {danePostaci.poziom}
                                                </div>
                                            </div>

                                            <div id="boxZwierze">
                                                <img src={zwierzeImg.url} alt={`Wyglad zwierze`} />
                                            </div>
                                        </div>
                                    </div>

                                    <div id="prawaKolumna">
                                        <div id="boxNaszyjnik">
                                            <img src={naszyjnikImg.url} alt={`Wyglad naszyjnik`} />
                                        </div>

                                        <div id="boxPas">
                                            <img src={pasImg.url} alt={`Wyglad pas`} />
                                        </div>

                                        <div id="boxRekawice">
                                            <img src={rekawiceImg.url} alt={`Wyglad rekawice`} />
                                        </div>

                                        <div id="boxNarzedzie">
                                            <img src={narzedzieImg.url} alt={`Wyglad narzedzie`} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div id="dolnaCzesc">
                                <div id="boxOsiagniecia">
                                    <div id="boxOsiagniecie1">


                                    </div>
                                    <div id="boxOsiagniecie2">

                                    </div>
                                    <div id="boxOsiagniecie3">

                                    </div>
                                    <div id="boxOsiagniecie4">

                                    </div>
                                    <div id="boxOsiagniecie5">

                                    </div>
                                    <div id="boxOsiagniecie6">

                                    </div>
                                    <div id="boxOsiagniecie7">

                                    </div>
                                    <div id="boxOsiagniecie8">

                                    </div>
                                    <div id="boxOsiagniecie9">

                                    </div>
                                </div>

                            </div>
                        </div>

                    </div>
                </div>
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





