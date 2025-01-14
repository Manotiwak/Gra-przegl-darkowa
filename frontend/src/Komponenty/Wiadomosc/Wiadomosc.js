import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import LeweMenu from '../Nawigacja/LeweMenu/LeweMenu'
import GorneMenu from '../Nawigacja/GorneMenu/GorneMenu'
import Stopka from '../Nawigacja/Stopka/Stopka'
import axios from 'axios';
import { Autoryzacja } from '../Autoryzacja/Autoryzacja'
import Walidacja from './WiadomoscWalidacja'
import "./Wiadomosc.css"


export default function Wiadomosc() {

    const { autoryzacja, nazwa, handleLogout } = Autoryzacja();

    const [values, setValues] = useState({
        odbiorca: '',
        tytul: '',
        tresc: ''
    })

    const [brak, setBrak] = useState()

    

    const [errors, setErrors] = useState({})

    const navigate = useNavigate();

    const { wiadomoscId } = useParams();

    const [nadawca, setNadawca] = useState();
    const [tytul, setTytul] = useState();
    const [tresc, setTresc] = useState();

    useEffect(() => {
        if (wiadomoscId) {
            axios.get(`http://localhost:8081/odpowiedz/${wiadomoscId}`)
                .then((response) => {
                    setNadawca(response.data.nazwa);
                    setTytul(`Re: ${response.data.tytul}`);
                    setTresc(`Re: ${response.data.tresc}`);
                    setValues({
                        odbiorca: response.data.nazwa,
                        tytul: `Re: ${response.data.tytul}`,
                        tresc: `Re: ${response.data.tresc}`
                    });
                })
                .catch((error) => {
                    console.error('Błąd podczas pobierania danych:', error);
                });
        }
    }, [wiadomoscId]);


    const handleSubmit = (event) => {
        event.preventDefault();
        setErrors(Walidacja(values))

        if (Walidacja(values) === "Powodzenie") {
            if (nazwa) {
                axios.post(`http://localhost:8081/napiszWiadomosc/${nazwa}`, values)
                    .then(res => {
                        if (res.data === "Wysłano") {
                            navigate('/poczta');
                        }
                        if (res.data === "bladOdbiorca") {
                            setBrak("Podana postać nie istnieje");
                        }

                    }
                    )
                    .catch(err => console.log(err));
            }
        }


    }

    const InputDo = (e) => {
        setNadawca(e.target.value);
        setValues(prev => ({ ...prev, [e.target.name]: [e.target.value] }))
    };

    const InputTytul = (e) => {
        setTytul(e.target.value);
        setValues(prev => ({ ...prev, [e.target.name]: [e.target.value] }))
    };

    const InputTresc = (e) => {
        setTresc(e.target.value);
        setValues(prev => ({ ...prev, [e.target.name]: [e.target.value] }))
    };

    return (
        <div className='Wiadomosc'>
            <GorneMenu handleLogout={handleLogout} />

            <div id="kontener">
                <LeweMenu />
                <div id="prawyEkran">
                    <div id="zawartoscEkranu">
                        <div className="wyborEkranu">
                            <Link to="/poczta" id='skrzynkaPocztowa'>Wiadomości</Link>
                            <Link to="/wiadomosc" id='napiszWiadomosc'>Napisz wiadomość</Link>
                        </div>
                        <form action="" onSubmit={handleSubmit} className='formularz'>

                            <label for="Odbiorca">Do:</label>
                            <input type="text" name="odbiorca" id="odbiorca" onChange={InputDo} value={nadawca} />

                            <div id='pokazError'>
                                {errors.odbiorca}
                                {brak}
                            </div>

                            <label for="Tytul">Tytuł:</label>
                            <input type="text" name="tytul" id="tytul" onChange={InputTytul} value={tytul} />
                            <div id='pokazError'>
                                {errors.tytul}
                            </div>

                            <label for="Tresc">Treść:</label>
                            <textarea name="tresc" id="tresc" onChange={InputTresc} value={tresc} />
                            <div id='pokazError'>
                                {errors.tresc}
                            </div>
                            <div id="przycisk">
                                <button type='submit' id="wyslij">Wyślij</button>
                            </div>
                        </form>

                    </div>
                </div>
            </div>
            <Stopka />


        </div>
    )
}


