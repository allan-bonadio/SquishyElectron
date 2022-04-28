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
	qe.Manifestation_getWaveBuffer = cwrap('Manifestation_getWaveBuffer', 'number', []);
	qe.qSpace_getPotentialBuffer = cwrap('qSpace_getPotentialBuffer', 'number', []);
	qe.Manifestation_getElapsedTime = cwrap('Manifestation_getElapsedTime', 'number', []);
	qe.Manifestation_getIterateSerial = cwrap('Manifestation_getIterateSerial', 'number', []);
	qe.qSpace_dumpPotential = cwrap('qSpace_dumpPotential', 'number', ['string']);
	qe.qSpace_setZeroPotential = cwrap('qSpace_setZeroPotential', 'number', []);
	qe.qSpace_setValleyPotential = cwrap('qSpace_setValleyPotential', 'number', ['number','number','number']);
	qe.Manifestation_setDt = cwrap('Manifestation_setDt', null, ['number']);
	qe.Manifestatation_setStepsPerIteration = cwrap('Manifestatation_setStepsPerIteration', null, ['number']);
	qe.Manifestatation_setLowPassDilution = cwrap('Manifestatation_setLowPassDilution', null, ['number']);
	qe.Manifestation_oneIteration = cwrap('Manifestation_oneIteration', 'number', []);
	qe.Manifestation_resetCounters = cwrap('Manifestation_resetCounters', null, []);
	qe.qViewBuffer_getViewBuffer = cwrap('qViewBuffer_getViewBuffer', 'number', []);
	qe.qViewBuffer_loadViewBuffer = cwrap('qViewBuffer_loadViewBuffer', null, []);
	qe.qViewBuffer_dumpViewBuffer = cwrap('qViewBuffer_dumpViewBuffer', null, ['string']);
	qe.Manifestation_askForFFT = cwrap('Manifestation_askForFFT', null, []);
}

window.defineQEngineFuncs = defineQEngineFuncs;  // just in case
window.qe = qe;

export default qe;
