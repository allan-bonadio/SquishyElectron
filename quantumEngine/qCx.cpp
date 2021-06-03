
#include <math.h>
#include "qCx.h"


qReal qCx::abs() {
	return sqrt(this->norm());
}

qReal qCx::phase() {
	return atan2(im, re) * 180 / PI;
}

void qCheck(qCx aCx) {
	if (isnan(aCx.re) || isnan(aCx.im))
		printf("complex number became NaN: (%lf,%lf)", aCx.re, aCx.im);
}
