
import React from 'react';
import qe from './wave/qe';
import PropTypes from 'prop-types';
import {} from './wave/qEngine';

/* This draws the white potential line, and handels interaction
	when the user moves it.
*/

const INITIAL_POT_STRETCH = 2;


/* *************************************************** potential click & drag */

export class PotentialArea extends React.Component {
	static propTypes = {
		innerActiveWidth: PropTypes.number,
		barWidth: PropTypes.number,
	};

	constructor(props) {
		super(props);

		this.state = {
			vertPotStretch: INITIAL_POT_STRETCH
		};  // always a power of  2
	}

	// make the sequence of coordinates the white line needs to draw
	// as compressed as possible
	makePathAttribute() {
		if (! qe.latestPotential)
			return `M0,0`;  // too early

		const p = this.props;
		qe.latestPotential();

		const dim = qe.space.dimensions[0];
		const points = new Array(dim.start + dim.end);
		let pot = qe.get1DPotential(dim.start);
		points[0] = `M0,${pot}L `;
		for (let ix = 1; ix < dim.N; ix++) {
			pot = qe.get1DPotential(ix + dim.start);
			points[ix] = `${(ix * p.barWidth).toFixed(1)},${pot} `;
		}
		return points.join('');
	}

	mouseReveal(title, ev, x) {
		console.log(`mouse %s on point (%f,%f) potential[%d]=%f`,
			title,
			ev.clientX, ev.clientY,
			x, qe.get1DPotential(x),
			ev);
	}

	mouseDown(ev) {
		const p = this.props;

		// which x?
		const x = Math.floor(ev.clientX / p.barWidth);
		this.mouseReveal('down', ev, x);
//		console.log(`mouseDown on point (%f,%f) %f`,
//			ev.clientX, ev.clientY,
//			qe.get1DPotential(x), ev);
		if (Math.abs(qe.get1DPotential(x) - ev.clientY) < 10) {
			// a hit!
			console.log(`    a hit! on point ${x}:`, ev);
			qe.set1DPotential(x, ev.clientY);
			this.dragging = true;
			debugger;
		}
	}

	mouseMove(ev) {
		const p = this.props;
		const x = Math.floor(ev.clientX / p.barWidth);
		if (ev.buttons && this.dragging) {
			console.log(`mouseMove:`, ev);

			this.mouseReveal('move dragging', ev, x);
		}
		else {
			this.dragging = false;
			this.mouseReveal('move not dragging', ev, x);
		}
	}

	mouseUp(ev) {
		const p = this.props;
		this.dragging = false;

		const x = Math.floor(ev.clientX / p.barWidth);
		this.mouseReveal('mouse UP', ev, x);
	}

	render() {
		const p = this.props;

		let transform =
			`translate(${p.x.toFixed(1)}px, ${0}px) scale(1, -1) `;
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

