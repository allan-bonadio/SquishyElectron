# makefile for quantum engine
xxxSOURCES = $(shell echo *.h *.cpp) building/exports.json

quantumEngine.js : *.h *.cpp building/exports.json building/buildDev.sh building/allCpp.list
	building/buildDev.sh

building/exports.json : building/genExports.js
	building/genExports.js

clean : quantumEngine.js quantumEngine.wasm
	rm quantumEngine.js quantumEngine.wasm

# i don't think this works
watch :
	while :; do date +%T; make; sleep 15; done


test :
	testing/runner.sh
