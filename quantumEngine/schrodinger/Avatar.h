/*
** Avatar -- the instance and simulation of a quantum mechanical wave in a space
** Copyright (C) 2021-2022 Tactile Interactive, all rights reserved
*/


struct Avatar {
	Avatar(qSpace *);
	~Avatar(void);
	void dumpOffsets(void);

	int magic;
	qSpace *space;

	/* *********************************************** JS accessible */
	// please keep alignment stable and correct!  See also jsAvatar.js
	// Keep arranged from larger to smaller - doubles, then ints, then bools

	// how much time we've iterated, from creation.  pseudo-seconds.  Since we've eliminated
	// all the actual physical constants from the math, why not choose our own definition
	// of what a second is?  Resets to zero every so often.
	double elapsedTime;

	// total number of times thru the number cruncher. (should always be an integer;
	// it's a double cuz I don't know how big it'll get)
	double iterateSerial;


	// params that the user can set
	double dt;
	double lowPassFilter;
	int stepsPerIteration;

	bool isIterating;

	// please do an FFT after the current iteration ends
	bool pleaseFFT;

	/* *********************************************** iteration */

	// our main qWave and a scratch wave for stepping
	struct qWave *mainQWave;

	//  Call the function first time you need it.
	struct qWave *scratchQWave;
	qWave *getScratchWave(void);

	// for the fourier filter.  Call the function first time you need it.
	struct qSpectrum *spect;
	qSpectrum *getSpect(void);

	// the qViewBuffer to be passed to webgl
	struct qViewBuffer *qvBuffer;

	// set the elapsedTime and iterateSerial to zero
	void resetCounters(void);

	// multiple steps; stepsPerIteration+1
	void oneIteration(void);

	void oneRk2Step(qWave *oldQWave, qWave *newQWave);  // obsolete
	void oneRk4Step(qWave *oldQWave, qWave *newQWave);  // obsolete
	void oneVisscherStep(qWave *oldQWave, qWave *newQWave);

	// visscher
	void stepReal(qCx *newW, qCx *oldW, double dt);
	void stepImaginary(qCx *newW, qCx *oldW, double dt);
	void visscherHalfStep(qWave *oldQWave, qWave *newQWave);  // obsolete

	// kill high frequencies via FFTs
	void fourierFilter(double lowPassFilter);

	// set pleaseFFt from JS (only if in the middle of an iteration)
	void askForFFT(void);

};

extern Avatar *theAvatar;

/* ************************************************************ JS interface */

// for JS to call
extern "C" {

	qCx *Avatar_getWaveBuffer(void);
	float *qViewBuffer_getViewBuffer();
	double Avatar_getElapsedTime(void);
	double Avatar_getIterateSerial(void);
	double Avatar_getMaxNorm(void);


	void Avatar_oneIteration(void);

	void Avatar_askForFFT(void);
	void Avatar_normalize(void);

	int manyRk2Steps(void);

}


