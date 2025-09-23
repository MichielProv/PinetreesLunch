/* app/demo/loaders/page.tsx */
"use client";

import { useState } from "react";
import { ClocheLoader, MugSteamLoader, CutleryPulseLoader, PlateSpinLoader } from "@/components/Loaders";

const COLORS = [
  { name: "Slate", cls: "text-slate-800" },
  { name: "Neutral", cls: "text-neutral-800" },
  { name: "Stone", cls: "text-stone-800" },
  { name: "Emerald", cls: "text-emerald-600" },
  { name: "Orange", cls: "text-orange-600" },
  { name: "Rose", cls: "text-rose-600" },
  { name: "Black", cls: "text-black" },
];

export default function LoadersDemoPage() {
  const [size, setSize] = useState(72);
  const [color, setColor] = useState(COLORS[0].cls);
  const [bg, setBg] = useState(false);

  return (
    <main className="mx-auto max-w-5xl p-6 space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold">Hospitality Loaders</h1>
          <p className="text-sm text-gray-600">Preview and choose the loading animation for your dashboard.</p>
        </div>
        <div className="flex items-center gap-4">
          <label className="text-sm">
            Size: <input type="range" min={40} max={128} value={size} onChange={(e) => setSize(parseInt(e.currentTarget.value, 10))} />
            <span className="ml-2 text-xs text-gray-600 align-middle">{size}px</span>
          </label>
          <label className="text-sm">
            Color:{" "}
            <select className="rounded border p-1 text-sm" value={color} onChange={(e) => setColor(e.currentTarget.value)}>
              {COLORS.map((c) => (
                <option key={c.cls} value={c.cls}>{c.name}</option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={bg} onChange={(e) => setBg(e.currentTarget.checked)} />
            Show subtle backdrop
          </label>
        </div>
      </header>

      <section className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 ${bg ? "p-4 rounded-xl border bg-gray-50" : ""}`}>
        <Card title="Cloche (serving dome)">
          <ClocheLoader className={color} size={size} />
        </Card>
        <Card title="Mug (steam)">
          <MugSteamLoader className={color} size={size} />
        </Card>
        <Card title="Cutlery (pulse)">
          <CutleryPulseLoader className={color} size={size} />
        </Card>
        <Card title="Plate (spinner)">
          <PlateSpinLoader className={color} size={size} />
        </Card>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">How to use</h2>
        <ol className="list-decimal space-y-1 pl-5 text-sm text-gray-700">
          <li>Copy <code>components/Loaders.tsx</code> into your project.</li>
          <li>Import one loader and render it while data is loading.</li>
          <li>Style with Tailwind color classes (the SVGs use <code>currentColor</code>), and adjust <code>size</code> prop.</li>
          <li>Add <code>print:hidden</code> to the wrapper if you don't want loaders to appear on printed pages.</li>
        </ol>
        <pre className="overflow-auto rounded-lg border bg-gray-50 p-3 text-xs"><code>{`import { ClocheLoader } from "@/components/Loaders";

{loading && (
  <div className="flex items-center justify-center p-6 print:hidden">
    <ClocheLoader className="text-gray-800" size={72} />
  </div>
)}`}</code></pre>
      </section>
    </main>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border bg-white p-6 text-center shadow-sm">
      <div className="mb-3 text-sm font-medium">{title}</div>
      {children}
    </div>
  );
}
