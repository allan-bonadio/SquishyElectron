#!/bin/bash

cd `dirname $0`

# source this to run MscriptN stuff:
. /dvl/emscripten/emsdk-main/emsdk_env.sh

. allCpp.sh


emcc -o quantumEngine.js -sLLD_REPORT_UNDEFINED \
	-O1 -flto  \
	main.cpp "$allCpp" EXPORTED_FUNCTIONS="$exportedFunctions"

cp quantumEngine.wasm quantumEngine.js ../public

