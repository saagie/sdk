# Saagie 📦 SDK for Technologies

[![build](https://img.shields.io/github/workflow/status/saagie/sdk/Master%20Build)][build]
[![npm](https://img.shields.io/npm/v/@saagie/sdk)][npm]

[build]: https://github.com/saagie/sdk/actions?query=workflow%3A%22Master+Build%22
[npm]: https://www.npmjs.com/package/@saagie/sdk

The **Saagie Technology SDK** allows you to implements **new technologies** easily within the [Saagie](https://www.saagie.com/) platform.

---

## Requirements

* **[Node.js](https://nodejs.org/)** - Minimum version: `16`

---

## 🤩 Create your first technology

### 👉 Initialize your technology

```sh
npx @saagie/sdk init
```

If it does not work (`npx` is a little capricious on system with space in the path) go to the folder where you want your technology to be located:

```sh
npm init -y
npm install @saagie/sdk
```

Update the `package.json` to include this script command :

```json
{
  "...": "...",
  "scripts": {
    "init": "saagie-sdk init"
  },
  "...": "..."
}
```

Now run to start the technology prompt:

```sh
npm run init
```

### 👉 Run your technology locally

```sh
npm run dev
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

**[▶️ Access the SDK documentation](https://docs.saagie.io/user/latest/developer/sdk/technos/index.html)**

Quick links:

* [📚 technology.yaml](https://docs.saagie.io/user/latest/developer/sdk/technos/references.html#common_attributes_table)
* [📚 context.yaml](https://docs.saagie.io/user/latest/developer/sdk/technos/references.html#external-jobs-configuration)

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
