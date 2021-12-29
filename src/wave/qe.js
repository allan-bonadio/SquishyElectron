// this file generated Wed Dec 29 2021 07:11:19 GMT-0800 (Pacific Standard Time)
// by the file SquishyElectron/quantumEngine/building/genExports.js
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
	qe.qSpace_setDt = cwrap('qSpace_setDt', null, ['number']);
	qe.qSpace_setStepsPerIteration = cwrap('qSpace_setStepsPerIteration', null, ['number']);
	qe.qSpace_oneIteration = cwrap('qSpace_oneIteration', 'number', []);
	qe.qSpace_resetCounts = cwrap('qSpace_resetCounts', null, []);
	qe.refreshViewBuffer = cwrap('refreshViewBuffer', 'number', []);
}

window.defineQEngineFuncs = defineQEngineFuncs;  // just in case
window.qe = qe;

export default qe;
