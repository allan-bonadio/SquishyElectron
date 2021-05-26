/*
 * Copyright 2011 The Emscripten Authors.  All rights reserved.
 * Emscripten is available under two separate licenses, the MIT license and the
 * University of Illinois/NCSA Open Source License.  Both these licenses can be
 * found in the LICENSE file.
 */

#include <stdio.h>
#include "quantumEngine.h"
#include "cx.h"

int main() {
  printf("bonjour le monde! sizeof cx is %lu\n", sizeof(cx));

  cx zero(0, 0);
  printf("bonjour zero is %lf, %lf\n", zero.re, zero.im);

  cx two(2, 0);
  printf("bonjour two is %lf, %lf\n", two.re, two.im);

  cx three(3);
  printf("bonjour three is %lf, %lf\n", three.re, three.im);

  cx five = two + three;
  printf("bonjour five is %lf, %lf\n", five.re, five.im);

  cx zoot = five;
  zoot += cx(-7, 7);
  printf("bonjour zoot is %lf, %lf\n", zoot.re, zoot.im);

  return 0;
}

Dimension dimensions[MAX_DIMENSIONS];

