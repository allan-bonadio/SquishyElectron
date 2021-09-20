#!/bin/bash

cd `dirname $0`
cd ..

echo "q test runner. Just run it from any directory, no args needed"
echo "Read src to verify.  (must add new test srcs to this file)"
echo "add in argument of --inspect or --inspect-brk or any other node args"

# source this to run MscriptN stuff:
. /dvl/emscripten/emsdk-main/emsdk_env.sh

# create a space-sep list of ALL the cpp files (almost all)
allCpp=`cat building/allCpp.list`

mt=" testing/main.test.cpp testing/qCx.test.cpp "
et=" testing/rk2.test.cpp testing/vissFlicks.test.cpp "
swt="testing/space.test.cpp  testing/wave.test.cpp "
allTesters=" $mt $et $swt "

# note that main.cpp is NOT included in the .cpp files; that's for web use only
# and makes all the diff.  Update list of test srcs as needed.
emcc -o quantumTest.js -sLLD_REPORT_UNDEFINED -g \
	-g -sASSERTIONS=2 -sSAFE_HEAP=1 -sSTACK_OVERFLOW_CHECK=2 \
	-sNO_DISABLE_EXCEPTION_CATCHING \
	$allTesters \
	$allCpp \
	|| exit $?

# added/removed mid sept: 	-fsanitize=undefined


# now run the tests
echo
echo ========================================================================
echo ========================================================== Results:
echo ========================================================================


node $* quantumTest.js


