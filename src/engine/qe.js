// this file generated Sat Jun 11 2022 11:49:02 GMT-0700 (Pacific Daylight Time)
// by the file SquishyElectron/quantumEngine/building/genExports.js
let cwrap;
export const qe = {};
export function defineQEngineFuncs() {
	cwrap = window.Module.cwrap;

	qe.main = cwrap('main', 'number', []);
	qe.startNewSpace = cwrap('startNewSpace', 'number', ['string']);
	qe.addSpaceDimension = cwrap('addSpaceDimension', null, ['number','number','string']);
	qe.completeNewSpace = cwrap('completeNewSpace', 'number', []);
	qe.deleteTheSpace = cwrap('deleteTheSpace', null, []);
	qe.Avatar_getWaveBuffer = cwrap('Avatar_getWaveBuffer', 'number', []);
	qe.qSpace_getPotentialBuffer = cwrap('qSpace_getPotentialBuffer', 'number', []);
	qe.Avatar_getElapsedTime = cwrap('Avatar_getElapsedTime', 'number', []);
	qe.Avatar_getIterateSerial = cwrap('Avatar_getIterateSerial', 'number', []);
	qe.qSpace_dumpPotential = cwrap('qSpace_dumpPotential', 'number', ['string']);
	qe.qSpace_setZeroPotential = cwrap('qSpace_setZeroPotential', 'number', []);
	qe.qSpace_setValleyPotential = cwrap('qSpace_setValleyPotential', 'number', ['number','number','number']);
	qe.Avatar_setDt = cwrap('Avatar_setDt', null, ['number']);
	qe.Avatar_setStepsPerIteration = cwrap('Avatar_setStepsPerIteration', null, ['number']);
	qe.Avatar_setLowPassFilter = cwrap('Avatar_setLowPassFilter', null, ['number']);
	qe.Avatar_oneIteration = cwrap('Avatar_oneIteration', 'number', []);
	qe.Avatar_resetCounters = cwrap('Avatar_resetCounters', null, []);
	qe.qViewBuffer_getViewBuffer = cwrap('qViewBuffer_getViewBuffer', 'number', []);
	qe.qViewBuffer_loadViewBuffer = cwrap('qViewBuffer_loadViewBuffer', 'number', []);
	qe.qViewBuffer_dumpViewBuffer = cwrap('qViewBuffer_dumpViewBuffer', null, ['string']);
	qe.Avatar_askForFFT = cwrap('Avatar_askForFFT', null, []);
	qe.Avatar_normalize = cwrap('Avatar_normalize', null, []);
}

window.defineQEngineFuncs = defineQEngineFuncs;  // just in case
window.qe = qe;

export default qe;
