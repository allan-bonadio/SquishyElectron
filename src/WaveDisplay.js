import React from 'react';
import {theWave, theDraw} from './wave/theWave';

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
		// after the first render, this'll give us the correct width.  We receive innerWindowWidth
		// as a prop so that a window size change will trigger this to rerender, but we don't
		// really use its width - there's a few pixels different.
		let wellWrapper = document.getElementsByClassName('WaveWrapper');
		//let outerPixelWidth = this.props.innerWindowWidth;
		let outerPixelWidth = wellWrapper.length ? wellWrapper[0].offsetWidth : 700;
		let N = theWave.space.N;

		let innerPixelWidth = outerPixelWidth - 2 * WELL_PIXEL_MARGIN;
		let innerPixelHeight = OUTER_PIXEL_HEIGHT - 2 * WELL_PIXEL_MARGIN;

		let translateX = WELL_PIXEL_MARGIN;
		let translateY = OUTER_PIXEL_HEIGHT - WELL_PIXEL_MARGIN;
		console.info(`WDRender: translateX:${translateX}   translateY:${translateY} `);

		// we will draw N+2 bars; including overlap wraparound
		let scaleX = innerPixelWidth / (N + 2);
		let scaleY = -innerPixelHeight * this.state.verticalStretch;
		console.info(`WDRender: scaleX:${scaleX}   scaleY:${scaleY}`);

		let transform = `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY}) `;
		// draw.js will draw in the <g>.  The SVG is all pixel coords inside but lower left of wave panel is at 0, 0
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

/* this is from ant:
			<svg className='svg-chart'
						viewBox={viewBox}
						width={props.graphWidth} height={props.graphHeight}
						preserveAspectRatio='none'
						onMouseDown={this.events ? this.events.mouseDownEvt : ()=>{}}
						onWheel={this.mouseWheelEvt}
						ref={svg => this.graphElement = svg}
						style={style} >

works at least for syntax:
transform: translate(0px, 0px) scale(18.4615, -23);

			<circle
				qCx={0} cy={0}
				r={10} fill='#ff4' stroke='none' />
			<circle
				qCx={innerPixelWidth} cy={innerPixelHeight}
				r={50} fill='#4ff' stroke='none'  />

	//  translate(0, ${innerPixelHeight})



scale(18.4615, 8.84615)

transform: `translate(${WELL_PIXEL_MARGIN}px, ${WELL_PIXEL_MARGIN}px) scale(${scaleX}, ${scaleY}) `,
txers have args separated by comma, but they themselves are separated by spaces.  txlations must have px.

			<rect x={WELL_PIXEL_MARGIN} y={WELL_PIXEL_MARGIN}
				width={innerPixelWidth} height={innerPixelHeight/2} stroke='red' fill='none'/>
			<rect x={WELL_PIXEL_MARGIN + innerPixelWidth/2} y={WELL_PIXEL_MARGIN + innerPixelHeight/2}
				width={innerPixelWidth/2} height={innerPixelHeight/2} stroke='orange'  fill='none' />
			<circle
				qCx={0} cy={0}
				r={50} fill='#cc4' stroke='none' />
			<circle
				qCx={outerPixelWidth} cy={OUTER_PIXEL_HEIGHT}
				r={50} fill='#4cc' stroke='none'  />


*/
