import React, { useState, useEffect } from 'react'
import LeweMenu from '../Nawigacja/LeweMenu/LeweMenu'
import GorneMenu from '../Nawigacja/GorneMenu/GorneMenu'
import Stopka from '../Nawigacja/Stopka/Stopka'
import { Autoryzacja } from '../Autoryzacja/Autoryzacja'
import axios from 'axios';
import sprzedawca from './sprzedawca.png'
import Ladowanie from '../Ladowanie/Ladowanie'
import przedmioty from '../Przedmioty/Przedmioty'
import "./Sklep.css"


export default function Sklep() {

    const { autoryzacja, nazwa, handleLogout } = Autoryzacja();

    const [daneMagazyn, setDaneMagazyn] = useState([]);

    const [danePrzedmioty, setDanePrzedmioty] = useState([]);

    const [reload, setReload] = useState(false);

    const [przedmiotDoKupienia, setPrzedmiotDoKupienia] = useState(null);

    const [przedmiotDoSprzedania, setPrzedmiotDoSprzedania] = useState(null);

    const [message, setMessage] = useState("");

    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    const handleClickZakup = (index) => {

        setPrzedmiotDoKupienia(index);
    };

    const handleConfirmZakup = (id, cena) => {

        console.log('Zakupiono przedmiot:');


        if (nazwa) {
            const nazwaUzytkownika = nazwa;
            axios.post(`http://localhost:8081/sklepZakup/${nazwaUzytkownika}/${id}/${cena}`)
                .then(response => {
                    console.log(response.data.Message)
                    setMessage(response.data.Message);
                    if (response.data.Message === "Zakupiono przedmiot!")
                        window.location.reload()
                    setTimeout(() => {
                        setMessage(null);
                    }, 2500);
                })
                .catch(error => {
                    console.error('Błąd zakupu:', error);
                });
        }
        setPrzedmiotDoKupienia(null);
    };

    const handleCancelZakup = () => {

        setPrzedmiotDoKupienia(null);
    };

    const handleClickSprzedaz = (index) => {

        setPrzedmiotDoSprzedania(index);
    };

    const handleConfirmSprzedaz = (nazwaP, cenaSprzedazy) => {

        if (nazwa) {
            const nazwaUzytkownika = nazwa;
            axios.post(`http://localhost:8081/sklepSprzedaz/${nazwaUzytkownika}/${nazwaP}/${cenaSprzedazy}`)
                .then(response => {
                    console.log(response.data.Message)
                    setMessage(response.data.Message);
                    window.location.reload()
                })
                .catch(error => {
                    console.error('Błąd sprzedazy:', error);
                });
        }
        setPrzedmiotDoSprzedania(null);
    };

    const handleCancelSprzedaz = () => {


        setPrzedmiotDoSprzedania(null);
    };

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    useEffect(() => {
        if (nazwa) {
            const nazwaUzytkownika = nazwa;
            axios.get(`http://localhost:8081/magazyn/${nazwaUzytkownika}`)
                .then(response => {
                    setDaneMagazyn(prev => ({ ...prev, ...response.data.Magazyn }));
                    console.log(response.data.Magazyn)


                })
                .catch(error => {
                    console.error('Błąd pobierania danych magazynu:', error);
                });
        }
    }, [nazwa]);

    useEffect(() => {
        if (nazwa) {
            const nazwaUzytkownika = nazwa;
            axios.get(`http://localhost:8081/sklep/${nazwaUzytkownika}`)
                .then(response => {
                    console.log(response.data.Message)
                    if (response.data.Message === "Sklep wygenerowany") {
                        axios.get(`http://localhost:8081/pobranieSklepu/${nazwaUzytkownika}`)
                            .then(response => {
                                setDanePrzedmioty(prev => ({ ...prev, ...response.data.Sklep }));
                                setTimeout(() => {
                                    setReload(true);
                                }, 100);

                            })
                            .catch(error => {
                                console.error('Błąd pobierania danych ze sklepu:', error);
                            });
                    }
                })
                .catch(error => {
                    console.error('Błąd generowania sklepu:', error);
                });
        }
    }, [nazwa]);

    const sprzawdzZaloz = (przedmiot) => {
        if (przedmiot.zalozone === 0) {
            return false
        }
        return true
    }

    if (reload) {
        return (
            <div className='Sklep'>
                <GorneMenu handleLogout={handleLogout} nazwa={nazwa} />

                <div id="kontener">
                    <LeweMenu />
                    <div id="prawyEkran">
                        <div id="zawartoscEkranu">
                            <div id="sprzedawca">
                                <img src={sprzedawca} id="npc" alt="sprzedawca"></img>
                                {message === "Nie posiadasz wystarczającej liczby miedziaków!" && (
                                    <div className="modalBrakMiedziakow">
                                        <p>{message}</p>
                                    </div>

                                )}
                            </div>
                            <div id="przedmioty">
                                {[...Array(10)].map((_, index) => {
                                    var przedmiot2 = danePrzedmioty.przedmioty[index];
                                    console.log(przedmiot2.nazwa)

                                    if (przedmiot2.czy_wykupione === 0) {
                                        const cenaSprzedazy = Math.floor(przedmiot2.cena / 2);
                                        const rzadkosc = `${przedmiot2.rzadkosc.toLowerCase()}`;
                                        return (
                                            <div id="przedmiot-container" key={index}>
                                                <div id="ikona" onClick={() => handleClickZakup(index)}>
                                                    <img
                                                        src={przedmioty.find((item) => item.nazwa === przedmiot2.ikona).url}
                                                        alt={`przedmiot`}
                                                    />
                                                </div>
                                                {przedmiotDoKupienia === index && (
                                                    <div className="overlay">
                                                        <div className="modal">
                                                            <p>Czy na pewno chcesz kupić przedmiot: {przedmiot2.nazwa} za {przedmiot2.cena}$?</p>
                                                            <button id="tak" onClick={() => handleConfirmZakup(przedmiot2.ID, przedmiot2.cena)}>Tak</button>
                                                            <button id="nie" onClick={handleCancelZakup}>Nie</button>
                                                        </div>
                                                    </div>
                                                )}

                                                <div id={index % 5 === 0 || index % 5 === 1 ? "opisLD" : "opisPD"} className={rzadkosc}>
                                                    <h2>{przedmiot2.nazwa}</h2>
                                                    {przedmiot2.zestaw != "brak" ? <div>Zestaw: {przedmiot2.zestaw}</div> : <div></div>}
                                                    <div id={rzadkosc}>{przedmiot2.rzadkosc}</div>
                                                    <hr></hr>
                                                    <div>Poziom ulepszenia: {przedmiot2.poziom_ulepszenia}</div>
                                                    <hr></hr>
                                                    {przedmiot2.obrazeniaMin ? <div>{przedmiot2.obrazeniaMin}-{przedmiot2.obrazeniaMax} Obrażenia</div> : <div></div>}
                                                    <div id="boxStatystyki">
                                                        {przedmiot2.statystyki.sila ? <div id="itemStatystyka">+{przedmiot2.statystyki.sila} Sila</div> : <div></div>}
                                                        {przedmiot2.statystyki.zdrowie ? <div id="itemStatystyka">+{przedmiot2.statystyki.zdrowie} Zdrowie</div> : <div></div>}
                                                        {przedmiot2.statystyki.zwinnosc ? <div id="itemStatystyka">+{przedmiot2.statystyki.zwinnosc} Zwinnosc</div> : <div></div>}
                                                        {przedmiot2.statystyki.zrecznosc ? <div id="itemStatystyka">+{przedmiot2.statystyki.zrecznosc} Zręczność</div> : <div></div>}
                                                        {przedmiot2.statystyki.inteligencja ? <div id="itemStatystyka">+{przedmiot2.statystyki.inteligencja} Inteligencja</div> : <div></div>}
                                                        {przedmiot2.statystyki.pancerz ? <div id="itemStatystyka">+{przedmiot2.statystyki.pancerz} Pancerz</div> : <div></div>}
                                                    </div>
                                                    <hr></hr>
                                                    <div>Kupno: {przedmiot2.cena}$ Sprzedaż: {cenaSprzedazy}$</div>
                                                    <hr></hr>
                                                    {przedmiot2.poziom ? <div>Wymagany poziom: {przedmiot2.poziom}</div> : <div></div>}
                                                    <div>{przedmiot2.typ}</div>
                                                </div>
                                                {przedmiot2.ilosc !== 1 && <p className="ilosc">{przedmiot2.ilosc}</p>}
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
                            <div id="magazyn">
                                {[...Array(50)].map((_, index) => {
                                    if (index < daneMagazyn.przedmioty.length) {
                                        const przedmiot = daneMagazyn.przedmioty[index];
                                        const cenaSprzedazy = Math.floor(przedmiot.cena / 2);
                                        const rzadkosc = `${przedmiot.rzadkosc.toLowerCase()}`;
                                        return (
                                            <div id="przedmiot-container" key={index} >
                                                <div id="ikona" onClick={() => handleClickSprzedaz(index)} className={sprzawdzZaloz(przedmiot) ? 'zalozone' : ''}>
                                                    <img
                                                        src={przedmioty.find((item) => item.nazwa === przedmiot.ikona).url}
                                                        alt={`przedmiot`}
                                                    />
                                                </div>
                                                {przedmiotDoSprzedania === index && !sprzawdzZaloz(przedmiot) && (
                                                    <div className="overlay">
                                                        <div className="modal">
                                                            <p>Czy na pewno chcesz sprzedać przedmiot: {przedmiot.nazwa} za {przedmiot.ilosc * cenaSprzedazy}$?</p>
                                                            <button id="tak" onClick={() => handleConfirmSprzedaz(przedmiot.nazwa, cenaSprzedazy * przedmiot.ilosc)}>Tak</button>
                                                            <button id="nie" onClick={handleCancelSprzedaz}>Nie</button>
                                                        </div>
                                                    </div>
                                                )}
                                                <div id={
                                                    windowWidth >= 1000 ?
                                                        (index % 5 === 0 || index % 5 === 1) && index < 25 ? "opisLG" : (index % 5 === 0 || index % 5 === 1) && index >= 25 ? "opisLD" : index < 25 ? "opisPG" : "opisPD"
                                                        : windowWidth >= 700 ?
                                                            (index % 4 === 0 || index % 4 === 1) && index < 24 ? "opisLG" : (index % 4 === 0 || index % 4 === 1) && index >= 24 ? "opisLD" : index < 24 ? "opisPG" : "opisPD"
                                                            : (index % 3 === 0 || index % 3 === 1) && index < 24 ? "opisLG" : (index % 3 === 0 || index % 3 === 1) && index >= 24 ? "opisLD" : index < 24 ? "opisPG" : "opisPD"
                                                } className={rzadkosc}>
                                                    <h2>{przedmiot.nazwa}</h2>
                                                    {przedmiot.zestaw != "brak" ? <div>Zestaw: {przedmiot.zestaw}</div> : <div></div>}
                                                    <div id={rzadkosc}>{przedmiot.rzadkosc}</div>
                                                    <hr></hr>
                                                    <div>Poziom ulepszenia: {przedmiot.poziom_ulepszenia}</div>
                                                    <hr></hr>
                                                    {przedmiot.obrazeniaMin ? <div>{przedmiot.obrazeniaMin}-{przedmiot.obrazeniaMax} Obrażenia</div> : <div></div>}
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


