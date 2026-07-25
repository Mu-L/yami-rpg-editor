import { HistoryTimer } from './history-timer.ts';
import { IEditableHistory } from '../types/history.ts';

export class NumberHistory implements IEditableHistory {
	static restoring: boolean;
	input: any;
	stack: any[];
	index: number;
	lastValue: string;
	history: any;
	value: any;

	constructor(input: any) {
		this.input = input;
		this.stack = [];
		this.index = -1;
		this.lastValue = '';

		input.on('keydown', this.inputKeydown);
		input.on('input', this.inputInput);
		input.on('blur', this.inputBlur);
	}

	reset() {
		if (this.stack.length !== 0) {
			this.stack = [];
			this.index = -1;
		}
		this.lastValue = this.input.value;
	}

	save() {
		const data = {
			value: this.lastValue
		};

		const stack = this.stack;
		const length = this.index + 1;
		if (length < stack.length) {
			stack.length = length;
		}

		if (stack.length < 20) {
			this.index++;
			stack.push(data);
		} else {
			stack.shift();
			stack.push(data);
		}
	}

	restore(operation: any) {
		let index = this.index;
		if (operation === 'redo') {
			index++;
		}
		if (index >= 0 && index < this.stack.length) {
			const input = this.input;
			const data = this.stack[index];
			const { value } = data;
			data.value = this.lastValue;
			NumberHistory.restoring = true;
			input.select();
			document.execCommand('insertText', false, value);
			operation === 'undo' && input.select();
			NumberHistory.restoring = false;
			HistoryTimer.finish();

			switch (operation) {
				case 'undo':
					this.index--;
					break;
				case 'redo':
					this.index++;
					break;
			}
		}
	}

	canUndo() {
		return this.index >= 0;
	}

	canRedo() {
		return this.index + 1 < this.stack.length;
	}

	inputKeydown(event: any) {
		if (event.cmdOrCtrlKey) {
			switch (event.code) {
				case 'KeyZ':
					if (!event.macRedoKey) {
						this.history.canUndo() && this.history.restore('undo');
						break;
					}
				case 'KeyY':
					this.history.canRedo() && this.history.restore('redo');
					break;
			}
		}
	}

	inputInput(event: any) {
		if (!NumberHistory.restoring) {
			switch (event.inputType) {
				case 'insertCompositionText':
					break;
				case 'insertText':
				case 'deleteContentForward':
				case 'deleteContentBackward':
					if (HistoryTimer.complete || HistoryTimer.type !== event.inputType) {
						this.history.save();
					}
					HistoryTimer.start(event.inputType);
					break;
				case undefined:
					if (HistoryTimer.complete || HistoryTimer.type !== 'quickInput') {
						this.history.save();
					}
					HistoryTimer.start('quickInput');
					break;
				default:
					this.history.save();
					HistoryTimer.finish();
					break;
			}
		}
		switch (event.inputType) {
			case 'insertCompositionText':
				break;
			default:
				this.history.lastValue = this.value;
				break;
		}
	}

	inputBlur(event: any) {
		HistoryTimer.finish();
	}
}

NumberHistory.restoring = false;
