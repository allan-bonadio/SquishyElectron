
#include <math.h>
#include "qCx.h"


qReal qCx::abs() {
	return sqrt(this->norm());
}

qReal qCx::phase() {
	return atan2(im, re) * 180 / PI;
}
