import { Container, Graphics, Sprite } from "pixi.js";
import { AdaptiveContainer } from "../adaptiveDesign/AdaptiveContainer";
import { TextField } from "../text/TextField";
import { Timeline } from "../../timeline/Timeline";

export class ProgressBarView extends AdaptiveContainer {
	timeline = new Timeline
	progressMaskView
	barContainer
	captionView

	constructor(resources, dictionary) {
		super()

		this.setSourceArea({width: 949, height: 603})
		this.initBar(resources)
		this.initCaption(dictionary)

		this.setProgress(0)
	}

	initBar(resources) {
		const barContainer = this.addChild(new Container)

		barContainer
			.addChild(new Sprite(resources.progress_bar_frame))
			.position.set(18, 23)

		const barView = barContainer.addChild(
			new Sprite(resources.progress_bar))

		this.progressMaskView = barContainer
			.addChild(new Graphics)
			.beginFill(0xFF0000, 0.5)
			.drawRect(0, 0, 665, 400)
			.endFill()

		this.progressMaskView.x = 145

		barView.mask = this.progressMaskView
		barView.position.set(146, 164)
		barContainer.y = 200
		this.barContainer = barContainer
	}

	initCaption(dictionary) {
		const textField = new TextField({
			maximalWidth: 949,
			maximalHeight: 200
		})
			.setFontName('SharkWash')
			.setFontSize(100)
			.setText(dictionary.loading_bmp)
			.setAlignCenter()
			.setAlignMiddle()
			.setFontColor(0xCCFF3b)

		textField.pivot.set(949 / 2, 200 / 2)
		textField.position.set(textField.pivot.x, textField.pivot.y)
		this.captionView = this.addChild(textField)

		this.timeline
			.addAnimation({
				duration: 1500,
				onProgress: (progress) => {
					textField.scale.set(
						1,
						1 + 0.1  * (1 - progress) * Math.cos(Math.PI * 2 * ((progress * 5) % 1)))
					
				},
			})
			.setLoopMode()
			.play()
	}

	updateTargetArea(sidesRatio) {
		if(sidesRatio > 1)
			this.setTargetArea({x: 0.25, y: 0.25, width: 0.5, height: 0.5})
		else
			this.setTargetArea({x: 0.05, y: 0.25, width: 0.9, height: 0.5})
	}

	setProgress(progress) {
		this.progressMaskView.scale.x = progress
	}

	hide() {
		return this
			.timeline
			.deleteAllAnimations()
			.addAnimation({
				duration: 500,
				onProgress: (progress) => {
					const finalProgress = progress ** 2

					this.alpha = 1 - finalProgress
					this.captionView.y = 100 - 150 * finalProgress
					this.barContainer.y = 200 + 150 * finalProgress
				}
			})
			.setLoopMode(false)
			.play()
	}
}