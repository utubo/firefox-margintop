(async () => {
	'use strict';

	const MAX_HEIGHT = 9999;
	const height = document.getElementById('height');
	const unit = document.getElementById('unit');
	const background = document.getElementById('background');
	const colorContainer = document.getElementById('colorContainer');
	const colorDlg = document.getElementById('colorDlg');
	const color = document.getElementById('color');
	const css = document.getElementById('css');
	const denyList = document.getElementById('denyList');
	const denyTemplate = document.getElementsByClassName('deny-item')[0];

	// Default settings
	let ini = { height: 50, unit: '%', css: '', background: '#d7d7db', denyList: [
		// Does not work well. (;_;)
		'https://mobile.twitter.com/',
		'https://twitter.com/'
	]};
	color.value = ini.background;
	colorDlg.value = ini.background;

	// Load settings
	const res = await browser.storage.local.get('margintop');
	if (res && res.margintop) {
		ini = res.margintop;
	}
	height.value = ini.height;
	unit.value = ini.unit;
	background.value = ini.background;
	if (ini.background === 'css') {
		css.style.display = 'block';
	} else if (ini.background) {
		background.value = 'color';
		colorContainer.style.display = 'block';
		color.value = ini.background;
		colorDlg.value = ini.background;
	}
	css.value = ini.css;

	// Deny list
	const onDenyItemChange = e => {
		const item = e.target.parentNode;
		if (e.target.value && !item.nextSibling) {
			addDenyItem('');
		}
	};
	const deleteDeny = e => {
		const item = e.target.parentNode;
		const denyUrl = item.getElementsByClassName('deny-url')[0];
		if (!confirm('Delete\n' + denyUrl.value)) return;
		if (item.nextSibling || item.previousSibling) {
			item.remove();
		} else {
			denyUrl.value = '';
		}
		saveIni();
		return;
	};
	const addDenyItem = url => {
		const item = denyTemplate.cloneNode(true);
		const input = item.getElementsByClassName('deny-url')[0];
		const del = item.getElementsByClassName('del')[0];
		input.value = url ? url : '';
		input.addEventListener('input', onDenyItemChange);
		del.addEventListener('click', deleteDeny);
		denyList.appendChild(item);
	};
	for (let url of ini.denyList) addDenyItem(url);
	addDenyItem('');

	// Save settings
	const saveIni = async () => {
		ini.height = height.value;
		ini.unit = unit.value;
		ini.background = background.value === 'color' ? color.value : background.value;
		ini.css = css.value;
		ini.denyList = [];
		for (let url of document.getElementsByClassName('deny-url')) {
			if (url.value) ini.denyList.push(url.value.trim());
		}
		await browser.storage.local.set({ 'margintop': ini });
	};

	let saveTimer;
	const saveIniLazy = () => {
		clearTimeout(saveTimer);
		setTimeout(saveIni, 500);
	};

	// Events
	const onInput = e => {
		if (e.target === unit) {
			const maxHeight = unit.value === '%' ? 100 : MAX_HEIGHT;
			height.value = Math.min(height.value | 0, maxHeight);
			e.target.setAttribute('max', maxHeight);
		} else if (e.target === background) {
			colorContainer.style.display = background.value === 'color' ? 'block' : 'none';
			css.style.display = background.value === 'css' ? 'block' : 'none';
		} else if (e.target === colorDlg) {
			if (colorDlg.value !== color.value) color.value = colorDlg.value;
		} else if (e.target === color) {
			if (colorDlg.value !== color.value) colorDlg.value = color.value;
		}
		saveIniLazy();
	};
	addEventListener('input', onInput);
	addEventListener('change', onInput);

})();

