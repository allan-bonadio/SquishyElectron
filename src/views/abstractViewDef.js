import {viewUniform, viewAttribute} from './viewVariable';
import {curioShader, curioProgram, curioParameter} from './curiosity';
import SquishPanel from '../SquishPanel';
import {qeStartPromise} from '../wave/qEngine';

// right now this is set in constructor
let bufferDataDrawMode;

//let sp = SquishPanel;  // tell optimizer to gimme Squish Panel


// Each abstractViewDef subclass is a definition of a kind of view; one per each kind of view.
// (A SquishView owns an instance of the def and is a React component.)
// This is the superclass of all view defs; with common webgl and space plumbing.
// viewName is not the viewClassName, which is one of flatViewDef, garlandView, ...
// there should be ONE of these per canvas, so each squishView should have 1.
export class abstractViewDef {
	static viewName: 'abstract';
	static viewClassName: 'abstractViewDef';

	/* ************************************************** construction */
	constructor(viewName, canvas) {
		this.viewVariables = [];

		this.viewName = viewName;
		if (! canvas) throw `abstractViewDef: being created without canvas`;
		this.canvas = canvas;
		this.initCanvas();



		// really a global, at least within this file, so this is how you turn this one way
		// or another, if it makes a diff
		bufferDataDrawMode = this.gl.DYNAMIC_DRAW;
		//bufferDataDrawMode = this.gl.STATIC_DRAW;



		// after construction, the instantiator should call compileProgram()
	}

	// preliminary construction, called in constructor
	initCanvas() {
		let gl = this.gl = this.canvas.getContext("webgl");
		if (! gl)
			gl = this.gl = this.canvas.getContext("experimental-webgl");


		if (!gl) throw `Sorry this browser doesn't do WebGL!  You might be able to turn it on ...`;
		this.gl = gl;
		/*
		Can be enabled in Firefox by setting the about:config preference
		webgl.enable-prototype-webgl2 to true

		Can be enabled in Chrome by passing the "--enable-unsafe-es3-apis"
		flag when starting the browser through the command line
		OR: chrome://flags/#enable-webgl-draft-extensions in Chromium based browsers (Chrome, Opera).

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


		this.vaoExt = gl.getExtension('OES_vertex_array_object');
		if (! this.vaoExt) throw `Sorry this browser doesn't do OES_vertex_array_object!`+
				`\nI guess I can't blame you, how would you know.`;
	}

	// the final call to set it up does all viewClassName-specific stuff
	// other subclassers override what they want
	completeView() {
		this.setShaders();
		this.setInputs();
		this.setGeometry();
		this.draw();

		// just for curiosity's sake
		//curioShader(this.gl, this.vertexShader);
		//curioShader(this.gl, this.fragmentShader);
		//curioProgram(this.gl, this.program);
		//curioParameter(this.gl);
	}

	/* ************************************************** Shader Creation/Compile */
	compileShader(type, srcString) {
		const {gl} = this;

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

	// call this with your sources in setShaders().
	// must have attached vertexShaderSrc and fragmentShaderSrc already
	compileProgram() {
		const {gl} = this;

		const program = gl.createProgram();

		const vertexShader = this.compileShader(gl.VERTEX_SHADER, this.vertexShaderSrc);
		gl.attachShader(program, vertexShader);
		this.vertexShader = vertexShader;

		const fragmentShader = this.compileShader(gl.FRAGMENT_SHADER, this.fragmentShaderSrc);
		gl.attachShader(program, fragmentShader);
		this.fragmentShader = fragmentShader;


		gl.linkProgram(program);
		var success = gl.getProgramParameter(program, gl.LINK_STATUS);
		if (success) {
			this.program = program;
			return
			// after this, you'll attach your viewVariables with your subclassed setInputs() method.
		}

		const msg = gl.getProgramInfoLog(program);
		gl.deleteProgram(program);
		throw `Error linking program for ${this.viewName}: ${msg}`;
	}

	// abstract supermethod: write your setShaders() function to compile your two GLSL sources
	setShaders() {
		this.vertexShaderSrc = `
		attribute vec4 corner;
		uniform int cornerColor;
		void main() {
			gl_Position = corner;
		}
		`;

		this.fragmentShaderSrc = `
		precision highp float;  // does this do anything?

		void main() {
		  gl_FragColor = vec4(.5, 1, 0, 1);
		}
		`;

		this.compileProgram();
	}

	/* ************************************************** buffers & variables */
	// abstract supermethod: all subclasses should write their own setInputs() method.
	// mostly, creating viewVariables that can be dynamically changed
	setInputs() {
//		const {gl, canvas} = this;

		new viewUniform('cornerColor', this,
			() => ({value: 42, type: '1i'}));

		const cornerAttr = this.cornerAttr = new viewAttribute('corner', this);

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
		cornerAttr.attachArray(corners, 2);

//		also try gl.DYNAMIC_DRAW here
//		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(corners), bufferDataDrawMode);
//
//		var vao = this.vaoExt.createVertexArrayOES();
//		this.vaoExt.bindVertexArrayOES(vao);
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

		//this.vaoExt.bindVertexArrayOES(this.vao);
		this.cornerAttr.reloadVariable()

		const primitiveType = gl.TRIANGLES;
		const offset = 0;
		const count = 3;
		gl.drawArrays(primitiveType, offset, count);
	}

	/* ************************************************** debugging */
//	debug1() {
//		const gl = this.gl
//
//		// prints mfg and model of GPU.  yawn.
//		const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
//		const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
//		const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
//		console.log(`--- debug_renderer_info: vendor='${vendor}' renderer='${renderer}'`);
//
//		// prints src of shaders, decompiled after compilation.  Fairly interesting; not all that useful.
//		const ds = gl.getExtension('WEBGL_debug_shaders');
//		var vSrc = ds.getTranslatedShaderSource(this.vertexShader);
//		var fSrc = ds.getTranslatedShaderSource(this.fragmentShader);
//		console.log(`--- vertexShader:
//${vSrc}
//--- fragmentShader:
//${fSrc}
//`);

		// also try this URL in chrome...    chrome://internals/web-app
		// after enabling it here: chrome://flags/#enable-webgl-draft-extensions
		// or is it heree??!?!    chrome://flags/#record-web-app-debug-info
		// firefox: webgl.enable-draft-extensions in Firefox

		// try this on flores after restarting chrome since Jun 12: chrome://memories/
		// enabled here in chrome:      chrome://flags/#memories-debug

		// cool, list all exts:
//		const available_extensions = gl.getSupportedExtensions();
//		console.log(`--- available GL extensions:\n${available_extensions.join('\n')}`);
//	}

	/* ************************************* crawling out of the wreckage */
	// pass in the actual DOM element.
	// do EXACTLY THE SAME as
	// https://webgl2fundamentals.org/webgl/lessons/webgl-fundamentals.html
	static crawlFromTheWreckage(canvas) {
		let vd = new abstractViewDef('crawlFromTheWreckage', canvas);
		vd.cftw(canvas);
	}

//CFTW
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
			vertexShaderSource = `

			// an attribute is an input (in) to a vertex shader.
			// It will receive data from a buffer
			attribute vec4 corner;
			uniform cornerColor;
			varying color;

			// all shaders have a main function
			void main() {

			  // gl_Position is a special variable a vertex shader
			  // is responsible for setting
			  gl_Position = corner;
			  color = cornerColor;
			}
			`;


//CFTW
			fragmentShaderSource = `

			// fragment shaders don't have a default precision so we need
			// to pick one. highp is a good default. It means "high precision"
			precision highp float;
			varying vec4 color;
			void main() {
			  // Just set the output to a constant reddish-purple
			  gl_FragColor = color;
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


//CFTW
			program = createProgram(gl, vertexShader, fragmentShader);
		}
		else {

//			this.compileProgram(proxyVertexShader, proxyFragmentShader);
			program = this.program;
			vertexShader = this.vertexShader;
			fragmentShader = this.fragmentShader;
		}






		/* ==================  attrs */

//CFTW
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
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), bufferDataDrawMode);

			vao = this.vaoExt.createVertexArrayOES();
			this.vaoExt.bindVertexArrayOES(vao);

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
			positionAttributeLocation = this.viewVariables[0].attrLocation;
			positionBuffer = this.viewVariables[0].glBuffer;
			vao = this.viewVariables[0].vao;
		}


//CFTW





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
			//this.vaoExt.bindVertexArrayOES(vao);


			var primitiveType = gl.TRIANGLES;
			var off = 0;
			var count = 3;
			gl.drawArrays(primitiveType, off, count);

		}
		else {
			this.draw()
		}
	}

//CFTW end
}

//if (SquishPanel) SquishPanel.addMeToYourList(abstractViewDef);
export default abstractViewDef;



/* *********************************************************** manualViewDef */

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

		void main() {
			// chartreuce triangle
			gl_FragColor = vec4(.5, 1, 0, 1);
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

		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(corners), bufferDataDrawMode);

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
//if (SquishPanel) SquishPanel.addMeToYourList(manualViewDef);

/* ****************************************************** viewVariableViewDef */

// this makes a light green color if false, a little on the yellow side.
// if true, you should see something brighter and less yellow
let includeUniform = true;

// slightly more complicated with the viewVariables
export class viewVariableViewDef extends abstractViewDef {
	static viewName: 'viewVariable';
	static viewClassName: 'viewVariableViewDef';

	// same constructor and everything else, mostly
	setShaders() {
		this.vertexShaderSrc = `
		attribute vec4 corner;
		void main() {
			gl_Position = corner;
		}
		`;

		const decl = includeUniform ? `uniform vec4 julianne;` : '';
		const julianne = includeUniform ? `julianne` : 'vec4(0.,.5,1.,1.)';
		this.fragmentShaderSrc = `
		precision highp float;  // does this do anything?
		${decl}

		void main() {
			// colored triangle, depends on the uniform?
			gl_FragColor = ${julianne};
		}
		`;

		this.compileProgram();
	}


	// all to do this one differently
	setInputs() {
		const gl = this.gl;

		let ccUni;
		if (includeUniform)
			ccUni = this.cornerColorUni = new viewUniform('julianne', this,
				() => ({value: [0, 1, .5, 1], type: '4fv'}));

//		const cornerAttributeLocation = gl.getAttribLocation(this.program, 'corner');
//		const cornerBuffer = gl.createBuffer();  // actual ram in GPU chip
//		gl.bindBuffer(gl.ARRAY_BUFFER, cornerBuffer);

		const sin = Math.sin;
		const cos = Math.cos;
		const corners = new Float32Array([
			cos(2), sin(2),
			cos(4), sin(4),
			cos(6), sin(6),
		]);
		const cornerAttr = this.cornerAttr = new viewAttribute('corner', this);
		cornerAttr.attachArray(corners, 2);

		//cornerAttributeLocation = cornerAttr.attributeLoc;


		//cornerAttr.attachArray(float32TypedArray, 2);
		//attachArray(float32TypedArray, size, stride = size * 4, offset

//		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(corners), bufferDataDrawMode);

//		var vao = this.vaoExt.createVertexArrayOES();
//		this.vaoExt.bindVertexArrayOES(vao);
//		this.vao = vao;
//		gl.enableVertexAttribArray(cornerAttr.attributeLoc);

//		const size = 2;          // 2 components per iteration
//		const type = gl.FLOAT;   // the data is 32bit floats
//		const normalize = false; // don't normalize the data
//		const stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
//		const offset = 0;        // start at the beginning of the buffer
//		gl.vertexAttribPointer(cornerAttr.attributeLoc, size, type, normalize, stride, offset);
	}
}

//if (SquishPanel) SquishPanel.addMeToYourList(viewVariableViewDef);

// this is the way to do it
qeStartPromise.then((arg) => {
	if (SquishPanel) {
		//debugger;//  hey does this owrk?
		SquishPanel.addMeToYourList(abstractViewDef);
		SquishPanel.addMeToYourList(manualViewDef);
		SquishPanel.addMeToYourList(viewVariableViewDef);
	}
});
