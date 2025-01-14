function Walidacja(values){

    let error = {}
    
    const login_pattern = /^[a-zA-Z0-9]{8,32}$/
    const name_pattern = /^[a-zA-Z0-9]{5,32}$/
    const haslo_pattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/
    const email_pattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,4}$/
    

    if(values.login === ""){
        error.login="Podaj login"
    }
    else if(!login_pattern.test(values.login)){
        error.login = "Login powinien zawierać od 8 do 32 znaków"
    }else{
        error.login = ""
    }

    if(values.haslo ===""){
        error.haslo="Podaj haslo"
    }
    else if(!haslo_pattern.test(values.haslo)){
        error.haslo = "Hasło musi zawierać przynajmniej 8 znaków (jedną cyfrę, jedną małą literę i jedną wielką literę)";
   }
    else{
        error.haslo = ""
        error.haslo2 = ""
        if(values.haslo2 === ""){
            error.haslo2="Podaj ponownie haslo"
        }
        else if(values.haslo[0] !== values.haslo2[0])
        {
        error.haslo2="Podane hasła się różnią"

        }else{
                error.haslo2 = ""
        }
    }


    if(values.characterName ===""){
        error.characterName="Podaj nazwę postaci"
    }
    else if(!name_pattern.test(values.characterName)){
        error.characterName = "Nazwa postaci powinna zawierać od 5 do 32 znaków"
    }else{
        error.characterName = ""
    }

    if(values.email ===""){
        error.email="Podaj email"
    }
    else if(!email_pattern.test(values.email)){
        error.email = "Niepoprawny format, poprawny format to: example@mail.com"
    }else{
        error.email = ""
    }

    if(values.wygladPostaci === ""){
        error.wygladPostaci="Wybierz wygląd"
    }else{
        error.wygladPostaci = ""
    }

    if(error.login === "" && error.characterName === "" && error.wygladPostaci === "" && error.haslo === "" && error.haslo2 === "" && error.email === ""){
        return "Powodzenie"
    }
    return error;
}

export default Walidacja