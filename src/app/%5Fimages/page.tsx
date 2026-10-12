import { imageAssets, Illustration } from "@/components/blocks/Illustration";
export const metadata={title:"JavaScript image contact sheet",robots:{index:false,follow:false}};
export default function Images() {
 return <main className="mx-auto max-w-6xl p-4"><h1 className="text-3xl font-semibold">JavaScript image contact sheet</h1><div className="grid gap-8 md:grid-cols-2">{imageAssets().map(asset=><section key={asset.id}><h2 className="text-xl">{asset.id}</h2><Illustration id={asset.id}/><details><summary>Generation prompt</summary><p className="whitespace-pre-wrap text-sm">{asset.prompt}</p></details></section>)}</div></main>;
}
