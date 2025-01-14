import React from 'react'
import Login from './Komponenty/Logowanie/Logowanie'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import Rejestracja from './Komponenty/Rejestracja/Rejestracja'
import Front from './Komponenty/Front/Front'
import Postac from './Komponenty/Postac/Postac'
import Zadania from './Komponenty/Zadania/Zadania'
import Prace from './Komponenty/Prace/Prace'
import Sklep from './Komponenty/Sklep/Sklep'
import Kowal from './Komponenty/Kowal/Kowal'
import Rynek from './Komponenty/Rynek/Rynek'
import Ranking from './Komponenty/Ranking/Ranking'
import Poczta from './Komponenty/Poczta/Poczta'
import Wiadomosc from './Komponenty/Wiadomosc/Wiadomosc'
import Arena from './Komponenty/Arena/Arena'
import Drzewo from './Komponenty/Drzewo/Drzewo'
import Magazyn from './Komponenty/Magazyn/Magazyn'
import './App.css'

function App() {
  return (
    <div>
      <BrowserRouter>
      <Routes>
        <Route path='/' element={<Login />}></Route>
        <Route path='/rejestracja' element={<Rejestracja />}></Route>
        <Route path='/front' element={<Front />}></Route>
        <Route path='/postac' element={<Postac />}></Route>
        <Route path='/zadania' element={<Zadania />}></Route>
        <Route path='/sklep' element={<Sklep />}></Route>
        <Route path='/kowal' element={<Kowal />}></Route>
        <Route path='/rynek' element={<Rynek />}></Route>
        <Route path='/ranking' element={<Ranking />}></Route>
        <Route path='/poczta' element={<Poczta />}></Route>
        <Route path='/wiadomosc' element={<Wiadomosc />}></Route>
        <Route path='/wiadomosc/:wiadomoscId' element={<Wiadomosc />}></Route>
        <Route path='/drzewo' element={<Drzewo />}></Route>
        <Route path='/arena' element={<Arena />}></Route>
        <Route path='/magazyn' element={<Magazyn />}></Route>
        <Route path='/prace' element={<Prace />}></Route>
      </Routes>
      </BrowserRouter>
      </div>
  )
}

export default App
