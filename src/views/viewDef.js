
// call this as many times as you have attributes as input to the vec shader
class squishArray {

	// for a subclass of viewDef, attach a buffer that shows up as <attrName> in the v shder,...
	construct(view, attrName) {
		this.view = view;
		const gl = view.gl;
		view.buffers.push(this);

		// small integer indicating which attr this is
		this.attrLocation = gl.getAttribLocation(this.program, attrName);

		// actual ram in GPU chip
		this.glBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.glBuffer);
	}

 	// call after construction.  has <float32TypedArray> data input,
	// broken into rows of <stride> floats, but we only use the <size> number of floats
	// from each row, <offset> from the start of each row.  size=1,2,3 or 4,
	// to make an attr that's a scalar, vec2, vec3 or vec4
	attachArray(float32TypedArray, size, stride = size, offset = 0) {
		const gl = this.view.gl;

		// also try gl.DYNAMIC_DRAW here?
		gl.bufferData(gl.ARRAY_BUFFER, float32TypedArray, gl.STATIC_DRAW);

		this.vao = gl.createVertexArray();
		gl.bindVertexArray(this.vao);
		gl.enableVertexAttribArray(this.attrLocation);

		gl.vertexAttribPointer(this.attrLocation, size, gl.FLOAT, false, stride, offset);
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

// Each viewDef subclass is a definition of a kind of view; one per each kind of view.
// (A SquishView owns an instance of the def and is a React component.)
// This is the superclass of all view defs; with common webgl and space plumbing.
export class viewDef {
	constructor(viewName, canvas) {
		this.viewName = viewName;
		this.canvas = canvas;

		this.initCanvas();

		this.buffers = [];

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
		throw `Error compiling ${type} shader for ${this.viewName}: ${msg}`;
	}

	// call this with your sources after construction
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
			// after this, you'll attach your buffers with your subclassed attachBuffer() method.
		}

		const msg = gl.getProgramInfoLog(program);
		gl.deleteProgram(program);
		throw `Error linking program for ${this.viewName}: ${msg}`;
	}

	/* ************************************************** buffers & variables */
	// all subclasses should write their own attachBuffer() method.
	attachBuffer() {
//		const {gl, canvas} = this;

		// you should call compileProgram yourself before attachBuffer, but this is a dummy
		this.compileProgram(proxyVertexShader, proxyFragmentShader);

		const ar = new squishArray(this, 'corner');
		//const cornerAttributeLocation = gl.getAttribLocation(this.program, 'corner');

//		const cornerBuffer = gl.createBuffer();  // actual ram in GPU chip
//		gl.bindBuffer(gl.ARRAY_BUFFER, cornerBuffer);

		const sin = Math.sin;
		const cos = Math.cos;
//		const center = {x: canvas.width / 2, y: canvas.height / 2};
//		const diameter = Math.min(canvas.width, canvas.height) / 3;
		const corners = new Float32Array([
			cos(2), sin(2),
			cos(4), sin(4),
			cos(6), sin(6),
		]);
		ar.attachArray(corners, 2)

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
	// another dummy submethod... write yer  own
	setGeometry() {

		this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
	}

	/* ************************************************** drawing */
	// another dummy submethod... write yer  own
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

	/* ************************************************** debugging */
	debug1() {
		const gl = this.gl

		// prints mfg and model of GPU.  yawn.
		const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
		const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
		const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
		console.log(`WebGL debug1 return values: vendor='${vendor}' renderer='${renderer}'`);

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
		console.log('Available GL extensions:', available_extensions.join('\n'));
	}
}

export default viewDef;
