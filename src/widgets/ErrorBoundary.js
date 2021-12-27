/*
** blah blah -- like a source file for Squishy Electron
** Copyright (C) 2021-2021 Tactile Interactive, all rights reserved
*/

import React from 'react';
import PropTypes from 'prop-types';


class ErrorBoundary extends React.Component {
	static propTypes = {
		howToRecover: PropTypes.func,
	}

	constructor(props) {
		super(props);
		this.state = {hasError: false, error0: null};
	}

	static getDerivedStateFromError(er) {
		return {hasError: true, error0: er};
	}

	componentDidCatch(error, info) {
		this.error = error;  // always a string; always same as error0
		if (error !== this.state.error0) throw `error != this.state.error0`;

		this.info = info;  // object of class Object
		console.warn(`%%% Component Did Catch: error str=\n${error}
			info~=${JSON.stringify(info)}`);
//		console.log('%%% ...error...', error, this.state.error0, this.state.error0 === error);
//		console.log('%%% ...info...', info);
	}

	render() {
		if (this.state.hasError) {
			console.log(this.info)
			return <main style={{textAlign: 'center', color: '#fee'}}>
				<h1>Error in SquishyElectron</h1>
				<p style={{backgroundColor: '#400', color: '#fdd'}}>
					Error: {this.state.error0 || this.error || '-'}</p>
				<p style={{backgroundColor: '#840', color: '#fed'}}>
					Stack: {this.info ? this.info.componentStack : '-'}</p>
				<p style={{backgroundColor: '#804', color: '#fde'}}>
					Info: {JSON.stringify(this.info)}</p>
				<p style={{backgroundColor: '#fee', color: '#000'}}>
					<button type='button' onClick={() => this.recover()}>
						try to restart</button></p>
			</main>;
		}

		// otherwise, be transparent
		return this.props.children;
	}

	// will this ever become great?
	recover() {
		let errorMsg = this.state.error0;
		this.setState({hasError: false, error0: null});

		if (this.props.howToRecover)
			this.props.howToRecover(errorMsg);
	}
}

export default ErrorBoundary;
