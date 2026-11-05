/* =========================================================
   Configuración: editá estos datos sin tocar el HTML
   ========================================================= */
const CONFIG = {
  // Google Maps de la iglesia
  ceremonia: "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent("Iglesia San Francisco de Asís, calle 14 y 153, Berisso, Buenos Aires"),

  // Google Maps de la quinta
  festejo: "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent("Quinta El Chañar, Calle 97, Los Talas, Berisso, Buenos Aires"),

  // WhatsApp de los papis: código de país + área + número, sin "+", espacios ni guiones.
  // Ej. Argentina: "5492215555555". Si queda vacío, se abre WhatsApp para elegir contacto.
  whatsapp: "5492216283778",
  mensaje: "¡Hola! Confirmo asistencia al bautismo y primer añito de Magdalena 🎉",
};

(function () {
  const root = document.documentElement;

  // Links de los botones
  const links = {
    ceremonia: CONFIG.ceremonia,
    festejo: CONFIG.festejo,
    confirmar: `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(CONFIG.mensaje)}`,
  };
  document.querySelectorAll("[data-link]").forEach((a) => {
    const href = links[a.dataset.link];
    if (href) a.href = href;
  });

  if (!root.classList.contains("anim")) return; // movimiento reducido: todo visible

  // Índices para el escalonado (textos e imágenes de la grilla)
  document.querySelectorAll('[data-reveal="stagger"]').forEach((group) => {
    [...group.children]
      .filter((el) => !el.classList.contains("info__butterfly"))
      .forEach((el, i) => el.style.setProperty("--i", i));
  });
  document.querySelectorAll('[data-reveal="gallery"] > .photo').forEach((el, i) => {
    // en 2 columnas: diagonal (0,1 / 1,2) para un fundido más natural
    el.style.setProperty("--i", (i % 2) + Math.floor(i / 2));
  });

  // Resuelve cuando todas las imágenes del elemento terminaron de cargar
  // (o fallaron). Así ninguna foto se "revela" vacía mientras descarga.
  const imagesReady = (el) => {
    const imgs = el.tagName === "IMG" ? [el] : [...el.querySelectorAll("img")];
    return Promise.all(
      imgs.map((img) => {
        if (img.complete && img.naturalWidth) {
          return img.decode ? img.decode().catch(() => {}) : Promise.resolve();
        }
        // si es lazy, forzamos la descarga ahora que está por verse
        if (img.loading === "lazy") img.loading = "eager";
        return new Promise((r) => {
          img.addEventListener("load", r, { once: true });
          img.addEventListener("error", r, { once: true });
        });
      })
    );
  };
  const timeout = (ms) => new Promise((r) => setTimeout(r, ms));

  // Apertura del hero: espera la fuente y la conejita para que nada "salte"
  const hero = document.querySelector(".hero");
  const openHero = () => requestAnimationFrame(() => requestAnimationFrame(() => hero.classList.add("is-in")));
  const fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  Promise.race([Promise.all([fontsReady, imagesReady(hero)]), timeout(2500)]).then(openHero);

  // Revelado al hacer scroll
  const targets = document.querySelectorAll("[data-reveal], .wash-bottom");
  if (!("IntersectionObserver" in window)) {
    targets.forEach((el) => el.classList.add("is-in"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          io.unobserve(el);
          // máximo 4 s de espera: con conexión muy lenta se muestra igual
          Promise.race([imagesReady(el), timeout(4000)]).then(() => el.classList.add("is-in"));
        }
      });
    },
    { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
  );
  targets.forEach((el) => io.observe(el));
})();
