import { Container, Sprite } from "pixi.js";

export class BubbleView extends Container {
	sprite
	progress = 0
	floatingWidth
	immersionHeight
	
	constructor({
		resources,
		floatingWidth = 0,
		immersionHeight = 150,
	}) {
		super()

		this.immersionHeight = immersionHeight
		this.floatingWidth = floatingWidth

		this.sprite = this.addChild(new Sprite(resources.bubble))
		this.sprite.anchor.set(0.5)
	}

	setProgress(progress = 0) {
		const {
			sprite,
			floatingWidth,
			immersionHeight,
		} = this

		this.progress = progress

		const floatingProgress = (progress * 2) % 1
		sprite.scale.set(Math.min(1, Math.sin(Math.PI * progress) * 2))

		sprite.x = 15 -floatingWidth * Math.cos(Math.PI * 2 * floatingProgress ) * (1 - progress)
		sprite.y = -immersionHeight * progress ** 3
	}
}
