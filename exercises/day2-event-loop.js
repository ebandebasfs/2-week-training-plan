/**
 * Day 2 — JS Runtime I: Event Loop, Microtasks and Macrotasks
 *
 * Three functions, each scheduling a callback a different way. Called in the
 * order setTimeout -> Promise.then -> queueMicrotask, but that is NOT the
 * order they log in.
 */

function logWithSetTimeout() {
  setTimeout(() => {
    console.log("4");
  }, 0);
}

function logWithPromiseThen() {
  Promise.resolve().then(() => {
    console.log("2");
  });
}

function logWithQueueMicrotask() {
  queueMicrotask(() => {
    console.log("3");
  });
}

function main() {
  console.log("1");

  logWithSetTimeout();
  logWithPromiseThen();
  logWithQueueMicrotask();

  console.log("1b");
}

main();

/**
 * EXPECTED OUTPUT:
 *
 *   1      // synchronous code
 *   1b     // synchronous code
 *   2.     // Promise.then callback (microtask queue)
 *   3.     // queueMicrotask callback (microtask queue)
 *   4.     // setTimeout callback (macrotask queue)
 *
 * WHY THIS SURPRISES A JUNIOR
 * ----------------------------
 * setTimeout(fn, 0) does NOT mean "run in 0ms" — it means "run on the
 * NEXT macrotask, after the current call stack is empty AND after the
 * microtask queue is fully drained." The event loop's contract is:
 *
 *   1. Run all synchronous code on the call stack to completion.
 *   2. Drain the ENTIRE microtask queue (Promise callbacks, queueMicrotask,
 *      async/await continuations).
 *   3. Only then run ONE macrotask (setTimeout, setInterval, I/O).
 *   4. Repeat from step 2.
 *
 * So even though logWithSetTimeout() was CALLED first, its callback is
 * a macrotask and has to wait for every microtask to finish first —
 * that's why "4" prints last despite the 0ms delay.
 *
 * Promise.then and queueMicrotask both go on the SAME microtask queue,
 * so between those two, ordinary FIFO applies: whichever was scheduled
 * first runs first (that's why "2" beats "3").
 */
