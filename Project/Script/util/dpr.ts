window.on(
	'resize',
	(function IIFE() {
		let dpr = window.devicePixelRatio;
		return (event: Event): void => {
			if (dpr !== window.devicePixelRatio) {
				dpr = window.devicePixelRatio;
				window.dispatchEvent(new Event('dprchange'));
			}
		};
	})()
);
