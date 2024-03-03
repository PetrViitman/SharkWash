import { Container, Graphics, Sprite } from "pixi.js"
import { TextField } from "../text/TextField"
import { CELL_HEIGHT, CELL_WIDTH, REELS_COUNT } from "../../Constants"
import { Timeline } from "../../timeline/Timeline"
import { formatMoney } from "../../Utils"

const PAYOUTS_IDS_COLOR_MAP = {
	1: 0xFF0000,
	2: 0xFFFF00,
	3: 0x00FF00,
	4: 0x0055FF,
	5: 0x0055FF,
	6: 0x00FF00,
	7: 0xFFFF00,
	8: 0xFF0000
}

const ZOOM_DELTA = 0.5

export class PayoutsInfoPanelView extends Container {
	coefficients
	bet
	reelsView
	contentContainer
	panelView
	symbolContainer
	payoutsContainer
	payoutsViews = []
	capturedSymbolParentContainer
	capturedSymbolView
	capturedSymbolId
	timeline = new Timeline
	camera
	isHiding
	
	constructor({
		resources,
		reelsView,
		coefficients,
		camera
	}) {
		super()

		this.camera = camera
		this.coefficients = coefficients
		this.reelsView = reelsView
		this.contentContainer = this.addChild(new Container)
		this.initPanel(resources)
		this.initPayouts()
		this.initSymbolContainer()
		this.contentContainer.visible = false
	}

	initSymbolContainer() {
		this.symbolContainer = this.contentContainer.addChild(new Container)
		this.symbolContainer.position.set(CELL_WIDTH / 2, CELL_HEIGHT / 2)
	}

	initPanel(resources) {
		const sprite = new Sprite(resources.payout_panel)
		sprite.scale.set(1.35)
		sprite.pivot.set(30, 40)
		
		this.panelView = this.contentContainer.addChild(sprite)
	}

	initPayouts() {
		this.payoutsContainer = this
			.contentContainer
			.addChild(new Container)
	
		for(let i = 0; i < 3; i++) {
			const textField = this
				.payoutsContainer
				.addChild(
					new TextField({
						maximalWidth: 190,
						maximalHeight: 70
					}))
				.setFontName('SharkWash')
				.setFontColor(0x00FF00)
				.setFontSize(50)
				.setAlignLeft()
			
			textField.y = i * 70
			this.payoutsViews.push(textField)
		}

		this.payoutsViews[0].setAlignBottom()
		this.payoutsViews[1].setAlignMiddle()
		this.payoutsViews[2].setAlignTop()
	}

	hide() {
		const {
			camera,
			timeline,
			reelsView,
			contentContainer
		} = this

		if(!contentContainer.visible) return
		if(this.isHiding) return

		return timeline
			.deleteAllAnimations()
			.addAnimation({
				duration: 150,
				onStart: () => {
					this.isHiding = true
				},
				onProgress: (progress) => {
					reelsView.setBrightness({ brightness: progress })
					contentContainer.alpha = 1 - progress
					camera
						.focus({view: this.capturedSymbolView})
						.setZoom(1 + ZOOM_DELTA  * (1 - progress))
				},
				onFinish: () => {
					this.capturedSymbolView.resetBody()
					this.capturedSymbolParentContainer
						.addChild(this.capturedSymbolView)

					this.capturedSymbolView = undefined
					this.contentContainer.visible = false
					this.isHiding = false
				}
			})
			.windToTime(1)
			.play()
	}

	updatePayoutsTexts(color) {
		if(!this.capturedSymbolId) return

		this.payoutsViews.forEach((view, i) => {
			const payout = formatMoney(this.coefficients[this.capturedSymbolId][i + 2] * this.bet)
			view.setText((i + 3) + 'x: ' + payout)
			color && view.setFontColor(color)
		})
	}

	presentPayouts({
		capturedSymbolView,
		x,
		y,
		symbolId,
	}){
		const {
			camera,
			timeline,
			reelsView,
			coefficients,
			contentContainer,
		} = this

		if(!coefficients[symbolId]) return
		if(contentContainer.visible) return

		// KEEPING PANEL INSIDE REELS...
		if (x < REELS_COUNT - 2) {
			this.payoutsContainer.x = 225
			this.panelView.x = 0
		} else {
			this.payoutsContainer.x = -200
			this.panelView.x = -225
		}
		// ...KEEPING PANEL INSIDE REELS

		this.capturedSymbolParentContainer = capturedSymbolView.parent
		this.capturedSymbolView = capturedSymbolView
		this.capturedSymbolId = symbolId
		this.symbolContainer.addChild(capturedSymbolView)
		this.contentContainer.position.set(
			x * CELL_WIDTH,
			y * CELL_HEIGHT)

		capturedSymbolView.presentAnimation({index: 0})
		this.updatePayoutsTexts(PAYOUTS_IDS_COLOR_MAP[symbolId])
		
		return timeline
			.deleteAllAnimations()
			.addAnimation({
				duration: 250,
				onStart: () => {
					this.contentContainer.visible = true
				},
				onProgress: (progress) => {
					contentContainer.alpha = progress
					reelsView.setBrightness({
						brightness: 1 - progress
					})
					capturedSymbolView.setBrightness(1)

					camera
						.focus({view: this.capturedSymbolView})
						.setZoom(1 + ZOOM_DELTA  * progress)
				}
			})
			.play()
	}

	setBet(bet) {
		this.bet = bet
		this.updatePayoutsTexts()
	}
}