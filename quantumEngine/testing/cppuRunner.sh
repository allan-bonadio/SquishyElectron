#!/bin/bash

# this runs from the main quantumEngine directory
cd `dirname $0`
cd ..

echo CppU Test runner

# no enscriptm here!  just native C++.
#. /dvl/emscripten/emsdk-main/emsdk_env.sh

# create a space-sep list of ALL the cpp files (almost all)
#allCpp=`cat building/allCpp.list`
#
#mt=" testing/main.test.cpp testing/spaceWave/qCx.test.cpp "
#et=" testing/rk2.test.cpp testing/spaceWave/vissFlicks.test.cpp "
#swt="testing/spaceWave/space.test.cpp  testing/spaceWave/wave.test.cpp "
#allTesters=" $mt $et $swt "

export CPPUTEST_HOME=/dvl/cpputest/cpputest-3.8
#export CPPFLAGS="-I$CPPUTEST_HOME/include"
#export CXXFLAGS="-include $CPPUTEST_HOME/include/CppUTest/MemoryLeakDetectorNewMacros.h"
#export CFLAGS="-include $CPPUTEST_HOME/include/CppUTest/MemoryLeakDetectorMallocMacros.h"
#export LD_LIBRARIES="-L$CPPUTEST_HOME/lib -lCppUTest -lCppUTestExt"

g++ -o cppuTestBin \
	-I$CPPUTEST_HOME/include \
	-include $CPPUTEST_HOME/include/CppUTest/MemoryLeakDetectorNewMacros.h \
	-L$CPPUTEST_HOME/lib -lCppUTest -lCppUTestExt \
	testing/cppuMain.cpp testing/*/*.cppu.cpp \
	spaceWave/qCx.cpp \
	|| exit $?

#testing/*.cppu.cpp

# note that main.cpp is NOT included in the .cpp files; that's for web use only
# and makes all the diff.  Update list of test srcs as needed.
#emcc -o cppuTest.js -sLLD_REPORT_UNDEFINED  \
#	-g -O0 -sASSERTIONS=2 -sSAFE_HEAP=1 -sSTACK_OVERFLOW_CHECK=2 \
#	-sNO_DISABLE_EXCEPTION_CATCHING \
#	-I/dvl/cpputest/cpputest-3.8/include \
#	testing/cppuExample.cppu.cpp  \
#	|| exit $?
#
#
## now run the tests
echo ====================== done compiling ==================================
echo

# it's a real C++ program and I can use gdb!
./cppuTestBin

