import WebComponent from '../../JsLib/web-component.js'

export default class UserCard extends WebComponent {
    #user = {}
    set user(data) {
        this.#user = data
        this.update()
    }
    get user() { return this.#user }

    constructor(user) {
        super({
            css: import.meta.resolve('./user-card.css'),
            template: import.meta.resolve('./user-card.template.html')
        })

        this.#user = user??{}
    }

    initializeDom() {
        this.attachShadow({ mode: 'open' })
        this.shadowRoot.adoptedStyleSheets = [this.css]
    }

    async update() {
        if (!this.initialized) return
        if (this.user) {
            const content = this.templateNode.innerHTML.replace(
                /{{(\w+)}}/g,
                (m, key) => {
                    let value = this.#user[key]??'n.a.'
                    if (key == 'profileImageUrl' && value == 'n.a.') {
                        value = 'assets/profil.png'
                    }
                    return value
                })
            this.shadowRoot.innerHTML = content
        }
    }
}

customElements.define('user-card', UserCard)