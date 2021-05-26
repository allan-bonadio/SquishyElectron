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
class cx {
public:
	FLOAT re;
	FLOAT im;

	// constructors
	cx(FLOAT re, FLOAT im) {this->re = re; this->im = im;}
	cx(FLOAT re) {this->re = re; this->im = 0;}
	cx(void) {this->re = this->im = 0;}

	// addition
	cx operator+(cx b) {return cx(re + b.re, im + b.im);}
	cx operator+(FLOAT b) {return cx(re + b, im);}

	cx operator+=(cx b) {re += b.re; im += b.im; return *this;}
	cx operator+=(FLOAT b) {re += b; return *this;}

	// subtraction
	cx operator-(cx b) {return cx(re - b.re, im - b.im);}
	cx operator-(FLOAT b) {return cx(re - b, im);}

	cx operator-=(cx b) {re -= b.re; im -= b.im; return *this;}
	cx operator-=(FLOAT b) {re -= b; return *this;}

	// multiplication
	cx operator*(cx b) {return cx(re * b.re - im * b.im, im * b.re + re * b.im);}
	cx operator*(FLOAT b) {return cx(re * b, im * b);}

	cx operator*=(cx b) {
		FLOAT t = re * b.re - im * b.im;
		im = im*b.re +  + re * b.im;
		re = t;
		return *this;
	}
	cx operator*=(FLOAT b) {re *= b; im *= b; return *this;}

	// division
	cx operator/(cx b) {
		FLOAT det = b.re * b.re + b.im * b.im;
		return cx(
			(re * b.re + im * b.im) / det,
			(im * b.re - re * b.im) / det
		);
	}
	cx operator/(FLOAT b) {re /= b; im /= b; return *this;}

	cx operator/=(cx b) {
		FLOAT det = b.re * b.re + b.im * b.im;
		FLOAT t = (re * b.re + im * b.im) / det;
		im = (im * b.re - re * b.im) / det;
		re = t;
		return *this;
	}
	cx operator/=(FLOAT b) {re -= b; return *this;}


	// inline so faster
	FLOAT norm() {return re*re + im*im;};

	// oh i don't want to do abs
	FLOAT abs();

	// the angle, ±180 degrees.  Kindof retro but really i'm just using it for display colors.
	FLOAT phase();
};

