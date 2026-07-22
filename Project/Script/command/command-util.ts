import { Command } from './command-object.ts';

// ******************************** 指令工具函数 ********************************

// 遍历指令列表中的每个指令
Command.forEachCommand = function (
	commands: any[],
	handler: (command: any) => void
): void {
	const forEach = (commands: any[]): void => {
		for (const command of commands) {
			handler(command);
			switch (command.id) {
				case 'showChoices':
					for (const choice of command.params.choices) {
						forEach(choice.commands);
					}
					continue;
				case 'if':
					for (const branch of command.params.branches) {
						forEach(branch.commands);
					}
					if (command.params.elseCommands) {
						forEach(command.params.elseCommands);
					}
					continue;
				case 'switch':
					for (const branch of command.params.branches) {
						forEach(branch.commands);
					}
					if (command.params.defaultCommands) {
						forEach(command.params.defaultCommands);
					}
					continue;
				case 'loop':
					forEach(command.params.commands);
					continue;
				case 'forEach':
					forEach(command.params.commands);
					continue;
				case 'independent':
					forEach(command.params.commands);
					continue;
				case 'transition':
					forEach(command.params.commands);
					continue;
			}
		}
	};
	forEach(commands);
};

// 词语列表类
// 注：WordList.push 沿用基类 Array.push 的 number 契约（避免 TS2416），
// 链式调用方需分离语句（见 command-tip.ts createCommandTip）
Command.WordList = class WordList extends Array {
	count: number;

	constructor() {
		super();
		this.count = 0;
	}

	push(string: string): number {
		if (string) (this as any)[this.count++] = string;
		return this.count;
	}

	join(joint: string = '$_delimiter_$, $_/_$'): string {
		const length = this.count;
		if (length === 0) {
			return '';
		}
		this.count = 0;
		let string = (this as any)[0];
		for (let i = 1; i < length; i++) {
			string += joint + (this as any)[i];
		}
		return string;
	}
};
