import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Walidacja from './RejestracjaWalidacja'
import { useState } from 'react'
import axios from 'axios';
import './Rejestracja.css'
import zdjecia from '../Wyglad/Zdjecia';

function Rejestracja() {

    const [values, setValues] = useState({
        login: '',
        email: '',
        characterName: '',
        haslo: '',
        haslo2: '',
        wygladPostaci: ''
    })

    const [duplikaty, setDuplikaty] = useState({
        login: '',
        email: '',
        characterName: ''
    })


    const [aktywneZdjecie, ustawAktywneZdjecie] = useState();




    const obsluzKlikniecie = (id) => {

        if (id === aktywneZdjecie) {
            ustawAktywneZdjecie(null);
            setValues(prev => ({ ...prev, wygladPostaci: "" }));
        } else {

            ustawAktywneZdjecie(id);
            setValues(prev => ({ ...prev, wygladPostaci: id }));
        }
    };


    const [errors, setErrors] = useState({})

    const navigate = useNavigate();

   

    //const navigate = useNavigate();

    const handleInput = (event) => {
        setValues(prev => ({ ...prev, [event.target.name]: [event.target.value] }))
    }


    const handleSubmit = (event) => {
        event.preventDefault();
        setDuplikaty(prev => ({ ...prev, login: "" }));
        setDuplikaty(prev => ({ ...prev, email: "" }));
        setDuplikaty(prev => ({ ...prev, characterName: "" }));
        setErrors(Walidacja(values))
        if (Walidacja(values) === "Powodzenie") {
            axios.post('http://localhost:8081/rejestracja', values)
                .then(res => {
                    if (res.data === "Zarejestrowano") {
                        navigate('/');
                    }
                    if (res.data === "bladLogin") {
                        setDuplikaty(prev => ({ ...prev, login: "Podana nazwa użytkownika już istnieje" }));
                    }
                    if (res.data === "bladEmail") {
                        setDuplikaty(prev => ({ ...prev, email: "Podany email jest zajęty" }));
                    }
                    if (res.data === "bladNazwa") {
                        setDuplikaty(prev => ({ ...prev, characterName: "Podana nazwa jest zajęta" }));
                    }




                }
                )
                .catch(err => console.log(err));
        }
    }



    return (
        <div className='Rejestracja'>
            <div className="wyborFormularza">
                <Link to="/" id='wyborLogowania'>Logowanie</Link><p> </p>
                <Link to="/rejestracja" id='wyborRejestracji'>Rejestracja</Link>
            </div>
            <form action="" onSubmit={handleSubmit} className='formularz'>

                <div id="daneFormularza">
                    <div id="daneUzytkownika">
                        <div id="formularz">

                            <input type="text" placeholder='Podaj login' name='login' id='login'
                                onChange={handleInput} />

                        </div>
                        <div id='pokazError'>
                            {errors.login}
                            {duplikaty.login}
                        </div>
                        <div id="formularz">

                            <input type="email" placeholder='Podaj email' name='email' id='email'
                                onChange={handleInput} />


                        </div>
                        <div id='pokazError'>
                            {errors.email}
                            {duplikaty.email}

                        </div>
                        <div id="formularz">

                            <input type="password" placeholder='Podaj hasło' name='haslo' id='haslo'
                                onChange={handleInput} />


                        </div>
                        <div id='pokazError'>
                            {errors.haslo}

                        </div>
                        <div id="formularz">

                            <input type="password" placeholder='Powtórz hasło' name='haslo2' id='haslo2'
                                onChange={handleInput} />

                        </div>
                        <div id='pokazError'>
                            {errors.haslo2}
                        </div>

                    </div>

                    <div id="danePostaci">
                        <div id="napis">Wygląd Postaci</div>
                        <div id="kontenerPostaci">
                            {zdjecia.map((zdjecie) => (
                                <img
                                    key={zdjecie.id}
                                    src={zdjecie.url}
                                    alt={`Zdjęcie ${zdjecie.id}`}
                                    className={zdjecie.id === aktywneZdjecie ? 'aktywne' : ''}
                                    onClick={() => obsluzKlikniecie(zdjecie.id)}
                                />
                            ))}
                        </div>
                        <div id='pokazError'>
                            {errors.wygladPostaci}
                        </div>
                        <div>

                            <input type="text" placeholder='Nazwa postaci' name='characterName' id='characterName'
                                onChange={handleInput} />

                        </div>
                        <div id='pokazError'>
                            {errors.characterName}
                            {duplikaty.characterName}
                        </div>
                    </div>
                </div>
                <button type='submit' id="zarejestruj">Zarejestruj</button>
            </form>

        </div>
    )
}

export default Rejestracja