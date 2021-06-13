import viewDef from './viewDef';


const vertexSrc = `#version 300 es

// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer
in vec4 a_position;

// all shaders have a main function
void main() {

  // gl_Position is a special variable a vertex shader
  // is responsible for setting
  gl_Position = a_position;
}
`;

const fragmentSrc = `#version 300 es

// fragment shaders don't have a default precision so we need
// to pick one. highp is a good default. It means "high precision"
precision highp float;

// we need to declare an output for the fragment shader
out vec4 outColor;

void main() {
  // Just set the output to a constant reddish-purple
  outColor = vec4(1, 0, 0.5, 1);
}
`;

// the original
class flatView extends viewDef {
	constructor(canvas) {
		super('flat', canvas);

		this.compileProgram(vertexSrc, fragmentSrc);
	}

	setInputs() {
		const {gl, canvas} = this;

		const cornerAttributeLocation = gl.getAttribLocation(this.program, 'corner');

		const cornerBuffer = gl.createBuffer();  // actual ram in GPU chip
		gl.bindBuffer(gl.ARRAY_BUFFER, cornerBuffer);

		const sin = Math.sin;
		const cos = Math.cos;
//		const center = {x: canvas.width / 2, y: canvas.height / 2};
//		const diameter = Math.min(canvas.width, canvas.height) / 3;
		const corners = [
			cos(2), sin(2),
			cos(4), sin(4),
			cos(6), sin(6),
		];
		// also try gl.DYNAMIC_DRAW here
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(corners), gl.STATIC_DRAW);

		var vao = gl.createVertexArray();
		gl.bindVertexArray(vao);
		this.vao = vao;
		gl.enableVertexAttribArray(cornerAttributeLocation);

		const size = 2;          // 2 components per iteration
		const type = gl.FLOAT;   // the data is 32bit floats
		const normalize = false; // don't normalize the data
		const stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
		const offset = 0;        // start at the beginning of the buffer
		gl.vertexAttribPointer(cornerAttributeLocation, size, type, normalize, stride, offset);
	}

	// another dummy submethod
	setGeometry() {

		this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
	}

	// another dummy submethod
	draw() {
		const gl = this.gl;

		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT);

		gl.useProgram(this.program);
		gl.bindVertexArray(this.vao);

		const primitiveType = gl.TRIANGLES;
		const offset = 0;
		const count = 3;
		gl.drawArrays(primitiveType, offset, count);

		this.debug1();
	}

}
export default flatView;


//call this as many times as you have attributes as input to the vec shader
//class squishBuffer {
//
//	buffer that shows up as <attrName> in the v shder, has <float32RawArray> data input,
//	broken into rows of <stride> floats, but we only use the <size> number of floats
//	from each row, <offset> from the start of each row.  size=1,2,3 or 4,
//	to make an attr that's a scalar, vec2, vec3 or vec4
//	construct(attrName, float32RawArray, size, stride = size, offset = 0) {
//		this.attrLocation = gl.getAttribLocation(this.program, attrName);
//
//		this.glBuffer = gl.createBuffer();  // actual ram in GPU chip
//		gl.bindBuffer(gl.ARRAY_BUFFER, this.glBuffer);
//
//		also try gl.DYNAMIC_DRAW here?
//		gl.bufferData(gl.ARRAY_BUFFER, float32RawArray, gl.STATIC_DRAW);
//
//		this.vao = gl.createVertexArray();
//		gl.bindVertexArray(this.vao);
//		gl.enableVertexAttribArray(this.attrLocation);
//
//	const size = 2;          // 2 components per iteration
//		const type = gl.FLOAT;   // the data is 32bit floats
//		const normalize = false; // don't normalize the data
//	const stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
//	const offset = 0;        // start at the beginning of the buffer
//		gl.vertexAttribPointer(this.attrLocation, size, type, normalize, stride, offset);
//	}
//}


//	attachABuffer(attrName, float32Buffer) {
//		const attrLocation = gl.getAttribLocation(this.program, attrName);
//
//		const glBuffer = gl.createBuffer();  // actual ram in GPU chip
//		gl.bindBuffer(gl.ARRAY_BUFFER, glBuffer);
//
//		// also try gl.DYNAMIC_DRAW here?
//		gl.bufferData(gl.ARRAY_BUFFER, float32Buffer, gl.STATIC_DRAW);
//
//		var vao = gl.createVertexArray();
//		gl.bindVertexArray(vao);
//		this.vao = vao;
//		gl.enableVertexAttribArray(attrLocation);
//
//	}
//}

