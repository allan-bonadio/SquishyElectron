/*
** drawing view def -- A viewDef for drawing individual subclasses of abstractDrawing
** Copyright (C) 2021-2022 Tactile Interactive, all rights reserved
*/

// TRYING to make this obsolete by merging it into abstractViewDef

import abstractViewDef from './abstractViewDef';

// a view that does nothing but house its drawings
class drawingViewDef extends abstractViewDef {
	static viewName: 'drawingViewDef';
	static viewClassName: 'drawingViewDef';
	viewClassName: 'drawingViewDef';

	constructor(viewName, canvas, space) {
		super(viewName, canvas, space);

		// all of the drawings in this view
		// they get prepared, and drawn, in this same order
		this.drawings = [];

		// optional
		this.space = space;

		// your constructor runs after this and you should fill the drawings
		// array with the drawings you want.
	}

	// this does shaders and inputs, iterating thru the list
	setShaders() {
		//console.log('setShaders drawings', this.drawings);
		//console.dir(this.drawings);

		this.drawings.forEach(drawing => {
			//console.log('drawing.setShaders', drawing);
			//console.dir(drawing);

			drawing.setShaders();
		});

	}

	setInputs() {
		//console.log('setInputs drawings', this.drawings);
		//console.dir(this.drawings);

		this.drawings.forEach(drawing => {
			//console.log('drawing.setInputs', drawing);
			//console.dir(drawing);

			drawing.setInputs();
		});
	}

	// feelfree to override this one
	drawBackground() {
		const gl = this.gl;

		gl.clearColor(0, 0, 0, 1);
		gl.clear(gl.COLOR_BUFFER_BIT);
	}

	draw() {
		this.drawBackground();

		this.drawings.forEach(drawing => {
			drawing.draw();
		});
	}


	domSetup(canvas) {
		this.drawings.forEach(drawing => {
			drawing.domSetup(canvas);
		});

	}
}

drawingViewDef.viewClassName = 'drawingViewDef';

export default drawingViewDef;

