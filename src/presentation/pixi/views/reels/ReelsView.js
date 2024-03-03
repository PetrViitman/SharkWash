import { Container, Graphics, Sprite } from "pixi.js"
import { BaseReelsView } from "./BaseReelsView"
import { WinTabloidView } from "./WinTabloidView"
import { CounterView } from "./CounterView"
import { ReSpinAwardView } from "./ReSpinAwardView"
import { PayoutsInfoPanelView } from "./PayoutsInfoPanelView"
import { Timeline } from "../../timeline/Timeline"
import {
	CELL_HEIGHT,
	CELL_WIDTH,
	REELS_COUNT,
	REELS_HEIGHT,
	REELS_WIDTH,
	SCATTER_SYMBOL_ID,
	WILD_POWER_MAP
} from "../../Constants"

export class ReelsView extends BaseReelsView {
	interactiveView
	payoutsInfoPanelView
	reSpinAwardView
	winTabloidView
	multiplierView
	freeSpinsCounterView
	commonFreeSpinsPayoutIndicatorView
	frameView
	freeSpinsFrameView
	isFreeSpinMode
	blackoutView
	isMobileDevice
	camera
	cameraTimeline = new Timeline

	constructor({
		initialSymbolsIds,
		resources,
		dictionary,
		coefficients,
		vfxLevel,
		isMobileDevice,
		camera
	}) {
		super({
			initialSymbolsIds,
			resources,
			vfxLevel
		})

		this.isMobileDevice = isMobileDevice
		this.camera = camera
		this.initFrame(resources)
		this.bringWinBoxesToFront()
		this.initPayoutsInfoPanel(resources, coefficients)
		this.initFreeSpinsCounter(resources, dictionary)
		this.initTotalWinIndicator(resources, dictionary)
		this.initWinTabloid(resources)
		this.initReSpinAward(dictionary)
		this.setFreeSpinsMode(false)
		this.setupInteractivity()
	}

	initFrame(resources) {
		const backgroundWidth = REELS_WIDTH + 25
		const backgroundHeight = REELS_HEIGHT + 25
		const container = this.addChildAt(new Container, 0)
	
		// SOLID COLOR BACKGROUND...
		container.addChild(new Graphics())
			.beginFill(0x2b3143)
			.drawRect(
				-backgroundWidth / 2,
				-backgroundHeight / 2,
				backgroundWidth,
				backgroundHeight)
			.endFill()
			.position.set(REELS_WIDTH / 2, REELS_HEIGHT / 2)
		// ...SOLID COLOR BACKGROUND

		// SEPARATORS BETWEEN REELS...
		for(let i = 1; i < REELS_COUNT; i++) {
			const borderView = new Sprite(resources.reel_border)
			container.addChildAt(borderView, 1)

			borderView.anchor.x = 0.5
			borderView.x = i * CELL_WIDTH
			borderView.height = REELS_HEIGHT
		}
		// ...SEPARATORS BETWEEN REELS

		// SHADOW...
		const shadowView = new Sprite(resources.reels_shadow)
		shadowView.anchor.set(0.5)
		shadowView.width = backgroundWidth
		shadowView.height = backgroundHeight
		shadowView.position.set(REELS_WIDTH / 2, REELS_HEIGHT / 2)
		container.addChildAt(shadowView, 5)
		// ...SHADOW

		// BLACKOUT...
		this.blackoutView = this
			.addChildAt(new Graphics, 1)
			.beginFill(0x000000, 0.6)
			.drawRect(
				-backgroundWidth / 2,
				-backgroundHeight / 2,
				backgroundWidth,
				backgroundHeight)
			.endFill()

		this.blackoutView.position.set(REELS_WIDTH / 2, REELS_HEIGHT / 2)
		this.blackoutView.alpha = 0
		// ...BLACKOUT

		// FOREGROUND...
		const frameView = this.addChildAt(new Sprite(resources.reels_frame), 3)
		frameView.anchor.set(0.5)
		frameView.scale.set(1.335)
		frameView.position.set(REELS_WIDTH / 2, REELS_HEIGHT / 2 - 340)
		this.frameView = frameView
		// ...FOREGROUND

		// FOREGROUND FREE SPINS...
		const freeSpinsFrameView = this.addChildAt(new Sprite(resources.reels_frame_free_spins), 4)
		freeSpinsFrameView.anchor.set(0.5)
		freeSpinsFrameView.scale.set(1.335)
		freeSpinsFrameView.position.set(REELS_WIDTH / 2 - 22, REELS_HEIGHT / 2 + 93)
		this.freeSpinsFrameView = freeSpinsFrameView
		// ...FOREGROUND FREE SPINS

		container.cacheAsBitmap = true
	}

	initPayoutsInfoPanel(resources, coefficients) {
		this.payoutsInfoPanelView = this.addChild(
			new PayoutsInfoPanelView({
				resources,
				reelsView: this,
				coefficients,
				camera: this.camera
			}))
	}

	initFreeSpinsCounter(
		resources,
		dictionary
	) {
		this.freeSpinsCounterView = this.addChild(
			new CounterView({
				captionText: dictionary.spins_left_bmp,
				resources,
				camera: this.camera
			}))
		this.freeSpinsCounterView.position.set(1200, 300)
	}

	initTotalWinIndicator(
		resources,
		dictionary
	) {
		this.commonFreeSpinsPayoutIndicatorView = this.addChild(
			new CounterView({
				captionText: dictionary.total_win_bmp,
				resources
			}))
		this.commonFreeSpinsPayoutIndicatorView.position.set(1200, 600)
	}

	initWinTabloid(resources) {
		const { camera } = this

		this.winTabloidView = this.addChild(
			new WinTabloidView({
				resources,
				camera
			}))

		this.winTabloidView
			.position
			.set(REELS_WIDTH / 2, REELS_HEIGHT / 2)
	}

	initReSpinAward(dictionary) {
		this.reSpinAwardView = new ReSpinAwardView({
			dictionary,
			reels: this,
			camera: this.camera
		})
		this.addChild(this.reSpinAwardView).y = 300
	}

	bringWinBoxesToFront() {
		// win boxes (bubbles in this case)
		// should overlap neighboring cells
		this.reelsViews.forEach((reelView, x) =>
			reelView.cellsViews.forEach((cellView, y) => {
				const { bubblesBurstView } = cellView
				bubblesBurstView
				&& this.addChild(bubblesBurstView).position.set(
					CELL_WIDTH * (x + 0.5),
					CELL_HEIGHT * (y - 0.5),
				)
			}))
	}

	setupInteractivity() {
		const { payoutsInfoPanelView } = this
		const interactiveView = this
			.addChild(new Graphics)
			.beginFill(0xFFFFFF, 0.00001)
			.drawRect(0, 0, REELS_WIDTH, REELS_HEIGHT)
			.endFill()
		
		interactiveView.cursor = 'pointer'
		interactiveView.eventMode = 'static'
		interactiveView.on('pointerdown', ({global}) => {
			if (payoutsInfoPanelView.capturedSymbolView)
				return payoutsInfoPanelView.hide()


			const {x, y} = this.toLocal(global)
			const cellX = Math.trunc(x / CELL_WIDTH)
			const cellY = Math.trunc(y / CELL_HEIGHT)
			const cellView = this.reelsViews[cellX].cellsViews[cellY + 1]

			payoutsInfoPanelView.presentPayouts({
				capturedSymbolView: cellView.getSymbolView(),
				x: cellX,
				y: cellY,
				symbolId: cellView.currentSymbolId
			})

		})
		this.interactiveView = interactiveView
		this.setInteractive(false)
	}

	updateTargetArea(sidesRatio) {
		const {
			commonFreeSpinsPayoutIndicatorView,
			freeSpinsCounterView,
			isFreeSpinMode,
			isMobileDevice,
		} = this

		this.payoutsInfoPanelView.hide()
		
		if(sidesRatio > 2) {
			// WIDE LANDSCAPE...
			this.setTargetArea({
				x: 0.25,
				y: 0.1,
				width: 0.5,
				height: 0.7,
			})
			.stickMiddle()

			commonFreeSpinsPayoutIndicatorView.position.set(1350, 125)
			freeSpinsCounterView.position.set(1350, 360)
			freeSpinsCounterView.setContentScale(0.85)
			// ...WIDE LANDSCAPE
		} else if (sidesRatio >= 1) {
			// NARROW LANDSCAPE...
			this.setTargetArea({
				x: 0.25,
				y: 0.1,
				width: isFreeSpinMode ? 0.45 : 0.5,
				height: 0.7,
			})
			.stickMiddle()

			if (isMobileDevice) {
				commonFreeSpinsPayoutIndicatorView.position.set(-250, 0)
				freeSpinsCounterView.position.set(1300, 0)
			} else {
				commonFreeSpinsPayoutIndicatorView.position.set(1350, 125)
				freeSpinsCounterView.position.set(1350, 360)
			}
			freeSpinsCounterView.setContentScale(0.85)
			// ...NARROW LANDSCAPE
		} else {
			// PORTRAIT...
			this.setTargetArea({
					x: isFreeSpinMode ? 0.1 : 0.05,
					y: 0.25,
					width: isFreeSpinMode ? 0.8 : 0.9,
					height: 0.375,
				})
				.stickBottom()

			commonFreeSpinsPayoutIndicatorView.position.set(100, -225)
			freeSpinsCounterView.position.set(1010, -225)
			freeSpinsCounterView.setContentScale(1)
			// ...PORTRAIT
		}
	}

	setBrightness({ key, map, brightness }) {
		super.setBrightness({ key, map, brightness })
		this.blackoutView.alpha = 1 - brightness
	}


	setMasked(isMasked = true) {
		super.setMasked(isMasked)
		this.addChildAt(
			this.reelsContainer,
			isMasked ? 2 : 7
		)
	}

	setInteractive(isInteractive = true) {
		this.interactiveView.visible = isInteractive
	}

	// API...
	reset() {
		super.reset()
		this.winTabloidView.reset()
		this.setInteractive(false)
	}

	refreshPayoutsInfo(bet) {
		this.payoutsInfoPanelView.setBet(bet)
	}

	setTimeScale(scale) {
		super.setTimeScale(scale)
		this.cameraTimeline.setTimeScaleFactor({name: 'scale', value: scale})
		this.winTabloidView.setTimeScale(scale)
		this.freeSpinsCounterView.setTimeScale(scale)
	}

	presentWin({
		winMap,
		multiplier = 1,
		payout,
	}) {
		return Promise.all([
			super.presentWin(winMap),
			this.winTabloidView.presentPayout({
				payout,
				multiplier,
			})
		])
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
		// CAMERA...
		this.cameraTimeline
			.deleteAllAnimations()
			.addAnimation({
				duration: 1500,
				onProgress: (progress) => {
					this.camera
						.focus({
							view: this,
							offsetX: REELS_WIDTH / 2,
							offsetY: REELS_HEIGHT / 2 + 400 * Math.sin(Math.PI * progress),
						})
						.setZoom(1 + 0.01 * Math.sin(Math.PI * 2 * ((progress * 2) % 1) * (1 - progress)))
				}
			})
			.play()
		// ...CAMERA

		return Promise.all([
			super.presentCascade({corruptionMap, patchMap}),
			...corruptionMap.map((reel, x) => reel.map((value, y) => {
				const isWildCorruption = value > 0
				const cellView = this.reelsViews[x].cellsViews[y + 1]
				if(isWildCorruption && WILD_POWER_MAP[cellView.currentSymbolId])
					return this.multiplierView.presentMultiplierIntro({
						sourceView: cellView,
						capacity: value
					})
			}))
		])
	}

	setFreeSpinsMode(isFreeSpinMode = true) {
		this.isFreeSpinMode = isFreeSpinMode
		this.freeSpinsCounterView.visible = isFreeSpinMode
		this.commonFreeSpinsPayoutIndicatorView.visible = isFreeSpinMode
		this.frameView.visible = !isFreeSpinMode
		this.freeSpinsFrameView.visible = isFreeSpinMode
		this.onResize()
	}

	async presentFreeSpinsAward({
		freeSpinsCount,
		isHarvestingRequired = false
	}) {
		this.setMasked(false)

		// CAMERA...
		this.cameraTimeline
			.deleteAllAnimations()
			.addAnimation({
				duration: 1000,
				onProgress: (progress) =>
					this.camera
						.focus({
							view: this,
							offsetX: REELS_WIDTH / 2,
							offsetY: REELS_HEIGHT / 2,
						})
						.setZoom(1 + 0.1 * Math.abs(Math.sin(Math.PI * 2 * progress)))
			})
			.play()
		// ...CAMERA

		await super.presentScattersUnlock()

		if (isHarvestingRequired)
			return Promise.all(this
				.getAllCellsWithSymbolId(SCATTER_SYMBOL_ID)
				.map(view => this
					.freeSpinsCounterView.presentHarvesting(view, freeSpinsCount)))
		
		return this.presentRemainingFreeSpinsCount(freeSpinsCount)
	}

	presentRemainingFreeSpinsCount(freeSpinsCount) {
		return this.freeSpinsCounterView.presentText(freeSpinsCount + '')
	}

	presentCommonFreeSpinsPayout(payout) {
		return this.commonFreeSpinsPayoutIndicatorView.presentText(payout + '')
	}

	presentReSpinAward() {
		return this.reSpinAwardView.presentReSpinAward()
	}

	async presentSpinStart() {
		// CAMERA...
		this.cameraTimeline
			.deleteAllAnimations()
			.addAnimation({
				duration: 10000,
				onProgress: (progress) => {
					this.camera
						.focus({
							view: this,
							offsetX: REELS_WIDTH / 2,
							offsetY: REELS_HEIGHT / 2,
						})
						.setZoom(1 + 0.2 * progress)
				}
			})
			.play()
		// ...CAMERA

		await this.payoutsInfoPanelView.hide()

		return super.presentSpinStart()
	}

	presentSpinStop(targetSymbolsIds) {
		// CAMERA...
		const { camera } = this
		const initialZoom = this.camera.zoom
		const zoomDelta = initialZoom - 1

		this.cameraTimeline
			.deleteAllAnimations()
			.addAnimation({
				duration: 1000,
				onProgress: (progress) => {
					camera
						.focus({
							view: this,
							offsetX: REELS_WIDTH / 2,
							offsetY: REELS_HEIGHT / 2,
						})
						.setZoom(initialZoom - zoomDelta * progress)
						.setAngle(0.025 * (1 - progress) * Math.sin(Math.PI * 2 * ((progress * 2) % 1) ))	
				}
			})
			.play()
		// ...CAMERA


		return super.presentSpinStop({
			targetSymbolsIds,
			ignoreTension: this.isFreeSpinMode
		})
	}
	// ...API
}