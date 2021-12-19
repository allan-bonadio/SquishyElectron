/*
** q Wave -- an organized wave and space pointer &tc
**            This also has qFlick and view buffers in it
** Copyright (C) 2021-2021 Tactile Interactive, all rights reserved
*/


// a 'wave' is a straight array of qCx, of length space->nPoints.
// a 'qWave' is an object with cool methods for the wave it encloses.
// a 'qFlick' (see below) is a sequence of waves
struct qWave {

	// create a qWave, dynamically allocated or hand in a buffer to use
	qWave(qSpace *space);
	qWave(qSpace *space, qCx *buffer);
	~qWave();

	// for a naked wave, and for a qWave.  dumpThatWave same as in qSpace::
	void dumpThatWave(qCx *wave, bool withExtras = false);
	void dumpWave(const char *title, bool withExtras = false);
	void copyThatWave(qCx *dest, qCx *src);

	qSpace *space;

	// the actual data, hopefully in the right size allocated block, space->nPoints
	qCx *buffer;

	// if it used the first constructor
	int dynamicallyAllocated: 1;

	void forEachPoint(void (*callback)(qCx, int));
	void forEachState(void (*callback)(qCx, int));

	// just allocate the wave as long as needed by the space (used by qFlick for the others)
	qCx *allocateWave(void);
	void freeWave(qCx *);

	virtual void fixBoundaries(void);  // on this buffer
	void prune(void);
	qReal innerProduct(void);
	virtual void normalize(void);
	//void lowPassFilter(double dilution = 0.5);

	virtual void setCircularWave(qReal n);
	void setStandingWave(qReal n);
	void setPulseWave(qReal widthFactor, qReal cycles);
};



// a flick is a sequence of Wave buffers.  Used for visscher waves.
// Multiple complex buffers; they all share the same characteristics in the qWave fields.
// Acts like a qWave that only points to the 'current' buffer.
struct qFlick : public qWave {
	qFlick(qSpace *space, int maxWaves);
	~qFlick();

	// dump
	qReal dumpRow(char *buf, int doubleAge, int ix, double *pPrevPhase, bool withExtras);
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
	qReal innerProduct(void);
	void normalize(void);
	void setCircularWave(qReal n);

	// retrieve properly interpolated values here
	qReal magnitude(int doubleAge, int ix = 1);
	qCx value(int doubleAge, int ix = 1);
	qReal magnitude(int ix = 1) { return magnitude(1, ix); }
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
	float loadViewBuffer(qCx *wave = NULL);
};

// 'the' being the only one sometimes
extern qViewBuffer *theQViewBuffer;

// JS interface to copy latest wave into vb
extern "C" int refreshViewBuffer(void);
