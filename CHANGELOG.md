# 📝 Changelog – Version 1.2 (September 2025)

### 🚀 New Features
- **Satellite Super-Resolution (SR) Module:**  
  - Integrated SR pipeline into image retrieval and preprocessing.  
  - Added support to upscale Sentinel tiles and crop parcels from SR outputs.  
  - Implemented parcel crop resizing logic to ensure consistent minimum target size.  
- **Server Routes:** Extended endpoints to handle SR-processed images seamlessly in existing parcel workflows.  

---

### 🛠 Fixes & Improvements
- Corrected TIF merging for single-band files.  
- Fixed PNG crop parcel output issues.  
- Improved error logging and exception handling around SR pipeline.  
- Updated constants and environment configuration to include SR-related variables.  
- Cleaned up redundant code and improved logging readability.  

---

### 📦 Enhancements
- Added helper functions to support SR integration and image processing workflows.  
- Updated Conda environment requirements for SR dependencies.  
- Removed filename format constraint in SR pipeline to support broader input naming.  
- Documentation updates to README and environment setup for SR usage.  

---

## 🖥️ Server-Specific Changes
- Implemented SR logic within MinIO bands processing workflow.  
- Refactored image retrieval pipeline to accommodate SR integration.  
- Added try/catch blocks to improve fault tolerance during SR execution.  
- Included developer-facing notes and cleanup for future maintainability.  

---

👉 This release focuses primarily on **introducing the SR module** and making the server capable of handling higher-quality satellite imagery while keeping parcel cropping robust.  


# 📝 Changelog – Version 1.1 (July 2025)

### 🚀 New Features
- **Parcel Drawer:** Users can now draw custom parcel geometries directly on the map. The system captures, stores, and processes this geometry.
- **Combined Parcel Finder & Drawer View:** The two tools are now integrated on the same page using tabs for seamless switching.
- **Detailed Descriptions:** Added the option to toggle between TL;DR and detailed LLM-enriched parcel descriptions.
- **SIGPAC Info Display:** New table columns for classification and crop types, with updated form to support SIGPAC data entry.
- **Multilingual Content:** Full description examples and TL;DR summaries now include both Spanish and English versions.

---

### 🛠 Fixes & Improvements
- Improved error handling across UI and backend.
- Refined notification messages (Angular Material snackbars).
- Reset buttons added for form clearing and UI control.
- Minor fixes in UI styling, folder structure, and input validation.

---

## 📁 UI-Specific Changes
- Installed `leaflet-draw` for polygon drawing.
- Cleaned up public folder structure.
- Introduced tabbed layout for Parcel Finder & Drawer.
- Implemented component-based architecture for Parcel Drawer.
- UI form includes validation and field locking based on system state.