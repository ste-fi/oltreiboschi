# Oltre i boschi e la neve

Progetto d'esame di Digital Humanities: il viaggio come crescita tra realtà e fantasia nella letteratura per l'infanzia scandinava (XIX–XX secolo). HTML5 + CSS + JavaScript.

##### Cartella

|File|Contenuto|
|-|-|
|`index.html`|home: hero, 8 card dell'architettura, mappa Leaflet, linea del tempo, accordion|
|`catalogo.html`|filtri a checkbox in accordion (autore, titolo, paese, anno + 3 assi del viaggio) e card|
|`dati.html`|tabelle: opere, autori (VIAF/Wikidata), paesi (GeoNames/Wikidata), vocabolario; download JSON e CSV|
|`crediti.html`, `metadati.html`|pagine del footer; `sito-dc.xml` sono i metadati Dublin Core del sito (scaricabili)|
|`nils-holgersson.html`, `snedronningen.html`|schede analitiche con aside contestuale|
|`\\\*-dc.xml`, `\\\*-tei.xml`|metadati Dublin Core (RDF/XML) e testo TEI per i due item|
|`items.json`|fonte unica dei dati (16 opere, autori, paesi, vocabolario)|
|`data.js`|copia di `items.json` come `window.DATA`, per far funzionare il sito anche aprendo i file in locale|
|`progetto.html`, `percorsi.html`, `bibliografia.html`| i percorsi sono generati da `items.json`|
|`style.css`, `script.js`|unico CSS e unico JS|

## 

