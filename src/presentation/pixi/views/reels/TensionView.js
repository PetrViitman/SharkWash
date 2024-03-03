import { Container, Sprite } from "pixi.js";
import { Timeline } from "../../timeline/Timeline";

export class TensionView extends Container {
	sprites
	loopTimeline = new Timeline
	revealTimeline = new Timeline

	constructor(resources) {
		super()

		this.sprites = [0, 0, 0, 0].map(_ => {
			const sprite = new Sprite(resources.tension_bubbles)
			sprite.scale.set(1.6, 1)
			sprite.anchor.set(0.5)

			return this.addChild(sprite)
		})
	}

	setProgress(progress) {
		this.sprites.forEach((sprite, i) => {
			const shiftedProgress = (progress + i * 0.25) % 1

			sprite.alpha = Math.abs(Math.sin(Math.PI * 2 * shiftedProgress))
			sprite.y = 200 - 500 * shiftedProgress ** 2
		})
	}

	present({delay, duration}) {
		this.loopTimeline
			.deleteAllAnimations()
			.addAnimation({
				duration: 750,
				onProgress: (progress) => {
					this.setProgress(progress)
				}
			})
			.setLoopMode()
			.play()

		return this
			.revealTimeline
			.deleteAllAnimations()
			.addAnimation({
				delay,
				duration: 250,
				onProgress: (progress) => this.alpha = progress
			})
			.addAnimation({ delay, duration })
			.play()
	}

	hide() {
		this.revealTimeline
			.deleteAllAnimations()
			.addAnimation({
				duration: 500,
				onProgress: (progress) => {
					this.alpha = 1 - progress
				},
				onFinish: () => {
					this.loopTimeline.pause()
				}
			})
			.play()
	}

	setTimeScale(timeScale) {
		this.revealTimeline
			.setTimeScaleFactor({
				name: 'scale',
				value: timeScale
			})
	}
}