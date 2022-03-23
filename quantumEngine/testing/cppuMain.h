/*
** cppu main -- all CPPUTest tests should include this file
** Copyright (C) 2022-2022 Tactile Interactive, all rights reserved
*/

extern struct SimpleString StringFrom(const qCx value);


extern void setCircularWave(struct qWave *target, double n = 1.);

// make JUST a new qSpace() with minimal everything.  No buffers.
extern struct qSpace *makeBareSpace(int N);
#define MAKEBARE1DSPACE_LABEL "makeBareSpace"
#define MAKEBARE1DDIM_LABEL "whateverIveDoneDimension"

// use the jsSpace functions to make a js-callable qSpace in theSpace,
// with all of the buffers allocated.
extern struct qSpace *makeFullSpace(int N);  // handy
#define MAKEFULL1DSPACE_LABEL "makeFullSpace"

// make sure we own all the bytes in this buffer by reading and writing each byte
extern void proveItsMine(void *buf, size_t size);
