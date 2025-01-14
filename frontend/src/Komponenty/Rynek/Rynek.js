import React, { useState, useEffect } from 'react'
import axios from 'axios';
import LeweMenu from '../Nawigacja/LeweMenu/LeweMenu'
import GorneMenu from '../Nawigacja/GorneMenu/GorneMenu'
import Stopka from '../Nawigacja/Stopka/Stopka'
import { Autoryzacja } from '../Autoryzacja/Autoryzacja'
import Ladowanie from '../Ladowanie/Ladowanie'
import przedmioty from '../Przedmioty/Przedmioty'
import "./Rynek.css"
import WalidacjaSprzedaz from './WalidacjaSprzedaz'
import { Miedziaki } from '../Nawigacja/Miedziaki/Miedziaki'

export default function Rynek() {

    //Stan ogolny
    const { autoryzacja, nazwa, handleLogout } = Autoryzacja();
    const [reload, setReload] = useState(false);
    const [wybranyTryb, setWybranyTryb] = useState(true);
    const [postacID, setPostacID] = useState(null);
    const { miedziaki } = Miedziaki(nazwa);
    const [miedziakiRynek, setMiedziakiRynek] = useState();
    const [listaSprzedanych, setListaSprzedanych] = useState();
    const [odbierzMiedziaki, setOdbierzMiedziaki] = useState(0);

    //Stan sprzedaz
    const maxLiczbaNaRynku = 50;
    const [daneMagazyn, setDaneMagazyn] = useState([]);
    const [kliknietyPrzedmiot, setKliknietyPrzedmiot] = useState(null)
    const [errors, setErrors] = useState({})
    const [komunikatPrzepelnienia, setkomunikatPrzepelnienia] = useState(false)
    const [doOdebrania, setDoOdebrania] = useState();
    const [potwierdzenieDoOdebrania, setPotwierdzenieDoOdebrania] = useState(false)
    const [komunikatOdbioru, setKomunikatOdbioru] = useState(false);
    const [iloscPrzedmiotowNaRynku, setIloscPrzedmiotowNaRynku] = useState(false);
    const [formState, setFormState] = useState({
        cenaKupTeraz: '',
        cenaWywolawcza: '',
        ilosc: 1,
        liczbaDni: '',
    });

    //Stan zakup
    const [daneRynku, setDaneRynku] = useState([]);
    const [daneRynkuFiltr, setDaneRynkuFiltr] = useState([]);
    const [typFiltr, setTypFiltr] = useState(null);
    const [nazwaPoziomFiltr, setNazwaPoziomFiltr] = useState({})
    const [komunikatBrakuMiejsca, setKomunikatBrakuMiejsca] = useState(false)
    const [komunikatKupnaError, setKomunikatKupnaError] = useState(false)
    const [aktualnaStrona, setAktualnaStrona] = useState(0);
    const [ofertaLicytacji, setOfertaLicytacji] = useState(0);
    const [aktualnaData, setAktualnaData] = useState(new Date());
    const [kupnoPrzedmiotu, setKupnoPrzedmiotu] = useState(false);
    const [rynek, setRynek] = useState({
        strona: [
            {
                aukcje: []
            }
        ]
    });

    const handleInputChange = (e) => { // Aktualizacja danych w formularzu i ustawianie bledow
        const { name, value } = e.target;
        setFormState({ ...formState, [name]: value });
        setErrors({ ...errors, [name]: '' });
    };

    useEffect(() => { // Pobranie magazynu gracza
        if (daneRynku && nazwa) {
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
    }, [nazwa, doOdebrania, miedziakiRynek]);

    useEffect(() => { // Pobranie postacID gracza
        if (nazwa) {
            const nazwaUzytkownika = nazwa;
            axios.get(`http://localhost:8081/postacID/${nazwaUzytkownika}`)
                .then(response => {
                    setPostacID(response.data);
                    console.log(response.data)
                    setMiedziakiRynek(miedziaki)
                })
                .catch(error => {
                    console.error('Błąd pobierania danych postacID:', error);
                });
        }
    }, [nazwa, miedziaki]);


    useEffect(() => { // Pobranie przedmiotyDoOderbrania gracza
        if (postacID) {
            axios.get(`http://localhost:8081/przedmiotyDoOderbrania/${postacID}`)
                .then(response => {
                    setDoOdebrania(response.data.DoOdbioru);
                    setPotwierdzenieDoOdebrania(true);
                    setIloscPrzedmiotowNaRynku(response.data.IloscPrzedmiotowNaRynku)
                    setOdbierzMiedziaki(response.data.MiedziakiDoOdbioru)
                    setListaSprzedanych(response.data.ListaSprzedanych)
                    /*console.log("przedmioty do odebrania")
                    console.log(response.data.DoOdbioru)*/
                    if (response.data.DoOdbioru.length !== 0) {
                        //console.log("Odbierz")
                        setKomunikatOdbioru(true)
                    }
                })
                .catch(error => {
                    console.error('Błąd pobierania danych o przedmiotach do odebrania:', error);
                });
        }
    }, [postacID]);



    useEffect(() => { // Pobranie rynku 
        if (nazwa && postacID && potwierdzenieDoOdebrania) {
            axios.get(`http://localhost:8081/rynek`)
                .then(response => {
                    setDaneRynku(prev => ({ ...prev, ...response.data.Rynek }));
                    setDaneRynkuFiltr(prev => ({ ...prev, ...response.data.Rynek }));
                    console.log(response.data.Rynek)
                    setReload(true);
                })
                .catch(error => {
                    console.error('Błąd pobierania danych rynku:', error);
                });
        }
    }, [nazwa, postacID, potwierdzenieDoOdebrania]);

    /*useEffect(() => {
        console.log("Nowy stan miedziaków:", miedziakiRynek);
      }, [miedziakiRynek]);*/


    useEffect(() => { // Aktualzacja stanu rynku co 5s
        const timerReloadRynek = setInterval(() => {
            axios.get(`http://localhost:8081/rynek`)
                .then(response => {
                    setDaneRynku(response.data.Rynek);
                    setDaneRynkuFiltr(response.data.Rynek);
                    filtrujDane(typFiltr, nazwaPoziomFiltr.nazwa, nazwaPoziomFiltr.poziom, response.data.Rynek)
                })
                .catch(error => {
                    console.error('Błąd pobierania danych rynku:', error);
                });
        }, 5000);
        return () => {
            clearInterval(timerReloadRynek);
        };
    }, [typFiltr, nazwaPoziomFiltr]);

    useEffect(() => {
        if (reload) {
            filtrujDane(null, null, null, daneRynku)
        }

    }, [reload])

    useEffect(() => {
        const timer = setInterval(() => {
            setAktualnaData(new Date());
        }, 1000);

        return () => {
            clearInterval(timer);
        };
    }, []);


    const sprzawdzZaloz = (przedmiot) => { // sprawdzenie czy zalozony przedmiot
        if (przedmiot.zalozone === 0) {
            return false
        }
        return true
    }

    function sprawdzWartosci() { // sprawdzenie czy podane ilosc sa zgodne z magazynem
        if (kliknietyPrzedmiot.ilosc >= formState.ilosc) {
            if (formState.cenaKupTeraz || formState.cenaWywolawcza) {
                if (!formState.cenaKupTeraz || (formState.ilosc * (kliknietyPrzedmiot.cena / 2) <= formState.cenaKupTeraz)) {
                    if (!formState.cenaWywolawcza || (formState.ilosc * (kliknietyPrzedmiot.cena / 2) <= formState.cenaWywolawcza)) {
                        return true
                    }
                }
            }
        }
        return false
    }

    const handleSubmit = (event) => { // Wystawianie przedmiotu
        event.preventDefault();
        setErrors(WalidacjaSprzedaz(formState))
        const wartosci = sprawdzWartosci()
        if (iloscPrzedmiotowNaRynku >= maxLiczbaNaRynku && !komunikatPrzepelnienia) {
            setkomunikatPrzepelnienia(true)
        }

        if (WalidacjaSprzedaz(formState) === "Powodzenie" && wartosci && miedziakiRynek >= obliczPodatek() && iloscPrzedmiotowNaRynku < maxLiczbaNaRynku) {
            const wybraneDane = [
                formState,
                kliknietyPrzedmiot,
                obliczPodatek()
            ];
            if (nazwa) {
                axios.post(`http://localhost:8081/wystawPrzedmiot/${nazwa}`, wybraneDane)
                    .then(res => {
                        console.log("wystawianie przedmiotu")
                        window.location.reload();
                    }
                    )
                    .catch(err => console.log(err));
            }
        }
        if (iloscPrzedmiotowNaRynku >= maxLiczbaNaRynku && !komunikatPrzepelnienia) {
            const czasTrwania = 3000;
            const timer = setTimeout(() => {
                setkomunikatPrzepelnienia(false);
            }, czasTrwania);
            return () => {
                clearTimeout(timer);
            };
        }
    }

    function wyborPola(n) { // Wybor przedmiotu/produktu do sprzedazy
        setFormState({
            cenaKupTeraz: '',
            cenaWywolawcza: '',
            ilosc: 1,
            liczbaDni: '',
        });
        setErrors('')
        if (n === null) {
            setKliknietyPrzedmiot(n)
        }
        else {
            if (!sprzawdzZaloz(n)) {
                setKliknietyPrzedmiot(n)
            }
        }
    }


    function wyborFiltru(n) {
        setAktualnaStrona(0)
        if (typFiltr === n) {
            setTypFiltr(null)
            n = null
        } else {
            setTypFiltr(n)
        }
        filtrujDane(n, nazwaPoziomFiltr.nazwa, nazwaPoziomFiltr.poziom, daneRynku)
    }

    const handleFiltrInputChange = (e) => { // Aktualizacja danych w formularzu i ustawianie bledow
        setAktualnaStrona(0)
        const { name, value } = e.target;
        setNazwaPoziomFiltr({ ...nazwaPoziomFiltr, [name]: value });
        if (name === 'nazwa') {
            filtrujDane(typFiltr, value, nazwaPoziomFiltr.poziom, daneRynku)
        }
        if (name === 'poziom') {
            filtrujDane(typFiltr, nazwaPoziomFiltr.nazwa, value, daneRynku)
        }
    };


    function filtrujDane(xTyp, xNazwa, xPoziom, xDane) {
        rynek.strona = [];
        const aukcjeFiltr = xDane.aukcje
            .filter(item => {
                const filtrNazwy = xNazwa ? item.nazwa.toLowerCase().includes(xNazwa.toLowerCase()) : true;
                const filtrPoziom = xPoziom ? item.poziom === parseInt(xPoziom) : true;
                const filtrTypu = xTyp ? item.typ === xTyp : true;
                return filtrNazwy && filtrTypu && filtrPoziom
            })
            .map(item => ({ ...item }));
        setDaneRynkuFiltr({ ...xDane, aukcje: aukcjeFiltr });
        dodajDoRynku(aukcjeFiltr);
    }

    function obliczPodatek() {
        let podatekOdDni;
        const dniOplata = {
            '7d': 1.07,
            '6d': 1.06,
            '5d': 1.05,
            '4d': 1.04,
            '3d': 1.03,
            '2d': 1.02,
            '1d': 1.01,
        };
        podatekOdDni = dniOplata[formState.liczbaDni] || 1;

        if (formState.cenaKupTeraz !== '' && formState.cenaWywolawcza !== '') {
            return Math.ceil((formState.cenaWywolawcza * 0.05) * podatekOdDni)
        }
        else if (formState.cenaWywolawcza === '') {
            return Math.ceil((formState.cenaKupTeraz * 0.05) * podatekOdDni)
        } else {
            return Math.ceil((formState.cenaWywolawcza * 0.05) * podatekOdDni)
        }
    }

    function dodajDoRynku(aukcjeFiltr) {
        const maxIloscNaStronie = 5; // Maksymalna ilość elementów na stronie

        if (rynek.strona.length === 0) {
            rynek.strona.push({ aukcje: [] });
        }

        let ostatniaStrona = rynek.strona[rynek.strona.length - 1];

        aukcjeFiltr.forEach((aukcja, index) => {
            if (ostatniaStrona.aukcje.length < maxIloscNaStronie) {
                ostatniaStrona.aukcje.push(aukcja);
            } else {
                ostatniaStrona = { aukcje: [aukcja] };
                rynek.strona.push(ostatniaStrona);
            }
        });
    }

    function czasDoKonca(koniec) {
        const dataKoniec = new Date(koniec);
        const czasDoKonca = dataKoniec - aktualnaData;
        const ileSekund = Math.floor(czasDoKonca / 1000); // Na sekundy
        const ileDni = Math.floor(ileSekund / (60 * 60 * 24));
        const resztaSekund = ileSekund % (60 * 60 * 24);
        const ileGodzin = Math.floor(resztaSekund / (60 * 60));
        const resztaSekund2 = resztaSekund % (60 * 60);
        const ileMinut = Math.floor(resztaSekund2 / 60);
        const ileS = resztaSekund2 % 60;
        if (ileDni === 1) {
            return `${ileDni} dzień`;
        }
        else if (ileDni > 1) {
            return `${ileDni} dni`;
        } else if (ileGodzin > 0) {
            return `${ileGodzin} godzin`;
        } else if (ileMinut > 0) {
            return `${ileMinut} minut`;
        }
        else if (ileSekund > 0) {
            return `${ileSekund} sekund`;
        }
        else {
            return 'Zakończono'
        }
    }



    function odbierzPrzedmiot(przedmiot) {
        const danePrzesylowe = {
            postacID: postacID,
            ilosc: przedmiot.ilosc,
            przedmiot_id: przedmiot.Przedmiot_id,
            typ: przedmiot.typ,
            rynekID: przedmiot.rID,
            kupujacyID: przedmiot.kID,
            sprzedajacyID: przedmiot.sID,
        }
        if (daneMagazyn.przedmioty.length < 50) {
            axios.post(`http://localhost:8081/odbierzPrzedmiot`, danePrzesylowe)
                .then(res => {
                    if (res.data === 'BrakMiejsca') {
                        console.log("Brak miejsca")
                        setKomunikatBrakuMiejsca(true)
                    } else {
                        console.log("Odebrano przedmiot")
                        setIloscPrzedmiotowNaRynku(iloscPrzedmiotowNaRynku - 1);
                        setDoOdebrania(prevStan => prevStan.filter(item => item.rID !== przedmiot.rID));
                    }
                }
                )
                .catch(err => console.log(err));
        } else {
            setKomunikatBrakuMiejsca(true);
        }
    }

    useEffect(() => {
        if (komunikatBrakuMiejsca) {
            const czasTrwania = 1100;
            const timer = setTimeout(() => {
                setKomunikatBrakuMiejsca(false)
            }, czasTrwania);
            return () => {
                clearTimeout(timer);
            };
        }
    }, [komunikatBrakuMiejsca]);


    function cenaMinimalna(item) {
        if (item !== false) {
            if (item.kupujacy_id === null) {
                if (item.oferta === null) {
                    return item.kup_teraz
                }
                return item.oferta
            }
            else {
                return item.oferta + 1
            }
        }
        return 0
    }

    function oknoZakupu(item) {
        setOfertaLicytacji(cenaMinimalna(item))
        setKupnoPrzedmiotu(item);
    }

    function przyciskOK() {
        setMiedziakiRynek(miedziakiRynek + odbierzMiedziaki)
        setOdbierzMiedziaki(0)
    }


    function kupPrzedmiotu(item) {
        if (ofertaLicytacji >= cenaMinimalna(item)) {
            if ((ofertaLicytacji >= item.kup_teraz) && item.kup_teraz) {
                console.log("Kupujesz teraz")
                setOfertaLicytacji(item.kup_teraz)
            }
            const danePrzesylowe = [
                postacID,
                item,
                ofertaLicytacji,
            ]
            axios.post(`http://localhost:8081/kupPrzedmiot`, danePrzesylowe)
                .then(res => {
                    if (res.data.StanMiedziaki) {
                        setMiedziakiRynek(miedziakiRynek - res.data.StanMiedziaki)
                        console.log(miedziakiRynek - res.data.StanMiedziaki)
                    }
                    console.log("Request kup przedmiot")
                    setKupnoPrzedmiotu(false);
                })
        }
    }

    function stronaLewoMax() {
        setAktualnaStrona(0)
    }
    function stronaLewo() {
        setAktualnaStrona(aktualnaStrona - 1)
    }
    function stronaPrawoMax() {
        setAktualnaStrona(rynek.strona.length - 1)
    }
    function stronaPrawo() {
        setAktualnaStrona(aktualnaStrona + 1)
    }


    if (reload) {
        return (
            <div className='Rynek'>
                <GorneMenu handleLogout={handleLogout} nazwa={nazwa} nowyStanMiedziaki={miedziakiRynek} />
                <div id="kontener">
                    <LeweMenu />
                    <div id="prawyEkran">
                        <div id="zawartoscEkranu">
                            <div id="boxZawartosc">
                                <div className='boxKontener'>
                                    <div className='boxPrzyciski'>
                                        <div className={`boxPrzyciskZakup ${wybranyTryb ? 'aktywny' : ''}`} onClick={() => setWybranyTryb(true)}>
                                            Zakup
                                        </div>
                                        <div className={`boxPrzyciskSprzedaz ${!wybranyTryb ? 'aktywny' : ''}`} onClick={() => setWybranyTryb(false)}>
                                            Sprzedaż
                                        </div>
                                    </div>
                                    {komunikatBrakuMiejsca ? <div>
                                        <div className='boxBrakMiejscaAlert'>
                                            <div className="BrakMiejscaAlert">
                                                Brak miejsca w magazynie
                                            </div></div>
                                    </div> : ''}

                                    {odbierzMiedziaki !== 0 ? <div>
                                        <div className='boxObierzMiedziaki'>
                                            <div className="OdbierzMiedziaki">
                                                <div className='flexBoxColumn Center'>
                                                    <div className='napisTytulKomunikatu'>Sprzedano nastepujące przedmioty:</div>
                                                    <div className='flexBoxRow'>{listaSprzedanych &&
                                                        listaSprzedanych
                                                            .map(item => (item.ilosc > 1 ? `(${item.ilosc})${item.nazwa} za ${item.cena}` : `${item.nazwa} za ${item.cena}`))
                                                            .join(', ')}
                                                    </div>
                                                    <div>Zasilono twoje konto o {odbierzMiedziaki} Miedziakow</div>
                                                    <div className='przyciskPomin' onClick={() => przyciskOK()}>OK</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div> : ''}

                                    {kupnoPrzedmiotu ? (
                                        <div>
                                            <div className='tloZakupu'>
                                                <div className="boxZakupu" id='boxZakupu'>
                                                    <div className='wyjscieZzakupu' onClick={() => oknoZakupu(false)}>x</div>
                                                    {kupnoPrzedmiotu.oferta > 0 ? (
                                                        <div className='flexBoxColumn Center'>
                                                            <div className='flexBoxRow'>
                                                                Podaj ofertę:
                                                                <input
                                                                    type="text"
                                                                    value={ofertaLicytacji}
                                                                    onChange={(e) => setOfertaLicytacji(e.target.value)}
                                                                />
                                                                {kupnoPrzedmiotu.kup_teraz ? (
                                                                    <div className='flexBoxRow'>
                                                                        lub kup teraz za
                                                                        <div
                                                                            className='boxCenaKupTeraz'
                                                                            onClick={() => setOfertaLicytacji(kupnoPrzedmiotu.kup_teraz)}
                                                                        >
                                                                            {'('}{kupnoPrzedmiotu.kup_teraz}{')'}
                                                                        </div>
                                                                    </div>
                                                                ) : ''}
                                                            </div>
                                                            <div className='boxPrzyciskKupna'>
                                                                <div className={`${(ofertaLicytacji < cenaMinimalna(kupnoPrzedmiotu)) ? 'przyciskKupnaBlokada' : 'przyciskKupna'}`} onClick={() => kupPrzedmiotu(kupnoPrzedmiotu)}>
                                                                    {(ofertaLicytacji >= kupnoPrzedmiotu.kup_teraz && kupnoPrzedmiotu.kup_teraz) ?
                                                                        'Kup Teraz' : 'Złóż ofertę'
                                                                    }
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className='flexBoxColumn Center'>
                                                            <div className='flexBoxRow'>
                                                                Czy na pewno chcesz kupić {(kupnoPrzedmiotu.ilosc > 1 ? '(' + kupnoPrzedmiotu.ilosc + ')' : '')}
                                                                {kupnoPrzedmiotu.nazwa} za {kupnoPrzedmiotu.kup_teraz} Miedźiaków
                                                            </div>
                                                            <div className='boxPrzyciskKupna'>
                                                                <div className='przyciskKupna' onClick={() => kupPrzedmiotu(kupnoPrzedmiotu)}>Kup teraz</div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ) : ''}
                                    <div className='boxGlowny'>
                                        {
                                            wybranyTryb ?
                                                (
                                                    <div className='boxRynek'>
                                                        {doOdebrania.length !== 0 && komunikatOdbioru && odbierzMiedziaki===0 ?
                                                            <div className="tloOdbioru">
                                                                <div className="srodekOdbioru" style={{
                                                                    maxWidth: `${Math.min(Math.max((doOdebrania.length) * 11, 50), 99)}%`
                                                                }}>
                                                                    <div className='komunikatOdbioru'>
                                                                        <div className='napisKomunikatu'>Odbierz przedmioty z rynku</div>
                                                                        <div className={`listaPrzedmiotow ${doOdebrania.length > 4 ? 'duzoDoOdbioru' : ''}`}>
                                                                            {doOdebrania.map((przedmiot) => (

                                                                                <div className='przedmiotDoOdbioru' key={przedmiot.rID}>
                                                                                    <div id="ikona" >
                                                                                        <img onClick={() => odbierzPrzedmiot(przedmiot)}
                                                                                            src={przedmioty.find((x) => x.nazwa === przedmiot.ikona).url}
                                                                                            alt={`przedmiot`}
                                                                                        />

                                                                                        <div className={`${przedmiot.kID === null ? 'nieSprzedany' : 'Kupiony'} `}>{przedmiot.typ === 'Produkt' ? '(' + przedmiot.ilosc + ')' : ''} {przedmiot.nazwa}</div>
                                                                                    </div>
                                                                                </div>

                                                                            ))}
                                                                        </div>
                                                                        <div className='boxPrzyciskPomin'><div className='przyciskPomin' onClick={() => setKomunikatOdbioru(false)}>Pomiń</div></div>
                                                                    </div>
                                                                </div>
                                                            </div> : ''}
                                                        <div className='boxFiltry'>
                                                            <div className="boxFiltrWybor">
                                                                <div className={`boxWybor ${typFiltr === 'Hełm' ? 'wybrany' : ''}`} onClick={() => wyborFiltru('Hełm')}>
                                                                    Hełm
                                                                </div>
                                                                <div className={`boxWybor ${typFiltr === 'Naszyjnik' ? 'wybrany' : ''}`} onClick={() => wyborFiltru('Naszyjnik')}>
                                                                    Naszyjnik
                                                                </div>
                                                                <div className={`boxWybor ${typFiltr === 'Odzież' ? 'wybrany' : ''}`} onClick={() => wyborFiltru('Odzież')}>
                                                                    Odzież
                                                                </div>
                                                                <div className={`boxWybor ${typFiltr === 'Rękawice' ? 'wybrany' : ''}`} onClick={() => wyborFiltru('Rękawice')}>
                                                                    Rękawice
                                                                </div>
                                                                <div className={`boxWybor ${typFiltr === 'Pas' ? 'wybrany' : ''}`} onClick={() => wyborFiltru('Pas')}>
                                                                    Pas
                                                                </div>
                                                                <div className={`boxWybor ${typFiltr === 'Spodnie' ? 'wybrany' : ''}`} onClick={() => wyborFiltru('Spodnie')}>
                                                                    Spodnie
                                                                </div>
                                                                <div className={`boxWybor ${typFiltr === 'Buty' ? 'wybrany' : ''}`} onClick={() => wyborFiltru('Buty')}>
                                                                    Buty
                                                                </div>
                                                                <div className={`boxWybor ${typFiltr === 'Bron' ? 'wybrany' : ''}`} onClick={() => wyborFiltru('Bron')}>
                                                                    Bron
                                                                </div>
                                                                <div className={`boxWybor ${typFiltr === 'Narzędzie' ? 'wybrany' : ''}`} onClick={() => wyborFiltru('Narzędzie')}>
                                                                    Narzędzie
                                                                </div>
                                                                <div className={`boxWybor ${typFiltr === 'Zwierze' ? 'wybrany' : ''}`} onClick={() => wyborFiltru('Zwierze')}>
                                                                    Zwierze
                                                                </div>
                                                                <div className={`boxWybor ${typFiltr === 'Produkt' ? 'wybrany' : ''}`} onClick={() => wyborFiltru('Produkt')}>
                                                                    Produkt
                                                                </div>
                                                                <div className='boxFiltrWpisz'>
                                                                    <div>Nazwa</div>
                                                                    <input type="text" name='nazwa' value={nazwaPoziomFiltr.nazwa} onChange={handleFiltrInputChange}>
                                                                    </input>
                                                                    <div>Poziom</div>
                                                                    <input type="text" name='poziom' value={nazwaPoziomFiltr.poziom} onChange={handleFiltrInputChange}>
                                                                    </input>
                                                                </div>
                                                            </div>

                                                        </div>
                                                        <div className='boxRynekPrawy'>
                                                            <table className='boxTabelaRynek'>
                                                                <thead>
                                                                    <tr>
                                                                        <th className='komorkaTabeli'></th>
                                                                        <th className='komorkaTabeli'>Nazwa</th>
                                                                        <th className='komorkaTabeli'>Poziom</th>
                                                                        <th className='komorkaTabeli'>Kup teraz</th>
                                                                        <th className='komorkaTabeli'>Oferta</th>
                                                                        <th className='komorkaTabeli'>Ilość</th>
                                                                        <th className='komorkaTabeli'>Koniec za</th>
                                                                        <th className='komorkaTabeli przyciskKupnaTabela'></th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {daneRynkuFiltr && rynek && rynek.strona[aktualnaStrona] ? (

                                                                        rynek.strona[aktualnaStrona].aukcje.map((item, index) => (
                                                                            <tr key={item.rID} className="wierszTabeli">
                                                                                <td className='komorkaTabeli'>


                                                                                    <div id="przedmiot-container">
                                                                                        <div id="ikona">
                                                                                            <img
                                                                                                src={przedmioty.find((x) => x.nazwa === item.ikona).url}
                                                                                                alt={`przedmiot`}
                                                                                            />
                                                                                        </div>
                                                                                        <div id={(index % 5 === 0 || index % 5 === 1 || index % 5 === 2) ? "opisLG" : "opisLD"} className={`${item.rzadkosc.toLowerCase()}`}>
                                                                                            <h2>{item.nazwa}</h2>
                                                                                            {item.zestaw !== "brak" ? <div>Zestaw: {item.zestaw}</div> : <div></div>}
                                                                                            <div id={`${item.rzadkosc.toLowerCase()}`}>{item.rzadkosc}</div>
                                                                                            <hr></hr>
                                                                                            {item.typ !== 'Produkt' ? (<div>Poziom ulepszenia: {item.poziom_ulepszenia}<hr></hr></div>) : ''}

                                                                                            {item.obrazeniaMin ? <div>{item.obrazeniaMin}-{item.obrazeniaMax} Obrażenia</div> : <div></div>}
                                                                                            <div id="boxStatystyki">
                                                                                                {item.sila ? <div id="itemStatystyka">+{item.sila} Sila</div> : <div></div>}
                                                                                                {item.zdrowie ? <div id="itemStatystyka">+{item.zdrowie} Zdrowie</div> : <div></div>}
                                                                                                {item.zwinnosc ? <div id="itemStatystyka">+{item.zwinnosc} Zwinnosc</div> : <div></div>}
                                                                                                {item.zrecznosc ? <div id="itemStatystyka">+{item.zrecznosc} Zręczność</div> : <div></div>}
                                                                                                {item.inteligencja ? <div id="itemStatystyka">+{item.inteligencja} Inteligencja</div> : <div></div>}
                                                                                                {item.pancerz ? <div id="itemStatystyka">+{item.pancerz} Pancerz</div> : <div></div>}
                                                                                            </div>
                                                                                            {item.typ !== 'Produkt' ? (<div><hr></hr></div>) : ''}
                                                                                            <div>Kupno: {item.cena}$ Sprzedaż: {item.cena / 2}$</div>
                                                                                            <hr></hr>
                                                                                            {item.poziom ? <div>Wymagany poziom: {item.poziom}</div> : <div></div>}
                                                                                            <div>{item.typ}</div>
                                                                                        </div>
                                                                                    </div>






                                                                                </td>
                                                                                <td className={`komorkaTabeli ${postacID === item.sprzedajacy_id ? 'twojPrzedmiot' : ''}`}>{item.nazwa}</td>
                                                                                <td className={`komorkaTabeli ${postacID === item.sprzedajacy_id ? 'twojPrzedmiot' : ''}`}>{item.poziom}</td>
                                                                                <td className={`komorkaTabeli ${postacID === item.sprzedajacy_id ? 'twojPrzedmiot' : ''}`}>{item.kup_teraz}</td>
                                                                                <td className={`komorkaTabeli ${postacID === item.sprzedajacy_id ? 'twojPrzedmiot' : ''} ${postacID === item.kupujacy_id ? 'twojaAktualnaOferta' : ''}`}>{item.oferta}</td>
                                                                                <td className={`komorkaTabeli ${postacID === item.sprzedajacy_id ? 'twojPrzedmiot' : ''}`}>{item.ilosc}</td>
                                                                                <td className={`komorkaTabeli ${postacID === item.sprzedajacy_id ? 'twojPrzedmiot' : ''}`}>{czasDoKonca(item.koniec)}</td>
                                                                                {czasDoKonca(item.koniec) !== "Zakończono" && item.sprzedajacy_id !== postacID ? (
                                                                                    <td className='komorkaTabeli'>{item.oferta ? <div className='przyciskKupna' onClick={() => oknoZakupu(item)}>Licytuj</div> : <div className='przyciskKupna' onClick={() => oknoZakupu(item)}>Kup</div>}</td>
                                                                                ) : (<td className='komorkaTabeli'></td>)}
                                                                            </tr>))) : ''
                                                                    }

                                                                </tbody>
                                                            </table>
                                                            <div className='przejsciaStron'>
                                                                {aktualnaStrona !== 0 ? <div className='boxStrzalka' onClick={() => stronaLewoMax()}>&laquo;</div> : ''}
                                                                {aktualnaStrona !== 0 ? <div className='boxStrzalka' onClick={() => stronaLewo()}>&lt;</div> : ''}
                                                                <div>{aktualnaStrona + 1}</div>
                                                                {aktualnaStrona !== rynek.strona.length - 1 ? <div className='boxStrzalka' onClick={() => stronaPrawo()}>&gt;</div> : ''}
                                                                {aktualnaStrona !== rynek.strona.length - 1 ? <div className='boxStrzalka' onClick={() => stronaPrawoMax()}>&raquo;</div> : ''}
                                                            </div>
                                                        </div>

                                                    </div>
                                                )
                                                :
                                                (<div className='boxSprzedaz'>
                                                    <div className='boxLewy'>
                                                        <div className='boxMagazyn'>
                                                            <div id="magazyn">
                                                                {[...Array(50)].map((_, index) => {
                                                                    if (index < daneMagazyn.przedmioty.length) {
                                                                        const przedmiot = daneMagazyn.przedmioty[index];
                                                                        const cenaSprzedazy = Math.floor(przedmiot.cena / 2);
                                                                        const rzadkosc = `${przedmiot.rzadkosc.toLowerCase()}`;
                                                                        return (
                                                                            <div id="przedmiot-container" key={index} >
                                                                                <div id="ikona" className={sprzawdzZaloz(przedmiot) ? 'zalozone' : ''} onClick={() => wyborPola(przedmiot)}>
                                                                                    <img
                                                                                        src={przedmioty.find((item) => item.nazwa === przedmiot.ikona).url}
                                                                                        alt={`przedmiot`}
                                                                                    />
                                                                                </div>
                                                                                <div id={(index % 4 === 0 || index % 4 === 1) && index < 25 ? "opisLG" : (index % 4 === 0 || index % 4 === 1) && index >= 25 ? "opisLD" : index < 25 ? "opisPG" : "opisPD"} className={rzadkosc}>
                                                                                    <h2>{przedmiot.nazwa}</h2>
                                                                                    {przedmiot.zestaw !== "brak" ? <div>Zestaw: {przedmiot.zestaw}</div> : <div></div>}
                                                                                    <div id={rzadkosc}>{przedmiot.rzadkosc}</div>
                                                                                    <hr></hr>
                                                                                    {przedmiot.typ !== 'Produkt' ? (<div>Poziom ulepszenia: {przedmiot.poziom_ulepszenia}<hr></hr></div>) : ''}

                                                                                    {przedmiot.obrazeniaMin ? <div>{przedmiot.obrazeniaMin}-{przedmiot.obrazeniaMax} Obrażenia</div> : <div></div>}
                                                                                    <div id="boxStatystyki">
                                                                                        {przedmiot.statystyki.sila ? <div id="itemStatystyka">+{przedmiot.statystyki.sila} Sila</div> : <div></div>}
                                                                                        {przedmiot.statystyki.zdrowie ? <div id="itemStatystyka">+{przedmiot.statystyki.zdrowie} Zdrowie</div> : <div></div>}
                                                                                        {przedmiot.statystyki.zwinnosc ? <div id="itemStatystyka">+{przedmiot.statystyki.zwinnosc} Zwinnosc</div> : <div></div>}
                                                                                        {przedmiot.statystyki.zrecznosc ? <div id="itemStatystyka">+{przedmiot.statystyki.zrecznosc} Zręczność</div> : <div></div>}
                                                                                        {przedmiot.statystyki.inteligencja ? <div id="itemStatystyka">+{przedmiot.statystyki.inteligencja} Inteligencja</div> : <div></div>}
                                                                                        {przedmiot.statystyki.pancerz ? <div id="itemStatystyka">+{przedmiot.statystyki.pancerz} Pancerz</div> : <div></div>}
                                                                                    </div>
                                                                                    {przedmiot.typ !== 'Produkt' ? (<div><hr></hr></div>) : ''}
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
                                                    <div className='boxSrodek'>
                                                        <div className='boxPrzedmiot'>
                                                            {kliknietyPrzedmiot ?
                                                                (<div>
                                                                    <div id="przedmiot-container">
                                                                        <div id="ikona" onClick={() => wyborPola(null)}>
                                                                            <img
                                                                                src={przedmioty.find((item) => item.nazwa === kliknietyPrzedmiot.ikona).url}
                                                                                alt={`przedmiot`}
                                                                            />
                                                                        </div>
                                                                        <div id="opisBox" className={`${kliknietyPrzedmiot.rzadkosc.toLowerCase()}`}>
                                                                            <h2>{kliknietyPrzedmiot.nazwa}</h2>
                                                                            {kliknietyPrzedmiot.zestaw !== "brak" ? <div>Zestaw: {kliknietyPrzedmiot.zestaw}</div> : <div></div>}
                                                                            <div id={`${kliknietyPrzedmiot.rzadkosc.toLowerCase()}`}>{kliknietyPrzedmiot.rzadkosc}</div>
                                                                            <hr></hr>
                                                                            {kliknietyPrzedmiot.typ !== 'Produkt' ? (<div>Poziom ulepszenia: {kliknietyPrzedmiot.poziom_ulepszenia}<hr></hr></div>) : ''}

                                                                            {kliknietyPrzedmiot.obrazeniaMin ? <div>{kliknietyPrzedmiot.obrazeniaMin}-{kliknietyPrzedmiot.obrazeniaMax} Obrażenia</div> : <div></div>}
                                                                            <div id="boxStatystyki">
                                                                                {kliknietyPrzedmiot.statystyki.sila ? <div id="itemStatystyka">+{kliknietyPrzedmiot.statystyki.sila} Sila</div> : <div></div>}
                                                                                {kliknietyPrzedmiot.statystyki.zdrowie ? <div id="itemStatystyka">+{kliknietyPrzedmiot.statystyki.zdrowie} Zdrowie</div> : <div></div>}
                                                                                {kliknietyPrzedmiot.statystyki.zwinnosc ? <div id="itemStatystyka">+{kliknietyPrzedmiot.statystyki.zwinnosc} Zwinnosc</div> : <div></div>}
                                                                                {kliknietyPrzedmiot.statystyki.zrecznosc ? <div id="itemStatystyka">+{kliknietyPrzedmiot.statystyki.zrecznosc} Zręczność</div> : <div></div>}
                                                                                {kliknietyPrzedmiot.statystyki.inteligencja ? <div id="itemStatystyka">+{kliknietyPrzedmiot.statystyki.inteligencja} Inteligencja</div> : <div></div>}
                                                                                {kliknietyPrzedmiot.statystyki.pancerz ? <div id="itemStatystyka">+{kliknietyPrzedmiot.statystyki.pancerz} Pancerz</div> : <div></div>}
                                                                            </div>
                                                                            {kliknietyPrzedmiot.typ !== 'Produkt' ? (<div><hr></hr></div>) : ''}
                                                                            <div>Kupno: {kliknietyPrzedmiot.cena}$ Sprzedaż: {kliknietyPrzedmiot.cena / 2}$</div>
                                                                            <hr></hr>
                                                                            {kliknietyPrzedmiot.poziom ? <div>Wymagany poziom: {kliknietyPrzedmiot.poziom}</div> : <div></div>}
                                                                            <div>{kliknietyPrzedmiot.typ}</div>
                                                                        </div>
                                                                        {kliknietyPrzedmiot.ilosc !== 1 && <p className="ilosc">{kliknietyPrzedmiot.ilosc}</p>}

                                                                    </div>

                                                                </div>)
                                                                : (<div>
                                                                    <div className='white-space'>Wybierz przedmiot</div>
                                                                    <div className='boxPrzedmiot'>
                                                                        <div id="przedmiot-container">
                                                                            <div id="ikona">
                                                                                <img
                                                                                    src={przedmioty[0].url}
                                                                                    alt={`przedmiot`}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>)}

                                                        </div>
                                                    </div>
                                                    <div className='boxPrawy'>
                                                        {kliknietyPrzedmiot ? (
                                                            <div className='boxFormularz'>
                                                                <form action="" onSubmit={handleSubmit} className='formularz'>
                                                                    <div><p>Cena kup teraz</p>
                                                                        <input type='text'
                                                                            name='cenaKupTeraz'
                                                                            value={formState.cenaKupTeraz}
                                                                            onChange={handleInputChange}></input>
                                                                        <div className='pokazError'>{errors.cenaKupTeraz}{(formState.ilosc * (kliknietyPrzedmiot.cena / 2) > formState.cenaKupTeraz) && !errors.cenaKupTeraz && formState.cenaKupTeraz ? 'Podana cena jest niższa niż cena sprzedaży' : ''}</div>
                                                                    </div>
                                                                    <div><p>Cena wywoławcza</p>
                                                                        <input type='text'
                                                                            name='cenaWywolawcza'
                                                                            value={formState.cenaWywolawcza}
                                                                            onChange={handleInputChange}></input>
                                                                        <div className='pokazError'>{errors.cenaWywolawcza}{(formState.ilosc * (kliknietyPrzedmiot.cena / 2) > formState.cenaWywolawcza) && !errors.cenaWywolawcza && formState.cenaWywolawcza ? 'Podana cena jest niższa niż cena sprzedaży' : ''}</div>

                                                                    </div>
                                                                    {kliknietyPrzedmiot.typ === 'Produkt' && kliknietyPrzedmiot.ilosc !== 1 ?
                                                                        <div><p>Ilość</p> <input type='text'
                                                                            name='ilosc'
                                                                            value={formState.ilosc}
                                                                            onChange={handleInputChange}></input>
                                                                            <div className='pokazError'>{errors.ilosc}{(kliknietyPrzedmiot.ilosc < formState.ilosc) && !errors.ilosc ? 'Nie posiadasz tylu produktów' : ''}</div>

                                                                        </div>
                                                                        : ''}

                                                                    <div>
                                                                        <div>
                                                                            <select
                                                                                name='liczbaDni'
                                                                                value={formState.liczbaDni}
                                                                                onChange={handleInputChange}>
                                                                                <option value="" disabled>Wybierz długość aukcji</option>
                                                                                <option value="12h">12 godzin</option>
                                                                                <option value="1d">1 dzień</option>
                                                                                <option value="2d">2 dni</option>
                                                                                <option value="3d">3 dni</option>
                                                                                <option value="4d">4 dni</option>
                                                                                <option value="5d">5 dni</option>
                                                                                <option value="6d">6 dni</option>
                                                                                <option value="7d">7 dni</option>
                                                                            </select>
                                                                            <div className='pokazError'>{errors.liczbaDni}</div>

                                                                        </div>
                                                                    </div>
                                                                    <div><div className={`boxPodatek ${miedziakiRynek < obliczPodatek() ? 'kolorCzerwony' : ''}`}>{(formState.cenaKupTeraz || formState.cenaWywolawcza) ? 'Podatek: ' + obliczPodatek() : ''}</div></div>
                                                                    <div><div className='przyciskWystaw'><button type='submit' id="wyslij">Wystaw</button></div></div>
                                                                    {komunikatPrzepelnienia ? <div className='boxLimitError'><div className='limitError'>Osiągneito limit przedmiotów na rynku</div></div> : ''}</form>
                                                            </div>) : ''
                                                        }
                                                    </div>
                                                </div>)
                                        }
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

