/*
** store settings -- storing control panel settings in localStorage for the next session
** Copyright (C) 2022-2022 Tactile Interactive, all rights reserved
*/

//import {qeBasicSpace} from '../engine/qeSpace';

// base = which component of storeSettings this is
// criterion: validator, see constructor
//     The criterion are fixed and more broad than some other parts of the code,
//     eg if 1/N is one of the limits, some other part of the code will enforce that, not here.
// The general interaction between component states and storeSettings is this:
// component states are initially set from storeSettings.
// When changed, both the state and storeSettings, and sending to C++ if applicable, are changed in parallel in same code.
// With a function that's general over the particular params group, in the component that holds the state.
// (maybe I should integrate these better...)

/* ************************************************** All Settings */


// these'll be filled in below
const storeSettings =  {
	spaceParams: {},
	waveParams: {},
	potentialParams: {},
	iterationParams: {},
	miscParams: {},
}


let alwaysSave = false;

// save in the localSettings
function saveGroup(base) {
	localStorage.setItem(base, JSON.stringify(storeSettings[base]));
}

// figure out a function that can validate this quickly
function makeCriterionFunction(criterion) {
	switch (typeof criterion) {
	// always or never
	case 'boolean':
		return value => criterion;

	// any function that takes the value as the only param
	case 'function':
		return criterion;

	case 'object':
		switch (criterion.constructor.name) {

		// string matching
		case 'RegExp':
			return value => criterion.test(value);

		// must be one of the values in this array
		case 'Array':
			return value => criterion.includes(value);

		default:
			throw new Error(`bad criterion class ${criterion.constructor.name}`);
		}

	default:
		throw new Error(`bad criterion type ${typeof criterion})`);
	}
}

// make a parameter obj.name, part of storeSettings[base]
// one value that knows what's valid for it, and that's stored in localStore
function makeParam(obj, name, base, defaultValue, criterion) {
	// this is where it's really stored, in the closure
	let value;

	const criterionFunction = makeCriterionFunction(criterion);

	Object.defineProperty(obj, name, {
		get: function() {
			return value
		},

		set: function(newVal) {
			if (newVal === undefined || ! criterionFunction(newVal))
				value = defaultValue;
			else
				value = newVal;

			if (alwaysSave)
				saveGroup(base);
		},

		configurable: false,
		enumerable: true,
	});
}

/* ************************************ spaceParams */
// somewhere you have to record the defaults and criterion for each setting, so here they are

function isPowerOf2(n) {
	console.info(`isPowerOf2(${n}) `);
	while (n > 1 ){
		// if it's got more than 1 bit on
		if (n & 1) return false;
		n = n >> 1;
	}
	return true;
}

makeParam(storeSettings.spaceParams, 'N', 'spaceParams', 64,  N => isPowerOf2(N) );

// how to do this correctly with the defined constants???
makeParam(storeSettings.spaceParams, 'continuum', 'spaceParams', 2, [0, 1, 2]);
// makeParam(storeSettings.spaceParams, 'continuum', 'spaceParams', qeBasicSpace.contENDLESS,
// 	[qeBasicSpace.contDISCRETE, qeBasicSpace.contWELL, qeBasicSpace.contENDLESS]);

/* ************************************ waveParams */
makeParam(storeSettings.waveParams, 'waveBreed', 'waveParams', 'chord', ['circular', 'standing', 'gaussian', 'chord']);
makeParam(storeSettings.waveParams, 'waveFrequency', 'waveParams', 16, freq =>
	freq >= 1 && freq <= 1000 && 0 === freq % .5 );
makeParam(storeSettings.waveParams, 'pulseWidth', 'waveParams', 1/16, width => width >= .001 && width <= 1);
makeParam(storeSettings.waveParams, 'pulseOffset', 'waveParams', 30, offset => offset >= 0 && offset <= 100);

/* ************************************ potentialParams */
makeParam(storeSettings.potentialParams, 'potentialBreed', 'potentialParams', 'flat', ['flat', 'valley']);
makeParam(storeSettings.potentialParams, 'valleyPower', 'potentialParams', 1, power => power >= -20 && power <= 20);
makeParam(storeSettings.potentialParams, 'valleyScale', 'potentialParams', 1, scale => scale >= -1e4 && scale <= 1e4);
makeParam(storeSettings.potentialParams, 'valleyOffset', 'potentialParams', 50, offset => offset >= 0 && offset <= 100);

/* ************************************ iterationParams */
makeParam(storeSettings.iterationParams, 'isTimeAdvancing', 'iterationParams', false,  [false, true]);
makeParam(storeSettings.iterationParams, 'iteratePeriod', 'iterationParams', 50,  per => per >= 16 && per <= 100);
makeParam(storeSettings.iterationParams, 'dt', 'iterationParams', 0.002,  dt => dt > 0 && dt < 1);
makeParam(storeSettings.iterationParams, 'stepsPerIteration', 'iterationParams', 200,  spi => spi > 100 && spi < 1e6);
makeParam(storeSettings.iterationParams, 'lowPassFilter', 'iterationParams', 1/8,  lpf => lpf > 0 && lpf < 1);

/* ************************************miscParams */
makeParam(storeSettings.miscParams, 'showingTab', 'miscParams', 'wave', ['wave', 'potential', 'space', 'iteration']);
makeParam(storeSettings.miscParams, 'viewHeight', 'miscParams', 400,  viewHeight => viewHeight >= 50 && viewHeight <= 1e4);


// no point in saving them when we're reading them already
// even if it's all defaults, that's fine
alwaysSave = false;

// upon now load them in from localStore, according to the params we've defined above
for (let groupName in storeSettings) {
	let group = storeSettings[groupName];
	let fromSaved = localStorage.getItem(groupName) || '{}';
	fromSaved = JSON.parse(fromSaved) || {};
	for (let paramName in group) {
		group[paramName] = fromSaved[paramName];
	}
}

alwaysSave = true;

// upon load of this file, it'll retrieve all this stuff from localStore
//
// ************************************************** old */
//
//
//
//
//
// class param {
// 	constructor(base, defaultValue, criterion) {
// 		// actually all these arguments don't need to be on this because of the closure
// 		// this.defaultValue = defaultValue;
// 		this.base = base;
//
// 		// figure out a function that can validate this quickly
// 		let cFunc = value => false;
// 		switch (typeof criterion) {
// 		// always or never
// 		case 'boolean':
// 			cFunc = value => criterion;
// 			break;
//
// 		case 'function':
// 			cFunc = criterion;
// 			break;
//
// 		case 'object':
// 			switch (criterion.constructor.name) {
// 			case 'RegExp':
// 				cFunc = value => criterion.test(value);
// 				break;
//
// 			case 'Array':
// 				cFunc = value => criterion.includes(value);
// 				break;
//
// 			default:
// 				console.error(`bad criterion class ${criterion.constructor.name}`);
// 			}
// 			break;
//
// 		default:
// 			console.error(`bad criterion type ${typeof criterion})`);
// 		}
// 		this.criterionFunction = cFunc;
//
// 		return def;
// 	},
//
//
// 	get value() {
// 		return this.val;
// 	}
//
// 	// to set it to default, just pass undefined.  null is a valid value, depending on criterion.
// 	set value(newValue) {
// 		if (newValue === undefined || !this.criterionFunction(newValue))
// 			this.val = this.defaultValue;
// 		else
// 			this.val = newValue;
//
// 		this.save();
// 	}
//
// 	save() {
// 		localStorage[this.base] = JSON.stringify(storeSettings[this.base]);
//
// 	}
// }
//
// const storeSettings = {
// 	// value must pass criterion or else default is returned
// 	// note this has almost no connection to retrieveSettings()
// 	retrieveRatify(value, def, criterion) {
// 		switch (typeof criterion) {
// 		case 'function':
// 			if (criterion(value))
// 				return value;
// 			break;
//
// 		case 'object':
// 			switch (criterion.constructor.name) {
// 			case 'RegExp':
// 				if (criterion.test(value))
// 					return value;
// 				break;
//
// 			case 'Array':
// 				if (criterion.includes(value))
// 					return value;
// 				break;
//
// 			default:
// 				console.error(`bad criterion class ${criterion.constructor.name}`);
// 			}
// 			break;
//
// 		default:
// 			console.error(`bad criterion type ${typeof criterion})`);
// 		}
//
// 		return def;
// 	},
//
// 	// given a name in the localStorage, retrieve it and de-JSONify it, safely, or return a default
// 	retrieveSettings(name) {
// 		try {
// 			const settings = localStorage.getItem(name);
// 			return JSON.parse(settings) || {};
// 		} catch (ex) {
// 			return {};
// 		}
// 	},
//
// 	// set one member variable in this localStored JSONified tree and put it back
// 	// name is kindof a path
// 	setSetting(name, value) {
// 		debugger;
// 		const path = name.split('.');
// 		const storeName = path.shift();
// 		let storeTree = JSON.parse(localStorage[storeName]);
//
// 		// now, set it, creating objs in between if needed like mkdir -p
// 		let here = storeTree;
// 		while (path.length > 1) {
// 			let segment = path.shift();
// 			if (!(segment in here))
// 				here[segment] = {};
// 			here = here[segment];
// 		}
// 		here[path[0]] = value;
// 		localStorage[storeName] = JSON.stringify(storeTree);
// 	}
//
//
// 	************************************************** All Settings */
//
//
// 	// this should go somewhere else someday.  With a different name?
// 	storeSettings: {
// 		space: {
//
// 		},
//
// 		waveParams: {
//
// 		},
//
// 		potentialParams: {
//
// 		},
//
// 		iterationParams: {
//
// 		}
//
//
// 	}
//
// 				N: rat(space0.N, DEFAULT_RESOLUTION, [4,8,16,32,64,128,256,512,1024]),
//
// 			continuum: rat(space0.continuum, DEFAULT_CONTINUUM,
// 				[qeBasicSpace.contDISCRETE, qeBasicSpace.contWELL, qeBasicSpace.contENDLESS]),
//
// }

export default storeSettings;


