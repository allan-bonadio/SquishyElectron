/*
** flatDrawingViewDef -- Main drawer for 2d image of 1d space
** Copyright (C) 2021-2021 Tactile Interactive, all rights reserved
*/

import drawingViewDef from './drawingViewDef';
import flatDrawing from './flatDrawing';
import potentialDrawing from './potentialDrawing';


class flatDrawingViewDef extends drawingViewDef {
	static viewName: 'flatDrawingViewDef';
	static viewClassName: 'flatDrawingViewDef';

	constructor(viewName, canvas, space) {
		super(viewName, canvas, space);

		if (! this.space) throw  `flatDrawingViewDef: being created without space`;

		// create relevant drawings
		new flatDrawing(this, space);
		new potentialDrawing(this, space);


		// these changing should trigger a redrawing of its contents (ie webgl)
		this.curUnitHeight = 1;  // always what's displayed
		this.targetUnitHeight = 1;  // always a power of 2; only changes cuz highest
	}

	// this is called 60x per second or whatever requestAnimationFrame() does.
	// If it needs a redraw, returns true.
	ifNeedsPaint(highest) {
		// do we need another draw?  (are we in motion?)
		let onceMore = false;

		// adjust our unit height?
		const highestHeight = highest * this.targetUnitHeight;
		if (highestHeight > 1.) {
			debugger;
			this.targetUnitHeight /= 2;
			onceMore = true;
		}
		else if (highestHeight < .125) {
			debugger;
			this.targetUnitHeight *= 2;
			onceMore = true;
		}

		// exponential relaxation
		if (this.curUnitHeight != this.targetUnitHeight) {
			this.curUnitHeight = (15 * this.curUnitHeight + this.targetUnitHeight) / 16;
			if (Math.abs((this.curUnitHeight - this.targetUnitHeight) / this.targetUnitHeight) < .01) {
				//ok we're done.  close enough.
				this.curUnitHeight = this.targetUnitHeight;
			}
			onceMore = true;  // just to make sure it paints
		}

		return onceMore;
	}
}

flatDrawingViewDef.viewClassName = 'flatDrawingViewDef';

export default flatDrawingViewDef;

