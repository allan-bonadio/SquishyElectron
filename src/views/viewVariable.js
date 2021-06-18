





// attr arrays and uniforms can change on every frame.
// These help.

// create this as many times as you have attributes as input to the vec shader
export class viewVariable {
	constructor(varName, view) {
		this.view = view;
		this.gl = view.gl;
		this.varName = varName;
		if (! varName || ! view) throw `bad name${!varName} or view${!view} used to create a view var`;
		view.viewVariables.push(this);
	}
}

// create this as many times as you have uniforms as input to the vec shader
// the func should return an object eg {value=1.234, type='1f}
// types you can use: 1f=1 float.  1i=1 int.
// 2fv, 3fv, 4fv=vec2, 3, 4; must return in an array value, typed or not.  Same for 2iv, etc.
// Matrix2fv, 3, 4: square matrices, col major order.  must be typed!
// there are non-square variants, but only in webgl2
export class viewUniform extends viewVariable {
	constructor(varName, view, getFunc) {
		super(varName, view);

		// function that will get value
		// from wherever and return it.
		this.getFunc = getFunc;

		this.uniformLoc = this.gl.getUniformLocation(this.view.program, varName);
		this.reloadVariable();
	}

	// set the uniform to it
	// call this when the uniform's value changes, to reload it into the GPU
	reloadVariable() {
		let {value, type} = this.getFunc();
		if (! value || ! type) throw 'uniform variable has no value or type';
		const gl = this.gl;

		const method = `uniform${type}`;
		const args = [this.uniformLoc, value];
		if (/^Matrix/.test(type))
			args.splice(1, 0, false);
		console.log(`reload Uniform variable: gl.${method}():`, gl, args);
		gl[method].apply(gl, args);
		//this.gl.uniform1f(this.uniformLoc, value);
	}
}

// create this as many times as you have buffers as input to either shader
export class viewAttribute extends viewVariable {
	constructor(varName, view) {
		super(varName, view);
		const gl = this.gl;

		// small integer indicating which attr this is
		this.attrLocation = gl.getAttribLocation(view.program, varName);

	}

 	// call after construction.  has <float32TypedArray> data input,
	// broken into rows of <stride> floats,
	// but we only use the <size> number of floats
	// from each row, <offset> from the start of each row.  size=1,2,3 or 4,
	// to make an attr that's a scalar, vec2, vec3 or vec4
	attachArray(float32TypedArray, size, stride = size * 4, offset = 0) {
		const gl = this.view.gl;

		// actual ram in GPU chip
		this.glBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.glBuffer);

		// also try gl.DYNAMIC_DRAW here?
		this.float32TypedArray = float32TypedArray;
		this.reloadVariable();

		gl.vertexAttribPointer(
				this.attrLocation,
				size, gl.FLOAT,  // real, imag, potential, vertex index
				false, stride, offset);  // normalize, stride, offset
		//this.vao = gl.createVertexArray();
		//gl.bindVertexArray(this.vao);
		gl.enableVertexAttribArray(this.attrLocation);
	}

	// call this when the array's values change, to reload them into the GPU
	reloadVariable() {
		const gl = this.view.gl;
		console.log(`reload Array variable: `, this.float32TypedArray);
		gl.bufferData(gl.ARRAY_BUFFER, this.float32TypedArray, gl.DYNAMIC_DRAW);
	}

}


