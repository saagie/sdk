# Contributing

## Requirements

* **[Node.js](https://nodejs.org/)** - Minimum version: `12.15.0`

## Install dependencies

```sh
yarn      # install npm dependencies
yarn bs   # bootstrap repository with lerna to link local dependencies
yarn link # to use saagie-sdk everywhere ;)
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
yarn link @saagie/sdk
SAAGIE_ENV=development yarn start
```

## Test NPM publish with Verdaccio

You can use [Verdaccio](https://verdaccio.org/) (a local npm registry) to test dry-run package publication.

### 1. Install Verdaccio globally

```sh
yarn global add verdaccio
```

### 2. Run verdaccio

```sh
verdaccio
```

### 3. Run dry-run publish

```sh
yarn verdaccio:publish
```

Go to [@saagie/sdk on Verdaccio](http://localhost:4873/-/web/detail/@saagie/sdk) to see your package published.

### 4. Revert dry-run publish

```sh
yarn verdaccio:unpublish
```
