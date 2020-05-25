# Saagie 📦 SDK for Technologies

[![build](https://img.shields.io/github/workflow/status/saagie/sdk/Master%20Build)][build]
[![npm](https://img.shields.io/npm/v/@saagie/sdk)][npm]

[build]: https://github.com/saagie/sdk/actions?query=workflow%3A%22Master+Build%22
[npm]: https://www.npmjs.com/package/@saagie/sdk

The **Saagie Technology SDK** allows you to implements **new technologies** easily within the [Saagie](https://www.saagie.com/) platform.

---

## Requirements

* **[Node.js](https://nodejs.org/)** - Minimum version: `12.15.0` (the latest `lts` is recommended)

---

## 🤩 Create your first technology

### 👉 Initialize your technology

```sh
npx @saagie/sdk init
```

### 👉 Run your technology locally

```sh
npm run start
```

### 👉 Build your technology

```sh
npm run build
```

### 👉 Create a new context

```sh
npm run new:context
```

---

## 📚 Technologies & Contexts documentation

**[▶️ Access the SDK documentation](https://saagie.zendesk.com/hc/en-us/articles/360013330039-Create-and-manage-technologies)**

Quick links:

* [📚 technology.yaml](https://saagie.zendesk.com/hc/en-us/articles/360013330039-Create-and-manage-technologies#_attributes)
* [📚 context.yaml](https://saagie.zendesk.com/hc/en-us/articles/360013330039-Create-and-manage-technologies#external-tech)

---

## 💻 CLI Commands

```
Usage: saagie-sdk [options] [command]

Options:
  -V, --version    output the version number
  -h, --help       display help for command

Commands:
  init             Create an empty Saagie External Technology project
  start [options]  Run local application
  build            Package your technology
  help [command]   display help for command
```

---

## 👩‍👨‍ Contributing
Please read our [Contributing Guide](./CONTRIBUTING.md) before submitting a Pull Request to the project.
