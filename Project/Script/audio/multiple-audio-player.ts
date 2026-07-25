import { AudioManager } from './audio-manager.ts';

// HTMLAudioElement 运行时挂载的扩展字段（getAudio 内赋值）
interface MultipleAudioElement extends HTMLAudioElement {
	onStop: () => void;
	source: MediaElementAudioSourceNode;
	guid: string;
}

export class MultipleAudioPlayer {
	audioPool: MultipleAudioElement[];
	audios: MultipleAudioElement[];

	constructor() {
		this.audioPool = [];
		this.audios = [];
	}

	getAudio(): MultipleAudioElement {
		let audio = this.audioPool.pop();
		if (audio === undefined) {
			audio = new Audio() as unknown as MultipleAudioElement;
			const source = AudioManager.context.createMediaElementSource(audio);
			const onStop = () => {
				if (this.audios.remove(audio)) {
					this.audioPool.push(audio);
					source.disconnect(AudioManager.context.destination);
				}
			};
			audio.onStop = onStop;
			audio.autoplay = true;
			audio.source = source;
			audio.on('ended', onStop);
			audio.on('error', onStop);
		}
		this.audios.push(audio);
		audio.source.connect(AudioManager.context.destination);
		return audio;
	}

	getRecentlyAudio(guid: string): MultipleAudioElement | undefined {
		for (const audio of this.audios) {
			if (audio.guid === guid && audio.currentTime < 0.05) {
				return audio;
			}
		}
		return undefined;
	}
}
