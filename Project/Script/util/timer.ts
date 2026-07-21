// ******************************** 计时器类 ********************************

import { $ } from './dom.ts';

export class Timer {
	static timers: Timer[] = [];
	static updaters: {
		stageAnimation: ((deltaTime: number) => void) | null;
		stageRendering: ((deltaTime: number) => void) | null;
		sharedAnimation: ((deltaTime: number) => void) | null;
		sharedRendering: ((deltaTime: number) => void) | null;
		sharedRendering2: ((deltaTime: number) => void) | null;
	} = {
		stageAnimation: null,
		stageRendering: null,
		sharedAnimation: null,
		sharedRendering: null,
		sharedRendering2: null
	};
	static timestamp: number = 0;
	static deltaTime: number = 0;
	static frameCount: number = 0;
	static frameTime: number = 0;
	static tpf: number = Infinity;
	static animationIndex: number = -1;
	static animationWaiting: number = 0;
	static initialize: ((this: typeof Timer) => void) | null = null;
	static start: ((timestamp: number) => void) | null = null;
	static update: ((timestamp: number) => void) | null = null;
	static play: ((this: typeof Timer) => void) | null = null;
	static appendUpdater:
		((key: string, updater: (deltaTime: number) => void) => void) | null =
		null;
	static removeUpdater:
		((key: string, updater: (deltaTime: number) => void) => void) | null =
		null;

	playbackRate: number;
	elapsed: number;
	duration: number;
	update: (timer: Timer) => boolean | void;
	callback: (timer: Timer) => boolean | void;
	// 运行时挂载: tree-list 等用于在 Timer 实例上绑定触发上下文 / 运行状态
	target: HTMLElement | null;
	running: boolean;
	startX: number;
	endX: number;
	startY: number;
	endY: number;
	start: number;
	end: number;
	state: string;
	offset: number;

	constructor({
		duration,
		update,
		callback
	}: {
		duration: number;
		update?: (timer: Timer) => boolean | void;
		callback?: (timer: Timer) => boolean | void;
	}) {
		this.playbackRate = 1;
		this.elapsed = 0;
		this.duration = duration;
		this.update = update ?? Function.empty;
		this.callback = callback ?? Function.empty;
	}

	tick(deltaTime: number) {
		this.elapsed = Math.max(
			0,
			Math.min(
				this.duration,
				this.elapsed + deltaTime * this.playbackRate
			)
		);
		if (this.update(this) === false) {
			this.remove();
			return;
		}
		if (this.elapsed === (this.playbackRate > 0 ? this.duration : 0)) {
			this.finish();
			return;
		}
	}

	finish() {
		if (this.callback(this) !== true) {
			this.remove();
		}
	}

	add() {
		if (Timer.timers.append(this)) {
			Timer.play?.();
		}
		return this;
	}

	remove() {
		Timer.timers.remove(this);
		return this;
	}
}

// properties
Timer.timers = [];
Timer.updaters = {
	stageAnimation: null,
	stageRendering: null,
	sharedAnimation: null,
	sharedRendering: null,
	sharedRendering2: null
};
Timer.timestamp = 0;
Timer.deltaTime = 0;
Timer.frameCount = 0;
Timer.frameTime = 0;
Timer.tpf = Infinity;
Timer.animationIndex = -1;
Timer.animationWaiting = 0;
// methods
Timer.initialize = null;
Timer.start = null;
Timer.update = null;
Timer.play = null;
Timer.appendUpdater = null;
Timer.removeUpdater = null;

// 初始化
Timer.initialize = function () {
	// 设置初始参数
	this.timestamp = 0;
	this.deltaTime = 0;
	this.frameCount = 0;
	this.frameTime = 0;
	this.tpf = Infinity;

	// 监测其他窗口的状态
	// 在最大化时停止播放动画
	const windowOpen = (event) => {
		if (event.target.hasClass('maximized')) {
			this.animationWaiting++;
		}
	};
	const windowClosed = (event) => {
		if (event.target.hasClass('maximized')) {
			this.animationWaiting--;
		}
	};
	const windowMaximize = (event) => {
		this.animationWaiting++;
	};
	const windowUnmaximize = (event) => {
		this.animationWaiting--;
	};
	const windows = $('#event, #selector, #imageClip');
	windows.on('open', windowOpen);
	windows.on('closed', windowClosed);
	windows.on('maximize', windowMaximize);
	windows.on('unmaximize', windowUnmaximize);
};

// 开始动画
Timer.start = function (timestamp) {
	Timer.timestamp = timestamp - Timer.deltaTime;
	Timer.update(timestamp);
};

// 更新动画
Timer.update = function (timestamp) {
	let deltaTime = timestamp - Timer.timestamp;

	// 计算FPS相关数据
	Timer.frameCount++;
	Timer.frameTime += deltaTime;
	if (Timer.frameTime > 995) {
		Timer.tpf = Timer.frameTime / Timer.frameCount;
		Timer.frameCount = 0;
		Timer.frameTime = 0;
	}

	// 修正间隔 - 减少跳帧视觉差异
	deltaTime = Math.min(deltaTime, Timer.tpf + 1, 35);

	// 更新属性
	Timer.timestamp = timestamp;
	Timer.deltaTime = deltaTime;

	// 更新计时器
	const { timers } = Timer;
	let i = timers.length;
	while (--i >= 0) {
		timers[i].tick(deltaTime);
	}

	// 更新更新器
	// 逐个获取更新器以便中途插入更新器
	const updaters = Timer.updaters;
	const { stageAnimation } = updaters;
	if (
		stageAnimation !== null &&
		Timer.animationWaiting === 0 &&
		document.hasFocus()
	) {
		stageAnimation(deltaTime);
	}
	const { stageRendering } = updaters;
	if (stageRendering !== null) {
		stageRendering(deltaTime);
		updaters.stageRendering = null;
	}
	const { sharedAnimation } = updaters;
	if (
		sharedAnimation !== null &&
		Timer.animationWaiting === 0 &&
		document.hasFocus()
	) {
		sharedAnimation(deltaTime);
	}
	const { sharedRendering } = updaters;
	if (sharedRendering !== null) {
		sharedRendering(deltaTime);
		updaters.sharedRendering = null;
	}
	const { sharedRendering2 } = updaters;
	if (sharedRendering2 !== null) {
		sharedRendering2(deltaTime);
		updaters.sharedRendering2 = null;
	}

	// 继续或结束动画
	if (
		Timer.timers.length > 0 ||
		stageAnimation !== null ||
		sharedAnimation !== null
	) {
		Timer.animationIndex = requestAnimationFrame(Timer.update);
	} else {
		Timer.animationIndex = -1;
	}
};

// 播放动画
Timer.play = function () {
	if (this.animationIndex === -1) {
		this.animationIndex = requestAnimationFrame(this.start);
	}
};

// 添加更新器
Timer.appendUpdater = function (key, updater) {
	const updaters = this.updaters;
	if (updaters[key] === null) {
		updaters[key] = updater;
		this.play();
	}
};

// 移除更新器
Timer.removeUpdater = function (key, updater) {
	const updaters = this.updaters;
	if (updaters[key] === updater) {
		updaters[key] = null;
	}
};
