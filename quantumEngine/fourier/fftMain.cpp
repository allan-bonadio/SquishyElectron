/*
** fftMain - top level for FFT code for Squishy Electron
** Copyright (C) 2022-2022 Tactile Interactive, all rights reserved
*/

#include "../spaceWave/qSpace.h"
#include "../schrodinger/Avatar.h"
#include "../spaceWave/qWave.h"
#include "qSpectrum.h"
#include "fftMain.h"

static bool trace = false;


/* ****************************************************** small utilities */

// find next largest integer that we can fft these days
// these days it's a power of 2.  called by qSpace constructor.
void qDimension::chooseSpectrumLength(void) {
	int powerOf2;
	for (powerOf2 = 1; powerOf2 < nStates; powerOf2 += powerOf2)
		continue;
	spectrumLength = powerOf2;
}


/* ********************************************************* qWave interface */


// Calculate the FFT of this qWave and deposit it in the spectrum.
// must make/free your own qSpectrum *spect = new qSpectrum(origSpace);
void qSpectrum::generateSpectrum(qWave *inputQWave) {
	if (trace) printf("🌈 about to generateSpectrum\n");

	cooleyTukeyFFT(wave, inputQWave->wave + start, end - start);

	//printf("    generateSpectrum completed\n");
}

// do an inverse FFT to reconstruct the wave from generateSpectrum()
void qSpectrum::generateWave(qWave *outputWave) {
	if (trace) printf("🌈 about to generateWave\n");

	cooleyTukeyIFFT(outputWave->wave + start, wave, end - start);
	outputWave->fixBoundaries();

	if (trace) printf("    generateWave completed\n");
}


// take this wave in and FFT it and dump the result to console
void analyzeWaveFFT(qWave *original) {
	if (!original || !original->space)
		throw std::runtime_error(original ? "null space in analyzeWaveFFT"
			: "null original in analyzeWaveFFT");
	qSpectrum *spect = new qSpectrum(original->space, NULL);
	spect->generateSpectrum(original);
	spect->dumpSpectrum("🌈  spectrum");
	delete spect;
}

/* ********************************************************* old demo */
//
//// do an FFT and dump the results with demoAllAlgorithms
//
//// try 1 fft algorithm on one buffer
//void demoOneFFT(qCx *buffer, int length,
//	void FFT(qCx *, qCx *, int), void IFFT(qCx *, qCx *, int),
//	const char *algName)
//{
//	qCx outputWave[length], backToOriginal[length];
//
//	// forward
//	FFT(outputWave, buffer, length);
//
//	if (trace) printf("♪ ========================= %s FFT frequency space ==============  \n",
//		algName);
//	qBuffer::dumpSegment(outputWave, true, length/2, length, 0);
//	qBuffer::dumpSegment(outputWave, true, 0, length/2, 0);
//	if (trace) printf("♪ ======================== end of freq dump ==============\n");
//
//	// inverse
////	IFFT(backToOriginal, outputWave, length);
////
////	// show last first so the low frequencies end up at the middle
////	qBuffer::dumpSegment(backToOriginal, 0, length, 0, true);
////	for (int i = 0; i < length; ++i)
////		printf("inverse buffer point %d (%lf %lf)\n", i, buffer[i].re, buffer[i].im);
//}
//
//void demoAllAlgorithms(qCx *wave, int length) {
//	printf("demoAllAlgorithms begins\n");
//	demoOneFFT(wave, length, cooleyTukeyFFT, cooleyTukeyIFFT, "cooleyTukeyFFT");
//	demoOneFFT(wave, length, paChineseFFT, paChineseIFFT, "paChineseFFT");
//	printf("demoAllAlgorithms done\n");
//}
//
//
//qCx chinese16[] = {1, 2, 6, 4, 48, 6, 7, 8, 58, 10, 11, 96, 13, 2, 75, 16};
//qCx chinese8[] = {100, 2, 56, 4, 48, 6, 45, 8, 58, 10};
//
//// independent test of each data sample with all algorithms
//extern "C" void testFFT(void) {
//
//	printf("8-pt square wave\n");
//	qCx sampleSquare[8];
//	sampleSquare[0] = sampleSquare[1] = sampleSquare[2] = sampleSquare[3] = qCx(1);
//	sampleSquare[4] = sampleSquare[5] = sampleSquare[6] = sampleSquare[7] = qCx();
//	demoAllAlgorithms(sampleSquare, 8);
//
//	printf("8-pt chinese\n");
//	demoAllAlgorithms(chinese8, 8);
//
//	printf("16-pt chinese\n");
//	demoAllAlgorithms(chinese16, 16);
//
//}
//
//
//// take this wave in and FFT it and dump the result to console
//// if not a powerof2 length, padds it.
//void analyzeWaveFFT(qWave *inputQWave) {
//	qSpace *origSpace = inputQWave->space;
//	qDimension *origDims = origSpace->dimensions;
//
//	printf("about to create qSpectrum\n");
//	qSpectrum *spec = new qSpectrum(origSpace);
//	printf("    qSpectrum created\n");
//
////	if (scratchSpectrum && (scratchSpectrum->nPoints != origSpace->nPoints)) {
////		delete scratchSpectrum;
////		scratchSpectrum = NULL;
////	}
////	if (!scratchSpectrum)
////		scratchSpectrum = new qSpectrum(origSpace);
//
//
//	// find power of 2 to pad it up to
////	int j;
////	for (j = 1; j < origDims->nStates; j += j) ;
////	int nStates = chooseSpectrumLength(origDims->nStates);
//
//
////	qCx *origWave = inputQWave->wave;
////
////	qWave *input = qWave::newSpectrum(fftSpace);
////	qCx *inputWave = input->wave;
//
////	qWave *output = qWave::newQWave(fftSpace);
////	qCx *outputWave = output->wave;
//
//// sorry we'll do padding later; hope all your Ns are powers of 2
////	// now copy the input into input and pad it; note no continuum bufferpoints
////	int inputIx = 0;
////	for (int ix = origDims->start; ix < origDims->end; ix++)
////		inputWave[inputIx++] = origWave[ix];
////	for (; inputIx < nStates; inputIx++)
////		inputWave[inputIx] = qCx();
//
//	// do it
//	demoAllAlgorithms(inputQWave->wave + inputQWave->start, origSpace->nStates);
//
//	printf("about to delete qSpectrum\n");
//	delete spec;
//	printf("    qSpectrum deleted\n");
//
////	delete fftSpace;
////	delete input;
//}


