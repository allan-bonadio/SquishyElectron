import React from 'react';
import PropTypes from 'prop-types';

function setPT() {
	CPToolbar.propTypes = {
		startIterating: PropTypes.func.isRequired,
		stopIterating: PropTypes.func.isRequired,
		singleStep: PropTypes.func.isRequired,
		isTimeAdvancing: PropTypes.bool,
	};
}

function CPToolbar(props) {
//	const isRunningClass = isItAnimating() ? 'isRunning' : 'notRunning';

	return <div className='CPToolbar'>
		<button type='button' className={`startStopToggleButton toolbarButton`}
			onClick={ev => {
				if (props.isTimeAdvancing)
					props.stopIterating();
				else
					props.startIterating();
			}}>
			{ props.isTimeAdvancing
				? ' | | '
				: ' ► ' }
				</button>
		<button type='button' className={`stepButton toolbarButton on `}
			onClick={ev => props.singleStep()}>
			⇥
		</button>


	</div>;
}

setPT();

export default CPToolbar;
