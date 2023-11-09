(() => {
  /**
   * Defines an Alpml web component to be used in another HTML document
   * @param {string} name - the hyphenated name of the component to be created
   * @param {string} source - the template source code for the component
   */
  const defineComponent = (name, source = "") => {
    const componentName = name;
    const template = parseTemplate(source);

    const component = class extends HTMLElement {
      static observedAttributes = [...template.props];

      constructor() {
        self = super();
        self.isInitialized = false;
        self.displayNode = undefined;
        self.template = { ...template };
        self.state = {
          $key: `${Math.random()}`,
        };
      }

      connectedCallback() {
        self.displayNode = render(
          self.parentNode,
          self.displayNode,
          self.template,
          self.state,
        );
        self.dispatchEvent(new Event("initialized"));
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

          self.displayNode = render(
            self.parentNode,
            self.displayNode,
            self.template,
            self.state,
          );
          self.dispatchEvent(new Event("attributesUpdated"));
        }
      }
    };

    // Register the component
    window.customElements.define(`${componentName}`, component);
  };

  /**
   * Initializes Alpml
   */
  const init = () => {
    const componentsSelector = "object[type='text/x-alpml']";
    const componentsLoadedEvent = "componentsLoaded";
    const alpineJsUrl =
      "https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js";

    mountAlpineScriptNode(alpineJsUrl);
    attachComponentsLoadedEvent(
      alpineJsUrl,
      componentsSelector,
      componentsLoadedEvent,
    );

    document.addEventListener(componentsLoadedEvent, () => {
      initializeWebComponents(componentsSelector);
    });
  };

  /**
   * Mounts the script that loads alpine.js
   * @param {string} alpineJsUrl - the URL to the alpine.js file
   */
  function mountAlpineScriptNode(alpineJsUrl) {
    const headNode = document.getElementsByTagName("head")[0];

    window.isAlpineLoaded = false;
    const alpineScript = document.createElement("script");
    alpineScript.setAttribute("src", alpineJsUrl);
    alpineScript.setAttribute("defer", "true");
    alpineScript.addEventListener("load", () => {
      window.isAlpineLoaded = true;
    });

    headNode.appendChild(alpineScript);
  }

  /**
   * Attaches the 'componentsLoaded' to the components that have been declared
   *
   * @param {string} alpineJsUrl - the URL to alpine.js
   * @param {string} componentsSelector - the css selector for selecting all component declarations
   * @param {string} eventName - the name of the event to attach
   */
  function attachComponentsLoadedEvent(
    alpineJsUrl,
    componentsSelector,
    eventName,
  ) {
    const nodes = document.querySelectorAll(componentsSelector);
    window.unloadedComponents = nodes.length;

    nodes.forEach((node) => {
      node.addEventListener("load", () => {
        window.unloadedComponents -= 1;
        const isLoadingComplete = window.unloadedComponents <= 0;

        if (isLoadingComplete) {
          window.isAlpineLoaded && document.dispatchEvent(new Event(eventName));

          const alpineNode = document.querySelector(
            `script[src='${alpineJsUrl}']`,
          );
          alpineNode?.addEventListener("load", () => {
            document.dispatchEvent(new Event(eventName));
          });
        }
      });
    });
  }

  /**
   * Initializes web components on the page
   *
   * @param {string} componentsSelector - the css selector of all web components' declarations
   */
  function initializeWebComponents(componentsSelector) {
    const nodes = document.querySelectorAll(componentsSelector);

    nodes.forEach((node) => {
      const name = node.getAttribute("is") || "";
      if (!name.includes("-")) {
        throw TypeError(
          `An 'is' attribute with a hyphenated value is required`,
        );
      }

      // initialize web components
      const templates = node.contentDocument?.getElementsByTagName("pre");
      const source = templates && templates[0].innerText;
      source && defineComponent(name, source);
      const parentElement = node.parentElement;
      parentElement.removeChild(node);

      // rerender all web of the given name components
      const webComponentNodes = document.getElementsByTagName(name);
      for (const v of webComponentNodes) {
        v.parentElement.replaceChild(v, v);
      }
      console.log("loaded component ", node.getAttribute("is"));
    });
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
    node.dataset.key = state["$key"];
    isParentWebComponent = parentNode.tagName.includes("-");

    if (displayNode) {
      displayNode.replaceWith(node);
      return node;
    }

    if (isParentWebComponent) {
      // attempt synchronous insert if displayNode is initialized
      parentNode.displayNode && insertChildNode(parentNode, node);
      // or just do it asynchronously, i.e. when parent is initialized
      parentNode.addEventListener("initialized", (event) =>
        insertChildNode(event.target, node),
      );
      return node;
    }

    parentNode.appendChild(node);
    return node;
  }

  /**
   * Inserts a given node into the position left for children in the template
   *
   * @param {Element} parentNode - the parent node that is also a web component
   * @param {Element} node - the node to insert in the right position
   */
  function insertChildNode(parentNode, node) {
    try {
      const parentKey = parentNode.state["$key"];
      const selector = `[data-alp-kids="${parentKey}"]`;
      const nodes = parentNode.displayNode.querySelectorAll(selector);
      const lastNode = nodes[nodes.length - 1];
      lastNode && lastNode.after(node);
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Replaces some variables in the html string with the variables in the context
   * @param {string} htmlStr - the html string to interpolate
   * @param {{[key: string], any}} context - the context in which interpolation is done
   * @returns {string} - the interpolated string
   */
  function interpolateHTML(htmlStr, context) {
    const childPlaceholder = `<div data-alp-kids='${context["$key"]}' style='display: none;'></div>`;
    let result = "";
    const matches = htmlStr.matchAll(/\$\{(\s*)?([a-zA-Z0-9_]*)(\s*)?\}/g);
    let cursor = 0;

    for (const match of matches) {
      result += htmlStr.slice(cursor, match.index);
      cursor = match.index + match[0].length;
      const key = match[2];
      const value = key === "children" ? childPlaceholder : context[key] || "";
      result += `${value}`;
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
    const openingTag = rawOpeningTag
      .trim()
      .split(" ")[0]
      .replaceAll(/<|>|\s|\//g, "");

    if (openingTag !== closingTag) {
      throw TypeError(
        `malformed template, opening and closing tags, '${openingTag}' and '${closingTag}' don't match`,
      );
    }

    if (!openingTag) {
      throw TypeError(`template missing a root tag, '${templateStr}'`);
    }

    // It was theoretically possible to enter long recursion, thus need for level-guard
    if (openingTag === "template" && level < 1) {
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
      return propsString.split(",").map((v) => v.trim());
    }

    return [];
  }

  // initialize alpine
  init();
})();
