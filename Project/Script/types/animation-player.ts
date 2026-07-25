// AnimationPlayer 的 motions / sprites / images / textures 字段契约。 替代 animation/animation-player.ts:40-43 的 `Record<string, any>` 残留， 收敛为精确接口。

export interface AnimationMotion {
	key: string;
	[key: string]: any;
}

export interface AnimationSprite {
	id: string;
	[key: string]: any;
}

export type AnimationImageMap = Record<string, string>;

export type AnimationTextureMap = Record<string, any | null>;
