import { Sprite } from 'pixi.js'
import { AdaptiveContainer } from '../views/adaptiveDesign/AdaptiveContainer'
import { Timeline } from '../timeline/Timeline'
import { DivingCoinsPoolView } from './coins/DivingCoinsPoolView'

const TILE_WIDTH = 834

export class BackgroundView extends AdaptiveContainer {
	resources
	tilesCount = 0
	tileViews = []
	tilesContainer
	transitionTimeline = new Timeline
	freeSpinsBackgroundView
	coinsPoolView
	decorationsViews
	isFreeSpinsMode
	coinsTimeline = new Timeline

	constructor({resources, vfxLevel}) {
		super()
		this.resources = resources
		this.initTilesContainer()
		this.initFreeSpinsBackground()
		this.initDecorations(vfxLevel)
		this.setFreeSpinsMode(false)
	}

	initTilesContainer() {
		this.tilesContainer = this.addChild(new AdaptiveContainer)
		this.tilesContainer
			.setSourceArea({width: 1, height: 759})
			.setTargetArea({
				x: 0,
				y: 0,
				width: 1,
				height: 1,
			})
			.stickTop()
		this.getTileView(0)
	}

	initFreeSpinsBackground() {
		this.freeSpinsBackgroundView = this.addChild(new AdaptiveContainer)
		const sprite = new Sprite(this.resources.background_free_spins)
		sprite.anchor.x = 0.5

		this.freeSpinsBackgroundView.addChild(sprite)
	}

	getTileView(index) {
		const {tileViews, tilesContainer} = this

		if (!tileViews[index]) {
			const sprite = new Sprite(this.resources.background_tile)      
			tilesContainer.addChild(sprite).anchor.x = 0.5            
			this.tileViews[index] = sprite
		}

		return tileViews[index]
	}

	initDecorations(vfxLevel) {
		const { resources } = this
		// LEFT...
		const leftDecorationView = this.addChild(new AdaptiveContainer)
		let sprite = leftDecorationView.addChild(new Sprite(resources.background_border_rock))
		leftDecorationView.setSourceArea({width: 1500, height: 877})
		leftDecorationView.setTargetArea({x: 0, y: 0, width: 1, height: 1})
		leftDecorationView.stickLeft()
		// ...LEFT

		// RIGHT...
		const rightDecorationView = this.addChild(new AdaptiveContainer)
		sprite = new Sprite(resources.background_border_rock)
		rightDecorationView.addChild(sprite)
		sprite.scale.x = -1
		sprite.x = 1500
		rightDecorationView.setSourceArea({width: 1500, height: 877})
		rightDecorationView.setTargetArea({x: 0, y: 0, width: 1, height: 1})
		rightDecorationView.stickRight()

		//BLINKING POINTER...
		sprite = new Sprite(resources.background_pointer_bg)
		sprite.position.set(1400, 120)
		rightDecorationView.addChildAt(sprite, 0)
		sprite = new Sprite(resources.background_pointer)
		sprite.position.set(1400, 120)
		rightDecorationView.addChild(sprite)
		this.coinsTimeline
			.addAnimation({
				duration: 1000,
				onProgress: (progress) => {
					sprite.alpha = Math.abs(Math.cos(progress * Math.PI * 2))
				}
			})
			.setLoopMode()
			.play()
		// ...BLINKING POINTER
		// ...RIGHT

		this.decorationsViews = [
			leftDecorationView,
			rightDecorationView,
		]

		// COINS...
		if(vfxLevel < 0.65) return

		this.coinsPoolView = this
			.addChild(new DivingCoinsPoolView({
				coinsCount: 10,
				size: 1000,
				resources
			}))
			.setTargetArea({
				x: 0.05,
				y: 0,
				width: 0.9,
				height: 0.65,
			})

		new Timeline()
			.addAnimation({
				duration: 10000,
				onProgress: (progress) => {
					this.coinsPoolView.setProgress(progress)
				}
			})
			.setLoopMode()
			.play()
		// ...COINS
	}

	updateTargetArea(sidesRatio) {
		if(sidesRatio > 1.5) {
			this.decorationsViews.forEach(view => view.visible = !this.isFreeSpinsMode)
			this.freeSpinsBackgroundView
				.setSourceArea({width: 1, height: 1500})
				.setTargetArea({
					x: -1,
					y: -1.2,
					width: 3,
					height: 3,
				})
				.stickMiddle()
		} else if(sidesRatio > 0.6) {
			this.decorationsViews.forEach(view => view.visible = !this.isFreeSpinsMode)
			this.freeSpinsBackgroundView
				.setSourceArea({width: 1, height: 1500})
				.setTargetArea({
					x: -0.5,
					y: -0.8,
					width: 2,
					height: 2,
				})
				.stickMiddle()
		} else {
			this.decorationsViews.forEach(view => view.visible = false)
			this.freeSpinsBackgroundView
				.setSourceArea({width: 1, height: 1500})
				.setTargetArea({
					x: 0,
					y: 0,
					width: 1,
					height: 0.9,
				})
				.stickMiddle()
		}

		// COINS...
		if (!this.coinsPoolView) return
		const isCoinsPoolRequired = !this.isFreeSpinsMode && sidesRatio > 0.75
		this.coinsPoolView.visible = isCoinsPoolRequired
		
		if(isCoinsPoolRequired)
			this.coinsTimeline.play()
		else
			this.coinsTimeline.pause()
		// ...COINS
	}

	onAdjustedToTargetArea() {
		const { tileViews, tilesContainer} = this
		const finalTileWidth = TILE_WIDTH * tilesContainer.scale.x
		const remainingSpace = (AdaptiveContainer.width - finalTileWidth) / 2

		const expansionLength = Math.min(20, Math.ceil(remainingSpace / finalTileWidth))

		tileViews.forEach((tileView) => {
			tileView.visible = false
		})
		this.tileViews[0].visible = true
		this.tilesCount = 1

		for (let i = 1; i <= expansionLength; i++) {
			const tileView = this.getTileView(this.tilesCount)
			tileView.x = i * TILE_WIDTH
			tileView.visible = true
			this.tilesCount++

			const tileView2 = this.getTileView(this.tilesCount)
			tileView2.x = -i * TILE_WIDTH
			tileView2.visible = true
			this.tilesCount++
		}
	}

	setFreeSpinsMode(isFreeSpinsMode = true) {
		this.isFreeSpinsMode = isFreeSpinsMode
		this.tilesContainer.visible = !isFreeSpinsMode
		this.freeSpinsBackgroundView.visible = isFreeSpinsMode
		this.decorationsViews.forEach(view => view.visible = !isFreeSpinsMode)

		if(this.coinsPoolView)
			this.coinsPoolView.visible = !isFreeSpinsMode

		this.onResize()
	}
}
