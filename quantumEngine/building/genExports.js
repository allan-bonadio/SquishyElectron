#!/usr/bin/env node
/*
** blah blah -- like a source file for Squishy Electron
** Copyright (C) 2021-2021 Tactile Interactive, all rights reserved
*/

if (! process.env.SQUISH_ROOT) throw "SQUISH_ROOT not defined!";

console.log(`Run this whenever the list of C++ functions to call from JS changes.`)
const fs = require('fs');

// the exports list.
// in C++: each function must be declared 'export "C" ...'
// in JS: import qe from 'wave/qe', then use qe.funcname()
// also must call defineQEngineFuncs after C++ is initialized
exportsSrc  = [
	// args and retType can be 'number', 'string', 'array' (of bytes), or null meaning void.
	// That's all.  Anything more complex, you have to make up out of those with multiple calls.
	{name: 'main', retType: 'number', args: []},

	// recreating the space
	{name: 'startNewSpace', retType: 'number', args: []},
	{name: 'addSpaceDimension', retType: 'number',
		args: ['number', 'number', 'string']},
	{name: 'completeNewSpace', retType: 'number', args: []},

	// gets
	{name: 'getWaveBuffer', retType: 'number', args: []},
	{name: 'getPotentialBuffer', retType: 'number', args: []},
	{name: 'getViewBuffer', retType: 'number', args: []},

	// the qSpace ones act on theSpace in the c++ code
	{name: 'qSpace_getElapsedTime', retType: 'number', args: []},
	{name: 'qSpace_getIterateSerial', retType: 'number', args: []},

	// the potential
	{name: 'qSpace_dumpPotential', retType: 'number', args: ['string']},
	{name: 'qSpace_setZeroPotential', retType: 'number', args: []},
	{name: 'qSpace_setValleyPotential', retType: 'number', args: ['number', 'number', 'number']},

	// params
	{name: 'qSpace_setDt', retType: null, args: ['number']},
	{name: 'qSpace_setStepsPerIteration', retType: null, args: ['number']},

	{name: 'qSpace_oneIteration', retType: 'number', args: []},
	{name: 'qSpace_resetCounts', retType: null, args: []},



	// views
	{name: 'refreshViewBuffer', retType: 'number', args: []},

];

// remember you don't have to export your func like this, you can do one-offs for testing with ccall():
// https://emscripten.org/docs/api_reference/preamble.js.html#calling-compiled-c-functions-from-javascript

// the exports.json file, needed by emcc
let exportsFile = exportsSrc.map(funcDesc => '_' + funcDesc.name);
fs.writeFile(`${process.env.SQUISH_ROOT}/quantumEngine/building/exports.json`,
	JSON.stringify(exportsFile) + '\n',
	ex => ex && console.error('error building exports:', ex));

// the JS file.  convert json's " to '
let defineFuncBody = exportsSrc.map(funcDesc => {
	return `\tqe.${funcDesc.name} = cwrap('${funcDesc.name}', `+
		`${JSON.stringify(funcDesc.retType).replace(/\x22/g, '\x27')}, `+
		`${JSON.stringify(funcDesc.args).replace(/\x22/g, '\x27')});`;
});


const code = `// this file generated ${new Date()}
// by the file SquishyElectron/quantumEngine/building/genExports.js
let cwrap;
export const qe = {};
export function defineQEngineFuncs() {
	cwrap = window.Module.cwrap;

${defineFuncBody.join('\n')}
}

window.defineQEngineFuncs = defineQEngineFuncs;  // just in case
window.qe = qe;

export default qe;
`;

fs.writeFile(`${process.env.SQUISH_ROOT}/src/wave/qe.js`, code,
	ex => ex && console.error(ex));

