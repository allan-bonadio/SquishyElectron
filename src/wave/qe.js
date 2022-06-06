// this file generated Fri Jun 03 2022 23:15:24 GMT-0700 (Pacific Daylight Time)
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
	qe.Incarnation_getWaveBuffer = cwrap('Incarnation_getWaveBuffer', 'number', []);
	qe.qSpace_getPotentialBuffer = cwrap('qSpace_getPotentialBuffer', 'number', []);
	qe.Incarnation_getElapsedTime = cwrap('Incarnation_getElapsedTime', 'number', []);
	qe.Incarnation_getIterateSerial = cwrap('Incarnation_getIterateSerial', 'number', []);
	qe.Incarnation_getMaxNorm = cwrap('Incarnation_getMaxNorm', 'number', []);
	qe.qSpace_dumpPotential = cwrap('qSpace_dumpPotential', 'number', ['string']);
	qe.qSpace_setZeroPotential = cwrap('qSpace_setZeroPotential', 'number', []);
	qe.qSpace_setValleyPotential = cwrap('qSpace_setValleyPotential', 'number', ['number','number','number']);
	qe.Incarnation_setDt = cwrap('Incarnation_setDt', null, ['number']);
	qe.Incarnation_setStepsPerIteration = cwrap('Incarnation_setStepsPerIteration', null, ['number']);
	qe.Incarnation_setLowPassDilution = cwrap('Incarnation_setLowPassDilution', null, ['number']);
	qe.Incarnation_oneIteration = cwrap('Incarnation_oneIteration', 'number', []);
	qe.Incarnation_resetCounters = cwrap('Incarnation_resetCounters', null, []);
	qe.qViewBuffer_getViewBuffer = cwrap('qViewBuffer_getViewBuffer', 'number', []);
	qe.qViewBuffer_loadViewBuffer = cwrap('qViewBuffer_loadViewBuffer', null, []);
	qe.qViewBuffer_dumpViewBuffer = cwrap('qViewBuffer_dumpViewBuffer', null, ['string']);
	qe.Incarnation_askForFFT = cwrap('Incarnation_askForFFT', null, []);
	qe.Incarnation_normalize = cwrap('Incarnation_normalize', null, []);
}

window.defineQEngineFuncs = defineQEngineFuncs;  // just in case
window.qe = qe;

export default qe;
