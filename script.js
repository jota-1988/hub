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
    title: "JOTA — Creativo Digital",
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
