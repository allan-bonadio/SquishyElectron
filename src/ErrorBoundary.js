import React from 'react';


class ErrorBoundary extends React.Component {
	constructor(props) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError() {
		return {hasError: true};
	}

	componentDidCatch(error, info) {
		debugger;
		this.error = error;
		this.info = info;
		console.warn(`Component Did Catch:`, error, info.componentStack);
	}

	render() {
		if (this.state.hasError) {
			return <main style={{textAlign: 'center', color: '#f00'}}>
				<h1>Error in SquishyElectron</h1>
				<p>Error: {this.error}</p>
				<p>Info: {this.info}</p>
			</main>;
		}

		return this.props.children;
	}
}

export default ErrorBoundary;
