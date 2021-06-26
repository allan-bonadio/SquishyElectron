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

	static openDialog(centralComponent, dialogCloseCallback) {
		SquishDialog.centralComponent = centralComponent;
		SquishDialog.dialogCloseCallback = dialogCloseCallback;
		App.showDialog(SquishDialog.closeDialog);
	}

	static closeDialog() {
		SquishDialog.dialogCloseCallback();
		SquishDialog.dialogCloseCallback = null;
		SquishDialog.centralComponent = null;
		App.hideDialog();
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
