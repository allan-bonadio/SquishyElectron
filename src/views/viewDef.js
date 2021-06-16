
// create this as many times as you have attributes as input to the vec shader
export class viewAttribute {

	// for a subclass of abstractViewDef, attach a buffer that shows up as <attrName> in the v shder,...
	constructor(view, attrName) {
		this.view = view;
		const gl = view.gl;
		view.buffers.push(this);

		// small integer indicating which attr this is
		this.attrLocation = gl.getAttribLocation(view.program, attrName);

		// actual ram in GPU chip
		this.glBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.glBuffer);
	}

 	// call after construction.  has <float32TypedArray> data input,
	// broken into rows of <stride> floats, but we only use the <size> number of floats
	// from each row, <offset> from the start of each row.  size=1,2,3 or 4,
	// to make an attr that's a scalar, vec2, vec3 or vec4
	attachArray(float32TypedArray, size, stride = size * 4, offset = 0) {
		const gl = this.view.gl;

		// also try gl.DYNAMIC_DRAW here?
		this.float32TypedArray = float32TypedArray;
		gl.bufferData(gl.ARRAY_BUFFER, float32TypedArray, gl.DYNAMIC_DRAW);

		this.vao = gl.createVertexArray();
		gl.bindVertexArray(this.vao);
		gl.enableVertexAttribArray(this.attrLocation);

		gl.vertexAttribPointer(this.attrLocation, size, gl.FLOAT, false, stride, offset);
	}

	// call this when the array's values change, to reload them into the GPU
	reloadArray() {
		const gl = this.view.gl;
		gl.bufferData(gl.ARRAY_BUFFER, this.float32TypedArray, gl.STATIC_DRAW);

	}
}


/* ************************************************** construction */

const proxyVertexShader = `#version 300 es
in vec4 corner;
void main() {
	gl_Position = corner;
}
`;

const proxyFragmentShader = `#version 300 es
precision highp float;
out vec4 outColor;

void main() {
  outColor = vec4(.5, 1, 0, 1);
}
`;

// Each abstractViewDef subclass is a definition of a kind of view; one per each kind of view.
// (A SquishView owns an instance of the def and is a React component.)
// This is the superclass of all view defs; with common webgl and space plumbing.
// viewName is not the viewClassName, which is one of flatViewDef, garlandView, ...
export class abstractViewDef {
	constructor(viewName, canvas, currentQESpace) {
		this.buffers = [];

		if (! currentQESpace) throw  `abstractViewDef: being created without currentQESpace`;
		this.currentQESpace = currentQESpace;

		this.viewName = viewName;
		if (! canvas) throw `abstractViewDef: being created without canvas`;
		this.canvas = canvas;
		this.initCanvas();


		// after construction, the instantiator should call compileProgram()
	}

	initCanvas() {
		this.gl = this.canvas.getContext("webgl2");
		if (! this.gl)
			this.gl = this.canvas.getContext("experimental-webgl2");
		if (this.gl) return;

		throw `Sorry this browser doesn't do WebGL2!  You might be able to turn it on ...`;
		/*
		Can be enabled in Firefox by setting the about:config preference
		webgl.enable-prototype-webgl2 to true

		Can be enabled in Chrome by passing the "--enable-unsafe-es3-apis"
		flag when starting the browser through the command line

		Safari: Can be enabled in the "Experimental Features" developer menu
		navigator.userAgent =>
		"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36"
		navigator.userAgentData =>
			NavigatorUAData {brands: Array(3), mobile: false}
			NavigatorUAData
			brands: Array(3)
			0: {brand: " Not A;Brand", version: "99"}
			1: {brand: "Chromium", version: "90"}
			2: {brand: "Google Chrome", version: "90"}
			length: 3
			__proto__: Array(0)
			mobile: false
		*/
	}

	// the final call to set it up does all viewClassName-specific stuff
	completeView() {
		this.setShaders();
		this.setInputs();
		this.setGeometry();
		this.draw();
	}

	/* ************************************************** Shader Creation/Compile */
	compileShader(type, srcString) {
		const {gl, canvas} = this;

		var shader = gl.createShader(type);
		gl.shaderSource(shader, srcString);
		gl.compileShader(shader);
		var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
		if (success) return shader;

		const msg = gl.getShaderInfoLog(shader);
		gl.deleteShader(shader);
		if (35633 == type) type = 'vertex';
		throw `Error compiling ${type} shader for ${this.viewName}: ${msg}`;
	}

	// call this with your sources in setShaders()
	compileProgram(vertexSrc, fragmentSrc) {
		const {gl} = this;

//
//		const vertexShader = this.compileShader(gl.VERTEX_SHADER, vertexSrc);
//		const fragmentShader = this.compileShader(gl.FRAGMENT_SHADER, fragmentSrc);
//		const program = gl.createProgram();
//		gl.attachShader(program, vertexShader);
//		gl.attachShader(program, fragmentShader);
//

		const program = gl.createProgram();

		const vertexShader = this.compileShader(gl.VERTEX_SHADER, vertexSrc);
		gl.attachShader(program, vertexShader);
		this.vertexShader = vertexShader;

		const fragmentShader = this.compileShader(gl.FRAGMENT_SHADER, fragmentSrc);
		gl.attachShader(program, fragmentShader);
		this.fragmentShader = fragmentShader;


		gl.linkProgram(program);
		var success = gl.getProgramParameter(program, gl.LINK_STATUS);
		if (success) {
			this.program = program;
			return
			// after this, you'll attach your buffers with your subclassed setInputs() method.
		}

		const msg = gl.getProgramInfoLog(program);
		gl.deleteProgram(program);
		throw `Error linking program for ${this.viewName}: ${msg}`;
	}

	// abstract supermethod: write your setShaders() function to compile your two GLSL sources
	setShaders() {
		this.compileProgram(proxyVertexShader, proxyFragmentShader);
	}

	/* ************************************************** buffers & variables */
	// abstract supermethod: all subclasses should write their own setInputs() method.
	setInputs() {
//		const {gl, canvas} = this;

		const ar = new viewAttribute(this, 'corner');
		//const cornerAttributeLocation = gl.getAttribLocation(this.program, 'corner');

//		const cornerBuffer = gl.createBuffer();  // actual ram in GPU chip
//		gl.bindBuffer(gl.ARRAY_BUFFER, cornerBuffer);

		const sin = Math.sin;
		const cos = Math.cos;
		const corners = new Float32Array([
			cos(2), sin(2),
			cos(4), sin(4),
			cos(6), sin(6),
		]);
		ar.attachArray(corners, 2);

//		also try gl.DYNAMIC_DRAW here
//		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(corners), gl.STATIC_DRAW);
//
//		var vao = gl.createVertexArray();
//		gl.bindVertexArray(vao);
//		this.vao = vao;
//		gl.enableVertexAttribArray(cornerAttributeLocation);
//
//		const size = 2;          // 2 components per iteration
//		const type = gl.FLOAT;   // the data is 32bit floats
//		const normalize = false; // don't normalize the data
//		const stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
//		const offset = 0;        // start at the beginning of the buffer
//		gl.vertexAttribPointer(cornerAttributeLocation, size, type, normalize, stride, offset);
	}

	/* ************************************************** Geometry and transformations */
	// abstract supermethod: another dummy submethod... write yer  own
	// is this really needed?  seems like it can be omitted...
	setGeometry() {

		// yeah i think it automatically defaults to this...
		this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
	}

	/* ************************************************** drawing */
	// abstract supermethod: another dummy submethod... write yer  own
	draw() {
		const gl = this.gl;

		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT);

		gl.useProgram(this.program);
		//gl.bindVertexArray(this.vao);

		const primitiveType = gl.TRIANGLES;
		const offset = 0;
		const count = 3;
		gl.drawArrays(primitiveType, offset, count);

		//this.debug1();
	}

	/* ************************************************** debugging */
	debug1() {
		const gl = this.gl

		// prints mfg and model of GPU.  yawn.
		const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
		const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
		const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
		console.log(`--- debug_renderer_info: vendor='${vendor}' renderer='${renderer}'`);

		// prints src of shaders, decompiled after compilation.  Fairly interesting; not all that useful.
		const ds = gl.getExtension('WEBGL_debug_shaders');
		var vSrc = ds.getTranslatedShaderSource(this.vertexShader);
		var fSrc = ds.getTranslatedShaderSource(this.fragmentShader);
		console.log(`--- vertexShader:
${vSrc}
--- fragmentShader:
${fSrc}
`);

		// also try this URL in chrome...    chrome://internals/web-app
		// after enabling it here: chrome://flags/#enable-webgl-draft-extensions
		// or is it heree??!?!    chrome://flags/#record-web-app-debug-info
		// firefox: webgl.enable-draft-extensions in Firefox

		// try this on flores after restarting chrome since Jun 12: chrome://memories/
		// enabled here in chrome:      chrome://flags/#memories-debug

		// cool, list all exts:
		const available_extensions = gl.getSupportedExtensions();
		console.log(`--- available GL extensions:\n${available_extensions.join('\n')}`);
	}

	/* ************************************* crawling out of the wreckage */
	// pass in the actual DOM element.
	// do EXACTLY THE SAME as
	// https://webgl2fundamentals.org/webgl/lessons/webgl-fundamentals.html
	static crawlFromTheWreckage(canvas) {
		let vd = new abstractViewDef('crawlFromTheWreckage', canvas);
		vd.cftw(canvas);
	}

	cftw(canvas) {
		var gl;
		if (false) {
			// do gregg's  original code
			gl = canvas.getContext("webgl2");
			if (!gl) throw 'no webgl2 for you!';
		}
		else {
			// integrate my version of the truth
			gl = this.gl;
		}


		/* ==================  shaders */
		var vertexShaderSource, fragmentShaderSource, vertexShader, fragmentShader, program;
		if (false) {
			vertexShaderSource = `#version 300 es

			// an attribute is an input (in) to a vertex shader.
			// It will receive data from a buffer
			in vec4 corner;

			// all shaders have a main function
			void main() {

			  // gl_Position is a special variable a vertex shader
			  // is responsible for setting
			  gl_Position = corner;
			}
			`;

			fragmentShaderSource = `#version 300 es

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


			function createShader(gl, type, source) {
			  var shader = gl.createShader(type);
			  gl.shaderSource(shader, source);
			  gl.compileShader(shader);
			  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
			  if (success) {
				return shader;
			  }

			  console.log(gl.getShaderInfoLog(shader));
			  gl.deleteShader(shader);
			}


			vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
			fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

			function createProgram(gl, vertexShader, fragmentShader) {
			  program = gl.createProgram();
			  gl.attachShader(program, vertexShader);
			  gl.attachShader(program, fragmentShader);
			  gl.linkProgram(program);
			  var success = gl.getProgramParameter(program, gl.LINK_STATUS);
			  if (success) {
				return program;
			  }

			  console.log(gl.getProgramInfoLog(program));
			  gl.deleteProgram(program);
			}

			program = createProgram(gl, vertexShader, fragmentShader);
		}
		else {

			this.compileProgram(proxyVertexShader, proxyFragmentShader);
			program = this.program;
			vertexShader = this.vertexShader;
			fragmentShader = this.fragmentShader;
		}






		/* ==================  attrs */
		var positionAttributeLocation, positionBuffer, positions, vao;
		if (false) {

			positionAttributeLocation = gl.getAttribLocation(program, "corner");

			positionBuffer = gl.createBuffer();

			gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

			// three 2d points
			positions = [
			  0, 0,
			  0, 0.5,
			  0.7, 0,
			];
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

			vao = gl.createVertexArray();

			gl.bindVertexArray(vao);

			gl.enableVertexAttribArray(positionAttributeLocation);

			var size = 2;          // 2 components per iteration
			var type = gl.FLOAT;   // the data is 32bit floats
			var normalize = false; // don't normalize the data
			var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
			var offset = 0;        // start at the beginning of the buffer
			gl.vertexAttribPointer(
				positionAttributeLocation, size, type, normalize, stride, offset)
		}
		else {
			this.setInputs();
			positionAttributeLocation = this.buffers[0].attrLocation;
			positionBuffer = this.buffers[0].glBuffer;
			vao = this.buffers[0].vao;
		}






		/* ==================  viewport */
		if (false) {
			// we don't need thid do we??
			//webglUtils.resizeCanvasToDisplaySize(gl.canvas);

			gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
		}
		else {
			this.setGeometry();
		}

		/* ==================  draw */
		if (false) {
			// Clear the canvas
			gl.clearColor(0, 0, 0, 0);
			gl.clear(gl.COLOR_BUFFER_BIT);

			// Tell it to use our program (pair of shaders)
			gl.useProgram(program);

			// Bind the attribute/buffer set we want. ... again?
			//gl.bindVertexArray(vao);


			var primitiveType = gl.TRIANGLES;
			var offset = 0;
			var count = 3;
			gl.drawArrays(primitiveType, offset, count);

		}
		else {
			this.draw()
		}
	}
}

export default abstractViewDef;


