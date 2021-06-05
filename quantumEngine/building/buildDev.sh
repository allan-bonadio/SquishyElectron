#!/bin/bash

cd `dirname $0`

# source this to run MscriptN stuff:
. /dvl/emscripten/emsdk-main/emsdk_env.sh
# also try emsdk without the -main or make a symlink

. allCpp.sh

cd ..

emcc -o quantumEngine.js -sLLD_REPORT_UNDEFINED \
	-g -sASSERTIONS=1 \
	-s EXPORTED_FUNCTIONS=@building/exports.json \
	-s EXPORTED_RUNTIME_METHODS='["ccall","cwrap"]' \
	main.cpp $allCpp

cp quantumEngine.wasm quantumEngine.js ../public

