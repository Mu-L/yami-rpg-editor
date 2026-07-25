Math.clamp = (function IIFE() {
	const { max, min } = Math;
	return (number: number, minimum: number, maximum: number): number => {
		return max(min(number, maximum), minimum);
	};
})();

Math.roundTo = (function IIFE() {
	const { round } = Math;
	return (number: number, decimalPlaces: number): number => {
		const ratio = 10 ** decimalPlaces;
		return round(number * ratio) / ratio;
	};
})();

Math.dist = (function IIFE() {
	const { sqrt } = Math;
	return (x1: number, y1: number, x2: number, y2: number): number => {
		return sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
	};
})();

Math.randomBetween = (function IIFE() {
	const { random } = Math;
	return (value1: number, value2: number): number => {
		return value1 + (value2 - value1) * random();
	};
})();

Math.radians = (function IIFE() {
	const factor = Math.PI / 180;
	return (degrees: number): number => {
		return degrees * factor;
	};
})();

Math.degrees = (function IIFE() {
	const factor = 180 / Math.PI;
	return (radians: number): number => {
		return radians * factor;
	};
})();

Math.modDegrees = (degrees: number, period = 360): number => {
	return degrees >= 0 ? degrees % period : ((degrees % period) + period) % period;
};

Math.modRadians = (function IIFE() {
	const PI2 = Math.PI * 2;
	return (radians: number, period = PI2): number => {
		return radians >= 0 ? radians % period : ((radians % period) + period) % period;
	};
})();
