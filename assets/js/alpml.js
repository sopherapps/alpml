(() => {

    /**
     * Defines an Alpml web component to be used in another HTML document
     * @param {string} suffix - the suffix of the component to be appended to 'alp-'
     * @param {string} source - the template source code for the component
     */
    const defineComponent = (suffix, source = '') => {
        const componentName = `alp-${suffix}`;
        const template = parseTemplate(source);

        const component = class extends HTMLElement {
            static observedAttributes = [...template.props];

            constructor() {
                self = super();
                self.isInitialized = false;
                self.displayNode = undefined;
                self.template = { ...template };
                self.state = {};
            }

            connectedCallback() {
                self.displayNode = render(self.parentNode, self.displayNode, self.template, self.state);
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

                    self.displayNode = render(self.parentNode, self.displayNode, self.template, self.state);
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


        alpineScript.addEventListener('load', () => {
            console.log("loaded alpine.");

            // initialize all components
            const nodes = document.querySelectorAll('object[type="text/x-alpml"]');
            nodes.forEach(node => {
                const suffix = node.getAttribute("is");

                if (suffix) {
                    const source = node.contentDocument.getElementsByTagName("pre")[0].innerText;
                    defineComponent(suffix, source);
                } else {
                    console.error("missing 'is' attribute in ", node);
                }

                // clean up
                node.parentElement.removeChild(node);
            });

            console.log("loaded components.");
        })
    }

    /**
     * Renders a given template on the given shadowRoot
     * 
     * @param {Element} parentNode - the node to which this element is attached
     * @param {Element | undefined} displayNode - the node that actually works with the DOM
     * @param {{openingTag: string; innerHTML: string; closingTag: string; props: string[]}} template - the parsed template to render
     * @param {{[key: string]: any}} state - the current state of affairs
     * @returns {Element} - the new display node, replacing the old one
    */
    function render(parentNode, displayNode, template, state) {
        const { openingTag, innerHTML: rawHTML } = template;
        const innerHTML = interpolateHTML(rawHTML, state);
        const node = document.createElement(openingTag);
        node.innerHTML = innerHTML;

        if (displayNode) {
            displayNode.replaceWith(node);
        } else {
            parentNode.appendChild(node);
        }

        return node;
    }

    /**
     * Replaces some variables in the html string with the variables in the context
     * @param {string} htmlStr - the html string to interpolate
     * @param {{[key: string], any}} context - the context in which interpolation is done
     */
    function interpolateHTML(htmlStr, context) {
        let result = '';
        const matches = htmlStr.matchAll(/\$\{(\s*)?([a-zA-Z0-9_]*)(\s*)?\}/g);
        let cursor = 0;

        for (const match of matches) {
            result += htmlStr.slice(cursor, match.index);
            cursor = match.index + match[0].length;
            const key = match[2];
            result += `${context[key] || ''}`;
        }

        result += htmlStr.slice(cursor);
        return result;
    }


    /**
     * Extracts the sections of the html string i.e. opening tag, closing tag and body
     * @param {string} templateStr - the html string to seach through
     * @param {number} level - the level at which we are starting
     * @returns {{openingTag: string; innerHTML: string; closingTag: string; props: string[]}} - the sections of the HTML string
     */
    function parseTemplate(templateStr, level = 0) {
        const openingTagEnd = templateStr.indexOf(">");
        const closingTagStart = templateStr.lastIndexOf("</");

        const rawOpeningTag = templateStr.slice(undefined, openingTagEnd);
        const innerHTML = templateStr.slice(openingTagEnd + 1, closingTagStart);
        let closingTag = templateStr.slice(closingTagStart, undefined);

        closingTag = closingTag.replaceAll(/<|>|\s|\//g, "");
        // opening tag may have attributes
        const openingTag = rawOpeningTag.trim().split(" ")[0].replaceAll(/<|>|\s|\//g, "");

        if (openingTag !== closingTag) {
            throw TypeError(`malformed template, opening and closing tags, '${openingTag}' and '${closingTag}' don't match`);
        }

        if (!openingTag) {
            throw TypeError(`template missing a root tag, '${templateStr}'`)
        }

        // It was theoretically possible to enter long recursion, thus need for level-guard
        if (openingTag === 'template' && level < 1) {
            const innerTemplate = parseTemplate(innerHTML, level + 1);
            return { ...innerTemplate, props: extractProps(rawOpeningTag) };
        }

        return { openingTag, innerHTML, closingTag, props: [] };
    }

    /**
     * Extracts a list of props from the opening tag of the template
     * 
     * @param {string} templateTag - the <template ...> tag
     * @returns {string[]}
     */
    function extractProps(templateTag) {
        const matches = /props="?'?([a-zA-Z,0-9_\-]*)"?'?/.exec(templateTag) || [];
        const propsString = matches[1];
        if (propsString) {
            return propsString.split(",").map(v => v.trim());
        }

        return [];
    }

    // initialize alpine
    init();
})();