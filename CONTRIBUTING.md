# Contributing

## Requirements

* **[Node.js](https://nodejs.org/)** - Minimum version: `12.15.0`

## Install dependencies

```sh
yarn     # install npm dependencies
yarn bs  # bootstrap repository with lerna to link local dependencies
```

## Run tests

```sh
yarn test
```

## Development

Run the `dev` command at the root of the project

```sh
yarn dev
```

Then go to your technology folder and run:

```sh
SAAGIE_ENV=development yarn saagie-sdk start
```
