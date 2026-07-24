// ******************************** 动画播放器共用类型 ********************************

/**
 * AnimationPlayer 的 motions / sprites / images / textures 字段契约。
 *
 * 替代 animation/animation-player.ts:40-43 的 `Record<string, any>` 残留，
 * 收敛为精确接口。
 */

/** 动作映射（motions[key] → Motion 对象） */
export interface AnimationMotion {
	key: string;
	[key: string]: any;
}

/** 精灵映射（sprites[i] / sprites[spriteId] → Sprite 对象） */
export interface AnimationSprite {
	id: string;
	[key: string]: any;
}

/** 图像 ID 映射（images[spriteId] → imageId 字符串） */
export type AnimationImageMap = Record<string, string>;

/** 纹理映射（textures[spriteId] → Texture 对象 | null，缓存槽） */
export type AnimationTextureMap = Record<string, any | null>;
