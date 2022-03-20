/*
** cppu main -- all CPPUTest tests should include this file
** Copyright (C) 2022-2022 Tactile Interactive, all rights reserved
*/

extern struct SimpleString StringFrom(const qCx value);


extern void setCircularWave(struct qWave *target, double n = 1.);

// make JUST a new qSpace() with minimal everything.  No buffers.
extern struct qSpace *makeBare1dSpace(int N);
#define MAKEBARE1DSPACE_LABEL "makeBare1dSpace"
#define MAKEBARE1DDIM_LABEL "whateverIveDoneDimension"

// use the jsSpace functions to make a js-callable qSpace in theSpace,
// with all of the buffers allocated.
extern struct qSpace *makeFull1dSpace(int N);  // handy
#define MAKEFULL1DSPACE_LABEL "makeFull1dSpace"

// make sure we own all the bytes in this buffer by reading and writing each byte
extern void claimItsMine(void *buf, size_t size);
