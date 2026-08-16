const root = document.documentElement;
const themeButton = document.querySelector("#theme-toggle");
const themeLabel = themeButton?.querySelector(".theme-label");
const themeColor = document.querySelector("#theme-color");
const statusCopy = document.querySelector("#status-copy");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const liveSignals = [
  "BUENOS AIRES · EN LÍNEA",
  "SONIDO · IMAGEN · CÓDIGO",
  "CREANDO · SIEMPRE",
];

function syncThemeControl(theme) {
  const dark = theme === "dark";
  themeButton?.setAttribute("aria-pressed", String(dark));
  themeButton?.setAttribute(
    "aria-label",
    dark ? "Activar modo claro" : "Activar modo noche",
  );
  if (themeLabel) themeLabel.textContent = dark ? "DÍA" : "NOCHE";
  themeColor?.setAttribute("content", dark ? "#0b0c0b" : "#f0f0eb");
}

let currentTheme = root.dataset.theme === "dark" ? "dark" : "light";
syncThemeControl(currentTheme);

themeButton?.addEventListener("click", () => {
  currentTheme = currentTheme === "dark" ? "light" : "dark";
  root.dataset.theme = currentTheme;

  try {
    window.localStorage.setItem("jota-theme", currentTheme);
  } catch (error) {
    // The theme still works when storage is unavailable.
  }

  syncThemeControl(currentTheme);
});

if (statusCopy && !reduceMotion.matches) {
  let signalIndex = 0;
  window.setInterval(() => {
    signalIndex = (signalIndex + 1) % liveSignals.length;
    statusCopy.textContent = liveSignals[signalIndex];
    statusCopy.animate(
      [
        { opacity: 0, transform: "translateY(0.3rem)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      { duration: 520, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
    );
  }, 2600);
}

const revealNodes = Array.from(document.querySelectorAll("[data-reveal]"));
root.classList.add("motion-ready");

if (reduceMotion.matches) {
  revealNodes.forEach((node) => node.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -8%", threshold: 0.08 },
  );

  revealNodes.forEach((node) => revealObserver.observe(node));

  let pointerFrame = 0;
  window.addEventListener(
    "pointermove",
    (event) => {
      window.cancelAnimationFrame(pointerFrame);
      pointerFrame = window.requestAnimationFrame(() => {
        root.style.setProperty("--pointer-x", `${event.clientX}px`);
        root.style.setProperty("--pointer-y", `${event.clientY}px`);
      });
    },
    { passive: true },
  );
}

const shareButton = document.querySelector("#share-button");
const shareLabel = shareButton?.querySelector(".share-label");
let resetTimer;

function showShareStatus(message) {
  if (!shareLabel) return;

  window.clearTimeout(resetTimer);
  shareLabel.textContent = message;
  resetTimer = window.setTimeout(() => {
    shareLabel.textContent = "COMPARTIR";
  }, 1800);
}

async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return true;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();

  const copied = document.execCommand("copy");
  textarea.remove();
  return copied;
}

shareButton?.addEventListener("click", async () => {
  const shareData = {
    title: "JOTA 1988 — Creativo Digital",
    text: "Música, diseño, 3D, código y mundos digitales.",
    url: window.location.href,
  };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
      return;
    }

    const copied = await copyText(window.location.href);
    showShareStatus(copied ? "LINK COPIADO" : "COPIÁ LA URL");
  } catch (error) {
    if (error?.name !== "AbortError") {
      showShareStatus("COPIÁ LA URL");
    }
  }
});
