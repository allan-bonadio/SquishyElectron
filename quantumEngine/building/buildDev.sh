#!/bin/bash

cd `dirname $0`

# source this to run MscriptN stuff:
. /dvl/emscripten/emsdk-main/emsdk_env.sh

. allCpp.sh

cd ..

emcc -o quantumEngine.js -sLLD_REPORT_UNDEFINED \
	-g -sASSERTIONS=1 \
	-s EXPORTED_FUNCTIONS=@building/expFuncs.json \
	-s EXPORTED_RUNTIME_METHODS='["ccall","cwrap"]' \
	main.cpp $allCpp

cp quantumEngine.wasm quantumEngine.js ../public
