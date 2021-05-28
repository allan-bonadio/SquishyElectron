/*
** q Engine - main interface in JS to the quantumEngine
*/

// all of these must be attached to window to  get called by c++


//getQuantumSizes = Module.cwrap('getQuantumSizes', 'number', ['number'])


// set up everything?
function quantumInit() {
	// first call them to return the sizes of different data structures.
	// (qspace can change components; FLOAT and therefore cx can change length)
	let sizes = new Int32Array(5);
	//getQuantumSizes(sizes);
	console.log(`so the quantum sizes i gt back are:`, sizes);
}

// iterate ODE once over Δt
function quantumAdvance() {

}

/* ****************************************************** space buffer */

// these are set on space (re)creation, and never change until next recreation
export let qSpace;
export let qWaves;
export let qPotential;

// these are set on app startup, as soon as the C++ engine runs main() to start up.
// and never change.  Although recreation changes the above variables.
let spaceBuffer, headerLen,
	sizeofFloat, sizeofComplex,
	maxDimensions, maxLabel,
	sizeofDimension, sizeofQuantumSpace;


// this mimics the C++ dimension object
class quantumDimension {
	constructor(offset) {
		this.ints = new Uint32Array(spaceBuffer, offset, 24);
		this.chars = new Uint8Array(spaceBuffer, offset + 24, );
	}

	get N() {return this.ints[0]}
	set N(f) {this.ints[0] = f}

	get nStates() {return this.ints[1]}
	set nStates(f) {this.ints[1] = f}

	get continuum() {return this.ints[2]}
	set continuum(f) {this.ints[2] = f}

	get label() {return window.UTF8ToString(this.chars)}
	set label(str) {
		window.stringToUTF8(str, this.chars, maxLabel);

	}

	// UTF8ToString

	// continuum values
	static contDISCRETE = 0;
	static contWELL = 1;
	static contCIRCULAR = 2;
}

// this mimics the C++ space object
class quantumSpace {
	constructor() {
		// potential a separate array
		this.cFrom = new Uint32Array(spaceBuffer, 0, 4);
		this.elaps = new Float64Array(spaceBuffer, 4, 8);
	}

	get calcFrom() {return this.cFrom[0]}
	set calcFrom(f) {this.cFrom[0] = f}

	get elapsed() {return this.elaps[0]}
	set elapsed(f) {this.elaps[0] = f}
}

// recreate all the buffers for the space, waves and potential
function recreateSpace(
	sFloat, sComplex,
	mDimensions, mLabel,
	sDimension, sQuantumSpace) {

	console.log(`quantumEngineHas...Started`,
		sFloat, sComplex, mDimensions, mLabel, sDimension, sQuantumSpace);
	//quantumInit();

	// now we use TypedArray voodoo to construct the Space structure.
	spaceBuffer = new ArrayBuffer(sQuantumSpace);
	headerLen = sQuantumSpace - sDimension * sDimension;

	sizeofFloat = sFloat;
	sizeofComplex = sComplex;
	maxDimensions = mDimensions;
	maxLabel = mLabel;
	sizeofDimension = sDimension;
	sizeofQuantumSpace = sQuantumSpace;
};

// does this to tell us that the C++ has started
function quantumEngineHasStarted(
	sFloat, sComplex,
	mDimensions, mLabel,
	sDimension, sQuantumSpace) {

	console.log(`quantumEngineHas...Started`,
		sFloat, sComplex, mDimensions, mLabel, sDimension, sQuantumSpace);
	//quantumInit();

	// now we use TypedArray voodoo to construct the Space structure.
	spaceBuffer = new ArrayBuffer(sQuantumSpace);
	headerLen = sQuantumSpace - sDimension * sDimension;

	sizeofFloat = sFloat;
	sizeofComplex = sComplex;
	maxDimensions = mDimensions;
	maxLabel = mLabel;
	sizeofDimension = sDimension;
	sizeofQuantumSpace = sQuantumSpace;
};
window.quantumEngineHasStarted = quantumEngineHasStarted;

