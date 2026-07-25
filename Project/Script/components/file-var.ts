import { CustomBox } from './custom-box.ts';

export class FileVar extends HTMLElement {
	mode: string;
	strBox: HTMLElement & { [k: string]: any };
	varBox: CustomBox;

	constructor() {
		super();

		this.mode = null;
		this.fileBox = new CustomBox();
		this.varBox = new CustomBox();
		this.fileBox.type = 'file';
		this.fileBox.filter = this.getAttribute('filter');
		this.varBox.type = 'variable';
		this.varBox.filter = 'string';

		this.on('keydown', this.keydown);
		this.on('pointerdown', this.pointerdown);
	}

	read() {
		switch (this.mode) {
			case 'constant':
				return this.fileBox.read();
			case 'variable':
				return this.varBox.read();
		}
	}

	write(value: any) {
		switch (typeof value) {
			case 'string':
				this.switch('constant');
				this.fileBox.write(value);
				this.varBox.write(FileVar.defVar);
				break;
			case 'object':
				this.switch('variable');
				this.fileBox.write('');
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
					this.appendChild(this.fileBox);
					if (focus) {
						this.fileBox.focus();
					}
					break;
				case 'variable':
					this.fileBox.remove();
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
			this.fileBox.enable();
			this.varBox.enable();
		}
	}

	disable() {
		if (this.addClass('disabled')) {
			this.fileBox.disable();
			this.varBox.disable();
		}
	}

	getFocus(mode: any) {
		switch (this.mode) {
			case 'constant':
				return this.fileBox.getFocus(mode);
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

customElements.define('file-var', FileVar);
