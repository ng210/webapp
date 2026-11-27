import WebApp from "../../../JsLib/components/web-app.js";
import appSettings from "./appsettings.json" with { type: "json" };
import MessageBox from "../../../JsLib/components/message-box/message-box.js";
import AdventCard from "./advent-card/advent-card.js";

class AdventApp extends WebApp {
  #cards;
  #loginContainer;
  #contentContainer;

  constructor() {
    super(appSettings);
  }

  // async connectedCallback() {
  //   await super.connectedCallback();

  //   try {
  //   } catch (error) {
  //     this.views.login.style.display = "none";
  //     this.views.content.style.display = "none";
  //     await MessageBox.showModal(error.message, "Hiba", "Ok");
  //   }
  // }

  initializeDom() {
    super.initializeDom();
    this.#contentContainer = this.shadowRoot.querySelector(".content-view");
    this.#loginContainer = this.shadowRoot.querySelector(".login-container");
    this.addView('login', '.login-view')

    document.dispatchEvent(
      new CustomEvent("language-change", {
        detail: { lang: appSettings.lang }
      }),
    );

    MessageBox.setCssProperties({
        'font-size': '1.4rem',
        'bg-colorLight': '#fecc',
        'bg-colorDark': '#8768',
        'transparency': 0.2
    })
    MessageBox.setOverlayColor('#210c')
    this.loadCards()
      .then(() => this.createCards())
      .catch(err => MessageBox.showModal(err.message, 'Hiba'));
  }

  //#region Authentication
    authRequiredHandler(event) {
        this.showView('login')
        event.detail.resolve({
            // autentikáció típusa
            type: appSettings.authType,
            // a bejelentkező felületet tartalmazó elem
            container: this.#loginContainer,
            // a google autentikációhoz kell a kliens id
            clientId: appSettings['google_client_id'],
            language: appSettings.lang
        })
    }

    authCompletedHandler(event) {
        this.showView('login', false)
        if (event.detail.error) {
            MessageBox.showModal(event.detail.error, 'Hiba')
        }
    }
    //#endregion

  //#region Advent Cards
  async loadCards() {
    // const devCards = await fetch("cards.json")
    //   .then((resp) => {
    //     if (!resp.ok) throw new Error("Nem sikerült betölteni a kártyákat");
    //     return resp;
    //   })
    //   .then((resp) => resp.json());
    // console.log(devCards);
    const cards = await this.apiClient.get('/cards')
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
        this.apiClient.post('/cards', { id, date, answer })
      });
    });
  }
  //#endregion
}

customElements.define("advent-app", AdventApp);
