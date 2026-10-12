import { CodeRunner, Exercise, ScenarioPlayer } from "@/components/blocks/server-blocks";
import { CodeCompare } from "@/components/blocks/Practical";
import { HighlightedCode } from "@/components/blocks/HighlightedCode";
import { LiveDemo } from "@/components/blocks/client-blocks";
import { Storyboard } from "@/components/blocks/Illustration";
import { highlight } from "@/lib/code/highlight";
export const metadata={title:"JavaScript component checks",robots:{index:false,follow:false}};
const code=`// A cart with a named operation.
const cart = { price: 4, quantity: 2 };
function total(item) {
  return item.price * item.quantity;
}
console.log(total(cart));`;
export default async function KitchenSink() {
 return <main className="mx-auto max-w-4xl space-y-8 p-4"><h1 className="text-3xl font-semibold">JavaScript component checks</h1>
 <div data-static-code><HighlightedCode html={await highlight(code)} code={code} numbered/></div>
 <CodeRunner title="Console token check" expect="8">{code}</CodeRunner>
 <CodeRunner env="dom" title="DOM token check" html={'<p id="status">Ready</p>'} css={"p { color: #0550ae; }"}>{'document.querySelector("#status").textContent = "DOM ready";\nconsole.log("DOM ready");'}</CodeRunner>
 <Exercise title="Repair the cart" tests={'assert(quantity === 2, "two items");'} solution={'const quantity = 2;'}>{'const quantity = 1;'}</Exercise>
 <CodeCompare before={'const price = 0;\nconsole.log(price || 10);'} after={'const price = 0;\nconsole.log(price ?? 10);'}/>
 <ScenarioPlayer scenario="event-loop-micro-vs-macro"/>
 {(["freeze","closure","debounce","bubbling","stale","leak"] as const).map(demo=><LiveDemo key={demo} demo={demo}/>)}
 <Storyboard title="Why the page freezes — analogy" ids={["freeze-1","freeze-2","freeze-3"]}/>
 </main>;
}
