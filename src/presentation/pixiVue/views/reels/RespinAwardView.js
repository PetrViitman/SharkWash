import { Container } from "pixi.js";
import { Timeline } from "../../timeline/Timeline";
import { TextField } from "../text/TextField";
import { REELS_WIDTH } from "../../Constants";
import { getRectangleSpot } from "../GraphicalPrimitives";

export class RespinAwardView extends Container {
	textField
	timeline = new Timeline
	camera
	
	constructor({reels, dictionary, camera}) {
		super()

		this.reels = reels
		this.camera = camera

		this.initGlow()
		this.initTextField(dictionary)
	}

	initGlow() {
		this.glowView = this.addChild(getRectangleSpot({
			width: 100,
			height: 20,
			color: 0xAAFF00,
		}))

		this.glowView.alpha = 0
		this.glowView.position.set(REELS_WIDTH / 2, 100)
	}

	initTextField(dictionary) {
		this.textField = new TextField({
			maximalWidth: REELS_WIDTH,
			maximalHeight: 200
		})
			.setFontName('SharkWash')
			.setFontSize(150)
			.setText(dictionary.respin_awarded_bmp)
			.setAlignCenter()
			.setAlignMiddle()
			.setFontColor(0xCCFF3b)


		const x = REELS_WIDTH / 2
		const y = 100

		this.addChild(this.textField)
		this.textField.alpha = 0
		this.textField.pivot.set(x, y)
		this.textField.position.set(x, y)
	}


	presentRespinAward() {
		const { textField, reels } = this

		return this.timeline
			.deleteAllAnimations()
			.addAnimation({
				duration: 1000,
				onProgress: (progress) => {
					const alpha = Math.min(1, Math.sin(Math.PI * progress) * 2)

					textField.alpha = alpha
					reels.setBrightness({brightness: 1 - alpha})
					textField.y = 100 + 100 * (1 - progress) * Math.cos(Math.PI * 2 * ((progress *2) % 1))
					this.glowView.alpha = alpha


					const floatingProgress = Math.abs(Math.cos(Math.PI  * 2* ((progress * 2) % 1))) * (1 - progress)
					this.glowView.y = textField.y
					this.glowView.scale.set(
						1.5 + 2 * floatingProgress,
						2 + 1.5 * floatingProgress
					)

					this.camera
						.focus({view: this.textField})
						.setZoom(1 + Math.sin(Math.PI * progress) * 0.2)
				}
			})
			.windToTime(1)
			.play()
	}
}