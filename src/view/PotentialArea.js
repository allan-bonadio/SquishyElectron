/*
** Potential Area -- the white potential line, and its tactile
**	      interactions when the user moves it.  for Squishy Electron
** Copyright (C) 2021-2022 Tactile Interactive, all rights reserved
*/

import React from 'react';
import PropTypes from 'prop-types';

import qe from '../engine/qe';
import qeSpace from '../engine/qeSpace';

// import qeSpace from '../engine/qeSpace';

/* This draws the white potential line, and handles interaction

This was the SVG version... abandoned?  not sure...
See also view/potentialDrawing for the webgl version
*/

/* *************************************************** potential click & drag */

export class PotentialArea extends React.Component {
	static propTypes = {
		// ?? innerActiveWidth: PropTypes.number.isRequired,
		width: PropTypes.number.isRequired,
		height: PropTypes.number.isRequired,
		x: PropTypes.number.isRequired,
		space: PropTypes.instanceOf(qeSpace),
	};

	constructor(props) {
		super(props);
		// why is this called so many times!?!?!?!?!  console.log(`PotentialArea(...`, props, (new Error()).stack);


		this.state = {
			// we increment this in lieu of storing the whole potential in the state
			changeSerial: 0,
		};
	}

	// make the sequence of coordinates the white line needs to draw
	// as compressed as possible
	makePathAttribute() {
		//if (! p.space)  won't be called if no spae
		//	return `M0,0`;  // too early

		const p = this.props;

		const space = p.space;
		const nPoints = space.nPoints;
		const barWidth = p.width / nPoints;
		//const dim = space.dimensions[0];
		const potentialBuffer = this.potentialBuffer = space.potentialBuffer;
		const points = new Array(nPoints);
		let potential = potentialBuffer[0];  //qe.get1DPotential(dim.start);
		points[0] = `M0,${potential}L `;
		for (let ix = 1; ix < nPoints; ix++) {
			potential = potentialBuffer[ix];
			points[ix] = `${(ix * barWidth).toFixed(1)},${(potential).toFixed(4)} `;
		}
		return points.join('');
	}

	mouseReveal(title, ev, x) {
		console.log(`mouse %s on point (%f,%f) potential[%d]=%f`,
			title,
			ev.clientX, ev.clientY,
			x, this.potentialBuffer[x]);
	}

	// every time user changes it
	changePotential(ev, title) {
		const p = this.props;
		let newPotential = ev.clientY;
		const ix = Math.floor((ev.clientX - p.x) / p.barWidth);
		console.log(`mouse %s on point (%f,%f) potential[%d]=%f`,
			title,
			ev.clientX, ev.clientY,
			ix, this.potentialBuffer[ix]);//,
//		mouseReveal(title, ev, ix);

		qe.set1DPotential(ix, p.height + p.y - newPotential);
		this.setState({changeSerial: this.state.changeSerial + 1});
	}

	mouseDown(ev) {
		//const p = this.props;

		// which x?
		//this.mouseReveal('down', ev, ix);

			// a hit! otherwise we wouldn't be calling the event handler.

		this.changePotential(ev, 'M down');
		this.dragging = true;
		//debugger;

	}
//		const x = Math.floor(ev.clientX / p.barWidth);
//		this.mouseReveal('down', ev, x);
////		console.log(`mouseDown on point (%f,%f) %f`,
////			ev.clientX, ev.clientY,
////			potentialBuffer[x), ev];
//		if (Math.abs(qe.space.potentialBuffer[x] - ev.clientY) < 10) {
//			// a hit!
//			console.log(`    a hit! on point ${x}:`, ev);
//			qe.space.potentialBuffer[x] = ev.clientY;
//			this.dragging = true;
//			debugger;
//		}
// 	}

	mouseMove(ev) {
		//const p = this.props;
		//const ix = Math.floor(ev.clientX / p.barWidth);
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
		//const p = this.props;
		this.dragging = false;

		//const ix = Math.floor(ev.clientX / p.barWidth);
		this.changePotential(ev, 'mouse UP');
		//this.mouseReveal('mouse UP', ev, ix);
	}

	render() {
		const p = this.props;
		if (! p.space)
			return '';  // too early
		//debugger;

		let transform =
			`translate(${p.x}px, ${0}px) scale(1, -1) `;
			//`translate(${p.x}px, ${p.height}px) scale(1, -1) `;
		//let transform = `translate(${p.x}px, ${p.height}px) scale(1, 1) `;

		const pathAttribute = this.makePathAttribute();
		return (
			<svg className='PotentialArea' viewBox={`0 0 ${p.width} ${p.height}`}
				width={p.width} height={p.height}
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

			</svg>
		);
	}
}

export default PotentialArea;

