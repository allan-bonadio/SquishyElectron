// what kind of floats are we using: double or float or even long double
#define FLOAT  double

// ripped off from math.h
#define SQRT2         1.41421356237309504880  /* sqrt(2) */
#define PI            3.14159265358979323846  /* pi */
#define PI_2          1.57079632679489661923  /* pi/2 */
#define PI_4          0.78539816339744830962  /* pi/4 */

// got this from ... somewhere in case I ever do long doubles
//const pi = 3.1415926535897932384626433832795029L;

// my streamlined complex class
class qCx {
public:
	FLOAT re;
	FLOAT im;

	// constructors
	qCx(FLOAT re, FLOAT im) {this->re = re; this->im = im;}
	qCx(FLOAT re) {this->re = re; this->im = 0;}
	qCx(void) {this->re = this->im = 0;}

	// addition
	qCx operator+(qCx b) {return qCx(re + b.re, im + b.im);}
	qCx operator+(FLOAT b) {return qCx(re + b, im);}

	qCx operator+=(qCx b) {re += b.re; im += b.im; return *this;}
	qCx operator+=(FLOAT b) {re += b; return *this;}

	// subtraction
	qCx operator-(qCx b) {return qCx(re - b.re, im - b.im);}
	qCx operator-(FLOAT b) {return qCx(re - b, im);}

	qCx operator-=(qCx b) {re -= b.re; im -= b.im; return *this;}
	qCx operator-=(FLOAT b) {re -= b; return *this;}

	// multiplication
	qCx operator*(qCx b) {return qCx(re * b.re - im * b.im, im * b.re + re * b.im);}
	qCx operator*(FLOAT b) {return qCx(re * b, im * b);}

	qCx operator*=(qCx b) {
		FLOAT t = re * b.re - im * b.im;
		im = im*b.re +  + re * b.im;
		re = t;
		return *this;
	}
	qCx operator*=(FLOAT b) {re *= b; im *= b; return *this;}

	// division
	qCx operator/(qCx b) {
		FLOAT det = b.re * b.re + b.im * b.im;
		return qCx(
			(re * b.re + im * b.im) / det,
			(im * b.re - re * b.im) / det
		);
	}
	qCx operator/(FLOAT b) {re /= b; im /= b; return *this;}

	qCx operator/=(qCx b) {
		FLOAT det = b.re * b.re + b.im * b.im;
		FLOAT t = (re * b.re + im * b.im) / det;
		im = (im * b.re - re * b.im) / det;
		re = t;
		return *this;
	}
	qCx operator/=(FLOAT b) {re -= b; return *this;}


	// inline so faster
	FLOAT norm() {return re*re + im*im;};

	// oh i don't want to do abs
	FLOAT abs();

	// the angle, ±180 degrees.  Kindof retro but really i'm just using it for display colors.
	FLOAT phase();
};

