import React from 'react';

import flatView from './flatView';

import viewDef from './viewDef';

/* **************************************** compiling & setting up */


/* **************************************** actual canvas component */

export class SquishView extends React.Component {
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

//
//	setup() {
//		this.initCanvas();
//		this.compileProgram(flatView);
//
//attachBuffer()
//
//webglUtils.resizeCanvasToDisplaySize(gl.canvas);
//gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
//
//// Clear the canvas
//gl.clearColor(0, 0, 0, 0);
//gl.clear(gl.COLOR_BUFFER_BIT);
//gl.useProgram(program);
//
//
//// Bind the attribute/buffer set we want.
//gl.bindVertexArray(vao);
//
//
//var primitiveType = gl.TRIANGLES;
//var offset = 0;
//var count = 3;
//gl.drawArrays(primitiveType, offset, count);

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

//	}

	render() {
		return <div>
			<canvas className="SquishView"
				width={400} height={300}
				ref={element => this.canvas = element}
				style={{width: '400px', height: '300px', border: '1px #aaa solid'}}>
			</canvas>
		</div>;



	}

	componentDidMount() {

		const vd = new viewDef('just kidding', this.canvas);
		//compileProgram(..., ...);
		vd.attachBuffer();
		vd.setGeometry();
		vd.draw();
	}
}

export default SquishView;
