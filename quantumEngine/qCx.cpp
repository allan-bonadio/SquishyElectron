
#include <math.h>
#include "qCx.h"


FLOAT qCx::abs() {
	return sqrt(this->norm());
}

FLOAT qCx::phase() {
	return atan2(im, re) * 180 / PI;
}
