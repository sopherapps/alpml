# alpml

A Javascript framework without need for bundlers, based on Alpine.js

## Challenge

- Can we import HTML sections into other HTML documents so that HTML is composible?
- Can we have reactiviy without the huffs and puffs of the virtualDOM?
- Can we have simple custom web components used in HTML?

## Design

- Reactivity without a virtualDOM comes from [Alpine.js](https://alpinejs.dev/).
- We use [Web Components](https://developer.mozilla.org/en-US/docs/Web/API/Web_components) to make reusable custom components. They can define what props they have using the `props` attribute in their `template`s.
- Custom components are loaded into the HTML page using `<object is="component-name" data="path/to/component/template/file" type="text/x-alpml">` tags defined before the `<script src="path/to/alpml.js">` tag that loads alpml in the `<head>` tag.

## Note

- Every alpml component **must** have at least one hyphen (-) in it, as all [Web components should](https://html.spec.whatwg.org/multipage/custom-elements.html#valid-custom-element-name).

## Contributing

- You need to have [nodejs +v16](https://nodejs.org/en/)
- Clone the repository
- Create an issue that you wish to solve
- Make a pull request to fix the given issue

## License

Copyright (c) 2020 [Martin Ahindura](https://github.com/Tinitto)

Licensed under the [MIT License](./LICENSE)
