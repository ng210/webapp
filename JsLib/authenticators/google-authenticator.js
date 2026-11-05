import AuthenticationError from './authentication-error.js'
import IAuthenticator from './iauthenticator.js'

export default class GoogleAuthenticator extends IAuthenticator {
    #authorizePromise = null
    #resolveAuthorize = null
    #rejectAuthorize = null
    #authorizeTimer = null
    #isInitialized = false

    constructor(client) {
        super(client)
    }

    #cleanUpAuthorization() {
        clearTimeout(this.#authorizeTimer)
        this.#authorizeTimer = null
        this.#authorizePromise = null
        this.#resolveAuthorize = null
        this.#rejectAuthorize = null
    }

    initializeAuthenticationView(container) {
        if (!this.#isInitialized) {
            google.accounts.id.initialize({
                context: 'signin',
                auto_prompt: false,
                class: 'gsi',
                ux_mode: 'popup',
                client_id: this.client.options.client_id,
                callback: response => this.authenticate(response)
            });

            this.#isInitialized = true;
        }

        google.accounts.id.renderButton(container, {
            theme: 'outline',
            size: 'large'
        });
    }

    async authenticate(response) {
        clearTimeout(this.#authorizeTimer)
        this.#authorizeTimer = null

        const promise = this.#authorizePromise
        if (!promise) return

        try {
            const token = await this.client.getToken(response)
            if (this.#authorizePromise !== promise) return

            localStorage.setItem('at', token)
            this.#resolveAuthorize?.(token)
        } catch (err) {
            if (this.#authorizePromise === promise) {
                this.#rejectAuthorize?.(new AuthenticationError(err.message, { cause: err }))
            }
        } finally {
            if (this.#authorizePromise === promise) {
                this.#cleanUpAuthorization()
            }
        }
    }

    async authorizeRequest(request) {
        let token

        try {
            token = localStorage.getItem('at')
        } catch (err) {
            throw new AuthenticationError('A hitelesítési adatok beolvasása sikertelen', { cause: err })
        }

        if (token) {
            return {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        }

        if (!this.#authorizePromise) {
            this.#authorizePromise = new Promise(
                (resolve, reject) => {
                    this.#resolveAuthorize = resolve
                    this.#rejectAuthorize = reject
                })

            this.#authorizeTimer = setTimeout(
                () => {
                    this.#rejectAuthorize?.(new AuthenticationError('Nem érkezett időben válasz a hitelesítőtől'))
                    this.#cleanUpAuthorization()
                }, 90000)

            //const view = this.getAuthenticationView()
            document.dispatchEvent(
                new CustomEvent('login-required', {
                    bubbles: true,
                    composed: true,
                    detail: { sender: this }}))
        }

        const promise = this.#authorizePromise
        try {
            const token = await promise
            return {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        } finally {
            // Csak a saját Promise-unkat töröljük.
            if (this.#authorizePromise === promise) {
                this.#cleanUpAuthorization()
            }
        }
    }

    async clearAuthentication() {
        try {
            localStorage.removeItem('at')
        } catch (err) {
            throw new AuthenticationError('A hitelesítési adatok törlése sikertelen', { cause: err })
        }
    }

    async getAuthorizationInfo() {
        return this.client.get('/users/me')
    }
}