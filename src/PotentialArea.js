/*
** Potential Area -- the white potential line, and its tactile
**	      interactions when the user moves it.  for Squishy Electron
** Copyright (C) 2021-2022 Tactile Interactive, all rights reserved
*/

import React from 'react';
import PropTypes from 'prop-types';

import qe from './wave/qe';
import PropTypes from 'prop-types';

import qeSpace from './wave/qeSpace';

/* This draws the white potential line, and handels interaction

*/

/* *************************************************** potential click & drag */

export class PotentialArea extends React.Component {
	static propTypes = {
		innerActiveWidth: PropTypes.number,
		barWidth: PropTypes.number,
	};

	constructor(props) {
		super(props);

		this.state = {
			// we increment this in lieu of storing the whole potential in the state
			changeSerial: 0,
		};
	}

	// make the sequence of coordinates the white line needs to draw
	// as compressed as possible
	makePathAttribute() {
		if (! qe.potentialBuffer)
			return `M0,0`;  // too early

		const p = this.props;

		const space = qe.space;
		const dim = space.dimensions[0];
		const potentialBuffer = space.potentialBuffer;
		const points = new Array(dim.start + dim.end);
		let potential = qe.get1DPotential(dim.start);
		points[0] = `M0,${potential}L `;
		for (let ix = 1; ix < dim.N; ix++) {
			potential = qe.get1DPotential(ix + dim.start);
			points[ix] = `${(ix * p.barWidth).toFixed(1)},${potential} `;
		}
		return points.join('');
	}

	mouseReveal(title, ev, x) {
		console.log(`mouse %s on point (%f,%f) potential[%d]=%f`,
			title,
			ev.clientX, ev.clientY,
			x, qe.get1DPotential(x));//,
//			ev);
	}

	// every time user changes it
	changePotential(ev, title) {
		const p = this.props;
		let newPotential = ev.clientY;
		const ix = Math.floor((ev.clientX - p.x) / p.barWidth);
		console.log(`mouse %s on point (%f,%f) potential[%d]=%f`,
			title,
			ev.clientX, ev.clientY,
			ix, qe.get1DPotential(ix));//,
//		mouseReveal(title, ev, ix);

		qe.set1DPotential(ix, p.height + p.y - newPotential);
		this.setState({changeSerial: this.state.changeSerial + 1});
	}

	mouseDown(ev) {
		const p = this.props;

		// which x?
		//this.mouseReveal('down', ev, ix);

			// a hit! otherwise we wouldn't be calling the event handler.

		this.changePotential(ev, 'M down');
		this.dragging = true;
		//debugger;

//		}
//		const x = Math.floor(ev.clientX / p.barWidth);
//		this.mouseReveal('down', ev, x);
////		console.log(`mouseDown on point (%f,%f) %f`,
////			ev.clientX, ev.clientY,
////			qe.get1DPotential(x), ev);
//		if (Math.abs(qe.space.potentialBuffer[x] - ev.clientY) < 10) {
//			// a hit!
//			console.log(`    a hit! on point ${x}:`, ev);
//			qe.space.potentialBuffer[x] = ev.clientY;
//			this.dragging = true;
//			debugger;
//		}
	}

	mouseMove(ev) {
		const p = this.props;
		const ix = Math.floor(ev.clientX / p.barWidth);
		if (ev.buttons && this.dragging) {
			//this.mouseReveal('move DRAGGING', ev, ix);
			this.changePotential(ev, 'move DRAGGING');
			this.dragging = true;
			//debugger;
		}
		else {
			this.dragging = false;
			//this.mouseReveal('not dragging', ev, 0);
		}
	}

	mouseUp(ev) {
		const p = this.props;
		this.dragging = false;

		//const ix = Math.floor(ev.clientX / p.barWidth);
		this.changePotential(ev, 'mouse UP');
		//this.mouseReveal('mouse UP', ev, ix);
	}

	render() {
		const p = this.props;

		let transform =
			`translate(${p.x}px, ${p.height}px) scale(1, -1) `;
		//let transform = `translate(${p.x}px, ${p.height}px) scale(1, 1) `;

		const pathAttribute = this.makePathAttribute();
		return (
			<g className='PotentialArea'
			 	style={{transform: transform}} >
				<rect className='potentialCardNotUsed'
					style={{display: 'none'}}
					x='0' y={-p.height}
					width={p.width} height={p.height}
				/>

				<path className='potentialLine'
					stroke='white' strokeWidth='1' fill='none'
					d={pathAttribute}
					pointerEvents='none'
					/>

				<path className='tactileLine'
					stroke='none' strokeWidth='9' fill='none'
					d={pathAttribute}
					pointerEvents='stroke'
					onMouseDown={ev => this.mouseDown(ev)}
					onMouseMove={ev => this.mouseMove(ev)}
					onMouseUp={ev => this.mouseUp(ev)}
					/>

			</g>
		);
	}
}

export default PotentialArea;

