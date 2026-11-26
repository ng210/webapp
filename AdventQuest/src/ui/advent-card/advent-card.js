import _css from "./advent-card.css" with { type: "css" };

let _html = "";
try {
  const resp = await fetch(import.meta.resolve("./advent-card.html"));
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  _html = await resp.text();
} catch (err) {
  console.error("Nem sikerült betölteni az advent-card.html sablont:", err);
}

class AdventCard extends HTMLElement {
  #initialized = false;
  #cardData;

  constructor(cardData) {
    super();
    this.#cardData = cardData;
  }

  connectedCallback() {
    if (!this.#initialized) {
      this.#initializeCard();
      this.#initialized = true;
    }
  }

  // #region Inicializálás és DOM felépítés
  #initializeCard() {
    this.attachShadow({ mode: "open" });
    this.shadowRoot.adoptedStyleSheets = [_css];
    this.shadowRoot.innerHTML = _html;

    if (!this.#cardData || typeof this.#cardData !== "object") {
      console.warn("AdventCard: érvénytelen vagy hiányzó cardData.", this.#cardData);
      this.dataset.state = "locked";
      return;
    }

    // Állapot beállítása és zárolt jelzés hozzáadása
    this.dataset.state = this.#cardData.state ?? "locked";
    const dateElem = this.shadowRoot.querySelector('[data-field="date"]');
    if (this.dataset.state === "locked" && dateElem) {
      dateElem.textContent += "🔒";
    }

    this.#setupCardFlip();
    this.#populateFields();
    this.#setupSubmitButton();
  }
  // #endregion

  // #region Eseménykezelők és mezők feltöltése
  #setupCardFlip() {
    if (this.dataset.state === "locked") return;

    this.addEventListener("click", (e) => {
      if (e.composedPath()[0] !== this) return;
      this.classList.toggle("flipped");
    });
  }

  #populateFields() {
    for (const [key, value] of Object.entries(this.#cardData)) {
      if (value === null || value === undefined || value === "") continue;

      const elem = this.shadowRoot.querySelector(`[data-field="${key}"]`);
      if (!elem) continue;

      if (key === "options") {
        if (this.dataset.state === "closed") continue;

        const opts = String(value)
          .split(";")
          .map((opt) => opt.trim())
          .filter(Boolean);

        if (!opts.length) continue;

        elem.innerHTML = opts
          .map((opt) => `<option value="${opt}">${opt}</option>`)
          .join("");

        if (this.#cardData.answer) {
          elem.disabled = true;
          elem.value = this.#cardData.answer;
        }
      } else if (key === "image") {
        elem.onerror = () => {
          console.warn(`Hibás képútvonal: ${elem.src}`);
          elem.closest(".image-wrapper")?.setAttribute("hidden", "");
          elem.hidden = true;
        };
        elem.src = String(value).startsWith("http") ? value : `./assets/${value}`;
      } else {
        elem.textContent += value;
      }

      elem.hidden = false;
    }
  }

  #setupSubmitButton() {
    const btSendAnswer = this.shadowRoot.querySelector(".btSendAnswer");
    if (!btSendAnswer) return;

    if (this.dataset.state !== "open" || this.#cardData.answer) {
      btSendAnswer.remove();
      return;
    }

    btSendAnswer.addEventListener("click", () => {
      const selectElem = this.shadowRoot.querySelector('[data-field="options"]');
      const answer = selectElem?.value;

      if (!answer) {
        alert("Kérlek, válassz egy lehetőséget a beküldés előtt!");
        return;
      }

      if (!confirm("Biztosan rögzíteni szeretnéd a válaszodat?")) return;

      btSendAnswer.disabled = true;
      if (selectElem) selectElem.disabled = true;

      this.dispatchEvent(
        new CustomEvent("answer-submitted", {
          detail: {
            id: this.#cardData.id,
            date: this.#cardData.date,
            answer,
          },
          bubbles: true,
          composed: true,
        }),
      );
    });
  }
  // #endregion
}

if (!customElements.get("advent-card")) {
  customElements.define("advent-card", AdventCard);
}

export default AdventCard;