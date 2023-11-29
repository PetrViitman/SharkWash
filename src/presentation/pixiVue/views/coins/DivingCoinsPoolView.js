import { AdaptiveContainer } from '../adaptiveDesign/AdaptiveContainer'
import { DivingCoinView } from './DivingCoinView'

export class DivingCoinsPoolView extends AdaptiveContainer {
	coinsViews = []
	progressShiftPerCoin
	
	constructor({
		size = 1000,
		coinsCount = 3,
		resources
	}) {
		super()

		this.initCoins({
			size,
			coinsCount,
			resources
		})

		this.progressShiftPerCoin = 1 / (coinsCount + 1) * 1.75

		this.setSourceArea({width: size, height: size})
			.setTargetArea({x: 0, y: 0, width: 1, height: 1})
			.stretchHorizontally()
			.stretchVertically()
	}

	initCoins({
		size,
		coinsCount,
		resources
	}) {
		const stepX = size / (coinsCount - 1)

		for (let x = 0; x < coinsCount; x ++) {
			const view = new DivingCoinView(resources)
			view.x = x * stepX

			this.addChild(view)
			this.coinsViews.push(view)
		}
	}

	onAdjustedToTargetArea() {
		const { scale: {x, y} } = this;
		const scaleFactor = Math.min(x, y)

		for(const coinView of this.coinsViews)
			coinView.scale.set(
				scaleFactor / x,
				scaleFactor / y)
	}

	setProgress(progress) {
		this.coinsViews.forEach((view, i) => {
			const shiftedProgress = (progress + i * this.progressShiftPerCoin) % 1

			view.setProgress({
				progress: shiftedProgress,
				divingDepth: this.sourceArea.height    
			})
			view.y = this.sourceArea.height * shiftedProgress
		})
	}
}