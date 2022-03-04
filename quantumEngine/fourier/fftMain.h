/*
** fftMain - top level for FFT code for Squishy Electron
** Copyright (C) 2021-2021 Tactile Interactive, all rights reserved
*/


// #include <valarray>

//typedef std::valarray<qCx> CArray;

extern "C" {

	//void testFFT(void);

	// UI requests FFT at end of next iteration (or immediately?)
	void askForFFT(void);
}


extern void cooleyTukeyFFT(qCx *dest, qCx *src, int N);
extern void cooleyTukeyIFFT(qCx *dest, qCx *src, int N);

extern void paChineseFFT(qCx *dest, qCx *src, int N);
extern void paChineseIFFT(qCx *dest, qCx *src, int N);

// nice console dump of wave and FFT centered at zero.  For iteration.
extern void analyzeWaveFFT(qWave *qw);

// rounds up to the nearest power of two
extern int nextPowerOf2(int N);

