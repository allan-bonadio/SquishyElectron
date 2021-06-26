import React from 'react';
import PropTypes from 'prop-types';

//import abstractViewDef from './abstractViewDef';
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


	//  our setCanvas() calls App's setCanvas, hopefully before C++'s promise hits
	setCanvas(canvas) {
		if (this.canvas) return;

		this.canvas = canvas;
		this.props.setGLCanvas(this.canvas);
	}

	render() {
		return (<div>
			<canvas className="SquishView"
				width={800} height={400}
				ref={element => this.setCanvas(element)}
				style={{width: '800px', height: '400px', border: '1px #666 inset'}}>
			</canvas>
		</div>);

		// , border: '1px #aaa solid'

	}

	componentDidMount() {
	}
}

export default SquishView;
