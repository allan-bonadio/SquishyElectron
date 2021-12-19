/*
** qeSpace - the JS representations of the c++ qSpace object
** Copyright (C) 2021-2021 Tactile Interactive, all rights reserved
*/
import qe from './qe';


// call like this:
// new qeSpace([{N: 100, continuum: qeSpace.contENDLESS, label: 'x', coord: 'x'}])
// labels must be unique.
// Coords are the same if two dims are parallel, eg two particles with x coords.
// Not the same if one particle with x and y coords; eg you could have an endless canal.
export class qeSpace {
	static contDISCRETE = 0;
	static contWELL = 1;
	static contENDLESS = 2;

	static contCodeToText = code => ['discrete', 'Well', 'Endless'][code];

	constructor(dims) {
		this.dimensions = dims.map(dim => {
			let d = {...dim};
			if (d.continuum != 'discrete') {
				d.start = 1;
				d.end = d.N + 1;
			}
			else {
				d.start = 0;
				d.end = d.N;
			}
			d.nStates = d.N;
			d.nPoints = d.start + d.end;

			return d;
		});

		// this actually does it over on the C++ side
		let nPoints = 1, nStates = 1;
		qe.startNewSpace();
		dims.forEach(dim => {
			qe.addSpaceDimension(dim.N, dim.continuum, dim.label);
			nPoints *= dim.N + (dim.continuum ? 2 : 0);
			nStates *= dim.N;
		});
		qe.completeNewSpace();
		this.nPoints = nPoints;
		this.nStates = nStates;

		// qeDefineAccess() will set this
		this.waveBuffer = null;

		// this will be good after completeNewSpace() is called
		this.potentialBuffer = qe.getPotentialBuffer();

		// a nice TypedArray of floats (4 for each row; 8 for each datapoint)
		this.viewBuffer = qe.viewBuffer =
			new Float32Array(window.Module.HEAPF32.buffer, qe.getViewBuffer(), nPoints*8);
		//console.log(`qeSpace viewBuffer:`, this.viewBuffer);
	}

}


export default qeSpace;
