import React from 'react';
import PropTypes from 'prop-types';

import App from './App';

export default class SquishDialog extends React.Component {

	static propTypes = {
		token: PropTypes.number,
//		stateParams: PropTypes.shape({
//			N: PropTypes.number.isRequired,
//			continuum: PropTypes.number.isRequired,
//			viewClassName: PropTypes.string.isRequired,
//		}),
//		closeResolutionDialog: PropTypes.func.isRequired,
	};

	state = {};

	static me = this;

	static openDialog(centralComponent) {
		SquishDialog.centralComponent = centralComponent;
		App.showDialog();
	}

	// called by client sw (whoever called us) after user clicks OK or Cancel
	static startClosingDialog() {
		App.hideDialog();
	}

	// called when App finishes closing it
	static finishClosingDialog() {
		SquishDialog.centralComponent = null;
	}

	render() {
		return (
			<aside className='backdrop'>
				<div className='dialogSpacer' />
				{SquishDialog.centralComponent}
				<div className='dialogSpacer' />
			</aside>
		);
	}

}
