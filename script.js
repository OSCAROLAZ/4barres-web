/* ============================================================
   4 BARRES — Interaccions en JS vanilla (sense llibreries)
   1. Menú hamburguesa en mòbil
   2. Revelat en fer scroll (IntersectionObserver)
   3. Parallax lleu al hero (amb respecte a prefers-reduced-motion)
   4. Capçalera més fosca en fer scroll
   5. Formulari de newsletter (acció placeholder)
   ============================================================ */

(function () {
  "use strict";

  var redueixMoviment = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

  if ("IntersectionObserver" in window && !redueixMoviment) {
    var observador = new IntersectionObserver(
      function (entrades) {
        entrades.forEach(function (entrada) {
          if (entrada.isIntersecting) {
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
  } else {
    // Fallback: tot visible de cop
    elementsRevelar.forEach(function (el) {
      el.classList.add("revelat");
    });
  }

  /* ---------- 3. Parallax lleu al hero ---------- */
  var heroImg = document.getElementById("heroImg");
  var hero = document.getElementById("inici");
  var ficant = false;

  function actualitzaParallax() {
    ficant = false;
    var desplacament = window.scrollY;
    var alcadaHero = hero.offsetHeight;
    // Trasllat pur (sense escalat): el marge extra del fons és sota
    // (14% a style.css), suficient per absorbir el moviment sense
    // destapar mai la part superior de la imatge
    if (desplacament < alcadaHero) {
      heroImg.style.transform = "translateY(" + desplacament * 0.12 + "px)";
    }
  }

  if (!redueixMoviment) {
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
})();
