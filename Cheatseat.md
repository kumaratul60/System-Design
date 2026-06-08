# Browser JavaScript Cheat Sheet

---

# window

Global object in browser.

```js
console.log(window);
```

## Common APIs

```js
window.alert('Hello');

window.location.href;

window.localStorage;

window.setTimeout(() => {}, 1000);

window.setInterval(() => {}, 1000);
```

## Use Cases

- Browser APIs
- Navigation
- Storage
- Timers
- Global variables

---

# document

Represents the entire HTML document (DOM).

```js
console.log(document);
```

## Common APIs

```js
document.querySelector('.btn');

document.getElementById('app');

document.createElement('div');

document.title = 'Dashboard';
```

## Use Cases

- Find elements
- Create elements
- Manipulate DOM

---

# document.body

Represents `<body>` element.

```js
console.log(document.body);
```

## Examples

```js
document.body.classList.add('dark');

document.body.style.overflow = 'hidden';

document.body.appendChild(modal);
```

## Use Cases

- Global styles
- Modals
- Disable page scrolling

---

# document.documentElement

Represents `<html>` element.

```js
console.log(document.documentElement);
```

## Examples

```js
document.documentElement.scrollHeight;
document.documentElement.clientHeight;
```

## Use Cases

- Page measurements
- Scroll calculations

---

# this

Current execution context.

---

## Object

```js
const user = {
  name: 'Deval',

  greet() {
    console.log(this.name);
  },
};

user.greet();
```

### Output

```txt
Deval
```

---

## Function

```js
function test() {
  console.log(this);
}

test();
```

### Browser

```js
window;
```

### Strict Mode

```js
'use strict';

function test() {
  console.log(this);
}

test();
```

### Output

```txt
undefined
```

---

## Arrow Function

```js
const user = {
  name: 'Deval',

  greet() {
    const print = () => {
      console.log(this.name);
    };

    print();
  },
};
```

### Notes

Arrow functions do NOT have their own `this`.

They inherit from parent scope.

---

# event

Contains information about triggered event.

```js
button.addEventListener('click', (event) => {
  console.log(event);
});
```

## Common Properties

```js
event.target;

event.currentTarget;

event.type;

event.key;

event.clientX;

event.clientY;
```

## Common Methods

```js
event.preventDefault();

event.stopPropagation();
```

---

# event.target

Actual element that triggered event.

```html
<div id="parent">
  <button>Delete</button>
</div>
```

```js
parent.addEventListener('click', (e) => {
  console.log(e.target);
});
```

### Click button

```txt
button
```

---

# event.currentTarget

Element where listener is attached.

```js
parent.addEventListener('click', (e) => {
  console.log(e.currentTarget);
});
```

### Output

```txt
parent
```

---

# location

Current URL information.

```js
console.log(location);
```

## Examples

```js
location.href;

location.pathname;

location.search;

location.reload();
```

## Use Cases

- Routing
- Query params
- Redirects

---

# history

Browser history stack.

```js
history.back();

history.forward();

history.go(-1);
```

## Use Cases

- SPA navigation
- Back button support

---

# navigator

Browser/device information.

```js
console.log(navigator);
```

## Examples

```js
navigator.userAgent;

navigator.language;

navigator.clipboard.writeText('Copied');

navigator.geolocation.getCurrentPosition(...);
```

---

# localStorage

Persistent browser storage.

```js
localStorage.setItem('theme', 'dark');

const theme = localStorage.getItem('theme');
```

## Use Cases

- Theme
- Preferences
- Cache

---

# sessionStorage

Storage until tab closes.

```js
sessionStorage.setItem('step', '2');
```

---

# console

Debugging APIs.

```js
console.log(data);

console.table(users);

console.time('api');

console.timeEnd('api');
```

---

# fetch

HTTP requests.

```js
const response = await fetch('/api/users');

const data = await response.json();
```

## Use Cases

- REST APIs
- Backend communication

---

# URL

Safe URL parsing.

```js
const url = new URL(window.location.href);

url.searchParams.get('id');
```

## Example

```txt
/products?id=10
```

```js
url.searchParams.get('id');
```

### Output

```txt
10
```

---

# Timers

## setTimeout

Run once.

```js
setTimeout(() => {
  console.log('Done');
}, 1000);
```

---

## clearTimeout

```js
const id = setTimeout(fn, 1000);

clearTimeout(id);
```

---

## setInterval

Run repeatedly.

```js
const id = setInterval(() => {
  console.log('Tick');
}, 1000);
```

---

## clearInterval

```js
clearInterval(id);
```

---

# Scroll APIs

## Current Vertical Scroll

```js
window.scrollY;
```

---

## Current Horizontal Scroll

```js
window.scrollX;
```

---

## Viewport Height

```js
window.innerHeight;
```

Visible screen height.

---

## Viewport Width

```js
window.innerWidth;
```

Visible screen width.

---

## Total Page Height

```js
document.documentElement.scrollHeight;
```

---

## Visible Page Height

```js
document.documentElement.clientHeight;
```

---

# Detect Bottom Of Page

```js
if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight) {
  console.log('Reached Bottom');
}
```

---

# Infinite Scroll

```js
window.addEventListener('scroll', () => {
  if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 100) {
    loadMoreData();
  }
});
```

---

# Scroll Percentage

```js
const percent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
```

---

# Scroll To Top

```js
window.scrollTo({
  top: 0,
  behavior: 'smooth',
});
```

---

# Scroll To Element

```js
element.scrollIntoView({
  behavior: 'smooth',
});
```

---

# DOM Traversal

## Parent

```js
element.parentElement;
```

## Children

```js
element.children;
```

## First Child

```js
element.firstElementChild;
```

## Next Sibling

```js
element.nextElementSibling;
```

## Closest Parent

```js
element.closest('.card');
```

---

# Event Bubbling

```txt
button
 ↓
parent
 ↓
body
 ↓
document
 ↓
window
```

Example:

```js
button.addEventListener('click', () => console.log('button'));

parent.addEventListener('click', () => console.log('parent'));
```

### Output

```txt
button
parent
```

---

# Event Delegation

```js
table.addEventListener('click', (e) => {
  if (e.target.matches('.delete-btn')) {
    deleteRow();
  }
});
```

## Use Cases

- Large lists
- Dynamic DOM
- Better performance

---

# Measurement Properties

## clientHeight

Visible height including padding.

```js
element.clientHeight;
```

---

## offsetHeight

Visible height + padding + border.

```js
element.offsetHeight;
```

---

## scrollHeight

Entire content height.

```js
element.scrollHeight;
```

---

# Quick Interview Differences

## window vs document vs body

| Object        | Meaning               |
| ------------- | --------------------- |
| window        | Browser global object |
| document      | Entire DOM            |
| document.body | Body element          |

---

## target vs currentTarget

| Property      | Meaning          |
| ------------- | ---------------- |
| target        | Clicked element  |
| currentTarget | Listener element |

---

## Function vs Arrow Function

| Feature     | Function | Arrow |
| ----------- | -------- | ----- |
| Own this    | ✅       | ❌    |
| Constructor | ✅       | ❌    |
| arguments   | ✅       | ❌    |

---

# Most Important Frontend APIs

```js
window;
document;
document.body;
document.documentElement;

this;

event;
event.target;
event.currentTarget;

location;
history;
navigator;

localStorage;
sessionStorage;

fetch;

URL;

setTimeout;
setInterval;

scrollY;
innerHeight;
scrollHeight;

querySelector;
closest;
appendChild;
removeChild;
classList;
```
