import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Walidacja from './LogowanieWalidacja'
import axios from 'axios';
import './Logowanie.css'
import './LogowanieWalidacja'

function Logowanie() {
  const [values,setValues] = useState({
    login: '',
    haslo: ''
  })

  const [errors, setErrors] = useState({})

  const [odpowiedz, setOdpowiedz] = useState({
    login: '',
    haslo: ''
  })


  const handleInput = (event) => {
    setValues(prev => ({...prev, [event.target.name]: [event.target.value]}))
  }

  const navigate = useNavigate();

  axios.defaults.withCredentials = true;

  const handleSubmit = (event) => {
    setOdpowiedz(prev => ({...prev,login: ""}));
    setOdpowiedz(prev => ({...prev,haslo: ""}));
    event.preventDefault();
    setErrors(Walidacja(values));
    if(Walidacja(values)==="Powodzenie") {
            axios.post('http://localhost:8081/logowanie', values)
                .then(res => {
                  if(res.data === "Zalogowano"){
                    navigate('/front');
                  }
                  if(res.data==="loginNie"){
                    setOdpowiedz(prev => ({...prev,login: "Login niepoprawny"}));
                  }
                  if(res.data==="hasloNie"){
                    setOdpowiedz(prev => ({...prev,haslo: "Haslo niepoprawne"}));
                  }
                }
                )
                .catch(err => console.log(err));

  }

  }

  return (
    <div className='Logowanie'>
      <div className="wyborFormularza">
      <Link to="/" id='wyborLogowania'>Logowanie</Link><p> </p>
      <Link to="/rejestracja" id='wyborRejestracji'>Rejestracja</Link>
      </div>

        <form action="" onSubmit={handleSubmit} className='formularz'>
            <div id="daneUzytkownika">
            <div>
               
                <input type="name" placeholder='Podaj login' name='login' id='login' 
                onChange={handleInput}/>
                <div id="pokazError">{errors.login}{odpowiedz.login}</div>
            </div>
            <div>
              
                <input type="password" placeholder='Podaj hasło' name='haslo' id='haslo'
                onChange={handleInput}/>
                <div id="pokazError">{errors.haslo}{odpowiedz.haslo}</div>
            </div>
            </div>
            
            <button type='submit' id="zaloguj">Zaloguj</button>
           
            </form>
    </div>
  )
}

export default Logowanie