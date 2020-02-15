# Unwait

Unwait makes it possible to access the properties and methods of async results before they are resolved, making Promise based APIs simpler and less verbose to work with. For example:

```javascript
fetch("http://example.com/movies.json")
    .then((response) => {
        return response.json();
    })
    .then((myJson) => {
        console.log(myJson);
    });
```

becomes:

```javascript
fetch("http://example.com/movies.json")
    .json()
    .then((myJson) => {
        console.log(myJson);
    });
```

All access to properties and methods will continue to be deferred until all promises in the chain are resolved, and each step in the chain can be `await`ed or `then()`'d like a regular `Promise` to recover it's value.

## Installation

`npm install unwait`

## Dependencies

Unwait uses the [ES6 Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) object. Because promised object properties are not known ahead of time, polyfills such as [es2015-proxy-shim](https://www.npmjs.com/package/es2015-proxy-shim) won't work - your javascript environment must support `Proxy` natively. See the support table [here](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy#Browser_compatibility) for more information.

There are no npm dependencies.

## Contributing

After cloning the repository:

-   `npm ci` to install dependencies
-   `npm run test` to run jest specs
