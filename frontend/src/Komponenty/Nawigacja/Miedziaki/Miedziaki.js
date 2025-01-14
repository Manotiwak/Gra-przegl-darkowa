import { useState, useEffect } from 'react';
import axios from 'axios';

axios.defaults.withCredentials = true;

export function Miedziaki(nazwa){

  const [miedziaki,setMiedziaki] = useState()
  useEffect(()=>{
    if(nazwa){
    axios.get(`http://localhost:8081/miedziaki/${nazwa}`)
    .then(res =>{
        setMiedziaki(res.data.Miedziaki);
    })
}
  },[nazwa])
  
  return {miedziaki};
}