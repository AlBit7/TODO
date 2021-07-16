from flask import Flask, render_template, request
import json, time

app = Flask(__name__)
db = json.load(open("db.json"))

# ------------- PRINCIPALE -------------

@app.route('/') 
def index():

    if not request.headers.getlist("X-Forwarded-For"):
        ip = request.remote_addr
    else:
        ip = request.headers.getlist("X-Forwarded-For")[0]

    print(ip)

    f = open("log.txt", "a")
    f.write(f"[ {ip} ] - {time.asctime(time.localtime(time.time()))}\n")
    f.close()

    return render_template('index.html')

# ------------- PROGETTI -------------

@app.route('/api/progetti', methods=["GET"])
def mostraTuttiIProgetti():

    print("tutti i progetti")

    return json.load(open("db.json")), 200, {'Content-Type': 'application/json'}

@app.route('/api/aggiungiProgetto', methods=["POST"])
def aggiungiProgetto():

    print("aggiunta di un progetto")

    corpo = request.get_json()
    id_progetto = str(id(corpo))
    db[id_progetto] = corpo
    salva_DB()
    
    return id_progetto, 200, {'Content-Type': 'text'}

@app.route('/api/modificaProgetto/<ID_progetto>', methods=["PUT"])
def modificaProgetto(ID_progetto):

    print("modifica del progetto " + ID_progetto)

    corpo = request.get_json()
    db[ID_progetto] = corpo
    salva_DB()

    return "modificato con successo", 200, {'Content-Type': 'text'}

@app.route('/api/rinominaProgetto/<ID_progetto>/<nuovoNome>', methods=["PUT"])
def rinominaProgetto(ID_progetto, nuovoNome):

    print("rinominazione del progetto " + ID_progetto)

    db[ID_progetto]["nomeProgetto"] = nuovoNome
    salva_DB()

    return "rinominato con successo", 200, {'Content-Type': 'text'}

@app.route('/api/rimuoviProgetto/<ID_progetto>', methods=["DELETE"])
def rimuoviProgetto(ID_progetto):

    print("rimozione del progetto " + ID_progetto)

    del db[ID_progetto]
    salva_DB()
    
    return "rimozione avvenuta con successo", 200, {'Content-Type': 'text'}

# ------------- COMPITI -------------

@app.route('/api/compiti/<ID_progetto>', methods=["GET"])
def mostraTuttiICompiti(ID_progetto):

    print("tutti i compiti di " + ID_progetto)

    return json.load(open("db.json"))[ID_progetto]["compiti"], 200, {'Content-Type': 'application/json'}

@app.route('/api/aggiungiCompito/<ID_progetto>', methods=["POST"])
def aggiungiCompito(ID_progetto):

    print("aggiunta di un compito a " + ID_progetto)

    corpo = request.get_json()
    id_compito = str(id(corpo))
    db[ID_progetto]["compiti"][id_compito] = corpo
    salva_DB()
    
    return id_compito, 200, {'Content-Type': 'text'}

@app.route('/api/modificaCompito/<ID_progetto>/<ID_compito>', methods=["PUT"])
def modificaCompito(ID_progetto, ID_compito):

    print("modifica del compito " + ID_compito + " nel progetto " + ID_progetto)

    corpo = request.get_json()
    db[ID_progetto]["compiti"][ID_compito] = corpo
    salva_DB()

    return "modificato con successo", 200, {'Content-Type': 'text'}

@app.route('/api/completaCompito/<ID_progetto>/<ID_compito>/<completato>', methods=["PUT"])
def completaCompito(ID_progetto, ID_compito, completato):

    print("completamento del compito " + ID_compito + " nel progetto " + ID_progetto + " come " + completato)

    db[ID_progetto]["compiti"][ID_compito]["Completato"] = int(completato) 
    salva_DB()

    return "completato con successo", 200, {'Content-Type': 'text'}

@app.route('/api/rimuoviCompito/<ID_progetto>/<ID_compito>', methods=["DELETE"])
def rimuoviCompito(ID_progetto, ID_compito):

    print("rimozione del compito " + ID_compito + " del progetto " + ID_progetto)

    del db[ID_progetto]["compiti"][ID_compito]
    salva_DB()
    
    return "rimosso con successo", 200, {'Content-Type': 'text'}

# ---------------------

def salva_DB():

    with open('db.json', 'w') as fp:
        json.dump(db, fp)

if __name__=='__main__':
    
    app.run(host='0.0.0.0', debug=True, port=8080)

'''
{
    "139882466409472": {
        "nomeProgetto": "secondo progetto",
        "compiti": {
            "1": {
                "Testo": "fai la spesa",
                "Completato": true,
                "Postato": {
                    "Giorno": 7,
                    "Mese": 2,
                    "Anno": 2022
                },
                "Scadenza": {
                    "Giorno": 8,
                    "Mese": 4,
                    "Anno": 2022
                }
            },
            "139882466600128": {
                "Testo": "fai q",
                "Completato": false,
                "Scadenza": {
                    "Giorno": 4,
                    "Mese": 2,
                    "Anno": 2022
                }
            }
        }
    }
}

'''