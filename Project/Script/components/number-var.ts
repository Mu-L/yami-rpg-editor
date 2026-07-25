import { CustomBox } from './custom-box.ts';
import { NumberBox } from './number-box.ts';

export class NumberVar extends HTMLElement {
	mode: string;
	numBox: HTMLElement & { [k: string]: any };
	varBox: CustomBox & { [k: string]: any };

	constructor() {
		super();

		this.mode = null;
		this.numBox = new NumberBox(this);
		this.varBox = new CustomBox();
		this.varBox.type = 'variable';
		this.varBox.filter = 'number';

		this.on('keydown', this.keydown);
		this.on('pointerdown', this.pointerdown);
	}

	read() {
		switch (this.mode) {
			case 'constant':
				return this.numBox.read();
			case 'variable':
				return this.varBox.read();
		}
	}

	write(value: any) {
		switch (typeof value) {
			case 'number':
				this.switch('constant');
				this.numBox.write(value);
				// 暂时这么写，不是很理想
				this.varBox.write(
					this.varBox.isPluginInput ? NumberVar.defVarForPlugin : NumberVar.defVar
				);
				break;
			case 'object':
				this.switch('variable');
				this.numBox.write(0);
				this.varBox.write(value);
				break;
		}
	}

	switch(mode?) {
		const focus = !mode && !this.hasClass('disabled');
		if (mode === undefined) {
			switch (this.mode) {
				case 'constant':
					mode = 'variable';
					break;
				case 'variable':
					mode = 'constant';
					break;
			}
		}
		if (this.mode !== mode) {
			this.removeClass(this.mode);
			this.addClass(mode);
			this.mode = mode;
			switch (mode) {
				case 'constant':
					this.varBox.remove();
					this.appendChild(this.numBox);
					if (focus) {
						this.numBox.input.focus();
						this.numBox.input.select();
					}
					break;
				case 'variable':
					this.numBox.remove();
					this.appendChild(this.varBox);
					if (focus) {
						this.varBox.focus();
					}
					break;
			}
			this.dispatchChangeEvent();
		}
	}

	enable() {
		if (this.removeClass('disabled')) {
			this.numBox.enable();
			this.varBox.enable();
		}
	}

	disable() {
		if (this.addClass('disabled')) {
			this.numBox.disable();
			this.varBox.disable();
		}
	}

	getFocus(mode: any) {
		switch (this.mode) {
			case 'constant':
				return this.numBox.getFocus(mode);
			case 'variable':
				return this.varBox.getFocus(mode);
		}
	}

	keydown(event: any) {
		switch (event.code) {
			case 'Slash':
				event.preventDefault();
				this.switch();
				break;
		}
	}

	pointerdown(event: any) {
		switch (event.button) {
			case 0:
				if (!this.hasClass('disabled') && event.target === this) {
					event.preventDefault();
					this.switch();
				}
				break;
			case 2:
				if (!this.hasClass('disabled')) {
					event.preventDefault();
					this.switch();
				}
				break;
		}
	}

	static defVar = { type: 'local', key: 'key' };

	static defVarForPlugin = { getter: 'variable', type: 'local', key: 'key' };
}

customElements.define('number-var', NumberVar);
