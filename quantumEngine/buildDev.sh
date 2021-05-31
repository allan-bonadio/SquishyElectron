#!/bin/bash

cd `dirname $0`

# source this to run MscriptN stuff:
. /dvl/emscripten/emsdk-main/emsdk_env.sh

. allCpp.sh

emcc -o quantumEngine.js -sLLD_REPORT_UNDEFINED \
	-g -sASSERTIONS=1 \
	-s EXPORTED_FUNCTIONS=@./expFuncs.json \
	-s EXPORTED_RUNTIME_METHODS=cwrap \
	main.cpp $allCpp

#	-s EXPORTED_FUNCTIONS="[_main,addSpaceDimension,startNewSpace,completeNewSpace,getTheWave,getThePotential,getElapsedTime]" \
#	-g -sASSERTIONS=1 -sEXPORTED_FUNCTIONS="$exportedFuncs" \
# 	-s EXPORTED_FUNCTIONS='["_main","_getQuantumSizes"]' \
# 	-s EXPORTED_RUNTIME_METHODS='["ccall","cwrap"]'

cp quantumEngine.wasm quantumEngine.js ../public
