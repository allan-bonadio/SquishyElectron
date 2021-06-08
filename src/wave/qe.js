// this file generated Sun Jun 06 2021 12:17:16 GMT-0700 (Pacific Daylight Time)
let cwrap;
export const qe = {};
export function defineQEngineFuncs() {
	cwrap = window.Module.cwrap;

	qe.main = cwrap('main', "number", []);
	qe.startNewSpace = cwrap('startNewSpace', "number", []);
	qe.addSpaceDimension = cwrap('addSpaceDimension', "number", ["number","number","string"]);
	qe.completeNewSpace = cwrap('completeNewSpace', "number", []);
	qe.getWaveBuffer = cwrap('getWaveBuffer', "number", []);
	qe.getPotentialBuffer = cwrap('getPotentialBuffer', "number", []);
	qe.getElapsedTime = cwrap('getElapsedTime', "number", []);
	qe.qSpace_dumpPotential = cwrap('qSpace_dumpPotential', "number", ["string"]);
	qe.qSpace_setZeroPotential = cwrap('qSpace_setZeroPotential', "number", []);
	qe.qSpace_dumpWave = cwrap('qSpace_dumpWave', "number", ["string"]);
	qe.qSpace_setCircularWave = cwrap('qSpace_setCircularWave', "number", ["number"]);
	qe.qSpace_setStandingWave = cwrap('qSpace_setStandingWave', "number", ["number"]);
	qe.qSpace_setPulseWave = cwrap('qSpace_setPulseWave', "number", ["number","number"]);
	qe.qSpace_oneRk2Step = cwrap('qSpace_oneRk2Step', "number", []);
}

window.defineQEngineFuncs = defineQEngineFuncs;  // just in case
window.qe = qe;

export default qe;
