# Contributing

## Requirements

* **[Node.js](https://nodejs.org/)** - Minimum version: `12.15.0`

## Install dependencies

```sh
yarn            # install npm dependencies
yarn bs         # bootstrap repository with lerna to link local dependencies
cd packages/sdk # go to the @saagie/sdk project
yarn link       # to use saagie-sdk everywhere ;)
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

## Publishing

The published version will be automagically calculated using the recently closed
PR that are not released yet.
Each PR should have one (and only one) of
[the following label](https://github.com/saagie/sdk/labels?q=major.minor.patch):

* `patch`
* `minor`
* `major`

If a PR as the label `release` on it, then, the GitHub Actions CI will
automatically create a new release on NPM and GitHub.

### Publication Examples

1. Suppose we are currently at version `0.3.0`, and there are only 1 PR with the
   `patch` label, then the released version will be `0.3.1`.
2. Suppose we are currently at version `0.3.0`, and there are 2 PR one with the
   `patch` label and the other one with the `minor` label, then the released
   version will be `0.4.0`.

## Troubleshooting

### Windows

`npm` uses `cmd` that doesn't support command substitution that we use to get
the `git` commit hash for the build. You need to tell `npm` to use `powershell`
for this to work. [Learn more here](https://github.com/kentcdodds/cross-env#windows-issues)
and [here](https://github.com/kentcdodds/cross-env/issues/192#issuecomment-513341729).

```
npm config set script-shell "C:\\windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe"
```
