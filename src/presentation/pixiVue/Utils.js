import { CELLS_PER_REEL_COUNT, RANDOM_SYMBOLS_IDS, REELS_COUNT } from "./Constants"

export function getRandomSymbolId() {
	return RANDOM_SYMBOLS_IDS[
		Math.trunc(Math.random() * RANDOM_SYMBOLS_IDS.length)
	]
}

export function generateMatrix(width = REELS_COUNT, height = CELLS_PER_REEL_COUNT) {
	return new Array(width).fill(0).map(_ => new Array(height).fill(0))
}

export function formatMoney(value) {
	return value.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')
}