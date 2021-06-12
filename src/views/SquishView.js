import React, { Component } from 'react';

import flatView from './flat.view';

/* **************************************** compiling & setting up */


/* **************************************** actual canvas component */

class SquishView extends Component {
	static propTypes = {
//		innerActiveWidth: PropTypes.number,
//		barWidth: PropTypes.number,
	};

	constructor(props) {
		super(props);

		this.state = {
//			vertPotStretch: INITIAL_POT_STRETCH
		};
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

	compileShader(viewName, type, srcString) {
		const {gl, canvas} = this;

		var shader = gl.createShader(type);
		gl.shaderSource(shader, srcString);
		gl.compileShader(shader);
		var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
		if (success) return shader;

		const msg = gl.getShaderInfoLog(shader);
		gl.deleteShader(shader);
		throw `Error compiling ${type} shader for ${viewName}: ${msg}`;
	}

	compileProgram(viewDef) {
		const {gl, canvas} = this;

		const vertexShader = this.compileShader(viewDef.viewName, gl.VERTEX_SHADER, viewDef.vertexSrc);
		const fragmentShader = this.compileShader(viewDef.viewName, gl.FRAGMENT_SHADER, viewDef.fragmentSrc);
		const program = gl.createProgram();
		gl.attachShader(program, vertexShader);
		gl.attachShader(program, fragmentShader);
		gl.linkProgram(program);
		var success = gl.getProgramParameter(program, gl.LINK_STATUS);
		if (success) return program;


		const msg = gl.getProgramInfoLog(program);
		gl.deleteProgram(program);
		throw `Error linking program for ${viewDef.viewName}: ${msg}`;
	}

	attachBuffer() {
		const {gl, canvas} = this;

var positionAttributeLocation = gl.getAttribLocation(program, "a_position");

var positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
var positions = [
  0, 0,
  0, 0.5,
  0.7, 0,
];
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);



var vao = gl.createVertexArray();
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

	setup() {
		this.initCanvas();
		this.compileProgram(flatView);

attachBuffer()

webglUtils.resizeCanvasToDisplaySize(gl.canvas);
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

// Clear the canvas
gl.clearColor(0, 0, 0, 0);
gl.clear(gl.COLOR_BUFFER_BIT);
gl.useProgram(program);


// Bind the attribute/buffer set we want.
gl.bindVertexArray(vao);


var primitiveType = gl.TRIANGLES;
var offset = 0;
var count = 3;
gl.drawArrays(primitiveType, offset, count);


//
//
//viewDef
//export default const viewDef = {
//var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
//this.gl
//	initCanvas()
//			gl.deleteProgram(program);
//
//gl.getProgramInfoLog(program)
//viewDef
//export default const viewDef = {
//
//this.gl
//	initCanvas()


	}

	render() {
		return <canvas className="SquishView"
			width={width} height={height}
			ref={element => this.canvas = element}>
		</canvas>;

	}
}
