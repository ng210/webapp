import WebComponent from '../../JsLib/web-component.js'

export default class MessageBox extends WebComponent {

    static observedAttributes = []

    static #counter = 1

    static #overlay = (() => {
        const overlay = document.createElement('div')
        Object.assign(overlay.style, {
            position: 'fixed',
            inset: '0',
            background: '#0008',
            zIndex: '9998',
            display: 'none'
        })
        document.body.appendChild(overlay)
        return overlay
    })()

    static #instance = null
    static #resolve = null

    // Gyakran használt DOM hivatkozások
    #header = null
    #body = null
    #buttons = null

    constructor() {
        super({
            css: import.meta.resolve('./message-box.css'),
            template: import.meta.resolve('./message.template.html')
        })
    }


    // attributeChangedCallback(name, oldValue, newValue) {
    //     if (oldValue === newValue) return

    //     this.update()
    // }

    initializeDom() {
        super.initializeDom()

        this.#header = this.shadowRoot.querySelector('h1')
        this.#body = this.shadowRoot.querySelector('div')
        this.#buttons = [...this.shadowRoot.querySelectorAll('button')]
        for (let btn of this.#buttons) {
            btn.innerText = btn.className
            btn.addEventListener('click', event => this.#onClick(event))
        }
    }

    update() {
        if (this.initialized) {
            // DOM elemet értintő attribútum
            const title = this.getAttribute('title') ?? 'Message'
            const text = this.getAttribute('text') ?? 'Text'
            const types = (this.getAttribute('type') ?? 'Ok').split('|')

            // Az értékét a DOM elembe kell írni.
            for (let btn of this.#buttons) {
                btn.style.display = types.includes(btn.className) ? 'block' : 'none'
            }
            this.#header.textContent = title
            this.#body.textContent = text
            
            // További 'render' műveletek helye.
        }
    }

    #onClick(event) {
        const cls = event.target.className
        const ix = this.#buttons.findIndex(btn => btn.className === cls)
        const response = {
            id: this.id,
            title: this.getAttribute('title'),
            message: this.getAttribute('text'),
            response: ix,
            responseText: event.target.className
        }
        if (MessageBox.#instance == this) {
            MessageBox.#resolve(response)
        } else {
            this.dispatchEvent(new CustomEvent('message-box', {
                bubbles: true,
                composed: true,
                detail: response
            }));
        }
        this.show(false)
    }

    async show(isVisible, x = -1, y = -1) {
        await this.isInitialized()
        const rect = this.getBoundingClientRect()
        if (x == -1) x = (window.innerWidth - rect.width) / 2
        if (y == -1) y = (window.innerHeight - rect.height) / 2
        this.style.left = x + 'px'
        this.style.top = y + 'px'
        if (!isVisible) {
            this.remove()
            if (this == MessageBox.#instance) {
                MessageBox.#instance = null
                MessageBox.#overlay.style.display = 'none'
            }
        }
    }

    static async show(text, title = 'Message', type = 'Ok', x = -1, y = -1) {
        const msgBox = document.createElement('message-box')
        msgBox.setAttribute('title', title)
        msgBox.setAttribute('text', text)
        msgBox.setAttribute('type', type)
        document.body.appendChild(msgBox)
        msgBox.id = 'mb' + (MessageBox.#counter.toString().padStart(4, '0'))
        MessageBox.#counter++
        await msgBox.show(true, x, y)
        return msgBox
    }

    static async showModal(text, title = 'Message', type = 'Ok', x = -1, y = -1) {
        if (MessageBox.#instance != null) {
            MessageBox.#instance.show(false)
        }
        MessageBox.#overlay.style.display = 'block'
        MessageBox.#instance = await MessageBox.show(text, title, type, x, y)
        return new Promise(
            resolve => {
                MessageBox.#resolve = resolve
            })
    }
}

customElements.define('message-box', MessageBox)