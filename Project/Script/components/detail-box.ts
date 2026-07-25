import { DetailSummary } from './detail-summary.ts';

export class DetailBox extends HTMLElement {
	toggleEventEnabled: boolean;

	constructor() {
		super();

		this.toggleEventEnabled = false;
	}

	toggle(): void {
		if (this.hasAttribute('open')) {
			this.close();
		} else {
			this.open();
		}
	}

	open(): void {
		if (!this.hasAttribute('open')) {
			this.setAttribute('open', '');
			for (const node of this.children) {
				if (!(node instanceof DetailSummary)) {
					(node as HTMLElement).show();
				}
			}
			if (this.toggleEventEnabled) {
				const toggle = new Event('toggle');
				toggle.value = 'open';
				this.dispatchEvent(toggle);
			}
		}
	}

	close(): void {
		if (this.hasAttribute('open')) {
			this.removeAttribute('open');
			for (const node of this.children) {
				if (!(node instanceof DetailSummary)) {
					(node as HTMLElement).hide();
				}
			}
			if (this.toggleEventEnabled) {
				const toggle = new Event('toggle');
				toggle.value = 'closed';
				this.dispatchEvent(toggle);
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
			case 'toggle':
				this.toggleEventEnabled = true;
				break;
		}
	}
}

customElements.define('detail-box', DetailBox);
