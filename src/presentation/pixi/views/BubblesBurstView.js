import { SpineView } from "./SpineView"

const LOW_SYMBOLS_WIN_NAMES = [
	"L1",
	"L2",
	"L3",
	"L4",
]
const HIGH_SYMBOLS_WIN_NAMES = [
	"bubbles_H1_win_0",
	"bubbles_H1_win_1",
	"bubbles_H1_win_2",
]
const SYMBOLS_WIN_NAMES = [
	[""], // 0
	LOW_SYMBOLS_WIN_NAMES, // 1
	LOW_SYMBOLS_WIN_NAMES, // 2
	LOW_SYMBOLS_WIN_NAMES, // 3
	LOW_SYMBOLS_WIN_NAMES, // 4
	HIGH_SYMBOLS_WIN_NAMES, // 5
	HIGH_SYMBOLS_WIN_NAMES, // 6
	HIGH_SYMBOLS_WIN_NAMES, // 7
	HIGH_SYMBOLS_WIN_NAMES, // 8
	HIGH_SYMBOLS_WIN_NAMES, // 9
]

const LOW_SYMBOLS_CORRUPTION_NAMES = LOW_SYMBOLS_WIN_NAMES
const HIGH_SYMBOLS_CORRUPTION_NAMES = LOW_SYMBOLS_WIN_NAMES.map(name => name + '_disappear')
const SYMBOLS_CORRUPTION_NAMES = {
	1: LOW_SYMBOLS_CORRUPTION_NAMES,
	2: LOW_SYMBOLS_CORRUPTION_NAMES,
	3: LOW_SYMBOLS_CORRUPTION_NAMES,
	4: LOW_SYMBOLS_CORRUPTION_NAMES,
	5: HIGH_SYMBOLS_CORRUPTION_NAMES,
	6: HIGH_SYMBOLS_CORRUPTION_NAMES,
	7: HIGH_SYMBOLS_CORRUPTION_NAMES,
	8: HIGH_SYMBOLS_CORRUPTION_NAMES,
	11: HIGH_SYMBOLS_CORRUPTION_NAMES,
	22: HIGH_SYMBOLS_CORRUPTION_NAMES,
	33: HIGH_SYMBOLS_CORRUPTION_NAMES,
	44: HIGH_SYMBOLS_CORRUPTION_NAMES,
	55: HIGH_SYMBOLS_CORRUPTION_NAMES,
}

export class BubblesBurstView extends SpineView {
	constructor(resources) {
		super(resources.bubbles.spineData)
	}

	presentSymbolWin(symbolId) {
		const names = SYMBOLS_WIN_NAMES[symbolId]
		return this.playAnimation({
			name: names[Math.trunc(Math.random() * names.length)]
		})
	}

	presentSymbolCorruption(symbolId) {
		const names = SYMBOLS_CORRUPTION_NAMES[symbolId]
		return this.playAnimation({
			name: names[Math.trunc(Math.random() * names.length)]
		})
	}

	reset() {
		this.playAnimation({ name: this.animationsNames[0] })
		this.wind(1)
		this.currentAnimationName = ''
	}
}