export class PageManager extends HTMLElement {
	index: any;
	active: HTMLElement | null;
	switchEventEnabled: boolean;

	constructor() {
		super();

		const elements = this.childNodes;
		if (elements.length > 0) {
			let i = elements.length;
			while (--i >= 0) {
				const element: any = elements[i];
				if (element.tagName === 'PAGE-FRAME') {
					element.dataValue = element.getAttribute('value');
				} else {
					this.removeChild(element);
				}
			}
		}

		this.index = null;
		this.active = null;
		this.switchEventEnabled = false;
	}

	switch(value: any): void {
		const last = this.index;
		if (last !== value) {
			let target: HTMLElement | null = null;
			if (value !== null) {
				for (const element of <any>this.childNodes) {
					if ((<any>element).dataValue === value) {
						target = element;
						break;
					}
				}
			}
			const active = this.active;
			if (active !== target) {
				this.index = value;
				this.active = target;
				active?.removeClass('visible');
				target?.addClass('visible');
				if (this.switchEventEnabled) {
					const event: any = new Event('switch');
					event.last = last;
					event.value = value;
					this.dispatchEvent(event);
				}
				active?.dispatchResizeEvent();
				target?.dispatchResizeEvent();
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
			case 'switch':
				this.switchEventEnabled = true;
				break;
		}
	}
}

customElements.define('page-manager', PageManager);
