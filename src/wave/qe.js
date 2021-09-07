// this file generated Sun Sep 05 2021 21:03:24 GMT-0700 (Pacific Daylight Time)
let cwrap;
export const qe = {};
export function defineQEngineFuncs() {
	cwrap = window.Module.cwrap;

	qe.main = cwrap('main', 'number', []);
	qe.startNewSpace = cwrap('startNewSpace', 'number', []);
	qe.addSpaceDimension = cwrap('addSpaceDimension', 'number', ['number','number','string']);
	qe.completeNewSpace = cwrap('completeNewSpace', 'number', []);
	qe.getWaveBuffer = cwrap('getWaveBuffer', 'number', []);
	qe.getPotentialBuffer = cwrap('getPotentialBuffer', 'number', []);
	qe.getViewBuffer = cwrap('getViewBuffer', 'number', []);
	qe.qSpace_getElapsedTime = cwrap('qSpace_getElapsedTime', 'number', []);
	qe.qSpace_getIterateSerial = cwrap('qSpace_getIterateSerial', 'number', []);
	qe.qSpace_dumpPotential = cwrap('qSpace_dumpPotential', 'number', ['string']);
	qe.qSpace_setZeroPotential = cwrap('qSpace_setZeroPotential', 'number', []);
	qe.qSpace_setValleyPotential = cwrap('qSpace_setValleyPotential', 'number', ['number','number','number']);
	qe.qWave_setCircularWave = cwrap('qWave_setCircularWave', 'number', ['number']);
	qe.qWave_setStandingWave = cwrap('qWave_setStandingWave', 'number', ['number']);
	qe.qWave_setPulseWave = cwrap('qWave_setPulseWave', 'number', ['number','number','number']);
	qe.qWave_dumpWave = cwrap('qWave_dumpWave', 'number', ['string']);
	qe.qSpace_oneIntegrationStep = cwrap('qSpace_oneIntegrationStep', 'number', []);
	qe.qSpace_setAlgorithm = cwrap('qSpace_setAlgorithm', 'number', ['number']);
}

window.defineQEngineFuncs = defineQEngineFuncs;  // just in case
window.qe = qe;

export default qe;
