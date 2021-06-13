
import React from 'react';
import {theDraw} from './wave/theWave';
import qe from './wave/qe';
import PropTypes from 'prop-types';

import PotentialArea from './PotentialArea';

/* This draws the well, without the psi wave (see draw.js).
coordinate systems:
pixel = screen pixels; inside the svg
wave = actual value of ⟨ψ | ψ⟩, average about 1/N, in y direction, positive is up
			value of the index x, scaled to fit the area.  Inside g.waveArea

Naming Conventon:
Starts with a Captial, it's a whole React component
*View is an SVG element that shows whatever.
*Area is a g element, transparent but groups and sets coord system
*Card is a rect element, for a background
*/

// all these are pixels
export const OUTER_PIXEL_HEIGHT = 500;
//export const OUTER_PIXEL_WIDTH = 1000;
export const WELL_PIXEL_MARGIN = 20;

const INITIAL_WAVE_STRETCH = 2;


// Just lay down the SVG, and the draw code will draw on its own schedule.
export class WaveView extends React.Component {
	static propTypes = {
		N: PropTypes.number,
		innerWindowWidth: PropTypes.number,
		useQuantumEngine: PropTypes.bool,
	};

	constructor(props) {
		super(props);

		this.state = {
			vertWaveStretch: INITIAL_WAVE_STRETCH,  // always a power of  2
		};  // always a power of  2
	}

	// draw will call this if the magnitude goes above the top of the area
	mustStretch() {
		this.setState({vertWaveStretch: this.state.vertWaveStretch / 2})
	}

	// draw will call this if the max magnitude goes too low
	mustShrink() {
		this.setState({vertWaveStretch: this.state.vertWaveStretch * 2})
	}

	componentDidMount() {
		if (theDraw) theDraw.draw(this.state.useQuantumEngine);
	}

	componentDidUpdate() {
		if (theDraw) theDraw.draw(this.state.useQuantumEngine);
	}



	render() {


//return '';


		const N = this.props.N;

		if (!qe.main)
			return '';  // too early

		// after the first render, this'll give us the correct width.  We receive innerWindowWidth
		// as a prop so that a window size change will trigger this to rerender, but we don't
		// really use its width - there's a few pixels different.
		let wellWrapper = document.getElementsByClassName('WaveWrapper');
		//let outerPixelWidth = this.props.innerWindowWidth;
		let outerPixelWidth = wellWrapper.length ? wellWrapper[0].offsetWidth : 700;

		let innerPixelWidth = outerPixelWidth - 2 * WELL_PIXEL_MARGIN;
		let innerPixelHeight = OUTER_PIXEL_HEIGHT - 2 * WELL_PIXEL_MARGIN;

		let translateX = WELL_PIXEL_MARGIN;
		let translateY = OUTER_PIXEL_HEIGHT - WELL_PIXEL_MARGIN;
		//console.info(`WDRender: translateX:${translateX}   translateY:${translateY} `);

		// we will draw N+2 bars; including overlap wraparound
		let barWidth = innerPixelWidth / (N + 2);
		let scaleYWave = -innerPixelHeight * this.state.vertWaveStretch;
		//console.info(`WDRender: innerPixelWidth:${innerPixelWidth} N+2:${N+2}`+
		//	` barWidth:${barWidth}   scaleY:${scaleY}`);

		// width of just the N points in the middle,
		// excluding the two boundary cells
		let innerActiveWidth = N * barWidth;

		let transform = `translate(${translateX}px, ${translateY}px) scale(${barWidth}, ${scaleYWave}) `;

		// left side of actual wave, not counting the border point (barWidth)
		const edgeOfPsi = translateX + barWidth;

		// draw.js will draw wave in the <g.waveArea>, NOT via React.
		// The SVG is all pixel coords inside but lower left of wave panel is at 0, 0
		// rect.waveCard is the black area in the middle, from top to bottom
		// the PotentialPanel draws the potentialline in white and does interaction;
		// it takes up the whole height inside the svg

		//console.log(`about to render WaveView, theWave=${tWave}`);
		return <section className='WaveWrapper'>
			<svg className='WaveView'
					width='100%' height={OUTER_PIXEL_HEIGHT}
					preserveAspectRatio='none'
					viewBox={`0 0 ${outerPixelWidth} ${OUTER_PIXEL_HEIGHT}`}
					xmlns="http://www.w3.org/2000/svg" >

				<rect className='waveCard' x={edgeOfPsi} y={0}
					width={innerActiveWidth} height={OUTER_PIXEL_HEIGHT} />

				<g className='waveArea' style={{transform: transform}} />

				<PotentialArea barWidth={barWidth} innerActiveWidth={innerActiveWidth}
					x={edgeOfPsi} y={0}
					width={innerActiveWidth} height={OUTER_PIXEL_HEIGHT} />

				<text className='elapsedTime' x='20' y='20' width='50' height='20' >
					{qe.getElapsedTime && qe.getElapsedTime().toFixed(2)}
				</text>
			</svg>
		</section>;

	}
}

export default WaveView;

