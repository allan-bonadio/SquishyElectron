#!/bin/bash

# according to informal benchmarks run June 5, 2021, the C++
# version of RK2 is 5x or 6x faster than the JS version.  ha.

cd `dirname $0`

. /dvl/emscripten/emsdk-main/emsdk_env.sh
# also try emsdk without the -main or make a symlink

. allCpp.sh

cd ..

# see also comments at the end of buildDev.sh
emcc -o quantumEngine.js -sLLD_REPORT_UNDEFINED \
	-O3 -s ASSERTIONS=0 \
	-s EXPORTED_FUNCTIONS=@building/exports.json \
	-s EXPORTED_RUNTIME_METHODS='["ccall","cwrap"]' \
	main.cpp $allCpp

cp quantumEngine.wasm quantumEngine.js ../public

