/*
** squish View -- a webgl image of the quantum wave (or whatever)
** Copyright (C) 2021-2022 Tactile Interactive, all rights reserved
*/

import React from 'react';
import PropTypes from 'prop-types';
import {thousands} from '../widgets/utils';
import qe from '../wave/qe';
import './view.scss';
//import abstractViewDef from './abstractViewDef';
//import SquishPanel, {listOfViewClasses} from '../SquishPanel';

/* **************************************** compiling & setting up */


/* **************************************** actual canvas component */

export class SquishView extends React.Component {
	static propTypes = {
//		innerActiveWidth: PropTypes.number,
		setGLCanvas: PropTypes.func,

		height: PropTypes.number,
		widrh: PropTypes.number
	};

	constructor(props) {
		super(props);

		this.state = {
//			vertPotStretch: INITIAL_POT_STRETCH
// 			width: 800,
// 			height: 400,
		};
	}

	render() {
		const p = this.props;

		// if c++ isn't initialized yet, we can assume the time and frame serial
		let et = '0';
		let iser = '0';
		if (qe.getElapsedTime) {
			// after qe has been initialized
			et = thousands(qe.getElapsedTime().toFixed(4));
			iser = thousands(qe.Avatar_getIterateSerial());
		}

		const spinner = qe.cppLoaded ? ''
			: <img className='spinner' alt='spinner' src='eclipseOnTransparent.gif' />;

		// voNorthWest/East are populated during drawing, so this here is just for yucks
		return (<div className='SquishView' >
			<aside className='viewOverlay'
				style={{width: `${p.width}px`, height: `${p.height}px`}}>

				<div className='northWestWrapper'>
					<span className='voNorthWest'>{et}</span> ps
				</div>
				<div className='northEastWrapper'>
					iteration <span className='voNorthEast'>{iser}</span>
				</div>

				{spinner}
			</aside>
			<canvas className='squishCanvas'
				width={p.width} height={p.height}
				ref={element => this.props.setGLCanvas(element)}
				style={{width: `${p.width}px`, height: `${p.height}px`}}>
			</canvas>
		</div>);
	}
}

export default SquishView;
