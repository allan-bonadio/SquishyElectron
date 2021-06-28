
import abstractDrawing from './abstractDrawing';
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
const vertexSrc = `
#line 122
attribute vec4 row;
uniform float barWidth;
uniform float unitHeight;

void main() {
	// figure out y
	float y = row.z * unitHeight;
	float thickness = unitHeight * .03;
	int vertexSerial = int(row.w);
	if (vertexSerial / 2 * 2 < vertexSerial) {
		y += thickness; // odd
	}
	else {
		y -= thickness;  // even
	}

	y = 2. * y - 1.;

	// figure out x, basically the point index
	float x;
	x = float(int(vertexSerial) / 2) * barWidth * 2. - 1.;

	// and here we are
	gl_Position = vec4(x, y, 0., 1.);

	// dot size, in pixels not clip units.  actually a square.
	${ps}
}
`;

const fragmentSrc = `
precision highp float;

void main() {
	gl_FragColor = vec4(1., 1., 1., .7);
}
`;

// the original display that's worth watching
class potentialDrawing extends abstractDrawing {

	constructor(view, space) {
		super(view, space);
		//view.drawings.push(this);
		//this.view = view;
	}

	static drawingClassName: 'potentialDrawing';
	drawingClassName: 'potentialDrawing';

	setShaders() {
		this.vertexShaderSrc = vertexSrc;
		this.fragmentShaderSrc = fragmentSrc;
		this.compileProgram();
		this.gl.useProgram(this.program);
	}


	setInputs() {
		const highest = qe.updateViewBuffer();

		let barWidthUniform = this.barWidthUniform = new viewUniform('barWidth', this);
		let nPoints = this.nPoints = this.space.nPoints;
		let barWidth = 1 / (nPoints - 1);
		barWidthUniform.setValue(barWidth, '1f');

		// note unit height for potential is different from unit potential for wave!
		let unitHeightUniform = this.unitHeightUniform = new viewUniform('unitHeight', this);
		this.unitHeight = .125;
		unitHeightUniform.setValue(this.unitHeight, '1f');

		// this shares the view buf with wave, [re, im, potential, serial]
		this.rowAttr = new viewAttribute('row', this);
		this.vertexCount = nPoints * 2;  // nPoints * vertsPerBar
		this.rowFloats = 4;
		this.rowAttr.attachArray(qe.space.viewBuffer, this.rowFloats);
	}


	draw() {
		const gl = this.gl;

		gl.useProgram(this.program);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.vertexCount);

		if (alsoDrawLines) {
			gl.lineWidth(1);  // it's the only option anyway

			gl.drawArrays(gl.LINES, 0, this.vertexCount);
			//gl.drawArrays(gl.LINE_STRIP, 0, this.vertexCount);
		}

		if (alsoDrawPoints)
			gl.drawArrays(gl.POINTS, 0, this.vertexCount);
	}

	/* ************************************************************************  interactive */

	mouseCoords(ev) {
		console.log(`mouse: `, ev.clientX, ev.clientY, ev.buttons.toString(16));
	}

	mouseDown(ev) {

	}

	mouseMove(ev) {
		this.mouseCoords(ev);
	}

	mouseUp(ev) {

	}

	mouseEnter(ev) {

	}

	mouseLeave(ev) {

	}

	domSetup(canvas) {
		// we dont use react event handlers here - this has nothing to do with React.
		canvas.addEventListener('mousedown', ev => this.mouseDown(ev), false);
		window.addEventListener('mousemove', ev => this.mouseMove(ev), false);
		window.addEventListener('mouseup', ev => this.mouseUp(ev), false);
		window.addEventListener('mouseEnter', ev => this.mouseEnter(ev), false);
		window.addEventListener('mouseLeave', ev => this.mouseLeave(ev), false);

	}
}

export default potentialDrawing;

