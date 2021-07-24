/*
** blah blah -- like a source file for Squishy Electron
** Copyright (C) 2021-2021 Tactile Interactive, all rights reserved
*/

import {abstractViewDef} from './abstractViewDef';

// even simpler without the viewVariables
export class manualViewDef extends abstractViewDef {
	static viewName: 'manual';
	static viewClassName: 'manualViewDef';

	// same constructor and everything else

	setShaders() {
		this.vertexShaderSrc = `
		attribute vec4 corner;
		void main() {
			gl_Position = corner;
		}
		`;

		this.fragmentShaderSrc = `
		precision highp float;  // does this do anything?
		uniform int cornerColor;

		void main() {
			// chartreuce triangle
			gl_FragColor = vec4(.5, 1, cornerColor, 1);
		}
		`;

		this.compileProgram();
	}

	// all to do this one differently
	setInputs() {
		const gl = this.gl;

		const sin = Math.sin;
		const cos = Math.cos;
		const corners = new Float32Array([
			cos(2), sin(2),
			cos(4), sin(4),
			cos(6), sin(6),
		]);

		let cornerAttributeLocation = gl.getAttribLocation(this.program, "corner");
		if (cornerAttributeLocation < 0) throw `cornerAttributeLocation bad: ${cornerAttributeLocation}`;

		const cornerBuffer = gl.createBuffer();  // actual ram in GPU chip
		gl.bindBuffer(gl.ARRAY_BUFFER, cornerBuffer);

		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(corners), this.bufferDataDrawMode);

		var vao = this.vaoExt.createVertexArrayOES();
		this.vaoExt.bindVertexArrayOES(vao);
		this.vao = vao;
		gl.enableVertexAttribArray(cornerAttributeLocation);

		const size = 2;          // 2 components per iteration
		const type = gl.FLOAT;   // the data is 32bit floats
		const normalize = false; // don't normalize the data
		const stride = 0;        // 0 = move forward number of bytes to get the next position
								// size * sizeof(type) each iteration
		const offset = 0;        // start at the beginning of the buffer
		gl.vertexAttribPointer(cornerAttributeLocation, size, type, normalize, stride, offset);
	}
}

export default manualViewDef;


manualViewDef.viewClassName = 'manualViewDef';
