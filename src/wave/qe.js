// this file generated Sun Apr 24 2022 15:18:15 GMT-0700 (Pacific Daylight Time)
// by the file SquishyElectron/quantumEngine/building/genExports.js
let cwrap;
export const qe = {};
export function defineQEngineFuncs() {
	cwrap = window.Module.cwrap;

	qe.main = cwrap('main', 'number', []);
	qe.startNewSpace = cwrap('startNewSpace', 'number', ['string']);
	qe.addSpaceDimension = cwrap('addSpaceDimension', 'number', ['number','number','string']);
	qe.completeNewSpace = cwrap('completeNewSpace', 'number', []);
	qe.deleteTheSpace = cwrap('deleteTheSpace', null, []);
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
	qe.qSpace_askForFFT = cwrap('qSpace_askForFFT', null, []);
}

window.defineQEngineFuncs = defineQEngineFuncs;  // just in case
window.qe = qe;

export default qe;
