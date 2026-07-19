# reimu-template

<img alt="theme version" src="https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2FD-Sketon%2Freimu-template%2Frefs%2Fheads%2Fmain%2Fpackage.json&query=%24.dependencies.hexo-theme-reimu&label=theme version">


Template for [hexo-theme-reimu](https://github.com/D-Sketon/hexo-theme-reimu)

## Local preview

Hexo 8 requires Node.js 20.19.0 or newer. This repository declares that requirement in `package.json`, and npm is configured to stop installation when the active Node.js version is incompatible.

In this workspace, select the provided Node.js 22 runtime before running npm:

```bash
export PATH=/home/drm/.local/opt/node-v22.23.1/bin:$PATH
node --version
```

The reported version must be `v20.19.0` or newer. In another environment, select a compatible release with your Node version manager or install one before continuing.

```bash
npm ci
npm run clean
npm run build
npm run server
```

Open <http://127.0.0.1:4000/> for the home page or <http://127.0.0.1:4000/about/> for the about page. Stop the preview server with `Ctrl+C`.

Run `npm test` to cleanly rebuild the site and verify the generated category and tag routes.

## Features

The following features are pre-supported:

- support LaTeX (@reimujs/hexo-renderer-markdown-it-plus)
- support mermaid (hexo-filter-mermaid-diagrams)
- support git (hexo-deployer-git)
- support rss (hexo-generator-feed)
- support Algolia search (@reimujs/hexo-algoliasearch)

## How to use

The configuration of Hexo is in `_config.yml`.
The configuration of Reimu is in `_config.reimu.yml`.
You can modify the configuration according to your needs
