// small rectangular graph showing user what kind of wave or potential they're asking for
import PropTypes from 'prop-types';
import {scaleLinear} from 'd3-scale';
import {path} from 'd3-path';

function setPT() {
	MiniGraph.propTypes = {
		className: PropTypes.string,

		// function that accepts x, and returns y, a real or qCx if complex
		yFunction: PropTypes.func,

		// pass true for a wave, area plot drawn from top.  Or false for just a white line on black.
		complex: PropTypes.bool,

		// domain and range
		xMin: PropTypes.number,
		xMax: PropTypes.number,
		yMin: PropTypes.number,
		yMax: PropTypes.number,

		// size of graph, in pixels
		width: PropTypes.number,
		height: PropTypes.number,
	};
	MiniGraph.defaultProps = {
		className: '',

		yFunction: (x) => Math.sin(x / 180 * Math.PI),
		complex: false,

		xMin: 0,
		xMax: 360,
		yMin: undefined,  // means auto-range, both independent.
		yMax: undefined,  // for complex, y = magn
		width: 100,
		height: 50,
	};
}

function MiniGraph(props) {
	const p = props;
	let viewBox = `0 0 ${+p.width} ${+p.height}`;

	// calculate all and find extents
	const xScale = scaleLinear([+p.xMin, +p.xMax], [0, p.width]);
	let maxi = -Infinity, mini = Infinity;
	let values = new Array(p.width);
	for (let xPx = 0; xPx <= +p.width; xPx++) {
		let x = xScale.invert(xPx);
		let y = p.yFunction(x);
		let magn = y;
		if (typeof y == 'object') {
			values[xPx] = {x: xPx, ...y};
			magn = y.re * y.re + y.im * y.im;
		}
		else {
			values[xPx] = {x: xPx, y};
		}
		if (magn < mini) mini = magn;
		if (magn > maxi) maxi = magn;
	}
	if (p.yMin !== undefined) mini = +p.yMin;
	if (p.yMax !== undefined) maxi = +p.yMax;

	// figure out the scaling
	const yScale = scaleLinear([mini - .2, maxi + .2], [0, p.height]);

	let colorScale;
	if (p.complex) {
		colorScale = scaleLinear([0, 1, 2, 3, 4, 5, 6],
					['#f00', '#ff0', '#0f0', '#0ff', '#00f', '#f0f', '#f00']);
	}

	// generate points.  Really, we want to generate per-pixel or per-two-pixel
	let pathData = path();
	pathData.moveTo(p.xMin, yScale(values[0].y).toFixed(2));
	values.forEach((val, xPx) => {
		pathData.lineTo(xPx, yScale(val.y).toFixed(2));
	});
//	for (let xPx = 0; xPx <= p.width; xPx++) {
//		let x = xScale.invert(xPx);
//		let y = p.yFunction(x);
//		y: Math.round(yScale(y) * 100) / 100
//	}
	const d = pathData.toString();

	return <svg className={`MiniGraph ${p.className}`}
						viewBox={viewBox}
						width={p.width} height={p.height}
						preserveAspectRatio='none' >

		<g className='line-paths'>
			<path d={d} stroke='#f80' fill='none' />
		</g>

	</svg>;
}

setPT();

export default MiniGraph;
