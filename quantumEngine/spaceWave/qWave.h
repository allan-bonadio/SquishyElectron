/*
** quantum Wave -- an organized wave and space pointer &tc that represents a QM state
**            This file also has qFlick and view buffers in it
** Copyright (C) 2021-2022 Tactile Interactive, all rights reserved
*/

// a 'wave' is a straight array of qCx, of length space->nPoints.
//    named this way even for spectrums
// a 'qBuffer' is a wrapped wave that knows how to traverse itself
// a 'qWave' is an object with cool methods for the wave it encloses,
//    plus a qSpace pointer.  Subclass of qBuffer.
// a 'qFlick' (see below) is a sequence of waves (defunct)
// a 'qViewBuffer' is specifically to send coordinates to WebGL for display; very different
// a 'qSpectrum' is like a qWave designed for FFT results.  Subclass of qBuffer.

extern qCx *allocateWave(int nPoints);
extern void freeWave(struct qCx *wave);

// a long array of qCx complex numbers, plus some other info
struct qBuffer {

	// create one, dynamically allocated or Bring Your Own Buffer to use
	qBuffer(void);
	virtual ~qBuffer();

	uint32_t magic;

	// calls solo allocateWave() but for this wave's count and stuff
	qCx *allocateWave(int nPoints = -1);

	// constructor for qWave and qSpectrum calls this to finish up & alloc buffer
	void initBuffer(int length, qCx *useThisBuffer = NULL);

	// the actual data, hopefully in the right size allocated block
	qCx *wave;

	void copyThatWave(qCx *dest, qCx *src, int length = -1);

	int nPoints; int start; int end;  // should be the same as in the space, either the wave or the spectrum.

	// if it used the first constructor
	// this has, among other things, the count of points and states in all qWave buffers
	// but for just a bare qBuffer, this can be null, for freelance buffers.
	qSpace *space;

	int dynamicallyAllocated: 1;

	// print one complex number, plus maybe some more calculated metrics for that point,
	// on a line in the dump on stdout.
	static double dumpRow(char buf[200], int ix, qCx w, double *pPrevPhase, bool withExtras);

	// print any segment of any buffer
	// you can use this on waves or spectrums; for the latter, leave off the start and the rest
	static void dumpSegment(qCx *wave, bool withExtras = false,
		int start = 0, int end = -1, int continuum = 0);

	double innerProduct(void);
	virtual void normalize(void);
	virtual void fixBoundaries(void);
};


struct qWave : public virtual qBuffer {

	// create a qWave, dynamically allocated or hand in a buffer to use
	qWave(qSpace *space, qCx *useThisBuffer = NULL);

	virtual ~qWave();


	// for a naked wave, and for a qWave.  dumpThatWave same as in qSpace::
	// so the length of each buffer is nPoints from the wave's space.
	void dumpThatWave(qCx *wave, bool withExtras = false);
	void dumpWave(const char *title, bool withExtras = false);

	// used for low pass; need general buffer for arithmetic
	qCx *scratchBuffer;

	// never even tried any of these
	void forEachPoint(void (*callback)(qCx, int));
	void forEachState(void (*callback)(qCx, int));

	// only waves need this, bit everyone needs it for normalize
	virtual void fixBoundaries(void);  // on this buffer

	void prune(void);
	void lowPassFilter(double dilution = 0.01);
	void nyquistFilter(void);
};




// (maybe obsolete...)
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


struct qSpectrum : public virtual  qBuffer {

	// create a qWave, dynamically allocated or hand in a buffer to use
	qSpectrum(qSpace *space, qCx *useThisBuffer = NULL);

	~qSpectrum();

	void dumpThatSpectrum(qCx *wave, bool withExtras);
	void dumpSpectrum(const char *title, bool withExtras);
};




// always dynamically allocated
struct qViewBuffer {
	uint32_t magic;

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

// JS interface
extern "C" {
	void qViewBuffer_dumpViewBuffer(const char *title = NULL);
	float *qViewBuffer_getViewBuffer(void);
	void qViewBuffer_loadViewBuffer(void);
}

