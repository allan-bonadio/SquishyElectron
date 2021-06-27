import abstractDrawing from './abstractDrawing';
import {cxToColorGlsl} from './cxToColor.glsl';
import qe from '../wave/qe';
import {viewUniform, viewAttribute} from './viewVariable';
//import SquishPanel from '../SquishPanel';
//import {qeStartPromise} from '../wave/qEngine';

/*
** data format of attributes:  four column table of floats
** psi.re  psi.im   potential    ...0?...
** uses gl_VertexID to figure out whether the y should be re^2+im^2  NO! opengl 2 only
** or zero
*/

let alsoDrawPoints = false, alsoDrawLines = false;
//alsoDrawLines =0;

let ps = alsoDrawPoints ? `gl_PointSize = (row.w+1.) * 5.;//10.;` : '';

// make the line number for the start a multiple of 10
const vertexSrc = `${cxToColorGlsl}
#line 122
varying highp vec4 vColor;
attribute vec4 row;
uniform float barWidth;
uniform float unitHeight;

void main() {
	// figure out y
	float y;
	int vertexSerial = int(row.w);
	if (vertexSerial / 2 * 2 < vertexSerial) {
		y = (row.x * row.x + row.y * row.y) * unitHeight;
	}
	else {
		y = 0.;
	}
	//y=row.w / 10.;
	//y=0.5;

	y = 1. - 2. * y;

	// figure out x, basically the point index
	float x;
	x = float(int(vertexSerial) / 2) * barWidth * 2. - 1.;
	//x = row.w / 6. - 1.;

	// and here we are
	gl_Position = vec4(x, y, 0., 1.);

	//  for the color, convert the complex values via this algorithm
	vColor = vec4(cxToColor(vec2(row.x, row.y)), 1.);
	//vColor = vec4(.9, .9, .1, 1.);

	// dot size, in pixels not clip units.  actually a square.
	${ps}
}
`;

const fragmentSrc = `
precision highp float;
varying highp vec4 vColor;

void main() {
	gl_FragColor = vColor;
}
`;

// the original display that's worth watching
class flatDrawing extends abstractDrawing {

	constructor(view, space) {
		super(view, space);
		//view.drawings.push(this);
		//this.view = view;
	}

	static drawingClassName: 'flatDrawing';
	drawingClassName: 'flatDrawing';

	setShaders() {
		this.vertexShaderSrc = vertexSrc;
		this.fragmentShaderSrc = fragmentSrc;
		this.compileProgram();
		this.gl.useProgram(this.program);
	}


	setInputs() {
		const highest = qe.updateViewBuffer();

		let barWidthUniform = this.barWidthUniform = new viewUniform('barWidth', this);
		let nPoints = this.nPoints = this.space ? this.space.nPoints : 10;
		let barWidth = 1 / (nPoints - 1);
		barWidthUniform.setValue(barWidth, '1f');

		let unitHeightUniform = this.unitHeightUniform = new viewUniform('unitHeight', this);
		this.unitHeight = 1;
		unitHeightUniform.setValue(this.unitHeight, '1f');

		this.rowAttr = new viewAttribute('row', this);
		this.vertexCount = nPoints * 2;  // nPoints * vertsPerBar
		this.rowFloats = 4;
		this.rowAttr.attachArray(qe.space.viewBuffer, this.rowFloats);
	}


	draw() {
		const gl = this.gl;

		//gl.useProgram(this.program);
		//this.rowAttr.reloadVariable()

		//gl.bindVertexArray(this.vao);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.vertexCount);

		if (alsoDrawLines) {
			gl.lineWidth(1);  // it's the only option anyway

			gl.drawArrays(gl.LINES, 0, this.vertexCount);
			//gl.drawArrays(gl.LINE_STRIP, 0, this.vertexCount);
		}

		if (alsoDrawPoints)
			gl.drawArrays(gl.POINTS, 0, this.vertexCount);
	}

}

export default flatDrawing;

