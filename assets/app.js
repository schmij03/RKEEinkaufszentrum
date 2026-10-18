/* Präsentation Ethik: Schauplatz Einkaufszentrum
   Tasten: Pfeile/Leertaste blättern, T Timer start/pause, R Timer zurück,
   N Notizen, F Vollbild, H Hilfe, Pos1/Ende erste/letzte Folie. */
(function () {
  "use strict";
  var slides = Array.prototype.slice.call(document.querySelectorAll(".slide"));
  if (!slides.length) return;
  var lesson = document.body.getAttribute("data-lesson") || "";
  var cur = 0;

  // ---------- UI aufbauen ----------
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    document.body.appendChild(e);
    return e;
  }
  var top = el("div", "topbar", '<span class="lesson"></span><span class="phase"></span><span class="sp"></span><span class="clock"></span>');
  var progress = el("div", "progress");
  var counter = el("div", "counter");
  var timer = el("div", "timer", '<span class="time">0:00</span><button data-a="start">Start</button><button data-a="reset">Zurück</button>');
  var notes = el("div", "notespanel");
  var help = el("div", "help",
    "<b>Tasten</b>: <kbd>→</kbd> <kbd>Leertaste</kbd> weiter · <kbd>←</kbd> zurück · " +
    "<kbd>T</kbd> Timer starten/pausieren · <kbd>R</kbd> Timer zurücksetzen · " +
    "<kbd>N</kbd> Notizen für die LP · <kbd>F</kbd> Vollbild · <kbd>H</kbd> diese Hilfe. " +
    "Bilder: auf das leere Feld klicken oder eine Bilddatei hineinziehen. Sie bleiben in diesem Browser gespeichert.");
  var nav = el("div", "navbtns",
    '<a href="index.html">Übersicht</a><button data-n="-1">◀</button><button data-n="1">▶</button>' +
    '<button data-k="n">Notizen</button><button data-k="f">Vollbild</button><button data-k="h">Hilfe</button>');
  top.querySelector(".lesson").textContent = lesson;

  // ---------- Navigation ----------
  function show(i) {
    i = Math.max(0, Math.min(slides.length - 1, i));
    slides[cur].classList.remove("active");
    cur = i;
    var s = slides[cur];
    s.classList.add("active");
    document.body.classList.toggle("on-title", s.classList.contains("title"));
    top.querySelector(".phase").textContent = s.getAttribute("data-phase") || "";
    counter.textContent = (cur + 1) + " / " + slides.length;
    progress.style.width = ((cur + 1) / slides.length * 100) + "%";
    var n = s.querySelector(".notes");
    notes.innerHTML = n ? n.innerHTML : "<i>Keine Notizen zu dieser Folie.</i>";
    try { history.replaceState(null, "", "#" + (cur + 1)); } catch (e) {}
    setupTimer(s);
  }
  function go(d) { show(cur + d); }

  // ---------- Timer ----------
  var tTotal = 0, tLeft = 0, tRun = false, tLast = 0, tRaf = null;
  var timeEl = timer.querySelector(".time");
  var startBtn = timer.querySelector('[data-a="start"]');
  function fmt(sec) {
    sec = Math.max(0, Math.ceil(sec));
    return Math.floor(sec / 60) + ":" + ("0" + (sec % 60)).slice(-2);
  }
  function paint() {
    timeEl.textContent = fmt(tLeft);
    timer.classList.toggle("run", tRun);
    timer.classList.toggle("low", tLeft > 0 && tLeft <= Math.min(60, tTotal * 0.2));
    timer.classList.toggle("done", tTotal > 0 && tLeft <= 0);
    startBtn.textContent = tRun ? "Pause" : "Start";
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
  startBtn.addEventListener("click", toggleTimer);
  timer.querySelector('[data-a="reset"]').addEventListener("click", resetTimer);

  // ---------- Uhr ----------
  function clock() {
    var d = new Date();
    top.querySelector(".clock").textContent = ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
  }
  clock(); setInterval(clock, 15000);

  // ---------- Vollbild, Notizen, Hilfe ----------
  function fullscreen() {
    try {
      if (!document.fullscreenElement) document.documentElement.requestFullscreen();
      else document.exitFullscreen();
    } catch (e) {}
  }
  function key(k) {
    if (k === "n") notes.classList.toggle("show");
    else if (k === "h") help.classList.toggle("show");
    else if (k === "f") fullscreen();
  }
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
    else if (/^[nNhHfF]$/.test(k)) key(k.toLowerCase());
    else if (k === "Escape") { notes.classList.remove("show"); help.classList.remove("show"); }
  });
  // Wischen auf Tablets
  var sx = null;
  document.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
  document.addEventListener("touchend", function (e) {
    if (sx == null) return;
    var dx = e.changedTouches[0].clientX - sx; sx = null;
    if (Math.abs(dx) > 60) go(dx < 0 ? 1 : -1);
  }, { passive: true });

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
  function setImg(fig, src, removable) {
    fig.classList.remove("leer");
    fig.innerHTML = "";
    var img = document.createElement("img");
    img.src = src; img.alt = fig.getAttribute("data-label") || "";
    fig.appendChild(img);
    if (removable) {
      var b = document.createElement("button");
      b.className = "weg"; b.textContent = "Bild entfernen";
      b.addEventListener("click", function (e) {
        e.stopPropagation();
        dbDel(fig.dataset.slot).then(function () {
          Array.prototype.forEach.call(document.querySelectorAll('.bild[data-slot="' + fig.dataset.slot + '"]'), empty);
        });
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
      Array.prototype.forEach.call(document.querySelectorAll('.bild[data-slot="' + fig.dataset.slot + '"]'), function (f) {
        setImg(f, r.result, true);
      });
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
    // 1. Datei im Ordner bilder/ (nur wenn du sie selbst hochlädst), 2. gespeichertes Bild im Browser
    tryFile("bilder/" + slot + ".jpg")
      .then(function (s) { return s || tryFile("bilder/" + slot + ".png"); })
      .then(function (s) {
        if (s) return setImg(fig, s, false);
        return dbGet(slot).then(function (d) { if (d) setImg(fig, d, true); });
      });
  });

  // ---------- Start ----------
  var h = parseInt((location.hash || "").replace("#", ""), 10);
  slides[0].classList.add("active");
  show(isNaN(h) ? 0 : h - 1);
  window.addEventListener("hashchange", function () {
    var n = parseInt((location.hash || "").replace("#", ""), 10);
    if (!isNaN(n) && n - 1 !== cur) show(n - 1);
  });
})();
