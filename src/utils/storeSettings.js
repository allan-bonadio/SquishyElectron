/*
** store settings -- storing control panel settings in localStorage for the next session
** Copyright (C) 2022-2022 Tactile Interactive, all rights reserved
*/


const storeSettings = {
	// value must pass criterion or else default is returned
	ratify(value, def, criterion) {
		switch (typeof criterion) {
		case 'function':
			if (criterion(value))
				return value;
			break;

		case 'object':
			switch (criterion.constructor.name) {
			case 'RegExp':
				if (criterion.test(value))
					return value;
				break;

			case 'Array':
				if (criterion.includes(value))
					return value;
				break;

			default:
				console.error(`bad criterion class ${criterion.constructor.name}`);
			}
			break;

		default:
			console.error(`bad criterion type ${typeof criterion})`);
		}

		return def;
	},

	// given a name in the localStorage, retrieve it and de-JSONify it, safely, or return a default
	retrieveSettings(name) {
		try {
			const settings = localStorage.getItem(name);
			return JSON.parse(settings) || {};
		} catch (ex) {
			return {};
		}
	},

}

export default storeSettings;
