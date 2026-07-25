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
	static appendUpdater: ((key: string, updater: (deltaTime: number) => void) => void) | null =
		null;
	static removeUpdater: ((key: string, updater: (deltaTime: number) => void) => void) | null =
		null;

	playbackRate: number;
	elapsed: number;
	duration: number;
	update: (timer: Timer) => boolean | void;
	callback: (timer: Timer) => boolean | void;
	// 运行时挂载: tree-list 等用于在 Timer 实例上绑定触发上下文 / 运行状态
	target: HTMLElement | null;
	running: boolean;
	// scroll-listener.ts 中用于滚动检测计时器的速度挂载
	speedX: number;
	speedY: number;
	// history-timer.ts 中用于标记完成状态
	complete: boolean;
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
			Math.min(this.duration, this.elapsed + deltaTime * this.playbackRate)
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
Timer.initialize = null;
Timer.start = null;
Timer.update = null;
Timer.play = null;
Timer.appendUpdater = null;
Timer.removeUpdater = null;

Timer.initialize = function (this: typeof Timer) {
	this.timestamp = 0;
	this.deltaTime = 0;
	this.frameCount = 0;
	this.frameTime = 0;
	this.tpf = Infinity;

	const windowOpen = (event: Event) => {
		if ((event.target as HTMLElement).hasClass('maximized')) {
			this.animationWaiting++;
		}
	};
	const windowClosed = (event: Event) => {
		if ((event.target as HTMLElement).hasClass('maximized')) {
			this.animationWaiting--;
		}
	};
	const windowMaximize = () => {
		this.animationWaiting++;
	};
	const windowUnmaximize = () => {
		this.animationWaiting--;
	};
	const windows = $('#event, #selector, #imageClip');
	windows.on('open', windowOpen);
	windows.on('closed', windowClosed);
	windows.on('maximize', windowMaximize);
	windows.on('unmaximize', windowUnmaximize);
};

Timer.start = function (timestamp: number) {
	Timer.timestamp = timestamp - Timer.deltaTime;
	Timer.update(timestamp);
};

Timer.update = function (timestamp: number) {
	let deltaTime = timestamp - Timer.timestamp;

	Timer.frameCount++;
	Timer.frameTime += deltaTime;
	if (Timer.frameTime > 995) {
		Timer.tpf = Timer.frameTime / Timer.frameCount;
		Timer.frameCount = 0;
		Timer.frameTime = 0;
	}

	// 修正间隔 - 减少跳帧视觉差异
	deltaTime = Math.min(deltaTime, Timer.tpf + 1, 35);

	Timer.timestamp = timestamp;
	Timer.deltaTime = deltaTime;

	const { timers } = Timer;
	let i = timers.length;
	while (--i >= 0) {
		timers[i].tick(deltaTime);
	}

	const updaters = Timer.updaters;
	const { stageAnimation } = updaters;
	if (stageAnimation !== null && Timer.animationWaiting === 0 && document.hasFocus()) {
		stageAnimation(deltaTime);
	}
	const { stageRendering } = updaters;
	if (stageRendering !== null) {
		stageRendering(deltaTime);
		updaters.stageRendering = null;
	}
	const { sharedAnimation } = updaters;
	if (sharedAnimation !== null && Timer.animationWaiting === 0 && document.hasFocus()) {
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

	if (Timer.timers.length > 0 || stageAnimation !== null || sharedAnimation !== null) {
		Timer.animationIndex = requestAnimationFrame(Timer.update);
	} else {
		Timer.animationIndex = -1;
	}
};

Timer.play = function (this: typeof Timer) {
	if (this.animationIndex === -1) {
		this.animationIndex = requestAnimationFrame(this.start);
	}
};

Timer.appendUpdater = function (
	this: typeof Timer,
	key: string,
	updater: (deltaTime: number) => void
) {
	const updaters = this.updaters;
	if (updaters[key] === null) {
		updaters[key] = updater;
		this.play();
	}
};

Timer.removeUpdater = function (
	this: typeof Timer,
	key: string,
	updater: (deltaTime: number) => void
) {
	const updaters = this.updaters;
	if (updaters[key] === updater) {
		updaters[key] = null;
	}
};
