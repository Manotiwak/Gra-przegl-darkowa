import React, { useState, useEffect } from 'react'
import LeweMenu from '../Nawigacja/LeweMenu/LeweMenu'
import GorneMenu from '../Nawigacja/GorneMenu/GorneMenu'
import Stopka from '../Nawigacja/Stopka/Stopka'
import { Autoryzacja } from '../Autoryzacja/Autoryzacja'
import Ladowanie from '../Ladowanie/Ladowanie'
import blokada from './blokada.png'
import axios from 'axios';
import { format } from 'date-fns';
import przedmioty from '../Przedmioty/Przedmioty'
import "./Prace.css"


export default function Prace() {

    const { autoryzacja, nazwa, handleLogout } = Autoryzacja();

    const [danePrace, setDanePrace] = useState([]);

    const [reload, setReload] = useState(false);

    const [wykonywanaPraca, setWykonywanaPraca] = useState([]);

    const [czasDoKonca, setCzasDoKonca] = useState(null)

    const handlePracuj = (index, czas) => {

        if (nazwa) {
            const nazwaUzytkownika = nazwa;
            axios.post(`http://localhost:8081/rozpocznijPrace/${nazwaUzytkownika}/${index}/${czas}`)
                .then(response => {
                    console.log("Wykonuje prace " + index);
                    if (response.data.Message === "Pracujesz") {
                        window.location.reload()
                    }
                })
                .catch(error => {
                    console.error('Błąd sprzedazy:', error);
                });
        }
    };

    const handleOdbierz = (id) => {
        axios.post(`http://localhost:8081/zakonczPrace/${id}`)
            .then(response => {
                if (response.data.Message === "Odebrano nagrody") {
                    window.location.reload()
                }
            })
            .catch(error => {
                console.error('Błąd zakończenia pracy:', error);
            });
    };

    useEffect(() => {
        if (nazwa) {
            const nazwaUzytkownika = nazwa;
            axios.get(`http://localhost:8081/prace/${nazwaUzytkownika}`)
                .then(response => {
                    setDanePrace(prev => ({ ...prev, ...response.data.Praca }));
                    console.log(response.data.Praca)

                })
                .catch(error => {
                    console.error('Błąd pobierania danych prac:', error);
                });
        }
    }, [nazwa]);

    useEffect(() => {
        if (nazwa) {
            const nazwaUzytkownika = nazwa;
            axios.get(`http://localhost:8081/wykonywanePrace/${nazwaUzytkownika}`)
                .then(response => {
                    setWykonywanaPraca(response.data.Praca);
                    console.log(response.data.Praca)
                    setReload(true);

                })
                .catch(error => {
                    console.error('Błąd pobierania danych o wykonywanej pracy:', error);
                });
        }
    }, [nazwa]);

    if (reload) {
        return (
            <div className='Prace'>
                <GorneMenu handleLogout={handleLogout} nazwa={nazwa} />

                <div id="kontener">
                    <LeweMenu />
                    <div id="prawyEkran">
                        <div id="Zawartosc">
                            <div class="siatka">
                                {[...Array(12)].map((_, index) => {
                                    var praca = danePrace.praca[index];
                                    if (praca.czySpelnia === "tak") {
                                        if (wykonywanaPraca) {
                                            if (index === wykonywanaPraca.praca_id - 1) {
                                                const dataZakonczenia = new Date(wykonywanaPraca.data)
                                                const obecnaData = new Date();
                                                let czas = dataZakonczenia - obecnaData;
                                                let czasWsekundach = Math.floor(czas / 1000) + 1;
                                                let g = Math.floor(czasWsekundach / 3600);
                                                let m = Math.floor((czasWsekundach % 3600) / 60);
                                                let s = czasWsekundach % 60;
                                                if (czas > 0) {
                                                    function aktualizujCzas() {
                                                        g = Math.floor(czasWsekundach / 3600);
                                                        m = Math.floor((czasWsekundach % 3600) / 60);
                                                        s = czasWsekundach % 60;

                                                        setCzasDoKonca(`0${g}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`);
                                                        if (czasWsekundach === 0) {
                                                            clearInterval(timerId);
                                                            setCzasDoKonca(null);
                                                        } else {
                                                            czasWsekundach--;
                                                        }
                                                    }
                                                    const timerId = setInterval(aktualizujCzas, 1000);
                                                }
                                                if (obecnaData <= dataZakonczenia) {
                                                    return (
                                                        <div class="okno">
                                                            <table>
                                                                <tr>
                                                                    <td rowspan="4" class="logo">
                                                                        {wykonywanaPraca.ikona_p !== undefined && (
                                                                            <div id="przedmiot-container" key={index}>
                                                                                <div id="ikona">
                                                                                    <img
                                                                                        src={przedmioty.find((item) => item.nazwa === wykonywanaPraca.ikona_p).url}
                                                                                        alt={`przedmiot`}
                                                                                    />
                                                                                </div>
                                                                                <div id={(index % 3 === 0 || index % 3 === 1) && index < 7 ? "opisLG" : (index % 3 === 0 || index % 3 === 1) && index >= 7 ? "opisLD" : index < 7 ? "opisPG" : "opisPD"} className={wykonywanaPraca.rzadkosc_p}>
                                                                                    <h2>{wykonywanaPraca.nazwa_p}</h2>
                                                                                    <div id={wykonywanaPraca.rzadkosc_p}>{wykonywanaPraca.rzadkosc_p}</div>
                                                                                    <hr></hr>
                                                                                    <div>Kupno: {wykonywanaPraca.cena_p}$ Sprzedaż: {wykonywanaPraca.cena_p / 2}$</div>
                                                                                    <hr></hr>
                                                                                    {wykonywanaPraca.poziom_p ? <div>Wymagany poziom: {wykonywanaPraca.poziom_p}</div> : <div></div>}
                                                                                    <div>{wykonywanaPraca.typ_p}</div>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                        {wykonywanaPraca.ikona_p === undefined && (
                                                                            <div id="przedmiot-container" key={index}>
                                                                                <div id="ikona">
                                                                                    <img
                                                                                        src={przedmioty.find((item) => item.nazwa === "box").url}
                                                                                        alt={`przedmiot`}
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </td>
                                                                    <td>{praca.nazwa}</td>
                                                                </tr>
                                                                <tr>
                                                                    <td>W trakcie</td>
                                                                </tr>
                                                                <tr>
                                                                    <td>Koniec za:</td>
                                                                </tr>
                                                                <tr>
                                                                    <td id="timer"> 0{g}:{m < 10 ? '0' : ''}{m}:{s < 10 ? '0' : ''}{s} </td>
                                                                </tr>
                                                            </table>
                                                        </div>
                                                    )
                                                } else {
                                                    return (
                                                        <div class="okno">
                                                            <table>
                                                                <tr>
                                                                    <td rowspan="4" class="logo">
                                                                        {wykonywanaPraca.ikona_p !== undefined && (
                                                                            <div id="przedmiot-container" key={index}>
                                                                                <div id="ikona">
                                                                                    <img
                                                                                        src={przedmioty.find((item) => item.nazwa === wykonywanaPraca.ikona_p).url}
                                                                                        alt={`przedmiot`}
                                                                                    />
                                                                                </div>
                                                                                <div id={(index % 3 === 0 || index % 3 === 1) && index < 7 ? "opisLG" : (index % 3 === 0 || index % 3 === 1) && index >= 7 ? "opisLD" : index < 7 ? "opisPG" : "opisPD"} className={wykonywanaPraca.rzadkosc_p}>
                                                                                    <h2>{wykonywanaPraca.nazwa_p}</h2>
                                                                                    <div id={wykonywanaPraca.rzadkosc_p}>{wykonywanaPraca.rzadkosc_p}</div>
                                                                                    <hr></hr>
                                                                                    <div>Kupno: {wykonywanaPraca.cena_p}$ Sprzedaż: {wykonywanaPraca.cena_p / 2}$</div>
                                                                                    <hr></hr>
                                                                                    {wykonywanaPraca.poziom_p ? <div>Wymagany poziom: {wykonywanaPraca.poziom_p}</div> : <div></div>}
                                                                                    <div>{wykonywanaPraca.typ_p}</div>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                        {wykonywanaPraca.ikona_p === undefined && (
                                                                            <div id="przedmiot-container" key={index}>
                                                                                <div id="ikona">
                                                                                    <img
                                                                                        src={przedmioty.find((item) => item.nazwa === "box").url}
                                                                                        alt={`przedmiot`}
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </td>
                                                                    <td>{praca.nazwa}</td>
                                                                </tr>
                                                                <tr>
                                                                    <td>Zakończono</td>
                                                                </tr>
                                                                <tr>
                                                                    <td>{wykonywanaPraca.exp + "XP " + wykonywanaPraca.miedziaki + "$"}</td>
                                                                </tr>
                                                                <tr>
                                                                    <td id='przycisk'>
                                                                        <button id='odbierz' onClick={() => handleOdbierz(wykonywanaPraca.id)}>Odbierz nagrody</button>
                                                                    </td>
                                                                </tr>
                                                            </table>
                                                        </div>
                                                    )
                                                }
                                            }
                                            else {
                                                return (
                                                    <div class="nieaktywneOkno">
                                                        <table>
                                                            <tr>
                                                                <td rowspan="4" class="logo">logo</td>
                                                                <td>{praca.nazwa}</td>
                                                            </tr>
                                                            <tr>
                                                                <td>{praca.narzedzie ? "Wymagania: " + praca.narzedzie : "Brak wymagań"}</td>
                                                            </tr>
                                                            <tr>
                                                                <td>{praca.czas}</td>
                                                            </tr>
                                                            <tr>
                                                                <td id='przycisk'>
                                                                    <button id ='pracuj'>Pracuj</button>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </div>
                                                )
                                            }
                                        } else {
                                            return (
                                                <div class="okno">
                                                    <table>
                                                        <tr>
                                                            <td rowspan="4" class="logo">logo</td>
                                                            <td>{praca.nazwa}</td>
                                                        </tr>
                                                        <tr>
                                                            <td>{praca.narzedzie ? "Wymagania: " + praca.narzedzie : "Brak wymagań"}</td>
                                                        </tr>
                                                        <tr>
                                                            <td>{praca.czas}</td>
                                                        </tr>
                                                        <tr>
                                                            <td id='przycisk'>
                                                                <button id ='pracuj' onClick={() => handlePracuj(index, praca.czas)}>Pracuj</button>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </div>
                                            )
                                        }
                                    }
                                    else {
                                        return (
                                            <div class="oknoBlokady">
                                                <div id="blokada"></div>
                                                Wymagany poziom: {praca.poziom}
                                            </div>
                                        )
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


