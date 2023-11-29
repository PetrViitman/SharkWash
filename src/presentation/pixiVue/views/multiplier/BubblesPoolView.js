import { Container } from "pixi.js"
import { BubbleView } from "./BubbleView"

export class BubblesPoolView extends Container {
	bubblesViews
	bubblesCount
	bubbleScaleFactor
	spawnRadius

	constructor({
		resources,
		bubblesCount = 10,
		spawnRadius = 0,
		immersionHeight = 150,
		floatingWidth = 0,
		bubbleScaleFactor = 1,
	}) {
		super()

		this.spawnRadius = spawnRadius
		this.bubbleScaleFactor = bubbleScaleFactor

		this.bubblesViews = new Array(bubblesCount).fill(0).map(_ => 
			this.addChild(new BubbleView({
				resources,
				immersionHeight,
				floatingWidth,
			})))
	}

	setProgress(progress, sourceView = this) {
		const { bubblesViews, bubbleScaleFactor } = this
		const progressShift = 1 / bubblesViews.length

		bubblesViews.forEach((bubbleView, i) => {
			const progressPerBubble = (progress + progressShift * i) % 1

			if(bubbleView.progress > progressPerBubble) {
				const { spawnRadius } = this
				const subOrbitAngle = (progress + 0.01 * i) % 1 * Math.PI * 2

				bubbleView.scale.set((0.75 + 0.25 * Math.random()) * bubbleScaleFactor)
				bubbleView.position.set(
					sourceView.x + spawnRadius * Math.cos(subOrbitAngle),
					sourceView.y + spawnRadius * 1.25 * Math.sin(subOrbitAngle))
			}

			bubbleView.setProgress(progressPerBubble)
		})
	}
}