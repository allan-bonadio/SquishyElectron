/*
** q Engine - main interface in JS to the quantumEngine
*/

// all of these must be attached to window to  get called by c++

/* ****************************************************** app startup */

// c++ main() calls us to tell us that it's up, and to pass the sizes of different data structures.
// (qspace can change; qReal and therefore qCx can change length)
let sizeofReal, sizeofComplex,
	maxDimensions, maxLabel,
	sizeofDimension, sizeofSpace;

let qeStartPromiseSucceed;

function quantumEngineHasStarted(
	sReal, sComplex,
	mDimensions, mLabel,
	sDimension, sQuantumSpace) {

	debugger;

	console.log(`quantumEngineHas...Started`,
		sReal, sComplex, mDimensions, mLabel, sDimension, sQuantumSpace);

	sizeofReal = sReal;
	sizeofComplex = sComplex;
	maxDimensions = mDimensions;
	maxLabel = mLabel;
	sizeofDimension = sDimension;
	sizeofSpace = sQuantumSpace;

//	headerLen = sQuantumSpace - mDimensions * sDimension;

	qeStartPromiseSucceed(sizeofSpace);

};
window.quantumEngineHasStarted = quantumEngineHasStarted;

export const qeStartPromise = new Promise((succeed, fail) => {
	qeStartPromiseSucceed = succeed;
	console.info(`nuthin to do here`, succeed, fail);
});


/* ****************************************************** space buffer */

// these aren't the JS objects that are easy to use; these are the byte buffers that
// the C++ engine uses.
// these are set on space (re)creation, and never change until next recreation
export let theQSpaceBuffer;
export let theQWavesBuffer;
export let theQPotentialBuffer;

// this mimics and accesses the C++ qDimension object.  dim is an obj like this:
//    {N: 100, continuum: qDimension.contCIRCULAR, label: 'x'}
export class qDimension {
	constructor(offset, dim) {
		debugger;

		// it's some int32s, then a maxLabel-long byte string in utf8
		let intBytes = sizeofDimension - maxLabel;
		this.ints = new Uint32Array(theQSpaceBuffer, offset, intBytes/4);
		offset += intBytes;
		this.chars = new Uint8Array(theQSpaceBuffer, offset, maxLabel);

		// simplified for now
		this.ints[0] = this.ints[1] = dim.N;  // N and nStates
		this.ints[2] = dim.continuum;
		this.label = window.stringToUTF8(dim.label, this.chars, maxLabel);
	}

	// number of datapoints in just this dimension
	get N() {return this.ints[0]}
	//set N(a) {this.ints[0] = a}

	// accumulated number of points in this and the following dimensions
	get nStates() {return this.ints[1]}
	//set nStates(a) {this.ints[1] = a}

	// continuum values - continuous (like x) or discrete (like spin).  false = discrete
	static contDISCRETE = 0;
	static contWELL = 1;
	static contCIRCULAR = 2;
	get continuum() {return this.ints[2]}
	// you can't change this!! set continuum(a) {this.ints[2] = a}

	// stored in unsigned bytes, utf8
	get label() {return window.UTF8ToString(this.chars)}
}

// this mimics and  accesses the C++ space object; we allocate them here and construct the JS analogues
// call like this: new qSpace([{N: 100, continuum: contCIRCULAR, label: 'x'}])
export class qSpace {
	constructor(dims) {
		debugger;

		// this should someday be a ArrayBuffer or Uint8Array, but for now I want  to see it in the debugger
		//theQSpaceBuffer = new Int32Array(sizeofSpace/4);
		//theQSpaceBuffer = new Uint8Array(sizeofSpace);
		theQSpaceBuffer = new ArrayBuffer(sizeofSpace);
		let offset = 0;

		this.ints = new Uint32Array(theQSpaceBuffer, offset, 8);
		offset += 8;

		this.elaps = new Float64Array(theQSpaceBuffer, offset, 8);
		offset += 8;

		if (dims.length > maxDimensions)
			throw `dims.length ${dims.length} > maxDimensions ${maxDimensions}`;
		this.dimensions = dims.map(dim => {
			let qd = new qDimension(offset, dim);
			offset += sizeofDimension;
			return qd;
		});
		this.ints[0] = dims.length;  // nDimensions
		this.ints[1] = 0;  // calcFrom
		this.elapsed = 0;
	}

	get nDimensions() {return this.ints[0]}
	get calcFrom() {return this.ints[1]}

	get elapsed() {return this.elaps[0]}
	set elapsed(f) {this.elaps[0] = f}

	// go ahead and retrieve the qDimensions directly from this.dimensions
}

export default qSpace;

// recreate all the buffers for the space, waves and potential
//function recreateSpace(sDimensions = 1, sLabel = 'x') {
//
//	console.log(`recreateSpace`,
//		sReal, sComplex, mDimensions, mLabel, sDimension, sQuantumSpace);
//	//quantumInit();
//
//	// now we use TypedArray voodoo to construct the Space structure.
//	theQSpaceBuffer = new ArrayBuffer(sQuantumSpace);
//	headerLen = sQuantumSpace - sDimension * sDimension;
//
//	sizeofReal = sReal;
//	sizeofComplex = sComplex;
//	maxDimensions = mDimensions;
//	maxLabel = mLabel;
//	sizeofDimension = sDimension;
//	sizeofSpace = sQuantumSpace;
//};

