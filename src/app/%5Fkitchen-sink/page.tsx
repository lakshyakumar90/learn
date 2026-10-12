import {
  CodeBlock,
  CodeRunner,
  Exercise,
  Predict,
  ScenarioPlayer,
} from "@/components/blocks/server-blocks";
import { Diagram } from "@/components/Diagram";
import { highlight } from "@/lib/code/highlight";
import { HighlightedCode } from "@/components/blocks/HighlightedCode";

// Hidden gallery for build and browser checks (not in any sidebar).
// Mirrors every block the JavaScript topic uses.
export const metadata = {
  title: "JavaScript component checks",
  robots: { index: false, follow: false },
};

const staticCode = `// A cart with a named operation.
const cart = { price: 4, quantity: 2 };
function total(item) {
  return item.price * item.quantity;
}
console.log(total(cart));`;

const runnerCode = `const cart = { price: 4, quantity: 2 };
console.log(cart.price * cart.quantity);`;

const domJs = `document.querySelector("#status").textContent = "DOM ready";
console.log("DOM ready");`;

export default async function KitchenSink() {
  return (
    <main className="mx-auto max-w-4xl space-y-8 p-4">
      <h1 className="text-3xl font-semibold">JavaScript component checks</h1>
      <div data-static-code>
        <HighlightedCode
          html={await highlight(staticCode)}
          code={staticCode}
          numbered
        />
      </div>
      <CodeBlock>{staticCode}</CodeBlock>
      <CodeRunner title="Console token check" expect="8">
        {runnerCode}
      </CodeRunner>
      <CodeRunner
        env="dom"
        title="DOM smoke check"
        html='<p id="status">Ready</p>'
        css="p { color: #0550ae; }"
      >
        {domJs}
      </CodeRunner>
      <Exercise
        title="Repair the cart"
        tests={'assert(quantity === 2, "two items");'}
        solution={"const quantity = 2;"}
      >
        {"const quantity = 1;"}
      </Exercise>
      <Predict
        title="Cart total"
        answerLines="8"
        explanation="Two items at four each is eight."
      >
        {runnerCode}
      </Predict>
      <ScenarioPlayer scenario="event-loop-micro-vs-macro" />
      <Diagram id="js-runtime" />
    </main>
  );
}
