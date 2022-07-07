/*
** jsAvatar - the JS representations of the c++ Avatar object
** Copyright (C) 2022-2022 Tactile Interactive, all rights reserved
*/
import qe from './qe';

class jsAvatar {
	constructor(pointer) {
		// we directly access fields in this C++ object, cuz the overhead from each js-C++ call is kindof large
		this.pointer = pointer;
		this.doubles = new Float64Array(window.Module.HEAPF64.buffer, pointer);
		this.ints = new Uint32Array(window.Module.HEAPU32.buffer, pointer);
		this.bools = new Uint8Array(window.Module.HEAPU8.buffer, pointer);
	}

	/* ************************************************************************* Accessors */

	/* hopefully I don't have to mess with this all the time.  Must also divide by sizeof type.
	△ magic=0
	△ space=4
	△ elapsedTime=8
	△ iterateSerial=16
	△ dt=24
	△ lowPassFilter=32
	△ stepsPerIteration=40
	△ isIterating=44
	△ pleaseFFT=45

	△ mainQWave=48
	△ scratchQWave=52
	△ spect=56
	△ qvBuffer=60
	*/

	get waveBuffer() {
		// um, please contact your system administrator...
	}

	get elapsedTime() { return this.doubles[1]; }
	get iterateSerial() { return this.doubles[2]; }
	get dt() { return this.doubles[3]; }
	get lowPassFilter() { return this.doubles[4]; }
	get stepsPerIteration() { return this.ints[10]; }
	get isIterating() { return this.bools[44]; }
	get pleaseFFT() { return this.bools[45]; }

	set elapsedTime(a) { this.doubles[1] = a; }
	set iterateSerial(a) { this.doubles[2] = a; }
	set dt(a) { this.doubles[3] = a; }
	set lowPassFilter(a) { this.doubles[4] = a; }
	set stepsPerIteration(a) { this.ints[10] = a; }
	set isIterating(a) { this.bools[44] = a; }
	set pleaseFFT(a) { this.bools[45] = a; }
}


/* just thinking out loud here... about automating this:
	input to the mapper:
	{name: 'elapsedTime', type: 'double', offset: 8},
	{name: 'stepsPerIteration', type: 'int', offset: 40},
	{name: 'pleaseFFT', type: 'bool', offset: 45},

	or even better, hand in to JS:
	['elapsedTime',  'stepsPerIteration',  'pleaseFFT', ...]
	that gets compiled to C++ code that generates:
	{name: 'elapsedTime', type: 'double', size: 8, offset: 8},
	{name: 'stepsPerIteration', type: 'int', size: 4, offset: 40},
	{name: 'pleaseFFT', type: 'bool', size: 1, offset: 45},
	that goes thru some JS that does Object.defineOwnProperty() calls to make the JS objects with accessors.

	cool.  Maybe after I become independently wealthy...
*/
