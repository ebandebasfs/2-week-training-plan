/**
 * Day 3 — JS Runtime II: Closures, `this` & Runtime Validation
 *
 * Three parts:
 *   1. A booking-counter factory built with closures.
 *   2. `this` breaking inside a callback, fixed three ways.
 *   3. Runtime validation at the boundary (type-erasure gap).
 */

// ── Part 1: Closure-based booking-counter factory ───────────────────────

function createBookingCounter(seedCount = 0) {
  if (!Number.isInteger(seedCount) || seedCount < 0) {
    throw new Error(`Invalid seed count: ${seedCount}`);
  }

  let counter = seedCount;

  return {
    increment: () => counter += 1,
    reset: () => counter = 0,
    getCount: () => counter
  };
}

function demonstrateClosures() {
  const counter1 = createBookingCounter();
  const counter2 = createBookingCounter();

  counter1.increment();
  counter1.increment();

  counter2.increment();

  console.log("Accessing Counter1 counter: ", counter1.counter);
  console.log("Accessing Counter2 counter: ", counter2.counter);
  console.log("Counter1: ", counter1.getCount());
  console.log("Counter2: ", counter2.getCount());
}

// ── Part 2: `this` breaking in a callback ────────────────────────────────

class BookingCounter {
  constructor() {
    this.count = 0;
  }

  increment() {
    this.count++;
  }

  // Added for the static fix
  static increment(count) {
    return count + 1;
  }
}

function demonstrateAttachedThis() {
  const bc = new BookingCounter();

  bc.increment();
  console.log("Attached call works: ", bc.count);
}

function demonstrateBrokenThis() {
  const bc = new BookingCounter();
  const detachIncrement = bc.increment;

  try {
    detachIncrement();
  } catch (err) {
    console.log("Detach call broke: ", err.message);
  }
}

// ── Fix 1: .bind() ────────────────────────────────────────────────────────

function fixWithBind() {
  const bcFixedWithBind = new BookingCounter();
  const bindIncrement = bcFixedWithBind.increment.bind(bcFixedWithBind);

  bindIncrement();
  bindIncrement();

  console.log("Count: ", bcFixedWithBind.count);
}

// ── Fix 2: arrow function ─────────────────────────────────────────────────

function fixWithArrowFunction() {
  const bcArrowFix = new BookingCounter();
  const arrowIncrement = () => bcArrowFix.increment();

  arrowIncrement();

  console.log(bcArrowFix.count);
}

// ── Fix 3: static method ───────────────────────────────────────────────────

function fixWithStaticMethod() {
  let count = 0;

  count = BookingCounter.increment(count);
  count = BookingCounter.increment(count);

  console.log("Count: ", count);
}

// ── Part 3: Runtime validation at the boundary ────────────────────────────

function demonstrateRuntimeValidation() {
  try {
    createBookingCounter("5"); // looks like a number, isn't one
  } catch (err) {
    console.log("Rejected bad seed:", err.message);
  }

  try {
    createBookingCounter(-3); // wrong shape entirely
  } catch (err) {
    console.log("Rejected bad seed:", err.message);
  }

  const good = createBookingCounter(10);
  console.log("Accepted valid seed, count:", good.getCount());
}

function main() {
  console.log("Part 1: closure-based counter");
  demonstrateClosures();

  console.log("\n=====================\n");

  demonstrateAttachedThis();

  console.log("\nPart 2: broken `this`");
  demonstrateBrokenThis();

  console.log("\nFix 1: .bind()");
  fixWithBind();

  console.log("\nFix 2: arrow function");
  fixWithArrowFunction();

  console.log("\nFix 3: static method");
  fixWithStaticMethod();

  console.log("\n=====================\n");

  console.log("Runtime validation at the boundary");
  demonstrateRuntimeValidation();
}

main();

/**
 * EXPECTED OUTPUT:
 *   Part 1: closure-based counter
 *   Accessing Counter1 counter:  undefined
 *   Accessing Counter2 counter:  undefined
 *   Counter1:  2
 *   Counter2:  1
 *
 *   Attached call works:  1
 *   Part 2: broken `this`
 *   Detach call broke:  Cannot read properties of undefined (reading 'count')
 *
 *   Fix 1: .bind()
 *   Count:  2
 *
 *   Fix 2: arrow function
 *   1
 *
 *   Fix 3: static method
 *   Count:  2
 *
 *   Runtime validation at the boundary
 *   Rejected bad seed: Invalid seed count: 5
 *   Rejected bad seed: Invalid seed count: -3
 *   Accepted valid seed, count: 10
 *
 * WHY `this` BREAKS IN A CALLBACK:
 *   `this` is resolved at call time based on how a function is invoked, not
 *   where it's defined. Calling `bc.increment()` sets `this` to `bc`, so it
 *   works. Pulling the same function out — `const detachIncrement =
 *   bc.increment` — and calling it bare removes the object from the call
 *   site, so `this` is `undefined` and `this.count++` throws.
 *
 * THREE FIXES, ONE SENTENCE EACH:
 *   .bind()        — returns a new function with `this` permanently locked
 *                    to the object passed in at creation time, so it works
 *                    no matter how it's later called.
 *   arrow function — never relies on `this` at all; it closes over the
 *                    counter variable by name, so there's no receiver for
 *                    a missing `this` to break.
 *   static method  — sidesteps the problem entirely by not reading state
 *                    off `this` at all — the count is passed in and
 *                    returned explicitly instead.
 *
 * RUNTIME VALIDATION / TYPE ERASURE:
 *   TypeScript types are stripped completely at compile time and give no
 *   protection at runtime — a `: number` parameter would still accept a
 *   string like "5" or a negative count that survived compilation looking
 *   correctly typed. The guard in createBookingCounter() catches exactly
 *   that gap, rejecting anything that isn't a real non-negative integer
 *   before it's ever trusted.
 */
