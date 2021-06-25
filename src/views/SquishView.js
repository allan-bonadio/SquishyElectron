import React from 'react';
import PropTypes from 'prop-types';

import abstractViewDef from './abstractViewDef';
//import SquishPanel, {listOfViewClasses} from '../SquishPanel';

/* **************************************** compiling & setting up */


/* **************************************** actual canvas component */

export class SquishView extends React.Component {
	static propTypes = {
//		innerActiveWidth: PropTypes.number,
	setGLCanvas: PropTypes.func,
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
//		this.compileProgram(flatViewDef);
//
//setInputs()
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
//abstractViewDef
//export default const abstractViewDef = {
//var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
//this.gl
//	initCanvas()
//			gl.deleteProgram(program);
//
//gl.getProgramInfoLog(program)
//abstractViewDef
//export default const abstractViewDef = {
//
//this.gl
//	initCanvas()

//	}

	//  our setCanvas() calls App's setCanvas, hopefully before C++'s promise hits
	setCanvas(canvas) {
		if (this.canvas) return;

		this.canvas = canvas;
		this.props.setGLCanvas(this.canvas);
	}

	render() {
		return <div>
			<canvas className="SquishView"
				width={800} height={400}
				ref={element => this.setCanvas(element)}
				style={{width: '800px', height: '400px', border: '1px #aaa solid'}}>
			</canvas>
		</div>;



	}

	componentDidMount() {
	}
}

export default SquishView;
