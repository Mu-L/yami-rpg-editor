export class GamepadBox extends HTMLElement {
	input: HTMLElement;
	dataValue: number;
	static intervalIndex;

	constructor() {
		super();

		const input = document.createElement('input');
		input.addClass('gamepad-box-input');
		input.type = 'text';
		input.on('keydown', this.inputKeydown);
		input.on('focus', this.inputFocus);
		input.on('blur', this.inputBlur);
		this.appendChild(input);

		this.input = input;
		this.dataValue = null;
	}

	read(): number | null {
		return this.dataValue;
	}

	write(button: number): void {
		this.dataValue = button;
		this.input.value = GamepadBox.getButtonName(button);
	}

	enable() {
		if (this.removeClass('disabled')) {
			this.showChildNodes();
		}
	}

	disable() {
		if (this.addClass('disabled')) {
			this.hideChildNodes();
		}
	}

	getFocus(mode: any) {
		return this.input.getFocus(mode);
	}

	inputKeydown(event: any) {
		switch (event.code) {
			case 'Tab':
				break;
			case 'Backspace':
				event.preventDefault();
				(this.parentNode as any).write(-1);
				(this.parentNode as any).dispatchChangeEvent();
				break;
			default:
				event.preventDefault();
				break;
		}
	}

	inputFocus() {
		let lastPad = null;

		const inputKeyCode = () => {
			const pads = navigator.getGamepads();
			const pad = pads[0] || pads[1] || pads[2] || pads[3] || null;
			if (pad !== null) {
				if (lastPad === null) {
					lastPad = Object.clone(pad);
					for (const button of lastPad.buttons) {
						button.pressed = false;
						button.value = 0;
					}
				}
				if (lastPad.id === pad.id) {
					const lastButtons = lastPad.buttons;
					const buttons = pad.buttons;
					const length = buttons.length;
					for (let code = 0; code < length; code++) {
						if (buttons[code].pressed && !lastButtons[code].pressed) {
							(this.parentNode as any).write(code);
							(this.parentNode as any).dispatchChangeEvent();
							break;
						}
					}
				}
				lastPad = Object.clone(pad);
			}
		};

		GamepadBox.intervalIndex = setInterval(inputKeyCode);
	}

	inputBlur() {
		clearInterval(GamepadBox.intervalIndex);
		GamepadBox.intervalIndex = null;
	}

	static getButtonName = (function IIFE() {
		const codeToName = {
			0: 'A',
			1: 'B',
			2: 'X',
			3: 'Y',
			4: 'LB',
			5: 'RB',
			6: 'LT',
			7: 'RT',
			8: 'View',
			9: 'Menu',
			10: 'LS',
			11: 'RS',
			12: 'Up',
			13: 'Down',
			14: 'Left',
			15: 'Right'
		};

		return function (code) {
			return code === -1 ? '' : (codeToName[code] ?? `Button_${code}`);
		};
	})();
}

customElements.define('gamepad-box', GamepadBox);
