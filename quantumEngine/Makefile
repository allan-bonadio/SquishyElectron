# makefile for quantum engine
xxxSOURCES = $(shell echo *.h *.cpp) building/exports.json

quantumEngine.js : *.h *.cpp building/exports.json building/buildDev.sh
	building/buildDev.sh

building/exports.json : building/buildExports.js
	building/buildExports.js

clean : quantumEngine.js quantumEngine.wasm
	rm quantumEngine.js quantumEngine.wasm

watch :
	while :; do date +%T; make; sleep 15; done

