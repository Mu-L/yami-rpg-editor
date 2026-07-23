// ******************************** 跑马灯区域共用类型 ********************************

/**
 * MarqueeArea 的 saveData 字段契约。
 *
 * 替代 components/marquee-area.ts:14 的 `Record<string, any>` 残留，
 * 收敛为精确接口。saveData[key] = {x, y, width, height, scaleX, scaleY}。
 */
export interface MarqueeSaveData {
	x: number;
	y: number;
	width: number;
	height: number;
	scaleX: number;
	scaleY: number;
}

/** saveData 完整契约（key → 状态快照或 null） */
export type MarqueeSaveMap = Record<string, MarqueeSaveData | null>;
