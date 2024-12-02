# Tiny Signals TS

The tiniest implementation of signals, ideal for Typescript projects.

Typescript implementation of [tiny-signals](https://github.com/jsebrech/tiny-signals) with small additional features.

## Usage

Copy `signals.ts` into your project.

Use it like this:

```js
import { signal, computed, effect } from './signals.ts';

const name = signal('Jane');
const surname = signal('Doe');
const fullName = computed(() => `${name} ${surname}`, [name, surname]);

// Watch a signal for changes and execute a function:
fullName.effect(() => console.log(fullName.value));
// -> Jane Doe

// Watch multiple signals at once for changes:
effect([name, surname], () => console.log(`${name} ${surname}`));
// -> Jane Doe

// Updating `name` updates `fullName`, which triggers the effects again:
name.value = 'John';
// -> John Doe
```

## API:

- `const mySignal = signal(val)`: creates a signal.
- `mySignal.value`: get or set the signal's value
- `const dispose = mySignal.effect(fn)`: call the function every time the signal's value changes, also call it initially. The `dispose()` function unregisters the effect from the signal.
- `const dispose = effect([signal1, signal2], fn)`: call the function every time one of the signal's value changes, also call it initially. The `dispose()` function unregisters the effect from the signal.
- `const result = computed(() => 'hello ' + mySignal.value, [mySignal])`: create a signal that is computed from other signals and values by a function,
  and will automatically update when the value of a dependency changes
- `mySignal.addEventListener('change', fn)`: subscribe to changes without calling the function initially
