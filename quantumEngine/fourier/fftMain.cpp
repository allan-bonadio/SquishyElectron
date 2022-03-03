/*
** fftMain - top level for FFT code for Squishy Electron
** Copyright (C) 2021-2021 Tactile Interactive, all rights reserved
*/

#include "../qSpace.h"
#include "../qWave.h"
#include "fftMain.h"



/* ****************************************************** small utilities */

// find next power of 10 >= N
int nextPowerOf2(int N) {
	int powerOf2;
	for (powerOf2 = 1; powerOf2 < N; powerOf2 += powerOf2) ;
	return powerOf2;
}

/* ********************************************************* qWave interface */

void testAllAlgorithms(qCx *wave, int length);


// take this wave in and FFT it and dump the result to console
// if not a powerof2 length, padds it.
void analyzeWaveFFT(qWave *inputQWave) {
	qSpace *origSpace = inputQWave->space;
	qDimension *origDims = origSpace->dimensions;

	// find power of 2 to pad it up to
//	int j;
//	for (j = 1; j < origDims->nStates; j += j) ;
	int nStates = nextPowerOf2(origDims->nStates);

	// make a space for it, bare-bones
	qSpace *fftSpace = new qSpace(1);
	fftSpace->addDimension(nStates, contDISCRETE, "FFT");
	fftSpace->initSpace();

	qCx *origWave = inputQWave->wave;

	qWave *input = new qWave(fftSpace);
	qCx *inputWave = input->wave;

//	qWave *output = new qWave(fftSpace);
//	qCx *outputWave = output->wave;

	// now copy the input into input and pad it; note no continuum bufferpoints
	int inputIx = 0;
	for (int ix = origDims->start; ix < origDims->end; ix++)
		inputWave[inputIx++] = origWave[ix];
	for (; inputIx < nStates; inputIx++)
		inputWave[inputIx] = qCx();

	// do it
	testAllAlgorithms(inputWave, nStates);

	delete fftSpace;
	delete input;
}


/* ********************************************************* test */

void testOneFFT(qCx *buffer, int length,
	void FFT(qCx *, qCx *, int), void IFFT(qCx *, qCx *, int),
	const char *algName)
{
	//CArray buffer(inputArray, length);
	qCx outputWave[length];

	// forward
	FFT(buffer, buffer, length);

	for (int i = 0; i < length; ++i)
		printf("FfT frequency space:\n");
	dumpWaveSegment(outputWave, length/2, length, 0, true);
	dumpWaveSegment(outputWave, 0, length/2, 0, true);

	// inverse
	IFFT(outputWave, buffer, length);

	printf("back to original wave\n");
	// show last first so the low frequencies end up at the middle
	dumpWaveSegment(outputWave, 0, length, 0, true);
//	for (int i = 0; i < length; ++i)
//		printf("inverse buffer point %d (%lf %lf)\n", i, buffer[i].re, buffer[i].im);
}

void testAllAlgorithms(qCx *wave, int length) {
	testOneFFT(wave, length, cooleyTukeyFFT, cooleyTukeyIFFT, "cooleyTukeyFFT");
	testOneFFT(wave, length, paChineseFFT, paChineseIFFT, "paChineseFFT");
}





qCx chinese16[] = {1, 2, 6, 4, 48, 6, 7, 8, 58, 10, 11, 96, 13, 2, 75, 16};
qCx chinese8[] = {100, 2, 56, 4, 48, 6, 45, 8, 58, 10};

// independent test of each data sample with all algorithms
extern "C" void testFFT(void) {

	printf("8-pt square wave\n");
	qCx sampleSquare[8];
	sampleSquare[0] = sampleSquare[1] = sampleSquare[2] = sampleSquare[3] = qCx(1);
	sampleSquare[4] = sampleSquare[5] = sampleSquare[6] = sampleSquare[7] = qCx();
	testAllAlgorithms(sampleSquare, 8);

	printf("8-pt chinese\n");
	testAllAlgorithms(chinese8, 8);

	printf("16-pt chinese\n");
	testAllAlgorithms(chinese16, 16);

}

