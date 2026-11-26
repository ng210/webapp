import WebApp from "../../../JsLib/components/web-app.js";
import appSettings from "./appsettings.json" with { type: "json" };
import MessageBox from "../../../JsLib/components/message-box/message-box.js";
import AdventCard from "./advent-card/advent-card.js";

class AdventApp extends WebApp {
  #cards;
  #contentContainer;

  constructor() {
    super(appSettings);
  }

  async connectedCallback() {
    await super.connectedCallback();

    try {
    } catch (error) {
      this.views.login.style.display = "none";
      this.views.content.style.display = "none";
      await MessageBox.showModal(error.message, "Hiba", "Ok");
    }
  }

  initializeDom() {
    super.initializeDom();
    this.#contentContainer = this.shadowRoot.querySelector(".content-view");
    this.loadCards().then(() => this.createCards());
  }

  //#region Advent Cards
  async loadCards() {
    const cards = await fetch("cards.json")
      .then((resp) => {
        if (!resp.ok) throw new Error("Nem sikerült betölteni a kártyákat");
        return resp;
      })
      .then((resp) => resp.json());
    this.#cards = cards;
    console.log(cards);
  }

  createCards() {
    this.#cards.map((data) => {
      const card = new AdventCard(data);
      this.#contentContainer.appendChild(card);

      card.addEventListener("answer-submitted", (e) => {
        //customevent-listener -> api hívás helye/módja
        console.log(e.detail.id, e.detail.date, e.detail.answer);
      });
    });
  }
  //#endregion
}

customElements.define("advent-app", AdventApp);
