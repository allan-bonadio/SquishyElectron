import React from 'react';
import {theDraw} from './wave/theWave';
import qe from './wave/qe';

/* This draws the well, without the psi wave (see draw.js).
coordinate systems:
pixel = screen pixels; inside the svg
wave = actual value of ⟨ψ | ψ⟩, average about 1/N, in y direction, positive is up
			value of the index x, scaled to fit the area.  Inside g.waveDisplay
*/

// all these are pixels
export const OUTER_PIXEL_HEIGHT = 500;
//export const OUTER_PIXEL_WIDTH = 1000;
export const WELL_PIXEL_MARGIN = 20;

const INITIAL_STRETCH = 2;

// Just lay down the SVG, and the draw code will draw on its own schedule.

export class WaveDisplay extends React.Component {
	constructor(props) {
		super(props);

		this.state = {verticalStretch: INITIAL_STRETCH};  // always a power of  2
	}

	// draw will call this if the magnitude goes above the top of the area
	mustStretch() {
		this.setState({verticalStretch: this.state.verticalStretch / 2})
	}

	// draw will call this if the max magnitude goes too low
	mustShrink() {
		this.setState({verticalStretch: this.state.verticalStretch * 2})
	}

	componentDidMount() {
		if (theDraw) theDraw.draw();
	}

	componentDidUpdate() {
		if (theDraw) theDraw.draw();
	}

	render() {
		const tWave = this.props.aDimension;
		//console.log(`starting render of WaveDisplay, tWave=`, tWave);

		// can't do this without a wave!  When it exists, this prop will change.
//		if (!tWave)
//			return null;

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
		let N = tWave ? tWave.space.N : 5;
		let scaleX = innerPixelWidth / (N + 2);
		let scaleY = -innerPixelHeight * this.state.verticalStretch;
		//console.info(`WDRender: innerPixelWidth:${innerPixelWidth} N+2:${N+2}`+
		//	` scaleX:${scaleX}   scaleY:${scaleY}`);

		let transform = `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY}) `;
		// draw.js will draw in the <g>.  The SVG is all pixel coords inside but lower left of wave panel is at 0, 0

		//console.log(`about to render WaveDisplay, theWave=${tWave}`);
		return <section className='WaveWrapper'>
			<svg className='WaveDisplay'
					width='100%' height={OUTER_PIXEL_HEIGHT}
					preserveAspectRatio='none'
					viewBox={`0 0 ${outerPixelWidth} ${OUTER_PIXEL_HEIGHT}`}
					xmlns="http://www.w3.org/2000/svg" >


				<rect className='activeArea'
					x={translateX + scaleX} y='0'
					width={N*scaleX} height={OUTER_PIXEL_HEIGHT}/>
				<g className='waveDisplay' style={{transform: transform}} />
			</svg>
		</section>;

	}
}

export default WaveDisplay;

