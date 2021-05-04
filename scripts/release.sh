#!/usr/bin/env bash

yarn install --frozen-lockfile

export PATH=$(yarn bin):$PATH

VERSION=`auto version`

if [ ! -z "$VERSION" ]; then
  echo 'Configure git to commit/push'
  git config --global user.name "Software Factory"
  git config --global user.email "software-factory@saagie.com"

  echo 'Adding registry with authentication'
  echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" > .npmrc
  yarn deploy --no-verify-access --yes $VERSION -m '%v [skip ci]'
  auto release

  echo 'Remove registry with authentation'
  rm .npmrc
fi
