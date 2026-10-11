/**
 * Decorative knowledge map for the landing hero: three clusters
 * (Projects, Topics, Books) around the site, drawn in the same
 * visual language as the docs diagrams (layer colours, dashed links).
 * Pure SVG + CSS animation; static under prefers-reduced-motion.
 */
export function KnowledgeMap() {
  return (
    <svg
      viewBox="0 0 420 320"
      role="img"
      aria-label="Knowledge map: projects, topics, and books connected to learn"
      className="h-auto w-full"
    >
      {/* cluster links */}
      <g stroke="var(--dg-edge)" strokeWidth="1.6" fill="none">
        <line x1="210" y1="140" x2="90" y2="84" strokeDasharray="6 5" className="map-flow" />
        <line x1="210" y1="140" x2="330" y2="84" strokeDasharray="6 5" className="map-flow" />
        <line x1="210" y1="180" x2="210" y2="242" strokeDasharray="6 5" className="map-flow" />
      </g>
      {/* satellite links */}
      <g stroke="var(--dg-node-border)" strokeWidth="1.4" fill="none">
        <line x1="90" y1="84" x2="30" y2="122" />
        <line x1="90" y1="84" x2="150" y2="120" />
        <line x1="330" y1="84" x2="272" y2="120" />
        <line x1="330" y1="84" x2="390" y2="122" />
        <line x1="210" y1="262" x2="142" y2="296" />
        <line x1="210" y1="262" x2="278" y2="296" />
      </g>
      {/* satellites */}
      <g fill="var(--dg-node-bg)" strokeWidth="1.6">
        <circle cx="30" cy="122" r="6" stroke="var(--dg-browser)" />
        <circle cx="150" cy="120" r="6" stroke="var(--dg-browser)" />
        <circle cx="272" cy="120" r="6" stroke="var(--dg-shared)" />
        <circle cx="390" cy="122" r="6" stroke="var(--dg-shared)" />
        <circle cx="142" cy="296" r="6" stroke="var(--dg-realtime)" />
        <circle cx="278" cy="296" r="6" stroke="var(--dg-realtime)" />
      </g>
      {/* cluster pills */}
      <g fontSize="13" fontWeight="600" textAnchor="middle" className="fill-current">
        <rect x="35" y="46" width="110" height="36" rx="10" fill="var(--dg-node-bg)" stroke="var(--dg-browser)" strokeWidth="2" />
        <text x="90" y="69">Projects</text>
        <rect x="280" y="46" width="100" height="36" rx="10" fill="var(--dg-node-bg)" stroke="var(--dg-shared)" strokeWidth="2" />
        <text x="330" y="69">Topics</text>
        <rect x="160" y="244" width="100" height="36" rx="10" fill="var(--dg-node-bg)" stroke="var(--dg-realtime)" strokeWidth="2" />
        <text x="210" y="267">Books</text>
        <rect x="155" y="140" width="110" height="40" rx="12" fill="var(--dg-node-bg)" stroke="var(--dg-node-border)" strokeWidth="2" />
        <text x="210" y="165">learn</text>
      </g>
    </svg>
  );
}
