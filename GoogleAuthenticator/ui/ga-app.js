import WebApp from '../../JsLib/web-app/web-app.js'
import appSettings from './appsettings.json' with { type: 'json' }
import MessageBox from '../../components/message-box/message-box.js'

class GoogleAuthenticatorApp extends WebApp {
    constructor() {
        super(appSettings)
    }

    async connectedCallback() {
        await super.connectedCallback()

        try {
            let user = await this.apiClient.get('/users*me')
            //await this.loadUserCard(user)

            this.views.content.style.display = ''
        
            console.log('Bejelentkezett felhasználó:', user)
        
            //this.views['user-card'].user = user
        
        } catch (error) {
            this.views.login.style.display = 'none'
            this.views.content.style.display = 'none'
            await MessageBox.showModal(error.message, 'Hiba', 'Ok')
        }
    }

    async loadUserCard(user) {
        // A komponens moduljának dinamikus betöltése
        await import('../../components/user-card/user-card.js')

        // A komponens példányosítása
        const userCard = document.createElement('user-card')

        // Adatok átadása
        userCard.user = user

        // Elhelyezés a DOM-ban
        this.views.userCardContainer.replaceChildren(userCard)

        this.views['user-card'] = userCard
    }

    initializeDom() {
        super.initializeDom()

        this.views['user-card'] = this.shadowRoot.querySelector('user-card')
        this.shadowRoot.querySelector('section.content-view>button')
            .addEventListener('click', () => this.logout())
    }
}

customElements.define('ga-app', GoogleAuthenticatorApp)