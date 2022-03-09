/*
** test.h -- c++ utilities for unit tests for Squishy Electron
** Copyright (C) 2021-2021 Tactile Interactive, all rights reserved
*/

extern void run_qCx_tests(void);
extern void run_rk2_tests(void);
extern void run_wave_tests(void);
extern void run_space_tests(void);
extern void run_vissFlicks_tests(void);


extern const char *redAnsiStyle, *offAnsiStyle;

extern bool isClose(double a, double b);

extern void qtMessage(const char *fmt, ...);

extern bool qtVerify(int actual, int expected, const char *msg);
extern bool qtVerify(double actual, double expected, const char *msg);
extern bool qtVerify(struct qCx actual, struct qCx expected, const char *msg);
//extern bool qtVerify(struct qCx *actual, struct qCx *expected, const char *msg);
//extern bool qtVerify(struct qSpace *actual, struct qSpace *expected, const char *msg);
extern bool qtVerify(void *actual, void *expected, const char *msg);
//extern void qtVerify(qSpace *actual, qSpace *expected, const char *msg);
//extern void qtVerify(int actual, int expected, const char *msg);

// works for any type that can be tested with ==
#define qtVERIFY(a, b, msg)  if (a != b) printf("*** mismatch %s: #a ≠ #b\n", msg)

extern struct qSpace *make1dSpace(int N);  // handy
extern struct qSpace *makeBare1dSpace(int N);
extern void setCircularWave(struct qWave *target, double n = 1.);


