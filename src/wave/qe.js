// this file generated Fri Jun 04 2021 23:54:04 GMT-0700 (Pacific Daylight Time)
let cwrap;
export const qe = {};
export function defineQEngineFuncs() {
	cwrap = window.Module.cwrap;

	qe.main = cwrap('main', "number", []);
	qe.startNewSpace = cwrap('startNewSpace', "number", []);
	qe.addSpaceDimension = cwrap('addSpaceDimension', "number", ["number","number","string"]);
	qe.completeNewSpace = cwrap('completeNewSpace', "number", []);
	qe.getTheWave = cwrap('getTheWave', "number", []);
	qe.getThePotential = cwrap('getThePotential', "number", []);
	qe.getElapsedTime = cwrap('getElapsedTime', "number", []);
	qe.qSpace_dumpPotential = cwrap('qSpace_dumpPotential', "number", ["string"]);
	qe.qSpace_setZeroPotential = cwrap('qSpace_setZeroPotential', "number", []);
	qe.qSpace_dumpWave = cwrap('qSpace_dumpWave', "number", ["string"]);
	qe.qSpace_setCircularWave = cwrap('qSpace_setCircularWave', "number", ["number"]);
	qe.qSpace_setStandingWave = cwrap('qSpace_setStandingWave', "number", ["number"]);
	qe.qSpace_setWavePacket = cwrap('qSpace_setWavePacket', "number", ["number","number"]);
	qe.qSpace_oneRk2Step = cwrap('qSpace_oneRk2Step', "number", []);
	qe.manyRk2Steps = cwrap('manyRk2Steps', "number", []);
}

window.defineQEngineFuncs = defineQEngineFuncs;  // just in case
window.qe = qe;

export default qe;
