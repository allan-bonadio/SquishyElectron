/*
** q Wave -- an organized wave and space pointer &tc
**            This file also has qFlick and view buffers in it
** Copyright (C) 2021-2021 Tactile Interactive, all rights reserved
*/


// a 'wave' is a straight array of qCx, of length space->nPoints.
// a 'qWave' is an object with cool methods for the wave it encloses, plus a qSpace pointer.
// a 'qFlick' (see below) is a sequence of waves
// a 'qViewBuffer' is specifically to send coordinates to WebGL for display; very different

struct qWave {

	// create a qWave, dynamically allocated or hand in a buffer to use
	qWave(qSpace *space);
	qWave(qSpace *space, qCx *wave);
	~qWave();

	// for a naked wave, and for a qWave.  dumpThatWave same as in qSpace::
	// so the length of each buffer is nPoints from the wave's space.
	void dumpThatWave(qCx *wave, bool withExtras = false);
	void dumpWave(const char *title, bool withExtras = false);
	void copyThatWave(qCx *dest, qCx *src);

	// this has, among other things, the count of points and states in all qWave buffers
	qSpace *space;

	// the actual data, hopefully in the right size allocated block, space->nPoints
	qCx *wave;

	// used for low pass; need general buffer for arithmetic
	qCx *scratchBuffer;

	// if it used the first constructor
	int dynamicallyAllocated: 1;

	void forEachPoint(void (*callback)(qCx, int));
	void forEachState(void (*callback)(qCx, int));

	// just allocate the wave as long as needed by the space (used by qFlick for the others)
	qCx *allocateWave(void);
	void freeWave(qCx *);

	virtual void fixBoundaries(void);  // on this buffer
	void prune(void);
	double innerProduct(void);
	virtual void normalize(void);
	void lowPassFilter(double dilution = 0.01);
	void nyquistFilter(void);

	////virtual void setCircularWave(double n);
	//void setStandingWave(double n);
	//void setPulseWave(double widthFactor, double cycles, double offset);

	// calculates special size
	static newFourierWave(qSpace *space, qCx *useThisBuffer)
};



// a flick is a sequence of Wave buffers.  Used for visscher waves.
// Multiple complex buffers; they all share the same characteristics in the qWave fields.
// Acts like a qWave that only points to the 'current' buffer.
struct qFlick : public qWave {
	qFlick(qSpace *space, int maxWaves);
	~qFlick();

	// dump
	double dumpRow(char *buf, int doubleAge, int ix, double *pPrevPhase, bool withExtras);
	void dumpOneAge(const char *title, int doubleAge, bool withExtras);
	void dumpLatest(const char *titleIn, bool withExtras);
	void dumpAllWaves(const char *title);
	void dumpOverview(const char *title);

	// them, all dynamically allocated
	qCx **waves;
	int maxWaves;  // how long waves is, in pointiers
	int nWaves;  // how many are actually in use (those behond should be null!)

	// create and add a new buffer, zeroed, at the 0 position, pushing the others up
	void pushWave(void);

	// make a new wave, copy of wave (can't have duplicate waves in the
	// flick or it'll be confusing deallocating?)
	//void pushCopy(qCx *wave);
	//void installWave(qCx *wave);

	// the current one is === the one pointed to by buffer.  usually zero for the first one.
	int currentIx;
	void setCurrent(int which);

	// for vischer
	double innerProduct(void);
	void normalize(void);
	//void setCircularWave(double n);

	// retrieve properly interpolated values here
	double magnitude(int doubleAge, int ix = 1);
	qCx value(int doubleAge, int ix = 1);
	double magnitude(int ix = 1) { return magnitude(1, ix); }
	qCx value(int ix = 1) { return value(1, ix); }

	void fixBoundaries(void);  // on latest two buffers
};



// always dynamically allocated
struct qViewBuffer {
	// always dynamically allocated
	float *viewBuffer;

	qSpace *space;

	qViewBuffer(qSpace *space);

	~qViewBuffer();

	// copy the numbers in wave or latestQWave into this->viewBuffer
	// also converts from doubles to floats.
	float loadViewBuffer(void);
};

// 'the' being the only one sometimes
extern qViewBuffer *theQViewBuffer;

void dumpViewBuffer(const char *title = NULL);

void dumpWaveSegment(qCx *wave, int start, int end, int continuum, bool withExtras);


// JS interface
extern "C" {
	void qViewBuffer_dumpViewBuffer(const char *title = NULL);
	float *qViewBuffer_getViewBuffer(void);
	void qViewBuffer_loadViewBuffer(void);
}

