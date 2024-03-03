export const CELL_WIDTH = 220
export const CELL_HEIGHT = 220
export const REELS_COUNT = 5
export const CELLS_PER_REEL_COUNT = 4
export const REELS_WIDTH = REELS_COUNT * CELL_WIDTH
export const REELS_HEIGHT = CELLS_PER_REEL_COUNT * CELL_HEIGHT
export const SCATTER_SYMBOL_ID = 9
export const SYMBOLS_IDS = [
	0,// Empty
	1,// Low value
	2,// Low value
	3,// Low value
	4,// Low value
	5,// High value
	6,// High value
	7,// High value
	8,// High value
	SCATTER_SYMBOL_ID,// Scatter
	11,// Wild x1
	// 22 as Wild x2
	// 33 as Wild x3
	// 44 as Wild x4
	// 55 as Wild x5
]
export const WILD_POWER_MAP = {
	11: 1,// Wild x1
	22: 2,// Wild x2
	33: 3,// Wild x3
	44: 4,// Wild x4
	55: 5,// Wild x5
}

export const RANDOM_SYMBOLS_IDS = [1, 2, 3, 4, 5, 6, 7, 8, SCATTER_SYMBOL_ID]
export const MAX_WILD_POWER = 5
export const TURBO_MODE_TIME_SCALE = 2

export const DEFAULT_REEL_POSSIBLE_SYMBOLS_IDS = SYMBOLS_IDS.slice(0, SYMBOLS_IDS.length -1)
export const WILD_REEL_POSSIBLE_SYMBOLS_IDS = SYMBOLS_IDS
export const POSSIBLE_REELS_SYMBOLS = [
	DEFAULT_REEL_POSSIBLE_SYMBOLS_IDS,
	WILD_REEL_POSSIBLE_SYMBOLS_IDS,
	WILD_REEL_POSSIBLE_SYMBOLS_IDS,
	WILD_REEL_POSSIBLE_SYMBOLS_IDS,
	DEFAULT_REEL_POSSIBLE_SYMBOLS_IDS,
]
export const WIN_COEFFICIENTS = {
	BIG: 5,
	HUGE: 10,
	MEGA: 15,
}