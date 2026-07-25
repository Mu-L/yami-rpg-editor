import { SelectBox } from './select-box.ts';
import { CustomBox } from './custom-box.ts';

export class SelectVar extends HTMLElement {
	mode: string;
	selectBox: HTMLElement & { [k: string]: any };
	varBox: CustomBox;

	constructor() {
		super();

		this.mode = null;
		this.selectBox = new SelectBox();
		this.varBox = new CustomBox();
		this.varBox.type = 'variable';
		this.varBox.filter = 'all';

		this.on('keydown', this.keydown);
		this.on('pointerdown', this.pointerdown);
	}

	read() {
		switch (this.mode) {
			case 'constant':
				return this.selectBox.read();
			case 'variable':
				return this.varBox.read();
		}
	}

	write(value: any) {
		switch (typeof value) {
			case 'string':
				this.switch('constant');
				this.selectBox.write(value);
				this.varBox.write(SelectVar.defVar);
				break;
			case 'object':
				this.switch('variable');
				this.selectBox.writeDefault();
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
					this.appendChild(this.selectBox);
					if (focus) {
						this.selectBox.focus();
					}
					break;
				case 'variable':
					this.selectBox.remove();
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
			this.selectBox.enable();
			this.varBox.enable();
		}
	}

	disable() {
		if (this.addClass('disabled')) {
			this.selectBox.disable();
			this.varBox.disable();
		}
	}

	loadItems(items: any) {
		this.selectBox.loadItems(items);
	}

	getFocus(mode: any) {
		switch (this.mode) {
			case 'constant':
				return this.selectBox.getFocus(mode);
			case 'variable':
				return this.varBox.getFocus(mode);
		}
	}

	clear() {
		this.selectBox.clear();
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

customElements.define('select-var', SelectVar);
