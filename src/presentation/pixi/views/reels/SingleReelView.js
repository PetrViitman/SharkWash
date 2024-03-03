import { Container } from 'pixi.js'
import { ReelCellView } from './cell/ReelCellView'
import { getRandomSymbolId } from '../../Utils'
import { Timeline } from '../../timeline/Timeline'
import { TensionView } from './TensionView'
import {
	CELLS_PER_REEL_COUNT,
	CELL_HEIGHT,
	CELL_WIDTH,
	DEFAULT_REEL_POSSIBLE_SYMBOLS_IDS,
	REELS_HEIGHT,
	SCATTER_SYMBOL_ID
} from '../../Constants'
import { ReelHitEffect } from './ReelHitEffectView'

export class SingleReelView extends Container {
	cellsContainer
	cellsViews = []
	hitEffectView
	targetSymbols
	spinTimeline = new Timeline
	spinAccelerationTimeline = new Timeline
	spinFinishTimeline = new Timeline

	constructor({
		resources,
		vfxLevel,
		initialSymbolsIds = new Array(CELLS_PER_REEL_COUNT).fill(0),
		possibleSymbolsIds = DEFAULT_REEL_POSSIBLE_SYMBOLS_IDS
	}) {
		super()

		this.initCells({
			resources,
			vfxLevel,
			initialSymbolsIds: [
				getRandomSymbolId(),
				...initialSymbolsIds
			],
			possibleSymbolsIds,
		})

		this.initTension(resources)
		this.initHitEffect(resources, vfxLevel)
	}

	initCells({
		resources,
		vfxLevel,
		initialSymbolsIds,
		possibleSymbolsIds
	}) {
		const {cellsViews} = this
		const offsetY = CELL_HEIGHT / 2

		this.cellsContainer = this.addChild(new Container)

		for (let i = -1; i < CELLS_PER_REEL_COUNT; i++) {
			const cellView = new ReelCellView({
				possibleSymbolsIds,
				resources,
				vfxLevel
			})
			cellView.x = CELL_WIDTH / 2
			cellView.y = CELL_HEIGHT * i + offsetY
			cellView.presentSymbol(initialSymbolsIds[i + 1])
			cellView.setWildCapacity(1)
			cellsViews.push(this.cellsContainer.addChild(cellView))
		}

		cellsViews[0].visible = false
	}

	initTension(resources) {
		this.tensionView = this.addChild(new TensionView(resources))
		this.tensionView.x = CELL_WIDTH / 2
		this.tensionView.y = REELS_HEIGHT / 2
		this.tensionView.alpha = 0
	}

	initHitEffect(resources, vfxLevel) {
		if(vfxLevel < 0.5) return

		this.hitEffectView = new ReelHitEffect(resources)
		this.hitEffectView.position.set(CELL_HEIGHT / 2, REELS_HEIGHT)
		this.addChild(this.hitEffectView)
	}

	preRenderSymbols() {
		this.cellsViews.forEach(cellView =>
			cellView.preRenderSymbols())
	}

	onPreRendered() {
		this.cellsViews.forEach(cellView =>
			cellView.onPreRendered())
	}
	
	// API...
	getAllCellsWithSymbolId(symbolId) {
		const views = []

		for(let y = 0; y < CELLS_PER_REEL_COUNT; y++)
			this.cellsViews[y + 1].currentSymbolId === symbolId
				&& views.push(this.cellsViews[y + 1])

		return views
	}

	setTimeScale(scale) {
		const scaleDescriptor = {name: 'scale', value: scale}

		this.spinTimeline.setTimeScaleFactor(scaleDescriptor) 
		this.spinAccelerationTimeline.setTimeScaleFactor(scaleDescriptor) 
		this.spinFinishTimeline.setTimeScaleFactor(scaleDescriptor)
		this.tensionView.setTimeScale(scale)

		for(let i = 1; i <= CELLS_PER_REEL_COUNT; i++)
			this.cellsViews[i].setTimeScale(scale)
	}

	reset() {
		const {
			spinTimeline,
			spinAccelerationTimeline,
			spinFinishTimeline,
		} = this

		spinTimeline.isPlaying && spinTimeline.wind(1)
		spinAccelerationTimeline.isPlaying && spinAccelerationTimeline.wind(1)
		spinFinishTimeline.isPlaying && spinFinishTimeline.wind(1)

		this.cellsViews.forEach((view, i) => {
			view.reset()
			view.visible = !!i
		})
	}

	async presentSpinStart(delay) {
		const { cellsViews, cellsContainer} = this

		// DELAYED RALL BACK...
		await this
			.spinTimeline
			.deleteAllAnimations()
			.addAnimation({
				delay: delay || 1,
				duration: 300,
				onDelayFinish: () => this.targetSymbols = undefined,
				onProgress: (progress) => cellsContainer.pivot.y = progress ** 2 * CELL_HEIGHT * 0.5,
				onFinish: () => cellsViews[0].visible = true
			})
			.setLoopMode(false)
			.play()
		// ...DELAYED RALL BACK

		// ACCELERATION...
		this.spinAccelerationTimeline
			.deleteAllAnimations()
			.addAnimation({
				duration: 250,
				onProgress: (progress) => {
					this.spinTimeline.setTimeScaleFactor({
						name: 'acceleration',
						value: 1 + progress * 4
					})
					this.cellsViews.forEach((view) =>
						view.setBlur(progress))
				}
			})
			.windToTime(1)
			.play()
		// ...ACCELERATION

		// INFINITE SPIN...
		this.spinTimeline
			.deleteAllAnimations()
			.addAnimation({
				duration: 300,
				onProgress: (progress) => {
					cellsContainer.y = progress * CELL_HEIGHT * this.scale.y

					// RALL BACK REVET...
					if(cellsContainer.pivot.y > 0)
						cellsContainer.pivot.y = (1 - progress) * CELL_HEIGHT * 0.5
					// ...RALL BACK REVET

					this.targetSymbols
					&& this.targetSymbols.length === 1
					&& cellsViews.forEach(view => view.setBlur(1 - progress))
				},
				onFinish: () => {
					cellsViews[0].setWildCapacity(1)
					cellsViews[0].setScatterLocked()
					// SYMBOLS SWAP...
					cellsContainer.y = 0
					for (let i = cellsViews.length - 1; i >= 1; i--) {
						cellsViews[i].presentSymbol(cellsViews[i - 1].currentSymbolId)
						cellsViews[i].setWildCapacity(cellsViews[i - 1].getRemainingWildCapacity())
						cellsViews[i].setScatterLocked(cellsViews[i - 1].isScatterLocked())
					}
					// ...SYMBOLS SWAP

					// NEXT TOP SYMBOL...
					cellsViews[0].presentSymbol(this.targetSymbols?.pop() ?? getRandomSymbolId())
					// ...NEXT TOP SYMBOL


					// STOP ON TARGET SYMBOLS...
					if(this.targetSymbols && !this.targetSymbols.length) 
						this.spinTimeline.setLoopMode(false)
					// ...STOP ON TARGET SYMBOLS
				}
			})
			.setLoopMode()
			.play()
		// ...INFINITE SPIN
	}

	async presentSpinStop({
		symbolsIds = [0, 0, 0, 0],
		delay,
		tensionDuration
	}) {
		if(!this.spinTimeline.isPlaying
			&& !this.spinTimeline.isPlaying)
				return
		
		// TENSION...
		delay && await this.tensionView.present({
			delay: delay - tensionDuration,
			duration: tensionDuration
		})
		// ...TENSION

		// WAIT TILL STOP ON TARGET SYMBOLS... 
		this.targetSymbols = [getRandomSymbolId(), ...symbolsIds]
		await this.spinTimeline.play()
		this.hitEffectView?.presentHit()
		// ...WAIT TILL STOP ON TARGET SYMBOLS

		// FLEX UP-DOWN...
		await this
			.spinTimeline
			.deleteAllAnimations()
			.addAnimation({
				duration: 300,
				onProgress: (progress) => {
					const subProgress = progress > 0.5
						? 1 - (progress - 0.5) * 2
						: progress * 2

					this.cellsContainer.pivot.y = subProgress * CELL_HEIGHT * 0.25
				},
			})
			.setTimeScaleFactor({
				name: 'acceleration',
				value: 1
			})
			.play()
		// ...FLEX UP-DOWN

		delay && this.tensionView.hide()
		this.getAllCellsWithSymbolId(SCATTER_SYMBOL_ID)
			.forEach(view => view.presentScatterTeasing())
	}

	presentSymbol(symbolId, y) {
		this.cellsViews[y + 1].presentSymbol(symbolId)
	}

	presentWin(map = [1, 1, 1, 1]) {
		const { cellsViews } = this

		return Promise.all(map.map((value, y) => {
			if (value) return cellsViews[y + 1].presentWin()
		}))
	}

	presentCascade({
		y,
		distance,
		symbolId,    
	}) {
		const droppedCellView = this.cellsViews[y - distance + 1]
		const targetCellView = this.cellsViews[y + 1]
		const wildCapacity = droppedCellView?.getRemainingWildCapacity()
		const isScatterLocked = droppedCellView?.isScatterLocked()

		targetCellView.setWildCapacity(wildCapacity)
		targetCellView.setScatterLocked(isScatterLocked)
		droppedCellView?.presentSymbol(0)

		return targetCellView.presentFallIn({ symbolId, distance })
	}
	// ...API
}
