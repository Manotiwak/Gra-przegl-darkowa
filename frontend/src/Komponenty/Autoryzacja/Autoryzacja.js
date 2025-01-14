import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

axios.defaults.withCredentials = true;

export function Autoryzacja(){

  const [autoryzacja, setAutoryzacja] = useState(false) // stan przechowywujący czy dokładnie ten użytkownik jest zalogowany
  const [nazwa,setNazwa] = useState('') // stan przechowywujacy nazwe postaci
  const navigate = useNavigate(); 

  useEffect(()=>{
    // zapytanie do serwera w celu sprawdzenia tokena jwt 
    axios.get('http://localhost:8081')
    .then(res =>{
      if(res.data.Status === "Zalogowano"){
        setAutoryzacja(true);
        setNazwa(res.data.nazwa);
      }else{
        setAutoryzacja(false)
        navigate('/');
      }
    })
  })
  
  const handleLogout = () => {
    // zapytanie do serwera usuwające token jwt w celu wylogowania użytkownika
    axios.get('http://localhost:8081/wyloguj')
    .then(res => {
      if(res.data.Status === "Wylogowano"){
        navigate('/');
      }
      else{
        alert("Error")
      }
    }).catch(err => console.log(err))
  }

  return {autoryzacja, nazwa, handleLogout};
}