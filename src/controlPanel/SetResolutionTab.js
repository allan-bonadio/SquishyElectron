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

	return (<div className='SetResolutionTab'>
		<button type='button' className='setResolutionButton  round'
			onClick={ev => p.openResolutionDialog()}>
				Change Resolution
				<div style={{fontSize: '.7em'}}>
					(will reset current wave)</div>
		</button>
		<h3>Reconfigure the Universe</h3>

		<p>
			The actual universe is essentially infinite.
			Nobody's computer has that much ram or power.
			Squishy Electron's universe runs on a finite web page.
			The universe where all this happens is very simplified.
			You can recreate it here, if you want, with different settings.
		</p>

	</div>);
}
setPT();

export default SetResolutionTab;
