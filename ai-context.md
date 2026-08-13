# 🤖 AI SYSTEM CONTEXT: RiskFlow PWA

**INSTRUCTION FOR THE AI:** 
You are an expert full-stack web developer and an assistant for occupational health and safety (Arbeitsschutz). Read this document to understand the "RiskFlow" project. It contains the complete architecture, database schema, and core logic. Base all future code generation, debugging, and feature additions on the constraints and structures defined here.

---

## 1. PROJECT OVERVIEW
* **Name:** RiskFlow – Gefährdungsbeurteilungen & Arbeitsschutz
* **Type:** Progressive Web App (PWA), 100% Offline-capable.
* **Purpose:** A tool for safety specialists (Fachkraft für Arbeitssicherheit) to digitally create, manage, and export risk assessments (Gefährdungsbeurteilungen) directly on-site.
* **Tech Stack:** 
  * Frontend: Vanilla JavaScript (ES6 Modules), HTML5
  * Styling: Pure CSS3 (Variables, Flexbox/Grid) – structured via a modified 7-1 pattern.
  * Build Tool: Vite + `vite-plugin-pwa`
  * Database: `IndexedDB` (using the `idb` wrapper library).
* **UI/UX Philosophy:** Clean, professional business UI. No emojis (replaced by inline SVG code from Feather Icons). Mobile-first approach (bottom sheet modals, card-based tables on mobile, bottom tab-navigation).

---

## 2. DATABASE SCHEMA (IndexedDB V3)
The app uses a relational, multi-tenant data model. `storage.js` handles all DB operations.

**Store 1: `companies` (KeyPath: `id`)**
* `id` (Number/Timestamp)
* `name` (String, required)
* `anschrift` (String)
* `auditor` (String)
* `createdAt` (ISO Date String)

**Store 2: `assessments` (KeyPath: `id`)**
* `id` (Number/Timestamp)
* `companyId` (Number) -> Foreign key linking to `companies`. Indexed for fast retrieval.
* `bereich` (String) -> Department/Area (e.g., "Lager", "Produktion").
* `taetigkeit` (String, required) -> Workspace/Task.
* `gefaehrdung` (String, required) -> Hazard category.
* `sVor`, `wVor` (String/Number) -> Severity & Probability BEFORE measures.
* `sNach`, `wNach` (String/Number) -> Severity & Probability AFTER measures.
* `stopS`, `stopT`, `stopO`, `stopP` (String) -> Safety measures following the S.T.O.P. principle. Multiple measures are separated by a pipe `|`.
* `psaList` (Array of Strings) -> Selected Personal Protective Equipment.
* `psaStillRequired` (Boolean)
* `verantwortlich` (String, required)
* `frist` (String, required) -> Date or Interval (e.g., "Jährlich").

**Store 3: `settings` (KeyPath: `key`)**
* Stores configuration like `psaCatalog` (Dynamic list of PPE) and `branchTemplates` (Pre-filled standard hazards for specific industries).

---

## 3. FILE STRUCTURE & ARCHITECTURE

```text
src/
├── css/                  # Compiled by Vite via style.css (@import)
│   ├── base/             # _variables.css, _reset.css, _icons.css
│   ├── components/       # _buttons.css, _forms.css, _modals.css, _tables.css
│   ├── layout/           # _app-container.css, _header.css
│   ├── utilities/        # _print.css
│   ├── views/            # _betriebe.css, _workspace.css
│   └── style.css         # The HUB. Only contains @imports.
├── js/
│   ├── app.js            # UI Layout, Routing, SVG Icon Dictionary
│   ├── logic.js          # Core Business Logic, Event Delegation, DOM Updates
│   ├── storage.js        # IndexedDB operations and migrations
│   └── main.js           # Bootstrap / Initialization
