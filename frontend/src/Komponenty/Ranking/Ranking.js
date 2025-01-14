import React, { useState, useEffect } from 'react'
import axios from 'axios';
import LeweMenu from '../Nawigacja/LeweMenu/LeweMenu'
import GorneMenu from '../Nawigacja/GorneMenu/GorneMenu'
import Stopka from '../Nawigacja/Stopka/Stopka'
import zdjecia from '../Wyglad/Zdjecia'
import Ladowanie from '../Ladowanie/Ladowanie'
import { Autoryzacja } from '../Autoryzacja/Autoryzacja'
import "./Ranking.css"


export default function Ranking() {

    const { autoryzacja, nazwa, handleLogout } = Autoryzacja();

    const [listaRanking, setListaRanking] = useState()
    const [postacID, setPostacID] = useState()
    const [reload, setReload] = useState(false);
    const [sortKolumn, setSortKolumn] = useState(0)
    const [sortKierunek, setSortKierunek] = useState(0)
    const [aktualnaStrona, setAktualnaStrona] = useState(0);
    const [ranking, setRanking] = useState({
        strona: [
            {
                pozycje: []
            }
        ]
    });


    useEffect(() => { // Pobranie rankingu
        if (nazwa) {
            const nazwaUzytkownika = nazwa;
            axios.get(`http://localhost:8081/ranking/${nazwaUzytkownika}`)
                .then(response => {
                    setListaRanking(response.data.Ranking)
                    setPostacID(response.data.PostacID);
                    dodajDoRankingu(response.data.Ranking, 0, response.data.PostacID)
                    setReload(true)
                })
                .catch(error => {
                    console.error('Błąd pobierania danych rankingu:', error);
                });
        }
    }, [nazwa]);

    function sekundyNaGodziny(czas) {
        const minuty = Math.floor(czas / 60);
        const godziny = Math.floor(minuty / 60);


        if (godziny === 0) {
            return Math.floor(minuty) + ' Minut';
        } else {
            return godziny + ' Godzin';
        }
    }

    function filtrDanych(kolumna) {
        ranking.strona = [];
        console.log("Tutaj 1")
        const nowaListaRanking = [...listaRanking];

        let sortKolumnPom = 0

        if (kolumna !== sortKolumn && sortKolumn !== 0) {
            setSortKierunek(0)

            nowaListaRanking.sort((a, b) => {
                if (a["poziom"] > b["poziom"]) return -1;
                if (a["poziom"] < b["poziom"]) return 1;
                return 0;
            })
            console.log("Tutaj 2")
            sortKolumnPom = 0
            setSortKolumn(sortKolumnPom)
            setAktualnaStrona(0);
            dodajDoRankingu(nowaListaRanking, sortKolumnPom, postacID)
            setListaRanking(nowaListaRanking);
        } else {
            let x = sortKierunek
            if (x === 0) {
                setSortKierunek("ASC")
                nowaListaRanking.sort((a, b) => {
                    if (a[kolumna] > b[kolumna]) return -1;
                    if (a[kolumna] < b[kolumna]) return 1;
                    return 0;
                });
                sortKolumnPom = kolumna
                setSortKolumn(sortKolumnPom)
                console.log("Tutaj 3")
            } else if (x === "ASC") {
                setSortKierunek("DESC")
                nowaListaRanking.sort((a, b) => {
                    if (a[kolumna] < b[kolumna]) return -1;
                    if (a[kolumna] > b[kolumna]) return 1;
                    return 0;
                });
                sortKolumnPom = kolumna
                setSortKolumn(sortKolumnPom)
            } else {
                console.log("Tutaj 4")
                setSortKierunek(0)
                nowaListaRanking.sort((a, b) => {
                    if (a["poziom"] > b["poziom"]) return -1;
                    if (a["poziom"] < b["poziom"]) return 1;
                    return 0;
                })
                sortKolumnPom = 0
                setSortKolumn(sortKolumnPom)
            }
            console.log("Tutaj 5")
            setAktualnaStrona(0);
            dodajDoRankingu(nowaListaRanking, sortKolumnPom, postacID)
            setListaRanking(nowaListaRanking)
        }
        console.log("Tutaj 6")
    }

    const maxIloscNaStronie = 15; // Maksymalna ilość elementów na stronie
    function dodajDoRankingu(x, kolumna, postacID) {

        if (ranking.strona.length === 0) {
            ranking.strona.push({ pozycje: [] });
        }
        let ostatniaStrona = ranking.strona[ranking.strona.length - 1];
        let aktualnaStronaPom = 0;
        x.forEach((pozycja, index) => {
            if (ostatniaStrona.pozycje.length < maxIloscNaStronie) {
                if(ostatniaStrona.pozycje.length === maxIloscNaStronie-1){
                    console.log(x[index+1])
                    if(x[index+1]&&x[index+1].id===postacID){
                        setAktualnaStrona(aktualnaStronaPom+1);
                    }
                }
                if ((pozycja.id === postacID) && (kolumna === 0)) {
                    setAktualnaStrona(aktualnaStronaPom);
                }
                ostatniaStrona.pozycje.push(pozycja);
            } else {
                ostatniaStrona = { pozycje: [pozycja] };
                ranking.strona.push(ostatniaStrona);
                aktualnaStronaPom = +1
            }
        });
    }


    function typSortowania() {
        return sortKolumn + sortKierunek
    }

    function stronaLewoMax() {
        setAktualnaStrona(0)
    }
    function stronaLewo() {
        setAktualnaStrona(aktualnaStrona - 1)
    }
    function stronaPrawoMax() {
        setAktualnaStrona(ranking.strona.length - 1)
    }
    function stronaPrawo() {
        setAktualnaStrona(aktualnaStrona + 1)
    }


    if (reload) {
        return (
            <div className='Ranking'>
                <GorneMenu handleLogout={handleLogout} nazwa={nazwa}/>

                <div id="kontener">
                    <LeweMenu />
                    <div id="prawyEkran">
                        <div id="zawartoscEkranu">
                            <div id="boxZawartosc">
                                <div className='boxKontener'>
                                    {listaRanking && listaRanking.length > 0 ? (
                                        <div className='borderTable'>
                                        <table className='boxTabelaRanking'>
                                            <thead>
                                                <tr>
                                                    <th className='komorkaTabeli'>Pozycja</th>
                                                    <th className='komorkaTabeli'>Wygląd</th>
                                                    <th className='komorkaTabeli'>Nazwa</th>
                                                    <th className='komorkaTabeli' onClick={() => filtrDanych("poziom")}><div className='wartosciSortujace'>Poziom {typSortowania() === "poziomASC" ? <div id="triangleA"></div> : ""}{typSortowania() === "poziomDESC" ? <div id="triangleD"></div> : ''}</div></th>
                                                    <th className='komorkaTabeli' onClick={() => filtrDanych("bilans")}><div className='wartosciSortujace'>Bilans pojedynkow {typSortowania() === "bilansASC" ? <div id="triangleA"></div> : ""}{typSortowania() === "bilansDESC" ? <div id="triangleD"></div> : ''}</div></th>
                                                    <th className='komorkaTabeli' onClick={() => filtrDanych("suma_czasu")}><div className='wartosciSortujace'>Przepracowane godziny {typSortowania() === "suma_czasuASC" ? <div id="triangleA"></div> : ""}{typSortowania() === "suma_czasuDESC" ? <div id="triangleD"></div> : ''}</div></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {/*ranking.strona[0].pozycje. */}
                                                {/*listaRanking */}
                                                {ranking.strona[aktualnaStrona].pozycje.map((postac, index) => (
                                                    <tr key={postac.id} className={`wierszTabeli ${postac.id === postacID ? 'twojWynik' : ''}`}>
                                                        <td>{index + 1 + aktualnaStrona * maxIloscNaStronie}</td>
                                                        <td>
                                                            <div className="boxObrazek">
                                                                <img src={zdjecia.find((item) => item.id === parseInt(postac.wyglad)).url} alt={postac.nazwa} />
                                                            </div>
                                                        </td>
                                                        <td>{postac.nazwa}</td>
                                                        <td>{postac.poziom}</td>
                                                        <td>{postac.bilans}</td>
                                                        <td>{sekundyNaGodziny(postac.suma_czasu)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        </div>
                                    ) : (
                                        <p>Brak danych do wyświetlenia</p>
                                    )}
                                    <div className='przejsciaStron'>
                                        {aktualnaStrona !== 0 ? <div className='boxStrzalka' onClick={() => stronaLewoMax()}>&laquo;</div> : ''}
                                        {aktualnaStrona !== 0 ? <div className='boxStrzalka' onClick={() => stronaLewo()}>&lt;</div> : ''}
                                        <div>{aktualnaStrona + 1}</div>
                                        {aktualnaStrona !== ranking.strona.length - 1 ? <div className='boxStrzalka' onClick={() => stronaPrawo()}>&gt;</div> : ''}
                                        {aktualnaStrona !== ranking.strona.length - 1 ? <div className='boxStrzalka' onClick={() => stronaPrawoMax()}>&raquo;</div> : ''}
                                    </div>
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


