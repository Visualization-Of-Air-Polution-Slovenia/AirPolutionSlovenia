# Air Pollution Visualization Dashboard – Technical Project Document

**Team Members:**

- **Luka** – Project Manager, Data Engineering, Coordination
- **Matic** – Data Engineering
- **Jure** – Integration & Repository Structure
- **Hana** – Visual & Interaction Design, Content
- **Domen** – Frontend & Visualizations Lead


- **Technologies:** Python, pandas, numpy, Jupyter, HTML, CSS, JavaScript, Vega-Lite, GitHub

---

## 1. Project Goal

Develop a **simple but feature-rich interactive air pollution dashboard** for Slovenia, covering PM₁₀, PM₂.₅, NO₂, and O₃ concentrations across cities. The dashboard must:

- run in a browser (no heavy backend),
- be visually clean and responsive,
- use processed datasets made in Python,
- provide meaningful health-impact context,
- be suitable for academic presentation.

---

## 2. Technology Stack

### Data Processing (Backend-lite)

- **Python 3**
- **pandas**, **numpy**
- **Jupyter Notebooks** for EDA
- Export to **CSV/JSON**

### Frontend

- **HTML**
- **CSS**
- **React**
- **JavaScript**
- **Vega-Lite + Vega-Embed** for charts

### Version Control

- Git + GitHub repository
- GitHub Projects for task/issue management

---

## 3. Repository Structure

```

```

---

## 4. Data Pipeline (Python)

### Steps

1. **Ingest**Load ARSO + EEA datasets into pandas.
2. **Cleaning**Normalize pollutant names, unify date formats, remove invalid rows.
3. **Aggregation**Convert daily → yearly data.Compute `days_above_limit` based on WHO/EU limits.Aggregate by city, station, region.
4. **Export**Save cleaned outputs to `data_processed/` in CSV & JSON formats.
5. **Metadata**
   Create a `data_dictionary.md` explaining all fields.

### Deliverables

- `notebooks/01_data_cleaning.ipynb`
- `notebooks/02_aggregation.ipynb`
- `make_data.py`

---

## 5. Dashboard Features

### Core Features (Must-Have)

#### 1. Time-Series View

- Line chart (years → concentration).
- Filters:
  - Pollutant (PM₁₀, PM₂.₅, NO₂, O₃)
  - City / region
- Horizontal limit lines: WHO + EU thresholds
- Hover tooltips with exact values

#### 2. City Comparison View

- Bar chart or small multiples for comparing cities
- Filters: year, pollutant

#### 3. Heatmap View

- City × year matrix
- Color = average annual concentration or % days above threshold

#### 4. Health Impact Cards

Simple text blocks describing:

- links between pollution and mortality/respiratory issues
- effects per +10 µg/m³ increase (based on literature)

#### 5. Interactions

- Dropdowns
- Checkboxes
- Linked filtering across all graphs
- Responsive layout

### Optional (If Time Allows)

- Interactive Slovenia map
- “Story mode” (preset scenes explaining key insights)

---

## 6. Team Roles

### **Luka — Project Manager & Lead**

- Define feature scope and roadmap
- Create UI wireframes (Figma/Miro)
- Define interaction flows and user experience
- Coordinate all members
- Write:
  - introduction, research background, evaluation, limitations
  - structure for final report

### **Matic — Data Engineering**

- Implement ingestion, cleaning, aggregation pipeline
- Ensure processed files are clean and consistent
- Provide datasets for the frontend in JSON/CSV
- Maintain notebooks and ensure reproducibility

### **Jure — Integration, Repository Structure**

- Set up GitHub repository
- Maintain clean folder structure
- Provide simple dev server (Python/Node)
- Ensure smooth data loading in frontend
- Maintain README and setup instructions

### **Hana — Visual & Interaction Design**

- Design the visual theme (colors, typography, layout)
- Style the UI (CSS)
- Create chart legends, tooltips, and info cards
- Write accessible text for health impact
- Conduct 2–3 user tests and summarize findings

### **Domen — Frontend & Visualization Lead**

- Implement the UI in HTML/CSS/JS
- Build Vega-Lite charts (line, bar, heatmap)
- Implement filtering and interactivity
- Load processed data (JSON) and handle transformations
- Performance tuning where needed

---

## 7. Timeline (4 Weeks)

### **Week 1 — Concept & Data Exploration**

- Luka: scope + wireframes
- Matic: EDA + first cleaning notebook
- Hana: initial UI mockups
- Domen: basic HTML/JS setup + demo Vega-Lite plot
- Jure: repo setup + README

### **Week 2 — Pipeline & Chart Prototypes**

- Matic: finalize cleaned & aggregated JSON/CSV
- Luka + Hana: validate dataset coverage
- Domen: prototype 2–3 charts with real data
- Jure: unify data loading logic

### **Week 3 — Interactivity & Integration**

- Domen: filters, linked charts, interactions
- Hana: final styling
- Matic: adjust pipeline if frontend needs tweaks
- Luka: prepare “story mode” flow
- Jure: browser testing + dev server cleanup

### **Week 4 — Polishing & Documentation**

- Everyone: bug fixes
- Hana + Luka: usability test
- Luka: final report writing
- Matic: pipeline documentation
- Jure + Domen: final build & showcase video

---

## 8. Technical Standards

- Full reproducibility:
  ```
  python make_data.py
  python -m http.server
  ```
- Clean code structure, no large monolithic scripts
- Consistent naming:
  - `pollutant`, `city`, `year`, `mean_value`, `days_above_limit`
- Commented Python & JS code
- Accessible, colorblind-friendly palettes
- Responsive layout for desktop/tablet

---

## 9. Summary

This document outlines the complete plan to design, implement, and deliver a clean, interactive, data-driven visualization dashboard for Slovenian air quality. The structure is lightweight, modular, and suited for a 4–5 member team with a one-month deadline.
