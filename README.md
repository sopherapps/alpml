# alpml

A Javascript framework without need for bundlers, based on Alpine.js

## Challenge

- Can we import HTML sections into other HTML documents so that HTML is composible?
- Can we have reactiviy without the huffs and puffs of the virtualDOM?
- Can we have simple custom web components used in HTML?

## Potential Solutions

- Use [handlebars](https://handlebarsjs.com/) to read templates into [Web Components](https://developer.mozilla.org/en-US/docs/Web/API/Web_components), which in turn can accept all the attributes, properties and methods of [Alpine.js](https://alpinejs.dev/). And use the `<link rel='preload' as='object' data-alpml type='text/html' data='/path/to/component.html' />` or `<object type='text/html' data='/path/to/component.html' />`

## Note

- Every alpml component is automatically prefixed with 'alp-' e.g. `alp-sidebar`