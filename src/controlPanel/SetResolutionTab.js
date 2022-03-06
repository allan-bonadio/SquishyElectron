/*
** blah blah -- like a source file for Squishy Electron
** Copyright (C) 2021-2021 Tactile Interactive, all rights reserved
*/

import PropTypes from 'prop-types';

function setPT() {
	SetResolutionTab.propTypes = {
		openResolutionDialog: PropTypes.func.isRequired,
	};
}

function SetResolutionTab(props) {
	const p = props;
	// doesn't work p.openResolutionDialog();  // just et ti over with




	return (<div className='SetResolutionTab'>
		<button className='setResolutionButton  round'
			onClick={ev => p.openResolutionDialog()}>
				Change Resolution
				<div style={{fontSize: '.7em'}}>
					(will reset current wave)</div>
		</button>
		<h3>Reconfigure the Universe</h3>

		<p>
			The actual universe is essentially infinite. &nbsp;
			<small>(Well, actually it's probably finite,
			<small>but so incredibly huge,
			<small>you'll never notice the difference.)
			</small></small></small>
			&nbsp; Nobody's computer has that much ram or power.
			Squishy Electron's universe runs on this web page, much smaller,
			but we can simulate the microscopic... no, the <u>picoscopic </u>
			world of the squishy electron.
			You can recreate this picoscopic universe here, if you want, with different settings.
		</p>

	</div>);
}
setPT();

export default SetResolutionTab;
