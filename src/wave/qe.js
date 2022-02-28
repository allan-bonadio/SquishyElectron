// this file generated Sat Feb 26 2022 13:44:57 GMT-0800 (Pacific Standard Time)
// by the file SquishyElectron/quantumEngine/building/genExports.js
let cwrap;
export const qe = {};
export function defineQEngineFuncs() {
	cwrap = window.Module.cwrap;

	qe.main = cwrap('main', 'number', []);
	qe.startNewSpace = cwrap('startNewSpace', 'number', []);
	qe.addSpaceDimension = cwrap('addSpaceDimension', 'number', ['number','number','string']);
	qe.completeNewSpace = cwrap('completeNewSpace', 'number', []);
	qe.qSpace_getWaveBuffer = cwrap('qSpace_getWaveBuffer', 'number', []);
	qe.qSpace_getPotentialBuffer = cwrap('qSpace_getPotentialBuffer', 'number', []);
	qe.qSpace_getElapsedTime = cwrap('qSpace_getElapsedTime', 'number', []);
	qe.qSpace_getIterateSerial = cwrap('qSpace_getIterateSerial', 'number', []);
	qe.qSpace_dumpPotential = cwrap('qSpace_dumpPotential', 'number', ['string']);
	qe.qSpace_setZeroPotential = cwrap('qSpace_setZeroPotential', 'number', []);
	qe.qSpace_setValleyPotential = cwrap('qSpace_setValleyPotential', 'number', ['number','number','number']);
	qe.qSpace_setDt = cwrap('qSpace_setDt', null, ['number']);
	qe.qSpace_setStepsPerIteration = cwrap('qSpace_setStepsPerIteration', null, ['number']);
	qe.qSpace_setLowPassDilution = cwrap('qSpace_setLowPassDilution', null, ['number']);
	qe.qSpace_oneIteration = cwrap('qSpace_oneIteration', 'number', []);
	qe.qSpace_resetCounters = cwrap('qSpace_resetCounters', null, []);
	qe.qViewBuffer_getViewBuffer = cwrap('qViewBuffer_getViewBuffer', 'number', []);
	qe.qViewBuffer_loadViewBuffer = cwrap('qViewBuffer_loadViewBuffer', null, []);
	qe.qViewBuffer_dumpViewBuffer = cwrap('qViewBuffer_dumpViewBuffer', null, ['string']);
	qe.testFFT = cwrap('testFFT', null, []);
	qe.askForFFT = cwrap('askForFFT', null, []);
}

window.defineQEngineFuncs = defineQEngineFuncs;  // just in case
window.qe = qe;

export default qe;
