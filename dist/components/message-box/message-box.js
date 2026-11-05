var c = ":host{z-index:9999;background-color:#ccc8;border:2px solid #000;border-radius:8px;display:block;position:fixed}h1.header{text-align:center;background-color:#fff4;margin:0 0 .5rem}div.body{padding:.4rem}div.buttons{justify-content:space-around;padding:.4rem;display:flex}button{font-size:1rem}", l = new CSSStyleSheet();
l.replaceSync(c);
var d = await (async () => {
  let r = `${import.meta.url.slice(0, import.meta.url.lastIndexOf("/"))}/message.template.html`;
  return fetch(r).then((t) => t.text());
})(), h = class i extends HTMLElement {
  static observedAttributes = [];
  static #i = 1;
  static #c = (() => {
    const t = document.createElement("template");
    return t.innerHTML = d, t;
  })();
  static #n = (() => {
    const t = document.createElement("div");
    return Object.assign(t.style, {
      position: "fixed",
      inset: "0",
      background: "#0008",
      zIndex: "9998",
      display: "none"
    }), document.body.appendChild(t), t;
  })();
  static #t = null;
  static #o = null;
  #a = null;
  #l = null;
  #e = null;
  #s = !1;
  constructor() {
    super();
  }
  connectedCallback() {
    this.#s || (this.#d(), this.#s = !0), this.#r();
  }
  disconnectedCallback() {
  }
  attributeChangedCallback(t, e, s) {
    e !== s && this.#r();
  }
  #d() {
    const t = this.attachShadow({ mode: "open" });
    t.append(i.#c.content.cloneNode(!0)), t.adoptedStyleSheets = [l], this.#a = t.querySelector("h1"), this.#l = t.querySelector("div"), this.#e = [...t.querySelectorAll("button")];
    for (let e of this.#e)
      e.innerText = e.className, e.addEventListener("click", (s) => this.#h(s));
  }
  #r() {
    if (this.#s) {
      const t = this.getAttribute("title") ?? "Message", e = this.getAttribute("text") ?? "Text", s = (this.getAttribute("type") ?? "Ok").split("|");
      for (let n of this.#e) n.style.display = s.includes(n.className) ? "block" : "none";
      this.#a.textContent = t, this.#l.textContent = e;
    }
  }
  #h(t) {
    const e = t.target.className, s = Object.keys(this.#e).indexOf(e), n = {
      id: this.id,
      title: this.getAttribute("title"),
      message: this.getAttribute("text"),
      response: s,
      responseText: t.target.className
    };
    i.#t == this ? i.#o(n) : this.dispatchEvent(new CustomEvent("message-box", {
      bubbles: !0,
      composed: !0,
      detail: n
    })), this.show(!1);
  }
  show(t, e = -1, s = -1) {
    const n = this.getBoundingClientRect();
    e == -1 && (e = (window.innerWidth - n.width) / 2), s == -1 && (s = (window.innerHeight - n.height) / 2), this.style.left = e + "px", this.style.top = s + "px", t || (this.remove(), this == i.#t && (i.#t = null, i.#n.style.display = "none"));
  }
  static show(t, e = "Message", s = "Ok", n = -1, a = -1) {
    const o = document.createElement("message-box");
    return o.setAttribute("title", e), o.setAttribute("text", t), o.setAttribute("type", s), document.body.appendChild(o), o.id = "mb" + i.#i.toString().padStart(4, "0"), i.#i++, o.show(!0, n, a), o;
  }
  static showModal(t, e = "Message", s = "Ok", n = -1, a = -1) {
    return i.#t != null && i.#t.show(!1), i.#n.style.display = "block", i.#t = i.show(t, e, s, n, a), new Promise((o) => {
      i.#o = o;
    });
  }
};
customElements.define("message-box", h);
export {
  h as default
};
