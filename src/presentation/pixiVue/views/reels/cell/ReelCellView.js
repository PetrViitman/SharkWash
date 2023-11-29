import { Container } from 'pixi.js'
import { BaseSymbolView } from './symbols/BaseSymbolView'
import { Timeline } from '../../../timeline/Timeline'
import { CELL_HEIGHT, DEFAULT_REEL_POSSIBLE_SYMBOLS_IDS, SCATTER_SYMBOL_ID, SYMBOLS_IDS, WILD_POWER_MAP } from '../../../Constants'
import { BubblesBurstView } from '../../BubblesBurstView'
import { WildSymbolView } from './symbols/WildSymbolView'
import { ScatterSymbolView } from './symbols/ScatterSymbolView'

export class ReelCellView extends Container {
	symbolsViews
	bubblesBurstView
	currentSymbolId
	cascadeTimeline = new Timeline
	corruptionTimeline = new Timeline
	blurStrength = 0

	constructor({
		possibleSymbolsIds = DEFAULT_REEL_POSSIBLE_SYMBOLS_IDS,
		resources, 
		vfxLevel
	}) {
		super()

		this.initSymbols({possibleSymbolsIds, resources, vfxLevel})
		this.initBubbles(resources, vfxLevel)
	}

	initSymbols({possibleSymbolsIds, resources, vfxLevel}) {
		this.symbolsViews = possibleSymbolsIds.map(id => {
			if(id > SCATTER_SYMBOL_ID)
				return this.addChild(new WildSymbolView({id, resources}))
			if(id === SCATTER_SYMBOL_ID)
				return this.addChild(new ScatterSymbolView({id, resources}))
	
			return this.addChild(new BaseSymbolView({id, resources, vfxLevel}))
		})
	}

	initBubbles(resources, vfxLevel) {
		if(vfxLevel < 0.15) return

		this.bubblesBurstView = this.addChild(new BubblesBurstView(resources))
		this.bubblesBurstView.rotation = Math.random() * Math.PI * 2
	}

	getSymbolView(symbolId = this.currentSymbolId) {
		const { symbolsViews } = this

		return symbolsViews[SYMBOLS_IDS[symbolId] ?? symbolsViews.length - 1]
	}

	preRenderSymbols() {
		this.symbolsViews.forEach(view => view.setVisible(true))
	}

	onPreRendered() {
		this.isPreRendered = true
		this.symbolsViews.forEach(view => view.setVisible(false))
		this.presentSymbol(this.currentSymbolId)
	}

	// API...
	reset() {
		this.corruptionTimeline.wind(0).pause()
	}

	setTimeScale(scale) {
		const timeScaleDescriptor = {
			name: 'scale',
			value: scale
		}
		this.cascadeTimeline.setTimeScaleFactor(timeScaleDescriptor)
		this.corruptionTimeline.setTimeScaleFactor(timeScaleDescriptor)
		this.bubblesBurstView?.setTimeScale(timeScaleDescriptor)
		for(const view of this.symbolsViews)
			view.setTimeScale?.(scale)
	}

	getRemainingWildCapacity() {
		return this.getSymbolView(-1).remainingWildCapacity
	}

	setWildCapacity(capacity = 1) {
		const wildSymbolView = this.getSymbolView(-1)
		wildSymbolView.remainingWildCapacity = capacity
		wildSymbolView.reset?.()
	}

	isScatterLocked() {
		return this.getSymbolView(SCATTER_SYMBOL_ID).isLocked
	}

	setScatterLocked(isLocked = true) {
		const scatterView = this.getSymbolView(SCATTER_SYMBOL_ID)
		scatterView.setLocked(isLocked)
	}

	setBlur(strength = 1) {
		this.blurStrength = strength
		this.getSymbolView()
			.setBlur(strength)
	}

	setBrightness(brightness = 1) {
		this.getSymbolView()
			.setBrightness(brightness)
	}

	presentSymbol(symbolId) {
		const previousSymbolView = this.getSymbolView()
		previousSymbolView?.setVisible(false)

		const nextSymbolView = this.getSymbolView(symbolId)
		nextSymbolView.setVisible()
		nextSymbolView.reset?.(WILD_POWER_MAP[symbolId])
		nextSymbolView?.setBlur(this.blurStrength)
		this.currentSymbolId = symbolId
	}

	presentWin() {
		this.reset()
		const symbolView = this.getSymbolView()

		return Promise.all([
			this.bubblesBurstView?.presentSymbolCorruption(this.currentSymbolId),
			symbolView.presentWildCapacityDrain?.()
			?? symbolView.presentAnimation({index: 0})
		])
	}

	presentScatterTeasing() {
		this.reset()
		this.getSymbolView(SCATTER_SYMBOL_ID).presentTeasing()
	}

	presentScatterUnlcok() {
		return Promise.all([
			this.getSymbolView(SCATTER_SYMBOL_ID).presentUnclock(),
			this.bubblesBurstView?.presentSymbolCorruption(1)
		])
	}

	async presentCorruption() {
		this.reset()
		const symbolView = this.getSymbolView()

		const scaleOffset = 0.05 + 0.1 * Math.random()
		const skew = 0.1 + 0.15 * Math.random() * (Math.random() > 0.5 ? -1: 1)
		const pivotXOffset = 5 + 20 * Math.random() * (Math.random() > 0.5 ? -1: 1)
		const pivotYOffset = 10 + 20 * Math.random() * (Math.random() > 0.5 ? -1: 1)
		

		this.bubblesBurstView?.presentSymbolCorruption(this.currentSymbolId)
		symbolView.presentCorruption()
		
		await Promise.all([	
			this.corruptionTimeline
				.deleteAllAnimations()
				.addAnimation({
					duration: 750,
					onProgress: (progress) => {
						const reversedProgress = (1 - progress)
						const symbolView = this.getSymbolView()
						this.alpha = reversedProgress

						const skewProgress = Math.sin(Math.PI * 2 * ((progress * 3) % 1)) * reversedProgress
						const scaleProgress = Math.sin(Math.PI * 2 * ((progress * 2) % 1)) * reversedProgress
						const pivotXProgress = Math.abs(Math.sin(Math.PI * 2 * ((progress * 2) % 1))) * reversedProgress
						const pivotYProgress = Math.abs(Math.sin(Math.PI * 2 * progress)) * reversedProgress

						symbolView.skew.x = skew * skewProgress
						symbolView.scale.y = 1 + scaleOffset * scaleProgress
						symbolView.pivot.x = pivotXOffset * pivotXProgress
						symbolView.pivot.y = pivotYOffset * pivotYProgress
					}
				})
				.play()
		])

		symbolView.resetBody()
	}

	presentFallIn({symbolId = 0, distance = 0}) {
		this.reset()

		if(!distance) return this.presentSymbol(0)
		
		this.presentSymbol(symbolId)
		const symbolView =  this.getSymbolView()
		const finalDistance = distance * CELL_HEIGHT
		const fallDuration = distance * 100

		return this
			.cascadeTimeline
			.deleteAllAnimations()
			.addAnimation({
				duration: fallDuration,
				onProgress: (progress) => {
					symbolView.y = -finalDistance * (1 - progress ** 2)
				}
			})
			.addAnimation({
				delay: fallDuration,
				duration: 250,
				onProgress: (progress) => {
					const subProgress = progress > 0.5
						? 1 - (progress - 0.5) * 2
						: progress * 2

					symbolView.y = subProgress * -CELL_HEIGHT * 0.25
				}
			})
			.windToTime(1)
			.play()
	}
	// ...API
}
