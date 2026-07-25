import { EventBus } from './eventbus.ts';

let _origUpdateCommandElement: any;
// command-list 内 command-item 元素运行时挂载的扩展字段
interface CommandItemElement extends HTMLElement {
	pre: HTMLElement;
	lines: HTMLElement[];
	dataIndent: number;
	eventBinding?: boolean;
}
export function updateCommandElement(this: any, element: CommandItemElement): any {
	const ret = _origUpdateCommandElement.call(this, element);

	element.querySelectorAll('command-mark-major').forEach((e) => {
		e.remove();
	});

	element.querySelectorAll('command-mark-minor').forEach((e) => {
		e.remove();
	});

	let pre = document.createElement('command-mark-major');
	pre.textContent = '';
	element.insertBefore(pre, element.firstElementChild);
	element.pre = pre;

	element.lines = [];
	for (let i = element.dataIndent; i >= 0; i--) {
		let line = document.createElement('command-line');
		line.style.marginLeft = this.computeTextIndent(i);
		element.insertBefore(line, element.firstElementChild);
		element.lines[i] = line;
	}

	const list = this.elements;
	if (!element?.eventBinding) {
		element.on('mouseenter', function () {
			let indent = null;
			const { start, end } = range(
				list,
				list.findIndex((v) => v === element)
			);
			for (let i = start; i <= end; i++) {
				const element = list[i];
				if (indent === null) {
					indent = element.dataIndent;
				}
				const needNode = element.lines?.[indent];
				if (needNode && needNode.mark !== 'header') needNode.classList.add('hover');
			}
		});
		element.on('mouseleave', function () {
			let indent = null;
			const { start, end } = range(
				list,
				list.findIndex((v) => v === element)
			);
			for (let i = start; i <= end; i++) {
				const element = list[i];
				if (indent === null) {
					indent = element.dataIndent;
				}
				const needNode = element.lines?.[indent];
				if (needNode && needNode.mark !== 'header') needNode.classList.remove('hover');
			}
		});
		element.eventBinding = true;
	}

	return ret;
}

EventBus.once('editor_loaded', () => {
	const CL = customElements.get('command-list');
	if (CL) {
		// 必须在覆盖之前捕获原方法，否则新方法首次调用时取到的 prototype.updateCommandElement 已是新方法自己，_origUpdateCommandElement.call(this, ...) 会无限递归调自己
		_origUpdateCommandElement = CL.prototype.updateCommandElement;
		CL.prototype.updateCommandElement = updateCommandElement;
	}
});

export const commandList = document.querySelector('#event-commands');

(commandList as any).getSelectionPosition = function () {
	return this.elements[this.active].pre.getBoundingClientRect();
};

export function range(
	elements: any,
	start: number,
	end: number = start
): { start: number; end: number; indent?: number } {
	const count = elements.count;
	start = Math.clamp(start, 0, count - 1);
	end = Math.clamp(end, 0, count - 1);
	let indent = Infinity;
	for (let i = start; i <= end; i++) {
		const { dataIndent } = elements[i];
		if (dataIndent < indent) {
			indent = dataIndent;
		}
	}
	for (let i = start; i >= 0; i--) {
		const element = elements[i];
		if (element.dataIndent === indent && element.dataKey === true) {
			start = i;
			break;
		}
	}
	for (let i = end + 1; i < count; i++) {
		const element = elements[i];
		if (
			element.dataIndent < indent ||
			(element.dataIndent === indent && element.dataKey === true)
		) {
			end = i - 1;
			break;
		}
	}
	if (start !== end) {
		const element = elements[end];
		if (!element.dataItem) {
			end--;
		}
	}
	return {
		start,
		end,
		indent
	};
}

commandList.on('update', function () {
	const list = this.elements;
	for (let i = 0; i < list.count; i++) {
		const e = list[i];
		if (e.fold) {
			e.mark = 'header';
		} else {
			e.mark = 'item';
			const buffer = e.dataItem?.buffer;
			if (buffer && buffer.length > 1) {
				e.mark = 'option';
				if (buffer[buffer.length - 1] == e) {
					e.mark = 'footer';
				}
			}
		}
		e.classList.add(e.mark);
	}
});
