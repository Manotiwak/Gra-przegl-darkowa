import React from 'react'
import LeweMenu from '../Nawigacja/LeweMenu/LeweMenu'
import GorneMenu from '../Nawigacja/GorneMenu/GorneMenu'
import Stopka from '../Nawigacja/Stopka/Stopka'
import { Autoryzacja } from '../Autoryzacja/Autoryzacja'
import "./Front.css"
import tloFront from './tloFront.png'
import pismo from './pismo.png'
import { useNavigate } from 'react-router-dom';




export default function Front() {

  const { autoryzacja, nazwa, handleLogout } = Autoryzacja();
  return (
    <div className='Front'>

      <GorneMenu handleLogout={handleLogout} nazwa={nazwa} />

      <div id="kontener">
        <LeweMenu />
        <div id="prawyEkran">
          <div className='tloFront'>
            <div className='boxKontener'>
              <div className='tloScenariusz'>
              <div className='wolneMiejsce'></div>
              <div className='boxScenariusz'>
              Gracz rozpoczyna grę jako niedoświadczony wojownik, który właśnie wstąpił w
                  szeregi obrońców światła. Na początku gracz ma do dyspozycji podstawowe wyposażenie i
                  niewielkie zdolności bojowe tak, aby umożliwiły mu wykonać najprostsze zadania. Z
                  czasem gracz będzie zdobywał coraz to lepsze wyposażenie oraz rozwijał swoje zdolności
                  bojowe.<br></br>
                  Wraz ze wzrostem poziomu gracz będzie odblokowywał nowe prace, trudniejsze
                  misje oraz będzie walczył z mocniejszymi przeciwnikami za co będzie otrzymywał
                  wynagrodzenie w postaci miedziaków a czasami nawet rzadkich przedmiotów.
                  Gracz ma możliwość ulepszenia swojego ekwipunku dzięki produktom zdobytym z
                  wykonanych prac i zadań, co ułatwi pokonywanie przeciwników.
                  Gracz może wykonywać różne prace, dzięki którym ma możliwość zdobycia
                  różnorodnych produktów i przedmiotów.<br></br>
                  Zdobyta waluta posłuży graczowi do kupienia wyposażenia, które znajdzie w
                  lokalnym sklepie lub na rynku, gdzie inni gracze wystawili na aukcje przedmioty.
                  Podczas ścieżki rozwoju swojej postaci, gracz może podejmować się pojedynków z
                  innymi graczami w celu porównania swoich umiejętności i zwiększenia rankingu na
                  arenie.<br></br>
                  Głównym celem gry jest powstrzymanie niecnych zamiarów lorda ciemności,
                  polegających na pochłonięciu całego świata w ciemnościach, jednak i to nie wyeliminuje
                  całkowicie zagrożenia, gdyż sługusy lorda, będą chciały się zemścić. Gracz będzie w
                  końcu zmuszony stawić im czoła, dlatego musi ciągle rozwijać swoją postać i stać się
                  najpotężniejszym obrońcą światła.
                  Gracz rozpoczyna grę jako niedoświadczony wojownik, który właśnie wstąpił w
                  szeregi obrońców światła. Na początku gracz ma do dyspozycji podstawowe wyposażenie i
                  niewielkie zdolności bojowe tak, aby umożliwiły mu wykonać najprostsze zadania. Z
                  czasem gracz będzie zdobywał coraz to lepsze wyposażenie oraz rozwijał swoje zdolności
                  bojowe.<br></br>
                  Wraz ze wzrostem poziomu gracz będzie odblokowywał nowe prace, trudniejsze
                  misje oraz będzie walczył z mocniejszymi przeciwnikami za co będzie otrzymywał
                  wynagrodzenie w postaci miedziaków a czasami nawet rzadkich przedmiotów.
                  Gracz ma możliwość ulepszenia swojego ekwipunku dzięki produktom zdobytym z
                  wykonanych prac i zadań, co ułatwi pokonywanie przeciwników.
                  Gracz może wykonywać różne prace, dzięki którym ma możliwość zdobycia
                  różnorodnych produktów i przedmiotów.<br></br>
                  Zdobyta waluta posłuży graczowi do kupienia wyposażenia, które znajdzie w
                  lokalnym sklepie lub na rynku, gdzie inni gracze wystawili na aukcje przedmioty.
                  Podczas ścieżki rozwoju swojej postaci, gracz może podejmować się pojedynków z
                  innymi graczami w celu porównania swoich umiejętności i zwiększenia rankingu na
                  arenie.<br></br>
                  Głównym celem gry jest powstrzymanie niecnych zamiarów lorda ciemności,
                  polegających na pochłonięciu całego świata w ciemnościach, jednak i to nie wyeliminuje
                  całkowicie zagrożenia, gdyż sługusy lorda, będą chciały się zemścić. Gracz będzie w
                  końcu zmuszony stawić im czoła, dlatego musi ciągle rozwijać swoją postać i stać się
                  najpotężniejszym obrońcą światła.
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
