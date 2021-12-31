/*
** View Variable View Def -- an old prototype used to develop the View Variable system
** Copyright (C) 2021-2021 Tactile Interactive, all rights reserved
*/

import {abstractViewDef} from './abstractViewDef';
import {viewUniform, viewAttribute} from './viewVariable';

// this makes a light green color if false, a little on the yellow side.
// if true, you should see something brighter and less yellow
let includeUniform = true;

// slightly more complicated with the viewVariables
export class viewVariableViewDef extends abstractViewDef {
	static viewName: 'viewVariable';
	static viewClassName: 'viewVariableViewDef';

	// same constructor and everything else, mostly

	setShaders() {
		this.vertexShaderSrc = `
		attribute vec4 corner;
		void main() {
			gl_Position = corner;

			gl_PointSize = 10.;  // dot size, actually a crude square
		}
		`;

		const decl = includeUniform ? `uniform vec4 cornerColorUni;` : '';
		const cornerColorUni = includeUniform ? `cornerColorUni` : 'vec4(0.,.5,1.,1.)';
		this.fragmentShaderSrc = `
		precision highp float;  // does this do anything?
		${decl}

		void main() {
			// colored triangle, depends on the uniform?
			gl_FragColor = ${cornerColorUni};
		}
		`;

		this.compileProgram();
	}


	// all to do this one differently
	setInputs() {
		//const gl = this.gl;

		let cornerColorUni;
		if (includeUniform)
			cornerColorUni = this.cornerColorUni =
				new viewUniform('cornerColorUni', this);
			cornerColorUni.setValue([0, 1, .5, 1], '4fv');
			//() => ({value: [0, 1, .5, 1], type: '4fv'});

//		const cornerAttributeLocation = gl.getAttribLocation(this.program, 'corner');
//		const cornerBuffer = gl.createBuffer();  // actual ram in GPU chip
//		gl.bindBuffer(gl.ARRAY_BUFFER, cornerBuffer);

		const sin = Math.sin;
		const cos = Math.cos;
		const corners = new Float32Array([
			cos(1), sin(1),
			cos(3), sin(3),
			cos(5), sin(5),
			cos(7), sin(7),
			cos(9), sin(9),
			cos(11), sin(11),
			cos(0), sin(0),
			cos(2), sin(2),
			cos(4), sin(4),
			cos(6), sin(6),
			cos(8), sin(8),
			cos(10), sin(10),
		]);
		const cornerAttr = this.cornerAttr = new viewAttribute('corner', this);
		cornerAttr.attachArray(corners, 2);

	}

	draw() {
		const gl = this.gl;

		// is this a good place to do this?
		gl.lineWidth(1.0);  // it's the only option anyway

		gl.clearColor(0, 0, .3, 0);
		gl.clear(gl.COLOR_BUFFER_BIT);

		if (includeUniform) {
			this.cornerColorUni.reloadVariable();
		}

		gl.useProgram(this.program);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 12);


		gl.drawArrays(gl.LINE_STRIP, 0, 12);
		gl.drawArrays(gl.POINTS, 0, 12);

		//gl.POINTS,     // most useful and foolproof but set width in vertex shader
		//gl.LINES,      // tend to scribble all over
		//gl.LINE_STRIP, // tend to scribble all over
		//gl.TRIANGLES,  // more sparse triangles
	}
}

export default viewVariableViewDef;

viewVariableViewDef.viewClassName = 'viewVariableViewDef';
