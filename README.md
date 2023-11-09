# alpml

![CI](https://github.com/sopherapps/alpml/actions/workflows/ci.yml/badge.svg)

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

## How to Use

- Define your component(s), each in their own '.hbs' file.

```html
<!--main.hbs-->
<template props="initial,children">
  <div data-cy-main="${initial}">
    <h2>Counter</h2>
    <div data-cy-content="" x-data="{ count: ${initial} }">
      <button x-on:click="count++">Increment</button>
      ${children}
      <span x-text="count"></span>
    </div>
  </div>
</template>
```

```html
<!--card.hbs-->
<template props="name">
  <div data-cy-card="${name}">
    <h3>Person</h3>
    <p>My name is ${name}</p>
  </div>
</template>
```

- Create an html file, say `index.html` and add the alpml.js script to it

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Alpml</title>

    <!--Declare your components -->
    <!-- the 'is' attribute specifies the name of the component. It must have at least one hyphen (-)-->
    <object is="person-card" type="text/x-alpml" data="./card.hbs"></object>
    <object is="my-main" type="text/x-alpml" data="./main.hbs"></object>

    <!--/Components-->

    <!--alpml.js after components but before the body-->
    <script src="https://cdn.jsdelivr.net/gh/sopherapps/alpml@v0.0.1/dist/alpml.min.js"></script>
  </head>

  <body>
    <!--use your components, passing any props basing on your templates-->
    <my-main initial="50">
      <!-- nesting is possible -->
      <person-card name="Ruth"></person-card>
    </my-main>

    <div>
      <h2>Other cards</h2>
      <person-card name="Jane"></person-card>
      <person-card name="Aguma"></person-card>
      <person-card name="Peter"></person-card>
    </div>
  </body>
</html>
```

- Serve your html file as you would serve any static file. (e.g. with [parcel](https://parceljs.org/) `parcel index.html --port 3000`)

- See the [examples](./examples/) folder for more examples.

## Contributions

Contributions are welcome. The docs have to maintained, the code has to be made cleaner, more idiomatic and faster,
and there might be need for someone else to take over this repo in case I move on to other things. It happens!

When you are ready, look at the [CONTRIBUTIONS GUIDELINES](./CONTRIBUTING.md)

## License

Copyright (c) 2020 [Martin Ahindura](https://github.com/Tinitto)

Licensed under the [MIT License](./LICENSE)

## Acknowledgements

- [Alpine.js](https://alpinejs.dev/) is at the core of this little framework. Thanks to Caleb Porzio and contributors.

## Gratitude

> "What is more, I consider everything a loss because of the surpassing worth of knowing Christ Jesus
> my Lord, for whose sake I have lost all things"
>
> -- Philippians 3: 8

All glory be to God

<a href="https://www.buymeacoffee.com/martinahinJ" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>
