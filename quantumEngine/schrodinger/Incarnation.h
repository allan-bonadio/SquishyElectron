/*
** incarnation -- the instance and simulation of a quantum mechanical wave in a space
** Copyright (C) 2021-2022 Tactile Interactive, all rights reserved
*/


struct Incarnation {
	Incarnation(qSpace *);
	~Incarnation(void);

	int magic;
	qSpace *space;


	// how much time we've iterated, from creation.  pseudo-seconds.  Since we've eliminated
	// all the actual physical constants from the math, why not choose our own definition
	// of what a second is?  Resets to zero every so often.
	double elapsedTime;

	// total number of times thru the number cruncher. (should always be an integer;
	// it's a double cuz I don't know how big it'll get)
	double iterateSerial;

	// set the elapsedTime and iterateSerial to zero
	void resetCounters(void);


	// our main qWave and a scratch wave for stepping
	struct qWave *mainQWave;
	struct qWave *scratchQWave;

	// the buffer to be passed to webgl
	struct qViewBuffer *viewBuffer;

	// params that the user can set
	double dt;
	int stepsPerIteration;
	double lowPassDilution;

	/* *********************************************** iteration */
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
	void fourierFilter(void);

	bool isIterating;

	// please do an FFT after the current iteration ends
	bool pleaseFFT;

	// set pleaseFFt from JS (only if in the middle of an iteration)
	void askForFFT(void);

};


/* ************************************************************ JS interface */

// for JS to call
extern "C" {

	qCx *Incarnation_getWaveBuffer(void);
	float *qViewBuffer_getViewBuffer();
	double Incarnation_getElapsedTime(void);
	double Incarnation_getIterateSerial(void);
	double Incarnation_getMaxNorm(void);


	void Incarnation_oneIteration(void);

	void Incarnation_askForFFT(void);
	void Incarnation_normalize(void);

	int manyRk2Steps(void);

}


