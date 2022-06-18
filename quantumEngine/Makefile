#
# Makefile -- makefile for quantum engine, for compiling the C++
# Copyright (C) 2022-2022 Tactile Interactive, all rights reserved
#

# makefile for
#xxxSOURCES = $(shell echo *.h *.cpp) building/exports.json

quantumEngine.js : *.cpp */*.h */*.cpp building/exports.json building/buildDev.sh building/allCpp.list
	building/buildDev.sh

building/exports.json : building/genExports.js
	building/genExports.js

clean : quantumEngine.js quantumEngine.wasm
	rm -fv quantumEngine.js quantumEngine.wasm quantumTest.js quantumTest.wasm building/exports.json

# i don't think this works
# watch :
# 	while :; do date +%T; make; sleep 15; done


test :
	testing/cppuRunner.sh
