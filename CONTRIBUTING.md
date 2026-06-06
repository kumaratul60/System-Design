# Contributing to System Design & Architecture Laboratory

First off, thank you for taking the time to contribute! 🎉

This repository is an educational monorepo containing both extensive theoretical design documents and a live, interactive React/TypeScript showcase application displaying key LLD patterns, concurrency models, and state management engines.

By contributing, you help make this a premium reference laboratory for engineers worldwide.

---

## 🗺️ Project Architecture Overview

The repository is structured as a monorepo workspace under the `LLD` folder:

```text
LLD/
├── apps/
│   └── showcase/               # The Vite + React + React Router SPA showcase app
├── packages/
│   ├── state-engines/          # Shared state management adapters (Redux, Zustand, XState, Context, etc.)
│   ├── theme/                  # Theme configurations and translation dictionaries (i18n)
│   └── ui/                     # Shared UI components (Layout, Sidebar Navigation, shell wrappers)
├── package.json                # Root package configurations defining yarn/npm workspaces
└── tsconfig.json               # Shared compiler configurations
```

---

## 🛠️ Local Development Setup

To get your environment set up locally:

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/kumaratul60/System-Design.git
   cd System-Design
   ```

2. **Install Dependencies:**
   Navigate into the LLD monorepo folder and run `npm install` to resolve workspace symlinks:

   ```bash
   cd LLD
   npm install
   ```

3. **Start the Development Server:**
   Launch the showcase application on Vite:

   ```bash
   npm run dev
   ```

4. **Verify Quality Checks:**
   Run checks locally before committing to ensure the CI pipeline stays green:
   ```bash
   npm run typecheck      # TypeScript compiler validation
   npm run lint           # ESLint static analysis
   npm run build          # Production bundle build test
   ```

---

## 🚀 How to Add a New Showcase Feature

To add a new interactive UI component, widget, or algorithm visualizer to the showcase, you can choose between two structures: a **single-file component** (for simple utilities) or a **self-contained project folder** (recommended for complex features with nested components and styles).

### Step 1: Create the Component

#### Option A: Single-File Component

Create a `.tsx` file directly under `LLD/apps/showcase/src/pages/interview/`.

_Example (`LLD/apps/showcase/src/pages/interview/MyUtility.tsx`):_

```tsx
import React from 'react';
import { useAppState } from '@statelab/state-engines';
import { translate } from '@statelab/theme';

export const MyUtility: React.FC = () => {
  const { language } = useAppState();
  return (
    <div className="page-container">
      <h3>{translate(language, 'myNewFeatureTitle')}</h3>
      <p>My interactive utility...</p>
    </div>
  );
};
```

#### Option B: Self-Contained Project Folder (Recommended for Complex Features)

Create a new folder under `LLD/apps/showcase/src/pages/interview/` (or `LLD/apps/showcase/src/pages/wired/`). This can be structured as a normal folder containing `.tsx`/`.jsx` files and `.css` files at any level of nested directory structure (all levels).

_Folder Structure Example:_

```text
LLD/apps/showcase/src/pages/interview/MyComplexWidget/
├── MyComplexWidget.tsx         # Main page entry component
├── MyComplexWidget.css         # Styles for the main component
├── utils/                      # Helper utility folder
│   └── widgetHelpers.ts
└── components/                 # Sub-folders for nested components at any level
    ├── WidgetItem.tsx          # A nested sub-component
    ├── WidgetItem.css          # Styles for the nested sub-component
    └── subcomponents/          # Even deeper levels of components
        ├── DetailView.tsx
        └── DetailView.css
```

1. **Create/Write components** in `.tsx` / `.jsx` at any level within your feature directory.
2. **Style locally at all levels**: You can place `.css` files at any level of the folder structure (next to the components that use them). Simply import each stylesheet directly inside the component that uses it using relative paths:
   - In `MyComplexWidget.tsx`: `import "./MyComplexWidget.css";`
   - In `WidgetItem.tsx`: `import "./WidgetItem.css";`
   - In `DetailView.tsx`: `import "./DetailView.css";`
     _Note: Importing CSS files locally at their respective directory levels keeps the styles modular, encapsulated, and avoids bloating the global `index.css` file._

_Example of a main component (`LLD/apps/showcase/src/pages/interview/MyComplexWidget/MyComplexWidget.tsx`):_

```tsx
import React from 'react';
import { useAppState } from '@statelab/state-engines';
import { translate } from '@statelab/theme';
import './MyComplexWidget.css'; // Local stylesheet import at main level
import { WidgetItem } from './components/WidgetItem'; // Import nested component

export const MyComplexWidget: React.FC = () => {
  const { language } = useAppState();
  return (
    <div className="page-container my-complex-widget-root">
      <h3>{translate(language, 'myNewFeatureTitle')}</h3>
      <div className="widget-board">
        <p>My LLD modular widget...</p>
        <WidgetItem />
      </div>
    </div>
  );
};
```

### Step 2: Register the Route

Open `LLD/apps/showcase/src/featureRegistry.ts` and wire your main component into the routing system:

1. Import your main component.
2. Add a new configuration entry to the `featureRegistry` array:

```typescript
{
  path: "/interview/my-new-feature",
  element: MyComplexWidget,          // Your exported component class/function
  access: "protected",              // "public" | "public-redirect-login" | "protected" | "private"
  sidebar: true,                     // Set to true to display in left sidebar navigation
  labelKey: "navMyNewFeature",       // Key matching translation dictionaries
  icon: Zap,                         // Lucide icon component
}
```

### Step 3: Add Localization Dictionaries

Since the application supports English, Spanish, and Hindi, you need to register your translation keys:

1. Update `LLD/packages/theme/src/i18n.ts` by adding translation mappings:
   ```typescript
   export const translations = {
     en: {
       navMyNewFeature: 'My New Feature',
       myNewFeatureTitle: 'Interactive Sandbox Title',
       // ...
     },
     es: {
       navMyNewFeature: 'Mi Nueva Función',
       myNewFeatureTitle: 'Título del Espacio de Trabajo',
       // ...
     },
     hi: {
       navMyNewFeature: 'मेरी नई सुविधा',
       myNewFeatureTitle: 'इंटरैक्टिव सैंडबॉक्स शीर्षक',
       // ...
     },
   };
   ```
2. Update `LLD/packages/theme/src/i18n.d.ts` to declare the key type so TypeScript compiles successfully:
   ```typescript
   export interface Translations {
     navMyNewFeature: string;
     myNewFeatureTitle: string;
     // ...
   }
   ```

---

## 🎨 Code Style Guidelines

- **TypeScript First:** All UI components, state engines, and helpers must be typed explicitly. Avoid using `any` types.
- **Component Partitioning:** Keep presentation logic clean. Use custom hooks for heavy state transitions or logic extraction.
- **Styling Principles:** Use CSS custom properties (`var(--primary)`, `var(--bg)`, `var(--text)`) defined in `index.css` to respect dark mode and light mode changes automatically.
- **Persistence & State:** If you write components that store inputs, use helper functions from `packages/state-engines/src/storageHelpers.ts` to ensure compatibility across refresh cycles.

---

## 🔀 Git Workflow & Pull Requests

1. **Fork the Repository:** Create a personal fork of the project.
2. **Branch Naming:** Create a branch named descriptively:
   - For new components: `feature/my-feature-name`
   - For bug resolutions: `bugfix/issue-description`
3. **Keep Commits Clean:** Write logical, atomic commit messages detailing _what_ and _why_ changes were made.
4. **Open a Pull Request:** Ensure your branch has been checked with `npm run lint` and `npm run typecheck` before submitting. Provide a detailed summary of your changes and steps to verify them.
