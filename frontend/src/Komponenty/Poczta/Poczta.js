import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LeweMenu from '../Nawigacja/LeweMenu/LeweMenu';
import GorneMenu from '../Nawigacja/GorneMenu/GorneMenu';
import Stopka from '../Nawigacja/Stopka/Stopka';
import { Autoryzacja } from '../Autoryzacja/Autoryzacja';
import { format } from 'date-fns';
import axios from 'axios';
import nieodebrane from './nieodebrane.png'
import odebrane from './odebrane.png'
import wyslane from './wyslane.png'
import odpowiedz from './odpowiedz.png'
import './Poczta.css';


export default function Poczta() {
    const { autoryzacja, nazwa, handleLogout } = Autoryzacja();

    // Stan do śledzenia, czy wiersz jest rozwinięty czy nie
    const [rozwinietyWiersz, setRozwinietyWiersz] = useState({});


    // Funkcja do obsługi kliknięcia w wiersz
    const handleRowClick = (rowIndex) => {
        // Skopiowanie obecnych rozwiniętych wierszy
        const obecnieRozwinietyWiersz = { ...rozwinietyWiersz };

        // Jeśli wiersz jest obecnie rozwinięty, to go zwijamy (usuwamy z listy)
        if (obecnieRozwinietyWiersz[rowIndex]) {
            delete obecnieRozwinietyWiersz[rowIndex];
        } else {
            // W przeciwnym razie rozwijamy wiersz (dodajemy do listy)
            obecnieRozwinietyWiersz[rowIndex] = true;
            
            if(daneWiadomosci[rowIndex].odebrane == 0 && daneWiadomosci[rowIndex].o_nazwa == nazwa)
                {
                    axios.post(`http://localhost:8081/odebrany/${daneWiadomosci[rowIndex].id}`)
                    .then(res => {

                        if (res.data === "blad") {
                            console.log("Nie udało się zmienić stanu");
                        }
                    }
                    )
                    .catch(err => console.log(err));
                }
        }

        // Aktualizacja stanu
        setRozwinietyWiersz(obecnieRozwinietyWiersz);
    };

    const [daneWiadomosci, setDaneWiadomosci] = useState([]);

    useEffect(() => {
        if (nazwa) {
            // Funkcja do pobierania wiadomości na podstawie nazwy postaci (odbiorcy)
            fetch(`http://localhost:8081/wiadomosci/${nazwa}`)
                .then((response) => response.json())
                .then((data) => {
                    setDaneWiadomosci(data);
                })
                .catch((error) => {
                    console.error('Błąd podczas pobierania wiadomości:', error);
                });
        }
    }, [nazwa]); // Dodaj zależność, jeśli potrzebujesz odświeżyć dane po zmianie 'nazwa'


    return (
        <div className="Poczta">
            <GorneMenu handleLogout={handleLogout} />

            <div id="kontener">
                <LeweMenu />
                <div id="prawyEkran">
                    <div id="zawartoscEkranu">
                        <div className="wyborEkranu">
                            <Link to="/poczta" id="skrzynkaPocztowa">
                                Wiadomości
                            </Link>
                            <Link to="/wiadomosc" id="napiszWiadomosc">
                                Napisz wiadomość
                            </Link>
                        </div>
                        <div id="tresc">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Tytuł</th>
                                        <th></th>
                                        <th>Korespondencja</th>
                                        <th>Data otrzymania</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {daneWiadomosci.map((row, index) => (
                                        <React.Fragment key={index}>
                                            {/* Wyświetl dane wiadomości */}
                                            <tr
                                                className="rozwin"
                                                id={row.odebrane == 0 && row.o_nazwa == nazwa ? 'nieodczytane' : ''}
                                                onClick={() => handleRowClick(index)}
                                            >
                                                <td id="lewy">{row.tytul}</td>
                                                <td id="obraz">{
                                                    row.n_nazwa === nazwa ?
                                                    
                                                        <img src={wyslane} id="ikona"></img>
                                                    
                                                    : row.odebrane == 0 ?
                                                    <img src={nieodebrane} id="ikona"></img>
                                                    : <img src={odebrane} id="ikona"></img>
                                                }</td>
                                                <td id="srodek">{row.o_nazwa === nazwa ? row.n_nazwa : row.o_nazwa}</td>
                                                <td id="prawy">{format(new Date(row.data), "HH:mm:ss dd-MM-yyyy")}</td>
                                            </tr>

                                            {rozwinietyWiersz[index] && (
                                                <tr className="ukryte">
                                                    <td colSpan="3">
                                                        {row.tresc}
                                                    </td>
                                                    <td id="odpowiedz">
                                                        {row.o_nazwa === nazwa ?
                                                        <Link to={`/wiadomosc/${row.id}`}>
                                                        <img src={odpowiedz} id="odpowiedz_ikona"></img>
                                                        </Link>
                                                    : ''}
                                                    </td>
                                                </tr>
                                            )}
                                            <tr className='pusty'>

                                            </tr>
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            <Stopka />
        </div>
    );
}

