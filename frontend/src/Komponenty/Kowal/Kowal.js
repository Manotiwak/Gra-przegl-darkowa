import React, { useState, useEffect } from 'react'
import LeweMenu from '../Nawigacja/LeweMenu/LeweMenu'
import GorneMenu from '../Nawigacja/GorneMenu/GorneMenu'
import Stopka from '../Nawigacja/Stopka/Stopka'
import { Autoryzacja } from '../Autoryzacja/Autoryzacja'
import axios from 'axios';
import Ladowanie from '../Ladowanie/Ladowanie'
import przedmioty from '../Przedmioty/Przedmioty'
import "./Kowal.css"
import { Miedziaki } from '../Nawigacja/Miedziaki/Miedziaki'


export default function Kowal() {

    const { autoryzacja, nazwa, handleLogout } = Autoryzacja();

    const [daneMagazyn, setDaneMagazyn] = useState([]);

    const [reload, setReload] = useState(false);

    const [przedmiotDoUlepszenia, setPrzedmiotDoUlepszenia] = useState(null);

    const [gotowyDoUlepszenia, setGotowyDoUlepszenia] = useState(null);

    const [daneUlepszacz, setDaneUlepszacz] = useState([]);

    const [message, setMessage] = useState("");

    const handleClickUlepsz = (przedmiot) => {
        if (!przedmiot.zalozone && przedmiot.typ !== "Produkt" && przedmiot.poziom_ulepszenia !== 9) {
            axios.get(`http://localhost:8081/ulepszenie/${przedmiot.nazwa}`)
                .then(response => {
                    setPrzedmiotDoUlepszenia(response.data.przedmiot);
                    console.log(response.data.przedmiot)

                })
                .catch(error => {
                    console.error('Błąd pobierania danych przedmiotu:', error);
                });
            axios.get(`http://localhost:8081/ulepszacze/${przedmiot.poziom}`)
                .then(response => {
                    setDaneUlepszacz(prev => ({ ...prev, ...response.data.Ulepszacz }));
                    console.log(response.data.Ulepszacz)
                })
                .catch(error => {
                    console.error('Błąd pobierania danych ulepszaczy:', error);
                });
        }

    };

    const handleClickPotwierdz = (poziom) => {
        let i = 0;
        let posiadaneulepszacze = 0;
        const miedziakidiv = document.getElementById('MoneyView');
        const miedziaki = parseInt(miedziakidiv.innerText);
        console.log(miedziaki)
        while (i < daneMagazyn.przedmioty.length) {
            let j = 0;
            while (j < daneUlepszacz.ulepszacz.length) {
                if (daneMagazyn.przedmioty[i].nazwa === daneUlepszacz.ulepszacz[j].nazwa && daneMagazyn.przedmioty[i].ilosc >= poziom) {
                    posiadaneulepszacze++;
                }
                j++;
            }
            i++;
        }
        if (posiadaneulepszacze === daneUlepszacz.ulepszacz.length) {
            if (miedziaki >= przedmiotDoUlepszenia.poziom_ulepszenia * 200) {
                setGotowyDoUlepszenia(true);
            }
            else {
                setMessage("Nie posiadasz wystarczającej liczby miedziaków!")
                setTimeout(() => {
                    setMessage(null);
                }, 2500);
            }
        }
        else {
            setMessage("Nie posiadasz wystarczającej liczby ulepszaczy!")
            setTimeout(() => {
                setMessage(null);
            }, 2500);
        }
    };

    const handleCancelUlepsz = () => {
        setGotowyDoUlepszenia(false);
    };

    const handlePrzeladuj = () => {
        window.location.reload();
    };

    const handleConfirmUlepsz = (przedmiot) => {
        const nazwaUzytkownika = nazwa;
        let i = 0;
        let ulepszacze = [];
        while (i < daneUlepszacz.ulepszacz.length) {
            ulepszacze[i] = daneUlepszacz.ulepszacz[i].id
            i++;
        }
        axios.post(`http://localhost:8081/ulepsz/${przedmiot}/${nazwaUzytkownika}`, { ulepszacze })
            .then(response => {
                setMessage(response.data.Message);
                setGotowyDoUlepszenia(null)
                setReload(false)
                setTimeout(() => {
                    setReload(true);
                }, 1000);
            })
            .catch(error => {
                console.error('Błąd pobierania danych przedmiotu:', error);
            });
    }

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

    const sprzawdzZaloz = (przedmiot) => {
        if (przedmiot.zalozone === 0) {
            return false
        }
        return true
    }

    if (reload) {
        return (
            <div className='Kowal'>
                <GorneMenu handleLogout={handleLogout} nazwa={nazwa} />

                <div id="kontener">
                    <LeweMenu />
                    <div id="prawyEkran">
                        <div id="zawartoscEkranu">
                            <div id="magazyn">
                                {[...Array(50)].map((_, index) => {
                                    if (index < daneMagazyn.przedmioty.length) {
                                        const przedmiot = daneMagazyn.przedmioty[index];
                                        const cenaSprzedazy = Math.floor(przedmiot.cena / 2);
                                        const rzadkosc = `${przedmiot.rzadkosc.toLowerCase()}`;
                                        return (
                                            <div id="przedmiot-container" key={index} >
                                                <div id="ikona" onClick={() => handleClickUlepsz(przedmiot)} className={sprzawdzZaloz(przedmiot) || przedmiot.typ === "Produkt" || przedmiot.poziom_ulepszenia === 9 ? 'zalozone' : ''}>
                                                    <img
                                                        src={przedmioty.find((item) => item.nazwa === przedmiot.ikona).url}
                                                        alt={`przedmiot`}
                                                    />
                                                </div>

                                                <div id={(index % 4 === 0 || index % 4 === 1) && index < 25 ? "opisLG" : (index % 4 === 0 || index % 4 === 1) && index >= 25 ? "opisLD" : index < 25 ? "opisPG" : "opisPD"} className={rzadkosc}>
                                                    <h2>{przedmiot.nazwa}</h2>

                                                    <div id={rzadkosc}>{przedmiot.rzadkosc}</div>
                                                    <hr></hr>
                                                    {przedmiot.typ === "Produkt" ? <div></div> : <div>Poziom ulepszenia: {przedmiot.poziom_ulepszenia}</div>}
                                                    {przedmiot.typ === "Produkt" ? <div></div> : <hr></hr>}
                                                    {przedmiot.obrazeniaMin ? <div>{przedmiot.obrazeniaMin}-{przedmiot.obrazeniaMax} Obrażenia</div> : <div></div>}
                                                    <div id="boxStatystyki">
                                                        {przedmiot.statystyki.sila ? <div id="itemStatystyka">+{przedmiot.statystyki.sila} Sila</div> : <div></div>}
                                                        {przedmiot.statystyki.zdrowie ? <div id="itemStatystyka">+{przedmiot.statystyki.zdrowie} Zdrowie</div> : <div></div>}
                                                        {przedmiot.statystyki.zwinnosc ? <div id="itemStatystyka">+{przedmiot.statystyki.zwinnosc} Zwinnosc</div> : <div></div>}
                                                        {przedmiot.statystyki.zrecznosc ? <div id="itemStatystyka">+{przedmiot.statystyki.zrecznosc} Zręczność</div> : <div></div>}
                                                        {przedmiot.statystyki.inteligencja ? <div id="itemStatystyka">+{przedmiot.statystyki.inteligencja} Inteligencja</div> : <div></div>}
                                                        {przedmiot.statystyki.pancerz ? <div id="itemStatystyka">+{przedmiot.statystyki.pancerz} Pancerz</div> : <div></div>}
                                                    </div>
                                                    {przedmiot.typ === "Produkt" ? <div></div> : <hr></hr>}
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
                            <div id="przedmiot">
                                {(message === "Nie posiadasz wystarczającej liczby miedziaków!" || message === "Nie posiadasz wystarczającej liczby ulepszaczy!") && (
                                    <div className="modalBrakUlepszaczy">
                                        <p>{message}</p>
                                    </div>

                                )}
                                {(message === "Ulepszenie nie powiodło się" || message === "Ulepszenie udane") && (
                                    <div className="overlay">
                                        <div className="modal">
                                            <p>{message}</p>
                                            <button id="nie" onClick={handlePrzeladuj}>Ok</button>
                                        </div>
                                    </div>
                                )}
                                {gotowyDoUlepszenia === true && (
                                    <div className="overlay">
                                        <div className="modal">
                                            <p>Czy na pewno chcesz ulepszyć przedmiot: {przedmiotDoUlepszenia.nazwa}? Ulepszenie może zakończyć się niepowodzeniem!</p>
                                            <button id="tak" onClick={() => handleConfirmUlepsz(przedmiotDoUlepszenia.nazwa)}>Tak</button>
                                            <button id="nie" onClick={handleCancelUlepsz}>Nie</button>
                                        </div>
                                    </div>
                                )}

                                <div id="przedmiot-container">
                                    <div id="ikona">
                                        <img
                                            src={przedmiotDoUlepszenia ? przedmioty[1].url : przedmioty[0].url}
                                            alt={`przedmiot`}
                                        />
                                    </div>
                                    {przedmiotDoUlepszenia && (
                                        <div id="opisLG" className={przedmiotDoUlepszenia.rzadkosc}>
                                            <h2>{przedmiotDoUlepszenia.nazwa}</h2>
                                            {przedmiotDoUlepszenia.zestaw != "brak" ? <div>Zestaw: {przedmiotDoUlepszenia.zestaw}</div> : <div></div>}
                                            <div id={przedmiotDoUlepszenia.rzadkosc}>{przedmiotDoUlepszenia.rzadkosc}</div>
                                            <hr></hr>
                                            <div>Poziom ulepszenia: {przedmiotDoUlepszenia.poziom_ulepszenia}</div>
                                            <hr></hr>
                                            {przedmiotDoUlepszenia.obrazeniaMin ? <div>{przedmiotDoUlepszenia.obrazeniaMin}-{przedmiotDoUlepszenia.obrazeniaMax} Obrażenia</div> : <div></div>}
                                            <div id="boxStatystyki">
                                                {przedmiotDoUlepszenia.sila ? <div id="itemStatystyka">+{przedmiotDoUlepszenia.sila} Sila</div> : <div></div>}
                                                {przedmiotDoUlepszenia.zdrowie ? <div id="itemStatystyka">+{przedmiotDoUlepszenia.zdrowie} Zdrowie</div> : <div></div>}
                                                {przedmiotDoUlepszenia.zwinnosc ? <div id="itemStatystyka">+{przedmiotDoUlepszenia.zwinnosc} Zwinnosc</div> : <div></div>}
                                                {przedmiotDoUlepszenia.zrecznosc ? <div id="itemStatystyka">+{przedmiotDoUlepszenia.zrecznosc} Zręczność</div> : <div></div>}
                                                {przedmiotDoUlepszenia.inteligencja ? <div id="itemStatystyka">+{przedmiotDoUlepszenia.inteligencja} Inteligencja</div> : <div></div>}
                                                {przedmiotDoUlepszenia.pancerz ? <div id="itemStatystyka">+{przedmiotDoUlepszenia.pancerz} Pancerz</div> : <div></div>}
                                            </div>
                                            <hr></hr>
                                            <div>Kupno: {przedmiotDoUlepszenia.cena}$ Sprzedaż: {przedmiotDoUlepszenia.cena / 2}$</div>
                                            <hr></hr>
                                            {przedmiotDoUlepszenia.poziom ? <div>Wymagany poziom: {przedmiotDoUlepszenia.poziom}</div> : <div></div>}
                                            <div>{przedmiotDoUlepszenia.typ}</div>
                                        </div>
                                    )}
                                </div>

                            </div>
                            <div id="ulepszenie">
                                <div id = "przezroczystosc">
                                <table>
                                    <tr>
                                        <td colspan="3" class="centered">{przedmiotDoUlepszenia ? "Ulepszenie na poziom " + przedmiotDoUlepszenia.poziom_ulepszenia : ""}</td>
                                    </tr>
                                    <tr>
                                        <td colspan="3">{przedmiotDoUlepszenia ? "Potrzebne przedmioty" : ""}</td>
                                    </tr>
                                    <tr>

                                        {daneUlepszacz && daneUlepszacz.ulepszacz && [...Array(3)].map((_, index) => {
                                            if (index < daneUlepszacz.ulepszacz.length) {
                                                const przedmiot = daneUlepszacz.ulepszacz[index];
                                                const cenaSprzedazy = Math.floor(przedmiot.cena / 2);
                                                const rzadkosc = `${przedmiot.rzadkosc.toLowerCase()}`;
                                                return (
                                                    <td>
                                                        <div id="przedmiot-container" key={index} style={{ width: 90 }}>
                                                            <div id="ikona">
                                                                <img
                                                                    src={przedmioty.find((item) => item.nazwa === przedmiot.ikona).url}
                                                                    alt={`przedmiot`}
                                                                />
                                                            </div>

                                                            <div id="opisPD" className={rzadkosc}>
                                                                <h2>{przedmiot.nazwa}</h2>
                                                                <div id={rzadkosc}>{przedmiot.rzadkosc}</div>
                                                                <hr></hr>
                                                                <div>Kupno: {przedmiot.cena}$ Sprzedaż: {cenaSprzedazy}$</div>
                                                                <hr></hr>
                                                                {przedmiot.poziom ? <div>Wymagany poziom: {przedmiot.poziom}</div> : <div></div>}
                                                                <div>{przedmiot.typ}</div>
                                                            </div>
                                                            {przedmiotDoUlepszenia.poziom_ulepszenia !== 1 ? <p className="ilosc">{przedmiotDoUlepszenia.poziom_ulepszenia}</p> : <p></p>}
                                                        </div>
                                                    </td>
                                                );
                                            } else {
                                                return (
                                                    <td>

                                                    </td>
                                                );
                                            }
                                        })}

                                    </tr>
                                    <tr>
                                        <td colspan="3">{przedmiotDoUlepszenia ? "Potrzebne miedziaki" : ""}</td>
                                    </tr>
                                    <tr>
                                        <td colspan="3">{przedmiotDoUlepszenia ? przedmiotDoUlepszenia.poziom_ulepszenia * 200 : ""}</td>
                                    </tr>
                                    <tr>
                                        <td colspan="3" class="centered">{przedmiotDoUlepszenia ? <button onClick={() => handleClickPotwierdz(przedmiotDoUlepszenia.poziom_ulepszenia)} id="ulepsz">Ulepsz</button> : ""}</td>
                                    </tr>
                                </table>
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


