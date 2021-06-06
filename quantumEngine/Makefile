
xxxSOURCES = $(shell echo *.h *.cpp) building/exports.json

quantumEngine.js : *.h *.cpp
	building/buildDev.sh

building/exports.json : building/buildExports.js
	building/buildExports.js
