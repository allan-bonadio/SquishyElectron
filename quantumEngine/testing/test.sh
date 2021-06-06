#!/bin/bash

cd `dirname $0`
cd ..

# source this to run MscriptN stuff:
. /dvl/emscripten/emsdk-main/emsdk_env.sh

allCpp=`cat ../building/allCpp.list`

# note that main.cpp is NOT included in the .cpp files; that's for web use only
emcc -o quantumEngine.js -sLLD_REPORT_UNDEFINED -g \
	testing/main.test.cpp testing/qCx.test.cpp testing/rk2.test.cpp \
	$allCpp

node quantumEngine.js

