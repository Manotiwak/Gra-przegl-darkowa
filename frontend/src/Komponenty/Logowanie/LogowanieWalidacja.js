function Walidacja(values){
    let error = {}
    /*
    const login_pattern = /^[a-zA-Z0-9_]+$/
    const haslo_pattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    */

    const login_pattern = /^.*$/
    const haslo_pattern = /^.*$/

    if(values.login ===""){
        error.login="Podaj login"
    }
    else if(!login_pattern.test(values.login)){
        error.login = "Login nie pasuje"
    }else{
        error.login = ""
    }

    if(values.haslo ===""){
        error.haslo="Podaj haslo"
    }
    else if(!haslo_pattern.test(values.haslo)){
        error.haslo = "Haslo nie pasuje"
    }else{
        error.haslo = ""
    }

    if (error.login === "" && error.haslo === "") {
        return "Powodzenie"
    }

    return error;
}

export default Walidacja;