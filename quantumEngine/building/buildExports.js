#!/usr/bin/env node

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
	{name: 'getTheWave', retType: 'number', args: []},
	{name: 'getThePotential', retType: 'number', args: []},
	{name: 'getElapsedTime', retType: 'number', args: []},

	// the potential
	{name: 'qSpace_dumpPotential', retType: 'number', args: ['string']},
	{name: 'qSpace_setZeroPotential', retType: 'number', args: []},

	// the wave
	{name: 'qSpace_dumpWave', retType: 'number', args: ['string']},
	{name: 'qSpace_setCircularWave', retType: 'number', args: ['number']},
	{name: 'qSpace_setStandingWave', retType: 'number', args: ['number']},
	{name: 'qSpace_setPulseWave', retType: 'number', args: ['number', 'number']},
	{name: 'qSpace_oneRk2Step', retType: 'number', args: []},
];

// remember you don't have to export your func like this, you can do one-offs for testing with ccall():
// https://emscripten.org/docs/api_reference/preamble.js.html#calling-compiled-c-functions-from-javascript

// the exports.json file, needed by emcc
let exportsFile = exportsSrc.map(funcDesc => '_' + funcDesc.name);
fs.writeFile(`${process.env.SQUISHY_ROOT}/quantumEngine/building/exports.json`,
	JSON.stringify(exportsFile),
	ex => ex && console.error('error building exports:', ex));

// the JS file
let defineFuncBody = exportsSrc.map(funcDesc => {
	return `\tqe.${funcDesc.name} = cwrap('${funcDesc.name}', `+
		`${JSON.stringify(funcDesc.retType)}, `+
		`${JSON.stringify(funcDesc.args)});`;
	'_' + name
});

const code = `// this file generated ${new Date()}
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

process.env.SQUISHY_ROOT
fs.writeFile(`${process.env.SQUISHY_ROOT}/src/wave/qe.js`, code,
	ex => ex && console.error(ex));

