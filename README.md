# babel-plugin-transform-system-register

TODO

## Example

**In**

```js
// input code
```

**Out**

```js
"use strict";

// output code
```

## Installation

```sh
$ npm install babel-plugin-transform-system-register
```

## Usage

### Via `.babelrc` (Recommended)

**.babelrc**

```json
{
  "plugins": ["transform-system-register"]
}
```

### Via CLI

```sh
$ babel --plugins transform-system-register script.js
```

### Via Node API

```javascript
require("babel-core").transform("code", {
  plugins: ["transform-system-register"]
});
```
