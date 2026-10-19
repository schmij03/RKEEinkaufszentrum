/* Präsentation Ethik: Schauplatz Einkaufszentrum
   Beamer-Fenster: Pfeile/Leertaste blättern, T Timer, R Timer zurück, F Vollbild,
   P Referentenansicht (Notizen nur für die Lehrperson, in eigenem Fenster), H Hilfe. */
(function () {
  "use strict";
  var slides = Array.prototype.slice.call(document.querySelectorAll(".slide"));
  if (!slides.length) return;
  var params = new URLSearchParams(location.search);
  var PREVIEW = params.get("view") === "preview";
  var lesson = document.body.getAttribute("data-lesson") || "";
  var deckFile = location.pathname.split("/").pop() || "index.html";
  var cur = 0;
  if (PREVIEW) document.body.classList.add("preview");

  // ---------- Auftragsleiste auf den Folien ----------
  var ICON = {
    allein: '<svg viewBox="0 0 24 24"><circle cx="12" cy="7" r="4"/><path d="M4 22c0-5 3.6-8 8-8s8 3 8 8z"/></svg>',
    paar: '<svg viewBox="0 0 32 24"><circle cx="10" cy="7" r="3.6"/><circle cx="22" cy="7" r="3.6"/><path d="M2 22c0-4.6 3.4-7.4 8-7.4s8 2.8 8 7.4zM14 22c0-4.6 3.4-7.4 8-7.4s8 2.8 8 7.4z"/></svg>',
    gruppe: '<svg viewBox="0 0 36 24"><circle cx="8" cy="8" r="3.2"/><circle cx="18" cy="6" r="3.6"/><circle cx="28" cy="8" r="3.2"/><path d="M1 22c0-4 3-6.6 7-6.6s7 2.6 7 6.6zM10 22c0-4.6 3.4-7.6 8-7.6s8 3 8 7.6zM21 22c0-4 3-6.6 7-6.6s7 2.6 7 6.6z"/></svg>',
    plenum: '<svg viewBox="0 0 36 24"><circle cx="6" cy="10" r="2.6"/><circle cx="14" cy="7" r="2.8"/><circle cx="22" cy="7" r="2.8"/><circle cx="30" cy="10" r="2.6"/><path d="M1 22c0-3.4 2.3-5.6 5-5.6s5 2.2 5 5.6zM9 22c0-4 2.3-6.4 5-6.4s5 2.4 5 6.4zM17 22c0-4 2.3-6.4 5-6.4s5 2.4 5 6.4zM25 22c0-3.4 2.3-5.6 5-5.6s5 2.2 5 5.6z"/></svg>',
    hoeren: '<svg viewBox="0 0 24 24"><path d="M12 2a7 7 0 0 0-7 7c0 2.4 1 3.6 2 4.8.9 1 1.5 1.8 1.5 3.2a3 3 0 0 0 6 0h-2a1 1 0 0 1-2 0c0-2.1-1-3.3-2-4.4C7.7 11.6 7 10.7 7 9a5 5 0 0 1 10 0h2a7 7 0 0 0-7-7z"/><path d="M12 6a3 3 0 0 0-3 3h2a1 1 0 0 1 2 0c0 .8-.4 1.2-1 1.8-.6.6-1 1.2-1 2.2h2c0-.4.2-.6.6-1 .7-.7 1.4-1.4 1.4-3a3 3 0 0 0-3-3z"/></svg>'
  };
  var LABEL = {
    allein: "Jetzt du: allein",
    paar: "Jetzt ihr: zu zweit",
    gruppe: "Jetzt ihr: in der Dreiergruppe",
    plenum: "Alle zusammen",
    hoeren: "Zuhören und mitdenken"
  };
  slides.forEach(function (s) {
    var m = s.getAttribute("data-modus");
    if (!m || !LABEL[m]) return;
    var t = parseFloat(s.getAttribute("data-timer") || "0");
    var mat = s.getAttribute("data-material");
    var fertig = s.getAttribute("data-fertig");
    var bar = document.createElement("div");
    bar.className = "auftrag m-" + m;
    var html = '<span class="ic">' + ICON[m] + '</span><span class="was">' + LABEL[m] + "</span>";
    if (t) html += '<span class="dauer">' + (t === 1 ? "1 Minute" : t + " Minuten") + "</span>";
    if (mat) html += '<span class="mat"><b>Material:</b> ' + mat + "</span>";
    bar.innerHTML = html;
    s.appendChild(bar);
    if (fertig) {
      var f = document.createElement("div");
      f.className = "fertig";
      f.innerHTML = "<b>Fertig?</b> " + fertig;
      s.appendChild(f);
    }
  });

  // ---------- UI ----------
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    document.body.appendChild(e);
    return e;
  }
  var top, progress, counter, timer, help, nav, timeEl, startBtn;
  if (!PREVIEW) {
    top = el("div", "topbar", '<span class="lesson"></span><span class="phase"></span><span class="sp"></span><span class="clock"></span>');
    progress = el("div", "progress");
    counter = el("div", "counter");
    timer = el("div", "timer", '<span class="time">0:00</span><button data-a="start">Start</button><button data-a="reset">Zurück</button>');
    help = el("div", "help",
      "<b>Tasten</b>: <kbd>→</kbd> <kbd>Leertaste</kbd> weiter · <kbd>←</kbd> zurück · " +
      "<kbd>T</kbd> Timer starten/pausieren · <kbd>R</kbd> Timer zurücksetzen · <kbd>F</kbd> Vollbild · " +
      "<kbd>P</kbd> Referentenansicht mit Notizen (eigenes Fenster auf deinem Bildschirm) · <kbd>H</kbd> diese Hilfe.<br>" +
      "Damit die Notizen nicht am Beamer erscheinen: Bildschirm <b>erweitern</b>, nicht duplizieren (Windows: <kbd>Win</kbd>+<kbd>P</kbd>, Mac: Systemeinstellungen, Displays). " +
      "Dieses Fenster auf den Beamer ziehen und mit F auf Vollbild, die Referentenansicht bleibt auf dem Laptop.");
    nav = el("div", "navbtns",
      '<a href="index.html">Übersicht</a><button data-n="-1">◀</button><button data-n="1">▶</button>' +
      '<button data-k="p">Referentenansicht</button><button data-k="f">Vollbild</button><button data-k="h">Hilfe</button>');
    top.querySelector(".lesson").textContent = lesson;
    timeEl = timer.querySelector(".time");
    startBtn = timer.querySelector('[data-a="start"]');
  }

  // ---------- Synchronisation mit der Referentenansicht ----------
  var chan = null;
  if (!PREVIEW) {
    try { chan = new BroadcastChannel("rke-" + deckFile); } catch (e) { chan = null; }
  }
  var lastSent = "";
  function send(force) {
    if (!chan) return;
    var st = { type: "state", i: cur, n: slides.length, left: Math.ceil(tLeft), total: tTotal, run: tRun };
    var j = JSON.stringify(st);
    if (!force && j === lastSent) return;
    lastSent = j;
    try { chan.postMessage(st); } catch (e) {}
  }
  if (chan) {
    chan.onmessage = function (ev) {
      var d = ev.data || {};
      if (d.type !== "cmd") return;
      if (d.cmd === "next") go(1);
      else if (d.cmd === "prev") go(-1);
      else if (d.cmd === "go") show(d.i);
      else if (d.cmd === "timer") toggleTimer();
      else if (d.cmd === "reset") resetTimer();
      else if (d.cmd === "hello") send(true);
    };
  }

  // ---------- Navigation ----------
  function show(i) {
    i = Math.max(0, Math.min(slides.length - 1, i));
    slides[cur].classList.remove("active");
    cur = i;
    var s = slides[cur];
    s.classList.add("active");
    document.body.classList.toggle("on-title", s.classList.contains("title"));
    if (!PREVIEW) {
      top.querySelector(".phase").textContent = s.getAttribute("data-phase") || "";
      counter.textContent = (cur + 1) + " / " + slides.length;
      progress.style.width = ((cur + 1) / slides.length * 100) + "%";
      try { history.replaceState(null, "", location.search + "#" + (cur + 1)); } catch (e) {}
      setupTimer(s);
    }
  }
  function go(d) { show(cur + d); }

  // ---------- Timer ----------
  var tTotal = 0, tLeft = 0, tRun = false, tLast = 0, tRaf = null;
  function fmt(sec) {
    sec = Math.max(0, Math.ceil(sec));
    return Math.floor(sec / 60) + ":" + ("0" + (sec % 60)).slice(-2);
  }
  function paint() {
    if (PREVIEW) return;
    timeEl.textContent = fmt(tLeft);
    timer.classList.toggle("run", tRun);
    timer.classList.toggle("low", tLeft > 0 && tLeft <= Math.min(60, tTotal * 0.2));
    timer.classList.toggle("done", tTotal > 0 && tLeft <= 0);
    startBtn.textContent = tRun ? "Pause" : "Start";
    send(false);
  }
  function tick(now) {
    if (!tRun) return;
    tLeft -= (now - tLast) / 1000; tLast = now;
    if (tLeft <= 0) { tLeft = 0; tRun = false; beep(); }
    paint();
    if (tRun) tRaf = requestAnimationFrame(tick);
  }
  function toggleTimer() {
    if (!tTotal) return;
    if (tLeft <= 0) tLeft = tTotal;
    tRun = !tRun;
    if (tRun) { tLast = performance.now(); tRaf = requestAnimationFrame(tick); }
    paint();
  }
  function resetTimer() { tRun = false; tLeft = tTotal; paint(); }
  function setupTimer(s) {
    var m = parseFloat(s.getAttribute("data-timer") || "0");
    tRun = false; if (tRaf) cancelAnimationFrame(tRaf);
    tTotal = m * 60; tLeft = tTotal;
    timer.classList.toggle("show", m > 0);
    document.body.classList.toggle("has-timer", m > 0);
    paint();
    send(true);
  }
  function beep() {
    try {
      var A = window.AudioContext || window.webkitAudioContext; if (!A) return;
      var ctx = new A();
      [0, 0.35, 0.7].forEach(function (t) {
        var o = ctx.createOscillator(), g = ctx.createGain();
        o.frequency.value = 880; o.connect(g); g.connect(ctx.destination);
        g.gain.setValueAtTime(0.0001, ctx.currentTime + t);
        g.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t + 0.28);
        o.start(ctx.currentTime + t); o.stop(ctx.currentTime + t + 0.3);
      });
    } catch (e) {}
  }

  if (!PREVIEW) {
    startBtn.addEventListener("click", toggleTimer);
    timer.querySelector('[data-a="reset"]').addEventListener("click", resetTimer);
    var clock = function () {
      var d = new Date();
      top.querySelector(".clock").textContent = ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
    };
    clock(); setInterval(clock, 15000);

    var openPresenter = function () {
      try { window.open("referent.html?deck=" + encodeURIComponent(deckFile), "rke-referent", "width=1280,height=800"); } catch (e) {}
    };
    var fullscreen = function () {
      try {
        if (!document.fullscreenElement) document.documentElement.requestFullscreen();
        else document.exitFullscreen();
      } catch (e) {}
    };
    var key = function (k) {
      if (k === "h") help.classList.toggle("show");
      else if (k === "f") fullscreen();
      else if (k === "p") openPresenter();
    };
    nav.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      if (b.dataset.n) go(parseInt(b.dataset.n, 10));
      if (b.dataset.k) key(b.dataset.k);
    });
    document.addEventListener("keydown", function (e) {
      if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
      var k = e.key;
      if (k === "ArrowRight" || k === "PageDown" || k === " ") { e.preventDefault(); go(1); }
      else if (k === "ArrowLeft" || k === "PageUp") { e.preventDefault(); go(-1); }
      else if (k === "Home") show(0);
      else if (k === "End") show(slides.length - 1);
      else if (k === "t" || k === "T") toggleTimer();
      else if (k === "r" || k === "R") resetTimer();
      else if (/^[hHfFpP]$/.test(k)) key(k.toLowerCase());
      else if (k === "Escape") help.classList.remove("show");
    });
    var sx = null;
    document.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
    document.addEventListener("touchend", function (e) {
      if (sx == null) return;
      var dx = e.changedTouches[0].clientX - sx; sx = null;
      if (Math.abs(dx) > 60) go(dx < 0 ? 1 : -1);
    }, { passive: true });
  }

  // ---------- Bilder (Lehrmittel bleibt lokal) ----------
  var DB = null;
  function db() {
    return new Promise(function (res) {
      if (DB) return res(DB);
      try {
        var r = indexedDB.open("rke-einkaufszentrum", 1);
        r.onupgradeneeded = function () { r.result.createObjectStore("bilder"); };
        r.onsuccess = function () { DB = r.result; res(DB); };
        r.onerror = function () { res(null); };
      } catch (e) { res(null); }
    });
  }
  function dbGet(k) {
    return db().then(function (d) {
      if (!d) return null;
      return new Promise(function (res) {
        try {
          var q = d.transaction("bilder").objectStore("bilder").get(k);
          q.onsuccess = function () { res(q.result || null); };
          q.onerror = function () { res(null); };
        } catch (e) { res(null); }
      });
    });
  }
  function dbPut(k, v) {
    return db().then(function (d) {
      if (!d) return;
      try { d.transaction("bilder", "readwrite").objectStore("bilder").put(v, k); } catch (e) {}
    });
  }
  function dbDel(k) {
    return db().then(function (d) {
      if (!d) return;
      try { d.transaction("bilder", "readwrite").objectStore("bilder").delete(k); } catch (e) {}
    });
  }
  function tryFile(src) {
    return new Promise(function (res) {
      var i = new Image();
      i.onload = function () { res(src); };
      i.onerror = function () { res(null); };
      i.src = src;
    });
  }
  function slotFigs(slot) { return document.querySelectorAll('.bild[data-slot="' + slot + '"]'); }
  function setImg(fig, src, removable) {
    fig.classList.remove("leer");
    fig.innerHTML = "";
    var img = document.createElement("img");
    img.src = src; img.alt = fig.getAttribute("data-label") || "";
    fig.appendChild(img);
    if (removable && !PREVIEW) {
      var b = document.createElement("button");
      b.className = "weg"; b.textContent = "Bild entfernen";
      b.addEventListener("click", function (e) {
        e.stopPropagation();
        dbDel(fig.dataset.slot).then(function () { Array.prototype.forEach.call(slotFigs(fig.dataset.slot), empty); });
      });
      fig.appendChild(b);
    }
  }
  function empty(fig) {
    fig.classList.add("leer");
    fig.innerHTML = '<span class="lbl"></span><span>Bilddatei hier hineinziehen oder</span>' +
      '<button type="button">Bild wählen</button><input type="file" accept="image/*" hidden>';
    fig.querySelector(".lbl").textContent = fig.getAttribute("data-label") || "Bild";
    var inp = fig.querySelector("input");
    fig.querySelector("button").addEventListener("click", function () { inp.click(); });
    inp.addEventListener("change", function () { if (inp.files[0]) load(fig, inp.files[0]); });
  }
  function load(fig, file) {
    if (!file || !/^image\//.test(file.type)) return;
    var r = new FileReader();
    r.onload = function () {
      dbPut(fig.dataset.slot, r.result);
      Array.prototype.forEach.call(slotFigs(fig.dataset.slot), function (f) { setImg(f, r.result, true); });
    };
    r.readAsDataURL(file);
  }
  Array.prototype.forEach.call(document.querySelectorAll(".bild[data-slot]"), function (fig) {
    var slot = fig.dataset.slot;
    empty(fig);
    fig.addEventListener("dragover", function (e) { e.preventDefault(); fig.classList.add("drag"); });
    fig.addEventListener("dragleave", function () { fig.classList.remove("drag"); });
    fig.addEventListener("drop", function (e) {
      e.preventDefault(); fig.classList.remove("drag");
      if (e.dataTransfer.files[0]) load(fig, e.dataTransfer.files[0]);
    });
    tryFile("bilder/" + slot + ".jpg")
      .then(function (s) { return s || tryFile("bilder/" + slot + ".png"); })
      .then(function (s) {
        if (s) return setImg(fig, s, false);
        return dbGet(slot).then(function (d) { if (d) setImg(fig, d, true); });
      });
  });

  // ---------- Export als PDF oder PowerPoint ----------
  var LIBS = {
    h2c: "https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js",
    pdf: "https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js",
    ppt: "https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.bundle.js"
  };
  function loadScript(src) {
    return new Promise(function (res, rej) {
      if (document.querySelector('script[src="' + src + '"]')) return res();
      var s = document.createElement("script");
      s.src = src; s.onload = res; s.onerror = function () { rej(new Error("Bibliothek nicht geladen: " + src)); };
      document.head.appendChild(s);
    });
  }
  function frames(n) {
    return new Promise(function (res) {
      (function f(k) { if (k <= 0) return res(); requestAnimationFrame(function () { f(k - 1); }); })(n);
    });
  }
  function plainNotes(s) {
    var n = s.querySelector(".notes");
    if (!n) return "";
    var d = document.createElement("div");
    d.innerHTML = n.innerHTML.replace(/<br\s*\/?>/gi, "\n");
    var parts = [];
    var ph = s.getAttribute("data-phase"); if (ph) parts.push(ph);
    parts.push(d.textContent.trim());
    return parts.join("\n");
  }
  var exporting = false;
  function exportDeck(kind) {
    if (exporting || PREVIEW) return;
    exporting = true;
    var box = el("div", "exportbox", "Export wird vorbereitet ...");
    var back = cur;
    var W = 1600, H = 900;
    var need = [loadScript(LIBS.h2c), loadScript(kind === "pdf" ? LIBS.pdf : LIBS.ppt)];
    var shots = [];
    var fonts = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
    Promise.all(need).then(function () { return fonts; }).then(function () {
      document.body.classList.add("exporting");
      var chain = Promise.resolve();
      slides.forEach(function (s, i) {
        chain = chain.then(function () {
          box.textContent = "Folie " + (i + 1) + " von " + slides.length + " ...";
          show(i);
          return frames(3);
        }).then(function () {
          return window.html2canvas(document.querySelector(".deck"), {
            width: window.innerWidth, height: window.innerHeight,
            scale: W / window.innerWidth, backgroundColor: getComputedStyle(document.body).backgroundColor,
            useCORS: true, logging: false
          });
        }).then(function (c) { shots.push({ img: c.toDataURL("image/jpeg", 0.9), notes: plainNotes(s) }); });
      });
      return chain;
    }).then(function () {
      var name = deckFile.replace(/\.html$/, "");
      box.textContent = "Datei wird erstellt ...";
      if (kind === "pdf") {
        var J = window.jspdf.jsPDF;
        var doc = new J({ orientation: "landscape", unit: "px", format: [W, H], hotfixes: ["px_scaling"] });
        shots.forEach(function (sh, i) { if (i) doc.addPage([W, H], "landscape"); doc.addImage(sh.img, "JPEG", 0, 0, W, H); });
        doc.save("Ethik_Einkaufszentrum_" + name + ".pdf");
      } else {
        var p = new window.PptxGenJS();
        p.layout = "LAYOUT_16x9";
        p.title = lesson;
        shots.forEach(function (sh) {
          var sl = p.addSlide();
          sl.addImage({ data: sh.img.replace(/^data:/, ""), x: 0, y: 0, w: 10, h: 5.625 });
          if (sh.notes) sl.addNotes(sh.notes);
        });
        return p.writeFile({ fileName: "Ethik_Einkaufszentrum_" + name + ".pptx" });
      }
    }).catch(function (e) {
      alert("Export nicht möglich: " + (e && e.message ? e.message : e) + "\nInternetverbindung prüfen.");
    }).then(function () {
      document.body.classList.remove("exporting");
      box.remove();
      show(back);
      exporting = false;
    });
  }
  if (!PREVIEW) {
    var ex = document.createElement("span");
    ex.innerHTML = '<button data-x="pdf">PDF</button><button data-x="pptx">PowerPoint</button>';
    nav.appendChild(ex);
    ex.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (b) exportDeck(b.dataset.x);
    });
    if (chan) {
      chan.addEventListener("message", function (ev) {
        var d = ev.data || {};
        if (d.type === "cmd" && d.cmd === "export") exportDeck(d.kind);
      });
    }
  }

  // ---------- Start ----------
  function fromHash() {
    var n = parseInt((location.hash || "").replace("#", ""), 10);
    return isNaN(n) ? 0 : n - 1;
  }
  slides[0].classList.add("active");
  show(fromHash());
  window.addEventListener("hashchange", function () {
    var n = fromHash();
    if (n !== cur) show(n);
  });
})();
