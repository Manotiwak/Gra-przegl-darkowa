import React, { useState, useEffect } from 'react'
import LeweMenu from '../Nawigacja/LeweMenu/LeweMenu'
import GorneMenu from '../Nawigacja/GorneMenu/GorneMenu'
import Stopka from '../Nawigacja/Stopka/Stopka'
import { Autoryzacja } from '../Autoryzacja/Autoryzacja'
import "./Zadania.css"
import kalendarz from './calendar.png'
import wykrzyknik from './warning.png'
import zapytajnik from './seal-question.png'
import Axios from 'axios';
import Ladowanie from '../Ladowanie/Ladowanie'
import przedmioty from '../Przedmioty/Przedmioty'


export default function Zadania() {

    const { autoryzacja, nazwa, handleLogout } = Autoryzacja();
    const [reload, setReload] = useState(false);

    const [zadanieGlowne, setZadanieGlowne] = useState(null);
    const [zadaniePoboczne, setZadaniePoboczne] = useState(null);
    const [zadanieDnia, setZadanieDnia] = useState(null);

    const odbierzNagrode = (id) => {
        if (nazwa) {
            const nazwaUzytkownika = nazwa;
            Axios.post(`http://localhost:8081/zakonczZadanie/${nazwaUzytkownika}/${id}`)
                .then(response => {
                    console.log("Ukończono zadanie: " + id);
                    if (response.data.Message === "Odebrano") {
                        window.location.reload()
                    }
                })
                .catch(error => {
                    console.error('Błąd odbioru:', error);
                });
        }
    };

    useEffect(() => {
        if (nazwa) {
            Axios.get(`http://localhost:8081/zadanie-glowne/${nazwa}`)
                .then((response) => {
                    setZadanieGlowne(response.data);

                })
                .catch((error) => {
                    console.error('Błąd podczas pobierania danych:', error);
                });
        }
    }, [nazwa]);

    useEffect(() => {
        if (nazwa) {
            Axios.get(`http://localhost:8081/zadanie-poboczne/${nazwa}`)
                .then((response) => {
                    setZadaniePoboczne(response.data);

                })
                .catch((error) => {
                    console.error('Błąd podczas pobierania danych:', error);
                });
        }
    }, [nazwa]);

    useEffect(() => {
        if (nazwa) {
            Axios.get(`http://localhost:8081/zadanie-dnia/${nazwa}`)
                .then((response) => {
                    setZadanieDnia(response.data);
                    setReload(true);
                })
                .catch((error) => {
                    console.error('Błąd podczas pobierania danych:', error);
                });
        }
    }, [nazwa]);

    if (reload) {
        return (
            <div className='Zadania'>
                <GorneMenu handleLogout={handleLogout} nazwa={nazwa} />

                <div id="kontener">
                    <LeweMenu />
                    <div id="prawyEkran">
                        <div id="zawartoscEkranu">
                            <div id="Kolumna">

                                <p id="Naglowek">Zadanie główne</p>

                                <img src={wykrzyknik} id="logo"></img>

                                {zadanieGlowne ? (
                                    <>
                                        <p id="Etap">Etap {zadanieGlowne.id}/30</p>
                                        <p id="Tytul">{zadanieGlowne.nazwa}</p>
                                        <p id="Tresc">{zadanieGlowne.tresc}</p>
                                        <p id="Tytul">Nagroda</p>
                                        <p>{zadanieGlowne.waluta ? (<>{zadanieGlowne.waluta}$ </>) : <></>} {zadanieGlowne.doswiadczenie ? (<>{zadanieGlowne.doswiadczenie}XP </>) : <></>}</p>
                                        {zadanieGlowne.prz_id !== null ? (
                                            <>
                                                <div id="przedmiot-container">
                                                    <div id="ikona">
                                                        <img
                                                            src={przedmioty.find((item) => item.nazwa === zadanieGlowne.prz_ikona).url}
                                                            alt={`przedmiot`}
                                                        />
                                                    </div>

                                                    <div id="opis" className={zadanieGlowne.prz_rzadkosc}>
                                                        <h2>{zadanieGlowne.prz_nazwa}</h2>

                                                        <div id={zadanieGlowne.prz_rzadkosc}>{zadanieGlowne.prz_rzadkosc}</div>
                                                        <hr></hr>
                                                        {zadanieGlowne.prz_typ === "Produkt" ? <div></div> : <div>Poziom ulepszenia: {zadanieGlowne.prz_poziom_ulepszenia}</div>}
                                                        {zadanieGlowne.prz_typ === "Produkt" ? <div></div> : <hr></hr>}
                                                        {zadanieGlowne.obrazeniaMin ? <div>{zadanieGlowne.obrazeniaMin}-{zadanieGlowne.obrazeniaMax} Obrażenia</div> : <div></div>}
                                                        <div id="boxStatystyki">
                                                            {zadanieGlowne.sila ? <div id="itemStatystyka">+{zadanieGlowne.sila} Sila</div> : <div></div>}
                                                            {zadanieGlowne.zdrowie ? <div id="itemStatystyka">+{zadanieGlowne.zdrowie} Zdrowie</div> : <div></div>}
                                                            {zadanieGlowne.zwinnosc ? <div id="itemStatystyka">+{zadanieGlowne.zwinnosc} Zwinnosc</div> : <div></div>}
                                                            {zadanieGlowne.zrecznosc ? <div id="itemStatystyka">+{zadanieGlowne.zrecznosc} Zręczność</div> : <div></div>}
                                                            {zadanieGlowne.inteligencja ? <div id="itemStatystyka">+{zadanieGlowne.inteligencja} Inteligencja</div> : <div></div>}
                                                            {zadanieGlowne.pancerz ? <div id="itemStatystyka">+{zadanieGlowne.pancerz} Pancerz</div> : <div></div>}
                                                        </div>
                                                        {zadanieGlowne.prz_typ === "Produkt" ? <div></div> : <hr></hr>}
                                                        <div>Kupno: {zadanieGlowne.prz_cena}$ Sprzedaż: {zadanieGlowne.prz_cena / 2}$</div>
                                                        <hr></hr>
                                                        {zadanieGlowne.prz_poziom ? <div>Wymagany poziom: {zadanieGlowne.prz_poziom}</div> : <div></div>}
                                                        <div>{zadanieGlowne.prz_typ}</div>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <p>&nbsp;</p>
                                        )}
                                        {zadanieGlowne.postep >= zadanieGlowne.wymagania ? (
                                            <button onClick={() => odbierzNagrode(zadanieGlowne.id)}>Odbierz nagrodę</button>
                                        ) : (
                                            <progress value={zadanieGlowne.postep} max={zadanieGlowne.wymagania}></progress>
                                        )
                                        }
                                    </>
                                ) : (
                                    <p>Ładowanie...</p>
                                )}

                            </div>
                            <div id="Kolumna">

                                <p id="Naglowek">Zadanie poboczne</p>

                                <img src={zapytajnik} id="logo"></img>


                                {zadaniePoboczne ? (
                                    <>
                                        <p id="Etap">Etap {zadaniePoboczne.id - 30}/90</p>
                                        <p id="Tytul">{zadaniePoboczne.nazwa}</p>
                                        <p id="Tresc">{zadaniePoboczne.tresc}</p>
                                        <p id="Tytul">Nagroda</p>
                                        <p>{zadaniePoboczne.waluta ? (<>{zadaniePoboczne.waluta}$ </>) : <></>} {zadaniePoboczne.doswiadczenie ? (<>{zadaniePoboczne.doswiadczenie}XP </>) : <></>}</p>
                                        {zadaniePoboczne.prz_id !== null ? (
                                            <>
                                                <div id="przedmiot-container">
                                                    <div id="ikona">
                                                        <img
                                                            src={przedmioty.find((item) => item.nazwa === zadaniePoboczne.prz_ikona).url}
                                                            alt={`przedmiot`}
                                                        />
                                                    </div>

                                                    <div id="opis" className={zadaniePoboczne.prz_rzadkosc}>
                                                        <h2>{zadaniePoboczne.prz_nazwa}</h2>

                                                        <div id={zadaniePoboczne.prz_rzadkosc}>{zadaniePoboczne.prz_rzadkosc}</div>
                                                        <hr></hr>
                                                        {zadaniePoboczne.prz_typ === "Produkt" ? <div></div> : <div>Poziom ulepszenia: {zadaniePoboczne.prz_poziom_ulepszenia}</div>}
                                                        {zadaniePoboczne.prz_typ === "Produkt" ? <div></div> : <hr></hr>}
                                                        {zadaniePoboczne.obrazeniaMin ? <div>{zadaniePoboczne.obrazeniaMin}-{zadaniePoboczne.obrazeniaMax} Obrażenia</div> : <div></div>}
                                                        <div id="boxStatystyki">
                                                            {zadaniePoboczne.sila ? <div id="itemStatystyka">+{zadaniePoboczne.sila} Sila</div> : <div></div>}
                                                            {zadaniePoboczne.zdrowie ? <div id="itemStatystyka">+{zadaniePoboczne.zdrowie} Zdrowie</div> : <div></div>}
                                                            {zadaniePoboczne.zwinnosc ? <div id="itemStatystyka">+{zadaniePoboczne.zwinnosc} Zwinnosc</div> : <div></div>}
                                                            {zadaniePoboczne.zrecznosc ? <div id="itemStatystyka">+{zadaniePoboczne.zrecznosc} Zręczność</div> : <div></div>}
                                                            {zadaniePoboczne.inteligencja ? <div id="itemStatystyka">+{zadaniePoboczne.inteligencja} Inteligencja</div> : <div></div>}
                                                            {zadaniePoboczne.pancerz ? <div id="itemStatystyka">+{zadaniePoboczne.pancerz} Pancerz</div> : <div></div>}
                                                        </div>
                                                        {zadaniePoboczne.prz_typ === "Produkt" ? <div></div> : <hr></hr>}
                                                        <div>Kupno: {zadaniePoboczne.prz_cena}$ Sprzedaż: {zadaniePoboczne.prz_cena / 2}$</div>
                                                        <hr></hr>
                                                        {zadaniePoboczne.prz_poziom ? <div>Wymagany poziom: {zadaniePoboczne.prz_poziom}</div> : <div></div>}
                                                        <div>{zadaniePoboczne.prz_typ}</div>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <p>&nbsp;</p>
                                        )}
                                        {zadaniePoboczne.postep >= zadaniePoboczne.wymagania ? (
                                            <button onClick={() => odbierzNagrode(zadaniePoboczne.id)}>Odbierz nagrodę</button>
                                        ) : (
                                            <progress value={zadaniePoboczne.postep} max={zadaniePoboczne.wymagania}></progress>
                                        )
                                        }
                                    </>
                                ) : (
                                    <p>Ładowanie...</p>
                                )}

                            </div>
                            <div id="Kolumna">

                                <p id="Naglowek">Zadanie codzienne</p>
                                <img src={kalendarz} id="logo"></img>
                                <p id="Etap">Zadanie nr {zadanieDnia.id - 120}</p>

                                {zadanieDnia ? (
                                    <>
                                        <p id="Tytul">{zadanieDnia.nazwa}</p>
                                        <p id="Tresc">{zadanieDnia.tresc}</p>
                                        <p id="Tytul">Nagroda</p>
                                        <p>{zadanieDnia.waluta ? (<>{zadanieDnia.waluta}$ </>) : <></>} {zadanieDnia.doswiadczenie ? (<>{zadanieDnia.doswiadczenie}XP </>) : <></>}</p>
                                        {zadanieDnia.prz_id !== null ? (
                                            <>

                                                <div id="przedmiot-container">
                                                    <div id="ikona">
                                                        <img
                                                            src={przedmioty.find((item) => item.nazwa === zadanieDnia.prz_ikona).url}
                                                            alt={`przedmiot`}
                                                        />
                                                    </div>

                                                    <div id="opis" className={zadanieDnia.prz_rzadkosc}>
                                                        <h2>{zadanieDnia.prz_nazwa}</h2>

                                                        <div id={zadanieDnia.prz_rzadkosc}>{zadanieDnia.prz_rzadkosc}</div>
                                                        <hr></hr>
                                                        {zadanieDnia.prz_typ === "Produkt" ? <div></div> : <div>Poziom ulepszenia: {zadanieDnia.prz_poziom_ulepszenia}</div>}
                                                        {zadanieDnia.prz_typ === "Produkt" ? <div></div> : <hr></hr>}
                                                        {zadanieDnia.obrazeniaMin ? <div>{zadanieDnia.obrazeniaMin}-{zadanieDnia.obrazeniaMax} Obrażenia</div> : <div></div>}
                                                        <div id="boxStatystyki">
                                                            {zadanieDnia.sila ? <div id="itemStatystyka">+{zadanieDnia.sila} Sila</div> : <div></div>}
                                                            {zadanieDnia.zdrowie ? <div id="itemStatystyka">+{zadanieDnia.zdrowie} Zdrowie</div> : <div></div>}
                                                            {zadanieDnia.zwinnosc ? <div id="itemStatystyka">+{zadanieDnia.zwinnosc} Zwinnosc</div> : <div></div>}
                                                            {zadanieDnia.zrecznosc ? <div id="itemStatystyka">+{zadanieDnia.zrecznosc} Zręczność</div> : <div></div>}
                                                            {zadanieDnia.inteligencja ? <div id="itemStatystyka">+{zadanieDnia.inteligencja} Inteligencja</div> : <div></div>}
                                                            {zadanieDnia.pancerz ? <div id="itemStatystyka">+{zadanieDnia.pancerz} Pancerz</div> : <div></div>}
                                                        </div>
                                                        {zadanieDnia.prz_typ === "Produkt" ? <div></div> : <hr></hr>}
                                                        <div>Kupno: {zadanieDnia.prz_cena}$ Sprzedaż: {zadanieDnia.prz_cena / 2}$</div>
                                                        <hr></hr>
                                                        {zadanieDnia.prz_poziom ? <div>Wymagany poziom: {zadanieDnia.prz_poziom}</div> : <div></div>}
                                                        <div>{zadanieDnia.prz_typ}</div>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <p>&nbsp;</p>
                                        )}
                                        {zadanieDnia.postep >= zadanieDnia.wymagania ? (
                                            <button onClick={() => odbierzNagrode(zadanieDnia.id)}>Odbierz nagrodę</button>
                                        ) : (
                                            <progress value={zadanieDnia.postep} max={zadanieDnia.wymagania}></progress>
                                        )
                                        }
                                    </>
                                ) : (
                                    <p>Ładowanie...</p>
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


