import { UI } from './ui-window.ts';

UI.Video = class VideoElement extends UI.Element {
	video: string;
	loop: boolean;
	flip: string;
	blend: string;

	constructor(data: any) {
		super(data);
		this.video = data.video;
		this.loop = data.loop;
		this.flip = data.flip;
		this.blend = data.blend;
	}

	draw() {
		this.drawDefaultImage();
		this.drawChildren();
	}

	resize() {
		if (this.parent instanceof UI.Window) {
			return this.parent.requestResizing();
		}
		this.calculatePosition();
		this.resizeChildren();
	}

	destroy() {
		super.destroy();
		this.destroyChildren();
	}
};
