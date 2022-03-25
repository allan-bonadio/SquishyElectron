/*
** cppu main -- all CPPUTest tests should include this file
** Copyright (C) 2022-2022 Tactile Interactive, all rights reserved
*/

// this allows CHECK_EQUAL() to do complex numbers
extern struct SimpleString StringFrom(const qCx value);

extern void setCircularWave(struct qWave *target, double n = 1.);

// make JUST a new qSpace() with minimal everything.  No buffers.
extern struct qSpace *makeBareSpace(int N);
#define MAKEBARESPACE_LABEL "makeBareSpace"
#define MAKEBARE1DDIM_LABEL "make bare dim label"

// use the jsSpace functions to make a js-callable qSpace in theSpace,
// with all of the buffers allocated.
extern struct qSpace *makeFullSpace(int N);  // handy
#define MAKEFULLSPACE_LABEL "makeFullSpace"

// make sure we own all the bytes in this buffer by reading and writing each byte
extern void proveItsMine(void *buf, size_t size);

// make sure they're equal, both the waves and the nPoints, start and end
extern void compareWaves(struct qBuffer *expected, struct qBuffer *actual);


