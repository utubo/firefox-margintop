(async () => {
	'use strict';
	// Default settings
	let ini = { height: 50, unit: '%', css: '', background: '#d7d7db', denyList: [
		// Does not work well. (;_;)
		'https://mobile.twitter.com/',
		'https://twitter.com/'
	]};

	// Load settings
	const res = await browser.storage.local.get('margintop');
	if (res && res.margintop) {
		ini = res.margintop;
	}

	// deny file
	const ext = location.pathname.split('.')[1];
	if (ext && ext !== 'html' && ext !== 'htm') {
		return;
	}
	// deny list
	if (ini.denyList) {
		for (let url of ini.denyList) {
			if (location.href.startsWith(url)) return;
			if (url.startsWith('^') && location.href.match(url)) return;
		}
	}

	// START!
	let h = ini.height;
	if (ini.unit === '%') { // "vh" can`t keep scroll position.
		h = Math.floor(innerHeight * h / 100);
	}
	let css = `
		html::before { content: ""; display: block; height: ${h}px; width: 100%; }
		body { position: relative; min-height: 100vh; }
	`;
	if (ini.background === 'css' && ini.css) {
		css = css + ini.css;
	} else if (ini.background) {
		css = css + `html::before { background: ${ini.background}; }`;
	}
	const keepY = scrollY;
	const s = document.createElement('style');
	s.id = 'addonMarginTop';
	s.type = 'text/css';
	s.innerText = css;
	document.head.appendChild(s);
	scroll({top: keepY + h, behavior: 'instant'});

	// Scroll to top when tap blank of margin.
	addEventListener('click', e => {
		if (e.target.tagName === 'HTML')
			scroll({top: h, behavior: 'smooth'});
	});

	// Move the fixed element when scrollY is 0.
	let fixedElm;
	let maginTopBak;
	let timer;
	const moveFixedElement = () => {
		if (scrollY) return;
		if (fixedElm) return;
		let f = document.elementFromPoint(0, 0);
		while (f) {
			if (f.tagName === 'HTML') return;
			if (f.tagName === 'BODY') return;
			if (window.getComputedStyle(f).getPropertyValue('position') === 'fixed') break;
			f = f.parentNode;
		}
		if (!f) return;
		maginTopBak = f.style.marginTop;
		f.style.marginTop = h + 'px';
		fixedElm = f;
	};
	addEventListener('scroll', async () => {
		if (fixedElm) {
			fixedElm.style.marginTop = maginTopBak;
			fixedElm = null;
			return;
		} else {
			clearTimeout(timer);
			timer = setTimeout(moveFixedElement, 250);
		}
	});

	// Add deny list
	addEventListener('contextmenu', e => {
		if (!e.target || e.target.tagName != 'HTML') return;
		e.preventDefault();
		const p = location.href.split('/');
		let url = p[0] + '//' + p[2] + '/';
		if (p[3] && p[3].startsWith('~')) url += p[3] + '/';
		if (!confirm('Disable MaginTop\n' + url)) return;
		ini.denyList.push(url);
		browser.storage.local.set({ 'margintop': ini });
		document.getElementById('addonMarginTop').remove();
		setTimeout(() => scroll({top: 0, behavior: 'smooth'}), 10);
	});

})();

