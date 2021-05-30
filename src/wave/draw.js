import d3 from 'd3';
import {theWave} from './theWave';

// color tables.  The component at position 3 is for real values
const colorNodes = [
	[0, 255, 255],
	[0, 0, 255],
	[255, 0, 255],
	[255, 0, 0],
	[255, 255, 0],
	[0, 255, 0],

	[0, 255, 255],
	[0, 0, 255],  // should not be needed
];

// this class draws the wavefunction, using raw DOM.
// for each new wave, do like this: drawer = new draw(wave)
class draw {
	constructor(wave) {
		this.wave = wave;
	}

	// return a CSS color for the phase given a complex value
	complexColor(value) {
		// angle becomes 0 ... +6
		const angle = 3 * value.arg() / Math.PI + 3;

		// interpolate along hexagon sides
		const inte = Math.floor(angle);
		const frac = angle - inte;
		const antifrac = 1 - frac;
		const lo = colorNodes[inte];
		const hi = colorNodes[inte+1];
		if (!lo || !hi) debugger;
		const r = hi[0] * frac + lo[0] * antifrac;
		const g = hi[1] * frac + lo[1] * antifrac;
		const b = hi[2] * frac + lo[2] * antifrac;

		return `rgb(${r.toFixed()},${g.toFixed()},${b.toFixed()})`;
	}

	// generate a bar given complex value handed in.  Vertical range is ... um...
	oneBar(x, psi) {
		if (!  psi || typeof psi != 'object') debugger;
		let color = this.complexColor(psi);
		let magnitude = (psi.real * psi.real + psi.im * psi.im);
		//console.log(`${x} magnitude: ${magnitude}`);

		return `<rect x=${x} y=0 width=1 height=${magnitude.toPrecision(4)}  fill=${color} />`;
	}

	wellBars() {
		const bars = theWave.psi.map((psi, x) => this.oneBar(x, psi));
		return bars.join('\n');
	}

	draw() {
		let barsHtml = this.wellBars();
		//console.info(barsHtml);

		let gElement = document.querySelector('.waveDisplay');
		if (!gElement)
		    return;  // first time around, doesn't exist
		gElement.innerHTML = barsHtml;
	}
}

export default draw;

//import {extent} from 'd3-array';
//import {scaleLinear} from 'd3-scale';
//import {line} from 'd3-shape';

/*
******************* from ant
//			this.xScale.domain([this.state.xMin, this.state.xMax]);
//			this.xScale.domain([scene.xMin, scene.xMax]);
//		this.xScale.range([this.marginLeft, this.marginRight]);
//		this.yScale.range([this.marginBottom, this.marginTop]);
//		this.xScale = scaleLinear();
//		this.yScale = scaleLinear();
//		this.setScaleRanges();
//			[mi, mx] = extent(this.vertexSeries[f], d => d.y);
//		this.yScale.domain([mini, maxi]);
//
//
//
//			// lineSeries is a mapper that takes an entire series and churns
//			// out the SVG coordinate string for the d attribute.
//			// .x() and .y() set accessors into the items.
//			const lineSeries = line()
//				.x(d => this.xScale(d.x))
//				.y(d => this.yScale(d.y));
//
//
//
//			linePaths = this.vertexSeries.map((series, ix) =>
//					<path className='series' d={lineSeries(series)} key={ix}
//						stroke={this.funcs[ix].color} />);
//
//
//
//
********************** from try1
//	render() {
//		const well = this.props.well;
//		const N = well.N;
//		const WIDTH=500;
//		const pixPerPoint = WIDTH / well.N;
//
//		const bars = [];
//		well.dump();
//		for (let i = 1; i <= N; i++) {
//			const height = well.psi[i].abs() ** 2 * 100;
//			bars[i] = <div className='psiBar' key={i}
//				style={{width: pixPerPoint + 'px', height: height + 'px'}} />
//		}
//
//		return <div className='WellDisplay'>
//			{bars}
//			<br clear='both' />
//		</div>;
*/

