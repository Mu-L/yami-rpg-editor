import { Window } from '@/tools/window-object.ts';

export class TitleBar extends HTMLElement {
	dragging: PointerEvent | null;

	constructor() {
		super();

		this.dragging = null;

		this.on('pointerdown', this.pointerdown);
		this.on('click', this.mouseclick);
		this.on('doubleclick', this.doubleclick);
	}

	pointerdown(event: PointerEvent): void {
		if (this.dragging) {
			return;
		}
		switch (event.button) {
			case 0:
				if (event.target instanceof TitleBar) {
					const windowFrame = this.parentNode as HTMLElement & {
						rect(): DOMRect;
						maximize(): void;
						unmaximize(): void;
						style: CSSStyleDeclaration;
						id: string;
					};
					const rect = windowFrame.rect();
					const startX = event.clientX;
					const startY = event.clientY;
					const { left, top, width, height } = rect;
					const pointermove = (event: PointerEvent) => {
						if ((this.dragging as PointerEvent).relate(event)) {
							let right = window.innerWidth - width;
							let bottom = window.innerHeight - height;
							if (document.body.hasClass('border')) {
								const dpx = 1 / window.devicePixelRatio;
								right -= dpx * 2;
								bottom -= dpx * 2;
							}
							const x = CSS.rasterize(left - startX + event.clientX);
							const y = CSS.rasterize(top - startY + event.clientY);
							windowFrame.style.left = `${Math.clamp(x, 0, right)}px`;
							windowFrame.style.top = `${Math.clamp(y, 0, bottom)}px`;
						}
					};
					const pointerup = (event: PointerEvent) => {
						if ((this.dragging as PointerEvent).relate(event)) {
							cancel();
						}
					};
					const cancel = () => {
						this.dragging = null;
						window.off('pointermove', pointermove);
						window.off('pointerup', pointerup);
						window.off('blur', cancel);
					};
					this.dragging = event;
					(event as PointerEvent & { cancel(event?: Event): void }).cancel = cancel;
					window.on('pointermove', pointermove);
					window.on('pointerup', pointerup);
					window.on('blur', cancel);
				}
				break;
		}
	}

	mouseclick(event: Event): void {
		const target = event.target as HTMLElement;
		switch (target.tagName) {
			case 'MAXIMIZE': {
				const windowFrame = this.parentNode as HTMLElement & {
					hasClass(name: string): boolean;
					maximize(): void;
					unmaximize(): void;
					id: string;
				};
				if (!windowFrame.hasClass('maximized')) {
					windowFrame.maximize();
				} else {
					windowFrame.unmaximize();
				}
				break;
			}
			case 'CLOSE': {
				const windowFrame = this.parentNode as HTMLElement & {
					id: string;
				};
				Window.close(windowFrame.id);
				break;
			}
		}
	}

	doubleclick(event: Event): void {
		const target = event.target as HTMLElement;
		if (target instanceof TitleBar && target.querySelector('maximize')) {
			(this.dragging as (PointerEvent & { cancel(): void }) | null)?.cancel();
			const windowFrame = this.parentNode as HTMLElement & {
				hasClass(name: string): boolean;
				maximize(): void;
				unmaximize(): void;
			};
			if (!windowFrame.hasClass('maximized')) {
				windowFrame.maximize();
			} else {
				windowFrame.unmaximize();
			}
		}
	}
}

customElements.define('title-bar', TitleBar);
