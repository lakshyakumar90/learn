import { CodeRunner } from "@/components/blocks/server-blocks";

// Placeholder: rewritten with the full component gallery in Step 2.
export const metadata = {
  title: "JavaScript component checks",
  robots: { index: false, follow: false },
};

export default function KitchenSink() {
  return (
    <main className="mx-auto max-w-4xl space-y-8 p-4">
      <h1 className="text-3xl font-semibold">JavaScript component checks</h1>
      <CodeRunner title="Console token check" expect="8">
{`const cart = { price: 4, quantity: 2 };
console.log(cart.price * cart.quantity);`}
      </CodeRunner>
    </main>
  );
}
