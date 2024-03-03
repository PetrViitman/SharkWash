import { Container, Graphics } from 'pixi.js'
import { getLightSpot } from '../GraphicalPrimitives'

const LIFE_TIME = 200

export class FireflyView extends Container {
	bodyView
	glowView
	framesCount = 0
	angle
	directionMultiplier = 1

	constructor(color = 0xFFFF00) {
		super()
		this.glowView = this.addChild(
			getLightSpot({
				color: 0xFFFFFF,
				radius: 10,
			}))
		this.glowView.cacheAsBitmap = false
		this.glowView.tint = color

		this.bodyView = this.addChild(
			new Graphics()
				.beginFill(0xFFFFFF)
				.drawRoundedRect(-3, -3, 6, 6)
				.endFill(),
		)
	}

	reset() {
		this.framesCount = 0
		this.angle = Math.PI / 4 + (Math.PI / 2) * Math.random()
		this.bodyView.scale.y = 0
		this.alpha = 1
		this.glowView.alpha = 0
		this.directionMultiplier = 0.025 * (Math.random() > 0.5 ? 1 : -1)
	}

	update(timeScale = 1) {
		this.framesCount += timeScale
		this.angle += this.directionMultiplier * timeScale
		const speed = 1 * timeScale
		this.x += speed * Math.cos(this.angle)
		this.y += speed * Math.sin(this.angle)

		this.bodyView.scale.y += 0.01 * timeScale
		if (this.bodyView.scale.y >= 1) { this.bodyView.scale.y = (this.bodyView.scale.y % 1) - 1 }

		this.bodyView.rotation = this.angle
		this.alpha = 1 - Math.max((this.framesCount - LIFE_TIME) / 30, 0)
		this.glowView.alpha = Math.min(1, this.framesCount / 10)
	}

	isReadyToBeReused() {
		return this.alpha <= 0.001
	}

	setColor(color) {
		this.glowView.tint = color
	}
}
