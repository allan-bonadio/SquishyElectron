
#include <math.h>
#include "qCx.h"

// more work than it's worth - should use the norm instead
qReal qCx::abs() {
	return sqrt(this->norm());
}

// in real degrees!
qReal qCx::phase() {
	return atan2(im, re) * 180 / PI;
}

void qCheck(qCx aCx) {
	if (isnan(aCx.re) || isnan(aCx.im))
		printf("complex number became NaN: (%lf,%lf)\n", aCx.re, aCx.im);
}
