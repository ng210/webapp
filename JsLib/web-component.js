export default class WebComponent extends HTMLElement {
    static observedAttributes = []

    #options = null
    #css = null
    get css() { return this.#css }
    #template = null
    get template() { return this.#template }
    #templateNode = null
    get templateNode() { return this.#templateNode }

    #initialized = false
    get initialized() { return this.#initialized }

    constructor(options) {
        super()
        this.#options = { ...options }
    }

    async connectedCallback() {
        if (!this.#initialized) {
            if (this.#options.css) {
                this.#css = await this.loadResource(this.#options.css, 'css')
            }

            if (this.#options.template) {
                this.#templateNode = await this.loadResource(this.#options.template, 'html')
            }

            this.initializeDom()
            this.#initialized = true
        }

        this.update()
    }

    disconnectedCallback() {

    }

    initializeDom() {
        this.attachShadow({ mode: 'open' })

        this.shadowRoot.adoptedStyleSheets = this.#css
            ? [this.#css]
            : []

        if (this.#templateNode) {
            const node = this.#templateNode.content.cloneNode(true)
            this.shadowRoot.append(node)
        }
    }

    isInitialized() {
        return new Promise(resolve => {
            const check = () => {
                if (this.#initialized) {
                    resolve()
                }
                else {
                    requestAnimationFrame(check);
                }
            }

            check()
        })
    }

    update() {

    }

    attributeChangedCallback(name, oldValue, newValue) {

    }


    async loadResource(url, type) {
        const response = await fetch(url);

        if (!response.ok)
            throw new Error(`Resource loading failed: ${url} (${response.status})`);

        switch (type) {
            case 'text':
                return response.text();

            case 'json':
                return response.json();

            case 'html': {
                const template = document.createElement('template');
                template.innerHTML = await response.text();
                return template;
            }

            case 'css': {
                const stylesheet = new CSSStyleSheet();
                await stylesheet.replace(await response.text());
                return stylesheet;
            }

            case 'image': {
                const image = new Image();
                const objectUrl = URL.createObjectURL(await response.blob());

                image.src = objectUrl;

                try {
                    await image.decode();
                } finally {
                    URL.revokeObjectURL(objectUrl);
                }

                return image;
            }

            case 'blob':
                return response.blob();

            case 'arrayBuffer':
                return response.arrayBuffer();

            default:
                throw new Error(`Unsupported resource type: ${type}`);
        }
    }
}