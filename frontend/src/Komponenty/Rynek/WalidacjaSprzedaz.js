function Walidacja(values) {
  let errors = {};

  if (values.cenaKupTeraz === '' && values.cenaWywolawcza === '') {
    errors.cenaKupTeraz = 'Podaj cenę kup teraz lub cenę wywoławczą';
    errors.cenaWywolawcza = 'Podaj cenę kup teraz lub cenę wywoławczą';
  } else {
    if (values.cenaKupTeraz !== '') {
      if (isNaN(values.cenaKupTeraz) || parseInt(values.cenaKupTeraz) < 0) {
        errors.cenaKupTeraz = 'Cena musi być liczbą całkowitą większą od 1';
      }
    }

    if (values.cenaWywolawcza !== '') {
      if (isNaN(values.cenaWywolawcza) || parseInt(values.cenaWywolawcza) < 0) {
        errors.cenaWywolawcza = 'Cena musi być liczbą całkowitą większą od 1';
      }
    }

    if (values.cenaKupTeraz !== '' && values.cenaWywolawcza !== '') {
      if (parseInt(values.cenaKupTeraz) <= parseInt(values.cenaWywolawcza)) {
        errors.cenaKupTeraz = 'Cena kup teraz musi być większa niż cena wywoławcza';
      }
    }
  }

  if (values.ilosc === '') {
    errors.ilosc = 'Podaj ilość';
  } else if (isNaN(values.ilosc) || parseInt(values.ilosc) < 1) {
    errors.ilosc = 'Ilość musi być liczbą całkowitą większą od 1';
  }

  if (values.liczbaDni === '' || !['12h', '1d', '2d', '3d', '4d', '5d', '6d', '7d'].includes(values.liczbaDni)) {
    errors.liczbaDni = 'Nieprawidłowa długość aukcji';
  }

  if (Object.keys(errors).length === 0) {
    return 'Powodzenie';
  }

  return errors;
}

export default Walidacja;