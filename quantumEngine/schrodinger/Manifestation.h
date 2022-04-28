/*
** manifestation -- the integration and simulation of a quantum mechanical wave/space
** Copyright (C) 2021-2022 Tactile Interactive, all rights reserved
*/


struct Manifestation {
	Manifestation(qSpace *);
	~Manifestation(void);


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


	// our main qWave housing our main wave, doing iterations and being displayed.
	// Technically, the one that got the most recent integration iteration
	struct qWave *latestQWave;

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

	bool pleaseFFT;
	bool isIterating;
	void askForFFT(void);





};


/* ************************************************************ JS interface */

// for JS to call
extern "C" {

	qCx *Manifestation_getWaveBuffer(void);
	float *qViewBuffer_getViewBuffer();
	double Manifestation_getElapsedTime(void);
	double Manifestation_getIterateSerial(void);

	void Manifestation_oneIteration(void);


	int manyRk2Steps(void);

}


