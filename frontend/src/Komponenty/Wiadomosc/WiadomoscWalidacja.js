function Walidacja(values){

    let error = {}
    

    if(values.odbiorca === ""){
        error.odbiorca="Podaj odbiorcę"
    } else {
        error.odbiorca=""
    }

    if(values.tytul ===""){
        error.tytul="Wpisz tytuł wiadomość"
    } else {
        error.tytul=""
    }

    if(values.tresc ===""){
        error.tresc="Wpisz treść wiadomości"
    } else {
        error.tresc=""
    }

    if(error.odbiorca === "" && error.tytul === "" && error.tresc === ""){
        return "Powodzenie"
    }
    return error;
}

export default Walidacja