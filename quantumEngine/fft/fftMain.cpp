/*
** fftMain - top level for FFT code for Squishy Electron
** Copyright (C) 2021-2021 Tactile Interactive, all rights reserved
*/


/* ********************************************************* qWave interface */

// take this wave in and FFT it and dump the result
void dumpFFT(qWave *qw) {
	qSpace *origSpace = qw->space;
	qDimension *origDims = origSpace->dimensions;

	// find power of 2 to padd it up to
	int j;
	for (j = 1; j < origDims->nStates; j += j) ;
	int bigN = j;

	// make a space for it, bare-bones
	qSpace *fftSpace = new qSpace(1);
	fftSpace->addDimension(bigN, contDISCRETE, "FFT");
	fftSpace->initSpace();

	qCx *origWave = qw->wave;

	qWave *input = new qWave(fftSpace);
	qCx *inputWave = input->wave;

	qWave *output = new qWave(fftSpace);
	qCx *outputWave = output->wave;

	// now copy the input into input and padd it
	int inputIx = 0;
	for (int ix = origDims->start; ix < origDims->end; ix++)
		inputWave[inputIx++] = origWave[ix];
	for (; inputIx < bigN; inputIx++)
		inputWave[inputIx] = qCx();

	// do it
	cooleyTukeyFFT(outputWave, inputWave, bigN);

	printf("FFT of currently displayed wave\n");
	// show last first so the low frequencies end up at the middle
	dumpWaveSegment(outputWave, bigN/2, bigN, 0, true);
	dumpWaveSegment(outputWave, 0, bigN/2, 0, true);
}





/* ********************************************************* test */

void testOneFFT(qCx *buffer, int length,
	void FFT(qCx *, qCx *, int), void IFFT(qCx *, qCx *, int),
	char *algName)
{
	//CArray buffer(inputArray, length);

	// forward cooleyTukeyFFT
	FFT(buffer, buffer, length);

	for (int i = 0; i < length; ++i)
		printf("FFT buffer point %d (%lf %lf)\n", i, buffer[i].re, buffer[i].im);


	// inverse cooleyTukeyFFT
	IFFT(buffer, buffer, length);

	for (int i = 0; i < length; ++i)
		printf("inverse buffer point %d (%lf %lf)\n", i, buffer[i].re, buffer[i].im);
}

void testAllAlgorithms(qCx *wave, int length) {
	testOneFFT(wave, length, cooleyTukeyFFT, cooleyTukeyIFFT, "cooleyTukeyFFT");
	testOneFFT(wave, length, paChineseFFT, paChineseIFFT, "paChineseFFT");
}

double chinese16[] = {1, 2, 6, 4, 48, 6, 7, 8, 58, 10, 11, 96, 13, 2, 75, 16};
double chinese8[] = {100, 2, 56, 4, 48, 6, 45, 8, 58, 10};

void testFFT(void) {

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

