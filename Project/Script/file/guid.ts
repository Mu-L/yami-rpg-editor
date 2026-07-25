// GUID含有字母或首位是零可以大幅提升查询效率 因此需要避免纯数字的GUID出现
export class GUID {
	static regExpForChecking = /[a-f]/;

	static generate32bit() {
		const n = Math.random() * 0x100000000;
		const s = Math.floor(n).toString(16);
		return s.length === 8 ? s : s.padStart(8, '0');
	}

	static generate64bit() {
		let id;
		do {
			id = this.generate32bit() + this.generate32bit();
		} while (!this.regExpForChecking.test(id));
		return id;
	}
}
