# tslint-import-rules
Set of TSLint rules that help validate proper imports.

[![Build Status](https://secure.travis-ci.org/webschik/tslint-import-rules.png?branch=master)](https://travis-ci.org/webschik/tslint-import-rules)
[![npm](https://img.shields.io/npm/dm/tslint-import-rules.svg)](https://www.npmjs.com/package/tslint-import-rules)
[![npm](https://img.shields.io/npm/v/tslint-import-rules.svg)](https://www.npmjs.com/package/tslint-import-rules)
[![npm](https://img.shields.io/npm/l/tslint-import-rules.svg)](https://www.npmjs.com/package/tslint-import-rules)

Inspired by [eslint-plugin-import](https://github.com/benmosher/eslint-plugin-import)

## How to use
* Install package:
```
npm i --save-dev tslint-import-rules
```

* Update your tslint.json:

```json
{
  "rulesDirectory": ["node_modules/tslint-import-rules/dist/rules"]
}
```

## Rules
All rules start from the prefix `tir-` (TSLint Import Rules) to prevent name collisions.

### `tir-no-empty-line-between-imports`
Prevents having empty lines between import declarations.

#### Valid
```js
import * as bar from 'bar';
import * as foo from 'foo';

const FOO = 'BAR';
```


#### Invalid
```js
import * as bar from 'bar';

import * as foo from 'foo';

const FOO = 'BAR';
```

### `tir-newline-after-import`
Enforces having one or more empty lines after the last top-level import statement.
This rule has one option, `count` which sets the number of newlines that are enforced after the last top-level import statement or require call.
This option defaults to 1.

### Usage
#### Disable empty lines after import
```json
    {
      "tir-newline-after-import": [true, "never"]
    }
```

**Valid:**
```js
import * as bar from 'bar';
import * as foo from 'foo';
const FOO = 'BAR';
```

**Invalid:**
```js
import * as bar from 'bar';
import * as foo from 'foo';

const FOO = 'BAR';
```

#### Force 1 empty line after import
```json
    {
      "tir-newline-after-import": [true]
    }
```

**Valid:**
```js
import * as bar from 'bar';
import * as foo from 'foo';

const FOO = 'BAR';
```

**Invalid:**
```js
import * as bar from 'bar';
import * as foo from 'foo';
const FOO = 'BAR';
```

```js
import * as bar from 'bar';
import * as foo from 'foo';


const FOO = 'BAR';
```

#### Force 3 empty lines after import
```json
    {
      "tir-newline-after-import": [true, "always", {"count": 3}]
    }
```

**Valid:**
```js
import * as bar from 'bar';
import * as foo from 'foo';



const FOO = 'BAR';
```
