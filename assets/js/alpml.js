(() => {

    /**
     * Defines an Alpml web component to be used in another HTML document
     * @param {string} suffix - the suffix of the component to be appended to 'alp-'
     * @param {{[key: string]: any}} props - the default props or state of this component
     * @param {string} source - the template source code for the component
     */
    const defineComponent = (suffix, props, source = '') => {
        const componentName = `alp-${suffix}`;

        const component = class extends HTMLElement {
            static observedAttributes = [...Object.keys(props)];

            constructor() {
                self = super();

                self.isInitialized = false;

                // attach a shadow dom
                self.attachShadow({ mode: "open" });

                // initialize state
                self.state = { ...props }

                // initialize the template
                self.template = window.Handlebars.compile(source);
            }

            /**
             * A WebComponent lifecycle method when component is attached to DOM
             */
            connectedCallback() {
                const shadow = self.shadowRoot;

                // get important global styles and scripts
                const styleNodes = document.getElementsByTagName("style");
                const scriptNodes = document.querySelectorAll("script");

                // copy them to shadow dom
                for (const node of styleNodes) {
                    shadow.appendChild(node.cloneNode());
                }
                for (const node of scriptNodes) {
                    shadow.appendChild(node.cloneNode());
                }

                // render this element
                render(shadow, self.template, self.state);
            }

            /**
             * A WebComponent lifecycle callback when an observed attribute changes
             * 
             * @param {string} name - the name of the attribute that has changed
             * @param {any} oldValue - the old valu of the attribute
             * @param {any} newValue - the new valu of the attribute
             */
            attributeChangedCallback(name, oldValue, newValue) {
                if (oldValue !== newValue) {
                    self.state[name] = newValue;

                    if (!self.isInitialized) {
                        // Ignore the first attempt to render on attribute change
                        // to avoid rendering twice
                        self.isInitialized = true;
                        return;
                    }
                    render(self.shadowRoot, self.template, self.state);
                }
            }
        }

        // Register the component
        window.customElements.define(`${componentName}`, component);
    }

    /**
     * Initializes Alpml
     */
    const init = () => {
        const headNode = document.getElementsByTagName('head')[0];

        // add Alpine.
        const alpineScript = document.createElement('script');
        alpineScript.setAttribute('src', 'https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js');
        alpineScript.setAttribute('defer', 'true');
        headNode.appendChild(alpineScript);

        // add handlebars
        const handlebarsScript = document.createElement('script');
        handlebarsScript.setAttribute('src', 'https://cdnjs.cloudflare.com/ajax/libs/handlebars.js/4.7.8/handlebars.min.js');
        headNode.appendChild(handlebarsScript);

        handlebarsScript.addEventListener('load', () => {
            console.log("loaded handlebars");

            // initialize all components
            const nodes = document.querySelectorAll('[data-alpml][type="text/x-handlebars-template"]');
            nodes.forEach(node => {
                const source = node.contentDocument.getElementsByTagName("pre")[0].innerText;
                const { alpml: suffix, props: propsAsString = "{}" } = node.dataset;
                const props = parseProps(propsAsString);
                defineComponent(suffix, props, source);
                node.parentElement.removeChild(node);
            });

            console.log("loaded components");
        });
    }

    /**
     * Renders a given template on the given shadowRoot
     * 
     * @param {ShadowRoot} shadowRoot - the ShadowRoot to render on
     * @param {Handlebars.Template | undefined} template - the template to render
     * @param {{[key: string]: any}} context - the context in which the template is to be rendered
    */
    function render(shadowRoot, template, context) {
        if (template) {
            const outerHtml = template(context);
            const { openingTag, innerHTML, closingTag } = extractSections(outerHtml);

            if (openingTag !== closingTag) {
                throw TypeError("malformed template, opening and closing tags don't match");
            }

            if (!openingTag) {
                throw TypeError(`template missing a root tag, '${outerHtml}'`)
            }

            const node = document.createElement(openingTag);
            node.innerHTML = innerHTML;

            try {
                shadowRoot.removeChild(shadowRoot.firstChild());
            } catch (error) {
                if (!(error instanceof TypeError)) {
                    throw error;
                }
            }

            shadowRoot.appendChild(node);
        }
    }

    /**
     * Parses the props string got from the data attributes, defaulting to an empty {}
     * 
     * @param {string} propsJSON - the string got from data-props
     * @returns {[key: string]: any}
     */
    function parseProps(propsJSON) {
        try {
            return JSON.parse(propsJSON);
        } catch (error) {
            console.error("error getting props", error)
            return {}
        }
    }

    /**
     * Extracts the sections of the html string i.e. opening tag, closing tag and body
     * @param {string} htmlString - the html string to seach through
     * @returns {{openingTag: string; innerHTML: string; closingTag: string}} - the sections of the HTML string
     */
    function extractSections(htmlString) {
        const positions = [0, 0];

        const openingTagEnd = htmlString.indexOf(">");
        const closingTagStart = htmlString.lastIndexOf("</");

        let openingTag = htmlString.slice(undefined, openingTagEnd);
        const innerHTML = htmlString.slice(openingTagEnd + 1, closingTagStart);
        let closingTag = htmlString.slice(closingTagStart, undefined);

        openingTag = openingTag.replaceAll(/<|>|\s|\//g, "");
        closingTag = closingTag.replaceAll(/<|>|\s|\//g, "");

        return { openingTag, innerHTML, closingTag };
    }

    // initialize alpine
    init();
})();