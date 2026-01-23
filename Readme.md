[![License](https://img.shields.io/badge/License-GNU%20AGPL%20V3-green.svg?style=flat)](https://www.gnu.org/licenses/agpl-3.0.en.html)

<h1 > ONLYOFFICE web-apps</h1>

## 💡 Overview

Welcome to the `web-apps` repository! 

It’s the frontend for [ONLYOFFICE Document Server](https://github.com/ONLYOFFICE/DocumentServer) and [ONLYOFFICE Desktop Editors](https://github.com/ONLYOFFICE/DesktopEditors) — the part you interact with. It powers the interface that lets you create, edit, save, and export your text documents, spreadsheets, and presentations.

*Previous versions: Until 2019-10-23 the repository was called web-apps-pro.*

---

## ⚙️ How it fits in the ONLYOFFICE ecosystem


| Layer | Component | Role |
|-----------|------------|------|
| 🧠 **Engine** | [Document Server ↗](https://github.com/ONLYOFFICE/DocumentServer) | Handles editing logic, file conversion, real-time collaboration |
| 💻 **Interface** | **Web Apps** *(this repo)* | Provides the browser-based user interface |
| 🧩 **Integrations** | [Integration API ↗](https://api.onlyoffice.com/docs/docs-api/get-started/basic-concepts/?utm_source=github&utm_medium=cpc&utm_campaign=GitHubWebApps) | Embeds editors into custom web platforms or apps |

Together, these layers make **ONLYOFFICE** a full-fledged online editing suite.

---

## 🚀 Key highlights

✨ **Multiple editors, one codebase**
- [Document Editor](https://www.onlyoffice.com/word-processor?utm_source=github&utm_medium=cpc&utm_campaign=GitHubWebApps) 📝  
- [Spreadsheet Editor](https://www.onlyoffice.com/sheets?utm_source=github&utm_medium=cpc&utm_campaign=GitHubWebApps) 📊  
- [Presentation Editor](https://www.onlyoffice.com/slides?utm_source=github&utm_medium=cpc&utm_campaign=GitHubWebApps) 📽️ 
- [PDF Editor](https://www.onlyoffice.com/pdf-editor?utm_source=github&utm_medium=cpc&utm_campaign=GitHubWebApps) ✂️
- [Form Creator](https://www.onlyoffice.com/form-creator?utm_source=github&utm_medium=cpc&utm_campaign=GitHubWebApps) 📝
- [Diagram Viewer](https://www.onlyoffice.com/diagram-viewer?utm_source=github&utm_medium=cpc&utm_campaign=GitHubWebApps) 🖼️

💬 **Real-time collaboration**
- Co-editing 
- Comments, mentions, and version history
- Built-in chat and track changes  

⚡ **Developer-friendly integration**
- Embed editors in any app using [ONLYOFFICE API ↗](https://api.onlyoffice.com/docs/docs-api/get-started/basic-concepts/?utm_source=github&utm_medium=cpc&utm_campaign=GitHubWebApps)
- Customize toolbar, permissions, and callback behavior  

🌍 **Fully browser-compatible**
- Works on all major browsers  
- Localized in 45 languages  
- Optimized for responsive performance  

---

## 🧱 Folder overview

Here’s a quick tour of what lives inside this repository:

| Folder | Description |
|--------|--------------|
| `.github/workflows/` | GitHub Action workflows for CI, build validation, testing, and checks. |
| `.vscode/` | Editor configuration for VS Code.|
| `apps/` | Core UI for the three editors (Documents, Spreadsheets, Presentations). This is where the frontend interface lives. |
| `build/` | Build scripts, bundling configuration, and output settings for packaging the web editors. |
| `test/` | Test suites and scripts used to validate functionality and stability. |
| `translation/` | All localization files and translations. |
| `vendor/` | Third-party libraries and dependencies used by the editors. |


## 🔧 Want to build this yourself? 

If you’d like to compile or modify the editors yourself, use the [`build_tools`](https://github.com/ONLYOFFICE/build_tools) repository.

It automatically sets up dependencies and builds:

* [Docs (Document Server)](https://www.onlyoffice.com/docs?utm_source=github&utm_medium=cpc&utm_campaign=GitHubWebApps)  
* [Desktop Editors](https://www.onlyoffice.com/desktop?utm_source=github&utm_medium=cpc&utm_campaign=GitHubWebApps)  
* [Document Builder](https://www.onlyoffice.com/document-builder?utm_source=github&utm_medium=cpc&utm_campaign=GitHubWebApps)

## Need help or have an idea? 💡

We ❤️ community contributions!

* **🐞 Found a bug?** Please report it by creating an [issue](https://github.com/ONLYOFFICE/web-apps/issues).
* **❓ Have a question?** Ask our community and developers on the [ONLYOFFICE Forum](https://community.onlyoffice.com).
* **💡 Want to suggest a feature?** Share your ideas on our [feedback platform](https://feedback.onlyoffice.com/forums/966080-your-voice-matters).
* **🧑‍💻 Need help for developers?** Check our [API documentation](https://api.onlyoffice.com/?utm_source=github&utm_medium=cpc&utm_campaign=GitHubWebApps).

---

<p align="center"> Made with ❤️ by the ONLYOFFICE Team </p>