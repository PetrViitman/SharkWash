
import { Container, Sprite } from 'pixi.js'
import { BubblesPoolView } from '../multiplier/BubblesPoolView'

export class CoralPipesView extends Container {
	contentContainer
	bubblesPoolsViews

	constructor({
		resources,
		color = 0xFF0000,
	}) {
		super()

		const container = this.addChild(new Container)
		const pipesView = new Sprite(resources.foreground_pipes)

		this.contentContainer = container
	
		container.addChild(pipesView)
		pipesView.anchor.set(0.5, 0.85)
		pipesView.tint = color

		this.bubblesPoolsViews = 
		[
			{x: -33, y: -23},
			{x: 28, y: -20},
			{x: -42, y: -33}
		].map(({x, y}) => {
			const bubblesPoolView = new BubblesPoolView({
				resources,
				bubblesCount: 3,
				spawnRadius: 0,
				immersionHeight: 150,
				bubbleScaleFactor: 0.5,
			})
			bubblesPoolView.position.set(x, y)

			return container.addChild(bubblesPoolView)
		})
	}

	setProgress(progress) {
		const skew = Math.cos(Math.PI * 2 * progress) * 0.1
		const scale = 1 - 0.1 * Math.abs(Math.cos(Math.PI * 2 * ((progress * 3) % 1)))
		this.contentContainer.skew.x = skew
		this.contentContainer.scale.y = scale

		this.bubblesPoolsViews.forEach((view, i) => {
			const shiftedProgress = (progress * 4 + i * 0.25) % 1

			view.skew.x = -skew
			view.scale.y = 1 / scale

			view.setProgress(shiftedProgress)
		})
	}
}