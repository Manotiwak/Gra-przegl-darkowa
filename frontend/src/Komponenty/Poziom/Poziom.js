import { useState, useEffect } from 'react';
import axios from 'axios';

axios.defaults.withCredentials = true;

export function PoziomPostaci(nazwa){

  const [poziomPostaci,setPoziomPostaci] = useState()
  useEffect(()=>{
    if(nazwa){
    axios.get(`http://localhost:8081/poziompostaci/${nazwa}`)
    .then(res =>{
        setPoziomPostaci(res.data.PoziomPostaci);
    })
}
  },[nazwa])
  
  return {poziomPostaci};
}