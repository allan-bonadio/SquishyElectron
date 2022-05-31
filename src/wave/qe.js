// this file generated Wed Apr 27 2022 22:19:46 GMT-0700 (Pacific Daylight Time)
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
	qe.Timeline_getWaveBuffer = cwrap('Timeline_getWaveBuffer', 'number', []);
	qe.qSpace_getPotentialBuffer = cwrap('qSpace_getPotentialBuffer', 'number', []);
	qe.Timeline_getElapsedTime = cwrap('Timeline_getElapsedTime', 'number', []);
	qe.Timeline_getIterateSerial = cwrap('Timeline_getIterateSerial', 'number', []);
	qe.qSpace_dumpPotential = cwrap('qSpace_dumpPotential', 'number', ['string']);
	qe.qSpace_setZeroPotential = cwrap('qSpace_setZeroPotential', 'number', []);
	qe.qSpace_setValleyPotential = cwrap('qSpace_setValleyPotential', 'number', ['number','number','number']);
	qe.Timeline_setDt = cwrap('Timeline_setDt', null, ['number']);
	qe.Timeline_setStepsPerIteration = cwrap('Timeline_setStepsPerIteration', null, ['number']);
	qe.Timeline_setLowPassDilution = cwrap('Timeline_setLowPassDilution', null, ['number']);
	qe.Timeline_oneIteration = cwrap('Timeline_oneIteration', 'number', []);
	qe.Timeline_resetCounters = cwrap('Timeline_resetCounters', null, []);
	qe.qViewBuffer_getViewBuffer = cwrap('qViewBuffer_getViewBuffer', 'number', []);
	qe.qViewBuffer_loadViewBuffer = cwrap('qViewBuffer_loadViewBuffer', null, []);
	qe.qViewBuffer_dumpViewBuffer = cwrap('qViewBuffer_dumpViewBuffer', null, ['string']);
	qe.Timeline_askForFFT = cwrap('Timeline_askForFFT', null, []);
}

window.defineQEngineFuncs = defineQEngineFuncs;  // just in case
window.qe = qe;

export default qe;
