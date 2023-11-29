import { BLEND_MODES, Container, Sprite } from "pixi.js";
import { TextField } from "../../../text/TextField";
import { BaseSymbolView } from "./BaseSymbolView";
import { brightnessToHexColor, getLightSpot } from "../../../GraphicalPrimitives";
import { Timeline } from "../../../../timeline/Timeline";

export class WildSymbolView extends BaseSymbolView {
	wildLevelsCount = 1
	remainingWildCapacity = 1
	backgroundView
	framesViews
	flashlightsViews
	textField
	timeline = new Timeline

	constructor({id, resources}) {
		super({id, resources})

		this.test = true
		this.initFrames(resources)
		this.initFlashlights(resources)
		this.initTextField()
		this.reset()
	}

	initBlurredBody() {
		super.initBlurredBody({})
	}

	initFrames(resources) {
		this.backgroundView = this.addChildAt(new Sprite(resources.wild_frame_background), 0)
			
		this.backgroundView.anchor.set(0.5)
		this.framesViews = new Array(5).fill(0).map((_, i) => {
			const sprite = this.addChild(new Sprite(resources['wild_glass_' + i]))
			sprite.anchor.set(0.5)

			return sprite
		})        
	}

	initFlashlights(resources) {
		this.flashlightsViews = new Array(5).fill(0).map((_) => {
			const container = this.addChild(new Container())
			container.x = 85

			const sprite = container.addChild(new Sprite(resources['wild_flashlight']))
			sprite.anchor.set(0.5)
			container.bodyView = sprite

			const glowView = container.addChild(getLightSpot({radius: 15, color: 0xFF55AA, intensity: 0.5}))
			glowView.cacheAsBitmap = false
			glowView.blendMode = BLEND_MODES.ADD
			container.glowView = glowView
		
			return container;
		})        
	}

	initTextField() {
		const textWidth = 40
		const textHeight = 40
		const textField = this
			.addChild(new TextField({
				maximalWidth: textWidth,
				maximalHeight: textHeight,
			}))
			.setFontName('Multiplier')
			.setAlignCenter()
			.setAlignMiddle()
			.setText(this.wildLevelsCount + '')
			.setFontSize(textHeight)
			.setFontColor(0x333333)

		textField.position.set(-100, 55)

		this.textField = textField
	}

	generateBodySpine({resources}) {
		return super.generateBodySpine({
			name: 'WR',
			resources,
			initialAnimationName: 'WR_2_2'
		})
	}

	setBrightness(brightness) {
		super.setBrightness(brightness)
		const color = brightnessToHexColor(this.brightness)
		this.framesViews.forEach(view => view.tint = color)
		this.backgroundView.tint = color
		this.flashlightsViews.forEach(({bodyView, glowView}) => {
			bodyView.tint = color
			glowView.tint = color
		})
	}

	presentWildCapacityDrain() {
		const {
			wildLevelsCount,
			flashlightsViews,
		} = this

		this.remainingWildCapacity -= 1 / this.wildLevelsCount
		const currentWildLevel = Math.round(wildLevelsCount * this.remainingWildCapacity)

		return Promise.all([
			this.bodyView.playAnimation({name: `WR_${wildLevelsCount}_${currentWildLevel}`}),
			this.timeline
			.wind(1)
			.deleteAllAnimations()
			.addAnimation({
				duration: 200,
				onProgress: (progress) => {
					flashlightsViews[wildLevelsCount - currentWildLevel - 1]
						.glowView.alpha = progress
				},
			})
			.play()
		])
	}

	reset(wildLevelsCount = this.wildLevelsCount) {    
		this.wildLevelsCount = wildLevelsCount;

		const {remainingWildCapacity} = this
		const currentWildLevel = Math.round(wildLevelsCount * remainingWildCapacity)
		const flashlightStepSize = 120 / wildLevelsCount;
		const y = flashlightStepSize * (wildLevelsCount - 1) * 0.5

		this.flashlightsViews?.forEach((view, i) => {
			view.visible = i <= wildLevelsCount - 1
			view.y = y - i * flashlightStepSize
			view.glowView.alpha = (i < wildLevelsCount - currentWildLevel) ? 1 : 0
		})

		this.framesViews?.forEach((view, i) => {
			view.visible = i === wildLevelsCount - 1
		})

		this.bodyView.playAnimation({name: `WR_${wildLevelsCount}_${currentWildLevel}`})
		this.bodyView.wind(1)
		this.textField?.setText('' + wildLevelsCount)
	}

	setTimeScale(scale) {
		super.setTimeScale(scale)
		this.timeline
			.setTimeScaleFactor({
				name: 'scale',
				value: scale
			})
	}
}