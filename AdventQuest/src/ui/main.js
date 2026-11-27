// #region Fordítások betöltése
// const translations = await fetch(
//   import.meta.resolve("./translations.json"),
// ).then((resp) => resp.json());
import translations from "./translations.json" with { type: 'json' }
// #endregion

// #region Nyelvváltás kezelése
function updateLanguage(lang) {
  const dict = translations[lang];
  if (!dict) return;

  const translateRoot = (root) => {
    root.querySelectorAll("[data-lang]").forEach((el) => {
      const key = el.dataset.lang;
      if (dict[key]) {
        el.textContent = dict[key];
      }
    });

    // Belép minden Web Component Shadow DOM-jába is
    root.querySelectorAll("*").forEach((el) => {
      if (el.shadowRoot) {
        translateRoot(el.shadowRoot);
      }
    });
  };

  translateRoot(document);
}

document.addEventListener("language-change", (e) => {
  const lang = e.detail?.lang ?? e.detail;
  updateLanguage(lang);
});
// #endregion

// setTimeout(() => {
//   document.dispatchEvent(
//     new CustomEvent("language-change", {
//       detail: { lang: appsettings.lang },
//     }),
//   );
// }, 500);