#!/usr/bin/env bash

yarn install --frozen-lockfile

export PATH=$(yarn bin):$PATH

VERSION=`auto version`

if [ ! -z "$VERSION" ]; then
  git config --global user.name "Yoann Fleury"
  git config --global user.email "yoann.fleury@saagie.com"
  echo '//registry.npmjs.org/:_authToken=$NPM_TOKEN' > .npmrc
  yarn deploy --yes $VERSION -m '%v [skip ci]'
  auto release
  rm .npmrc
fi