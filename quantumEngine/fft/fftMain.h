/*
** fftMain - top level for FFT code for Squishy Electron
** Copyright (C) 2021-2021 Tactile Interactive, all rights reserved
*/


// #include <valarray>

//typedef std::valarray<qCx> CArray;

extern "C" {

	void testFFT(void);

	void askForFFT(void);
}


extern void dumpFFT(qWave *qw);


void cooleyTukeyFFT(qCx *dest, qCx *src, int N);
void cooleyTukeyIFFT(qCx *dest, qCx *src, int N);

void paChineseFFT(qCx *dest, qCx *src, int N);
void paChineseIFFT(qCx *dest, qCx *src, int N);



