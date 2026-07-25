import { $ } from '../util/dom.ts';
import { Timer } from '../util/timer.ts';
import { Inspector } from '../inspector/inspector.ts';
import { Scene } from './scene-window.ts';
import { GL } from '../webgl/webgl-init.ts';
Scene.requestAnimation = function () {
	if (this.state === 'open' && this.showAnimation) {
		Timer.appendUpdater('stageAnimation', this.updateAnimation);
	}
};

Scene.updateAnimation = function (deltaTime) {
	const { animationInterval } = Scene;
	if (animationInterval > 0) {
		Scene.animationElapsed += deltaTime;
		if (Scene.animationElapsed >= animationInterval) {
			Scene.animationElapsed -= animationInterval;
			Scene.animationFrame += 1;
		}
	}
	Scene.updateParallaxes(deltaTime);
	Scene.updateAnimations(deltaTime);
	Scene.updateParticles(deltaTime);
	if (Timer.updaters.stageRendering !== Scene.renderingFunction) {
		Scene.drawScene();
	}
};

Scene.stopAnimation = function () {
	Timer.removeUpdater('stageAnimation', this.updateAnimation);
};

Scene.requestRendering = function () {
	if (this.state === 'open') {
		Timer.appendUpdater('stageRendering', this.renderingFunction);
	}
};

Scene.renderingFunction = function () {
	Scene.updateAnimations(0);
	Scene.drawScene();
};

Scene.stopRendering = function () {
	Timer.removeUpdater('stageRendering', this.renderingFunction);
};

Scene.switchLayer = (function IIFE() {
	const layerGroup = $('#scene-layer');
	const items = { tilemap: null };
	for (const item of layerGroup.children) {
		const layer = item.getAttribute('value');
		items[layer] = item;
	}
	let selection = undefined;
	return function (layer) {
		const element = items[layer];
		if (selection === element) {
			return;
		}

		if (selection === null) {
			this.closeTilemap(false);
			this.computeActiveTilemapId();
		}

		selection?.removeClass('selected');
		element?.addClass('selected');
		selection = element;

		const marquee = this.marquee;
		switch ((this.layer = layer)) {
			case 'object':
				marquee.switch('object');
				this.updateTargetInfo();
				break;
			case 'tilemap':
				marquee.switch(this.brush === 'eraser' ? 'eraser' : 'tile');
				marquee.clear();
				break;
			case 'terrain':
				marquee.switch(this.brush === 'eraser' ? 'eraser' : 'terrain');
				marquee.clear();
				break;
		}
		marquee.resize();
		if (this.state === 'open') {
			Scene.requestRendering();
		}
	};
})();

Scene.switchBrush = (function IIFE() {
	const list = $('#scene-brush');
	const items = {};
	for (const item of list.children) {
		const brush = item.getAttribute('value');
		items[brush] = item;
	}
	let selection = null;
	return function (brush) {
		const element = items[brush];
		if (selection === element) {
			return;
		}

		selection?.removeClass('selected');
		element.addClass('selected');
		selection = element;

		const marquee = this.marquee;
		switch ((this.brush = brush)) {
			case 'eraser':
				marquee.switch('eraser');
				break;
			case 'pencil':
			case 'rect':
			case 'oval':
			case 'fill':
				marquee.switch(this.layer === 'terrain' ? 'terrain' : 'tile');
				break;
		}
		marquee.clear();
		marquee.resize();
	};
})();

Scene.switchGrid = (function IIFE() {
	const item = $('#scene-switch-grid');
	return function (enabled = !this.showGrid) {
		if (enabled) {
			item.addClass('selected');
		} else {
			item.removeClass('selected');
		}
		this.showGrid = enabled;
		this.requestRendering();
	};
})();

Scene.switchLight = (function IIFE() {
	const item = $('#scene-switch-light');
	return function (enabled = !this.showLight) {
		if (enabled) {
			item.addClass('selected');
		} else {
			item.removeClass('selected');
		}
		this.showLight = enabled;
		this.requestRendering();
	};
})();

Scene.switchAnimation = (function IIFE() {
	const item = $('#scene-switch-animation');
	return function (enabled = !this.showAnimation) {
		this.showAnimation = enabled;
		if (enabled) {
			item.addClass('selected');
			this.requestAnimation();
		} else {
			item.removeClass('selected');
			this.stopAnimation();
			this.resetAnimations();
		}
		this.requestRendering();
	};
})();

Scene.switchSettings = function () {
	if (!Inspector.fileScene.button.hasClass('selected')) {
		Inspector.open('fileScene', Scene.context.scene);
	} else {
		Inspector.close();
	}
};

Scene.switchTerrain = function () {
	const context = this.marquee.key === 'terrain' ? this.marquee : this.marquee.saveData.terrain;
	context.terrain = (context.terrain + 2) % 3;
	if (this.brush === 'eraser') {
		this.switchBrush('pencil');
	}
	if (this.marquee.visible) {
		this.requestRendering();
	}
};

Scene.resetAnimations = function () {
	if (this.state === 'open') {
		for (const { player } of this.actors) {
			player.clearParticles();
			player.restart();
		}
		for (const { player } of this.animations) {
			player.clearParticles();
			player.restart();
		}
		for (const { emitter } of this.particles) {
			emitter?.clear();
		}
	}
};

Scene.updateFont = function () {
	const context = GL.context2d;
	const size = window.devicePixelRatio * 12;
	if (context.size !== size) {
		context.size = size;
		context.font = `${size}px ${document.body.css().fontFamily}`;
	}
};
