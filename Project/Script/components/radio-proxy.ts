interface RadioRelationEntry {
	case: any;
	targets: RadioProxy[];
}

// 单选项元素运行时挂载的扩展字段（与 RadioProxy 类同：dataValue/enable/disable）
interface RadioProxyElement extends HTMLElement {
	dataValue: any;
	enable(): void;
	disable(): void;
}

export class RadioProxy extends HTMLElement {
	dataValue: any;
	relations: RadioRelationEntry[];
	cancelable: boolean;
	writeEventEnabled: boolean;
	inputEventEnabled: boolean;

	constructor() {
		super();

		this.dataValue = null;
		this.relations = [];
		this.cancelable = false;
		this.writeEventEnabled = false;
		this.inputEventEnabled = false;
	}

	read(): any {
		return this.dataValue;
	}

	write(value: any): void {
		const elements = document.getElementsByName(
			this.id
		) as unknown as NodeListOf<RadioProxyElement>;
		for (const element of elements) {
			if (element.dataValue === value) {
				(element as HTMLElement).addClass('selected');
				this.dataValue = value;
			} else {
				(element as HTMLElement).removeClass('selected');
			}
		}
		if (!this.hasClass('disabled')) {
			this.toggleRelatedElements();
		}
		if (this.writeEventEnabled) {
			const write = new Event('write') as Event & {
				value: any;
			};
			write.value = this.dataValue;
			this.dispatchEvent(write);
		}
	}

	input(value: any): void {
		const lastValue = this.dataValue;
		if (lastValue !== value) {
			this.write(value);
			if (this.inputEventEnabled) {
				const input = new Event('input') as Event & {
					value: any;
					lastValue: any;
				};
				input.value = this.dataValue;
				input.lastValue = lastValue;
				this.dispatchEvent(input);
			}
			this.dispatchChangeEvent();
		}
	}

	reset(): void {
		if (this.dataValue !== null) {
			const elements = document.getElementsByName(
				this.id
			) as unknown as NodeListOf<RadioProxyElement>;
			for (const element of elements) {
				if (element.dataValue === this.dataValue) {
					(element as HTMLElement).removeClass('selected');
					break;
				}
			}
			this.dataValue = null;
		}
	}

	enable(): void {
		if (this.removeClass('disabled')) {
			const elements = document.getElementsByName(this.id);
			for (const element of elements) {
				(element as HTMLElement).removeClass('disabled');
			}
			this.toggleRelatedElements();
		}
	}

	disable(): void {
		if (this.addClass('disabled')) {
			const elements = document.getElementsByName(this.id);
			for (const element of elements) {
				(element as HTMLElement).addClass('disabled');
			}
			this.toggleRelatedElements();
		}
	}

	relate(entries: RadioRelationEntry[]): void {
		this.relations = entries;
	}

	toggleRelatedElements(): void {
		if (this.relations.length !== 0) {
			if (!this.hasClass('disabled')) {
				const entries = this.relations;
				const selection = entries.find((entry) => entry.case === this.dataValue);
				for (const entry of entries) {
					if (entry.case === this.dataValue) {
						for (const element of entry.targets) {
							element.enable();
						}
					} else {
						for (const element of selection
							? Array.subtract(entry.targets, selection.targets)
							: entry.targets) {
							element.disable();
						}
					}
				}
			} else {
				const entries = this.relations;
				for (const entry of entries) {
					for (const element of entry.targets) {
						element.disable();
					}
				}
			}
		}
	}

	on(
		type: string,
		listener: (event: any) => void,
		options?: boolean | AddEventListenerOptions
	): void {
		super.on(type, listener, options);
		switch (type) {
			case 'write':
				this.writeEventEnabled = true;
				break;
			case 'input':
				this.inputEventEnabled = true;
				break;
		}
	}

	static map: Record<string, RadioProxy> = {};
}

customElements.define('radio-proxy', RadioProxy);
