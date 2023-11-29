import { Sprite } from "pixi.js";
import { Timeline } from "../../timeline/Timeline";
import { AdaptiveContainer } from "../adaptiveDesign/AdaptiveContainer";
import { CoralPipesView } from "./CoralPipesView";

export class ForegroundView extends AdaptiveContainer {
	leftDecorationView
	rightDecorationView

	constructor(resources) {
		super()

		// LEFT...
		const leftDecorationView = this.addChild(new AdaptiveContainer)
		leftDecorationView.addChild(new Sprite(resources.foreground_border_rock))
			.position.set(0, 400)

		leftDecorationView.stickLeft()
		leftDecorationView.stickBottom()
		this.leftDecorationView = leftDecorationView
		// ...LEFT

		// RIGHT...
		const rightDecorationView = this.addChild(new AdaptiveContainer)
		const sprite = new Sprite(resources.foreground_border_rock)
		sprite.scale.x = -1
		sprite.position.set(350 + 450, 250)

		rightDecorationView.addChild(sprite)
		rightDecorationView.setSourceArea({width: 800, height: 400})
		rightDecorationView.stickRight()
		rightDecorationView.stickBottom()
		this.rightDecorationView = rightDecorationView
		// ...RIGHT

		//CORAL PIPES...
		let pipesViews =
		[
			{x: 90, y: 440, scale: 0.725},
			{x: 120, y: 505, scale: 0.95, color: 0xFFAA00},
			{x: 295 + 435, y: 285, scale: -0.6, color: 0xFF00FF},
			{x: 245 + 450, y: 355, scale: -0.9, color: 0xFF5500},
		].map(({x, y, scale = 1, color = 0xFF0000}) => {
			const pipesView = leftDecorationView.addChild(
				new CoralPipesView({ resources, color }))
			
			pipesView.scale.set(scale, Math.abs(scale))
			pipesView.position.set(x, y)

			return pipesView
		})

		leftDecorationView.addChild(pipesViews[0], pipesViews[1])
		rightDecorationView.addChild(pipesViews[2], pipesViews[3])

		new Timeline()
			.addAnimation({
				duration: 10000,
				onProgress: (progress) => {
					pipesViews.forEach((view, i) =>
						view.setProgress((progress + i * 0.1) % 1))
				}
			})
			.setLoopMode()
			.play()
		// ...CORAL PIPES
	}

	updateTargetArea(sidesRatio) {
		const {
			leftDecorationView,
			rightDecorationView
		} = this

		if(sidesRatio > 1.25) {
			leftDecorationView
				.setTargetArea({
					x: 0,
					y: 0,
					width: 1,
					height: 1
				})
				.setSourceArea({width: 800, height: 600})
	
			rightDecorationView
				.setTargetArea({
					x: 0,
					y: 0,
					width: 1,
					height: 1
				})
		} else {
			leftDecorationView
				.setTargetArea({
					x: 0,
					y: 0,
					width: 1,
					height: 0.9
				})
				.setSourceArea({width: 300, height: 500})
			rightDecorationView
				.setTargetArea({
					x: -1,
					y: 0.2,
					width: 2,
					height: 0.7
				})
		}
	}
}