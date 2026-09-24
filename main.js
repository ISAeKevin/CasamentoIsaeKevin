(function () {
  "use strict";
  var C = window.SITE_CONFIG;
  var $ = function (s, r) { return (r || document).querySelector(s); };

  /* ---------- Contagem regressiva ---------- */
  var alvo = new Date(C.dataCasamento).getTime();
  var cd = $("#contagem");
  function plural(n, um, varios) { return n === 1 ? um : varios; }
  function tick() {
    var diff = alvo - Date.now();
    if (diff <= 0) {
      cd.innerHTML = '<p class="contagem-fim">É hoje! Nos vemos às 10h.</p>';
      return false;
    }
    var d = Math.floor(diff / 864e5),
        h = Math.floor(diff / 36e5) % 24,
        m = Math.floor(diff / 6e4) % 60;
    $("#cd-dias").textContent = d;
    $("#cd-dias-l").textContent = plural(d, "dia", "dias");
    $("#cd-horas").textContent = h;
    $("#cd-horas-l").textContent = plural(h, "hora", "horas");
    $("#cd-min").textContent = m;
    $("#cd-min-l").textContent = plural(m, "minuto", "minutos");
    return true;
  }
  if (cd && tick()) setInterval(tick, 30000);

  /* ---------- Local ---------- */
  var L = C.local || {};
  var linkMapa = "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent(L.endereco || L.nome || "Local do casamento") +
    (L.googlePlaceId ? "&query_place_id=" + L.googlePlaceId : "");
  var btnMapa = $("#link-mapa");
  if (btnMapa) btnMapa.href = linkMapa;
  if (L.nome) { $("#local-nome").textContent = L.nome; $("#local-nome").hidden = false; }
  if (L.endereco) {
    $("#local-endereco").textContent = L.endereco;
    $("#local-endereco").hidden = false;
    var f = document.createElement("iframe");
    f.src = "https://maps.google.com/maps?q=" + encodeURIComponent(L.endereco) + "&z=15&output=embed";
    f.title = "Mapa do local da cerimônia";
    f.loading = "lazy";
    f.referrerPolicy = "no-referrer-when-downgrade";
    $("#mapa").appendChild(f);
    $("#mapa").hidden = false;
  }

  /* ---------- Confirmação de presença ---------- */
  var form = $("#form-rsvp");
  if (form) {
    var vaiInputs = form.querySelectorAll('input[name="vai"]');
    var blocoQtd = $("#bloco-qtd");
    vaiInputs.forEach(function (i) {
      i.addEventListener("change", function () {
        blocoQtd.hidden = form.vai.value !== "sim";
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var status = $("#rsvp-status");
      status.className = "rsvp-status";
      if (form.site.value) return; // armadilha anti-robô
      if (!form.nome.value.trim()) { erro("Preencha seu nome completo."); form.nome.focus(); return; }
      if (!form.vai.value) { erro("Conte pra gente se você vai ao casamento."); return; }
      if (!C.rsvpEndpoint) {
        erro("A confirmação ainda não está ligada à planilha. Configure rsvpEndpoint em js/config.js.");
        return;
      }
      var dados = new URLSearchParams(new FormData(form));
      if (form.vai.value !== "sim") { dados.set("adultos", "0"); dados.set("criancas", "0"); }
      var btn = form.querySelector("button[type=submit]");
      btn.disabled = true; btn.textContent = "Enviando…";
      fetch(C.rsvpEndpoint, { method: "POST", mode: "no-cors", body: dados })
        .then(function () {
          var nome = form.nome.value.trim().split(" ")[0];
          form.hidden = true;
          status.className = "rsvp-status ok";
          status.textContent = form.vai.value === "sim"
            ? "Presença confirmada, " + nome + ". Até dia 11 de abril!"
            : "Resposta registrada, " + nome + ". Obrigado por avisar, vamos sentir sua falta.";
        })
        .catch(function () {
          erro("Não conseguimos enviar agora. Verifique sua conexão e tente de novo.");
          btn.disabled = false; btn.textContent = "Enviar confirmação";
        });
      function erro(msg) { status.className = "rsvp-status erro"; status.textContent = msg; }
    });
  }

  /* ---------- Pix (BR Code estático) ---------- */
  function limpa(s, max) {
    return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^A-Za-z0-9 ]/g, "").toUpperCase().slice(0, max);
  }
  function campo(id, valor) {
    var len = String(valor.length).padStart(2, "0");
    return id + len + valor;
  }
  function crc16(str) {
    var crc = 0xffff;
    for (var i = 0; i < str.length; i++) {
      crc ^= str.charCodeAt(i) << 8;
      for (var j = 0; j < 8; j++) {
        crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
        crc &= 0xffff;
      }
    }
    return crc.toString(16).toUpperCase().padStart(4, "0");
  }
  function pixPayload(valor) {
    var p = C.pix;
    var conta = campo("00", "BR.GOV.BCB.PIX") + campo("01", p.chave);
    var s = campo("00", "01") +
      campo("26", conta) +
      campo("52", "0000") +
      campo("53", "986") +
      (valor ? campo("54", valor.toFixed(2)) : "") +
      campo("58", "BR") +
      campo("59", limpa(p.nomeRecebedor, 25)) +
      campo("60", limpa(p.cidade, 15)) +
      campo("62", campo("05", "***")) +
      "6304";
    return s + crc16(s);
  }
  window.__pixPayload = pixPayload; // útil para testes no console

  var brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

  /* ---------- Lista de presentes ---------- */
  var lista = $("#lista-presentes");
  if (lista) {
    C.presentes.forEach(function (p) {
      var li = document.createElement("li");
      li.innerHTML =
        '<span class="p-nome"></span><span class="p-pontos" aria-hidden="true"></span>' +
        '<span class="p-valor"></span><button type="button" class="p-btn">Presentear</button>';
      li.querySelector(".p-nome").textContent = p.nome;
      li.querySelector(".p-valor").textContent = brl.format(p.valor);
      li.querySelector(".p-btn").setAttribute("aria-label", "Presentear: " + p.nome);
      li.querySelector(".p-btn").addEventListener("click", function () { abrirPix(p.nome, p.valor); });
      lista.appendChild(li);
    });
  }
  var btnLivre = $("#btn-valor-livre");
  if (btnLivre) btnLivre.addEventListener("click", function () { abrirPix(null, null); });

  $("#chave-pix-texto") && ($("#chave-pix-texto").textContent = C.pix.chave);
  document.querySelectorAll("[data-copiar-chave]").forEach(function (b) {
    b.addEventListener("click", function () { copiar(C.pix.chave, b); });
  });

  /* ---------- Modal Pix ---------- */
  var dlg = $("#dlg-pix");
  function abrirPix(nome, valor) {
    $("#pix-titulo").textContent = nome || "Presente com valor livre";
    $("#pix-valor").textContent = valor ? brl.format(valor) : "Você escolhe o valor no app do banco";
    $("#pix-dica").hidden = !nome;
    $("#pix-dica-nome").textContent = nome || "";
    var codigo = pixPayload(valor);
    $("#pix-copiacola").value = codigo;
    var qr = $("#pix-qr");
    qr.innerHTML = "";
    if (window.QRCode) {
      new window.QRCode(qr, { text: codigo, width: 200, height: 200, colorDark: "#26372E", colorLight: "#ffffff", correctLevel: window.QRCode.CorrectLevel.M });
    } else {
      qr.innerHTML = '<p class="qr-falha">Use o código copia e cola abaixo.</p>';
    }
    if (typeof dlg.showModal === "function") dlg.showModal(); else dlg.setAttribute("open", "");
  }
  if (dlg) {
    $("#pix-fechar").addEventListener("click", function () { dlg.close(); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
    $("#btn-copiacola").addEventListener("click", function (e) {
      copiar($("#pix-copiacola").value, e.currentTarget);
    });
  }

  function copiar(texto, botao) {
    var original = botao.textContent;
    var ok = function () {
      botao.textContent = "Copiado";
      setTimeout(function () { botao.textContent = original; }, 2000);
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(texto).then(ok, fallback);
    } else fallback();
    function fallback() {
      var t = document.createElement("textarea");
      t.value = texto; t.style.position = "fixed"; t.style.opacity = "0";
      document.body.appendChild(t); t.select();
      try { document.execCommand("copy"); ok(); } catch (e) {}
      document.body.removeChild(t);
    }
  }

  /* ---------- Navegação: marca a seção atual ---------- */
  var links = document.querySelectorAll(".nav a[href^='#']");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          links.forEach(function (a) {
            if (a.getAttribute("href") === "#" + en.target.id) a.setAttribute("aria-current", "true");
            else a.removeAttribute("aria-current");
          });
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    document.querySelectorAll("main > section[id]").forEach(function (s) { io.observe(s); });
  }
})();
