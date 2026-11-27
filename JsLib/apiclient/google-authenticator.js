
import IAuthenticator from './iauthenticator.js'

export default class GoogleAuthenticator extends IAuthenticator {
    #clientId = null
    get clientId() {
        return this.#clientId
    }

    #language = ''

    async initialize({ container = null, clientId = null, language = '' } = {}) {
        await super.initialize({ container })
        this.#clientId = clientId
        this.#language = language
    }

    async authenticate() {
        return new Promise((resolve, reject) => {
            try {
                google.accounts.id.initialize({
                    client_id: this.clientId,
                    callback: (response) => {
                        const token = response.credential ?? null
                        resolve({
                            success: !!token,
                            data: token,
                            error: token ? null : 'Google authentication failed'
                        })
                    }
                })

                google.accounts.id.renderButton(this.container, {
                    type: "standard",
                    theme: "outline",
                    size: "large",
                    text: "signin_with",
                    locale: this.#language
                })
            } catch (error) {
                reject(error)
            }
        })
    }
}
