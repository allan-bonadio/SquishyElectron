/*
** flatDrawingViewDef -- main viewDef for 2d image of 1d space
** Copyright (C) 2021-2022 Tactile Interactive, all rights reserved
*/

import {abstractViewDef} from './abstractViewDef';
import {flatDrawing} from './flatDrawing';
import {potentialDrawing} from './potentialDrawing';

class flatDrawingViewDef extends abstractViewDef {
	static viewName: 'flatDrawingViewDef';
	static viewClassName: 'flatDrawingViewDef';

	constructor(viewName, canvas, space) {
		super(viewName, canvas, space);

		if (! this.space) throw  `flatDrawingViewDef: being created without space`;

		// create relevant drawings
		new flatDrawing(this, space);
		new potentialDrawing(this, space);
	}

	static viewClassName = 'flatDrawingViewDef'
}


export default flatDrawingViewDef;

