# Content Sizer

Measures your page's content "intelligently" in response to any DOM changes and passes the dimensions to your callback function.

## Installation

```sh
npm install ZengineHQ/content-sizer
```

## Usage

```js
import ContentSizer from 'content-sizer'

const updateHandler = dimensions => {
  console.log(dimensions)

  // do whatever you want with the dimensions,
  // like send them to a parent window or maybe
  // just mail them home to mom and dad

  // width and height properties are numbers corresponding to pixel values
  const { width, height } = dimensions
}

const sizer = new ContentSizer(updateHandler)

sizer.autoSize() // the magic has commenced, augment the DOM and the updates will come
```
