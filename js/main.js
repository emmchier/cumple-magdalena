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

  // Apertura del hero: espera la fuente para que el texto no "salte"
  const hero = document.querySelector(".hero");
  const openHero = () => requestAnimationFrame(() => requestAnimationFrame(() => hero.classList.add("is-in")));
  const fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  Promise.race([fontsReady, new Promise((r) => setTimeout(r, 1200))]).then(openHero);

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
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
  );
  targets.forEach((el) => io.observe(el));
})();
