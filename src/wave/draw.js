//import d3 from 'd3';
import {theJWave} from './theWave';
import qe from './qe';
//import {qeSpace} from './qEngine';
//import qCx from './qCx';

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

// just the integer offset pointer from c++
//let cppWave;
//
//function latestWave() {
//	cppWave = qe.Manifestation_getWaveBuffer();
//}
//
//// get the complex value from this one point, by index
//function getCppWave(ixPoint) {
//	const ix = cppWave + 8*2*ixPoint;
//	return qCx(
//		Module.getValue(ix, 'double'),
//		Module.getValue(ix + 8, 'double')
//	);
//
//}
//

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
		let magnitude = psi.norm();
		//console.log(`${x} magnitude: ${magnitude}`);

		// little gaps appear unles you do this
		return `<rect class=psiBar x=${x} y=0 `+
			`width=1.05 height=${magnitude.toPrecision(4)}  fill=${color} />`;
	}

	jWellBars() {
		const bars = theJWave.psi.map((psi, x) => this.oneBar(x, psi));
		return bars.join('\n');
	}

	qeWellBars() {
		qe.createQEWaveFromCBuf();

		const N = qe.space.dimensions[0].N;
		const bars = new Array(N);
		const dim = qe.space.dimensions[0];
		for (let ix = 0; ix < dim.start + dim.end; ix++) {
			bars[ix] = this.oneBar(ix, qe.get1DWave(ix));
		}
		return bars.join('\n');
	}

	draw(useQuantumEngine) {
		throw 'useQuantumEngine';
		let barsHtml;

		if (useQuantumEngine) {
			barsHtml = this.qeWellBars();
		}
		else {
			barsHtml = this.jWellBars();
		}
		//console.info(barsHtml);

		let gElement = document.querySelector('g.waveArea');
		if (!gElement)
		    return;  // first time around, doesn't exist
		gElement.innerHTML = barsHtml;
	}

//	drawFromCpp() {
////		;
////		var cppPot = qe.qSpace_getPotentialBuffer();
////		console.log(`cppWave=${cppWave}  cppPot=${cppPot}`);
////		//var cppWave = cppWave >> 3;
////
////		debugger;
////		// try this
////		var a = Module.getValue(cppWave, 'double');
////		var b = Module.getValue(cppWave+8, 'double');
////		console.log(`a: ${a}   b: ${b}`);
//
//		for (let i = 0; i < 50; i++)
//			console.log(`re=${Module.getValue(cppWave + 8*2*i, 'double')}  im=${Module.getValue(cppWave + 8*(2*i + 1), 'double')}`)
//	}
}

export default draw;

