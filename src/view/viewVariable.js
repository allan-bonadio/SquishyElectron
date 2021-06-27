


let ddraw = true;

// attr arrays and uniforms can change on every frame.
// These help.

// superclass for both of these
export class viewVariable {
	constructor(varName, view) {
		this.view = view;
		this.gl = view.gl;
		this.varName = varName;
		if (! varName || ! view) throw `bad name${!varName} or view${!view} used to create a view var`;
		view.viewVariables.push(this);

		// i need a gl to get these numbers
		if (ddraw)
			this.bufferDataDrawMode = this.gl.DYNAMIC_DRAW;
		else
			this.bufferDataDrawMode = this.gl.STATIC_DRAW;
		//bufferDataDrawMode = this.gl.STATIC_DRAW;
	}
}


/* ************************************************** uniforms */

// create this as many times as you have uniforms as input to either or both shaders
export class viewUniform extends viewVariable {
	constructor(varName, view) {
		super(varName, view);

		//function that will get value
		//from wherever and return it.
		//if (typeof getFunc == 'function')
		//this.valueVar = getFunc;

		// this turns out to be an internal magic object
		this.uniformLoc = this.gl.getUniformLocation(this.view.program, varName);
		if (!this.uniformLoc) throw `Cannot find uniform loc for uniform variable ${varName}`;
	}

	// change the value, sortof, by one of these two ways:
	// - changing the function that returns it.  Pass function in.
	//         the func should return an object eg {value=1.234, type='1f'}
	// - just setting the static Value.  Pass in any non-function value, and a type.
	// types you can use: 1f=1 float single.  1i=1 int 32 bit.
	// 2fv, 3fv, 4fv=vec2, 3, 4; Must pass in an array value if type includes 'v'.
	// must return in an array value, typed or not.  Same for 2iv, etc.
	// Matrix2fv, 3, 4: square matrices, col major order.  must be typed!
	// there are non-square variants, but only in webgl2
	setValue(valueVar, type) {
		if (typeof valueVar == 'function') {
			this.getFunc = valueVar;
			this.staticValue = this.staticType = undefined;
		}
		else {
			this.staticValue = valueVar;
			this.staticType = type;
			this.getFunc = undefined;
		}
		this.reloadVariable();
	}

	// set the uniform to it - upload latest value to GPU
	// call this when the uniform's value changes, to reload it into the GPU
	reloadVariable() {
		let value = this.staticValue;
		let type = this.staticType;
		if (this.getFunc) {
			let v = this.getFunc();
			value = v.value;
			type = v.type;
		}

		// you can't pass null or undefined
		if ((! value && value !== 0) || ! type)
			throw `uniform variable has no value(${value}) or no type(${type})`;
		const gl = this.gl;
		const pgm = this.view.program;

		gl.useProgram(pgm);  // a Gain?

		// do i have to do this again?
		this.uniformLoc = gl.getUniformLocation(pgm, this.varName);

		const method = `uniform${type}`;

		// the matrix variations have this extra argument right in the middle
		const args = [this.uniformLoc];
		if (/^Matrix/.test(type))
			args.push(false);
		args.push(value);

		//console.log(`reload Uniform variable ${this.varName} with `+
		//	` method gl.${method}() with these args:`, args);

		gl.useProgram(pgm);  // a Gain?

		gl[method].apply(gl, args);  // wish me luck
		//this.gl.uniform1f(this.uniformLoc, value);
		//this.gl.uniform1i(this.uniformLoc, value);
	}
}

/* *********************************************** attributes for arrays */
// create this as many times as you have buffers as input to either shader
export class viewAttribute extends viewVariable {
	constructor(varName, view) {
		super(varName, view);
		const gl = this.gl;

		// small integer indicating which attr this is
		const atLo = this.attrLocation = gl.getAttribLocation(view.program, varName);

		if (atLo < 0)
			throw `viewAttribute:attr loc for '${varName}' is bad: `+ atLo;
	}

 	// call after construction.  has <float32TypedArray> data input,
	// broken into rows of <stride> Bytes,
	// but we only use the <size> number of Floats from each row,
	// <offset> from the start of each row.  size=1,2,3 or 4,
	// to make an attr that's a scalar, vec2, vec3 or vec4
	attachArray(float32TypedArray, size, stride = size * 4, offset = 0) {
		const gl = this.view.gl;

		// allocate actual ram in GPU chip
		const gBuf = this.glBuffer = gl.createBuffer();

		// magical vao which is apparently a list of cpu-side buffers.
		// Each is named with some integer in opengl, but I don't think we see these in webgl 1.
		// you have to dispose of it ultimately
		const vaoExt = this.view.vaoExt;
		let vao = this.vao = vaoExt.createVertexArrayOES();
		vaoExt.bindVertexArrayOES(vao);
		// now do calls to bindBuffer() or vertexAttribPointer()
		// a Record of these will be "recorded" in the VAO

		// attach GPU buffer to our GL
		gl.bindBuffer(gl.ARRAY_BUFFER, gBuf);

		// now attach some data to it, with CPU-side arrays
		this.float32TypedArray = float32TypedArray;
		gl.bufferData(gl.ARRAY_BUFFER, float32TypedArray, this.bufferDataDrawMode);

		gl.enableVertexAttribArray(this.attrLocation);

		// // row is 4 floats: real, imag, potential, vertex index/serial
		gl.vertexAttribPointer(
				this.attrLocation,
				size, gl.FLOAT,
				false, stride, offset);  // don't normalize


		// again?  gl.enableVertexAttribArray(this.attrLocation);

//		var vao = this.vao = vaoExt.createVertexArrayOES();
//		vaoExt.bindVertexArrayOES(vao);
//		vao;
//		gl.enableVertexAttribArray(this.attrLocation);
//
//		gl.vertexAttribPointer(this.attrLocation, size, gl.FLOAT, false, stride, offset);

		this.reloadVariable();
	}

	// call this when the array's values change, to reload them into the GPU
	reloadVariable() {
		const gl = this.view.gl;
		//console.log(`reload Array variable ${this.varName} : `, this.float32TypedArray);
		// not sure we have to do this again...
		gl.bindBuffer(gl.ARRAY_BUFFER, this.glBuffer);

		// do we have to do THIS again?  Does it just slurp it up from the pointer from last time?!?!
		gl.bufferData(gl.ARRAY_BUFFER, this.float32TypedArray, this.bufferDataDrawMode);
	}

}


