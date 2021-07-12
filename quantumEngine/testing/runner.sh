#!/bin/bash

cd `dirname $0`
cd ..

echo "q test runner. Just run it from any directory, no args "
echo "Read src to verify."
# source this to run MscriptN stuff:
. /dvl/emscripten/emsdk-main/emsdk_env.sh

# create a space-sep list of all the cpp files (almost all)
allCpp=`cat building/allCpp.list`

# note that main.cpp is NOT included in the .cpp files; that's for web use only
# and makes all the diff.  Update list of test srcs as needed.
emcc -o quantumEngine.js -sLLD_REPORT_UNDEFINED -g \
	testing/main.test.cpp \
	testing/qCx.test.cpp testing/rk2.test.cpp testing/wave.test.cpp \
	$allCpp \
	|| exit $?

# now run the tests
echo
echo ========================================================== Results:
node quantumEngine.js
