var r = new CSSStyleSheet(), l = class t extends HTMLElement {
  #e = {};
  set user(e) {
    this.#e = e, this.#i();
  }
  get user() {
    return this.#e;
  }
  #t = !1;
  #s = null;
  static #a = null;
  async getTemplate() {
    if (!t.#a) {
      let e = `${import.meta.url.slice(0, import.meta.url.lastIndexOf("/"))}/user-card.template.html`;
      t.#a = fetch(e).then((a) => a.text());
    }
    return t.#a;
  }
  constructor(e) {
    super(), this.#e = e ?? {};
  }
  connectedCallback() {
    this.#t || this.#r(), this.#i();
  }
  #r() {
    this.#s = this.attachShadow({ mode: "open" }), this.#s.adoptedStyleSheets = [r], this.#t = !0;
  }
  async #i() {
    if (!this.#t) return;
    const e = (await this.getTemplate()).replaceAll(/{{(\w+)}}/g, (a, i) => {
      let s = this.#e[i] ?? "n.a.";
      return i == "profileImageUrl" && s == "n.a." && (s = "assets/profil.png"), s;
    });
    this.#s.innerHTML = e;
  }
};
customElements.define("user-card", l);
export {
  l as default
};
