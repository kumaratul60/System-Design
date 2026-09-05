React Rendering Behavior
Bytes → Characters → Tokens → Nodes → DOM Tree
<!-- The parser processes top-to-bottom -->
<body>
  <h1>Title</h1>          <!-- ← DOM node created immediately -->
  <script src="app.js">   <!-- ← PARSER STOPS. Downloads + executes JS. -->
  </script>                <!--   DOM construction is FROZEN until JS finishes -->
  <p>Content</p>           <!-- ← This node is NOT created until script is done -->
</body>

Main Parser:     HTML ──── [BLOCKED by <script>] ──────── Resume ────
Preload Scanner: HTML ──── continues scanning ──── found img, css ──── starts fetching

CSS Bytes → Characters → Tokens → CSSOM Nodes → CSSOM Tree


Topic	What You Should Know
What is the DOM?	In-memory tree of HTML nodes. It's an API, it's live, and it's NOT the HTML source.
What is the CSSOM?	Tree of all CSS rules with cascade/specificity resolved. Render-blocking — browser waits for ALL CSS before painting.
What is the Render Tree?	DOM + CSSOM combined. Only visible elements. display:none excluded, visibility:hidden included.
Rendering pipeline stages?	Parse HTML → Build DOM → Parse CSS → Build CSSOM → Render Tree → Layout → Paint → Composite.
Why is CSS render-blocking?	Browser can't know what elements look like without full CSSOM. Partial CSS → FOUC.
Why is JS parser-blocking?	JS can modify DOM (document.write) and CSSOM. Browser must stop and execute before continuing.
Reflow vs Repaint?	Reflow = geometry recalculation (expensive). Repaint = pixel update. transform/opacity skip both.
Layout thrashing?	Interleaving DOM reads and writes forces synchronous layout on every read. Fix: batch reads, then batch writes.
Virtual DOM?	JS representation of DOM. Framework diffs old vs new, computes minimal patches, batches real DOM updates.
Selector matching direction?	Right-to-left. .nav ul li a → find all <a>, filter by parent li, then ul, then .nav. Flat selectors are faster.
How to fix render-blocking CSS?	Inline critical CSS, load rest async (media="print" onload), avoid @import, purge unused CSS.
Compositor-only properties?	transform, opacity, filter. GPU-accelerated, skip layout and paint entirely. Use for animations.
display:none vs visibility:hidden?	display:none: removed from Render Tree, no space. visibility:hidden: IN Render Tree, takes space, just invisible.
Preload scanner?	Secondary parser that scans ahead during script blocking to discover and fetch resources early.
How to measure rendering?	DevTools Performance tab, Rendering drawer (paint flashing), Layers panel, PerformanceObserver API.


