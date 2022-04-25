#!/bin/bash

########################################################
# cppu Unit Test Runner -- for Squishy Electron
# Copyright (C) 2022-2022 Tactile Interactive, all rights reserved


# this runs from the main quantumEngine directory
cd `dirname $0`
cd ..

echo "CppUTest Test runner: arg db=debugger; all others are assumed to be test name segments"

# https://cpputest.github.io
export CPPUTEST_HOME=/dvl/cpputest/cpputest-3.8

# no enscriptm here!  just native C++.
#. /dvl/emscripten/emsdk-main/emsdk_env.sh

# create a space-sep list of ALL the runtime cpp files (almost all)
allCpp=`cat building/allCpp.list`

# note that main.cpp is NOT included in the .cpp files; that's for web use only
# and makes all the diff.  cppuMain.cpp is the main instead.  Update list of test srcs as needed.
# some of these options - dunno if I need them
set -x
g++ -o cppuTestBin -Wno-tautological-undefined-compare  \
	-std=c++11 -fexceptions -g  -O0 \
	-I$CPPUTEST_HOME/include \
	-include $CPPUTEST_HOME/include/CppUTest/MemoryLeakDetectorNewMacros.h \
	-L$CPPUTEST_HOME/lib -lCppUTest -lCppUTestExt \
	testing/cppuMain.cpp */*.spec.cpp \
	$allCpp \
	|| exit $?
set +x

echo ====================== done compiling... start testing ==================================
echo

debug=false
while [ "$1" ]
do
	case $1 in
	db) debug=true ;;
	*) moreArgs="$moreArgs -n $1" ;;
	esac
	shift
done

if $debug
then
	#  well, lldb at least.
	lldb  -f /dvl/squishyElectron/SquishyElectron/quantumEngine/cppuTestBin -- -v -c $moreArgs
else
	# it's a real C++ program and I can use gdb!
	./cppuTestBin -v -c  $moreArgs
fi


