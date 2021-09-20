#!/bin/bash

cd `dirname $0`

. /dvl/emscripten/emsdk-main/emsdk_env.sh
# also try emsdk without the -main or make a symlink

# this has all c++ & h files, except main.cpp and the testing files.
# omit those, so testing can compile & run itself.
allCpp=`cat allCpp.list`

cd ..

# https://emscripten.org/docs/tools_reference/emcc.html
emcc -o quantumEngine.js -sLLD_REPORT_UNDEFINED \
	-g -sASSERTIONS=2 -sSAFE_HEAP=1 -sSTACK_OVERFLOW_CHECK=2 \
	-sDEMANGLE_SUPPORT=1 -sNO_DISABLE_EXCEPTION_CATCHING \
	-sEXPORTED_FUNCTIONS=@building/exports.json \
	-sEXPORTED_RUNTIME_METHODS='["ccall","cwrap","getValue","setValue"]' \
	main.cpp $allCpp

cp quantumEngine.wasm quantumEngine.js ../public

exit 0

# compiler hints and links:
# https://emscripten.org/docs/tools_reference/emcc.html
# https://emscripten.org/docs/compiling/Building-Projects.html

# pthreads:
#  -s USE_PTHREADS=1
# https://emscripten.org/docs/porting/asyncify.html

# I think I really need this:
#

# -mnontrapping-fptoint
# see https://emscripten.org/docs/compiling/WebAssembly.html#trapping

# poorly documented options:
# -s WASM=0 or NO_WASM will switch over to asm.js, which is slower
# but -s WASM=1 is the default.

# some of the debug options in buildDev are explained here:
# https://emscripten.org/docs/porting/Debugging.html?highlight=assertions#compiler-settings
# and that page in general has a lot of stuff

# getting closer to production:
# https://emscripten.org/docs/compiling/Deploying-Pages.html

# in order for this to work I have to mess with the wasm mem blob
# 	-s WASM_ASYNC_COMPILATION=0 \

#aug '21:
# EXCEPTION_CATCHING_ALLOWED and NO_DISABLE_EXCEPTION_CATCHING can apparently
# allow exception catching but there's overhead each throw.
# in the short term i'm using -fexceptions

# tried this in testing but I got all these alignment problems (or maybe just messages)
# -fsanitize=undefined  \
