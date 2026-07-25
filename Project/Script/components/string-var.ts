import { CustomBox } from './custom-box.ts';
import { TextBox } from './text-box.ts';

export class StringVar extends HTMLElement {
	mode: string;
	strBox: HTMLElement & { [k: string]: any };
	varBox: CustomBox;

	constructor() {
		super();

		this.mode = null;
		this.strBox = new TextBox();
		this.varBox = new CustomBox();
		this.varBox.type = 'variable';
		this.varBox.filter = 'string';

		this.on('keydown', this.keydown);
		this.on('pointerdown', this.pointerdown);
	}

	read() {
		switch (this.mode) {
			case 'constant':
				return this.strBox.read();
			case 'variable':
				return this.varBox.read();
		}
	}

	write(value: any) {
		switch (typeof value) {
			case 'string':
				this.switch('constant');
				this.strBox.write(value);
				this.varBox.write(StringVar.defVar);
				break;
			case 'object':
				this.switch('variable');
				this.strBox.write('');
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
					this.appendChild(this.strBox);
					if (focus) {
						this.strBox.input.focus();
						this.strBox.input.select();
					}
					break;
				case 'variable':
					this.strBox.remove();
					this.appendChild(this.varBox);
					if (focus) {
						this.varBox.focus();
					}
					break;
			}
			// this.dispatchChangeEvent()
		}
	}

	enable() {
		if (this.removeClass('disabled')) {
			this.strBox.enable();
			this.varBox.enable();
		}
	}

	disable() {
		if (this.addClass('disabled')) {
			this.strBox.disable();
			this.varBox.disable();
		}
	}

	getFocus(mode: any) {
		switch (this.mode) {
			case 'constant':
				return this.strBox.getFocus(mode);
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
}

customElements.define('string-var', StringVar);
