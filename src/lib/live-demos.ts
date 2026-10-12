export type DemoId =
  "freeze" | "closure" | "debounce" | "bubbling" | "stale" | "leak";
const button = (id: string, label: string) =>
  `<button id="${id}">${label}</button>`;
export const demos: Record<
  DemoId,
  { title: string; html: string; js: string; css: string }
> = {
  freeze: {
    title: "Process 10,000 rows without losing the spinner",
    html:
      '<div class="spinner" aria-label="Loading indicator"></div>' +
      button("block", "Block") +
      button("chunk", "Chunk") +
      button("worker", "Worker") +
      '<p id="status" role="status">Ready: 10,000 rows</p>',
    css: ".spinner{width:24px;height:24px;border:4px solid #d6d3d1;border-top-color:#4f46e5;border-radius:50%;animation:spin .6s linear infinite;margin:12px}@keyframes spin{to{transform:rotate(360deg)}}@media(prefers-reduced-motion:reduce){.spinner{animation:none}}",
    js: `const status = document.querySelector("#status");
const rows = Array.from({ length: 10000 }, (_, index) => index);
function process(rows) {
  let total = 0;
  for (const row of rows) {
    for (let pass = 0; pass < 3000; pass++) total += Math.sqrt(row + pass);
  }
  return Math.round(total);
}
document.querySelector("#block").onclick = () => {
  status.textContent = "Working…";
  const result = process(rows);
  status.textContent = "Blocked: " + result;
};
document.querySelector("#chunk").onclick = async () => {
  let total = 0;
  for (let start = 0; start < rows.length; start += 100) {
    total += process(rows.slice(start, start + 100));
    status.textContent = "Processed " + Math.min(start + 100, rows.length);
    await sleep(0);
  }
  status.textContent = "Chunked: " + total;
};
document.querySelector("#worker").onclick = () => {
  const source = process.toString() + ";onmessage = e => postMessage(process(e.data));";
  const url = URL.createObjectURL(new Blob([source], { type: "text/javascript" }));
  const worker = new Worker(url);
  worker.onmessage = event => {
    status.textContent = "Worker: " + event.data;
    worker.terminate();
    URL.revokeObjectURL(url);
  };
  worker.postMessage(rows);
  status.textContent = "Worker started";
};`,
  },
  closure: {
    title: "Two carts, two private counts",
    html:
      button("mode", "Fix: separate the carts") +
      button("first", "Add to first cart") +
      button("second", "Add to second cart") +
      '<p id="status" role="status">First: 0 · Second: 0</p>',
    css: "",
    js: `function makeCart() {
  let count = 0;
  return () => ++count;
}
let first = makeCart();
let second = first;
document.querySelector("#mode").onclick = () => {
  first = makeCart();
  second = makeCart();
  firstCount = 0;
  secondCount = 0;
  render();
  document.querySelector("#mode").textContent = "Fixed: independent carts";
};
let firstCount = 0;
let secondCount = 0;
function render() {
  document.querySelector("#status").textContent = "First: " + firstCount + " · Second: " + secondCount;
}
document.querySelector("#first").onclick = () => { firstCount = first(); if (first === second) secondCount = firstCount; render(); };
document.querySelector("#second").onclick = () => { secondCount = second(); if (first === second) firstCount = secondCount; render(); };`,
  },
  debounce: {
    title: "Type, wait, then search",
    html: '<label>Search <input id="query" autocomplete="off"></label><p id="status" role="status">Waiting for input</p><ol id="timeline"></ol>',
    css: "",
    js: `let timer;
let searches = 0;
document.querySelector("#query").addEventListener("input", event => {
  const query = event.target.value;
  const entry = document.createElement("li");
  entry.textContent = "Key: " + query;
  document.querySelector("#timeline").append(entry);
  clearTimeout(timer);
  timer = setTimeout(() => {
    searches++;
    document.querySelector("#status").textContent = "Search " + searches + ": " + query;
    entry.textContent += " → search after 250ms of quiet";
  }, 250);
});`,
  },
  bubbling: {
    title: "One click, nested listeners",
    html: '<div id="outer">Outer box<div id="inner">Inner box<button id="target">Click target</button></div></div><p id="status" role="status">Click the target</p>',
    css: "#outer,#inner{padding:12px;border:1px solid #4f46e5}",
    js: `const events = [];
for (const id of ["target", "inner", "outer"]) {
  document.querySelector("#" + id).addEventListener("click", event => {
    if (id === "target") events.length = 0;
    events.push(id);
    document.querySelector("#status").textContent = events.join(" → ");
    console.log(event.target.id, event.currentTarget.id);
  });
}`,
  },
  stale: {
    title: "Schedule a receipt, then change the total",
    html:
      button("schedule", "Schedule receipt") +
      button("add", "Add £5") +
      '<p id="total">Cart: £10</p><p id="status" role="status">Ready</p>',
    css: "",
    js: `let total = 10;
document.querySelector("#add").onclick = () => {
  total += 5;
  document.querySelector("#total").textContent = "Cart: £" + total;
};
document.querySelector("#schedule").onclick = () => {
  const snapshot = total;
  document.querySelector("#status").textContent = "Add an item within one second";
  setTimeout(() => {
    document.querySelector("#status").textContent = "Snapshot: £" + snapshot + "; current: £" + total;
  }, 1000);
};`,
  },
  leak: {
    title: "Mount listeners, then release them",
    html:
      button("mount", "Mount view") +
      button("clean", "Unmount with cleanup") +
      button("ping", "Dispatch event") +
      '<p id="status" role="status">Active listeners: 0</p>',
    css: "",
    js: `const cleanups = [];
let calls = 0;
const status = document.querySelector("#status");
document.querySelector("#mount").onclick = () => {
  const view = { rows: Array.from({ length: 1000 }, (_, index) => index) };
  const listener = () => { calls++; console.log(view.rows.length); };
  window.addEventListener("cart-refresh", listener);
  cleanups.push(() => window.removeEventListener("cart-refresh", listener));
  status.textContent = "Active listeners: " + cleanups.length;
};
document.querySelector("#clean").onclick = () => {
  for (const cleanup of cleanups) cleanup();
  cleanups.length = 0;
  status.textContent = "Active listeners: 0";
};
document.querySelector("#ping").onclick = () => {
  calls = 0;
  window.dispatchEvent(new Event("cart-refresh"));
  status.textContent = "Calls: " + calls;
};`,
  },
};
