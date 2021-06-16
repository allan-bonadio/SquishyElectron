import abstractViewDef, {viewAttribute} from './abstractViewDef';
import {cxToColorGlsl} from './cxToColor.glsl';
import qe from '../wave/qe';

/*
** data format of attributes:  four column table of floats
** psi.re  psi.im   potential    ...0?...
** uses gl_VertexID to figure out whether the y should be re^2+im^2
** or zero
*/

const vertexSrc = `#version 300 es
${cxToColorGlsl}

in vec4 row;
out mediump vec4 vColor;
uniform float nBars;

void main() {
	float y;
	if ((gl_VertexID & 1) != 0)
		y = row.x * row.x + row.y * row.y;
	else
		y = 0.;
	// i've got to figure out the vertical mag factor someday.
	y = y - 1.;

	float x;
	x = float(gl_VertexID/2) / (nBars - 1.) * 2. - 1.;
	gl_Position = vec4(x, y, 0., 1.);

	vColor = vec4(cxToColor(vec2(row.x, row.y)), 1.);
	//vColor = vec4(.9, .9, .1, 1.);
}
`;

const fragmentSrc = `#version 300 es

precision highp float;
out vec4 outColor;
in mediump vec4 vColor;

void main() {
	outColor = vColor;
}
`;

// the original
class flatViewDef extends abstractViewDef {
	constructor(viewName, canvas, currentQESpace) {
		super(viewName, canvas, currentQESpace);

	}

	setShaders() {
		this.compileProgram(vertexSrc, fragmentSrc);
		this.gl.useProgram(this.program);
	}

	setInputs() {
		const ar = new viewAttribute(this, 'row');

		const highest = qe.updateViewBuffer();
		this.nPoints = this.currentQESpace.nPoints;
		this.vertexCount = this.nPoints * 2;  // nbars * vertsPerBar
		this.rowFloats = 4;
		ar.attachArray(qe.space.viewBuffer, this.rowFloats);

		const gl = this.gl;
		var nBarsLoc = gl.getUniformLocation(this.program, 'nBars');
		gl.uniform1f(nBarsLoc, this.nPoints);
	}

	setInputsForTesting() {
		const ar = new viewAttribute(this, 'row');

		const sin = Math.sin;
		const cos = Math.cos;
		this.nPoints = 7;
		this.vertexCount = this.nPoints * 2;  // nbars * vertsPerBar
		this.rowFloats = 4
		let vertices = new Float32Array(this.vertexCount *  this.rowFloats);
		for (let i = 0; i < 7; i++) {
			vertices[i*8] = vertices[i*8 + 4] = cos(i);
			vertices[i*8 + 1] = vertices[i*8 + 5] = sin(i);
		}
		ar.attachArray(vertices, 4);

		const gl = this.gl;
		var nBarsLoc = gl.getUniformLocation(this.program, 'nBars');
		gl.uniform1f(nBarsLoc, this.nPoints);

// simple triangle
//		const corners = new Float32Array([
//			cos(2), sin(2),
//			cos(4), sin(4),
//			cos(6), sin(6),
//		]);
//		ar.attachArray(corners, 2);
	}

	// use default
	//setGeometry() {
	//}

	draw() {
		const gl = this.gl;

		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT);

		//gl.useProgram(this.program);
		//gl.bindVertexArray(this.vao);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.vertexCount);
	}

}
export default flatViewDef;

