/* ===== Mobile menu ===== */
(function () {
  var btn = document.querySelector(".menu-btn");
  var list = document.querySelector(".nav ul");
  if (!btn || !list) return;
  btn.addEventListener("click", function () {
    var open = list.classList.toggle("open");
    btn.setAttribute("aria-expanded", open);
  });
})();

/* ===== Animated particle background ===== */
(function () {
  var c = document.getElementById("bg-canvas");
  if (!c || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var ctx = c.getContext("2d"), w, h, pts = [], mouse = { x: -999, y: -999 };
  function resize() {
    w = c.width = window.innerWidth; h = c.height = window.innerHeight;
    var n = Math.min(90, Math.floor((w * h) / 18000));
    pts = [];
    for (var i = 0; i < n; i++) pts.push({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5, r: Math.random() * 2 + 1
    });
  }
  window.addEventListener("resize", resize);
  window.addEventListener("mousemove", function (e) { mouse.x = e.clientX; mouse.y = e.clientY; });
  function frame() {
    ctx.clearRect(0, 0, w, h);
    for (var i = 0; i < pts.length; i++) {
      var p = pts[i];
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283);
      ctx.fillStyle = "rgba(34,211,238,0.8)"; ctx.fill();
      for (var j = i + 1; j < pts.length; j++) {
        var q = pts[j], dx = p.x - q.x, dy = p.y - q.y, d = dx * dx + dy * dy;
        if (d < 14000) {
          ctx.strokeStyle = "rgba(124,92,255," + (1 - d / 14000) * 0.45 + ")";
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
        }
      }
      var mx = p.x - mouse.x, my = p.y - mouse.y;
      if (mx * mx + my * my < 20000) {
        ctx.strokeStyle = "rgba(255,107,181,0.6)";
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
      }
    }
    requestAnimationFrame(frame);
  }
  resize(); frame();
})();

/* ===== Typewriter ===== */
(function () {
  var el = document.getElementById("typewriter");
  if (!el) return;
  var words = ["a Multimedia Student", "a Web Developer in the making", "a Creative Problem Solver", "a Lifelong Learner"];
  var wi = 0, ci = 0, del = false;
  function tick() {
    var word = words[wi];
    el.textContent = word.substring(0, ci);
    if (!del && ci === word.length) { del = true; return setTimeout(tick, 1400); }
    if (del && ci === 0) { del = false; wi = (wi + 1) % words.length; }
    ci += del ? -1 : 1;
    setTimeout(tick, del ? 45 : 85);
  }
  tick();
})();

/* ===== Scroll reveal, skill bars, counters ===== */
(function () {
  var items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    items.forEach(function (i) { i.classList.add("show"); });
    document.querySelectorAll(".bar > i").forEach(function (b) { b.style.width = b.dataset.level + "%"; });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add("show");
      e.target.querySelectorAll(".bar > i").forEach(function (b) { b.style.width = b.dataset.level + "%"; });
      e.target.querySelectorAll("[data-count]").forEach(countUp);
      io.unobserve(e.target);
    });
  }, { threshold: 0.15 });
  items.forEach(function (i) { io.observe(i); });
  function countUp(el) {
    var target = +el.dataset.count, cur = 0, step = Math.max(1, Math.ceil(target / 50));
    var t = setInterval(function () {
      cur += step;
      if (cur >= target) { cur = target; clearInterval(t); }
      el.textContent = cur + (el.dataset.suffix || "");
    }, 30);
  }
})();

/* ===== Portfolio filter ===== */
(function () {
  var buttons = document.querySelectorAll(".filters button");
  if (!buttons.length) return;
  buttons.forEach(function (b) {
    b.addEventListener("click", function () {
      buttons.forEach(function (x) { x.classList.remove("on"); x.setAttribute("aria-pressed", "false"); });
      b.classList.add("on"); b.setAttribute("aria-pressed", "true");
      var f = b.dataset.filter;
      document.querySelectorAll(".project, .folder").forEach(function (p) {
        p.classList.toggle("hide", f !== "all" && p.dataset.cat !== f);
      });
    });
  });
})();

/* ===== Highlight today's column in timetable ===== */
(function () {
  var t = document.querySelector(".timetable");
  if (!t) return;
  var day = new Date().getDay(); // 1..5 = Mon..Fri
  if (day < 1 || day > 5) return;
  t.querySelectorAll('[data-day="' + day + '"]').forEach(function (c) {
    c.style.boxShadow = "inset 0 0 0 2px rgba(255,209,102,.8)";
  });
  var cap = document.getElementById("today-note");
  if (cap) cap.textContent = "Today's column is outlined in gold.";
})();

/* ===== Feedback form + saved comments (localStorage) ===== */
(function () {
  var form = document.getElementById("comment-form");
  if (!form) return;
  var list = document.getElementById("comment-list");
  var msg = document.getElementById("form-msg");
  var KEY = "personal-site-comments";

  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } }
  function save(arr) { try { localStorage.setItem(KEY, JSON.stringify(arr)); } catch (e) {} }
  function esc(s) { var d = document.createElement("div"); d.textContent = s; return d.innerHTML; }

  function render() {
    var arr = load();
    if (!arr.length) { list.innerHTML = '<p class="lead">No comments yet. Be the first to leave one!</p>'; return; }
    list.innerHTML = arr.slice().reverse().map(function (c) {
      return '<article class="card comment"><div class="who"><span>' + esc(c.name) + " " +
        "&#9733;".repeat(c.rating || 0) + '</span><span class="meta">' + esc(c.topic) + " &middot; " + esc(c.date) +
        "</span></div><p>" + esc(c.text) + "</p></article>";
    }).join("");
  }

  function setErr(id, text) { document.getElementById(id).textContent = text; return !text; }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = form.elements.name.value.trim();
    var email = form.elements.email.value.trim();
    var topic = form.elements.topic.value;
    var text = form.elements.message.value.trim();
    var rating = (form.querySelector("input[name=rating]:checked") || {}).value || 0;
    var ok = true;
    ok = setErr("err-name", name.length < 2 ? "Please enter your name." : "") && ok;
    ok = setErr("err-email", /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "" : "Please enter a valid email.") && ok;
    ok = setErr("err-message", text.length < 5 ? "Please write a short comment." : "") && ok;
    if (!ok) { msg.className = "form-msg"; msg.textContent = ""; return; }

    var arr = load();
    arr.push({ name: name, topic: topic, text: text, rating: +rating, date: new Date().toLocaleDateString() });
    save(arr);
    form.reset();
    msg.className = "form-msg ok";
    msg.textContent = "Thank you, " + name + "! Your comment has been posted below.";
    render();
  });

  document.getElementById("clear-comments").addEventListener("click", function () {
    save([]); render();
  });
  render();
})();

/* ===== Footer year ===== */
(function () {
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();

/* ===== Portfolio pop-up galleries + image preview ===== */
(function () {
  var tiles = document.querySelectorAll("[data-open]");
  if (!tiles.length) return;
  var lastTile = null, current = [], idx = 0;

  var lb = document.createElement("div");
  lb.className = "lightbox";
  lb.setAttribute("role", "dialog");
  lb.setAttribute("aria-label", "Image preview");
  lb.innerHTML = '<button class="lb-btn lb-close" aria-label="Close preview">&times;</button>' +
    '<button class="lb-btn lb-prev" aria-label="Previous image">&#8249;</button>' +
    '<img alt=""><p></p>' +
    '<button class="lb-btn lb-next" aria-label="Next image">&#8250;</button>';
  document.body.appendChild(lb);
  var lbImg = lb.querySelector("img"), lbCap = lb.querySelector("p");

  function showLb(i) {
    idx = (i + current.length) % current.length;
    lbImg.src = current[idx].src;
    lbImg.alt = current[idx].alt;
    lbCap.textContent = current[idx].alt + "  (" + (idx + 1) + "/" + current.length + ")";
  }
  function closeLb() { lb.classList.remove("open"); }
  lb.querySelector(".lb-close").onclick = closeLb;
  lb.querySelector(".lb-prev").onclick = function (e) { e.stopPropagation(); showLb(idx - 1); };
  lb.querySelector(".lb-next").onclick = function (e) { e.stopPropagation(); showLb(idx + 1); };
  lb.addEventListener("click", function (e) { if (e.target === lb) closeLb(); });

  function openModal(id, tile) {
    var m = document.getElementById("modal-" + id);
    if (!m) return;
    lastTile = tile;
    m.classList.add("open");
    document.body.classList.add("no-scroll");
    m.querySelector(".modal-close").focus();
  }
  function closeModals() {
    document.querySelectorAll(".modal.open").forEach(function (m) {
      m.querySelectorAll("video").forEach(function (v) { v.pause(); });
      m.classList.remove("open");
    });
    document.body.classList.remove("no-scroll");
    if (lastTile) lastTile.focus();
  }

  tiles.forEach(function (t) {
    t.addEventListener("click", function () { openModal(t.dataset.open, t); });
    t.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openModal(t.dataset.open, t); }
    });
  });

  document.querySelectorAll(".modal").forEach(function (m) {
    m.addEventListener("click", function (e) { if (e.target === m) closeModals(); });
    m.querySelector(".modal-close").addEventListener("click", closeModals);
    m.querySelectorAll(".gallery img").forEach(function (img) {
      img.addEventListener("click", function () {
        current = Array.prototype.slice.call(m.querySelectorAll(".gallery img"));
        showLb(current.indexOf(img));
        lb.classList.add("open");
      });
    });
  });

  document.addEventListener("keydown", function (e) {
    if (lb.classList.contains("open")) {
      if (e.key === "Escape") closeLb();
      if (e.key === "ArrowLeft") showLb(idx - 1);
      if (e.key === "ArrowRight") showLb(idx + 1);
    } else if (e.key === "Escape") closeModals();
  });
})();