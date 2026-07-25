export class NavBar extends HTMLElement {
	writeEventEnabled: boolean;
	selectEventEnabled: boolean;

	constructor() {
		super();

		const elements = this.childNodes;
		if (elements.length > 0) {
			let i = elements.length;
			while (--i >= 0) {
				const element = elements[i] as HTMLElement & { dataValue: any };
				if (element.tagName === 'NAV-ITEM') {
					const string = element.getAttribute('value') ?? '';
					const isNumber = RegExp.number.test(string);
					element.dataValue = isNumber ? parseFloat(string) : string;
				} else {
					this.removeChild(element);
				}
			}
		}

		this.writeEventEnabled = false;
		this.selectEventEnabled = false;

		this.on('pointerdown', this.pointerdown);
	}

	read(): any {
		const item = this.querySelector('.selected');
		return item ? (item as HTMLElement & { dataValue: any }).dataValue : undefined;
	}

	write(value: any): void {
		const items = this.childNodes;
		const length = items.length;
		if (length !== 0) {
			this.unselect();
			let target: HTMLElement | undefined;
			for (let i = 0; i < length; i++) {
				if ((items[i] as HTMLElement & { dataValue: any }).dataValue === value) {
					target = items[i] as HTMLElement;
					break;
				}
			}
			if (target !== undefined) {
				target.addClass('selected');
			}
			if (this.writeEventEnabled) {
				const write: any = new Event('write');
				write.value = target ? value : undefined;
				this.dispatchEvent(write);
			}
		}
	}

	unselect(): void {
		const item = this.querySelector('.selected');
		if (item) {
			(item as HTMLElement).removeClass('selected');
		}
	}

	// for (const item of items) { const li = document.createElement('nav-item') li.textContent = item.name

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
			case 'select':
				this.selectEventEnabled = true;
				break;
		}
	}

	pointerdown(event: PointerEvent): void {
		switch (event.button) {
			case 0: {
				const element = event.target as HTMLElement;
				if (element.tagName === 'NAV-ITEM' && !element.hasClass('selected')) {
					this.write((element as HTMLElement & { dataValue: any }).dataValue);
					if (this.selectEventEnabled) {
						const select = new Event('select');
						select.value = (element as HTMLElement & { dataValue: any }).dataValue;
						this.dispatchEvent(select);
					}
				}
				break;
			}
		}
	}
}

customElements.define('nav-bar', NavBar);
