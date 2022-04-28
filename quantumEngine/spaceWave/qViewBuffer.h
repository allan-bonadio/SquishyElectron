/*
** View Buffer -- a wrapped buffer of float32s meant to be sent to webgl and the gpu
** Copyright (C) 2021-2022 Tactile Interactive, all rights reserved
*/


// always dynamically allocated
struct qViewBuffer {
	uint32_t magic;

	// always dynamically allocated
	float *buffer;

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

