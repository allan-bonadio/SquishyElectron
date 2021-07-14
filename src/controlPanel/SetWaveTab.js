import PropTypes from 'prop-types';

function setPT() {
	SetWaveTab.propTypes = {
		setWave: PropTypes.func.isRequired,
		setCircularFrequency: PropTypes.func.isRequired,
		standingFrequency: PropTypes.func.isRequired,

		standingFrequency: PropTypes.number.isRequired,
		circularFrequency: PropTypes.number.isRequired,
	};
}

function SetWaveTab(props) {
	const p = props;

	return <div className='SetWaveTab'>
		<h3>Reset Wave Function</h3>
		<button type='button' className='standingWaveButton round'
			onClick={ev => p.setWave('standing', p.standingFrequency)}>
				Standing Wave
		</button>
		&nbsp;
		<input type='number' placeholder='frequency'
			value={p.standingFrequency} min='1' max='100'
			onChange={ev => p.setStandingFrequency(ev.currentTarget.value)} />

		<br/>
		<button type='button' className='circularWaveButton round'
			onClick={ev => p.setWave('circular', p.circularFrequency)} >
				Circular Wave
		</button>
		&nbsp;
		<input type='number' placeholder='frequency'
			value={p.circularFrequency} min='1' max='100'
			onChange={ev => p.setCircularFrequency(ev.currentTarget.value)} />

		<br/>
		<button type='button' className='pulseWaveButton round'
			onClick={ev => p.setWave('pulse')} >
				Wave Packet
		</button>
	</div>;


}
setPT();

export default SetWaveTab;

