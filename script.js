/* ============================================================
   4 BARRES — Interaccions en JS vanilla (sense llibreries)
   0. Porta d'accés amb contrasenya (sessió del navegador)
   1. Menú hamburguesa en mòbil
   2. Revelat en fer scroll (IntersectionObserver)
   3. Parallax lleu al hero (amb respecte a prefers-reduced-motion)
   4. Capçalera més fosca en fer scroll
   5. Formulari de newsletter (acció placeholder)
   6. Visor de miniatures (lightbox gairebé a pantalla completa)
   ============================================================ */

(function () {
  "use strict";

  var redueixMoviment = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 0. Porta d'accés amb contrasenya ----------
     Pantalla de contrasenya a totes les pàgines. Quan s'encerta,
     es recorda durant la sessió del navegador (sessionStorage).
     Nota: és una barrera visual (la web és estàtica); els fitxers
     segueixen sent accessibles si se'n coneix l'adreça directa. */
  (function portaAcces() {
    var CLAU = "cifo123";
    var CLAU_EMMAGATZEMATGE = "4b_acces";

    if (sessionStorage.getItem(CLAU_EMMAGATZEMATGE) === "ok") {
      return;
    }

    var porta = document.createElement("div");
    porta.className = "porta";
    porta.setAttribute("role", "dialog");
    porta.setAttribute("aria-modal", "true");
    porta.setAttribute("aria-label", "Accés restringit a la web de 4 Barres");
    porta.innerHTML =
      '<div class="porta__targeta">' +
      '<p class="porta__marca">4 Barres</p>' +
      '<h2 class="porta__titol">Accés restringit</h2>' +
      '<p class="porta__text">Aquesta web encara no és pública. Introdueix la contrasenya per entrar.</p>' +
      '<form class="porta__formulari" novalidate>' +
      '<label class="sr-only" for="portaContrasenya">Contrasenya</label>' +
      '<input class="porta__camp" id="portaContrasenya" type="password" name="contrasenya" placeholder="Contrasenya" autocomplete="current-password" required>' +
      '<button class="btn btn--vermell porta__boto" type="submit">Entra</button>' +
      '</form>' +
      '<p class="porta__error" role="alert" hidden>Contrasenya incorrecta. Torna-ho a provar.</p>' +
      '</div>';
    document.body.appendChild(porta);
    document.body.style.overflow = "hidden";

    var formulari = porta.querySelector(".porta__formulari");
    var camp = porta.querySelector(".porta__camp");
    var error = porta.querySelector(".porta__error");

    formulari.addEventListener("submit", function (event) {
      event.preventDefault();
      if (camp.value === CLAU) {
        sessionStorage.setItem(CLAU_EMMAGATZEMATGE, "ok");
        porta.remove();
        document.body.style.overflow = "";
      } else {
        error.hidden = false;
        camp.select();
      }
    });

    camp.focus();
  })();

  /* ---------- 1. Menú hamburguesa ---------- */
  var hamburguesa = document.getElementById("hamburguesa");
  var menu = document.getElementById("menu");

  function tancaMenu() {
    hamburguesa.setAttribute("aria-expanded", "false");
    hamburguesa.setAttribute("aria-label", "Obrir el menú");
    menu.classList.remove("nav__llista--obert");
  }

  hamburguesa.addEventListener("click", function () {
    var obert = hamburguesa.getAttribute("aria-expanded") === "true";
    if (obert) {
      tancaMenu();
    } else {
      hamburguesa.setAttribute("aria-expanded", "true");
      hamburguesa.setAttribute("aria-label", "Tancar el menú");
      menu.classList.add("nav__llista--obert");
    }
  });

  // Tanquem el menú en fer clic a qualsevol enllaç o amb la tecla Escape
  menu.addEventListener("click", function (event) {
    if (event.target.tagName === "A") {
      tancaMenu();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      tancaMenu();
    }
  });

  /* ---------- 2. Revelat en fer scroll ---------- */
  var elementsRevelar = document.querySelectorAll(".revelar");
  var algunRevelat = false;

  function revelaTot() {
    elementsRevelar.forEach(function (el) {
      el.classList.add("revelat");
    });
    if (observador) {
      observador.disconnect();
    }
  }

  if ("IntersectionObserver" in window && !redueixMoviment) {
    var observador = new IntersectionObserver(
      function (entrades) {
        entrades.forEach(function (entrada) {
          if (entrada.isIntersecting) {
            algunRevelat = true;
            entrada.target.classList.add("revelat");
            observador.unobserve(entrada.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -5% 0px" }
    );

    elementsRevelar.forEach(function (el) {
      observador.observe(el);
    });

    // Trencacircuits: si l'observer no ha revelat res en 2 segons
    // (alguns navegadors mòbils no lliuren el callback inicial), ho
    // revelem tot perquè la pàgina mai no pugui quedar en blanc
    setTimeout(function () {
      if (!algunRevelat) {
        revelaTot();
      }
    }, 2000);
  } else {
    // Fallback: tot visible de cop
    revelaTot();
  }

  /* ---------- 3. Parallax lleu al hero ---------- */
  var heroImg = document.getElementById("heroImg");
  var hero = document.getElementById("inici");
  var ficant = false;
  // En mòbil el hero és apilat (foto sencera a dalt): el parallax
  // només té sentit en pantalla àmplia
  var esMobil = window.matchMedia("(max-width: 51.99rem)");

  function actualitzaParallax() {
    ficant = false;
    // A les subpàgines no hi ha hero: res a fer
    if (!heroImg || !hero) {
      return;
    }
    if (esMobil.matches) {
      heroImg.style.transform = "";
      return;
    }
    var desplacament = window.scrollY;
    var alcadaHero = hero.offsetHeight;
    // Trasllat pur (sense escalat): el marge extra del fons és sota
    // (14% a style.css), suficient per absorbir el moviment sense
    // destapar mai la part superior de la imatge
    if (desplacament < alcadaHero) {
      heroImg.style.transform = "translateY(" + desplacament * 0.12 + "px)";
    }
  }

  if (!redueixMoviment && heroImg && hero) {
    window.addEventListener(
      "scroll",
      function () {
        if (!ficant) {
          ficant = true;
          window.requestAnimationFrame(actualitzaParallax);
        }
      },
      { passive: true }
    );
  }

  /* ---------- 4. Capçalera més fosca en fer scroll ---------- */
  var capcalera = document.querySelector(".capcalera");

  window.addEventListener(
    "scroll",
    function () {
      if (window.scrollY > 40) {
        capcalera.classList.add("capcalera--fosca");
      } else {
        capcalera.classList.remove("capcalera--fosca");
      }
    },
    { passive: true }
  );

  /* ---------- 5. Formulari de newsletter (placeholder) ---------- */
  // NOTA: aquest formulari és una acció placeholder. Per a producció,
  // connecta l'atribut action a un endpoint (Mailchimp, ConvertKit,
  // una serverless function de Vercel, etc.) i elimina aquest gestor.
  var form = document.getElementById("formNewsletter");
  var missatgeOk = document.getElementById("formOk");

  // A les subpàgines no hi ha formulari de newsletter
  if (form && missatgeOk) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var email = document.getElementById("email");
      if (!email.value || !email.checkValidity()) {
        email.focus();
        email.setAttribute("aria-invalid", "true");
        return;
      }
      email.removeAttribute("aria-invalid");
      form.hidden = true;
      missatgeOk.hidden = false;
    });
  }

  /* ---------- 7. Visor de miniatures (lightbox gairebé a pantalla completa) ---------- */
  var ampliables = Array.prototype.slice.call(document.querySelectorAll(".capitol__amplia"));
  var llum = document.getElementById("llum");
  var llumImg = document.getElementById("llumImg");
  var llumTitol = document.getElementById("llumTitol");
  var llumTanca = document.getElementById("llumTanca");
  var llumPrev = document.getElementById("llumPrev");
  var llumNext = document.getElementById("llumNext");
  var indexLlum = 0;
  var darrerFocus = null;

  function mostraLlum(i) {
    var enllac = ampliables[i];
    var imatge = enllac.querySelector("img");
    // Carreguem el WebP (més lleuger) dins el visor; el PNG queda per al no-JS
    llumImg.src = enllac.getAttribute("href").replace(/\.png$/, ".webp");
    llumImg.alt = imatge ? imatge.alt : "";
    llumTitol.textContent = enllac.getAttribute("data-titol");
    indexLlum = i;
  }

  function obreLlum(i) {
    darrerFocus = document.activeElement;
    mostraLlum(i);
    llum.hidden = false;
    document.body.classList.add("llum-obert");
    llumTanca.focus();
  }

  function tancaLlum() {
    llum.hidden = true;
    document.body.classList.remove("llum-obert");
    if (darrerFocus && darrerFocus.focus) {
      darrerFocus.focus();
    }
  }

  function mouLlum(desplacament) {
    mostraLlum((indexLlum + desplacament + ampliables.length) % ampliables.length);
  }

  if (llum && ampliables.length > 0) {
    ampliables.forEach(function (enllac, i) {
      enllac.addEventListener("click", function (event) {
        event.preventDefault();
        obreLlum(i);
      });
    });

    llumTanca.addEventListener("click", tancaLlum);
    llum.querySelector("[data-tanca]").addEventListener("click", tancaLlum);
    llumPrev.addEventListener("click", function () { mouLlum(-1); });
    llumNext.addEventListener("click", function () { mouLlum(1); });

    document.addEventListener("keydown", function (event) {
      if (llum.hidden) {
        return;
      }
      if (event.key === "Escape") {
        tancaLlum();
      } else if (event.key === "ArrowLeft") {
        mouLlum(-1);
      } else if (event.key === "ArrowRight") {
        mouLlum(1);
      }
    });
  }
})();
