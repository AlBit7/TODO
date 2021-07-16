function openNav() {
    document.getElementById("mySidenav").style.width = "200px";
    document.getElementById("main").style.marginLeft = "200px";
    document.getElementById("menu").style = "visibility: hidden;";
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("main").style.marginLeft = "0";
    document.getElementById("menu").style = "visibility: visible;";
}

var IdProgettoSelezionato = 0;
const menu = document.getElementById("mySidenav");
const fMenu = document.getElementById("modifica");
const elencoCompiti = document.getElementById("elenco");

caricaProgetti();

function caricaProgetti() {

    IdProgettoSelezionato = 0;

    fetch( 'https://todoapp.albit7.repl.co/api/progetti' )
    .then( response => response.json() )
    .then( response => {

        console.log(response)
        menu.innerHTML = `
                <a href="javascript:void(0)" class="closebtn" onclick="closeNav()">&times;</a>
			
                <div class="nuovoProgetto">
                    <span style="color: black;">Progetto</span>
                    <span class="iconaNuovoProgetto" onclick="creaNuovoProgetto()" aria-label="nuovo progetto">+</span>
                </div>
            `;

        // carica tutti i progetti
        for (const key in response) {
            if (response.hasOwnProperty(key)) {
                menu.innerHTML += `
                    <div id="${key}" class="elemento titolo" onclick="selezionato(event)" oncontextmenu="selezionato(event);finestraMenu(event);return false;">
                        ${response[key]["nomeProgetto"]}
                    </div>
                `    
            }
        }
    
        // carica i compiti del progetto TODO
        const progettoTODO = response[IdProgettoSelezionato]["compiti"]
        console.log("compiti di " + IdProgettoSelezionato + ": " + progettoTODO)
        
        for (const compito in progettoTODO) {
            if (progettoTODO.hasOwnProperty(compito)) {

                elencoCompiti.innerHTML += `
                    <div class="compito">
                        <svg id="t${compito}" name="${compito}" onmousedown="completaCompito(event)" style="cursor: pointer;" class="tick" viewBox="0 0 915.8 915.8">
                            <circle id="c${compito}" class="cls-1" cx="457.9" cy="457.9" r="434.4" />
                        </svg>
                        <p id="${compito}" class="testo">${progettoTODO[compito]["Testo"]}</p>
                        <span class="data">${progettoTODO[compito]["Scadenza"]["Giorno"]}/${progettoTODO[compito]["Scadenza"]["Mese"]}/${progettoTODO[compito]["Scadenza"]["Anno"]}</span>
                    </div>
                `

                if (progettoTODO[compito]["Completato"]) {
                    document.getElementById("c" + compito).style = "fill: #5454ff; stroke: #5454ff";
                    document.getElementById(compito).style = "text-decoration: line-through;";
                }
                
            }
        }

        // segno TODO come selezionato
        document.getElementById(IdProgettoSelezionato).style = "color:white;background-color:black;";

    } );

    

}

function creaNuovoProgetto() {

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "https://todoapp.albit7.repl.co/api/aggiungiProgetto", true);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            console.log(xhr.status);
            console.log("id progetto creato: " + xhr.response);
            menu.innerHTML += `
                <div id="${xhr.response}" class="elemento titolo" onclick="selezionato(event)" oncontextmenu="selezionato(event);finestraMenu(event);return false;">
                    nuovo
                </div>
            `

        }
    };

    let data = `{
        "nomeProgetto": "vuoto",
        "compiti": {}
    }`;

    xhr.send(data);

}

function eliminaProgetto() {

}

function selezionato(event) {

    console.log(event);
    console.log(event.target.id);

    if (event.target.id != IdProgettoSelezionato && event.target.localName == "div") {
        document.getElementById(IdProgettoSelezionato).style = "";
        event.target.style = "color:white;background-color:black;";
        IdProgettoSelezionato = event.target.id;

        document.getElementById("elenco").innerHTML = "";

        // carica tutti i compiti del progetto
        fetch( `https://todoapp.albit7.repl.co/api/compiti/${IdProgettoSelezionato}` )
            .then( response => response.json() )
            .then( response => {
                console.log("compiti di " + IdProgettoSelezionato + ": " + response)
                for (const compito in response) {
                    if (response.hasOwnProperty(compito)) {

                        document.getElementById("elenco").innerHTML += `
                            <div class="compito">
                                <svg id="t${compito}" name="${compito}" onmousedown="completaCompito(event)" style="cursor: pointer;" class="tick" viewBox="0 0 915.8 915.8">
                                    <circle id="c${compito}" class="cls-1" cx="457.9" cy="457.9" r="434.4" />
                                </svg>
                                <p id="${compito}" class="testo">${response[compito]["Testo"]}</p>
                                <span class="data">${response[compito]["Scadenza"]["Giorno"]}/${response[compito]["Scadenza"]["Mese"]}/${response[compito]["Scadenza"]["Anno"]}</span>
                            </div>
                        `

                        if (response[compito]["Completato"]) {
                            document.getElementById("c" + compito).style = "fill: #5454ff; stroke: #5454ff";
                            document.getElementById(compito).style = "text-decoration: line-through;";
                        }
                        
                    }
                }
            } );

    }

}

function completaCompito(event) {

    let id = event.target.id.slice(1);
    let pallino = document.getElementById("c" + id);
    let testo = document.getElementById(id);
    let completato;

    if (testo.style.textDecoration === "line-through") {
        completato = 0;
        pallino.style = testo.style = "";
    } else {
        completato = 1;
        testo.style = "text-decoration: line-through;"; // modifico stato della pagina
        pallino.style = "fill: #5454ff; stroke: #5454ff";
    }

    // aggiorno il compito con put
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var requestOptions = {
        method: 'PUT',
        headers: myHeaders,
    };

    fetch(`https://todoapp.albit7.repl.co/api/completaCompito/${IdProgettoSelezionato}/${id}/${completato}`, requestOptions)
        .then(response => response.text())
        .then(result => console.log(result))
        .catch(error => console.log('error', error));

}

function creaCompito(event) {

    if (event.key === "Enter") {

        let testo = document.getElementById("input").value;
        let scadenza = document.getElementById("scadenza").value;

        document.getElementById("input").value = document.getElementById("scadenza").value = "";

        console.log(testo);
        console.log(scadenza);

        if (testo != "") {

            // posta il risultato a server
            const d = new Date();
            if (scadenza == "") {
                scadenza = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
            }
            let dataScadenza = scadenza.split("-");
            console.log(dataScadenza);

            var myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");

            var raw = JSON.stringify({
                "Testo": testo,
                "Completato": 0,
                "Postato": {
                    "Giorno": d.getDate(),
                    "Mese": d.getMonth() + 1,
                    "Anno": d.getFullYear()
                },
                "Scadenza": {
                    "Giorno": dataScadenza[2],
                    "Mese": dataScadenza[1],
                    "Anno": dataScadenza[0]
                }
            });

            var requestOptions = {
                method: 'POST',
                headers: myHeaders,
                body: raw,
                redirect: 'follow'
            };

            fetch(`https://todoapp.albit7.repl.co/api/aggiungiCompito/${IdProgettoSelezionato}`, requestOptions)
            .then(response => response.text())
            .then(result => {
                
                // mostra il compito sulla pagina
                document.getElementById("elenco").innerHTML += `
                        <div class="compito">
                            <svg id="t${result}" name="${result}" onmousedown="completaCompito(event)" style="cursor: pointer;" class="tick" viewBox="0 0 915.8 915.8">
                                <circle id="c${result}" class="cls-1" cx="457.9" cy="457.9" r="434.4" />
                            </svg>
                            <p id="${result}" class="testo">${testo}</p>
                            <span class="data">${dataScadenza[2]}/${dataScadenza[1]}/${dataScadenza[0]}</span>
                        </div>
                    `
                
            })
            .catch(error => console.log('error', error));

        }

    }

}

function finestraMenu(event) {

    console.log(event)

    // event.target.style.backgroundColor = "hsl(0, 0%, 90%);";

    fMenu.style.display = "block";
    fMenu.style.left = event.pageX + "px";
    fMenu.style.top = event.pageY + "px";

}

function nascondiMenu(event) {

    fMenu.style.display = "none";

}

function rinominaProgetto() {

    let nuovoNome = "pablo";

    var requestOptions = {
        method: 'PUT',
        redirect: 'follow'
    };

    fetch(`https://todoapp.albit7.repl.co/api/rinominaProgetto/${IdProgettoSelezionato}/${nuovoNome}`, requestOptions)
        .then(response => response.text())
        .then(result => console.log(result))
        .catch(error => console.log('error', error));

    syncDelay(250); // il server ha bisogno almeno di 1/4 di secondo
    caricaProgetti();

}

function eliminaProgetto() {

    var requestOptions = {
        method: 'DELETE',
        redirect: 'follow'
    };

    fetch(`https://todoapp.albit7.repl.co/api/rimuoviProgetto/${IdProgettoSelezionato}`, requestOptions)
        .then(response => response.text())
        .then(result => console.log(result))
        .catch(error => console.log('error', error));

    syncDelay(250);
    caricaProgetti();

}

function syncDelay(milliseconds){
    var start = new Date().getTime();
    var end=0;
    while( (end-start) < milliseconds){
        end = new Date().getTime();
    }
}
