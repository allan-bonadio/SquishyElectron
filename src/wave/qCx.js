import complex from 'complex';

// very handy - either arg can be a complex obj, or a real, and the im arg can be absent
const qCx = (re, im) => {
	if (typeof re == 'object') {
		if (typeof im == 'object') {
			return new complex(re.real - im.im, re.im + im.real);
		}
		else {
			return new complex(re.real, re.im + (im || 0));
		}
	}
	else {
		if (typeof im == 'object') {
			// very unlikely
			return new complex((re || 0) - im.im, im.real);
		}
		else {
			// this is the most common use
			return new complex(re || 0, im || 0);
		}
	}
};

// add on these methods, makes some formulas easier.
// factor is always real; often like 2 or -1/2
// always RETURNS value, inputs and this are unchanged
complex.prototype.addTo = function(z, factor = 1){
	z = qCx(z);
	return qCx(this.real + z.real * factor, this.im + z.im * factor);
};

complex.prototype.multBy = function(z){
	z = qCx(z);
	return qCx(this.real * z.real - this.im * z.im, this.im * z.real + this.real * z.im);
};


export default qCx;

