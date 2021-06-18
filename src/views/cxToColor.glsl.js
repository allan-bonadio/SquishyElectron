// line numbers should correspond!  Be careful how many lines this is!
export const cxToColorGlsl = `
float sqrtOneThird = sqrt(1. / 3.);  // 0.57735..
float sqrtThreeOver2 = sqrt(3.) / 2.;  // .8660...

// convert a complex number into a color, whose hue is based on the complex phase of the number.  Piecewise linear.  Visualize a hexagon
// 1+0i is on the far right, 0°, and is Red.  x is real part, y is imaginary part
// 1/2 + √3/2i is Yellow at 60°; -1/2 + √3/2i is Green at 120°, and so on through the hues.
// All result colors are opaque, and are at 100% saturation, except for zero, which is black.
// Each gun is a float 0...1.  300° == -60° as you would expect.
vec3 cxToColor(vec2  psi) {
	if (psi.y == 0.) {
		// real numbers.  Get rid of y=0 cases  that screw up division by y.
		if (psi.x == 0.) {
			return vec3(0., 0., 0.);  // black
		}
		else {
			//console.log('     line 14, psi.x=', psi.x);
			if (psi.x > 0.) {
				return vec3(1., 0., 0.);  // red
			}
			else {
				return vec3(0., 1., 1.);  // cyan
			}
		}
	}

	// in here, the 'gradient' is supposed to range 0...1 or 1...0
	// the slope is ±0 thru ±∞; cotan(angle), x/y, and is used just for qualitative decisions.
	// No transcendental functions were used in this code; all linear approximations.
	// I think each of the diagonal sides sags in the middle but whatever
	float slope = psi.x / psi.y;
	//console.log('     line 23, slope=', slope.toFixed(4));
	if (slope > sqrtOneThird) {
		// magenta, red, yellow... 30° 210°
		if (psi.y > 0.) {
			//console.log('     30°   red ... yellow');
			float gradient = psi.y / psi.x * sqrtOneThird;
			//console.log('     line 48, gradient', gradient.toFixed(4));
			return vec3(1, gradient, 0.);  // red...yellow as gradient increases
		}
		else {
			//console.log('     210°, cyan to blue');
			float gradient = psi.y / psi.x * sqrtOneThird;
			//console.log('     line 54, gradient', gradient.toFixed(4));
			return vec3(0., 1.-gradient, 1.);  // red...magenta as gradient descends from zero
		}
	}

	if (slope < -sqrtOneThird) {
		// green, cyan, blue; psi.re < 0.  y will pass thru zero.
		if (psi.y > 0.) {
			//console.log('     150°  green ... cyan');
			float gradient = psi.y / psi.x * sqrtOneThird;
			//console.log('     line 32, gradient=', gradient.toFixed(4));
			return vec3(0., 1., 1.+gradient);  // cyan...green
		}
		else {
			//console.log('     330°, magenta... red');
			float gradient = psi.y / psi.x * sqrtOneThird;
			//console.log('     line 38, gradient=', gradient.toFixed(4));
			return vec3(1., 0., -gradient);
		}
	}

	// yellow to green (slope goes .57 .. -.57), or blue to magenta
	// x can be zero but we'll avoid dividing by it
	float gradient = (slope/sqrtOneThird + 1.) / 2.;  // 1...0
	//console.log('     line 45, gradient', gradient.toFixed(4));
	if (psi.y > 0.) {
		//console.log('     90°, yellow ... green as angle increases');
		return vec3(gradient, 1., 0.);
	}
	else {
		//console.log('     270°, magenta ... blue as angle decreases');
		return vec3(1.-gradient, 0., 1.);
	}
}


`;  // should be exactly 80 lines long
// add extra blank lines to the end of it to make it an even multiple of 10
// so I don't go crazy debugging it

export default cxToColorGlsl;

/* ************************************************* testing */

// you can test this in Node; just uncomment this section and run it alone.

// testing in JS/node.  so hokey.  This substitutes a few things to turn GLSL  into JS
export function testCxToColorGlsl() {
	const vec3 = function vec3(xx, yy, zz) { return {x: xx, y: yy, z: zz}}
	let jsCxToColor;
	const notClose = (a, b) => (Math.abs(a-b) > 5e-5)

	// test just one angle
	function test1cx(angle, expected, shouldBe) {
		let cx = {
			x: Math.cos(angle * Math.PI / 180),
			y: Math.sin(angle * Math.PI / 180),
		}
		const actual = jsCxToColor(cx);
		console.log(`CxToColor(${angle} ${shouldBe})`+
			` = [${cx.x.toFixed(4)},${cx.y.toFixed(4)}]`+
			` => (${actual.x.toFixed(4)}, ${actual.y.toFixed(4)}, ${actual.z.toFixed(4)})`);
		if (notClose(actual.x, expected.x)
				|| notClose(actual.y, expected.y)
				|| notClose(actual.z, expected.z)) {
			console.error(`**** error in '${shouldBe}': `+
				`(${actual.x},${actual.y},${actual.z}) ≠ `+
				`(${expected.x},${expected.y},${expected.z})`)
		}
		console.log();
	}

	// convert the code to JS, brutally
	let jsCode = cxToColorGlsl.replace(/.*cxToColor.*$/m, '{');
//	console.log(`=========== jsCode 1 ======\n${jsCode}\n=====\n`);
	jsCode = jsCode.replace(/float/g, 'let');
	//jsCode = jsCode.replace(/vec2/g, '').replace(/vec3/, 'function');  // just the first ones
//	console.log(`=========== jsCode 2 =====\n${jsCode}\n======\n`);
	jsCxToColor = new Function('psi', jsCode);

	// run some tests ... go around the circle, testing all crucial points
	test1cx(0, vec3(1, 0, 0), 'Red 1 0 0');
	test1cx(1, vec3(1, 0.0101, 0), 'Red -> Yellow');
	test1cx(30, vec3(1, 0.3333, 0), 'Red + Yellow');
	test1cx(59, vec3(1, 0.9609, 0), 'Yellow -> Red');
	console.log();

	test1cx(60, vec3(1, 1, 0), 'Yellow 1 1 0');
	test1cx(61, vec3(0.9800, 1, 0), 'Yellow -> Green');
	test1cx(90, vec3(.5, 1, 0), 'Yellow + Green');
	test1cx(119, vec3(0.0200, 1, 0), 'Green -> Yellow');
	console.log();

	test1cx(120, vec3(0, 1, 0), 'Green 0 1 0');
	test1cx(121, vec3(0, 1, 0.0391), 'Green -> Cyan');
	test1cx(150, vec3(0, 1, 0.6667), 'Green + Cyan');
	test1cx(179, vec3(0, 1, 0.9899), 'Cyan -> Green');
	console.log();

	test1cx(180, vec3(0, 1, 1), 'Cyan 0 1 1');
	test1cx(181, vec3(0, 0.9899, 1), 'Cyan -> Blue');
	test1cx(210, vec3(0, 0.6667, 1), 'Cyan + Blue');
	test1cx(239, vec3(0, 0.0391, 1), 'Blue -> Cyan');
	console.log();

	test1cx(240, vec3(0, 0, 1), 'Blue 0 0 1');
	test1cx(241, vec3(0.0200, 0, 1), 'Blue -> Magenta');
	test1cx(270, vec3(.5, 0, 1), 'Blue + Magenta');
	test1cx(299, vec3(0.9800, 0, 1), 'Magenta -> Blue');
	console.log();

	test1cx(300, vec3(1, 0, 1), 'Magenta 1 0 1');
	test1cx(301, vec3(1, 0, 0.9609), 'Magenta -> Red');
	test1cx(330, vec3(1, 0, 0.3333), 'Magenta + Red');
	test1cx(359, vec3(1, 0, 0.0101), 'Red -> Magenta');
	console.log();

	test1cx(360, vec3(1, 0, 0), 'Red 1 0 0');
}

//if ( 'object' == typeof module)
//	testCxToColorGlsl();
