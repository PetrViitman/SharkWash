import { Container, Sprite } from "pixi.js";
import { CoinView } from "./CoinView";
import { BubblesPoolView } from "../multiplier/BubblesPoolView";

export class DivingCoinView extends Container {
	bubblesPoolView
	coinView
	divingDepth

	constructor(resources) {
		super(resources)

		this.bubblesPoolView = this.addChild(new BubblesPoolView({
			resources,
			bubblesCount: 5,
			spawnRadius: 0,
			bubbleScaleFactor: 0.75
		}))
		this.coinView = this.addChild(new CoinView(resources, 0x00FFFF))
	}

	setProgress({progress, divingDepth = 400}) {
		const { coinView, bubblesPoolView } = this
		bubblesPoolView.setProgress(progress * 5 % 1, coinView)

		coinView.x = divingDepth / 15 * (1 - progress) * Math.cos(Math.PI * 6 * progress)

		coinView.flip((progress ** 2 * 1.75) % 1)
		coinView.spin(Math.PI * 2 * progress)

		coinView.scale.set( 1 - 0.1 * Math.abs(Math.cos(Math.PI * 6 * progress)) )

		
		coinView.alpha = progress < 0.75
			? Math.min(1, progress  * 3)
			: 1 - (progress - 0.75) / 0.25

		bubblesPoolView.alpha = coinView.alpha
	}
}