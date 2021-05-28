#!/bin/bash

cd `dirname $0`
cd ..

# source this to run MscriptN stuff:
. /dvl/emscripten/emsdk-main/emsdk_env.sh

. allCpp.sh

emcc -o quantumEngine.js -sLLD_REPORT_UNDEFINED -g testing/main.test.cpp testing/qCx.test.cpp $allCpp

node quantumEngine.js

