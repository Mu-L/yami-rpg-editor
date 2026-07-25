import { AudioManager } from './audio-manager.ts';
import { AudioPlayer } from './audio-player.ts';

export class Reverb {
	player: AudioPlayer;
	input: StereoPannerNode;
	output: AudioNode;
	dryGain: GainNode;
	wetGain: GainNode;
	convolver: ConvolverNode | null;
	dry: number;
	wet: number;

	constructor(player: AudioPlayer) {
		const { context } = AudioManager;
		this.player = player;
		this.input = player.panner;
		this.output = AudioManager.analyser;
		this.dryGain = context.createGain();
		this.wetGain = context.createGain();
		this.convolver = this.getConvolver();
		this.dry = -1;
		this.wet = -1;

		this.connect();
	}

	connect(): void {
		this.player.reverb = this;
		this.input.disconnect(this.output);
		this.input.connect(this.dryGain);
		this.dryGain.connect(this.output);
		this.input.connect(this.wetGain);
		this.wetGain.connect(this.convolver!);
	}

	disconnect(): void {
		this.player.reverb = null;
		this.input.disconnect(this.dryGain);
		this.dryGain.disconnect(this.output);
		this.input.disconnect(this.wetGain);
		this.wetGain.disconnect(this.convolver!);
		this.input.connect(this.output);
	}

	set(dry: number, wet: number): void {
		this.setDry(dry);
		this.setWet(wet);
		if (dry === 1 && wet === 0) {
			this.disconnect();
		}
	}

	setDry(dry: number): void {
		if (this.dry !== dry) {
			this.dry = dry;
			this.dryGain.gain.value = dry;
		}
	}

	setWet(wet: number): void {
		if (this.wet !== wet) {
			this.wet = wet;
			this.wetGain.gain.value = wet * 2;
		}
	}

	getConvolver(): ConvolverNode {
		if (!Reverb.convolver) {
			const PREDELAY = 0.1;
			const DECAYTIME = 2;
			const context = AudioManager.context;
			const duration = PREDELAY + DECAYTIME;
			const sampleRate = context.sampleRate;
			const sampleCount = Math.round(sampleRate * duration);
			const convolver = context.createConvolver();
			const filter = context.createBiquadFilter();
			const buffer = context.createBuffer(2, sampleCount, sampleRate);
			const bufferLength = buffer.length;
			const delayLength = Math.round((bufferLength * PREDELAY) / duration);
			const decayLength = Math.round((bufferLength * DECAYTIME) / duration);
			const random = Math.random;
			for (let i = 0; i < buffer.numberOfChannels; i++) {
				const samples = buffer.getChannelData(i);
				for (let i = 0; i < delayLength; i++) {
					samples[i] = ((random() * 2 - 1) * i) / delayLength;
				}
				for (let i = delayLength; i < bufferLength; i++) {
					const rate = (bufferLength - i) / decayLength;
					samples[i] = (random() * 2 - 1) * rate;
				}
			}
			convolver.buffer = buffer;
			filter.type = 'lowpass';
			filter.frequency.value = 3000;
			convolver.connect(filter);
			filter.connect(AudioManager.analyser);
			Reverb.convolver = convolver;
		}
		return Reverb.convolver;
	}

	static convolver = null;
}
