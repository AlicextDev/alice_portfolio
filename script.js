const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

// Ano automático no rodapé
const yearElement = $("#year");

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

// Spotlight vinho que acompanha o cursor
const spotlight = $("#spotlight");

if (spotlight) {
  window.addEventListener(
    "mousemove",
    (event) => {
      spotlight.style.left = `${event.clientX}px`;
      spotlight.style.top = `${event.clientY}px`;
    },
    { passive: true }
  );
}

// Alternância de idioma: português / inglês
const langToggle = $("#langToggle");
const langText = $("#langText");

let currentLang = "pt";

if (langToggle) {
  langToggle.addEventListener("click", () => {
    currentLang = currentLang === "pt" ? "en" : "pt";

    if (langText) {
      langText.textContent = currentLang === "pt" ? "EN" : "PT";
    }

    document.documentElement.lang =
      currentLang === "pt" ? "pt-BR" : "en";

    $$("[data-pt][data-en]").forEach((element) => {
      const translatedText = element.getAttribute(`data-${currentLang}`);

      if (translatedText === null) {
        return;
      }

      // Preserva ícones dentro de links quando existirem.
      if (
        element.tagName === "A" &&
        element.querySelector("span") &&
        !element.classList.contains("nav-link")
      ) {
        const icon = element.querySelector("span");
        const iconHTML = icon ? icon.outerHTML : "";

        element.innerHTML = `${translatedText
          .replace(/↗|📄/g, "")
          .trim()} ${iconHTML}`.trim();
      } else {
        element.innerHTML = translatedText;
      }
    });
  });
}

// Menu mobile
const menuToggle = $("#menuToggle");
const nav = $("#nav");

if (menuToggle && nav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");

    menuToggle.setAttribute("aria-expanded", String(isOpen));

    menuToggle.setAttribute(
      "aria-label",
      isOpen ? "Fechar menu" : "Abrir menu"
    );

    menuToggle.textContent = isOpen ? "×" : "☰";
  });

  $$(".nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");

      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Abrir menu");

      menuToggle.textContent = "☰";
    });
  });
}

// Barra de progresso da página
const progress = $("#progress");

function updateProgress() {
  if (!progress) {
    return;
  }

  const scrollable =
    document.documentElement.scrollHeight - window.innerHeight;

  const percentage =
    scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;

  progress.style.width = `${percentage}%`;
}

window.addEventListener("scroll", updateProgress, {
  passive: true,
});

updateProgress();

// Destaque do link de navegação conforme a seção visível
if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        $$(".nav-link").forEach((link) => {
          link.classList.toggle(
            "active",
            link.getAttribute("href") === `#${entry.target.id}`
          );
        });
      });
    },
    {
      rootMargin: "-35% 0px -55% 0px",
    }
  );

  $$("main section[id]").forEach((section) => {
    sectionObserver.observe(section);
  });

  // Animações de entrada ao rolar a página
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.1,
    }
  );

  $$(".reveal").forEach((element) => {
    revealObserver.observe(element);
  });
} else {
  // Compatibilidade com navegadores sem IntersectionObserver
  $$(".reveal").forEach((element) => {
    element.classList.add("is-visible");
  });
}

// Filtros dos projetos
$$(".filter-chip").forEach((button) => {
  button.addEventListener("click", () => {
    // Atualiza o botão selecionado
    $$(".filter-chip").forEach((item) => {
      item.classList.toggle("selected", item === button);
    });

    const filter = button.dataset.filter;

    // Mostra apenas projetos da categoria selecionada
    $$(".project-card").forEach((card) => {
      card.classList.toggle(
        "filtered-out",
        filter !== "all" && card.dataset.category !== filter
      );
    });
  });
});

// Carrossel de vivências
const track = $("#carouselTrack");
const prevBtn = $("#carouselPrev");
const nextBtn = $("#carouselNext");
const carouselWrapper = $(".carousel-track-wrapper");

if (track && prevBtn && nextBtn && carouselWrapper) {
  let offset = 0;

  // Distância máxima que o carrossel pode percorrer
  const maxOffset = () =>
    Math.max(0, track.scrollWidth - carouselWrapper.clientWidth);

  // Distância de deslocamento equivalente a um cartão
  const cardStep = () => {
    const card = track.querySelector(".polaroid-card");

    if (!card) {
      return 324;
    }

    const gap = parseFloat(getComputedStyle(track).gap) || 24;

    return card.getBoundingClientRect().width + gap;
  };

  // Atualiza a posição visual do carrossel
  function renderTrack() {
    offset = Math.max(0, Math.min(offset, maxOffset()));

    track.style.transform = `translate3d(${-offset}px, 0, 0)`;
  }

  // Avançar
  nextBtn.addEventListener("click", () => {
    offset =
      offset >= maxOffset()
        ? 0
        : Math.min(offset + cardStep(), maxOffset());

    renderTrack();
  });

  // Voltar
  prevBtn.addEventListener("click", () => {
    offset =
      offset <= 0
        ? maxOffset()
        : Math.max(offset - cardStep(), 0);

    renderTrack();
  });

  // Ajusta o carrossel quando a janela muda de tamanho
  window.addEventListener("resize", renderTrack, {
    passive: true,
  });
}

// =========================================================
// BRILHOS EM MOVIMENTO PELO PORTFÓLIO
// =========================================================
function initAmbientSparkles() {
  const container = document.getElementById("ambientSparkles");
  if (!container) return;

  const count = 18;
  const colors = ["#C76B8E", "#6B3048", "#E5A9BC", "#D48BA3"];

  for (let i = 0; i < count; i++) {
    const sparkle = document.createElement("div");
    sparkle.className = "ambient-sparkle";
    sparkle.style.left = (Math.random() * 98) + "%";

    const size = 10 + Math.random() * 14;
    sparkle.style.width = size + "px";
    sparkle.style.height = size + "px";

    const duration = 8 + Math.random() * 10;
    sparkle.style.animationDuration = duration + "s";
    sparkle.style.animationDelay = (Math.random() * duration) + "s";
    sparkle.style.color = colors[Math.floor(Math.random() * colors.length)];

    sparkle.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%"><path d="M12 0 C12 6.6 6.6 12 0 12 C6.6 12 12 17.4 12 24 C12 17.4 17.4 12 24 12 C17.4 12 12 6.6 12 0 Z"/></svg>';
    container.appendChild(sparkle);
  }
}

// Rastro sutil de brilhos ao mover o mouse
let lastSparkleTime = 0;
window.addEventListener("mousemove", (e) => {
  const now = performance.now();
  if (now - lastSparkleTime > 110) {
    lastSparkleTime = now;
    createCursorSparkle(e.clientX, e.clientY);
  }
}, { passive: true });

function createCursorSparkle(x, y) {
  const sparkle = document.createElement("div");
  sparkle.className = "cursor-sparkle";
  sparkle.style.left = x + "px";
  sparkle.style.top = y + "px";

  const size = 12 + Math.random() * 10;
  sparkle.style.width = size + "px";
  sparkle.style.height = size + "px";

  sparkle.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%"><path d="M12 0 C12 6.6 6.6 12 0 12 C6.6 12 12 17.4 12 24 C12 17.4 17.4 12 24 12 C17.4 12 12 6.6 12 0 Z"/></svg>';
  document.body.appendChild(sparkle);

  setTimeout(() => {
    sparkle.remove();
  }, 850);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAmbientSparkles);
} else {
  initAmbientSparkles();
}