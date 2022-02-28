/*
** blah blah -- like a source file for Squishy Electron
** Copyright (C) 2021-2021 Tactile Interactive, all rights reserved
*/


// adapted from
// https://tfetimes.com/c-fast-fourier-transform/

/* *************************************************** only powers of 2 */
#include <cmath>
//#include "../qCx.h"
#include "../qSpace.h"
#include "../qWave.h"
#include "fftDefs.h"



//const double PI = 3.141592653589793238460;


// Cooley–Tukey FFT from src to dest
// src and dest can be different or the same.  N better be a power of 2.
void cooleyTukeyFFT(qCx *dest, qCx *src, int N)
{
	//printf("cooleyTukeyFFT(N=%d)\n", N);
	if (N <= 1) return;

	// divide
	int N2 = N/2;
	qCx even[N2];
	qCx odd[N2];  //; = src[std::slice(1, N/2, 2)];
	for (size_t k = 0; k < N; k++) {
		if (k & 1)
			odd[(k-1)/2] = src[k];
		else
			even[k/2] = src[k];
	}

	// conquer
	cooleyTukeyFFT(even, even, N2);
	cooleyTukeyFFT(odd, odd, N2);

	// combine
	for (size_t k = 0; k < N2; ++k)
	{
		qReal angle = -2 * PI * k / N;
		qCx t = qCx(cos(angle), sin(angle)) * odd[k];
		//std::polar(1.0, -2 * PI * k / N) * odd[k];
		dest[k    ] = even[k] + t;
		dest[k+N2] = even[k] - t;
	}
}

// inverse fft, same rules as fft(),
// except this trashes the src coming in: all values become complex conjugages, sorry
static void cooleyTukeyIFFT(qCx *dest, qCx *src, int N)
{
	// conjugate the qCx numbers
	for (int i = 0; i < N; i++)
		src[i].im = -src[i].im;

	// forward cooleyTukeyFFT
	cooleyTukeyFFT(dest, src, N);

	// conjugate the qCx numbers again
	for (int i = 0; i < N; i++)
		dest[i].im = -dest[i].im;

	// scale the numbers
//	x /= x.size();
}



