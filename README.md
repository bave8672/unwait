# Unwait

Unwait makes it possible to access the properties and methods of async results before they are resolved, making Promise based APIs simpler and less verbose to work with. For example, with the [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API),

```javascript
fetch("http://example.com/movies.json")
    .then((response) => {
        return response.json();
    })
    .then((movies) => {
        return movies.filter((movie) => movie.starRating === 5);
    })
    .then(/* process good movies */);
```

becomes:

```javascript
unwait(fetch)("http://example.com/movies.json")
    .json()
    .filter((movie) => movie.starRating === 5)
    .then(/* process good movies */);
```

All access to functions, properties and methods will continue to be deferred until all promises in the chain are resolved. Each step in the chain can be `await`ed, `then()`'d or `catch()`ed like a regular `Promise` to recover it's value or handle any errors.

## Installation

`npm install unwait`

## Usage

```javascript
const { unwait } = require("unwait");

const api = unwait(MyAPI);
```

## Dependencies

Unwait uses the [ES6 Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) object. Because promised object properties are not known ahead of time, polyfills such as [es2015-proxy-shim](https://www.npmjs.com/package/es2015-proxy-shim) won't work - your javascript environment must support `Proxy` natively. See the support table [here](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy#Browser_compatibility) for more information.

There are no npm dependencies.

## Contributing

After cloning the repository:

-   `npm ci` to install dependencies
-   `npm run test` to run jest specs
