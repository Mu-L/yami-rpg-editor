import { Timer } from '../util/timer.ts';

export const HistoryTimer = new Timer({
	duration: 2000,
	callback: (timer) => {
		timer.complete = true;
	}
}) as unknown as Omit<Timer, 'start'> & {
	complete: boolean;
	type: string;
	start: (type: string) => void;
};

HistoryTimer.complete = true;

HistoryTimer.start = function (type: string): void {
	if (this.complete) {
		this.complete = false;
		this.add();
	}
	this.type = type;
	this.elapsed = 0;
};

HistoryTimer.finish = function (): void {
	if (!this.complete) {
		this.complete = true;
		this.remove();
	}
};
