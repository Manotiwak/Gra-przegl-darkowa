const express = require("express");
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const db = require('./db');
const cron = require('node-cron');

const app = express();
app.use(cookieParser())
app.use(cors({
    origin: ["http://localhost:3000"],
    methods: ["POST , GET , PUT"],
    credentials: true
}));

app.use(express.urlencoded({ extended: true }));

app.use(express.json());


db.connect((err) => {
    if (err) {
        console.error('Błąd połączenia z bazą danych:', err);
        return;
    }
    console.log('Połączenie z bazą danych udane.');
    const sqlCheck = 'SELECT * FROM zadanie_dnia WHERE DATE(data) = CURDATE()';
    db.query(sqlCheck, (error, results) => {
        if (error) throw error;
        if (results.length === 0) {
            console.log('Brak zadania dnia, generowanie nowego...');
            generateDailyTask();
        } else {
            console.log('Zadanie dnia już istnieje na dzisiaj.');
        }
    });
});

function generateDailyTask() {
    const sqlZadanie = 'SELECT * FROM zadania WHERE id > 120 ORDER BY RAND() LIMIT 1'
    db.query(sqlZadanie, (error, results) => {
        if (error) throw error;
        if (results.length > 0) {
            const selectedTask = results[0];
            const sqlZadanieDnia = 'REPLACE INTO zadanie_dnia (id, data, zadania_id) VALUES (1, NOW(), ?)'
            db.query(sqlZadanieDnia, [selectedTask.id], (error, results) => {
                if (error) throw error;
                console.log('Zadanie dnia zostało zaktualizowane: ', results);
            });
            const sqlPostep = 'UPDATE postac SET Postep_zd = 0'
            db.query(sqlPostep, (errP) => {
                if (errP) throw error;
                console.log('Wyzerowano postep graczy')
            })
        } else {
            console.log('Nie znaleziono żadnych zadań do ustawienia jako zadanie dnia.');
        }
    });
}

cron.schedule('0 0 * * *', generateDailyTask, {
    scheduled: true,
    timezone: "Europe/Warsaw"
});

app.post('/rejestracja', (req, res) => {
    const sqlNazwaPostaci = "SELECT nazwa FROM postac WHERE nazwa = ?";
    const sqlUzytkownik = "INSERT INTO uzytkownik (`login`,`haslo`,`email`) VALUES (?)";
    const hash = bcrypt.hashSync(req.body.haslo[0], 10);
    const values = [
        req.body.login,
        hash,
        req.body.email
    ]
    db.query(sqlNazwaPostaci, [req.body.characterName[0]], (error, dane) => {
        if (dane.length === 1) {
            return res.json("bladNazwa")
        }
        db.query(sqlUzytkownik, [values], (err, data) => {
            if (err) {
                const komunikatBledu = err.sqlMessage;
                const bladEmail = "for key 'uzytkownik.email_UNIQUE'";
                const bladLogin = "for key 'uzytkownik.login_UNIQUE'";
                if (komunikatBledu.indexOf(bladLogin) !== -1) {
                    return res.json("bladLogin")
                }
                if (komunikatBledu.indexOf(bladEmail) !== -1) {
                    return res.json("bladEmail")
                }
            }
            const uzytkownikId = data.insertId
            const sqlStatystyki = "INSERT INTO statystyki (`sila`,`zdrowie`,`zwinnosc`,`zrecznosc`,`inteligencja`,`pancerz`) VALUES (?)";
            const sila = 1
            const zdrowie = 1
            const zwinnosc = 1
            const zrecznosc = 1
            const inteligencja = 1
            const pancerz = 1
            const values2 = [
                sila,
                zdrowie,
                zwinnosc,
                zrecznosc,
                inteligencja,
                pancerz,
            ]
            db.query(sqlStatystyki, [values2], (err2, data2) => {
                const sql2 = "SELECT COUNT(login) as liczba FROM uzytkownik";
                db.query(sql2, [], (err0, data0) => {
                    const rankingLiczba = data0[0].liczba
                    const statystykiId = data2.insertId
                    const sqlPostac = "INSERT INTO postac (`uzytkownik_id`,`nazwa`,`poziom`,`miedziaki`,`doswiadczenie`,`wyglad`,`ranking`,`Statystyki_id`,`Zadania_Glowne`,`Zadania_Poboczne`,`Postep_zg`,`Postep_zp`,`Postep_zd`) VALUES (?)";
                    const uzytkownik_id = uzytkownikId
                    const nazwa = req.body.characterName
                    const poziom = 1
                    const doswiadczenie = 0
                    const wyglad = req.body.wygladPostaci
                    const ranking = rankingLiczba
                    const Statystyki_id = statystykiId
                    const values3 = [
                        uzytkownik_id,
                        nazwa,
                        poziom,
                        10,
                        doswiadczenie,
                        wyglad,
                        ranking,
                        Statystyki_id,
                        1,
                        31,
                        0,
                        0,
                        0
                    ]
                    db.query(sqlPostac, [values3], (err3, danePostac) => {
                        console.log(err3)
                        if (err3) {
                            const komunikatBledu3 = err3.sqlMessage;
                            const bladNazwa = "for key 'postac.nazwa_UNIQUE'";
                            if (komunikatBledu3.indexOf(bladNazwa) !== -1) {
                                return res.json("bladNazwa")
                            }
                        }
                        const sqlMiecz = "INSERT INTO magazyn (`przedmiot_id`, `ilosc`, `zalozone`, `Postac_id`) VALUES (?)"
                        const valuesMiecz = [
                            1500,
                            1,
                            1,
                            danePostac.insertId
                        ]
                        db.query(sqlMiecz, [valuesMiecz], (errMiecz, daneMiecz) => {
                            if (errMiecz) {
                                console.log(errMiecz)
                                console.log("Nie udało się dodać przedmiotu")
                                return;
                            }
                            return res.json("Zarejestrowano")
                        })
                    })
                })
            })
        })
    })
})

app.post('/logowanie', (req, res) => {

    const sql = "SELECT u.id,u.login,u.haslo,p.nazwa FROM uzytkownik AS u INNER JOIN postac AS p ON u.id = p.uzytkownik_id WHERE login = ?";

    db.query(sql, [req.body.login[0]], (err, data) => {
        if (err) {
            return res.json("Error");
        }

        if (data.length === 0) {
            return res.json("loginNie")
        }

        const test = bcrypt.compareSync(req.body.haslo[0], data[0].haslo.toString())

        if (test) {
            // Użytkownik jest zalogowany pomyślnie
            const nazwa = data[0].nazwa;
            const token = jwt.sign({ nazwa }, "oP6X6WuOAbLlX5uB2rN1", { expiresIn: '1d' });
            res.cookie('token', token);
            return res.json("Zalogowano");

        } else {
            // Hasło jest nieprawidłowe
            return res.json("hasloNie")
        }
    })

})


const weryfikacjaUzytkownika = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.json("Blad")
    } else {
        jwt.verify(token, "oP6X6WuOAbLlX5uB2rN1", (err, decoded) => {
            if (err) {
                return res.json("Blad2")
            } else {
                req.nazwa = decoded.nazwa;
                next();
            }
        })
    }
}

app.get('/', weryfikacjaUzytkownika, (req, res) => {
    return res.json({ Status: "Zalogowano", nazwa: req.nazwa })
})


app.get('/wyloguj', (req, res) => {
    res.clearCookie('token');
    return res.json({ Status: "Wylogowano" })
})


app.get('/postac/:nazwa', (req, res) => {

    const nazwa = req.params.nazwa;
    const sqlDanePostaci = "SELECT p.id,p.uzytkownik_id,p.nazwa,p.poziom,p.doswiadczenie,p.wyglad,p.ranking,s.sila,s.zdrowie,s.zwinnosc,s.zrecznosc,s.inteligencja,s.pancerz FROM postac AS p inner join statystyki as s ON s.id = p.Statystyki_id WHERE p.nazwa = ?";

    db.query(sqlDanePostaci, nazwa, (error, dane) => {

        if (error) {
            console.log(error)
            console.log("Blad p1");
            return
        }
        if (dane.length === 0) {
            console.log("Brak danych")
            return
        }
        const sqlNastepnyPoziom = `SELECT * FROM poziomy WHERE wymagane_doswiadczenie >= ? ORDER BY wymagane_doswiadczenie ASC LIMIT 1`
        const sqlAktualnyPoziom = `SELECT * FROM poziomy WHERE wymagane_doswiadczenie < ? ORDER BY wymagane_doswiadczenie DESC LIMIT 1`
        db.query(sqlAktualnyPoziom, dane[0].doswiadczenie, (error0, dane0) => {
            db.query(sqlNastepnyPoziom, dane[0].doswiadczenie, (error1, dane1) => {
                let aktualnyPoziom
                if (!(dane0.length === 0)) {
                    console.log("test1")
                    aktualnyPoziom = dane0[0].wymagane_doswiadczenie
                } else {
                    aktualnyPoziom = 0;
                }

                let nastepnyPoziom
                nastepnyPoziom = Math.max(dane1[0].wymagane_doswiadczenie, 150)
                console.log(nastepnyPoziom)



                const postac = {
                    id: dane[0].id,
                    uzytkownik_id: dane[0].uzytkownik_id,
                    nazwa: dane[0].nazwa,
                    poziom: dane[0].poziom,
                    doswiadczenie: dane[0].doswiadczenie - aktualnyPoziom,
                    nastepnyPoziom: nastepnyPoziom - aktualnyPoziom,
                    wyglad: dane[0].wyglad,
                    ranking: dane[0].ranking,
                    statystyki: {
                        sila: dane[0].sila,
                        zdrowie: dane[0].zdrowie,
                        zwinnosc: dane[0].zwinnosc,
                        zrecznosc: dane[0].zrecznosc,
                        inteligencja: dane[0].inteligencja,
                        pancerz: dane[0].pancerz
                    }
                }
                res.json({ Postac: postac })
            })
        })
    })
})


app.get('/ekwipunek/:id', (req, res) => {

    const id = req.params.id;
    const sqlDaneEkwipunek = "SELECT p.nazwa,p.zestaw,p.cena,p.typ,p.ikona,p.poziom_ulepszenia,p.poziom,s.sila,s.zdrowie,s.zwinnosc,s.zrecznosc,s.inteligencja,s.pancerz FROM magazyn AS m" +
        " inner join przedmiot AS p ON m.przedmiot_id = p.id" +
        " inner join statystyki AS s ON p.Statystyki_id = s.id" +
        " Where m.Postac_id= ? AND m.zalozone=1;";


    db.query(sqlDaneEkwipunek, id, (error, dane) => {

        if (error) {
            console.log(error)
            console.log("Blad p1");
            return
        }
        if (dane.length === 0) {
            console.log("Brak danych lub zalozonego ekwipunku")
            return res.json("Brak ekwipunku")
        }

        //console.log("Step 1");
        let helm = {};
        const getHelm = dane.find(item => item.typ === "Hełm");
        if (getHelm) {
            helm = {
                nazwa: getHelm.nazwa,
                zestaw: getHelm.zestaw,
                cena: getHelm.cena,
                typ: getHelm.typ,
                ikona: getHelm.ikona,
                poziom_ulepszenia: getHelm.poziom_ulepszenia,
                poziom: getHelm.poziom,
                statystyki: {
                    sila: getHelm.sila,
                    zdrowie: getHelm.zdrowie,
                    zwinnosc: getHelm.zwinnosc,
                    zrecznosc: getHelm.zrecznosc,
                    inteligencja: getHelm.inteligencja,
                    pancerz: getHelm.pancerz
                }
            }
        } else {
            helm = null;
        }



        //console.log("Step 2");
        let naszyjnik = {};
        const getNaszyjnik = dane.find(item => item.typ === "Naszyjnik");
        if (getNaszyjnik) {
            naszyjnik = {
                nazwa: getNaszyjnik.nazwa,
                zestaw: getNaszyjnik.zestaw,
                cena: getNaszyjnik.cena,
                typ: getNaszyjnik.typ,
                ikona: getNaszyjnik.ikona,
                poziom_ulepszenia: getNaszyjnik.poziom_ulepszenia,
                poziom: getNaszyjnik.poziom,
                statystyki: {
                    sila: getNaszyjnik.sila,
                    zdrowie: getNaszyjnik.zdrowie,
                    zwinnosc: getNaszyjnik.zwinnosc,
                    zrecznosc: getNaszyjnik.zrecznosc,
                    inteligencja: getNaszyjnik.inteligencja,
                    pancerz: getNaszyjnik.pancerz
                }
            }
        }
        else {
            naszyjnik = null;
        }


        // console.log("Step 3");
        let odziez = {};
        const getOdziez = dane.find(item => item.typ === "Odzież");
        if (getOdziez) {
            odziez = {
                nazwa: getOdziez.nazwa,
                zestaw: getOdziez.zestaw,
                cena: getOdziez.cena,
                typ: getOdziez.typ,
                ikona: getOdziez.ikona,
                poziom_ulepszenia: getOdziez.poziom_ulepszenia,
                poziom: getOdziez.poziom,
                statystyki: {
                    sila: getOdziez.sila,
                    zdrowie: getOdziez.zdrowie,
                    zwinnosc: getOdziez.zwinnosc,
                    zrecznosc: getOdziez.zrecznosc,
                    inteligencja: getOdziez.inteligencja,
                    pancerz: getOdziez.pancerz
                }
            }
        }
        else {
            odziez = null
        }
        // console.log("Step 4");
        let pas = {};
        const getPas = dane.find(item => item.typ === "Pas");
        if (getPas) {
            pas = {
                nazwa: getPas.nazwa,
                zestaw: getPas.zestaw,
                cena: getPas.cena,
                typ: getPas.typ,
                ikona: getPas.ikona,
                poziom_ulepszenia: getPas.poziom_ulepszenia,
                poziom: getPas.poziom,
                statystyki: {
                    sila: getPas.sila,
                    zdrowie: getPas.zdrowie,
                    zwinnosc: getPas.zwinnosc,
                    zrecznosc: getPas.zrecznosc,
                    inteligencja: getPas.inteligencja,
                    pancerz: getPas.pancerz
                }
            }
        }
        else {
            pas = null;
        }


        //  console.log("Step 5");
        let spodnie = {};
        const getSpodnie = dane.find(item => item.typ === "Spodnie");
        if (getSpodnie) {
            spodnie = {
                nazwa: getSpodnie.nazwa,
                zestaw: getSpodnie.zestaw,
                cena: getSpodnie.cena,
                typ: getSpodnie.typ,
                ikona: getSpodnie.ikona,
                poziom_ulepszenia: getSpodnie.poziom_ulepszenia,
                poziom: getSpodnie.poziom,
                statystyki: {
                    sila: getSpodnie.sila,
                    zdrowie: getSpodnie.zdrowie,
                    zwinnosc: getSpodnie.zwinnosc,
                    zrecznosc: getSpodnie.zrecznosc,
                    inteligencja: getSpodnie.inteligencja,
                    pancerz: getSpodnie.pancerz
                }
            }
        }
        else {
            spodnie = null
        }



        // console.log("Step 6");
        let rekawice = {};
        const getRekawice = dane.find(item => item.typ === "Rękawice");
        if (getRekawice) {
            rekawice = {
                nazwa: getRekawice.nazwa,
                zestaw: getRekawice.zestaw,
                cena: getRekawice.cena,
                typ: getRekawice.typ,
                ikona: getRekawice.ikona,
                poziom_ulepszenia: getRekawice.poziom_ulepszenia,
                poziom: getRekawice.poziom,
                statystyki: {
                    sila: getRekawice.sila,
                    zdrowie: getRekawice.zdrowie,
                    zwinnosc: getRekawice.zwinnosc,
                    zrecznosc: getRekawice.zrecznosc,
                    inteligencja: getRekawice.inteligencja,
                    pancerz: getRekawice.pancerz
                }
            }
        }
        else {
            rekawice = null
        }

        // console.log("Step 7");
        let buty = {}
        const getButy = dane.find(item => item.typ === "Buty");
        if (getButy) {
            buty = {
                nazwa: getButy.nazwa,
                zestaw: getButy.zestaw,
                cena: getButy.cena,
                typ: getButy.typ,
                ikona: getButy.ikona,
                poziom_ulepszenia: getButy.poziom_ulepszenia,
                poziom: getButy.poziom,
                statystyki: {
                    sila: getButy.sila,
                    zdrowie: getButy.zdrowie,
                    zwinnosc: getButy.zwinnosc,
                    zrecznosc: getButy.zrecznosc,
                    inteligencja: getButy.inteligencja,
                    pancerz: getButy.pancerz
                }
            }
        } else {
            buty = null;
        }
        // console.log("Step 8");
        let bron = {};
        const getBron = dane.find(item => item.typ === "Broń");
        if (getBron) {
            bron = {
                nazwa: getBron.nazwa,
                zestaw: getBron.zestaw,
                cena: getBron.cena,
                typ: getBron.typ,
                ikona: getBron.ikona,
                poziom_ulepszenia: getBron.poziom_ulepszenia,
                poziom: getBron.poziom,
                statystyki: {
                    sila: getBron.sila,
                    zdrowie: getBron.zdrowie,
                    zwinnosc: getBron.zwinnosc,
                    zrecznosc: getBron.zrecznosc,
                    inteligencja: getBron.inteligencja,
                    pancerz: getBron.pancerz
                }
            }
        }
        else {
            bron = null;
        }
        // console.log("Step 9");
        let zwierze = {};
        const getZwierze = dane.find(item => item.typ === "Zwierze");
        if (getZwierze) {
            zwierze = {
                nazwa: getZwierze.nazwa,
                zestaw: getZwierze.zestaw,
                cena: getZwierze.cena,
                typ: getZwierze.typ,
                ikona: getZwierze.ikona,
                poziom_ulepszenia: getZwierze.poziom_ulepszenia,
                poziom: getZwierze.poziom,
                statystyki: {
                    sila: getZwierze.sila,
                    zdrowie: getZwierze.zdrowie,
                    zwinnosc: getZwierze.zwinnosc,
                    zrecznosc: getZwierze.zrecznosc,
                    inteligencja: getZwierze.inteligencja,
                    pancerz: getZwierze.pancerz
                }
            }
        }
        else {
            zwierze = null
        }
        // console.log("Step 10");
        let narzedzie = {}
        const getNarzedzie = dane.find(item => item.typ === "Narzędzie");
        if (getNarzedzie) {
            narzedzie = {
                nazwa: getNarzedzie.nazwa,
                zestaw: getNarzedzie.zestaw,
                cena: getNarzedzie.cena,
                typ: getNarzedzie.typ,
                ikona: getNarzedzie.ikona,
                poziom_ulepszenia: getNarzedzie.poziom_ulepszenia,
                poziom: getNarzedzie.poziom,
                statystyki: {
                    sila: getNarzedzie.sila,
                    zdrowie: getNarzedzie.zdrowie,
                    zwinnosc: getNarzedzie.zwinnosc,
                    zrecznosc: getNarzedzie.zrecznosc,
                    inteligencja: getNarzedzie.inteligencja,
                    pancerz: getNarzedzie.pancerz
                }
            }
        } else {
            narzedzie = null
        }

        /*if(helm===null && naszyjnik===null && odziez===null && pas===null && spodnie===null && rekawice===null && buty===null && bron===null && zwierze===null && narzedzie===null){
            return res.json("Brak ekwipunku")
        }*/
        res.json({ Helm: helm, Naszyjnik: naszyjnik, Odziez: odziez, Pas: pas, Spodnie: spodnie, Rekawice: rekawice, Buty: buty, Bron: bron, Zwierze: zwierze, Narzedzie: narzedzie })

    })
})


app.get('/zadanie-glowne/:nazwa_postaci', (req, res) => { // Funkcja obsługi żądania, wyświetlająca aktualne zadanie główne danej postaci
    const nazwa = req.params.nazwa_postaci;
    const sqlZadaniaGlowne = "SELECT z.id, z.nazwa, z.tresc, z.doswiadczenie, z.waluta, z.przedmiot_id, z.typ, z.wymagania, p.nazwa AS p_nazwa, p.rzadkosc, p.cena, p.typ, " +
        "p.ikona, p.poziom_ulepszenia, p.poziom, s.sila, s.zdrowie, s.zwinnosc, s.zrecznosc, s.inteligencja, s.pancerz, s.obrazeniaMin, s.obrazeniaMax FROM zadania AS z " +
        "LEFT JOIN przedmiot AS p ON z.przedmiot_id = p.id  " +
        "LEFT JOIN statystyki AS s ON p.Statystyki_id = s.id " +
        "WHERE z.id = ?";
    const sqlEtapG = "SELECT Zadania_glowne, Postep_zg FROM Postac WHERE nazwa = ?";
    db.query(sqlEtapG, [nazwa], (error, danepostaci) => {
        if (error) {
            console.error('Błąd zapytania SQL:', error);
            return res.status(500).json({ error: 'Błąd zapytania SQL' });
        }
        if (danepostaci.length > 0) {
            db.query(sqlZadaniaGlowne, [danepostaci[0].Zadania_glowne], (error, dane) => {
                if (error) {
                    console.error('Błąd zapytania SQL:', error);
                    return res.status(500).json({ error: 'Błąd zapytania SQL' });
                }

                if (dane.length > 0) {
                    const ZadanieGlowne = {
                        id: dane[0].id,
                        nazwa: dane[0].nazwa,
                        tresc: dane[0].tresc,
                        doswiadczenie: dane[0].doswiadczenie,
                        waluta: dane[0].waluta,
                        typ: dane[0].typ,
                        wymagania: dane[0].wymagania,
                        postep: danepostaci[0].Postep_zg,
                        prz_id: dane[0].przedmiot_id,
                        prz_nazwa: dane[0].p_nazwa,
                        prz_rzadkosc: dane[0].rzadkosc,
                        prz_cena: dane[0].cena,
                        prz_typ: dane[0].typ,
                        prz_ikona: dane[0].ikona,
                        prz_poziom_ulepszenia: dane[0].poziom_ulepszenia,
                        prz_poziom: dane[0].poziom,
                        sila: dane[0].sila,
                        zdrowie: dane[0].zdrowie,
                        zrecznosc: dane[0].zrecznosc,
                        zwinnosc: dane[0].zwinnosc,
                        inteligencja: dane[0].inteligencja,
                        pancerz: dane[0].pancerz,
                        obrazeniaMin: dane[0].obrazeniaMin,
                        obrazeniaMax: dane[0].obrazeniaMax
                    };
                    return res.status(200).json(ZadanieGlowne); // Zwrócenie danych o zadaniu
                } else {
                    console.log('Nie znaleziono zadania o id =', danepostaci[0].Zadania_glowne);
                    return res.status(404).json({ error: 'Nie znaleziono zadania o podanym id' });
                }
            });
        } else {
            console.log('Nie znaleziono takiej nazwy postaci: ', nazwa);
            return res.status(404).json({ error: 'Nie znaleziono takiej postaci' });
        }

    })

});

app.get('/zadanie-poboczne/:nazwa_postaci', (req, res) => { // Funkcja obsługi żądania, wyświetlająca aktualne zadanie poboczne danej postaci
    const nazwa = req.params.nazwa_postaci;
    const sqlZadaniaPoboczne = "SELECT z.id, z.nazwa, z.tresc, z.doswiadczenie, z.waluta, z.przedmiot_id, z.typ, z.wymagania, p.nazwa AS p_nazwa, p.rzadkosc, p.cena, p.typ, " +
        "p.ikona, p.poziom_ulepszenia, p.poziom, s.sila, s.zdrowie, s.zwinnosc, s.zrecznosc, s.inteligencja, s.pancerz, s.obrazeniaMin, s.obrazeniaMax FROM zadania AS z " +
        "LEFT JOIN przedmiot AS p ON z.przedmiot_id = p.id  " +
        "LEFT JOIN statystyki AS s ON p.Statystyki_id = s.id " +
        "WHERE z.id = ?";
    const sqlEtapP = "SELECT Zadania_poboczne, Postep_zp FROM Postac WHERE nazwa = ?";
    db.query(sqlEtapP, [nazwa], (error, danepostaci) => {
        if (error) {
            console.error('Błąd zapytania SQL:', error);
            return res.status(500).json({ error: 'Błąd zapytania SQL' });
        }
        if (danepostaci.length > 0) {

            db.query(sqlZadaniaPoboczne, [danepostaci[0].Zadania_poboczne], (error, dane) => {
                if (error) {
                    console.error('Błąd zapytania SQL:', error);
                    return res.status(500).json({ error: 'Błąd zapytania SQL' });
                }

                if (dane.length > 0) {
                    const ZadaniePoboczne = {
                        id: dane[0].id,
                        nazwa: dane[0].nazwa,
                        tresc: dane[0].tresc,
                        doswiadczenie: dane[0].doswiadczenie,
                        waluta: dane[0].waluta,
                        typ: dane[0].typ,
                        wymagania: dane[0].wymagania,
                        postep: danepostaci[0].Postep_zp,
                        prz_id: dane[0].przedmiot_id,
                        prz_nazwa: dane[0].p_nazwa,
                        prz_rzadkosc: dane[0].rzadkosc,
                        prz_cena: dane[0].cena,
                        prz_typ: dane[0].typ,
                        prz_ikona: dane[0].ikona,
                        prz_poziom_ulepszenia: dane[0].poziom_ulepszenia,
                        prz_poziom: dane[0].poziom,
                        sila: dane[0].sila,
                        zdrowie: dane[0].zdrowie,
                        zrecznosc: dane[0].zrecznosc,
                        zwinnosc: dane[0].zwinnosc,
                        inteligencja: dane[0].inteligencja,
                        pancerz: dane[0].pancerz,
                        obrazeniaMin: dane[0].obrazeniaMin,
                        obrazeniaMax: dane[0].obrazeniaMax
                    };
                    return res.status(200).json(ZadaniePoboczne); // Zwrócenie danych o zadaniu
                } else {
                    console.log('Nie znaleziono zadania o id =', danepostaci[0].Zadania_poboczne);
                    return res.status(404).json({ error: 'Nie znaleziono zadania o podanym id' });
                }
            });
        } else {
            console.log('Nie znaleziono takiej nazwy postaci: ', nazwa);
            return res.status(404).json({ error: 'Nie znaleziono takiej postaci' });
        }
    })
});

app.get('/zadanie-dnia/:nazwa_postaci', (req, res) => {// Funkcja obsługi żądania, wyświetlająca aktualne zadanie dnia
    const nazwa = req.params.nazwa_postaci;
    const sqlZadanieDnia = "SELECT z.id, z.nazwa, z.tresc, z.doswiadczenie, z.waluta, z.przedmiot_id, z.typ, z.wymagania, p.nazwa AS p_nazwa, p.rzadkosc, p.cena, p.typ, " +
        "p.ikona, p.poziom_ulepszenia, p.poziom, s.sila, s.zdrowie, s.zwinnosc, s.zrecznosc, s.inteligencja, s.pancerz, s.obrazeniaMin, s.obrazeniaMax FROM zadania AS z " +
        "LEFT JOIN przedmiot AS p ON z.przedmiot_id = p.id  " +
        "LEFT JOIN statystyki AS s ON p.Statystyki_id = s.id " +
        "WHERE z.id = ?";

    const sqlSprawdzZadanie = "SELECT Zadania_id FROM zadanie_dnia WHERE id = 1";
    db.query(sqlSprawdzZadanie, (errZ, daneZ) => {
        if (errZ) {
            console.log(errZ)
            console.log("Nie udało się pobrać id zadania dnia")
            return;
        }
        db.query(sqlZadanieDnia, [daneZ[0].Zadania_id], (error, dane) => {
            if (error) {
                console.error('Błąd zapytania SQL:', error);
                return res.status(500).json({ error: 'Błąd zapytania SQL' });
            }
            if (dane.length > 0) {
                const sqlPostep = "SELECT Postep_zd FROM postac WHERE nazwa = ?"
                db.query(sqlPostep, nazwa, (errP, daneP) => {
                    if (errP) {
                        console.log(errP)
                        console.log("Nie udało się pobrać postępu")
                        return;
                    }
                    const ZadanieDnia = {
                        id: dane[0].id,
                        nazwa: dane[0].nazwa,
                        tresc: dane[0].tresc,
                        doswiadczenie: dane[0].doswiadczenie,
                        waluta: dane[0].waluta,
                        typ: dane[0].typ,
                        wymagania: dane[0].wymagania,
                        postep: daneP[0].Postep_zd,
                        prz_id: dane[0].przedmiot_id,
                        prz_nazwa: dane[0].p_nazwa,
                        prz_rzadkosc: dane[0].rzadkosc,
                        prz_cena: dane[0].cena,
                        prz_typ: dane[0].typ,
                        prz_ikona: dane[0].ikona,
                        prz_poziom_ulepszenia: dane[0].poziom_ulepszenia,
                        prz_poziom: dane[0].poziom,
                        sila: dane[0].sila,
                        zdrowie: dane[0].zdrowie,
                        zrecznosc: dane[0].zrecznosc,
                        zwinnosc: dane[0].zwinnosc,
                        inteligencja: dane[0].inteligencja,
                        pancerz: dane[0].pancerz,
                        obrazeniaMin: dane[0].obrazeniaMin,
                        obrazeniaMax: dane[0].obrazeniaMax
                    };
                    return res.status(200).json(ZadanieDnia); // Zwrócenie danych o zadaniu
                })
            } else {
                console.log('Nie znaleziono zadania o id =', daneZ[0].Zadania_id);
                return res.status(404).json({ error: 'Nie znaleziono zadania o podanym id' });
            }
        });
    })
});



app.post('/zakonczZadanie/:nazwa_postaci/:id', (req, res) => {
    const nazwaPostaci = req.params.nazwa_postaci;
    const zadanie = req.params.id;
    const sqlZadanie = "SELECT przedmiot_id, waluta, doswiadczenie FROM zadania WHERE id = ?"
    db.query(sqlZadanie, zadanie, (errZ, daneZ) => {
        if (errZ) {
            console.log(errZ)
            console.log("Nie udało się pobrać danych zadania")
            return;
        }
        const sqlPostac = "SELECT id, doswiadczenie FROM postac WHERE nazwa = ?"
        db.query(sqlPostac, nazwaPostaci, (errP, daneP) => {
            if (errP) {
                console.log(errP)
                console.log("Nie udało się pobrać id postaci")
                return;
            }
            if (daneZ[0].przedmiot_id !== null) {
                const sqlPrzedmiot = "SELECT m.id, m.przedmiot_id, m.Postac_id, p.typ FROM magazyn AS m " +
                    "LEFT JOIN przedmiot AS p ON m.przedmiot_id = p.id " +
                    "WHERE m.przedmiot_id = ? AND m.Postac_id = ?"

                db.query(sqlPrzedmiot, [daneZ[0].przedmiot_id, daneP[0].id], (errPrz, danePrz) => {
                    if (errPrz) {
                        console.log(errPrz)
                        console.log("Nie udało się pobrać przedmiotu")
                        return;
                    }
                    if (danePrz.length === 0) {
                        console.log("Gracz nie posiada odebranego przedmiotu")
                        const sqlDodajDoMagazynu = "INSERT INTO magazyn (`przedmiot_id`, `ilosc`, `zalozone`, `Postac_id`) VALUES (?)"
                        const dane = [
                            daneZ[0].przedmiot_id,
                            1,
                            0,
                            daneP[0].id
                        ]
                        db.query(sqlDodajDoMagazynu, [dane], (errMag) => {
                            if (errMag) {
                                console.log(errMag)
                                console.log("Nie udało się dodać do magazynu")
                                return;
                            }
                        })
                    }
                    else {
                        if (danePrz[0].typ === "Produkt") {
                            const sqlDodaj = "UPDATE magazyn SET ilosc = ilosc + 1 WHERE id = ?"
                            db.query(sqlDodaj, danePrz[0].id, (errD) => {
                                if (errD) {
                                    console.log(errD)
                                    console.log("Nie udalo się dodac produktu")
                                    return;
                                }
                            })
                        }
                        else {
                            const sqlDodajDoMagazynu = "INSERT INTO magazyn (`przedmiot_id`, `ilosc`, `zalozone`, `Postac_id`) VALUES (?)"
                            const dane = [
                                daneZ[0].przedmiot_id,
                                1,
                                0,
                                daneP[0].id
                            ]
                            db.query(sqlDodajDoMagazynu, [dane], (errMag) => {
                                if (errMag) {
                                    console.log(errMag)
                                    console.log("Nie udało się dodać do magazynu")
                                    return;
                                }
                            })
                        }
                    }
                })
            }
            const sqlSprawdzPoziom = `SELECT * FROM poziomy WHERE wymagane_doswiadczenie <= ? ORDER BY wymagane_doswiadczenie DESC LIMIT 1`
            const valuesPoziom = [
                daneP[0].doswiadczenie + daneZ[0].doswiadczenie
            ]
            db.query(sqlSprawdzPoziom, valuesPoziom, (errD, daneNagroda) => {
                if (zadanie < 31) {
                    const sqlAktualizujPostac = "UPDATE postac SET miedziaki = miedziaki + ?, doswiadczenie = doswiadczenie + ?, poziom = ?, Zadania_Glowne = Zadania_Glowne + ?, Postep_zg = 0 WHERE nazwa = ?"
                    db.query(sqlAktualizujPostac, [daneZ[0].waluta, daneZ[0].doswiadczenie, daneNagroda[0].id, 1, nazwaPostaci], (errAkt) => {
                        if (errAkt) {
                            console.log(errAkt)
                            console.log("Nie udało się aktualizować postaci")
                            return;
                        }
                    })
                }
                else if (zadanie < 121) {
                    const sqlAktualizujPostac = "UPDATE postac SET miedziaki = miedziaki + ?, doswiadczenie = doswiadczenie + ?, poziom = ?, Zadania_Poboczne = Zadania_Poboczne + ?, Postep_zp = 0 WHERE nazwa = ?"
                    db.query(sqlAktualizujPostac, [daneZ[0].waluta, daneZ[0].doswiadczenie, daneNagroda[0].id, 1, nazwaPostaci], (errAkt) => {
                        if (errAkt) {
                            console.log(errAkt)
                            console.log("Nie udało się aktualizować postaci")
                            return;
                        }
                    })
                } else {
                    const sqlAktualizujPostac = "UPDATE postac SET miedziaki = miedziaki + ?, doswiadczenie = doswiadczenie + ?, poziom = ?, Postep_zd = 100000 WHERE nazwa = ?"
                    db.query(sqlAktualizujPostac, [daneZ[0].waluta, daneZ[0].doswiadczenie, daneNagroda[0].id, nazwaPostaci], (errAkt) => {
                        if (errAkt) {
                            console.log(errAkt)
                            console.log("Nie udało się aktualizować postaci")
                            return;
                        }
                    })
                }
                return res.json({ Message: "Odebrano" })
            })
        })
    })
});


app.get('/wiadomosci/:nazwa_postaci', (req, res) => { // Funkcja obsługi żądania, wyświetlająca korespondecje danej postaci
    const nazwaPostaci = req.params.nazwa_postaci;
    const sqlWiadomosci = "SELECT w.id, n.nazwa AS n_nazwa, o.nazwa AS o_nazwa, w.tytul, w.tresc, w.data, w.odebrane FROM wiadomosci AS w INNER JOIN postac AS n ON w.nadawca_id = n.id INNER JOIN postac AS o ON w.odbiorca_id = o.id WHERE w.odbiorca_id = ? OR w.nadawca_id = ? ORDER BY w.data DESC";
    const sqlPostacid = "SELECT id FROM Postac WHERE nazwa = ?";

    db.query(sqlPostacid, [nazwaPostaci], (error, danepostaci) => {
        if (error) {
            console.error('Błąd zapytania SQL:', error);
            return res.status(500).json({ error: 'Błąd zapytania SQL' });
        }
        if (danepostaci.length > 0) {
            db.query(sqlWiadomosci, [danepostaci[0].id, danepostaci[0].id], (error, dane) => {
                if (error) {
                    console.error('Błąd zapytania SQL:', error);
                    return res.status(500).json({ error: 'Błąd zapytania SQL' });
                }

                return res.status(200).json(dane); // Zwrócenie danych wiadomości
            });
        } else {
            return res.status(404).json({ error: 'Nie znaleziono takiej postaci' });
        }
    });
});


app.post('/napiszWiadomosc/:nadawca', (req, res) => { // Funkcja obsługi żądania typu POST, dodająca nową wiadomość do bazy
    const nadawca = req.params.nadawca;
    const sqlPostacId = "SELECT id FROM postac WHERE nazwa = ?"; // Zapytanie pobierające id nadawcy
    const sqlNazwaPostaci = "SELECT nazwa FROM postac WHERE nazwa = ?"; // Zapytanie pobierające nazwę odbiorcy
    const sqlWiadomosc = "INSERT INTO wiadomosci (`nadawca_id`,`odbiorca_id`,`tytul`,`tresc`,`data`,`odebrane`) VALUES (?)";
    db.query(sqlNazwaPostaci, [req.body.odbiorca], (error, dane) => {
        if (error) {
            console.log("Blad nazwy uzytkownika")
        }
        if (dane.length === 0) {
            return res.json("bladOdbiorca")
        }
        else {
            db.query(sqlPostacId, [nadawca], (error, nadawcadane) => {
                if (error) {
                    console.error('Błąd zapytania SQL:', error);
                    return res.status(500).json({ error: 'Błąd zapytania SQL' });
                }
                if (nadawcadane.length > 0) {
                    db.query(sqlPostacId, [req.body.odbiorca], (error2, odbiorcadane) => {
                        if (error) {
                            console.error('Błąd zapytania SQL:', error2);
                            return res.status(500).json({ error2: 'Błąd zapytania SQL' });
                        }
                        if (odbiorcadane.length > 0) {
                            const values = [ // Tablica wartości rekordu dodawanego do bazy
                                nadawcadane[0].id,
                                odbiorcadane[0].id,
                                req.body.tytul,
                                req.body.tresc,
                                new Date(),
                                0
                            ]
                            db.query(sqlWiadomosc, [values], (err, data) => {
                                if (err) {
                                    console.log("Blad 1")
                                }
                                return res.json("Wysłano")
                            })
                        } else {

                            return res.status(404).json({ error: 'Nie znaleziono takiej postaci' });
                        }
                    });
                } else {

                    return res.status(404).json({ error: 'Nie znaleziono takiej postaci' });
                }
            });
        }
    })
});


app.post('/odebrany/:id_w', (req, res) => { // Funkcja obsługi żądania typu POST, ustawiająca status wiadomości na odebrane
    const id = req.params.id_w;
    const sqlOdebrane = "UPDATE wiadomosci SET odebrane = 1 WHERE id = ?";

    db.query(sqlOdebrane, [id], (error, dane) => {
        if (error) {
            console.error('Błąd zapytania SQL:', error);
            return res.status(500).json({ error: 'Błąd zapytania SQL' });
        } else if (dane.affectedRows === 0) {
            return res.status(404).json({ error: 'Nie znaleziono takiej wiadomości' });
        } else {
            return res.status(200).json({ message: 'Wiadomość została oznaczona jako odebrana' });
        }
    });
});


app.get('/odpowiedz/:id', (req, res) => { // Funkcja obsługi żądania, pobierająca dane wiadomości, na którą odpowiedzieć chce gracz
    const id = req.params.id;
    const sqlWiadomosc = "SELECT p.nazwa, w.tytul, w.tresc FROM Wiadomosci AS w INNER JOIN Postac AS p ON w.nadawca_id = p.id WHERE w.id = ?";
    db.query(sqlWiadomosc, [id], (error, danewiadomosci) => {
        if (error) {
            console.error('Błąd zapytania SQL:', error);
            return res.status(500).json({ error: 'Błąd zapytania SQL' });
        }
        if (danewiadomosci.length > 0) {
            const wiadomosc = danewiadomosci[0];
            return res.status(200).json(wiadomosc); // Zwrócenie danych wiadomości
        } else {
            console.log('Nie znaleziono takiej wiadomosci');
            return res.status(404).json({ error: 'Nie znaleziono takiej wiadomosci' });
        }

    })

});


app.get('/poziompostaci/:nazwa_postaci', (req, res) => {
    const nazwa = req.params.nazwa_postaci;
    const sqlPoziomPostaci = "SELECT p.poziom FROM postac as p WHERE p.nazwa = ?";
    db.query(sqlPoziomPostaci, [nazwa], (error, dane) => {
        if (error) {
            console.error('Błąd zapytania SQL:', error);
            return res.status(500).json({ error: 'Błąd zapytania SQL' });
        }
        if (dane.length > 0) {
            const poziomPostaci = dane[0].poziom;
            return res.json({ PoziomPostaci: poziomPostaci });
        } else {
            console.log('Nie znaleziono poziomu');
        }
    })
});

app.get('/miedziaki/:nazwa_postaci', (req, res) => {
    const nazwa = req.params.nazwa_postaci;
    const sqlMiedziaki = "SELECT p.miedziaki FROM postac as p WHERE p.nazwa = ?";
    db.query(sqlMiedziaki, [nazwa], (error, dane) => {
        if (error) {
            console.error('Błąd zapytania SQL:', error);
            return res.status(500).json({ error: 'Błąd zapytania SQL' });
        }
        if (dane.length > 0) {
            const miedziaki = dane[0].miedziaki;
            return res.json({ Miedziaki: miedziaki });
        } else {
            console.log('Nie znaleziono poziomu');
        }
    })
});


app.get('/magazyn/:nazwa_postaci', (req, res) => {
    const nazwa = req.params.nazwa_postaci;
    const sqlMagazyn = "SELECT prz.id,prz.nazwa,m.id AS mID,m.zalozone,m.ilosc,prz.zestaw, prz.poziom, prz.rzadkosc, prz.ikona, prz.cena, s.obrazeniaMax, s.obrazeniaMin, prz.poziom_ulepszenia, prz.typ, s.sila, s.zdrowie, s.zwinnosc, s.zrecznosc, s.inteligencja, s.pancerz FROM magazyn as m" +
        " INNER JOIN postac as po ON m.Postac_id = po.id" +
        " INNER JOIN przedmiot as prz ON prz.id = m.przedmiot_id" +
        " INNER JOIN statystyki as s ON prz.Statystyki_id = s.id" +
        " WHERE po.nazwa = ?";

    db.query(sqlMagazyn, [nazwa], (error, dane) => {
        if (error) {
            console.log(error);
            console.log("Blad pobrania magazynu");
            return;
        }
        if (dane.length === 0) {
            console.log("Brak przedmiotow w magazynie");
        }

        const magazyn = {
            przedmioty: []
        };

        if (dane.length > 0) {

            dane.forEach((przedmiot) => {
                const przedmiotInfo = {
                    mID: przedmiot.mID,
                    ID: przedmiot.id,
                    nazwa: przedmiot.nazwa,
                    zestaw: przedmiot.zestaw,
                    cena: przedmiot.cena,
                    typ: przedmiot.typ,
                    rzadkosc: przedmiot.rzadkosc,
                    ikona: przedmiot.ikona,
                    ilosc: przedmiot.ilosc,
                    poziom_ulepszenia: przedmiot.poziom_ulepszenia,
                    poziom: przedmiot.poziom,
                    zalozone: przedmiot.zalozone,
                    obrazeniaMax: przedmiot.obrazeniaMax,
                    obrazeniaMin: przedmiot.obrazeniaMin,
                    statystyki: {
                        sila: przedmiot.sila,
                        zdrowie: przedmiot.zdrowie,
                        zwinnosc: przedmiot.zwinnosc,
                        zrecznosc: przedmiot.zrecznosc,
                        inteligencja: przedmiot.inteligencja,
                        pancerz: przedmiot.pancerz
                    }
                };
                magazyn.przedmioty.push(przedmiotInfo);
            });

        }

        const sqlMagazynProdukty = "SELECT prz.id,prz.nazwa,m.id AS mID,m.zalozone,m.ilosc, prz.poziom,prz.zestaw, prz.rzadkosc, prz.ikona, prz.cena, prz.typ FROM magazyn as m" +
            " INNER JOIN postac as po ON m.Postac_id = po.id" +
            " INNER JOIN przedmiot as prz ON prz.id = m.przedmiot_id" +
            " WHERE po.nazwa = ? AND prz.typ = 'Produkt'"

        db.query(sqlMagazynProdukty, [nazwa], (errPro, danePro) => {

            if (errPro) {
                console.log(error);
                console.log("Blad pobrania magazynu");
                return;
            }
            if (danePro.length === 0) {
                console.log("Brak produktow w magazynie");
            }
            if (danePro.length > 0) {
                danePro.forEach((przedmiot) => {
                    const przedmiotInfo = {
                        mID: przedmiot.mID,
                        ID: przedmiot.id,
                        nazwa: przedmiot.nazwa,
                        zestaw: przedmiot.zestaw,
                        cena: przedmiot.cena,
                        typ: przedmiot.typ,
                        rzadkosc: przedmiot.rzadkosc,
                        ikona: przedmiot.ikona,
                        ilosc: przedmiot.ilosc,
                        poziom_ulepszenia: null,
                        poziom: przedmiot.poziom,
                        zalozone: przedmiot.zalozone,
                        obrazeniaMax: null,
                        obrazeniaMin: null,
                        statystyki: {
                            sila: null,
                            zdrowie: null,
                            zwinnosc: null,
                            zrecznosc: null,
                            inteligencja: null,
                            pancerz: null
                        }
                    };


                    magazyn.przedmioty.push(przedmiotInfo);
                });
            }
            res.json({ Magazyn: magazyn });
        })

    });
});


app.get('/sklep/:nazwa_postaci', async (req, res) => { // Funkcja obsługi żądania, pobierająca dane przedmiotów do kupienia
    const nazwa = req.params.nazwa_postaci;
    const sqlSklep = "SELECT s.id, s.data, s.Postac_id FROM sklep AS s INNER JOIN postac AS p ON s.Postac_id = p.id WHERE p.nazwa = ?" // Sprawdzenie, czy sklep już był kiedykolwiek generowany dla danej postaci
    db.query(sqlSklep, [nazwa], (errorSklep, daneSklep) => {
        if (errorSklep) {
            console.log(errorSklep);
            console.log("Blad pobrania informacji ze sklepu")
            return;
        }
        if (daneSklep.length === 0) { // Jeśli nie, sklep jest generowany
            const sqlPostac = "SELECT id, poziom FROM postac WHERE nazwa = ?"
            db.query(sqlPostac, [nazwa], (errorPostac, danePostac) => {
                if (errorPostac) {
                    console.log(errorPostac)
                    console.log("Blad pobierania danych postaci")
                    return;
                }
                const sqlStworzSklep = "INSERT INTO Sklep (`data`,`Postac_id`) VALUES (?,?)" // Dodanie rekordu do tabeli informującego o postaci do której przypisany jest dany sklep, oraz dacie ostatniego odświeżenia przedmiotów w sklepie
                const obecnadata = new Date();
                db.query(sqlStworzSklep, [obecnadata, danePostac[0].id], (err4, daneSklep) => {
                    if (err4) {
                        console.log("Blad sklep")

                    } else {
                        const sqlDostepnePrzedmioty = "SELECT id FROM Przedmiot WHERE poziom <= ? AND rzadkosc = 'pospolity' AND poziom_ulepszenia = 0 AND Statystyki_id > 0" // Pobranie dostępnych przedmiotów, które mogą pojawić się w sklepie dla danej postaci
                        db.query(sqlDostepnePrzedmioty, [danePostac[0].poziom], (err5, daneDostPrzed) => {
                            if (err5) {
                                console.log("Blad dostepnych przedmiotow")
                            } else {
                                const wylosowanePrzedmioty = [];
                                while (wylosowanePrzedmioty.length < 10) { // Z puli dostępnych przedmiotów, losowanych jest 10
                                    const nowyPrzedmiot = Math.floor(Math.random() * daneDostPrzed.length);
                                    if (!wylosowanePrzedmioty.includes(nowyPrzedmiot)) {
                                        wylosowanePrzedmioty.push(nowyPrzedmiot);
                                    }
                                }
                                const sqlPrzedmiotySklep = "INSERT INTO Sklep_przedmiot (`Przedmiot_id`,`Sklep_id`,`Czy_wykupione`) VALUES (?,?,?)"
                                for (let i = 0; i < 10; i++) { // Dodanie wylosowanych przedmiotów do sklepu danej postaci

                                    db.query(sqlPrzedmiotySklep, [daneDostPrzed[wylosowanePrzedmioty[i]].id, daneSklep.insertId, 0], (err6) => {
                                        if (err6) {
                                            console.log("Blad dodawania przedmiotow do sklepu")
                                        }
                                    })
                                }
                                return res.json({ Message: "Sklep wygenerowany" })
                            }
                        })
                    }
                })
            })

        } else { // Jeśli sklep był już kiedykolwiek generowany dla danej postaci, generowany zostaje nowy sklep codziennie po północy
            const obecnadata = new Date();
            if (daneSklep[0].data.getDay() != obecnadata.getDay()) { // Sprawdzenie, czy nowy sklep nie był jeszcze dzisiaj generowany
                const sqlPostac = "SELECT id, poziom FROM postac WHERE nazwa = ?" // Dane postaci
                db.query(sqlPostac, [nazwa], (errorPostac, danePostac) => {
                    if (errorPostac) {
                        console.log(errorPostac)
                        console.log("Blad pobierania danych postaci")
                        return;
                    }

                    const sqlModyfikujSklep = "UPDATE Sklep Set `data` = ? WHERE Postac_id = ?" // Modyfikacja rekordu w bazie, aby zaznaczyć, że dzisiaj sklep był już aktualizowany
                    db.query(sqlModyfikujSklep, [obecnadata, danePostac[0].id], (err4) => {
                        if (err4) {
                            console.log("Blad aktualizacji sklepu")

                        } else {
                            db.query("SELECT id FROM Sklep WHERE Postac_id = ?", [danePostac[0].id], (errorID, daneID) => {
                                if (errorID) {
                                    console.log("Blad podczas pobierania id ostatniej modyfikacji")
                                } else {
                                    const sqlPrzedmiotyWSklepie = "SELECT id FROM sklep_przedmiot WHERE Sklep_id = ?" // Pobranie rekordów o przedmiotach w sklepie, które będą podmieniane
                                    db.query(sqlPrzedmiotyWSklepie, [daneID[0].id], (errPrzedmioty, danePrzedSklep) => {
                                        if (errPrzedmioty) {
                                            console.log("Blad pobrania id elementow sklepu")
                                        } else {
                                            if (danePostac[0].poziom < 5) { // Jeśli postać jest na poziomie mniejszym niż 5, szanse na wylosowanie przedmiotu o danych rzadkościach są następujące: pospolity - 100%
                                                const sqlDostepnePrzedmioty = "SELECT id FROM Przedmiot WHERE poziom <= ? AND rzadkosc = 'pospolity' AND poziom_ulepszenia = 0 AND Statystyki_id > 0" // Pobranie dostępnych przedmiotów
                                                db.query(sqlDostepnePrzedmioty, [danePostac[0].poziom], (err5, daneDostPrzed) => {
                                                    if (err5) {
                                                        console.log("Blad dostepnych przedmiotow")
                                                    } else {
                                                        const wylosowanePrzedmioty = [];
                                                        while (wylosowanePrzedmioty.length < 10) { // Losowanie 10 przedmiotów z puli dostępnych przedmiotów
                                                            const nowyPrzedmiot = Math.floor(Math.random() * daneDostPrzed.length);
                                                            if (!wylosowanePrzedmioty.includes(nowyPrzedmiot)) { // Sprawdzenie czy wylosowany przedmiot nie był jeszcze dodawany do zbioru wylosowanych przedmiotów w celu uniknięcia duplikatów
                                                                wylosowanePrzedmioty.push(nowyPrzedmiot);
                                                            }
                                                        }
                                                        const sqlPrzedmiotySklep = "UPDATE Sklep_przedmiot SET Przedmiot_id = ?, Czy_wykupione = ? WHERE id = ?" // Modyfikowanie rekordów w bazie na dane o nowo wylosowanych przedmiotach w sklepie
                                                        for (let i = 0; i < 10; i++) { // Do zmodyfikowania jest 10 rekordów
                                                            db.query(sqlPrzedmiotySklep, [daneDostPrzed[wylosowanePrzedmioty[i]].id, 0, danePrzedSklep[i].id], (err6) => {

                                                                if (err6) {
                                                                    console.log(err6)
                                                                    console.log("Blad dodawania przedmiotow do sklepu")
                                                                }
                                                            })
                                                        }
                                                        return res.json({ Message: "Sklep wygenerowany" })
                                                    }
                                                })

                                            } else if (danePostac[0].poziom < 15) { // Jeśli postać jest na poziomie mniejszym niż 15, szanse na wylosowanie przedmiotu o danych rzadkościach są następujące: pospolity - 85%, rzadki - 15%
                                                let pospolity = 0 // Wylosowana liczba przedmiotów pospolitych
                                                let rzadki = 0 // Wylosowana liczba przedmiotów rzadkich
                                                let rzadkosc = 0 // Losowana liczba, która będzie wyznaczać jaka rzadkość przedmiotu została wylosowana
                                                for (let i = 0; i < 10; i++) { // Losowanie 10 rzadkości przedmiotów
                                                    rzadkosc = Math.floor(Math.random() * 100) + 1
                                                    if (rzadkosc < 86) // Jeśli wylosowana liczba znajduje się w przedziale 1 - 85, zwiększany jest licznik przedmiotów pospolitych
                                                        pospolity++
                                                    else // W przeciwnym przypadku (86 - 100) zwiększany jest licznik przedmiotów rzadkich
                                                        rzadki++
                                                }
                                                const sqlDostepnePrzedmiotyPospolite = "SELECT id FROM Przedmiot WHERE poziom <= ? AND rzadkosc = 'pospolity' AND poziom_ulepszenia = 0 AND Statystyki_id > 0" // Pobranie dostępnych przedmiotów pospolitych
                                                const sqlDostepnePrzedmiotyRzadkie = "SELECT id FROM Przedmiot WHERE poziom <= ? AND rzadkosc = 'rzadki' AND poziom_ulepszenia = 0 AND Statystyki_id > 0" // Pobranie dostępnych przedmiotów rzadkich
                                                db.query(sqlDostepnePrzedmiotyPospolite, [danePostac[0].poziom], (errPosp, danePrzedPosp) => {
                                                    if (errPosp) {
                                                        console.log("Blad dostepnych przedmiotow pospolitych")
                                                    } else {
                                                        db.query(sqlDostepnePrzedmiotyRzadkie, [danePostac[0].poziom], (errRzad, danePrzedRzad) => {
                                                            if (errRzad) {
                                                                console.log("Blad dostepnych przedmiotow rzadkich")
                                                            } else {
                                                                const wylosowanePrzedmioty = [];
                                                                while (wylosowanePrzedmioty.length < pospolity) { // Losowanie pospolitych przedmiotów
                                                                    const nowyPrzedmiot = Math.floor(Math.random() * danePrzedPosp.length);
                                                                    if (!wylosowanePrzedmioty.includes(nowyPrzedmiot)) {
                                                                        wylosowanePrzedmioty.push(nowyPrzedmiot);
                                                                    }
                                                                }
                                                                while (wylosowanePrzedmioty.length < 10) { // Losowanie rzadkich przedmiotów
                                                                    const nowyPrzedmiot = Math.floor(Math.random() * danePrzedRzad.length) + danePrzedPosp.length; // Losowanie w przedziale danePrzedPosp.length - (danePrzedPosp.length + danePrzedRzad.length) w celu uniknięcia duplikatowania się indeksów przedmiotów pospolitych z przedmiotami rzadkimi w zbiorze oraz wyraźnym oddzieleniu przedmiotów pospolitych od rzadkich
                                                                    if (!wylosowanePrzedmioty.includes(nowyPrzedmiot)) {
                                                                        wylosowanePrzedmioty.push(nowyPrzedmiot);
                                                                    }
                                                                }
                                                                const sqlPrzedmiotySklep = "UPDATE Sklep_przedmiot SET Przedmiot_id = ?, Czy_wykupione = ? WHERE id = ?" // Modyfikacja rekordów w bazie na dane nowo wylosowanych przedmiotów w sklepie
                                                                for (let i = 0; i < pospolity; i++) { // Modyfikacja danymi o przedmiotach pospolitych
                                                                    db.query(sqlPrzedmiotySklep, [danePrzedPosp[wylosowanePrzedmioty[i]].id, 0, danePrzedSklep[i].id], (err6) => {

                                                                        if (err6) {
                                                                            console.log("Blad dodawania przedmiotow do sklepu")
                                                                        }
                                                                    })
                                                                }
                                                                for (let i = pospolity; i < 10; i++) { // Modyfikacja danymi o przedmiotach rzadkich
                                                                    db.query(sqlPrzedmiotySklep, [danePrzedRzad[wylosowanePrzedmioty[i] - danePrzedPosp.length].id, 0, danePrzedSklep[i].id], (err6) => { // Należy wykonać działanie (danePrzedRzad[wylosowanePrzedmioty[i] - danePrzedPosp.length]) w celu prawidłowego pobrania przedmiotu z danePrzedRzad (konieczne jest powrócenie do indesków rozpoczynających się od 0)

                                                                        if (err6) {
                                                                            console.log("Blad dodawania przedmiotow do sklepu")
                                                                        }
                                                                    })
                                                                }
                                                                return res.json({ Message: "Sklep wygenerowany" })
                                                            }

                                                        })

                                                    }
                                                })

                                            } else if (danePostac[0].poziom < 25) { // Jeśli postać jest na poziomie mniejszym niż 25, szanse na wylosowanie przedmiotu o danych rzadkościach są następujące: pospolity - 70%, rzadki - 20%, epicki - 10%
                                                let pospolity = 0 // Wylosowana liczba przedmiotów pospolitych
                                                let rzadki = 0 // Wylosowana liczba przedmiotów rzadkich
                                                let epicki = 0 // Wylosowana liczba przedmiotów epickich
                                                let rzadkosc = 0 // Losowana liczba, która będzie wyznaczać jaka rzadkość przedmiotu została wylosowana
                                                for (let i = 0; i < 10; i++) { // Losowanie 10 rzadkości przedmiotów
                                                    rzadkosc = Math.floor(Math.random() * 100) + 1
                                                    if (rzadkosc < 71) // Jeśli wylosowana została liczba z przedziału 1 - 70, zwiększany jest licznik przedmiotów pospolitych
                                                        pospolity++
                                                    else if (rzadkosc < 91) // Jeśli wylosowana została liczba z przedziału 71 - 90, zwiększany jest licznik przedmiotów rzadkich
                                                        rzadki++
                                                    else // W przeciwnym przypadku (91 - 100), zwiększany jest licznik przedmiotów epickich
                                                        epicki++
                                                }
                                                const sqlDostepnePrzedmiotyPospolite = "SELECT id FROM Przedmiot WHERE poziom <= ? AND rzadkosc = 'pospolity' AND poziom_ulepszenia = 0 AND Statystyki_id > 0" // Pobranie dostępnych przedmiotów pospolitych
                                                const sqlDostepnePrzedmiotyRzadkie = "SELECT id FROM Przedmiot WHERE poziom <= ? AND rzadkosc = 'rzadki' AND poziom_ulepszenia = 0 AND Statystyki_id > 0" // Pobranie dostępnych przedmiotów rzadkich
                                                const sqlDostepnePrzedmiotyEpickie = "SELECT id FROM Przedmiot WHERE poziom <= ? AND rzadkosc = 'epicki' AND poziom_ulepszenia = 0 AND Statystyki_id > 0" // Pobranie dostępnych przedmiotów epickich
                                                db.query(sqlDostepnePrzedmiotyPospolite, [danePostac[0].poziom], (errPosp, danePrzedPosp) => {
                                                    if (errPosp) {
                                                        console.log("Blad dostepnych przedmiotow pospolitych")
                                                    } else {
                                                        db.query(sqlDostepnePrzedmiotyRzadkie, [danePostac[0].poziom], (errRzad, danePrzedRzad) => {
                                                            if (errRzad) {
                                                                console.log("Blad dostepnych przedmiotow rzadkich")
                                                            } else {
                                                                db.query(sqlDostepnePrzedmiotyEpickie, [danePostac[0].poziom], (errEpic, danePrzedEpic) => {
                                                                    if (errEpic) {
                                                                        console.log("Blad dostepnych przedmiotow epickich")
                                                                    } else {
                                                                        const wylosowanePrzedmioty = [];
                                                                        while (wylosowanePrzedmioty.length < pospolity) { // Losowanie pospolitych przedmiotów
                                                                            const nowyPrzedmiot = Math.floor(Math.random() * danePrzedPosp.length);
                                                                            if (!wylosowanePrzedmioty.includes(nowyPrzedmiot)) {
                                                                                wylosowanePrzedmioty.push(nowyPrzedmiot);
                                                                            }
                                                                        }
                                                                        while (wylosowanePrzedmioty.length < pospolity + rzadki) { // Losowanie rzadkich przedmiotów
                                                                            const nowyPrzedmiot = Math.floor(Math.random() * danePrzedRzad.length) + danePrzedPosp.length; // Losowanie w przedziale danePrzedPosp.length - (danePrzedPosp.length + danePrzedRzad.length) w celu uniknięcia duplikatowania się indeksów przedmiotów pospolitych z przedmiotami rzadkimi w zbiorze oraz wyraźnym oddzieleniu przedmiotów pospolitych od rzadkich
                                                                            if (!wylosowanePrzedmioty.includes(nowyPrzedmiot)) {
                                                                                wylosowanePrzedmioty.push(nowyPrzedmiot);
                                                                            }
                                                                        }
                                                                        while (wylosowanePrzedmioty.length < 10) { // Losowanie epickich przedmiotów
                                                                            const nowyPrzedmiot = Math.floor(Math.random() * danePrzedEpic.length) + danePrzedPosp.length + danePrzedRzad.length; // Losowanie w przedziale (danePrzedPosp.length + danePrzedRzad.length) - (danePrzedPosp.length + danePrzedRzad.length + danePrzedEpic.length) w celu uniknięcia duplikatowania się indeksów wylosowanych już przedmiotów z przedmiotami epickimi w zbiorze oraz wyraźnym oddzieleniu przedmiotów epickich od pozostałych
                                                                            if (!wylosowanePrzedmioty.includes(nowyPrzedmiot)) {
                                                                                wylosowanePrzedmioty.push(nowyPrzedmiot);
                                                                            }
                                                                        }
                                                                        const sqlPrzedmiotySklep = "UPDATE Sklep_przedmiot SET Przedmiot_id = ?, Czy_wykupione = ? WHERE id = ?" // Modyfikacja rekordów w bazie na dane nowo wylosowanych przedmiotów w sklepie
                                                                        for (let i = 0; i < pospolity; i++) { // Modyfikacja danymi o przedmiotach pospolitych
                                                                            db.query(sqlPrzedmiotySklep, [danePrzedPosp[wylosowanePrzedmioty[i]].id, 0, danePrzedSklep[i].id], (err6) => {

                                                                                if (err6) {
                                                                                    console.log("Blad dodawania przedmiotow do sklepu")
                                                                                }
                                                                            })
                                                                        }
                                                                        for (let i = pospolity; i < pospolity + rzadki; i++) { // Modyfikacja danymi o przedmiotach rzadkich
                                                                            db.query(sqlPrzedmiotySklep, [danePrzedRzad[wylosowanePrzedmioty[i] - danePrzedPosp.length].id, 0, danePrzedSklep[i].id], (err6) => { // Należy wykonać działanie (danePrzedRzad[wylosowanePrzedmioty[i] - danePrzedPosp.length]) w celu prawidłowego pobrania przedmiotu z danePrzedRzad (konieczne jest powrócenie do indesków rozpoczynających się od 0)

                                                                                if (err6) {
                                                                                    console.log("Blad dodawania przedmiotow do sklepu")
                                                                                }
                                                                            })
                                                                        }
                                                                        for (let i = pospolity + rzadki; i < 10; i++) { // Modyfikacja danymi o przedmiotach epickich
                                                                            db.query(sqlPrzedmiotySklep, [danePrzedEpic[wylosowanePrzedmioty[i] - danePrzedPosp.length - danePrzedRzad.length].id, 0, danePrzedSklep[i].id], (err6) => { // Należy wykonać działanie (danePrzedEpic[wylosowanePrzedmioty[i] - danePrzedPosp.length - danePrzedRzad.length]) w celu prawidłowego pobrania przedmiotu z danePrzedEpic (konieczne jest powrócenie do indesków rozpoczynających się od 0)

                                                                                if (err6) {
                                                                                    console.log("Blad dodawania przedmiotow do sklepu")
                                                                                }
                                                                            })
                                                                        }
                                                                        return res.json({ Message: "Sklep wygenerowany" })
                                                                    }
                                                                })

                                                            }

                                                        })

                                                    }
                                                })

                                            } else { // Jeśli postać jest na poziomie większym niż 25, szanse na wylosowanie przedmiotu o danych rzadkościach są następujące: pospolity - 55%, rzadki - 32%, epicki - 12%, legendarny - 1%
                                                let pospolity = 0 // Wylosowana liczba przedmiotów pospolitych
                                                let rzadki = 0 // Wylosowana liczba przedmiotów rzadkich
                                                let epicki = 0 // Wylosowana liczba przedmiotów epickich
                                                let legendarny = 0 // Wylosowana liczba przedmiotów legendarnych
                                                let rzadkosc = 0 // Losowana liczba, która będzie wyznaczać jaka rzadkość przedmiotu została wylosowana
                                                for (let i = 0; i < 10; i++) { // Losowanie 10 rzadkości przedmiotów
                                                    rzadkosc = Math.floor(Math.random() * 100) + 1
                                                    if (rzadkosc < 56) // Jeśli wylosowana została liczba z przedziału 1 - 55, zwiększany jest licznik przedmiotów pospolitych
                                                        pospolity++
                                                    else if (rzadkosc < 88) // Jeśli wylosowana została liczba z przedziału 56 - 87, zwiększany jest licznik przedmiotów rzadkich
                                                        rzadki++
                                                    else if (rzadkosc < 100) // Jeśli wylosowana została liczba z przedziału 88 - 99, zwiększany jest licznik przedmiotów epickich
                                                        epicki++
                                                    else // W przeciwnym wypadku (100), zwiększany jest licznik przedmiotów legendarnych
                                                        legendarny++
                                                }
                                                const sqlDostepnePrzedmiotyPospolite = "SELECT id FROM Przedmiot WHERE poziom <= ? AND poziom >= ? - 25 AND rzadkosc = 'pospolity' AND poziom_ulepszenia = 0 AND Statystyki_id > 0" // Pobranie dostępnych przedmiotów pospolitych o poziomie z przedziału (poziom_gracza - 25) - poziom_gracza, w celu wyeliminowania pojawiania się przedmiotów słabszych
                                                const sqlDostepnePrzedmiotyRzadkie = "SELECT id FROM Przedmiot WHERE poziom <= ? AND poziom >= ? - 25 AND rzadkosc = 'rzadki' AND poziom_ulepszenia = 0 AND Statystyki_id > 0" // Pobranie dostępnych przedmiotów rzadkich o poziomie z przedziału (poziom_gracza - 25) - poziom_gracza, w celu wyeliminowania pojawiania się przedmiotów słabszych
                                                const sqlDostepnePrzedmiotyEpickie = "SELECT id FROM Przedmiot WHERE poziom <= ? AND poziom >= ? - 25 AND rzadkosc = 'epicki' AND poziom_ulepszenia = 0 AND Statystyki_id > 0" // Pobranie dostępnych przedmiotów epickich o poziomie z przedziału (poziom_gracza - 25) - poziom_gracza, w celu wyeliminowania pojawiania się przedmiotów słabszych
                                                const sqlDostepnePrzedmiotyLegendarne = "SELECT id FROM Przedmiot WHERE poziom <= ? AND poziom >= ? - 25 AND rzadkosc = 'legendarny' AND poziom_ulepszenia = 0 AND Statystyki_id > 0" // Pobranie dostępnych przedmiotów legendarnych o poziomie z przedziału (poziom_gracza - 25) - poziom_gracza, w celu wyeliminowania pojawiania się przedmiotów słabszych
                                                db.query(sqlDostepnePrzedmiotyPospolite, [danePostac[0].poziom, danePostac[0].poziom], (errPosp, danePrzedPosp) => {
                                                    if (errPosp) {
                                                        console.log("Blad dostepnych przedmiotow pospolitych")
                                                    } else {
                                                        db.query(sqlDostepnePrzedmiotyRzadkie, [danePostac[0].poziom, danePostac[0].poziom], (errRzad, danePrzedRzad) => {
                                                            if (errRzad) {
                                                                console.log("Blad dostepnych przedmiotow rzadkich")
                                                            } else {
                                                                db.query(sqlDostepnePrzedmiotyEpickie, [danePostac[0].poziom, danePostac[0].poziom], (errEpic, danePrzedEpic) => {
                                                                    if (errEpic) {
                                                                        console.log("Blad dostepnych przedmiotow epickich")
                                                                    } else {
                                                                        db.query(sqlDostepnePrzedmiotyLegendarne, [danePostac[0].poziom, danePostac[0].poziom], (errLeg, danePrzedLeg) => {
                                                                            if (errLeg) {
                                                                                console.log("Blad dostepnych przedmiotow legendarnych")
                                                                            } else {
                                                                                const wylosowanePrzedmioty = [];
                                                                                while (wylosowanePrzedmioty.length < pospolity) { // Losowanie przedmiotów pospolitych
                                                                                    const nowyPrzedmiot = Math.floor(Math.random() * danePrzedPosp.length);
                                                                                    if (!wylosowanePrzedmioty.includes(nowyPrzedmiot)) {
                                                                                        wylosowanePrzedmioty.push(nowyPrzedmiot);
                                                                                    }
                                                                                }
                                                                                while (wylosowanePrzedmioty.length < pospolity + rzadki) { // Losowanie przedmiotów rzadkich
                                                                                    const nowyPrzedmiot = Math.floor(Math.random() * danePrzedRzad.length) + danePrzedPosp.length;
                                                                                    if (!wylosowanePrzedmioty.includes(nowyPrzedmiot)) {
                                                                                        wylosowanePrzedmioty.push(nowyPrzedmiot);
                                                                                    }
                                                                                }
                                                                                while (wylosowanePrzedmioty.length < 10 - legendarny) { // Losowanie przedmiotów epickich
                                                                                    const nowyPrzedmiot = Math.floor(Math.random() * danePrzedEpic.length) + danePrzedPosp.length + danePrzedRzad.length;
                                                                                    if (!wylosowanePrzedmioty.includes(nowyPrzedmiot)) {
                                                                                        wylosowanePrzedmioty.push(nowyPrzedmiot);
                                                                                    }
                                                                                }
                                                                                while (wylosowanePrzedmioty.length < 10) { // Losowanie przedmiotów legendarnych
                                                                                    const nowyPrzedmiot = Math.floor(Math.random() * danePrzedLeg.length) + danePrzedPosp.length + danePrzedRzad.length + danePrzedEpic.length;
                                                                                    if (!wylosowanePrzedmioty.includes(nowyPrzedmiot)) {
                                                                                        wylosowanePrzedmioty.push(nowyPrzedmiot);
                                                                                    }
                                                                                }
                                                                                const sqlPrzedmiotySklep = "UPDATE Sklep_przedmiot SET Przedmiot_id = ?, Czy_wykupione = ? WHERE id = ?"
                                                                                for (let i = 0; i < pospolity; i++) {
                                                                                    db.query(sqlPrzedmiotySklep, [danePrzedPosp[wylosowanePrzedmioty[i]].id, 0, danePrzedSklep[i].id], (err6) => {

                                                                                        if (err6) {
                                                                                            console.log("Blad dodawania przedmiotow do sklepu")
                                                                                        }
                                                                                    })
                                                                                }
                                                                                for (let i = pospolity; i < pospolity + rzadki; i++) {
                                                                                    db.query(sqlPrzedmiotySklep, [danePrzedRzad[wylosowanePrzedmioty[i] - danePrzedPosp.length].id, 0, danePrzedSklep[i].id], (err6) => {

                                                                                        if (err6) {
                                                                                            console.log("Blad dodawania przedmiotow do sklepu")
                                                                                        }
                                                                                    })
                                                                                }
                                                                                for (let i = pospolity + rzadki; i < 10; i++) {
                                                                                    db.query(sqlPrzedmiotySklep, [danePrzedEpic[wylosowanePrzedmioty[i] - danePrzedPosp.length - danePrzedRzad.length].id, 0, danePrzedSklep[i].id], (err6) => {

                                                                                        if (err6) {
                                                                                            console.log("Blad dodawania przedmiotow do sklepu")
                                                                                        }
                                                                                    })
                                                                                }
                                                                                for (let i = 10 - legendarny; i < 10; i++) {
                                                                                    db.query(sqlPrzedmiotySklep, [danePrzedLeg[wylosowanePrzedmioty[i] - danePrzedPosp.length - danePrzedRzad.length - danePrzedEpic.length].id, 0, danePrzedSklep[i].id], (err6) => {

                                                                                        if (err6) {
                                                                                            console.log("Blad dodawania przedmiotow do sklepu")
                                                                                        }
                                                                                    })
                                                                                }
                                                                                return res.json({ Message: "Sklep wygenerowany" })
                                                                            }
                                                                        })

                                                                    }
                                                                })

                                                            }

                                                        })

                                                    }
                                                })
                                            }
                                        }
                                    })
                                }
                            })


                        }
                    })
                })
            } else {
                return res.json({ Message: "Sklep wygenerowany" })
            }
        }

    })
});

app.get('/pobranieSklepu/:nazwa_postaci', async (req, res) => { // Funkcja obsługi żądania, pobierająca dane przedmiotów do kupienia
    const nazwa = req.params.nazwa_postaci;
    const sqlPrzedmioty = "SELECT prz.id, prz.nazwa, prz.zestaw, prz.cena, prz.typ, prz.rzadkosc, prz.ikona, prz.poziom_ulepszenia, prz.poziom, s.obrazeniaMax, s.obrazeniaMin, s.sila, s.zdrowie, s.zwinnosc, s.zrecznosc, s.inteligencja, s.pancerz, sk_p.Czy_wykupione  FROM Sklep_przedmiot AS sk_p" +
        " INNER JOIN Sklep AS sk ON sk_p.Sklep_id = sk.id" +
        " INNER JOIN Postac AS po ON sk.Postac_id = po.id" +
        " INNER JOIN Przedmiot AS prz ON sk_p.Przedmiot_id = prz.id" +
        " INNER JOIN Statystyki AS s ON prz.Statystyki_id = s.id" +
        " WHERE po.nazwa = ?";

    db.query(sqlPrzedmioty, [nazwa], (error, dane) => {
        if (error) {
            console.log(error);
            console.log("Blad pobrania sklepu");
            return;
        }
        if (dane.length === 0) {
            console.log("Brak przedmiotow w sklepie");
            return;
        }

        // Tworzymy pustą tablicę na przedmioty w magazynie
        const sklep = {
            przedmioty: []
        };

        // Przechodzimy przez dane i przekształcamy je w przedmioty
        dane.forEach((przedmiot) => {

            const przedmiotInfo = {
                ID: przedmiot.id,
                nazwa: przedmiot.nazwa,
                zestaw: przedmiot.zestaw,
                cena: przedmiot.cena,
                typ: przedmiot.typ,
                rzadkosc: przedmiot.rzadkosc,
                ikona: przedmiot.ikona,
                poziom_ulepszenia: przedmiot.poziom_ulepszenia,
                poziom: przedmiot.poziom,
                czy_wykupione: przedmiot.Czy_wykupione,
                obrazeniaMax: przedmiot.obrazeniaMax,
                obrazeniaMin: przedmiot.obrazeniaMin,
                statystyki: {
                    sila: przedmiot.sila,
                    zdrowie: przedmiot.zdrowie,
                    zwinnosc: przedmiot.zwinnosc,
                    zrecznosc: przedmiot.zrecznosc,
                    inteligencja: przedmiot.inteligencja,
                    pancerz: przedmiot.pancerz
                }
            };

            // Dodajemy przekształcone dane do sklepu
            sklep.przedmioty.push(przedmiotInfo);
        });

        // Odpowiedź HTTP zwraca sklep w formie JSON
        res.json({ Sklep: sklep });
    });
});

app.post('/sklepZakup/:nazwa/:id/:cena', (req, res) => {
    const nazwa = req.params.nazwa
    const pID = req.params.id
    const cena = req.params.cena
    const sqlDanePostaci = "SELECT id, miedziaki, Zadania_Glowne, Zadania_Poboczne FROM postac WHERE nazwa = ?";
    console.log(nazwa + ' ' + pID)

    db.query(sqlDanePostaci, [nazwa], (errPostaci, danePostaci) => {
        if (errPostaci) {
            console.error('Błąd zapytania SQL:', errPostaci);
            return res.status(500).json({ error: 'Błąd zapytania SQL' });
        } else if (danePostaci[0].miedziaki < cena) {
            return res.json({ Message: "Nie posiadasz wystarczającej liczby miedziaków!" })
        } else {
            const sqlDodajDoMagazynu = "INSERT INTO magazyn (`przedmiot_id`, `ilosc`, `zalozone`, `Postac_id`) VALUES (?,?,?,?)"
            db.query(sqlDodajDoMagazynu, [pID, 1, 0, danePostaci[0].id], (errMag, daneMag) => {
                if (errMag) {
                    console.error('Błąd dodania do magazynu');
                    return res.status(500).json({ error: 'Błąd zapytania SQL' });
                } else {
                    const sqlTyp = "SELECT typ FROM zadania WHERE id IN (?, ?)"
                    const sqlZadanieDnia = "SELECT zd.Zadania_id, z.typ FROM zadanie_dnia AS zd " +
                        "INNER JOIN zadania AS z ON zd.Zadania_id = z.id WHERE zd.id = 1"
                    db.query(sqlZadanieDnia, (errZd, daneZd) => {
                        if (errZd) {
                            console.log(errZd)
                            console.log("Nie udało się pobrać zadania dnia")
                            return;
                        }
                        db.query(sqlTyp, [danePostaci[0].Zadania_Glowne, danePostaci[0].Zadania_Poboczne], (errT, daneT) => {
                            if (errT) {
                                console.log(errT)
                                console.log("Nie udało się znaleźć typu")
                                return;
                            }
                            let zg = 0;
                            let zp = 0;
                            let zd = 0;
                            if (daneT[0].typ === "Zakupy") {
                                zg = 1;
                            }
                            if (daneT[1].typ === "Zakupy") {
                                zp = 1;
                            }
                            if (daneZd[0].typ === "Zakupy") {
                                zd = 1;
                            }
                            if (daneT[0].typ === "Miedziaki") {
                                zg = cena;
                            }
                            if (daneT[1].typ === "Miedziaki") {
                                zp = cena;
                            }
                            if (daneZd[0].typ === "Miedziaki") {
                                zd = cena;
                            }
                            const sqlPostep = "UPDATE postac SET Postep_zg = Postep_zg + ?, Postep_zp = Postep_zp + ?, Postep_zd = Postep_zd + ? WHERE nazwa = ?"
                            db.query(sqlPostep, [zg, zp, zd, nazwa], (errPostep) => {
                                if (errPostep) {
                                    console.log(errPostep)
                                    console.log("Nie udało się zaktualizować postępu")
                                    return;
                                }
                            })
                        })
                    })
                    const sqlSklepID = "SELECT id FROM sklep WHERE Postac_id = ?"
                    db.query(sqlSklepID, [danePostaci[0].id], (errSklep, daneSklep) => {
                        if (errSklep) {
                            console.error('Błąd pobrania id sklepu');
                            return res.status(500).json({ error: 'Błąd zapytania SQL' });
                        } else {
                            const sqlUsunZeSklepu = "UPDATE sklep_przedmiot SET `Czy_wykupione` = ? WHERE Przedmiot_id = ? AND Sklep_id = ?"
                            db.query(sqlUsunZeSklepu, [1, pID, daneSklep[0].id], (errUsun) => {
                                if (errUsun) {
                                    console.error('Błąd usuniecia ze sklepu');
                                    return res.status(500).json({ error: 'Błąd zapytania SQL' });
                                } else {
                                    const sqlZaplac = "UPDATE postac SET `miedziaki` = ? WHERE id = ?"
                                    db.query(sqlZaplac, [danePostaci[0].miedziaki - cena, danePostaci[0].id], (errZaplac) => {
                                        if (errZaplac) {
                                            console.error('Błąd zapłaty');
                                            return res.status(500).json({ error: 'Błąd zapytania SQL' });
                                        } else {
                                            return res.json({ Message: "Zakupiono przedmiot!" })
                                        }
                                    })


                                }
                            })
                        }
                    })
                }
            })
        }

    });
});

app.post('/sklepSprzedaz/:nazwa/:nazwaP/:cenaSprzedazy', (req, res) => {
    const nazwa = req.params.nazwa
    const pNazwa = req.params.nazwaP
    const cena = req.params.cenaSprzedazy

    const sqlDanePostaci = "SELECT id, miedziaki FROM postac WHERE nazwa = ?";

    db.query(sqlDanePostaci, [nazwa], (errPostaci, danePostaci) => {
        if (errPostaci) {
            console.error('Błąd zapytania SQL:', errPostaci);
            return res.status(500).json({ error: 'Błąd zapytania SQL' });
        } else {
            sqlDanePrzedmiot = "Select id FROM przedmiot WHERE nazwa = ?"
            db.query(sqlDanePrzedmiot, [pNazwa], (errPrzedmiot, danePrzedmiot) => {
                if (errPrzedmiot) {
                    console.error('Błąd przedmiotu');
                    return res.status(500).json({ error: 'Błąd zapytania SQL' });
                } else {
                    const sqlIdMagazynu = "SELECT id FROM magazyn WHERE przedmiot_id = ? AND Postac_id = ?";
                    db.query(sqlIdMagazynu, [danePrzedmiot[0].id, danePostaci[0].id], (errMag, daneMag) => {
                        if (errMag) {
                            console.error('Błąd magazynu');
                            return res.status(500).json({ error: 'Błąd zapytania SQL' });
                        } else {

                            const sqlUsunMagazyn = "DELETE FROM magazyn WHERE id = ?"
                            db.query(sqlUsunMagazyn, [daneMag[0].id], (errUsunMag) => {
                                if (errUsunMag) {
                                    console.error('Błąd usuniecia magazynu');
                                    return res.status(500).json({ error: 'Błąd zapytania SQL' });
                                } else {
                                    const sqlZaplata = "UPDATE postac SET miedziaki = ? WHERE id = ?"
                                    db.query(sqlZaplata, [(danePostaci[0].miedziaki - (-cena)), danePostaci[0].id], (errZaplata) => {
                                        if (errZaplata) {
                                            console.error('Błąd wyplaty pieniedzy');
                                            return res.status(500).json({ error: 'Błąd zapytania SQL' });
                                        } else {
                                            return res.json({ Message: "Sprzedano przedmiot" })
                                        }
                                    })
                                }

                            })
                        }
                    })
                }
            })

        }

    });
});


app.put('/ustawStatusPrzedmiotu', (req, res) => {

    const { idMagazynu, idMagazynu2 } = req.body;


    const sql = `
          UPDATE magazyn
          SET zalozone = CASE
              WHEN id = ? THEN '0'
              WHEN id = ? THEN '1'
              ELSE zalozone
          END
          WHERE id IN (?, ?);
        `;
    db.query(sql, [idMagazynu2, idMagazynu, idMagazynu2, idMagazynu], (err, result) => {
        if (err) {
            res.status(500).send('Błąd zapytania SQL');
        } else {

            res.status(200).send('Zaktualizowano rekordy');
        }
    });
});

app.get('/drzewo/:nazwa_postaci', (req, res) => {
    const nazwaPostaci = req.params.nazwa_postaci;
    const sqlDrzewo = "SELECT d.id, d.nazwa, s.sila, s.zdrowie, s.zwinnosc, s.zrecznosc, s.inteligencja, s.pancerz,u.nazwa as nazwa_u,u.opis"
        + " FROM drzewo AS d"
        + " LEFT JOIN statystyki AS s ON d.Statystyki_id = s.id"
        + " LEFT JOIN umiejetnosc AS u ON d.Umiejetnosc_id = u.id";

    const sqlDrzewoRozdane = "SELECT pd.id,pd.Drzewo_id FROM postac_drzewo AS pd"
        + " inner join postac AS p ON p.id = pd.Postac_id"
        + " where p.nazwa= ? ";

    db.query(sqlDrzewo, (error, dane) => {
        if (error) {
            console.error('Błąd zapytania SQL:', error);
            return res.status(500).json({ error: 'Błąd zapytania SQL' });
        }
        if (dane.length > 0) {

            const drzewo = {
                drzewoPunkt: []
            };

            const grupyDrzewa = {};
            dane.forEach((punkt) => {
                const id = punkt.id.toString();
                const dlugoscId = id.length;


                if (!grupyDrzewa[dlugoscId]) {
                    grupyDrzewa[dlugoscId] = [];
                }

                const drzewoPunktInfo = {
                    id: punkt.id,
                    nazwa: punkt.nazwa,
                    nazwa_u: punkt.nazwa_u,
                    opis: punkt.opis,
                    sila: punkt.sila,
                    zdrowie: punkt.zdrowie,
                    zwinnosc: punkt.zwinnosc,
                    zrecznosc: punkt.zrecznosc,
                    inteligencja: punkt.inteligencja,
                    pancerz: punkt.pancerz
                };

                grupyDrzewa[dlugoscId].push(drzewoPunktInfo);
            });


            for (const dlugoscId in grupyDrzewa) {
                drzewo.drzewoPunkt.push({
                    dlugoscId: parseInt(dlugoscId),
                    punkty: grupyDrzewa[dlugoscId]
                });
            }

            db.query(sqlDrzewoRozdane, [nazwaPostaci], (errDrzewo, rozdanePunkty) => {
                if (errDrzewo) {
                    console.log(errDrzewo)
                }

                const Rozdane = {
                    punkt: []
                };

                rozdanePunkty.forEach((punkt) => {
                    const rozdane = {
                        id: punkt.id,
                        Drzewo_id: punkt.Drzewo_id
                    }
                    Rozdane.punkt.push(rozdane);
                });
                console.log(Rozdane)

                res.json({ Drzewo: drzewo, RozdanePunkty: Rozdane });

            })
        }
    });
});

app.post('/drzewoGracza/:nazwa_postaci', (req, res) => {

    const nazwaPostaci = req.params.nazwa_postaci;
    const { noweDane } = req.body;
    console.log(noweDane)

    const sqlIdPostaci = "SELECT p.id FROM postac AS p"
        + " where p.nazwa= ? ";

    const sqlInsertPunkty = "INSERT INTO postac_drzewo (Postac_id, Drzewo_id) VALUES (?)";

    db.query(sqlIdPostaci, [nazwaPostaci], (errPostac, danePostac) => {

        if (errPostac) {
            console.log("Blad wyszukania postaci")
        }

        console.log(danePostac[0].id)


        noweDane.forEach((punktId) => {

            const values = [danePostac[0].id, punktId];

            db.query(sqlInsertPunkty, [values], (errDanePostacDrzewo, danePostacDrzewo) => {
                if (errDanePostacDrzewo) {
                    console.log("Blad dodania punktu dla gracza")
                }
                console.log("Gracz od id: " + danePostac[0].id + " rozdal punkt umiejetnosci")
            })


        })
    })
    res.json("Dodano")
})



function pobierzSumePunktow(nazwaPostaci, callback) {
    const sqlSumaPunktowDrzewa = "SELECT IFNULL(SUM(sila), 0) as sumaSila, IFNULL(SUM(zdrowie), 0) as sumaZdrowie, IFNULL(SUM(zwinnosc), 0) as sumaZwinnosc, IFNULL(SUM(zrecznosc), 0) as sumaZrecznosc, IFNULL(SUM(inteligencja), 0) as sumaInteligencja, IFNULL(SUM(pancerz), 0) as sumaPancerz FROM postac_drzewo as PD"
        + " INNER JOIN drzewo as D ON PD.Drzewo_id = D.id"
        + " INNER JOIN postac as PO ON PO.id = PD.Postac_id"
        + " LEFT JOIN statystyki as S ON D.Statystyki_id = S.id"
        + " LEFT Join umiejetnosc as U ON U.id = D.Umiejetnosc_id"
        + " Where PO.nazwa= ?";

    const sqlSumaPunktowEkwipunek = "SELECT IFNULL(SUM(sila), 0) as sumaSila, IFNULL(SUM(zdrowie), 0) as sumaZdrowie, IFNULL(SUM(zwinnosc), 0) as sumaZwinnosc,  IFNULL(SUM(zrecznosc), 0) as sumaZrecznosc,  IFNULL(SUM(inteligencja), 0) as sumaInteligencja, IFNULL(SUM(pancerz), 0) as sumaPancerz, IFNULL(SUM(obrazeniaMin), 1) as sumaObrazeniaMin, IFNULL(SUM(obrazeniaMax), 1) as sumaObrazeniaMax FROM magazyn as m"
        + " INNER JOIN przedmiot as prz ON prz.id=m.przedmiot_id"
        + " INNER JOIN statystyki as s ON s.id=prz.Statystyki_id"
        + " INNER JOIN postac as po ON po.id=m.Postac_id"
        + " Where po.nazwa= ? and m.zalozone=1";

    const sqlSumaPunktowPostac = "SELECT s.sila,s.zdrowie,s.zwinnosc,s.zrecznosc,s.inteligencja,s.pancerz FROM postac as p"
        + " INNER JOIN statystyki as s ON s.id=p.Statystyki_id"
        + " where p.nazwa= ?";

    const sumaPunktow = {};

    db.query(sqlSumaPunktowDrzewa, [nazwaPostaci], (err, daneD) => {
        if (err) {
            console.log("Błąd pobrania sumy punktów drzewa");
            callback(err);
            return;
        }

        sumaPunktow.SumaDrzewaPKT = daneD[0];

        db.query(sqlSumaPunktowEkwipunek, [nazwaPostaci], (err2, daneE) => {
            if (err2) {
                console.log("Błąd pobrania sumy punktów ekwipunku");
                callback(err2);
                return;
            }

            sumaPunktow.SumaEkwipunekPKT = daneE[0];

            db.query(sqlSumaPunktowPostac, [nazwaPostaci], (err3, daneP) => {
                if (err3) {
                    console.log("Błąd pobrania sumy punktów postaci");
                    callback(err3);
                    return;
                }

                sumaPunktow.SumaPostacPKT = daneP[0];

                const ogolnaSuma = {
                    sila: sumaPunktow.SumaDrzewaPKT.sumaSila + sumaPunktow.SumaEkwipunekPKT.sumaSila + sumaPunktow.SumaPostacPKT.sila,
                    zdrowie: sumaPunktow.SumaDrzewaPKT.sumaZdrowie + sumaPunktow.SumaEkwipunekPKT.sumaZdrowie + sumaPunktow.SumaPostacPKT.zdrowie,
                    zwinnosc: sumaPunktow.SumaDrzewaPKT.sumaZwinnosc + sumaPunktow.SumaEkwipunekPKT.sumaZwinnosc + sumaPunktow.SumaPostacPKT.zwinnosc,
                    zrecznosc: sumaPunktow.SumaDrzewaPKT.sumaZrecznosc + sumaPunktow.SumaEkwipunekPKT.sumaZrecznosc + sumaPunktow.SumaPostacPKT.zrecznosc,
                    inteligencja: sumaPunktow.SumaDrzewaPKT.sumaInteligencja + sumaPunktow.SumaEkwipunekPKT.sumaInteligencja + sumaPunktow.SumaPostacPKT.inteligencja,
                    pancerz: sumaPunktow.SumaDrzewaPKT.sumaPancerz + sumaPunktow.SumaEkwipunekPKT.sumaPancerz + sumaPunktow.SumaPostacPKT.pancerz,
                    obrazeniaMin: sumaPunktow.SumaEkwipunekPKT.sumaObrazeniaMin,
                    obrazeniaMax: sumaPunktow.SumaEkwipunekPKT.sumaObrazeniaMax
                };

                sumaPunktow.OgolnaSumaPKT = ogolnaSuma;

                callback(null, sumaPunktow);
            });
        });
    });
}

app.get('/podsumowaniePunktow/:nazwa_postaci', (req, res) => {
    const nazwaPostaci = req.params.nazwa_postaci;

    pobierzSumePunktow(nazwaPostaci, (err, sumaPunktow) => {
        if (err) {
            res.status(500).json({ error: 'Błąd pobierania sumy punktów' });
        } else {
            res.json(sumaPunktow);
        }
    });
});




app.get('/losowanieGraczy/:nazwa_postaci', async (req, res) => {

    const nazwaPostaci = req.params.nazwa_postaci;

    const sqlBilansAtak = `
                    SELECT
                    p.id,
                    p.nazwa,
                    (SUM(CASE
                            WHEN w.atakujacy_id = p.id AND w.wygrana = 1 THEN 1
                            WHEN w.przeciwnik_id = p.id AND w.wygrana = 0 THEN 1
                            ELSE 0
                        END) - SUM(CASE
                            WHEN w.przeciwnik_id = p.id AND w.wygrana = 1 THEN 1
                            WHEN w.atakujacy_id = p.id AND w.wygrana = 0 THEN 1
                            ELSE 0
                        END)) AS bilans,
                        COALESCE(MAX(w.data), DATE_SUB(CURDATE(), INTERVAL 2 DAY)) AS data_ostatniego_pojedynku
                FROM
                    postac AS p
                LEFT JOIN
                    walki AS w ON p.id = w.atakujacy_id OR p.id = w.przeciwnik_id
                WHERE
                    p.nazwa = ?
                GROUP BY
                    p.id, p.nazwa
                HAVING
                    bilans IS NOT NULL
                LIMIT 1
            `;

    const sqlBilansPrzeciwnik = `
                SELECT
                p.id,
                p.nazwa,
                p.wyglad,
                (SUM(CASE
                        WHEN w.atakujacy_id = p.id AND w.wygrana = 1 THEN 1
                        WHEN w.przeciwnik_id = p.id AND w.wygrana = 0 THEN 1
                        ELSE 0
                    END) - SUM(CASE
                        WHEN w.przeciwnik_id = p.id AND w.wygrana = 1 THEN 1
                        WHEN w.atakujacy_id = p.id AND w.wygrana = 0 THEN 1
                        ELSE 0
                    END)) AS bilans
            FROM
                postac AS p
            LEFT JOIN
                walki AS w ON p.id = w.atakujacy_id OR p.id = w.przeciwnik_id
            WHERE
                p.nazwa != ?
            GROUP BY
                p.id, p.nazwa
            HAVING
                bilans IS NOT NULL
            ORDER BY
                ABS(bilans - ?) ASC
            LIMIT 10
            `;

    db.query(sqlBilansAtak, [nazwaPostaci], (err, dane) => {
        if (err) {
            console.log("err sqlBilansAtak")
        }

        // console.log(dane[0].bilans);
        const bilansInt = parseInt(dane[0].bilans)
        const ostatniPojedynek = (dane[0].data_ostatniego_pojedynku)
        const values = [
            nazwaPostaci,
            bilansInt
        ]

        db.query(sqlBilansPrzeciwnik, values, (err2, dane2) => {
            if (err2) {
                console.log("err sqlBilansPrzeciwnik")
                console.log(err2)
            }
            //console.log(dane2)

            const dostepniPrzeciwnicy = [...dane2]; // Skopiowanie dostępnych przeciwników
            const maxIloscPrzeciwnikow = Math.min(3, dostepniPrzeciwnicy.length); // Maksymalnie 3 lub tyle, ile jest dostępnych

            const wylosowaniPrzeciwnicy = [];

            for (let i = 0; i < maxIloscPrzeciwnikow; i++) {
                const losowyIndex = Math.floor(Math.random() * dostepniPrzeciwnicy.length);
                const losowyPrzeciwnik = dostepniPrzeciwnicy.splice(losowyIndex, 1)[0];
                wylosowaniPrzeciwnicy.push(losowyPrzeciwnik);
            }

            // console.log(wylosowaniPrzeciwnicy);

            const sumaPunktowPromises = wylosowaniPrzeciwnicy.map(przeciwnik => {
                return new Promise((resolve, reject) => {
                    pobierzSumePunktow(przeciwnik.nazwa, (err, sumaPunktow) => {
                        if (err) {
                            reject(err);
                        } else {
                            przeciwnik.sumaPunktow = sumaPunktow;
                            resolve(przeciwnik);
                        }
                    });
                });
            });

            // Oczekuj na zakończenie wszystkich żądań i zwróć wyniki
            Promise.all(sumaPunktowPromises)
                .then(wylosowaniPrzeciwnicyZPunktami => {
                    // console.log("Podsumowanie punktów przeciwników:");
                    // console.log(wylosowaniPrzeciwnicyZPunktami);
                    res.json({ WylosowaniPrzeciwnicyZPunktami: wylosowaniPrzeciwnicyZPunktami, OstatniPojedynek: ostatniPojedynek });
                })
                .catch(error => {
                    res.status(500).json({ error: 'Błąd pobierania sumy punktów dla przeciwników' });
                });

        })
    })
})


function losujObrazenia(obrazeniaMin, obrazeniaMax, redukcjaPrzeciwnika) {
    const obrazenia = Math.ceil(Math.random() * (obrazeniaMax - obrazeniaMin + 1)) + obrazeniaMin;
    return Math.ceil(Math.max(obrazenia - Math.ceil(obrazenia * redukcjaPrzeciwnika), 0));
}



app.post('/pojedynek/:nazwa_postaci', (req, res) => {

    const nazwaPostaci = req.params.nazwa_postaci;

    const { gracz } = req.body

    const atakujacySQL = `SELECT
    p.id,
    p.wyglad,
    p.poziom,
    p.doswiadczenie,
    p.miedziaki,
    (SUM(CASE
            WHEN w.atakujacy_id = p.id AND w.wygrana = 1 THEN 1
            WHEN w.przeciwnik_id = p.id AND w.wygrana = 0 THEN 1
            ELSE 0
        END) - SUM(CASE
            WHEN w.przeciwnik_id = p.id AND w.wygrana = 1 THEN 1
            WHEN w.atakujacy_id = p.id AND w.wygrana = 0 THEN 1
            ELSE 0
        END)) AS bilans
FROM
    postac AS p
LEFT JOIN
    walki AS w ON p.id = w.atakujacy_id OR p.id = w.przeciwnik_id
WHERE
    p.nazwa = ?
GROUP BY
    p.id, p.nazwa
HAVING
    bilans IS NOT NULL
LIMIT 1`;

    const ostatniPojedynek = `SELECT
p.id,
p.nazwa,
COALESCE(MAX(w.data), DATE_SUB(CURDATE(), INTERVAL 2 DAY)) AS data_ostatniego_pojedynku
FROM
postac AS p
LEFT JOIN
walki AS w ON p.id = w.atakujacy_id OR p.id = w.przeciwnik_id
WHERE
p.nazwa = ?
GROUP BY
p.id, p.nazwa
LIMIT 1`;


    const walkaSQL = `
  INSERT INTO walki (atakujacy_id, przeciwnik_id, wygrana, a_atak_1, p_atak_1, a_atak_2, p_atak_2, a_atak_3, p_atak_3, a_atak_4, p_atak_4, a_atak_5, p_atak_5, data)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`;

    db.query(ostatniPojedynek, [nazwaPostaci], (err00, dane00) => {
        if (err00) {
            console.log(err00)
        }

        const dataOstatniegoPojedynku = dane00[0].data_ostatniego_pojedynku;
        const teraz = new Date();
        const dataOstatniegoPojedynkuDate = new Date(dataOstatniegoPojedynku);
        const roznicaMilisekundy = teraz - dataOstatniegoPojedynkuDate;
        const roznicaMinut = roznicaMilisekundy / (1000 * 60);
        if (roznicaMinut > 10) {
            db.query(atakujacySQL, [nazwaPostaci], (err0, dane0) => {
                if (err0) {
                    console.log(err0)
                }

                const a_id = dane0[0].id
                const a_wyglad = dane0[0].wyglad

                pobierzSumePunktow(nazwaPostaci, (err, sumaPunktow) => {
                    if (err) {
                        res.status(500).json({ error: 'Błąd pobierania sumy punktów' });
                    }

                    const x = sumaPunktow.OgolnaSumaPKT
                    const y = gracz.sumaPunktow


                    // Przebieg walki

                    // Zrecznosc przebija pancerz
                    // Pancerz to pancerz - przeciwnik.zrecznosc ale pancerz nie moze byc ujemny
                    // I wtedy pancerz twoj i pancerz przeciwnika to jest ten aktywny
                    // I wtedy dodajemy te pancerze i mnozymy * 4 wtedy to jest maksymalna wartosc redukcji czyli 100%

                    //ATK

                    let a_zdrowie = 100 + (x.zdrowie * 10)
                    const a_cale_zdrowie = a_zdrowie
                    const a_obrazeniaMin = x.obrazeniaMin + (x.obrazeniaMin * (x.sila / 200))
                    const a_obrazeniaMax = x.obrazeniaMax + (x.obrazeniaMax * (x.sila / 50))
                    const a_pancerz = Math.max(x.pancerz - y.zrecznosc, 0);

                    //OBR

                    let p_zdrowie = 100 + (y.zdrowie * 10)
                    const p_cale_zdrowie = p_zdrowie
                    const p_obrazeniaMin = y.obrazeniaMin + (y.obrazeniaMin * (y.sila / 200))
                    const p_obrazeniaMax = y.obrazeniaMax + (y.obrazeniaMax * (y.sila / 50))
                    const p_pancerz = Math.max(y.pancerz - x.zrecznosc, 0);

                    // Redukcja
                    const max_Redukcja = Math.max((a_pancerz + p_pancerz) * 4, 1);
                    const a_redukcja = a_pancerz / max_Redukcja;
                    const p_redukcja = p_pancerz / max_Redukcja;


                    //Walka
                    const liczbaMaxAtakow = 5;


                    const a_atak = new Array();
                    const p_atak = new Array();

                    let wygrana = 0


                    for (let i = 1; i <= liczbaMaxAtakow; i++) {
                        if ((a_zdrowie > 0) && (p_zdrowie > 0)) {

                            const obrazeniaAtak = losujObrazenia(a_obrazeniaMin, a_obrazeniaMax, p_redukcja);
                            const obrazeniaObrona = losujObrazenia(p_obrazeniaMin, p_obrazeniaMax, a_redukcja);

                            p_zdrowie = p_zdrowie - obrazeniaAtak;
                            a_atak.push(obrazeniaAtak)

                            if (p_zdrowie > 0) {
                                a_zdrowie = a_zdrowie - obrazeniaObrona;
                                p_atak.push(obrazeniaObrona)
                            }
                            else {
                                p_atak.push(null)
                                wygrana = 1
                            }
                        }
                        else {
                            a_atak.push(null)
                            p_atak.push(null)
                        }
                    }

                    if ((a_zdrowie > 0) && (p_zdrowie > 0)) {
                        const sumaA = a_atak.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
                        const sumaB = p_atak.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
                        if (sumaA > sumaB) {
                            wygrana = 1
                        }
                    }



                    const values = [
                        a_id, // ID atakującego
                        gracz.id, // ID przeciwnika
                        wygrana, // Wynik walki (1 - wygrana, 0 - przegrana)
                        a_atak[0], p_atak[0], a_atak[1], p_atak[1], a_atak[2], p_atak[2], a_atak[3], p_atak[3], a_atak[4], p_atak[4],
                    ];

                    const przebiegAtaku = [a_atak[0], p_atak[0], a_atak[1], p_atak[1], a_atak[2], p_atak[2], a_atak[3], p_atak[3], a_atak[4], p_atak[4]]

                    let nagrodaMiedziaki;
                    let nagrodaDoswiadczenie;
                    if (wygrana === 1) {
                        const nagrodaZaBilans = Math.max(dane0[0].bilans, 1);
                        const nagrodaMiedziakiMin = dane0[0].poziom * nagrodaZaBilans;
                        const nagrodaMiedziakiMax = Math.ceil(nagrodaMiedziakiMin / 5) * 5;
                        nagrodaMiedziaki = Math.floor(Math.random() * (nagrodaMiedziakiMax - nagrodaMiedziakiMin + 1)) + nagrodaMiedziakiMin;

                        const nagrodaDoswiadczenieMin = (5 * dane0[0].poziom) * (nagrodaZaBilans / 4);
                        const nagrodaDoswiadczenieMax = Math.ceil(nagrodaMiedziakiMin / 10) * 10;
                        nagrodaDoswiadczenie = Math.floor(Math.random() * (nagrodaDoswiadczenieMax - nagrodaDoswiadczenieMin + 1)) + nagrodaDoswiadczenieMin;

                        const sqlZadanie = "SELECT Zadania_Glowne, Zadania_Poboczne FROM postac WHERE nazwa = ?"
                        db.query(sqlZadanie, nazwaPostaci, (errZ, daneZ) => {
                            if (errZ) {
                                console.log(errZ)
                                console.log("Nie udalo się znaleźć zadań")
                                return;
                            }
                            const sqlTyp = "SELECT typ FROM zadania WHERE id IN (?, ?)"
                            const sqlZadanieDnia = "SELECT zd.Zadania_id, z.typ FROM zadanie_dnia AS zd " +
                                "INNER JOIN zadania AS z ON zd.Zadania_id = z.id WHERE zd.id = 1"
                            db.query(sqlZadanieDnia, (errZd, daneZd) => {
                                if (errZd) {
                                    console.log(errZd)
                                    console.log("Nie udało się pobrać zadania dnia")
                                    return;
                                }
                                db.query(sqlTyp, [daneZ[0].Zadania_Glowne, daneZ[0].Zadania_Poboczne], (errT, daneT) => {
                                    if (errT) {
                                        console.log(errT)
                                        console.log("Nie udało się znaleźć typu")
                                        return;
                                    }
                                    let zg = 0;
                                    let zp = 0;
                                    let zd = 0;
                                    if (daneT[0].typ === "Arena") {
                                        zg = 1;
                                    }
                                    if (daneT[1].typ === "Arena") {
                                        zp = 1;
                                    }
                                    if (daneZd[0].typ === "Arena") {
                                        zd = 1;
                                    }
                                    const sqlPostep = "UPDATE postac SET Postep_zg = Postep_zg + ?, Postep_zp = Postep_zp + ?, Postep_zd = Postep_zd + ? WHERE nazwa = ?"
                                    db.query(sqlPostep, [zg, zp, zd, nazwaPostaci], (errPostep) => {
                                        if (errPostep) {
                                            console.log(errPostep)
                                            console.log("Nie udało się zaktualizować postępu")
                                            return;
                                        }
                                    })
                                })
                            })
                        })
                    } else {
                        nagrodaMiedziaki = null;
                        nagrodaDoswiadczenie = null;
                    }

                    const przebiegWalki = {
                        atakujacy_id: a_id,
                        przeciwnik_id: gracz.id,
                        wygrana: wygrana,
                        ataki: przebiegAtaku,
                        a_wyglad: a_wyglad,
                        p_wyglad: gracz.wyglad,
                        a_zdrowie: a_cale_zdrowie,
                        p_zdrowie: p_cale_zdrowie,
                        nagrodaDoswiadczenie: nagrodaDoswiadczenie,
                        nagrodaMiedziaki: nagrodaMiedziaki
                    }
                    // Koniec walki

                    const sqlNagroda = `UPDATE postac SET miedziaki = ?, doswiadczenie = ?, poziom = ? WHERE nazwa = ?`

                    //const sqlSprawdzPoziom
                    const sqlSprawdzPoziom = `SELECT * FROM poziomy WHERE wymagane_doswiadczenie <= ? ORDER BY wymagane_doswiadczenie DESC LIMIT 1`
                    const valuesPoziom = [
                        dane0[0].doswiadczenie + nagrodaDoswiadczenie
                    ]

                    // Zapisanie walki
                    db.query(walkaSQL, values, (err, result) => {
                        if (err) {
                            console.log('Błąd podczas wstawiania danych:', err);
                        } else {

                            // Sprawdzenie poziomu
                            db.query(sqlSprawdzPoziom, valuesPoziom, (err4, dane4) => {
                                if (err4) {
                                    console.log('Błąd podczas sprawdzenia poziomu:', err4);
                                }
                                const valuesNagroda = [
                                    dane0[0].miedziaki + nagrodaMiedziaki,
                                    dane0[0].doswiadczenie + nagrodaDoswiadczenie,
                                    dane4[0].id,
                                    nazwaPostaci
                                ]
                                // Nadawanie nagrod
                                db.query(sqlNagroda, valuesNagroda, (err5, dane5) => {
                                    if (err5) {
                                        console.log('Błąd podczas wstawiania nagrody:', err5);
                                    }
                                })
                            })
                            console.log('Dane zostały wstawione do bazy danych.');
                            res.json({ PrzebiegWalki: przebiegWalki })
                        }
                    })
                })
            });
        }
        else {
            res.json("Zabezpieczenie")
        }
    })
});



app.get('/ulepszenie/:nazwa_przedmiotu', (req, res) => {
    const prz_nazwa = req.params.nazwa_przedmiotu;
    const sqlPrzedmiotID = "SELECT id FROM przedmiot WHERE nazwa = ?";
    db.query(sqlPrzedmiotID, [prz_nazwa], (errorPrzed, danePrzed) => {
        if (errorPrzed) {
            console.log(errorPrzed);
            console.log("Błąd pobierania ID ulepszanego przedmiotu")
            return;
        }
        if (danePrzed.length === 0) {
            console.log("Brak takiego przedmiotu");
            return;
        }

        const sqlPrzedmiot = "SELECT prz.nazwa, prz.zestaw, prz.poziom, prz.rzadkosc, prz.ikona, prz.cena, s.obrazeniaMax, s.obrazeniaMin, prz.poziom_ulepszenia, prz.typ, s.sila, s.zdrowie, s.zwinnosc, s.zrecznosc, s.inteligencja, s.pancerz FROM przedmiot as prz" +
            " INNER JOIN statystyki as s ON prz.Statystyki_id = s.id" +
            " WHERE prz.id = ?";

        db.query(sqlPrzedmiot, [danePrzed[0].id - (-1)], (error, dane) => {
            if (error) {
                console.log(error);
                console.log("Blad pobrania przedmiotu");
                return;
            }
            if (dane.length === 0) {
                console.log("Brak takiego przedmiotu");
                return;
            }

            res.json({ przedmiot: dane[0] });
        });
    })

});

app.get('/ulepszacze/:poziom_przedmiotu', (req, res) => {
    const prz_poziom = req.params.poziom_przedmiotu;
    const sqlUlepszaczeID = "SELECT Przedmiot_id_1 AS ul1, Przedmiot_id_2 AS ul2, Przedmiot_id_3 AS ul3 FROM ulepszacz WHERE poziomMin <= ? AND poziomMax >= ?";
    db.query(sqlUlepszaczeID, [prz_poziom, prz_poziom], (errorPrzed, danePrzed) => {
        if (errorPrzed) {
            console.log(errorPrzed);
            console.log("Błąd pobierania ID ulepszaczy przedmiotu")
            return;
        }
        if (danePrzed.length === 0) {
            console.log("Brak ulepszaczy");
            return;
        }

        const sqlUlepszacz = "SELECT id, nazwa, poziom, rzadkosc, ikona, cena, typ FROM przedmiot" +
            " WHERE id = ? OR id = ? OR id = ?";

        db.query(sqlUlepszacz, [danePrzed[0].ul1, danePrzed[0].ul2, danePrzed[0].ul3], (error, dane) => {
            if (error) {
                console.log(error);
                console.log("Blad pobrania przedmiotów");
                return;
            }
            if (dane.length === 0) {
                console.log("Brak takich przedmiotów");
                return;
            }

            const ulepszacze = {
                ulepszacz: []
            };

            dane.forEach((przedmiot) => {
                const przedmiotInfo = {
                    id: przedmiot.id,
                    nazwa: przedmiot.nazwa,
                    cena: przedmiot.cena,
                    typ: przedmiot.typ,
                    rzadkosc: przedmiot.rzadkosc,
                    ikona: przedmiot.ikona,
                    poziom: przedmiot.poziom,
                };


                ulepszacze.ulepszacz.push(przedmiotInfo);
            });

            res.json({ Ulepszacz: ulepszacze });


        });
    })

});

app.get('/sprawdzenie/:poziom_przedmiotu&:id&:nazwa', (req, res) => {
    const prz_poziom = req.params.poziom_przedmiotu;
    const prz_id = req.params.id;
    const nazwa_postaci = req.params.nazwa;
    console.log(prz_poziom + " " + prz_id + " " + nazwa_postaci)
    const sqlIdPostaci = "SELECT id FROM postac WHERE nazwa = ?";
    db.query(sqlIdPostaci, [nazwa_postaci], (errPostac, danePostac) => {
        if (errPostac) {
            console.log(errPostac);
            console.log("Błąd pobierania id postaci");
            return;
        }
        const sqlIlosc = "SELECT ilosc FROM magazyn WHERE przedmiot_id = ? AND Postac_id = ?";
        db.query(sqlIlosc, [prz_id, danePostac[0].id], (errIlosc, daneIlosc) => {
            if (errIlosc) {
                console.log(errIlosc);
                console.log("Błąd pobierania liczby przedmiotów")
                return;
            }
            if (daneIlosc.length === 0) {
                console.log("Brak ulepszaczy");
                const posiada = 0;
                res.json({ Posiada: posiada });
            }
            if (daneIlosc[0].ilosc > prz_poziom) {
                const posiada = 1;
                console.log("Posiada wymagane ulepszacze")
                res.json({ Posiada: posiada });
            }

        })
    })


});

app.post('/ulepsz/:przedmiot/:nazwa', (req, res) => {
    const prz = req.params.przedmiot
    const nazwaPostaci = req.params.nazwa
    const ulepszacze = req.body.ulepszacze
    const sqlDanePrzedmiot = "SELECT id, poziom_ulepszenia FROM przedmiot WHERE nazwa = ?"
    db.query(sqlDanePrzedmiot, [prz], (errPrzed, danePrzed) => {
        if (errPrzed) {
            console.log(errPrzed);
            console.log("Błąd pobierania danych ulepszonego przedmiotu")
            return;
        }
        if (danePrzed.length === 0) {
            console.log("Brak takiego przedmiotu");
            return;
        }
        const sqlIdPostaci = "SELECT id, Zadania_Glowne, Zadania_Poboczne FROM postac WHERE nazwa = ?"
        db.query(sqlIdPostaci, [nazwaPostaci], (errPostac, danePostac) => {
            if (errPostac) {
                console.log(errPostac);
                console.log("Błąd pobierania danych postaci")
                return;
            }
            if (danePostac.length === 0) {
                console.log("Brak takiej postaci");
                return;
            }
            let i = 0;
            const sqlPobranieProduktow = "UPDATE magazyn SET ilosc = ilosc - ? WHERE przedmiot_id = ? AND Postac_id = ?"
            while (i < ulepszacze.length) {
                db.query(sqlPobranieProduktow, [danePrzed[0].poziom_ulepszenia, ulepszacze[i], danePostac[0].id], (errProd) => {
                    if (errProd) {
                        console.log(errProd);
                        console.log("Nie udało się pobrać ulepszaczy")
                        return;
                    }
                })
                i++;
            }
            const sqlSprawdzZadania = "SELECT typ FROM zadania WHERE id IN (?,?)"
            const sqlZadanieDnia = "SELECT zd.Zadania_id, z.typ FROM zadanie_dnia AS zd " +
                "INNER JOIN zadania AS z ON zd.Zadania_id = z.id WHERE zd.id = 1"
            db.query(sqlZadanieDnia, (errZd, daneZd) => {
                if (errZd) {
                    console.log(errZd)
                    console.log("Nie udało się pobrać zadania dnia")
                    return;
                }
                db.query(sqlSprawdzZadania, [danePostac[0].Zadania_Glowne, danePostac[0].Zadania_Poboczne], (errZ, daneZadania) => {
                    if (errZ) {
                        console.log(errZ)
                        console.log("Nie udało się pobrać typu zadań")
                        return;
                    }
                    let zg = 0;
                    let zp = 0;
                    let zd = 0;
                    if (daneZadania.length === 0) {
                        console.log("Brak zadan")
                    }
                    const sqlZaplata = "UPDATE postac SET miedziaki = miedziaki - ? WHERE nazwa = ?"
                    db.query(sqlZaplata, [danePrzed[0].poziom_ulepszenia * 200, nazwaPostaci], (errZaplata) => {
                        if (errZaplata) {
                            console.log(errZaplata)
                            console.log("Nie udało się pobrać pieniędzy")
                            return;
                        }
                        const czyUdane = Math.floor(Math.random() * 100) + 1;
                        const sqlZmianaPrzedmiotu = "UPDATE magazyn SET przedmiot_id = ? WHERE przedmiot_id = ? AND Postac_id = ?"
                        if (danePrzed[0].poziom_ulepszenia === 1) {
                            if (czyUdane - danePrzed[0].poziom_ulepszenia * 10 >= 1) {
                                db.query(sqlZmianaPrzedmiotu, [danePrzed[0].id, danePrzed[0].id - 1, danePostac[0].id], (errMag) => {
                                    if (errMag) {
                                        console.log(errMag);
                                        console.log("Błąd zmiany przedmiotu w magazynie")
                                        return;
                                    }
                                    if (daneZadania[0].typ === "Kowal") {
                                        zg = 1;
                                    }
                                    if (daneZadania[1].typ === "Kowal") {
                                        zp = 1;
                                    }
                                    if (daneZd[0].typ === "Kowal") {
                                        zd = 1;
                                    }
                                    if (daneZadania[0].typ === "Miedziaki") {
                                        zg = danePrzed[0].poziom_ulepszenia * 200;
                                    }
                                    if (daneZadania[1].typ === "Miedziaki") {
                                        zp = danePrzed[0].poziom_ulepszenia * 200;
                                    }
                                    if (daneZd[0].typ === "Miedziaki") {
                                        zd = danePrzed[0].poziom_ulepszenia * 200;
                                    }
                                    const sqlPostep = "UPDATE postac SET Postep_zg = Postep_zg + ?, Postep_zp = Postep_zp + ?, Postep_zd = Postep_zd + ? WHERE nazwa = ?"
                                    db.query(sqlPostep, [zg, zp, zd, nazwaPostaci], (errPostep) => {
                                        if (errPostep) {
                                            console.log(errPostep)
                                            console.log("Nie udało się zaktualizować postępu")
                                            return;
                                        }
                                    })
                                    console.log("Ulepszono!")
                                    return res.json({ Message: "Ulepszenie udane" })
                                })
                            }
                            else {
                                if (daneZadania[0].typ === "Miedziaki") {
                                    zg = danePrzed[0].poziom_ulepszenia * 200;
                                }
                                if (daneZadania[1].typ === "Miedziaki") {
                                    zp = danePrzed[0].poziom_ulepszenia * 200;
                                }
                                if (daneZd[0].typ === "Miedziaki") {
                                    zd = danePrzed[0].poziom_ulepszenia * 200;
                                }
                                const sqlPostep = "UPDATE postac SET Postep_zg = Postep_zg + ?, Postep_zp = Postep_zp + ?, Postep_zd = Postep_zd + ? WHERE nazwa = ?"
                                db.query(sqlPostep, [zg, zp, zd, nazwaPostaci], (errPostep) => {
                                    if (errPostep) {
                                        console.log(errPostep)
                                        console.log("Nie udało się zaktualizować postępu")
                                        return;
                                    }
                                })
                                console.log("Ulepszenie nieudane")
                                return res.json({ Message: "Ulepszenie nie powiodło się" })
                            }
                        }
                        else {
                            if (czyUdane - 5 - danePrzed[0].poziom_ulepszenia * 5 >= 1) {
                                db.query(sqlZmianaPrzedmiotu, [danePrzed[0].id, danePrzed[0].id - 1, danePostac[0].id], (errMag) => {
                                    if (errMag) {
                                        console.log(errMag);
                                        console.log("Błąd zmiany przedmiotu w magazynie")
                                        return;
                                    }
                                    if (daneZadania[0].typ === "Kowal") {
                                        zg = 1;
                                    }
                                    if (daneZadania[1].typ === "Kowal") {
                                        zp = 1;
                                    }
                                    if (daneZd[0].typ === "Kowal") {
                                        zd = 1;
                                    }
                                    if (daneZadania[0].typ === "Miedziaki") {
                                        zg = danePrzed[0].poziom_ulepszenia * 200;
                                    }
                                    if (daneZadania[1].typ === "Miedziaki") {
                                        zp = danePrzed[0].poziom_ulepszenia * 200;
                                    }
                                    if (daneZd[0].typ === "Miedziaki") {
                                        zd = danePrzed[0].poziom_ulepszenia * 200;
                                    }
                                    const sqlPostep = "UPDATE postac SET Postep_zg = Postep_zg + ?, Postep_zp = Postep_zp + ?, Postep_zd = Postep_zd + ? WHERE nazwa = ?"
                                    db.query(sqlPostep, [zg, zp, zd, nazwaPostaci], (errPostep) => {
                                        if (errPostep) {
                                            console.log(errPostep)
                                            console.log("Nie udało się zaktualizować postępu")
                                            return;
                                        }
                                    })
                                    console.log("Ulepszono!")
                                    return res.json({ Message: "Ulepszenie udane" })
                                })
                            }
                            else {
                                if (daneZadania[0].typ === "Miedziaki") {
                                    zg = danePrzed[0].poziom_ulepszenia * 200;
                                }
                                if (daneZadania[1].typ === "Miedziaki") {
                                    zp = danePrzed[0].poziom_ulepszenia * 200;
                                }
                                if (daneZd[0].typ === "Miedziaki") {
                                    zd = danePrzed[0].poziom_ulepszenia * 200;
                                }
                                const sqlPostep = "UPDATE postac SET Postep_zg = Postep_zg + ?, Postep_zp = Postep_zp + ?, Postep_zd = Postep_zd + ? WHERE nazwa = ?"
                                db.query(sqlPostep, [zg, zp, zd, nazwaPostaci], (errPostep) => {
                                    if (errPostep) {
                                        console.log(errPostep)
                                        console.log("Nie udało się zaktualizować postępu")
                                        return;
                                    }
                                })
                                db.query(sqlZmianaPrzedmiotu, [danePrzed[0].id - 2, danePrzed[0].id - 1, danePostac[0].id], (errMag) => {
                                    if (errMag) {
                                        console.log(errMag);
                                        console.log("Błąd zmiany przedmiotu w magazynie")
                                        return;
                                    }
                                    console.log("Ulepszenie nieudane")
                                    return res.json({ Message: "Ulepszenie nie powiodło się" })
                                })
                            }
                        }
                    })
                })

            })

        })
    })
});

app.get('/prace/:nazwa_postaci', (req, res) => {
    const nazwa = req.params.nazwa_postaci;
    const sqlPoziom = "SELECT poziom FROM postac WHERE nazwa = ?";

    db.query(sqlPoziom, [nazwa], (errorP, daneP) => {
        if (errorP) {
            console.log(errorP);
            console.log("Blad pobrania poziomu");
            return;
        }
        if (daneP.length === 0) {
            console.log("Brak takiej postaci");
            return;
        }

        const sqlPraca = "SELECT id, nazwa, poziom, czas_trwania, narzedzie FROM praca"

        db.query(sqlPraca, [], (error, dane) => {

            if (error) {
                console.log(error);
                console.log("Blad pobrania prac");
                return;
            }
            if (dane.length === 0) {
                console.log("Nie pobrano prac");
                return;
            }

            const prace = {
                praca: []
            };

            if (dane.length > 0) {

                dane.forEach((job) => {
                    if (daneP[0].poziom >= job.poziom) {
                        const pracaInfo = {
                            id: job.id,
                            nazwa: job.nazwa,
                            poziom: job.poziom,
                            czas: job.czas_trwania,
                            narzedzie: job.narzedzie,
                            czySpelnia: "tak"

                        };
                        prace.praca.push(pracaInfo);
                    }
                    else {
                        const pracaInfo = {
                            id: job.id,
                            nazwa: job.nazwa,
                            poziom: job.poziom,
                            czas: job.czas_trwania,
                            narzedzie: job.narzedzie,
                            czySpelnia: "nie"

                        };
                        prace.praca.push(pracaInfo);
                    }
                });
            }
            res.json({ Praca: prace });

        });
    });
});

app.post('/rozpocznijPrace/:nazwa/:id/:czas', (req, res) => {
    const nazwaPostaci = req.params.nazwa
    const praca_id = req.params.id - (-1)
    const czasPracy = req.params.czas
    console.log(praca_id + " " + czasPracy)
    const sqlPostac = "SELECT id, poziom, miedziaki FROM postac WHERE nazwa = ?"
    db.query(sqlPostac, [nazwaPostaci], (errPostac, danePostac) => {
        if (errPostac) {
            console.log(errPostac);
            console.log("Blad pobrania danych postaci");
            return;
        }
        if (danePostac.length === 0) {
            console.log("Nie ma takiej postaci");
            return;
        }
        var sqlMozliweNagrody = ""
        var doswiadczenie = 0
        var miedziaki = 0
        var nagroda = 0
        switch (praca_id) {
            case 1: {
                sqlMozliweNagrody = "SELECT id FROM przedmiot WHERE typ = 'Produkt' AND nazwa LIKE '%Nić'";
                doswiadczenie = 50;
                miedziaki = 70;
                break;
            }
            case 2: {
                sqlMozliweNagrody = "SELECT id FROM przedmiot WHERE typ = 'Produkt' AND nazwa LIKE '%Wstęga'";
                doswiadczenie = 800;
                miedziaki = 1200;
                break;
            }
            case 3: {
                sqlMozliweNagrody = "SELECT id FROM przedmiot WHERE typ = 'Produkt' AND nazwa LIKE '%Kielich'";
                doswiadczenie = 3000;
                miedziaki = 1000;
                break;
            }
            case 4: {
                sqlMozliweNagrody = "SELECT id FROM przedmiot WHERE typ = 'Produkt' AND nazwa LIKE 'Potrawa%'";
                doswiadczenie = 5000;
                miedziaki = 500;
                break;
            }
        }
        db.query(sqlMozliweNagrody, [], (errNagrody, daneNagrody) => {
            if (errNagrody) {
                console.log(errNagrody);
                console.log("Blad pobrania nagrod");
                return;
            }
            if (daneNagrody.length === 0) {
                console.log("Nie znaleziono zadnych mozliwych nagrod");
                return;
            }
            const szansa = Math.floor(Math.random() * 100) + 1
            switch (daneNagrody.length) {
                case 2: {
                    if (szansa <= 50) {
                        nagroda = null;
                    } else if (szansa <= 90) {
                        nagroda = daneNagrody[0].id
                    } else {
                        nagroda = daneNagrody[1].id
                    }
                    break;
                }
                case 3: {
                    if (szansa <= 40) {
                        nagroda = null;
                    } else if (szansa <= 70) {
                        nagroda = daneNagrody[0].id
                    } else if (szansa <= 90) {
                        nagroda = daneNagrody[1].id
                    } else {
                        nagroda = daneNagrody[2].id
                    }
                    break;
                }
                case 4: {
                    if (szansa <= 30) {
                        nagroda = null;
                    } else if (szansa <= 70) {
                        nagroda = daneNagrody[0].id
                    } else if (szansa <= 90) {
                        nagroda = daneNagrody[1].id
                    } else if (szansa <= 98) {
                        nagroda = daneNagrody[2].id
                    } else {
                        nagroda = daneNagrody[3].id
                    }
                    break;
                }
            }
            const obecnadata = new Date();
            const [godziny, minuty, sekundy] = czasPracy.split(":").map(Number);
            obecnadata.setHours(obecnadata.getHours() + godziny);
            obecnadata.setMinutes(obecnadata.getMinutes() + minuty);
            obecnadata.setSeconds(obecnadata.getSeconds() + sekundy);
            const values = [
                danePostac[0].id,
                praca_id,
                nagroda,
                doswiadczenie,
                miedziaki,
                obecnadata,
                1
            ]
            const sqlWykonywanaPraca = "INSERT INTO postac_prace (`Postac_id`,`Praca_id`, `Przedmiot_id`, `doswiadczenie`, `miedziaki`, `data_zakonczenia`, `status`) VALUES (?)"
            db.query(sqlWykonywanaPraca, [values], (errPraca) => {
                if (errPraca) {
                    console.log(errPraca)
                    console.log("Nie udało się dodać pracy")
                    return;
                }
                return res.json({ Message: "Pracujesz" })
            })
        })
    })

});

app.get('/wykonywanePrace/:nazwa_postaci', (req, res) => {
    const nazwa = req.params.nazwa_postaci;
    const sqlPostac = "SELECT id FROM postac WHERE nazwa = ?"
    db.query(sqlPostac, [nazwa], (errPostac, danePostac) => {
        if (errPostac) {
            console.log(errPostac)
            console.log("Nie udalo sie pobrac postaci")
            return;
        }
        const sqlPraca = "SELECT id, Praca_id, data_zakonczenia, Przedmiot_id, doswiadczenie, miedziaki FROM postac_prace WHERE Postac_id = ? AND status = 1"
        db.query(sqlPraca, [danePostac[0].id], (errPraca, danePraca) => {
            if (errPraca) {
                console.log(errPraca)
                console.log("Nie udalo sie pobrac bieżącej pracy")
                return;
            }
            if (danePraca.length === 0) {
                console.log("Nie ma bieżącej pracy")
                return res.json({ Praca: null });
            }
            sqlPrzedmiot = "SELECT nazwa, rzadkosc, cena, typ, ikona, poziom FROM przedmiot WHERE id = ?"
            db.query(sqlPrzedmiot, [danePraca[0].Przedmiot_id], (errPrzedmiot, danePrzedmiot) => {
                if (errPrzedmiot) {
                    console.log(errPrzedmiot)
                    console.log("Nie udało się pobrać danych przedmiotu")
                    return;
                }
                if (danePrzedmiot.length === 0) {
                    const dane = {
                        id: danePraca[0].id,
                        praca_id: danePraca[0].Praca_id,
                        data: danePraca[0].data_zakonczenia,
                        exp: danePraca[0].doswiadczenie,
                        miedziaki: danePraca[0].miedziaki
                    }
                    return res.json({ Praca: dane });
                }
                if (danePrzedmiot.length > 0) {
                    const dane = {
                        id: danePraca[0].id,
                        praca_id: danePraca[0].Praca_id,
                        data: danePraca[0].data_zakonczenia,
                        exp: danePraca[0].doswiadczenie,
                        miedziaki: danePraca[0].miedziaki,
                        nazwa_p: danePrzedmiot[0].nazwa,
                        rzadkosc_p: danePrzedmiot[0].rzadkosc,
                        cena_p: danePrzedmiot[0].cena,
                        typ_p: danePrzedmiot[0].typ,
                        ikona_p: danePrzedmiot[0].ikona,
                        poziom_p: danePrzedmiot[0].poziom
                    }
                    return res.json({ Praca: dane });
                }
            })
        })
    })

});

app.post('/zakonczPrace/:id', (req, res) => {
    const id = req.params.id;
    const sqlPraca = "SELECT Postac_id, Przedmiot_id, doswiadczenie, miedziaki FROM postac_prace WHERE id = ?"
    db.query(sqlPraca, [id], (errPraca, danePraca) => {
        if (errPraca) {
            console.log(errPraca)
            console.log("Nie udało się pobrać pracy")
            return;
        }
        if (danePraca[0].Przedmiot_id !== null) {
            const sqlSprawdzMagazyn = "SELECT id FROM magazyn WHERE przedmiot_id = ? AND Postac_id = ?"
            db.query(sqlSprawdzMagazyn, [danePraca[0].Przedmiot_id, danePraca[0].Postac_id], (errMag, daneMag) => {
                if (errMag) {
                    console.log(errMag)
                    console.log("Nie udało się pobrać danych magazynu")
                    return;
                }
                if (daneMag.length === 0) {
                    const sqlDodajPrzedmiot = "INSERT INTO magazyn (`przedmiot_id`,`ilosc`,`zalozone`,`Postac_id`) VALUES (?)"
                    const values = [
                        danePraca[0].Przedmiot_id,
                        1,
                        0,
                        danePraca[0].Postac_id
                    ]
                    db.query(sqlDodajPrzedmiot, [values], (errDodaj) => {
                        if (errDodaj) {
                            console.log(errDodaj)
                            console.log("Nie udało się dodać przedmiotu")
                            return;
                        }
                    })
                }
                if (daneMag.length > 0) {
                    const sqlAktualizujMagazyn = "UPDATE magazyn SET ilosc = ilosc + 1 WHERE id = ?"
                    db.query(sqlAktualizujMagazyn, [daneMag[0].id], (errAkt) => {
                        if (errAkt) {
                            console.log(errAkt)
                            console.log("Nie udało się zaktualizować magazynu")
                            return;
                        }
                    })
                }
            })
        }

        const sqlPostac = 'SELECT doswiadczenie, Zadania_Glowne, Zadania_Poboczne FROM postac WHERE id=?'
        db.query(sqlPostac, [danePraca[0].Postac_id], (errD, danePostac) => {

            const sqlSprawdzPoziom = `SELECT * FROM poziomy WHERE wymagane_doswiadczenie <= ? ORDER BY wymagane_doswiadczenie DESC LIMIT 1`
            const valuesPoziom = [
                danePostac[0].doswiadczenie + danePraca[0].doswiadczenie
            ]
            db.query(sqlSprawdzPoziom, valuesPoziom, (errD, daneNagroda) => {
                const sqlAktualizujPostac = "UPDATE postac SET miedziaki = miedziaki + ?, doswiadczenie = doswiadczenie + ?,poziom = ?, Postep_zg = Postep_zg + ?, Postep_zp = Postep_zp + ?, Postep_zd = Postep_zd + ? WHERE id = ?"
                const sqlSprawdzZadania = "SELECT typ FROM zadania WHERE id IN (?,?)"
                const sqlZadanieDnia = "SELECT zd.Zadania_id, z.typ FROM zadanie_dnia AS zd " +
                    "INNER JOIN zadania AS z ON zd.Zadania_id = z.id WHERE zd.id = 1"
                db.query(sqlZadanieDnia, (errZd, daneZd) => {
                    if (errZd) {
                        console.log(errZd)
                        console.log("Nie udało się pobrać zadania dnia")
                        return;
                    }
                    db.query(sqlSprawdzZadania, [danePostac[0].Zadania_Glowne, danePostac[0].Zadania_Poboczne], (errZ, daneZadania) => {
                        if (errZ) {
                            console.log(errZ)
                            console.log("Nie udało się pobrać typu zadań")
                            return;
                        }
                        let zg = 0;
                        let zp = 0;
                        let zd = 0;
                        if (daneZadania.length === 0) {
                            console.log("Brak zadan")
                        }
                        if (daneZadania[0].typ === "Praca") {
                            zg = 1;
                        }
                        if (daneZadania[1].typ === "Praca") {
                            zp = 1;
                        }
                        if (daneZd[0].typ === "Praca") {
                            zd = 1;
                        }
                        db.query(sqlAktualizujPostac, [danePraca[0].miedziaki, danePraca[0].doswiadczenie, daneNagroda[0].id, zg, zp, zd, danePraca[0].Postac_id], (errPostac) => {
                            if (errPostac) {
                                console.log(errPostac)
                                console.log("Nie udało się zaktualizować postać")
                                return;
                            }
                            const sqlZakonczPrace = "UPDATE postac_prace SET status = 0 WHERE id = ?"
                            db.query(sqlZakonczPrace, [id], (errZakoncz) => {
                                if (errZakoncz) {
                                    console.log(errZakoncz)
                                    console.log("Nie udało się zakończyć pracy")
                                    return;
                                }
                                console.log("Odebrano nagrody")
                                return res.json({ Message: "Odebrano nagrody" })
                            })
                        })
                    })
                })
            })
        })
    })
});

app.post('/wystawPrzedmiot/:nazwa_postaci', (req, res) => {

    const nazwaPostaci = req.params.nazwa_postaci;

    const daneAukcji = req.body[0];
    const danePrzedmiotu = req.body[1];
    const podatek = req.body[2];

    console.log("Podatek")

    console.log(podatek)


    const sqlPostacINF = "SELECT id,miedziaki FROM postac WHERE nazwa = ?"
    const sqlDodajAukcje = "INSERT INTO rynek (`sprzedajacy_id`,`kupujacy_id`,`kup_teraz`,`oferta`,`ilosc`,`koniec`,`Przedmiot_id`,`aktywna`) VALUES (?)";
    const sqlSprawdzIlosc = `SELECT ilosc FROM magazyn WHERE id = ?`
    const sqlUsunMagazyn = `DELETE FROM magazyn WHERE id = ?`
    const sqlZaktualizujIlosc = "UPDATE magazyn SET `ilosc` = ? WHERE id = ?"
    const sqlZaktualizujMiedziaki = "UPDATE postac SET miedziaki = miedziaki - ? WHERE id = ?"

    db.query(sqlPostacINF, [nazwaPostaci], (error0, dane0) => {
        if (error0) {
            console.log(error0)
        }

        const czasKonca = new Date();
        const liczbaDni = parseInt(daneAukcji.liczbaDni);

        if (daneAukcji.liczbaDni.includes('d')) {
            czasKonca.setDate(czasKonca.getDate() + liczbaDni);
        } else if (daneAukcji.liczbaDni.includes('h')) {
            czasKonca.setHours(czasKonca.getHours() + liczbaDni);
        }

        const daneDoWstawienia = [
            dane0[0].id,
            null,
            daneAukcji.cenaKupTeraz !== '' ? daneAukcji.cenaKupTeraz : null,
            daneAukcji.cenaWywolawcza !== '' ? daneAukcji.cenaWywolawcza : null,
            daneAukcji.ilosc,
            czasKonca,
            danePrzedmiotu.ID,
            1
        ]
        if (dane0[0].miedziaki < podatek) {
            res.json("BrakMiedziakow")
            return;
        }
        db.query(sqlDodajAukcje, [daneDoWstawienia], (err1, dane1) => {
            if (err1) {
                console.log(err1)
            }

            db.query(sqlSprawdzIlosc, danePrzedmiotu.mID, (err2, dane2) => {
                if (err2) {
                    console.log(err2)
                }
                if (dane2[0].ilosc > daneAukcji.ilosc) {

                    db.query(sqlZaktualizujIlosc, [dane2[0].ilosc - daneAukcji.ilosc, danePrzedmiotu.mID], (err3, dane3) => {
                        if (err3) {
                            console.log(err3)
                        }
                        console.log("zaktualiowano ilosc produktu w magazynie")
                        db.query(sqlZaktualizujMiedziaki, [podatek, dane0[0].id], (err5, dane5) => {
                            if (err5) {
                                console.log(err5)
                            }
                        })
                    })
                } else {
                    db.query(sqlUsunMagazyn, danePrzedmiotu.mID, (err4, dane4) => {
                        if (err4) {
                            console.log(err4)
                        }
                        console.log("usunieto przedmiot z magazynu")
                        console.log("zaktualiowano ilosc produktu w magazynie")
                        db.query(sqlZaktualizujMiedziaki, [podatek, dane0[0].id], (err5, dane5) => {
                            if (err5) {
                                console.log(err5)
                            }
                        })
                    })
                }
            })
        })
        res.json("Wystawiono przedmiot")
    })
});

app.get('/rynek', (req, res) => {

    sqlPobierzRynek = ` SELECT r.id as rID, r.sprzedajacy_id, r.kupujacy_id, r.kup_teraz, r.oferta, r.ilosc, r.koniec, r.aktywna, p.id as pID, p.nazwa, p.zestaw, p.rzadkosc, p.cena, p.typ, p.ikona, p.poziom_ulepszenia, p.poziom, s.sila, s.zdrowie, s.zwinnosc, s.zrecznosc, s.inteligencja, s.pancerz, s.obrazeniaMin, s.obrazeniaMax 
    FROM rynek as r
    INNER JOIN przedmiot as p ON p.id = r.Przedmiot_id
    LEFT JOIN statystyki as s ON p.Statystyki_id = s.id
    WHERE r.koniec > NOW() AND r.aktywna = 1
    ORDER BY r.koniec ASC`

    const rynek = {
        aukcje: []
    };

    db.query(sqlPobierzRynek, (err, dane) => {
        if (err) {
            console.log(err)
        }

        dane.forEach((aukcja) => {

            rynek.aukcje.push(aukcja)
        }
        )
        res.json({ Rynek: rynek })
    })
})

app.get('/postacID/:nazwa_postaci', (req, res) => {

    const nazwaPostaci = req.params.nazwa_postaci;

    sqlPostacID = `SELECT id FROM postac WHERE nazwa=?`

    db.query(sqlPostacID, nazwaPostaci, (err, dane) => {
        if (err) {
            console.log(err)
        }
        res.json(dane[0].id)
    })
})


app.get('/przedmiotyDoOderbrania/:id', (req, res) => {

    const postacId = req.params.id;
    const sqlNieSprzedane = `SELECT p.id as pID,r.id as rID , r.sprzedajacy_id as sID, r.kupujacy_id as kID,r.koniec,r.ilosc, r.Przedmiot_id,prz.nazwa,prz.zestaw, prz.poziom, prz.rzadkosc, prz.ikona, prz.cena, s.obrazeniaMax, s.obrazeniaMin, prz.poziom_ulepszenia, prz.typ, s.sila, s.zdrowie, s.zwinnosc, s.zrecznosc, s.inteligencja, s.pancerz FROM postac AS p
    INNER JOIN rynek AS r ON r.sprzedajacy_id = p.id
    INNER JOIN przedmiot as prz ON r.Przedmiot_id=prz.id
    LEFT JOIN statystyki as s ON prz.Statystyki_id = s.id
    WHERE r.koniec < NOW() AND aktywna = 1 AND p.id=? AND r.kupujacy_id IS NULL`

    const sqlWygrane = `SELECT p.id as pID,r.id as rID , r.sprzedajacy_id as sID, r.kupujacy_id as kID,r.koniec,r.ilosc, r.Przedmiot_id,prz.nazwa,prz.zestaw, prz.poziom, prz.rzadkosc, prz.ikona, prz.cena, s.obrazeniaMax, s.obrazeniaMin, prz.poziom_ulepszenia, prz.typ, s.sila, s.zdrowie, s.zwinnosc, s.zrecznosc, s.inteligencja, s.pancerz FROM postac AS p
    INNER JOIN rynek AS r ON r.kupujacy_id = p.id
    INNER JOIN przedmiot as prz ON r.Przedmiot_id=prz.id
    LEFT JOIN statystyki as s ON prz.Statystyki_id = s.id
    WHERE r.koniec < NOW() AND aktywna = 1 AND p.id=?`

    const sqlAktywneAukcje = `SELECT count(*) as liczbaAktywnych FROM postac AS p
    INNER JOIN rynek AS r ON r.sprzedajacy_id = p.id
    INNER JOIN przedmiot as prz ON r.Przedmiot_id=prz.id
    LEFT JOIN statystyki as s ON prz.Statystyki_id = s.id
    WHERE r.koniec > NOW() AND aktywna = 1 AND p.id=?`

    const sqlSprzedaneLicytacje = `SELECT r.id,r.sprzedajacy_id,r.oferta,r.ilosc,p.nazwa FROM rynek as r
    INNER JOIN przedmiot as p ON p.id = r.Przedmiot_id
    WHERE kupujacy_id IS NOT NULL AND kup_teraz!=0 AND koniec<NOW() AND kup_teraz!=oferta  AND sprzedajacy_id=?`;
    const sqlSprzedaneKupTeraz = `SELECT r.id,r.sprzedajacy_id,r.oferta,r.ilosc,p.nazwa FROM rynek as r
    INNER JOIN przedmiot as p ON p.id = r.Przedmiot_id
    WHERE kup_teraz!=0 AND kup_teraz=oferta AND sprzedajacy_id=?`;

    const sqlUstawOdebranie = `UPDATE rynek SET kup_teraz=0 WHERE id=?`;
    const sqlDodajMiedziaki = `UPDATE postac SET miedziaki = miedziaki + ? WHERE id=?`;

    db.query(sqlNieSprzedane, postacId, (err, dane) => {
        if (err) {
            console.log(err)
        }
        db.query(sqlWygrane, postacId, (err2, dane2) => {
            if (err2) {
                console.log(err2)
            }
            db.query(sqlAktywneAukcje, postacId, (err3, dane3) => {
                if (err3) {
                    console.log(err3)
                }
                const przedmiotyDoOdbioru = [...dane, ...dane2];
                const iloscPrzedmiotowNaRynku = dane3[0].liczbaAktywnych + dane.length + dane2.length
                db.query(sqlSprzedaneLicytacje, postacId, (err4, dane4) => {
                    if (err4) {
                        console.log(err4)
                    }
                    db.query(sqlSprzedaneKupTeraz, postacId, (err5, dane5) => {
                        if (err5) {
                            console.log(err5)
                        }

                        const listaSprzedanychPrzedmiotow = [];
                        dane4.forEach(element => {
                            listaSprzedanychPrzedmiotow.push({ id: element.id, cena: element.oferta, ilosc: element.ilosc, nazwa: element.nazwa });
                        });

                        dane5.forEach(element => {
                            listaSprzedanychPrzedmiotow.push({ id: element.id, cena: element.oferta, ilosc: element.ilosc, nazwa: element.nazwa });
                        });

                        listaSprzedanychPrzedmiotow.forEach(item => {
                            db.query(sqlUstawOdebranie, [item.id], (err7) => {
                                if (err7) {
                                    console.log(err7);
                                }
                            });
                        });

                        const sumaOfert = dane4.reduce((suma, element) => suma + element.oferta, 0) +
                            dane5.reduce((suma, element) => suma + element.oferta, 0);

                        db.query(sqlDodajMiedziaki, [sumaOfert, postacId], (err6, dane6) => {
                            if (err6) {
                                console.log(err6)
                            }
                        })

                        res.json({ DoOdbioru: przedmiotyDoOdbioru, IloscPrzedmiotowNaRynku: iloscPrzedmiotowNaRynku, ListaSprzedanych: listaSprzedanychPrzedmiotow, MiedziakiDoOdbioru: sumaOfert })
                    })
                })
            })
        })
    })
})

app.post('/odbierzPrzedmiot', (req, res) => {

    const x = req.body
    const sqlSprawdzDostepneMiejsce = `SELECT COUNT(*) as ileMagazynow FROM magazyn WHERE Postac_id=?;`
    const sqlDodajDoMagazynu = "INSERT INTO magazyn (`przedmiot_id`,`ilosc`,`zalozone`,`Postac_id`) VALUES (?)";
    const sqlStanMagazynu = "SELECT id,ilosc FROM magazyn WHERE Postac_id=? AND przedmiot_id=? LIMIT 1;";
    const sqlAktualizujMagazyn = "UPDATE magazyn SET ilosc = ? WHERE id = ?";
    const sqlAktualizujRynek = "UPDATE rynek SET aktywna = 0 WHERE id = ?";

    db.query(sqlStanMagazynu, [x.postacID, x.przedmiot_id], (err, dane) => {
        if (err) {
            console.log(err)
        }

        if (x.typ === 'Produkt' && dane[0] && (dane[0].ilosc > 0)) {
            db.query(sqlAktualizujMagazyn, [dane[0].ilosc + x.ilosc, dane[0].id], (err1, dane1) => {
                if (err1) {
                    console.log(err1)
                }
                db.query(sqlAktualizujRynek, [x.rynekID], (err2, dane2) => {
                    if (err2) {
                        console.log(err2)
                    }
                    res.json("Odebrano")
                })
            })
        } else {
            db.query(sqlSprawdzDostepneMiejsce, [x.postacID], (err3, dane3) => {
                if (err3) {
                    console.log(err3)
                }
                if (dane3[0] && dane3[0].ileMagazynow >= 50) {
                    res.json("BrakMiejsca")
                    return
                } else {
                    const values = [
                        x.przedmiot_id,
                        x.ilosc,
                        0,
                        x.postacID
                    ]
                    db.query(sqlDodajDoMagazynu, [values], (err4, dane4) => {
                        if (err4) {
                            console.log(err4)
                        }
                        db.query(sqlAktualizujRynek, [x.rynekID], (err5, dane5) => {
                            if (err5) {
                                console.log(err5)
                            }
                            res.json("Odebrano")
                        })
                    })

                }
            })
        }
    })
})

app.post('/kupPrzedmiot', (req, res) => {

    const x = req.body
    //console.log(x)

    const sqlStanAukcji = `SELECT kupujacy_id,koniec,kup_teraz,oferta,aktywna FROM rynek WHERE id=? AND koniec>=NOW()`;
    const sqlAktualizujAukcje = `UPDATE rynek SET kupujacy_id = ?,oferta = ?,aktywna = ? WHERE id = ?`

    const sqlSprawdzDostepneMiejsce = `SELECT COUNT(*) as ileMagazynow FROM magazyn WHERE Postac_id=?;`
    const sqlDodajDoMagazynu = "INSERT INTO magazyn (`przedmiot_id`,`ilosc`,`zalozone`,`Postac_id`) VALUES (?)";
    const sqlStanMagazynu = "SELECT id,ilosc FROM magazyn WHERE Postac_id=? AND przedmiot_id=? LIMIT 1;";
    const sqlAktualizujMagazyn = "UPDATE magazyn SET ilosc = ? WHERE id = ?";

    const sqlMiedziaki = "SELECT miedziaki FROM postac WHERE id = ?";
    const sqlUpdateMiedziaki = "UPDATE postac SET miedziaki = miedziaki - ? WHERE id = ?";
    const sqlZwrocOferteDlaWlascicela = "UPDATE postac SET miedziaki = miedziaki + ? WHERE id = ?";

    let akcja;

    db.query(sqlMiedziaki, [x[0]], (err11, dane11) => {
        if (err11) {
            console.log(err11)
        }
        if (dane11[0].miedziaki < x[2]) {
            res.json("BrakFunduszy")
            return
        }
        console.log("Etap 1")
        db.query(sqlStanMagazynu, [x[0], x[1].pID], (err3, dane3) => {
            if (err3) {
                console.log(err3)
            }

            if (x[1].typ === 'Produkt' && dane3.length > 0) {
                console.log("Brak aktualizacji")
                akcja = 'aktualizuj';
            } else {
                db.query(sqlSprawdzDostepneMiejsce, [x[0]], (err12, dane12) => {
                    if (err12) {
                        console.log(err12)
                    }
                    if (dane12[0] && dane12[0].ileMagazynow >= 50) {
                        akcja = 'brakMiejsca'
                    } else {
                        akcja = 'dodaj'
                    }
                })
            }
            if (akcja !== 'brakMiejsca') {
                db.query(sqlStanAukcji, [x[1].rID], (err, dane) => {
                    if (err) {
                        console.log(err)
                    }
                    console.log("Etap 2")
                    if (dane.length === 0) {

                        res.json("AukcjaWygasla")
                        return
                    }
                    if (dane[0].aktywna === 0) {

                        res.json("AukcjaZakonczona")
                        return
                    }
                    if (dane[0].kupujacy_id === null) {
                        if (dane[0].oferta > x[2]) {
                            res.json("licytujeszPierwszy")
                            return
                        }
                    } else {
                        if (dane[0].oferta >= x[2]) {
                            res.json("NowaCena")
                            return
                        }
                    }
                    console.log("Etap 3")
                    let values

                    if (x[2] >= dane[0].kup_teraz) {
                        values = [
                            x[0],
                            dane[0].kup_teraz,
                            0,
                            x[1].rID
                        ]
                    } else {
                        values = [
                            x[0],
                            x[2],
                            1,
                            x[1].rID
                        ]
                    }
                    db.query(sqlAktualizujAukcje, values, (err2, dane2) => {
                        if (err2) {
                            console.log(err2)
                        }
                        console.log("Etap 4")
                        let refund = 0
                        if (x[0] === dane[0].kupujacy_id) {
                            refund = dane[0].oferta
                        } else if (dane[0].kupujacy_id !== null) {
                            db.query(sqlZwrocOferteDlaWlascicela, [dane[0].oferta, dane[0].kupujacy_id], (err25, dane25) => {
                                if (err25) {
                                    console.log(err25)
                                }
                            })
                        }

                        let nowyStanMiedziakow = 0

                        if (x[2] >= dane[0].kup_teraz) {
                            nowyStanMiedziakow = dane[0].kup_teraz - refund
                        } else {
                            nowyStanMiedziakow = x[2] - refund
                        }


                        db.query(sqlUpdateMiedziaki, [nowyStanMiedziakow, x[0]], (err24, dane24) => {
                            if (err24) {
                                console.log(24)
                            }
                            if (x[2] === dane[0].kup_teraz) {
                                console.log("Etap 5")
                                if (akcja === 'aktualizuj') {

                                    db.query(sqlAktualizujMagazyn, [dane3[0].ilosc + x[1].ilosc, dane3[0].id], (err4, dane4) => {
                                        if (err4) {
                                            console.log(err4)
                                        }
                                        res.json({ StanMiedziaki: nowyStanMiedziakow })
                                        return
                                    })
                                } else {
                                    const values = [
                                        x[1].pID,
                                        x[1].ilosc,
                                        0,
                                        x[0]
                                    ]
                                    db.query(sqlDodajDoMagazynu, [values], (err6, dane6) => {
                                        console.log("Etap 6")
                                        if (err6) {
                                            console.log(err6)
                                        }
                                        res.json({ StanMiedziaki: nowyStanMiedziakow })
                                        return
                                    })
                                }
                            }
                            else {
                                res.json({ StanMiedziaki: nowyStanMiedziakow })
                            }
                        })
                    })
                })
            } else {
                res.json("brakMiejsca")
                return
            }
        })
    })
})



app.get('/ranking/:nazwa_postaci', (req, res) => {

    const nazwaPostaci = req.params.nazwa_postaci;

    sqlPostacID = `SELECT id FROM postac WHERE nazwa=?`

    const sqlDaneGraczy = `
    SELECT
    p.id,
    p.wyglad,
    p.nazwa,
    p.poziom,
    (SUM(CASE
            WHEN w.atakujacy_id = p.id AND w.wygrana = 1 THEN 1
            WHEN w.przeciwnik_id = p.id AND w.wygrana = 0 THEN 1
            ELSE 0
        END) - SUM(CASE
            WHEN w.przeciwnik_id = p.id AND w.wygrana = 1 THEN 1
            WHEN w.atakujacy_id = p.id AND w.wygrana = 0 THEN 1
            ELSE 0
        END)) AS bilans
FROM
    postac AS p
LEFT JOIN
    walki AS w ON p.id = w.atakujacy_id OR p.id = w.przeciwnik_id
GROUP BY
    p.poziom,p.id, p.nazwa
ORDER BY
    p.poziom desc
            `;

    const sqlDaneOpracach = `SELECT
    pp.Postac_id,
    SUM(TIME_TO_SEC(prac.czas_trwania)) AS suma_czasu
FROM
    postac_prace AS pp
JOIN
    praca AS prac ON pp.Praca_id = prac.id
WHERE
    pp.status = 0
GROUP BY
    pp.Postac_id`


    db.query(sqlPostacID, nazwaPostaci, (err, dane) => {
        if (err) {
            console.log(err)
        }
        const postacId = dane[0].id;
        db.query(sqlDaneGraczy, (err2, dane2) => {
            {
                if (err2) {
                    console.log(err2)
                }
                db.query(sqlDaneOpracach, (err3, dane3) => {
                    if (err3) {
                        console.log(err3)
                    }

                    const daneLaczone = dane2.map(gracz => {
                        const odpPraca = dane3.find(prace => prace.Postac_id === gracz.id);
                        return { ...gracz, suma_czasu: odpPraca ? odpPraca.suma_czasu : 0 };
                    });


                    //console.log(daneLaczone)
                    res.json({ PostacID: postacId, Ranking: daneLaczone });

                })
            }
        })
    })
})

app.listen(8081, () => {
    console.log("Serwer nasluchuje na porcie 8081");
})