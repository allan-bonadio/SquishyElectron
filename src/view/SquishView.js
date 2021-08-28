/*
** squish View -- a webgl image of the quantum wave
** Copyright (C) 2021-2021 Tactile Interactive, all rights reserved
*/

import React from 'react';
import PropTypes from 'prop-types';
import {thousands} from '../utils';
import qe from '../wave/qe';
import './view.css';
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
			width: 800,
			height: 400,
		};
	}


	render() {
		const s = this.state;

		// if c++ isn't initialized yet, we can assume the time and frame serial
		let et = '0';
		let iser = '0';
		if (qe.getElapsedTime) {
			// after qe has been initialized
			et = thousands(qe.getElapsedTime().toFixed(2));
			iser = thousands(qe.qSpace_getIterateSerial());
		}

		const spinner = qe.cppLoaded ? ''
			: <img className='spinner' alt='spinner' src='eclipseOnTransparent.gif' />;

		// voNorthWest/East are populated during drawing, so this here is just for yucks
		return (<div className='SquishView' >
			<aside className='viewOverlay'
				style={{width: `${s.width}px`, height: `${s.height}px`}}>


				<div className='northWestWrapper'>
					<span className='voNorthWest'>{et}</span> ps
				</div>
				<div className='northEastWrapper'>
					frame <span className='voNorthEast'>{iser}</span>
				</div>

				{spinner}
			</aside>
			<canvas className='squishCanvas'
				width={s.width} height={s.height}
				ref={element => this.props.setGLCanvas(element)}
				style={{width: `${s.width}px`, height: `${s.height}px`}}>
			</canvas>
		</div>);

		// , border: '1px #aaa solid'

	}

	componentDidMount() {
	}
}

export default SquishView;
