/*
** blah blah -- like a source file for Squishy Electron
** Copyright (C) 2021-2021 Tactile Interactive, all rights reserved
*/

//import complex from 'complex';
import cxToRgb from '../view/cxToRgb';

// do this old school class so  i can use the constructor without new
function qCx(re, im) {
	// if called as a function instead of with new, convert
	if (!this || this === window)
		return new qCx(re, im);

	if (typeof re == 'object') {
		if (typeof im == 'object') {
			return {re: re.re - im.im, im: re.im + im.re};
		}
		else {
			return {re: re.re, im: re.im + (im || 0)};
		}
	}
	else {
		if (typeof im == 'object') {
			// very unlikely
			return {re: (re || 0) - im.im ,im:  im.re};
		}
		else {
			// this is the most common use
			return {re: re || 0, im: im || 0};
		}
	}

}

// aint workin
qCx.prototype.color = function color() {
	return cxToRgb(this);
};

// aint workin
qCx.prototype.magn = function magn() {
	return this.re ** 2 + this.im ** 2;
}

// very handy - either arg can be a complex obj, or a real, and the im arg can be absent
// const qCx = (re, im) => {
// 	if (typeof re == 'object') {
// 		if (typeof im == 'object') {
// 			return {re: re.re - im.im, re.im + im.re);
// 		}
// 		else {
// 			return {re: re.re, re.im + (im || 0));
// 		}
// 	}
// 	else {
// 		if (typeof im == 'object') {
// 			// very unlikely
// 			return {re: (re || 0) - im.im, im.re);
// 		}
// 		else {
// 			// this is the most common use
// 			return {re: re || 0, im || 0);
// 		}
// 	}
// };

// add on these methods, makes some formulas easier.
// factor is always real; often like 2 or -1/2
// always RETURNS value, inputs and this are unchanged
// complex.prototype.addTo = function(z, factor = 1){
// 	z = qCx(z);
// 	return qCx(this.re + z.re * factor, this.im + z.im * factor);
// };
//
// complex.prototype.multBy = function(z){
// 	z = qCx(z);
// 	return qCx(this.re * z.re - this.im * z.im, this.im * z.re + this.re * z.im);
// };


export default qCx;

