Number.computeIndexDigits = function (length: number): number {
	return Math.floor(Math.log10(Math.max(length - 1, 1))) + 1;
};

Number.padZero = function (number: number, length: number, padString = '0'): string {
	const digits = Number.computeIndexDigits(length);
	return number.toString().padStart(digits, padString);
};
