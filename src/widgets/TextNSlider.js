/*
** Text and Slider -- an input slider and input text box working in unison
** Copyright (C) 2021-2022 Tactile Interactive, all rights reserved
*/

import PropTypes from 'prop-types';

function setPT() {
	TextNSlider.propTypes = {
		className: PropTypes.string,
		label: PropTypes.string,
		style: PropTypes.object,

		value: PropTypes.number.isRequired,
		min: PropTypes.number.isRequired,
		max: PropTypes.number.isRequired,
		step: PropTypes.number,

		handleChange: PropTypes.func,
	};

	TextNSlider.defaultProps = {
		className: '',
		style: {},
		step: 1,

		handleChange: (ix, power) => {},
	};
}

function TextNSlider(props) {
	const p = props;

	// return latest value, but also set slider
	function handleText(ev) {
		const el = ev.currentTarget;
		const val = +el.value;
		el.parentNode.querySelector('input[type=range]').value = val;
		p.handleChange(val);

	}

	// return latest value, but also set text box
	function handleSlider(ev) {
		const el = ev.currentTarget;
		const val = +el.value;
		el.parentNode.querySelector('input[type=number]').value = val;
		p.handleChange(val)
	}

	const label = p.label ? <span>{p.label}</span> : '';
	return <div className={`TextNSlider {p.className}`} style={p.style}>
		{label}
		<input type='number' placeholder={label}
				value={p.value} min={p.min} max={p.max} step={p.step}
				size='5'
				onChange={handleText} />
		<input type='range'
				value={p.value} min={p.min} max={p.max} step={p.step}
				onChange={handleSlider} />
	</div>;
}

setPT();

export default TextNSlider;

