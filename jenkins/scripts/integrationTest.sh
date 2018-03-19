#!/usr/bin/env sh


set -x
npm install --save-dev cross-env
set +x

echo 'The following "npm" command run unit tests that your simple Node.js/React'

set -x
npm run build
set +x

set -x
npm start
npm run integration-test
npm stop
