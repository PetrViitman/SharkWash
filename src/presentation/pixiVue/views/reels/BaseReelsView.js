import { Container, Graphics } from 'pixi.js'
import { SingleReelView } from './SingleReelView'
import { AdaptiveContainer } from '../adaptiveDesign/AdaptiveContainer'
import { Timeline } from '../../timeline/Timeline'
import { generateMatrix } from '../../Utils'
import {
	CELLS_PER_REEL_COUNT,
	CELL_WIDTH,
	POSSIBLE_REELS_SYMBOLS,
	REELS_COUNT,
	REELS_HEIGHT,
	REELS_WIDTH,
	SCATTER_SYMBOL_ID
} from '../../Constants'

export class BaseReelsView extends AdaptiveContainer {
	reelsMask
	reelsContainer
	reelsViews = []
	winTimeline = new Timeline

	constructor({
		initialSymbolsIds,
		resources,
		vfxLevel,
	}) {
		super()
		this.setSourceArea({
			width: REELS_WIDTH,
			height: REELS_HEIGHT,
		})
		this.setTargetArea({
			x: 0, y: 0, width: 1, height: 1,
		})

		this.initReels({
			initialSymbolsIds,
			resources,
			vfxLevel,
		})

		this.initMask({
			width: REELS_WIDTH,
			height: REELS_HEIGHT
		})
	}

	initReels({
		initialSymbolsIds,
		resources,
		vfxLevel,
	}) {
		const container = new Container()

		container.pivot.y = REELS_HEIGHT / 2
		container.y = REELS_HEIGHT / 2

		for (let i = 0; i < REELS_COUNT; i++) {
			const reelView = new SingleReelView({
				initialSymbolsIds: initialSymbolsIds[i],
				resources,
				vfxLevel,
				possibleSymbolsIds: POSSIBLE_REELS_SYMBOLS[i]
			})

			reelView.x = i * CELL_WIDTH
			this.reelsViews.push(container.addChildAt(reelView, i))
		}

		this.reelsMask = container.mask
		this.reelsContainer = this.addChild(container)
	}

	initMask({ x = 0, y = 0, width, height }) {
		const {reelsContainer} = this

		reelsContainer.mask = reelsContainer.addChild(new Graphics())
			.beginFill(0x550055)
			.drawRect(x, y, width, height)
			.endFill()

		this.reelsMask = reelsContainer.mask
	}

	// API...
	preRenderSymbols() {
		this.reelsViews.forEach(reelView =>
			reelView.preRenderSymbols())
	}

	onPreRendered() {
		this.reelsViews.forEach(reelView =>
			reelView.onPreRendered())
	}

	reset() {
		this.winTimeline
			.wind(0, false)
			.pause()
			.deleteAllAnimations()

		this.reelsViews.forEach((view) => view.reset())
	}

	getCurrentSymbolsIds() {
		return generateMatrix()
			.map((column, x) => column
				.map((_, y) => this.reelsViews[x].cellsViews[y + 1].currentSymbolId)) 
	}

	getAllCellsWithSymbolId(symbolId) {
		return [].concat(...this.reelsViews
			.map(view => view.getAllCellsWithSymbolId(symbolId)))
	}

	setBrightness({
		key = 1,
		map = [
			[1, 1, 1, 1],
			[1, 1, 1, 1],
			[1, 1, 1, 1],
			[1, 1, 1, 1],
			[1, 1, 1, 1],
		],
		brightness = 0.25
	}) {
		for(let x = 0; x < map.length; x++)
			for(let y = 0; y < map[0].length; y++)
				if(map[x][y] === key)
					this.reelsViews[x].cellsViews[y + 1]
						.setBrightness(brightness)
	}

	setMasked(isMasked = true) {
		const {reelsContainer, reelsMask} = this

		reelsMask.visible = isMasked
		reelsContainer.mask = isMasked ? reelsMask : null

		this.reelsViews.forEach(reelView =>
			reelView.cellsViews[0].visible = isMasked)
	}

	presentSpinStart() {
		this.reset()
		this.setMasked()

		return Promise.all(
			this.reelsViews.map((view, i) => 
				view.presentSpinStart(i * 100)))        
	}

	presentSpinStop({
		targetSymbolsIds = generateMatrix(),
		ignoreTension = false
	}) {
		let scattersCount = 0
		let tensionReelsCount = 0
		
		return Promise.all(
			this.reelsViews.map((reel, i) => {
				if (scattersCount > 1) tensionReelsCount++
				
				for(let y = 0; y < targetSymbolsIds[i].length; y++)
					if(targetSymbolsIds[i][y] === SCATTER_SYMBOL_ID)
						scattersCount++

				return reel.presentSpinStop({
					symbolsIds: targetSymbolsIds[i],
					delay: ignoreTension ? 0 : tensionReelsCount * 1500,
					tensionDuration: 1000
				}) 
			}))
	}

	async presentWin(winMap) {
		this.reset()
		this.setMasked(false)
		return this
			.winTimeline
			.deleteAllAnimations()
			.addAnimation({
				duration: 300,
				onProgress: (progress) => {
					this.setBrightness({
						key: 0,
						map: winMap,
						brightness: 1 - progress
					})
				},
				onFinish: () => {
					winMap.forEach((reelMap, i) => this.reelsViews[i].presentWin(reelMap))
				}
			})
			.addAnimation({
				delay: 1300,
				duration: 300,
				onProgress: (progress) => {
					this.setBrightness({
						key: 0,
						map: winMap,
						brightness: progress
					})
				}
			})
			.wind(0)
			.play()
	}

	async presentCascade({
		corruptionMap = [
			[0, 1, 0, 1],
			[1, 0, 0, 0],
			[1, 1, 0, 0],
			[0, 0, 0, 0],
			[0, 0, 1, 0],
		],
		patchMap = [
			[5, 5],
			[5],
			[5, 5],
			[],
			[5],
		],
	}) {
		this.setMasked()
		const currentSymbolsIds = this.getCurrentSymbolsIds()

		// MAPPING CASCADE...
		const cascadeMap = generateMatrix()
		for (let x = 0; x < REELS_COUNT; x++) {
			let distance = 0
			for (let y = CELLS_PER_REEL_COUNT - 1; y >= 0; y--) {    
				if(corruptionMap[x][y] > 0) {
					distance++
					cascadeMap[x][y] = 0
				} else {
					cascadeMap[x][y + distance] = distance
				}
			}
		}
		// ...MAPPING CASCADE

		// CORRUPTION...
		this.setMasked(false)
		let promises = []
		for (let x = 0; x < cascadeMap.length; x++)
			for(let y = CELLS_PER_REEL_COUNT - 1; y >= 0; y--)
				corruptionMap[x][y] > 0
					&& promises.push(
						this.reelsViews[x]
							.cellsViews[y + 1]
							.presentCorruption())
		await Promise.all(promises)

		this.setMasked()
		// ...CORRUPTION
		
		// FALL...
		promises = []
		for (let x = 0; x < cascadeMap.length; x++)
			for(let y = CELLS_PER_REEL_COUNT - 1; y >= 0; y--)
				cascadeMap[x][y]
				&& promises.push(
					this.reelsViews[x]
						.presentCascade({
							y,
							distance: cascadeMap[x][y],
							symbolId: currentSymbolsIds[x][y - cascadeMap[x][y]]
						}))

		await Promise.all(promises)
		// ...FALL

		// PATCH...
		promises = []
		for (let x = 0; x < patchMap.length; x++)
			for(let y = patchMap[x].length - 1; y >= 0; y--)
				promises.push(
					this.reelsViews[x]
						.presentCascade({
								y,
								distance: CELLS_PER_REEL_COUNT,
								symbolId: patchMap[x][y]
						}))
		
		await Promise.all(promises)
		// ...PATCH
	}

	presentScattersUnlock() {
		const cellsViews = this.getAllCellsWithSymbolId(SCATTER_SYMBOL_ID)

		return Promise.all(cellsViews.map(view => view.presentScatterUnlcok()))
	}

	setTimeScale(scale) {
		for(const reelView of this.reelsViews)
			reelView.setTimeScale(scale)

		this.winTimeline.setTimeScaleFactor({name: 'scale', value: scale})
	}
	// ...API
}
