import WebComponent from '../../JsLib/web-component.js'
import ApiClient from '../../JsLib/apiclient/apiclient.js'

export default class WebApp extends WebComponent {
    static #defaultSettings = {
        'api-url': '',
        'css': './style.css',
        'template': './template.html',
        'auth-type': 'google',
        'auth-dir': '../authenticators',
        'views': {
            'login': '.login-view',
            'content': '.content-view'
        }
    }

    #apiClient = null
    get apiClient() { return this.#apiClient }
    #componentApi = null
    #views = {}
    get views() { return this.#views }
    #settings = null
    get settings() { return this.#settings }

    #loginRequiredHandler = event => {
        this.#views.content.style.display = 'none'
        this.#views.login.style.display = ''
        let loginContainer = this.shadowRoot.querySelector('.login-container')
        event.detail.sender.initializeAuthenticationView(loginContainer)
    }

    constructor(settings) {
        settings = {
            ...WebApp.#defaultSettings,
            ...settings
        }

        settings['api-url'] = new URL(settings['api-url'], document.location.href).href,
            settings['auth-dir'] = new URL(settings['auth-dir'], import.meta.url).href,
            settings['css'] = new URL(settings['css'], document.location.href).href,
            settings['template'] = new URL(settings['template'], document.location.href).href
        console.log(settings['api-url'])
        console.log(settings['auth-dir'])
        console.log(settings['css'])
        console.log(settings['template'])

        super(settings)
        this.#settings = settings
        this.#apiClient = new ApiClient(settings)
        this.#componentApi = settings.componentApi ?? settings.apiUrl + '/components'
        this.#settings = {
            ...this.#settings,
            ...settings
        }
    }

    disconnectedCallback() {
        document.removeEventListener(this.#loginRequiredHandler)
    }

    initializeDom() {
        super.initializeDom()
        for (let key in this.settings.views) {
            this.#views[key] = this.shadowRoot.querySelector(this.settings.views[key])
            this.#views[key].style.display = 'none'
        }

        if (!this.#views.login) throw new Error('Login view missing!')
        if (!this.#views.content) throw new Error('Content view missing!')

        // handle authentication
        document.addEventListener('login-required', this.#loginRequiredHandler)
    }

    switchView(viewName) {
        for (let key in this.#views) {
            this.#views[key].style.display = key == viewName ? 'block' : 'none'
        }
    }

    update() {

    }

    attributeChangedCallback(name, oldValue, newValue) {

    }

    async logout() {
        await this.#apiClient.logout()
        this.update()
    }

    async loadComponent(tagName) {
        let component = customElements.get(tagName)
        if (!component) {
            component = await this.apiClient.loadModule(`/components/${tagName}`)
            component = component || customElements.get(tagName)
            if (!component) {
                throw new Error(`Could not load component ${tagName}`)
            }
            if (!customElements.get(tagName)) {
                customElements.define(tagName, component)
            }
        }

        return component
    }

    findComponents() {
        const components = new Set()
        for (let el of this.shadowRoot.querySelectorAll('*')) {
            const tagName = element.localName

            if (tagName.includes('-') && !customElements.get(tagName)) {
                components.add(tagName)
            }

        }
        return [...components]
    }

    async loadComponents() {
        const components = this.findComponents()

        await Promise.all(
            components.map(tagName => this.loadComponent(tagName))
        )
    }
}
