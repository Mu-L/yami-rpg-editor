import { File } from '@/file/file-system-core.ts';
import { AudioManager } from './audio-manager.ts';
import { Reverb } from './reverb.ts';

export class AudioPlayer {
	// HTMLAudioElement 运行时挂载 .path 字段（play/stop 读写）
	audio: HTMLAudioElement & { path: string };
	source: MediaElementAudioSourceNode;
	panner: StereoPannerNode;
	reverb: any | null;

	constructor() {
		const { context } = AudioManager;
		this.audio = new Audio();
		this.source = context.createMediaElementSource(this.audio);
		this.panner = context.createStereoPanner();
		this.reverb = null;
		this.audio.path = '';

		this.source.connect(this.panner);
		this.panner.connect(AudioManager.analyser);
	}

	play(path: string): void {
		if (path) {
			const audio = this.audio;
			if (audio.path !== path || audio.readyState !== 4 || audio.ended === true) {
				audio.src = File.route(path);
				audio.path = path;
				audio.play();
			}
		} else {
			this.stop();
		}
	}

	stop(): void {
		const audio = this.audio;
		if (audio.path) {
			audio.pause();
			audio.currentTime = 0;
			audio.path = '';
		}
	}

	setVolume(volume: number): void {
		this.audio.volume = Math.clamp(volume, 0, 1);
	}

	setPan(pan: number): void {
		this.panner.pan.value = Math.clamp(pan, -1, 1);
	}

	setReverb(dry: any, wet: any) {
		if (this.reverb === null && !(dry === 1 && wet === 0)) {
			new Reverb(this);
		}
		if (this.reverb !== null) {
			this.reverb.set(dry, wet);
		}
	}

	getParams() {
		return {
			volume: Math.roundTo(this.audio.volume, 2),
			pan: Math.roundTo(this.panner.pan.value, 2),
			dry: this.reverb ? Math.roundTo(this.reverb.dryGain.gain.value, 2) : 1,
			wet: this.reverb ? Math.roundTo(this.reverb.wetGain.gain.value / 2, 2) : 0
		};
	}
}
