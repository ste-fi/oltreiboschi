/* Oltre i boschi e la neve - script.js (JavaScript puro)
   Dipende da data.js (window.DATA, generato da items.json). */
(function () {
  "use strict";
  var D = window.DATA;
  var page = document.body.getAttribute("data-page");

  /* ---------- utilità ---------- */
  function byId(list, id) { return list.filter(function (x) { return x.id === id; })[0]; }
  function paese(code) { return D.paesi.filter(function (p) { return p.codice === code; })[0]; }
  function autore(id) { return byId(D.autori, id); }
  function termine(asse, id) { return byId(D.vocabolario[asse].termini, id); }
  // etichette di un asse con più valori possibili (es. geografico: reale + fantastico)
  function etichette(asse, ids, sep) { return ids.map(function (id) { return termine(asse, id).label; }).join(sep || ", "); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function autoriTesto(item) { return item.autori.map(function (a) { return autore(a).nome; }).join(" · "); }
  function secBadge(s) { return '<span class="badge ' + (s === 19 ? "badge-o19" : "badge-o20") + '">' + (s === 19 ? "Ottocento" : "Novecento") + "</span>"; }
  function params() { return new URLSearchParams(window.location.search); }
  // Normalizza per la ricerca: minuscole, senza accenti; ø, æ, ð, þ non si scompongono da soli e vanno mappati
  function norm(s) {
    return String(s).toLowerCase()
      .replace(/ø/g, "o").replace(/æ/g, "ae").replace(/ð/g, "d").replace(/þ/g, "th")
      .normalize("NFD").replace(/[̀-ͯ]/g, "");
  }
  // Testo su cui lavora la ricerca libera: titolo italiano e originale, autori, paese, raccolta, sintesi e tipologia
  function searchText(it) {
    var parts = [it.titolo_it, it.titolo, autoriTesto(it), paese(it.paese).nome_it, it.raccolta || "", it.sintesi, byId(D.tipologie, it.tipologia).label, etichette("geografico", it.geografico)];
    it.funzionale.forEach(function (f) { parts.push(termine("funzionale", f).label); });
    it.tematico.forEach(function (t) { parts.push(termine("tematico", t).label); });
    return norm(parts.join(" "));
  }

  /* ---------- navbar toggler ---------- */
  var toggler = document.querySelector(".navbar-toggler");
  var menu = document.getElementById("nav-menu");
  if (toggler && menu) {
    toggler.addEventListener("click", function () {
      menu.classList.toggle("open");
    });
  }

  /* ---------- menù a tendina "Contatti" ---------- */
  var dropdowns = document.querySelectorAll(".nav-menu .dropdown");
  function closeDropdowns(except) {
    dropdowns.forEach(function (dd) {
      if (dd !== except) {
        dd.classList.remove("open");
        dd.querySelector(".dropdown-toggle").setAttribute("aria-expanded", "false");
      }
    });
  }
  dropdowns.forEach(function (dd) {
    var btn = dd.querySelector(".dropdown-toggle");
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      closeDropdowns(dd);
      var open = dd.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  });
  document.addEventListener("click", function () { closeDropdowns(null); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeDropdowns(null); });

  /* ---------- tema chiaro/scuro (form-switch) ---------- */
  var themeSwitch = document.getElementById("theme-switch");
  function applyTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    if (themeSwitch) themeSwitch.checked = (t === "dark");
  }
  var saved = null;
  try { saved = localStorage.getItem("theme"); } catch (e) {}
  applyTheme(saved || "light");
  if (themeSwitch) {
    themeSwitch.addEventListener("change", function () {
      var t = themeSwitch.checked ? "dark" : "light";
      applyTheme(t);
      try { localStorage.setItem("theme", t); } catch (e) {}
    });
  }

  /* ---------- accordion (apertura/chiusura) ---------- */
  function initAccordions(root) {
    (root || document).querySelectorAll(".accordion-button").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var item = btn.closest(".accordion-item");
        item.classList.toggle("open");
      });
    });
  }
  initAccordions();

  /* ======================= INDEX ======================= */
  if (page === "index") {
    var showSec = { 19: true, 20: true };
    var map, markers = [];

    function counts() {
      var c = {};
      D.items.forEach(function (it) { if (showSec[it.secolo]) c[it.paese] = (c[it.paese] || 0) + 1; });
      return c;
    }
    function drawMap() {
      if (!window.L) { document.getElementById("map").innerHTML = '<p class="empty">Mappa non disponibile (Leaflet non caricato: serve la connessione).</p>'; return; }
      if (!map) {
        map = L.map("map", { scrollWheelZoom: false }).setView([62, 14], 4);
        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 8, attribution: "&copy; OpenStreetMap contributors" }).addTo(map);
      }
      markers.forEach(function (m) { map.removeLayer(m); });
      markers = [];
      var c = counts();
      D.paesi.forEach(function (p) {
        var n = c[p.codice] || 0;
        if (!n) return;
        var icon = L.divIcon({ className: "", html: '<div class="map-count">' + n + "</div>", iconSize: [38, 38], iconAnchor: [19, 19], popupAnchor: [0, -18] });
        var m = L.marker([p.lat, p.lng], { icon: icon, title: p.nome_it }).addTo(map);
        m.bindPopup("<strong>" + esc(p.nome_it) + "</strong><br>" + n + (n === 1 ? " opera" : " opere") + '<br><a href="catalogo.html?paese=' + p.codice + '">Vedi nel catalogo →</a>');
        markers.push(m);
      });
    }
    function drawTimeline() {
      var ol = document.getElementById("timeline");
      var list = D.items.filter(function (it) { return showSec[it.secolo]; }).sort(function (a, b) { return a.anno - b.anno || a.titolo_it.localeCompare(b.titolo_it, "it"); });
      ol.innerHTML = list.map(function (it) {
        return '<li class="o' + it.secolo + '"><a href="catalogo.html?titolo=' + it.id + '"><span class="year">' + it.anno + '</span><div class="t">' + esc(it.titolo_it) + '</div><div class="a">' + esc(autoriTesto(it)) + "</div></a></li>";
      }).join("");
    }
    document.querySelectorAll("input[data-secolo]").forEach(function (cb) {
      cb.addEventListener("change", function () {
        showSec[cb.getAttribute("data-secolo")] = cb.checked;
        drawMap(); drawTimeline();
      });
    });
    drawMap(); drawTimeline();

    // tessere dell'architettura: stesso effetto al clic, anche per i segnaposto
    document.querySelectorAll("a.tile").forEach(function (t) {
      t.addEventListener("click", function (e) {
        var href = t.getAttribute("href");
        var wasSelected = t.classList.contains("selected");
        document.querySelectorAll("a.tile.selected").forEach(function (x) { x.classList.remove("selected"); });
        if (href === "#") {            // segnaposto: nessuna navigazione, l'effetto si alterna
          e.preventDefault();
          if (!wasSelected) t.classList.add("selected");
          return;
        }
        t.classList.add("selected");
        if (e.button === 0 && !(e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)) {
          e.preventDefault();          // breve pausa perché l'effetto si veda prima del cambio di pagina
          setTimeout(function () { window.location.href = href; }, 220);
        }
      });
    });
  }

  /* ======================= CATALOGO ======================= */
  if (page === "catalogo") {
    var groups = {
      autore: { label: "Autore", opts: D.autori.map(function (a) { return { v: a.id, l: a.nome }; }), get: function (it) { return it.autori; } },
      // titolo italiano in evidenza, titolo originale sotto; la casella di ricerca del pannello cerca in entrambi
      titolo: { label: "Titolo", search: true, opts: D.items.slice().sort(function (a, b) { return a.titolo_it.localeCompare(b.titolo_it, "it"); }).map(function (i) { return { v: i.id, l: i.titolo_it, s: i.titolo, k: norm(i.titolo_it + " " + i.titolo) }; }), get: function (it) { return [it.id]; } },
      paese: { label: "Paese d'origine", opts: D.paesi.map(function (p) { return { v: p.codice, l: p.nome_it }; }), get: function (it) { return [it.paese]; } },
      anno: { label: "Anno di pubblicazione", opts: Array.from(new Set(D.items.map(function (i) { return i.anno; }))).sort().map(function (y) { return { v: String(y), l: String(y) }; }), get: function (it) { return [String(it.anno)]; } },
      geografico: { label: "Viaggio · asse geografico/ontologico", opts: D.vocabolario.geografico.termini.map(function (t) { return { v: t.id, l: t.label, s: t.def }; }), get: function (it) { return it.geografico; } },
      funzionale: { label: "Viaggio · asse funzionale/scopo", opts: D.vocabolario.funzionale.termini.map(function (t) { return { v: t.id, l: t.label, s: t.def }; }), get: function (it) { return it.funzionale; } },
      tematico: { label: "Viaggio · asse tematico/dinamica", opts: D.vocabolario.tematico.termini.map(function (t) { return { v: t.id, l: t.label }; }), get: function (it) { return it.tematico; } }
    };
    var sel = {};
    Object.keys(groups).forEach(function (k) { sel[k] = []; });
    var onlySheet = false;
    // ricerca libera (?q=... dalla navbar): ogni parola scritta deve comparire nel testo dell'opera
    var searchIndex = {};
    D.items.forEach(function (it) { searchIndex[it.id] = searchText(it); });
    var rawQuery = (params().get("q") || "").trim();
    var query = norm(rawQuery);
    function renderSearchState() {
      var box = document.getElementById("search-state");
      box.innerHTML = rawQuery ? '<span class="search-chip">Ricerca: «' + esc(rawQuery) + '» <button type="button" id="clear-q">×</button></span>' : "";
      var nav = document.getElementById("nav-q");
      if (nav) nav.value = rawQuery;
    }

    function buildGroup(key, hostId) {
      var g = groups[key];
      var host = document.getElementById(hostId);
      var html = '<div class="accordion-item" id="acc-' + key + '"><button type="button" class="accordion-button"><span>' + g.label + ' <span class="badge badge-tag" id="cnt-' + key + '" hidden></span></span></button><div class="accordion-panel">';
      if (g.exclusive) html += '<small class="muted">Scelta esclusiva: un solo valore.</small>';
      if (g.search) html += '<input type="search" class="panel-search" id="ps-' + key + '" placeholder="Cerca per titolo italiano o originale…" autocomplete="off">';
      g.opts.forEach(function (o) {
        var id = "f-" + key + "-" + o.v;
        html += '<div class="form-check"' + (o.k ? ' data-k="' + esc(o.k) + '"' : "") + '><input type="checkbox" id="' + id + '" data-group="' + key + '" value="' + o.v + '"><label for="' + id + '">' + esc(o.l) + (o.s ? "<small>" + esc(o.s) + "</small>" : "") + "</label></div>";
      });
      host.innerHTML = html + "</div></div>";
    }
    ["autore", "titolo", "paese", "anno"].forEach(function (k) { buildGroup(k, "h-" + k); });
    ["geografico", "funzionale", "tematico"].forEach(function (k) { buildGroup(k, "h-" + k); });
    initAccordions(document.querySelector(".filterbar"));

    function readSel() {
      Object.keys(groups).forEach(function (k) {
        sel[k] = Array.prototype.map.call(document.querySelectorAll('input[data-group="' + k + '"]:checked'), function (i) { return i.value; });
        var c = document.getElementById("cnt-" + k);
        c.hidden = !sel[k].length; c.textContent = sel[k].length;
      });
    }
    function render() {
      readSel();
      var list = D.items.filter(function (it) {
        if (onlySheet && !it.scheda) return false;
        if (query && searchIndex[it.id].indexOf(query) === -1) return false;
        return Object.keys(groups).every(function (k) {
          if (!sel[k].length) return true;
          return groups[k].get(it).some(function (v) { return sel[k].indexOf(v) > -1; });
        });
      }).sort(function (a, b) { return a.anno - b.anno; });
      document.getElementById("result-count").textContent = list.length + (list.length === 1 ? " opera" : " opere") + " su " + D.items.length;
      var host = document.getElementById("cards");
      if (!list.length) { host.innerHTML = '<div class="empty">Nessuna opera corrisponde ai filtri scelti. Prova a toglierne qualcuno.</div>'; return; }
      var hl = params().get("titolo");
      host.innerHTML = list.map(function (it) {
        var tags = it.funzionale.map(function (f) { return '<span class="badge badge-tag">' + termine("funzionale", f).label + "</span>"; }).join("") +
          it.tematico.map(function (t) { return '<span class="badge badge-tag">' + termine("tematico", t).label + "</span>"; }).join("");
        return '<article class="card item-card' + (hl === it.id ? " highlight" : "") + '" id="' + it.id + '">' +
          '<div class="badges">' + secBadge(it.secolo) + '<span class="badge">' + it.anno + '</span><span class="badge">' + esc(paese(it.paese).nome_it) + '</span>' + it.geografico.map(function (g) { return '<span class="badge badge-tag">' + termine("geografico", g).label + "</span>"; }).join("") + "</div>" +
          '<div class="it">' + esc(it.titolo_it) + '</div><div class="orig">' + esc(it.titolo) + "</div>" +
          '<div class="meta">' + esc(autoriTesto(it)) + (it.raccolta ? " · da <em>" + esc(it.raccolta) + "</em>" : "") + "</div>" +
          "<p>" + esc(it.sintesi) + "</p>" +
          '<div class="badges">' + tags + "</div>" +
          (it.scheda ? '<a class="card-link" href="' + it.scheda + '">Apri la scheda analitica →</a>' : "") +
          "</article>";
      }).join("");
      var h = document.querySelector(".item-card.highlight");
      if (h) h.scrollIntoView({ block: "center" });
    }
    document.querySelectorAll(".filterbar input[type=checkbox][data-group]").forEach(function (cb) {
      cb.addEventListener("change", function () {
        var g = groups[cb.getAttribute("data-group")];
        if (g.exclusive && cb.checked) {
          document.querySelectorAll('input[data-group="' + cb.getAttribute("data-group") + '"]').forEach(function (o) { if (o !== cb) o.checked = false; });
        }
        render();
      });
    });
    document.getElementById("only-sheet").addEventListener("change", function (e) { onlySheet = e.target.checked; render(); });
    document.getElementById("reset").addEventListener("click", function () {
      document.querySelectorAll(".filterbar input[type=checkbox][data-group]").forEach(function (c) { c.checked = false; });
      document.getElementById("only-sheet").checked = false; onlySheet = false;
      document.querySelectorAll(".panel-search").forEach(function (s) { s.value = ""; filterPanel(s); });
      rawQuery = ""; query = "";
      history.replaceState(null, "", "catalogo.html");
      renderSearchState();
      render();
    });
    // la ricerca libera si toglie con la × accanto al conteggio
    document.getElementById("search-state").addEventListener("click", function (e) {
      if (e.target.id !== "clear-q") return;
      rawQuery = ""; query = "";
      history.replaceState(null, "", "catalogo.html");
      renderSearchState();
      render();
    });
    // filtro di testo dentro il pannello dei titoli: cerca nel titolo italiano e in quello originale
    function filterPanel(input) {
      var q = norm(input.value.trim());
      input.closest(".accordion-panel").querySelectorAll(".form-check").forEach(function (row) {
        row.hidden = !!q && row.getAttribute("data-k").indexOf(q) === -1;
      });
    }
    document.querySelectorAll(".panel-search").forEach(function (s) {
      s.addEventListener("input", function () { filterPanel(s); });
    });
    // parametri URL dall'index: ?paese=XX  ?titolo=id
    var p = params();
    if (p.get("paese")) {
      var c1 = document.getElementById("f-paese-" + p.get("paese"));
      if (c1) { c1.checked = true; document.getElementById("acc-paese").classList.add("open"); }
    }
    if (p.get("titolo")) {
      var c2 = document.getElementById("f-titolo-" + p.get("titolo"));
      if (c2) { c2.checked = true; document.getElementById("acc-titolo").classList.add("open"); }
    }
    renderSearchState();
    render();
  }

  /* ======================= PAGINA DATI ======================= */
  if (page === "dati") {
    function fill(id, rows) { document.getElementById(id).innerHTML = rows.join(""); }
    function link(url, text) { return '<a href="' + url + '" target="_blank">' + text + "</a>"; }
    fill("t-items", D.items.map(function (it) {
      return "<tr><td>" + it.anno + "</td><td>" + esc(it.titolo_it) + "</td><td><em>" + esc(it.titolo) + "</em></td><td>" + esc(autoriTesto(it)) + "</td><td>" + esc(paese(it.paese).nome_it) + "</td><td>" + esc(byId(D.tipologie, it.tipologia).label) + "</td><td>" + etichette("geografico", it.geografico) + "</td><td>" + it.funzionale.map(function (f) { return termine("funzionale", f).label; }).join(", ") + "</td><td>" + it.tematico.map(function (t) { return termine("tematico", t).label; }).join(", ") + "</td></tr>";
    }));
    // autori: la chiave data-key fa ordinare per cognome anche se il nome è mostrato per esteso
    fill("t-autori", D.autori.map(function (a) {
      return '<tr><td data-key="' + esc(a.cognome + ", " + a.nome) + '">' + esc(a.nome) + "</td><td>" + a.nascita + "–" + (a.morte || "") + "</td><td>" + link("https://viaf.org/viaf/" + a.viaf, a.viaf) + "</td><td>" + link("https://www.wikidata.org/wiki/" + a.wikidata, a.wikidata) + "</td></tr>";
    }));
    fill("t-paesi", D.paesi.map(function (p) {
      var n = D.items.filter(function (i) { return i.paese === p.codice; }).length;
      return "<tr><td>" + p.codice + "</td><td>" + esc(p.nome_it) + "</td><td>" + p.lat + ", " + p.lng + "</td><td>" + link("https://www.geonames.org/" + p.geonames, p.geonames) + "</td><td>" + link("https://www.wikidata.org/wiki/" + p.wikidata, p.wikidata) + "</td><td>" + n + "</td></tr>";
    }));
    var rowsV = [];
    Object.keys(D.vocabolario).forEach(function (k) {
      D.vocabolario[k].termini.forEach(function (t) {
        rowsV.push("<tr><td>" + esc(D.vocabolario[k].label) + "</td><td><code>" + t.id + "</code></td><td>" + esc(t.label) + "</td><td>" + esc(t.def || "—") + "</td></tr>");
      });
    });
    fill("t-vocab", rowsV);

    // download: il JSON è l'intero dataset; ogni tabella ha il suo CSV
    function download(name, mime, text) {
      var blob = new Blob([text], { type: mime + ";charset=utf-8" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob); a.download = name;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    }
    function csvCell(v) { v = String(v); return /[",\n;]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }
    // CSV generico: intestazioni + righe (BOM: Excel riconosce l'UTF-8)
    function downloadCsv(name, head, rows) {
      var text = [head].concat(rows).map(function (r) { return r.map(csvCell).join(","); }).join("\r\n");
      download(name, "text/csv", "\ufeff" + text);
    }
    function onClick(id, fn) { var b = document.getElementById(id); if (b) b.addEventListener("click", fn); }
    onClick("dl-json", function () { download("items.json", "application/json", JSON.stringify(D, null, 1)); });
    onClick("dl-csv", function () {
      var head = ["id", "anno", "titolo_italiano", "titolo_originale", "autori", "paese", "tipologia", "asse_geografico", "asse_funzionale", "asse_tematico", "raccolta", "scheda"];
      var rows = D.items.map(function (it) {
        return [it.id, it.anno, it.titolo_it, it.titolo, it.autori.map(function (a) { return autore(a).nome; }).join(" | "), paese(it.paese).nome_it, byId(D.tipologie, it.tipologia).label, etichette("geografico", it.geografico, " | "), it.funzionale.map(function (f) { return termine("funzionale", f).label; }).join(" | "), it.tematico.map(function (t) { return termine("tematico", t).label; }).join(" | "), it.raccolta || "", it.scheda || ""];
      });
      downloadCsv("opere.csv", head, rows);
    });
    onClick("dl-csv-autori", function () {
      downloadCsv("autori.csv", ["id", "cognome", "nome", "nascita", "morte", "viaf", "wikidata"], D.autori.map(function (a) {
        return [a.id, a.cognome, a.nome, a.nascita, a.morte || "", a.viaf, a.wikidata];
      }));
    });
    onClick("dl-csv-paesi", function () {
      downloadCsv("paesi.csv", ["codice", "paese", "lat", "lng", "geonames", "wikidata", "opere"], D.paesi.map(function (p) {
        var n = D.items.filter(function (i) { return i.paese === p.codice; }).length;
        return [p.codice, p.nome_it, p.lat, p.lng, p.geonames, p.wikidata, n];
      }));
    });
    onClick("dl-csv-vocab", function () {
      var rows = [];
      Object.keys(D.vocabolario).forEach(function (k) {
        D.vocabolario[k].termini.forEach(function (t) { rows.push([D.vocabolario[k].label, t.id, t.label, t.def || ""]); });
      });
      downloadCsv("vocabolario.csv", ["asse", "identificatore", "etichetta", "definizione"], rows);
    });
    function cellKey(td) { return (td.getAttribute("data-key") || td.textContent).trim(); }
    // ordinamento colonne (click sull'intestazione)
    document.querySelectorAll("th[data-sort]").forEach(function (th) {
      th.addEventListener("click", function () {
        var table = th.closest("table"), idx = Array.prototype.indexOf.call(th.parentNode.children, th);
        var dir = th.getAttribute("data-dir") === "asc" ? "desc" : "asc";
        th.parentNode.querySelectorAll("th").forEach(function (x) { x.removeAttribute("data-dir"); });
        th.setAttribute("data-dir", dir);
        var rows = Array.prototype.slice.call(table.tBodies[0].rows);
        rows.sort(function (a, b) {
          var x = cellKey(a.cells[idx]), y = cellKey(b.cells[idx]);
          var nx = parseFloat(x), ny = parseFloat(y);
          var r = (!isNaN(nx) && !isNaN(ny)) ? nx - ny : x.localeCompare(y, "it");
          return dir === "asc" ? r : -r;
        });
        rows.forEach(function (r) { table.tBodies[0].appendChild(r); });
      });
    });
  }

  /* ======================= PAGINA PROGETTO: numeri del corpus ======================= */
  if (page === "progetto") {
    var anni = D.items.map(function (i) { return i.anno; });
    var stat = {
      opere: D.items.length,
      paesi: D.paesi.length,
      arco: Math.min.apply(null, anni) + "–" + Math.max.apply(null, anni),
      ottocento: D.items.filter(function (i) { return i.secolo === 19; }).length,
      novecento: D.items.filter(function (i) { return i.secolo === 20; }).length
    };
    document.querySelectorAll("[data-stat]").forEach(function (el) { el.textContent = stat[el.getAttribute("data-stat")]; });
  }

  /* ======================= PAGINA PERCORSI TEMATICI ======================= */
  if (page === "percorsi") {
    // titolo dell'opera come link: alla scheda analitica, se c'è, altrimenti alla sua card nel catalogo
    function workLink(it) {
      var href = it.scheda || ("catalogo.html?titolo=" + it.id);
      return '<a href="' + href + '"><em>' + esc(it.titolo_it) + "</em></a> <span class=\"muted\">· " + esc(autoriTesto(it)) + " · " + esc(paese(it.paese).nome_it) + ", " + it.anno + "</span>";
    }
    // itinerari proposti: l'elenco delle opere è nell'attributo data-items, i dati vengono da items.json
    document.querySelectorAll("article.path").forEach(function (art) {
      var list = art.getAttribute("data-items").split(",").map(function (id) { return byId(D.items, id); })
        .filter(Boolean).sort(function (a, b) { return a.anno - b.anno; });
      art.querySelector(".path-works").innerHTML = list.map(function (it) { return "<li>" + workLink(it) + "</li>"; }).join("");
    });
    // elenco per asse e per valore (un accordion per asse)
    var axisHost = document.getElementById("axis-host");
    axisHost.innerHTML = ["geografico", "funzionale", "tematico"].map(function (k) {
      var asse = D.vocabolario[k];
      var body = asse.termini.map(function (t) {
        var list = D.items.filter(function (it) { return it[k].indexOf(t.id) > -1; }).sort(function (a, b) { return a.anno - b.anno; });
        return '<h4>' + esc(t.label) + ' <span class="badge">' + list.length + "</span></h4>" +
          (t.def ? '<p class="muted">' + esc(t.def) + "</p>" : "") +
          "<ul>" + list.map(function (it) { return "<li>" + workLink(it) + "</li>"; }).join("") + "</ul>";
      }).join("");
      return '<div class="accordion-item"><button type="button" class="accordion-button"><span>' + esc(asse.label) + '</span></button><div class="accordion-panel tall">' + body + "</div></div>";
    }).join("");
    initAccordions(axisHost);
  }

  /* ======================= PAGINA ITEM: aside contestuale ======================= */
  if (page === "item") {
    var cur = byId(D.items, document.body.getAttribute("data-item"));
    var host = document.getElementById("related");
    function rel(title, list) {
      if (!list.length) return "";
      return "<h3>" + title + "</h3><ul>" + list.map(function (it) {
        return '<li><a href="catalogo.html?titolo=' + it.id + '"><em>' + esc(it.titolo_it) + "</em></a> (" + it.anno + ")</li>";
      }).join("") + "</ul>";
    }
    var others = D.items.filter(function (i) { return i.id !== cur.id; });
    var html = "";
    html += rel("Stesso paese: " + paese(cur.paese).nome_it, others.filter(function (i) { return i.paese === cur.paese; }));
    html += rel("Stessa tipologia", others.filter(function (i) { return i.tipologia === cur.tipologia; }));
    cur.funzionale.forEach(function (f) {
      html += rel("Scopo del viaggio: " + termine("funzionale", f).label.toLowerCase(), others.filter(function (i) { return i.funzionale.indexOf(f) > -1; }).slice(0, 5));
    });
    cur.geografico.forEach(function (g) {
      html += rel("Stesso asse geografico: " + termine("geografico", g).label.toLowerCase(), others.filter(function (i) { return i.geografico.indexOf(g) > -1; }).slice(0, 5));
    });
    host.innerHTML = html || "<p class='muted'>Nessun item correlato.</p>";
  }
})();
