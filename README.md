Il progetto “Oltre i boschi e la neve” è una collezione digitale di 16 opere della letteratura per l'infanzia scandinava (1843–1990) lette attraverso il tema del viaggio come crescita.

1. Struttura delle Pagine (Codice HTML)
Tutte le pagine del sito condividono una struttura standard in HTML:
<head>: Contiene i titoli, i collegamenti al foglio di stile (style.css) e i metadati descrittivi Dublin Core (per l'indicizzazione bibliografica).
data-page="..." nel <body>: Un marcatore (es. data-page="catalogo", data-page="index") che dice a JavaScript su quale pagina ci si trova per attivare le funzioni giuste.
Intestazione e Navigazione: Banner visivo in alto, barra di navigazione con menu responsive, ricerca rapida, interruttore per il tema scuro e "briciole di pane" (breadcrumb).
Piè di pagina (<footer>): Riferimenti alla licenza aperta Creative Commons CC BY 4.0, alle mappe (OpenStreetMap/Leaflet) e ai crediti.

Pagine Principali
index.html (Home Page): Presenta il progetto, contiene una griglia con le tessere di navigazione, la mappa interattiva (Leaflet) con le opere divise per paese, la linea del tempo orizzontale (dall'Ottocento al Novecento) e una guida a scomparsa (accordion).
catalogo.html (Catalogo): Contiene la barra dei filtri a checkbox (autore, titolo, paese, anno e assi del viaggio) e la casella di ricerca libera. Le schede delle 16 opere vengono generate e mostrate dinamicamente da JavaScript.
dati.html (Dati e Download): Mostra le tabelle complete delle opere, degli autori e dei paesi riconciliati con identificativi internazionali (VIAF, Wikidata, GeoNames). Permette di scaricare il dataset in formato JSON o CSV.
nils-holgersson.html (Scheda Analitica): Monografia dettagliata dell'opera di Selma Lagerlöf. Utilizza l'RDFa nei tag HTML per dichiarare i metadati, mostra una tabella con i criteri di marcatura TEI P5, presenta il testo in svedese originale affiancato alla traduzione italiana e genera automaticamente le opere correlate nella barra laterale.
percorsi.html (Percorsi Tematici): Propone 7 itinerari di lettura trasversali tra le opere, raggruppandole in base ai valori degli assi del viaggio.
progetto.html (Il Progetto): Pagina metodologica che ne spiega l'idea, gli obiettivi, le domande di ricerca e l'architettura tecnica.

File di Dati e Marcatura
items.json / data.js: È il "database" del sito. Contiene l'elenco dei 5 paesi, dei 16 autori, delle opere e del vocabolario controllato sviluppato su 3 assi del viaggio:
Asse geografico: Reale o Fantastico.
Asse funzionale: Formazione, Fuga, Ricerca, Prova, Scoperta, Sopravvivenza.
Asse tematico: Natura, Trasformazione, Amicizia, Perdita, Identità, Libertà, Casa.
sito-dc.xml e nils-holgersson-dc.xml: I metadati descrittivi in formato Dublin Core (RDF/XML) per l'intero sito e per la singola opera.
nils-holgersson-tei.xml: Il testo del capitolo LV di Nils Holgersson marcato secondo lo standard TEI P5 (evidenziando personaggi umani e animali, luoghi reali e narrativi, condizioni atmosferiche, elementi magici e discorsi/pensieri).
