import abstractViewDef from './abstractViewDef';
import {cxToColorGlsl} from './cxToColor.glsl';
import qe from '../wave/qe';
import {viewUniform, viewAttribute} from './viewVariable';
import SquishPanel from '../SquishPanel';
import {qeStartPromise} from '../wave/qEngine';

/*
** data format of attributes:  four column table of floats
** psi.re  psi.im   potential    ...0?...
** uses gl_VertexID to figure out whether the y should be re^2+im^2  NO! opengl 2 only
** or zero
*/

const isTesting = false;

// make the line number for the start a multiple of 10
const vertexSrc = `
${cxToColorGlsl}


#line 120
varying highp vec4 vColor;
attribute vec4 row;
//int nPoints = 7;
uniform int nPoints;

void main() {
	// figure out y
	float y;
	int vertexSerial = int(row.w);
	if (vertexSerial / 2 * 2 > vertexSerial)
		y = row.x * row.x + row.y * row.y;
	else
		y = 0.;
	// i've got to figure out the vertical mag factor someday.
	y = y - 1.;

	// figure out x, basically the point index
	float x;
	x = float(int(vertexSerial) / 2) / float(nPoints - 1) * 2. - 1.;

	// and here we are
	gl_Position = vec4(x, y, 0., 1.);

	//  for the color, convert the complex values via this algorithm
	//vColor = vec4(cxToColor(vec2(row.x, row.y)), 1.);
	vColor = vec4(.9, .9, .1, 1.);
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
class flatViewDef extends abstractViewDef {
	static viewName: 'flat';
	static viewClassName: 'flatViewDef';

	constructor(viewName, canvas, currentQESpace) {
		super(viewName, canvas);

		if (! currentQESpace) throw  `flatViewDef: being created without currentQESpace`;
		this.currentQESpace = currentQESpace;
	}

	setShaders() {
		this.vertexShaderSrc = vertexSrc;
		this.fragmentShaderSrc = fragmentSrc;
		this.compileProgram();
		this.gl.useProgram(this.program);
	}


	setInputs() {
		if (isTesting) {
			this.setInputsForTesting();
			return;
		}

		const highest = qe.updateViewBuffer();
		let nPointsUniform = this.nPointsUniform = new viewUniform('nPoints', this);

		let nPoints = this.nPoints = this.currentQESpace.nPoints;
		nPointsUniform.setValue(nPoints, '1i');
			//() => ({value: this.currentQESpace.nPoints, type: '1i'});


		const rowAttr = this.rowAttr = new viewAttribute('row', this);
		this.vertexCount = nPoints * 2;  // nPoints * vertsPerBar
		this.rowFloats = 4;
		this.rowAttr.attachArray(qe.space.viewBuffer, this.rowFloats);

//		this.nPointsLoc = gl.getUniformLocation(this.program, 'nPoints');
//		const gl = this.gl;
//		gl.uniform1f(this.nPointsLoc, this.currentQESpace.nPoints);
	}

	setInputsForTesting() {
		const vAttr = new viewAttribute('row', this, null);

		const sin = Math.sin;
		const cos = Math.cos;
		this.nPoints = 7;
		this.vertexCount = this.nPoints * 2;  // nPoints * vertsPerBar
		this.rowFloats = 4
		let vertices = new Float32Array(this.vertexCount *  this.rowFloats);
		for (let i = 0; i < 7; i++) {
			vertices[i*8] = vertices[i*8 + 4] = cos(i);
			vertices[i*8 + 1] = vertices[i*8 + 5] = sin(i);
		}
		vAttr.attachArray(vertices, 4);

//		const gl = this.gl;
//		var nPointsLoc = gl.getUniformLocation(this.program, 'nPoints');
//		gl.uniform1f(nPointsLoc, this.nPoints);
	}

	// use default
	//setGeometry() {
	//}

	draw() {
		const gl = this.gl;

		gl.clearColor(0, 0, .3, 1);
		gl.clear(gl.COLOR_BUFFER_BIT);

		gl.useProgram(this.program);
		//this.rowAttr.reloadVariable()

		//gl.bindVertexArray(this.vao);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.vertexCount);
	}

}

qeStartPromise.then((arg) => {
	if (SquishPanel)
		SquishPanel.addMeToYourList(flatViewDef);
	else
		debugger;
});

export default flatViewDef;

