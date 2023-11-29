import { Sprite } from "pixi.js";
import { AdaptiveContainer } from "../adaptiveDesign/AdaptiveContainer";
import { Timeline } from "../../timeline/Timeline";

export class LogoView extends AdaptiveContainer {
	constructor(resources) {
		super()
		const sprite = this.addChild(new Sprite(resources.logo))

		new Timeline()
			.addAnimation({
				duration: 500,
				onProgress: (progress) => {
					const finalProgress = progress ** 2
					sprite.alpha = finalProgress
					sprite.y = -200 * (1 - finalProgress)
				}
			})
			.windToTime(1)
			.play()
	}

	updateTargetArea(sidesRatio) {
		if (sidesRatio > 1)
			this.setSourceArea({width: 428, height: 364})
				.setTargetArea({x: 0, y: 0, width: 1, height: 0.35})
		else
			this.setSourceArea({width: 428, height: 1400})
				.setTargetArea({x: 0, y: 0, width: 1, height: 1})
	}
}