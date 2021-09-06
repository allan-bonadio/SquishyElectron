/*
** q complex - complex and other types we use all over
** Copyright (C) 2021-2021 Tactile Interactive, all rights reserved
*/


#include <stdlib.h>
#include <stdint.h>
#include <stdio.h>
#include <string.h>
#include <float.h>

#include <emscripten.h>

#define byte unsigned char
#define char16 char16_t

// what kind of floats are we using: double or float or even long double
#define qReal  double

// ripped off from math.h
#define SQRT2         1.41421356237309504880  /* sqrt(2) */
#define PI            3.14159265358979323846  /* pi */
#define PI_2          1.57079632679489661923  /* pi/2 */
#define PI_4          0.78539816339744830962  /* pi/4 */

// got this from ... somewhere in case I ever do long doubles
//const pi = 3.1415926535897932384626433832795029L;

// useful in cmath: isnan(qReal) isinf(qReal) NAN INFINITY  isfinite()
// ilogb(qReal)

// my streamlined complex class
class qCx {
public:
	qReal re;
	qReal im;

	// informal constructors
	qCx(qReal real, qReal imag) {re = real; im = imag;}
	qCx(qReal real) {re = real; im = 0;}
	qCx(void) {re = im = 0;}

	// // // // // // // // // // // // // addition
	qCx operator+(qCx b) {return qCx(re + b.re, im + b.im);}
	qCx operator+(qReal b) {return qCx(re + b, im);}

	qCx operator+=(qCx b) {re += b.re; im += b.im; return *this;}
	qCx operator+=(qReal b) {re += b; return *this;}

	// // // // // // // // // // // // // subtraction
	qCx operator-(qCx b) {return qCx(re - b.re, im - b.im);}
	qCx operator-(qReal b) {return qCx(re - b, im);}
	qCx operator-(void) {return qCx(-re, -im);}

	qCx operator-=(qCx b) {re -= b.re; im -= b.im; return *this;}
	qCx operator-=(qReal b) {re -= b; return *this;}


	// // // // // // // // // // // // // multiplication
	qCx operator*(qCx b) {return qCx(re * b.re - im * b.im, im * b.re + re * b.im);}
	qCx operator*(qReal b) {return qCx(re * b, im * b);}

	//    over complex
	qCx operator*=(qCx b) {
		qReal t = re * b.re - im * b.im;
		im = im*b.re +  + re * b.im;
		re = t;
		return *this;
	}

	//    over reals
	qCx operator*=(qReal b) {re *= b; im *= b; return *this;}


	// // // // // // // // // // // // // division
	qCx operator/(qCx b);

	// over reals
	qCx operator/(qReal b) {return qCx(re / b, im / b);}

	qCx operator/=(qCx b);
	qCx operator/=(qReal b) {re /= b; im /= b; return *this;}


	// inline so faster
	qReal norm() {return re*re + im*im;};

	// oh i don't want to do abs
	qReal abs();

	// the angle, ±180 degrees.  Kindof retro but really i'm just using it
	// for display colors.  not even that.
	qReal phase();
};

typedef class qCx qCx;

extern void qCheck(qCx aCx);
