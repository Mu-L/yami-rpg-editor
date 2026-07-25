import { HistoryTimer } from './history-timer.ts';
import { IEditableHistory } from '@/types/history.ts';

export class TextHistory implements IEditableHistory {
	input: HTMLElement & { [k: string]: any };
	stack: any[];
	index: number;
	inputType: string;
	deleted: string;
	inserted: string;
	lastInsert: string;
	lastStart: number;
	lastEnd: number;
	editingStart: number;
	selectionStart: number;
	selectionEnd: number;
	history: any;

	static restoring: boolean;
	static eventStruct: { inputType: string; data: string | null };
	static inputReplace: (value: string | number) => void;

	constructor(input: any) {
		this.input = input;
		this.stack = [];
		this.index = -1;
		this.inputType = '';
		this.deleted = '';
		this.inserted = '';
		this.lastInsert = '';
		this.lastStart = 0;
		this.lastEnd = 0;
		this.editingStart = 0;
		this.selectionStart = 0;
		this.selectionEnd = 0;

		input.replace = TextHistory.inputReplace;

		input.on('keydown', this.inputKeydown);
		input.on('beforeinput', this.inputBeforeinput);
		input.on('input', this.inputInput);
		input.on('blur', this.inputBlur);
		input.on('compositionstart', this.inputCompositionstart);
		input.on('compositionend', this.inputCompositionEnd);
	}

	reset() {
		if (this.stack.length !== 0) {
			this.stack = [];
			this.index = -1;
		}
		this.inputType = '';
		this.lastInsert = '';
	}

	save() {
		if (this.inputType) {
			this.inputType = '';
		} else {
			return;
		}
		if (!this.deleted && !this.inserted) {
			return;
		}

		const data = {
			deleted: this.deleted,
			inserted: this.inserted,
			lastStart: this.lastStart,
			lastEnd: this.lastEnd,
			editingStart: this.editingStart
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
		if (operation === 'undo') {
			this.save();
		}
		let index = this.index;
		if (operation === 'redo') {
			index++;
		}
		if (index >= 0 && index < this.stack.length) {
			const input = this.input;
			const data = this.stack[index];
			const { deleted, inserted, lastStart, lastEnd, editingStart } = data;

			let inputType;
			TextHistory.restoring = true;
			switch (operation) {
				case 'undo':
					inputType = 'historyUndo';
					if (inserted.length > 0) {
						input.selectionStart = editingStart;
						input.selectionEnd = editingStart + inserted.length;
						document.execCommand('delete');
					}
					if (deleted.length > 0) {
						input.selectionStart = editingStart;
						input.selectionEnd = editingStart;
						document.execCommand('insertText', false, deleted);
						input.selectionStart = lastStart;
						input.selectionEnd = lastEnd;
					}
					this.index--;
					break;
				case 'redo':
					inputType = 'historyRedo';
					if (deleted.length > 0) {
						input.selectionStart = editingStart;
						input.selectionEnd = editingStart + deleted.length;
						document.execCommand('delete');
					}
					if (inserted.length > 0) {
						input.selectionStart = editingStart;
						input.selectionEnd = editingStart;
						document.execCommand('insertText', false, inserted);
					}
					this.index++;
					break;
			}
			TextHistory.restoring = false;
			HistoryTimer.finish();
			input.dispatchEvent(
				new InputEvent('input', {
					inputType: inputType,
					bubbles: true
				})
			);
		}
	}

	canUndo() {
		return this.index >= 0 || !!this.inputType;
	}

	canRedo() {
		return this.index + 1 < this.stack.length;
	}

	updateStates(event: any) {
		const { input } = this;
		const inputType = event.inputType;
		if (this.inputType !== inputType) {
			this.inputType = inputType ?? 'unknown';
			this.inserted = '';
			this.deleted = '';
			this.lastStart = input.selectionStart;
			this.lastEnd = input.selectionEnd;
			this.editingStart = input.selectionStart;
			if (input.selectionStart !== input.selectionEnd) {
				this.deleted = input.value.slice(input.selectionStart, input.selectionEnd);
			}
		}
		switch (inputType) {
			case 'insertLineBreak':
				this.inserted += '\n';
				break;
			case 'insertText':
				if (event.data) {
					this.inserted += event.data;
				}
				break;
			case 'deleteContentForward':
				if (
					input.selectionStart < input.value.length &&
					input.selectionStart === input.selectionEnd
				) {
					const char = input.value[input.selectionStart];
					this.deleted = this.deleted + char;
				}
				break;
			case 'deleteContentBackward':
				if (input.selectionStart > 0 && input.selectionStart === input.selectionEnd) {
					const char = input.value[input.selectionStart - 1];
					this.deleted = char + this.deleted;
					this.editingStart--;
				}
				break;
			case 'replaceText':
				this.inserted = event.data;
				break;
			default:
				if (event.data) {
					this.inserted =
						event.data.indexOf('\r') !== -1
							? event.data.replace(/\r/g, '')
							: event.data;
				}
				break;
		}
	}

	updateSelection(event: any) {
		const { input } = this;
		this.lastInsert = event.data;
		this.selectionStart = input.selectionStart;
		this.selectionEnd = input.selectionEnd;
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

	inputBeforeinput(event: any) {
		const { history } = this;
		switch (event.inputType) {
			case 'insertCompositionText':
				return;
			case 'insertLineBreak':
				if (this instanceof HTMLInputElement) {
					return;
				}
			case 'insertText':
				switch (event.data) {
					case ' ':
					case '<':
						if (history.lastInsert !== event.data) {
							HistoryTimer.finish();
						}
						break;
				}
			case 'deleteContentForward':
			case 'deleteContentBackward':
				if (
					history.inputType !== '' &&
					(HistoryTimer.complete ||
						HistoryTimer.type !== event.inputType ||
						history.selectionStart !== this.selectionStart ||
						history.selectionEnd !== this.selectionEnd)
				) {
					history.save();
				}
				HistoryTimer.start(event.inputType);
				switch (event.data) {
					case ':':
					case '>':
						if (history.lastInsert !== event.data) {
							HistoryTimer.finish();
						}
						break;
				}
				break;
			case 'replaceText':
				if (
					history.inputType !== null &&
					(HistoryTimer.complete || HistoryTimer.type !== event.inputType)
				) {
					history.save();
				}
				HistoryTimer.start(event.inputType);
				break;
			case 'inputCompositionText':
			default:
				history.save();
				HistoryTimer.finish();
				break;
		}
		history.updateStates(event);
	}

	inputInput(event: any) {
		switch (event.inputType) {
			case 'insertCompositionText':
				break;
			default:
				if (TextHistory.restoring) {
					event.stopImmediatePropagation();
				} else {
					this.history.updateSelection(event);
				}
				break;
		}
	}

	inputBlur(event: any) {
		HistoryTimer.finish();
	}

	inputCompositionstart(event: any) {
		const { history } = this;
		const struct = TextHistory.eventStruct;
		struct.data = null;
		history.save();
		history.inputBeforeinput.call(this, struct);
		history.updateSelection(event);
	}

	inputCompositionEnd(event: any) {
		const { history } = this;
		if (event.data || history.deleted) {
			const struct = TextHistory.eventStruct;
			struct.data = event.data;
			history.updateStates(struct);
			history.updateSelection(event);
		} else {
			history.inputType = '';
		}
	}
}

TextHistory.restoring = false;

TextHistory.eventStruct = {
	inputType: 'inputCompositionText',
	data: null
};

TextHistory.inputReplace = (function IIFE() {
	const eventStruct = {
		inputType: 'replaceText',
		data: null
	};
	return function (value) {
		if (typeof value === 'number') {
			value = value.toString();
		}
		eventStruct.data = value;
		this.select();
		this.history.inputBeforeinput.call(this, eventStruct);
		this.value = value;
	};
})();
