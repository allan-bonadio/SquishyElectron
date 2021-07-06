
#include <math.h>
#include "qCx.h"

qCx qCx::operator/(qCx b) {
	qReal det = b.re * b.re + b.im * b.im;
	return qCx(
		(re * b.re + im * b.im) / det,
		(im * b.re - re * b.im) / det
	);
}

// what is wrong with this?  this is handed in ÷ 10.
qCx qCx::operator/=(qCx b) {
	printf("÷ this=%lf %lf; b=%lf %lf\n", this->re, this->im, b.re, b.im);
	printf("÷ this=%lf %lf; b=%lf %lf\n", re, im, b.re, b.im);
	qReal det = b.re * b.re + b.im * b.im;
	printf("÷ this=%lf %lf; b=%lf %lf\n", this->re, this->im, b.re, b.im);
	printf("÷ this=%lf %lf; b=%lf %lf\n", re, im, b.re, b.im);
	printf("÷ re * b.re=%lf; im * b.im=%lf\n", re * b.re, im * b.im);
	qReal t = (re * b.re + im * b.im) / det;
	printf("÷ det=%lf; t=%lf\n", det, t);
	this->im = (im * b.re - re * b.im) / det;
	this->re = t;
	printf("÷ re=%lf  im=%lf\n", re, im);
	return *this;
}

// more work than it's worth - should use the norm instead
qReal qCx::abs() {
	return sqrt(this->norm());
}

// in real degrees!
qReal qCx::phase() {
	return atan2(im, re) * 180 / PI;
}

void qCheck(qCx aCx) {
	if (isnan(aCx.re) || isnan(aCx.im))
		printf("complex number became NaN: (%lf,%lf)\n", aCx.re, aCx.im);
}

