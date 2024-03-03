import { Sprite } from "pixi.js";
import { AdaptiveContainer } from "../adaptiveDesign/AdaptiveContainer";
import { ProgressBarView } from "./ProgressBarView";
import { TeasersView } from "./TeasersView";
import { LogoView } from "./LogoView";
import { Timeline } from "../../timeline/Timeline";

export class LoadingScreen extends AdaptiveContainer {
	backgroundView
	progressBarView
	teasersView
	overlayView

	constructor(resources, dictionary) {
		super()

		this.initBackground(resources)
		this.initProgressBar(resources, dictionary)
	}

	initBackground(resources) {
		const container = this
			.addChild(new AdaptiveContainer)
			.setTargetArea({x: 0, y: 1, width: 1, height: 1})

		const sprite = new Sprite(resources.loading_background)
		sprite.anchor.set(0.5, 1)
		container.addChild(sprite)
		this.backgroundView = container
	}


	initProgressBar(resources, dictionary) {
		this.progressBarView = new ProgressBarView(resources, dictionary)
		this.addChild(this.progressBarView)
	}

	initTeasers({resources, dictionary, isMobileDevice}) {
		this.teasersView = new TeasersView({resources, dictionary, isMobileDevice})
		this.addChild(this.teasersView)
	}

	initLogo(resources) {
		this.addChild(new LogoView(resources))
	}
	

	updateTargetArea(sidesRatio) {
		const { backgroundView } = this


		if(sidesRatio > 1.7777) {
			backgroundView.setSourceArea({width: 960, height: 1}).stickTop()
			backgroundView.children[0].position.set(480, 0)
		} else {
			backgroundView.setSourceArea({width: 1, height: 540})
			backgroundView.children[0].position.set(0, 0)
		}
	}

	setProgress(progress) {
		this.progressBarView.setProgress(progress)
	}

	async presentTeasers({
		resources,
		dictionary,
		isMobileDevice
	}) {
		this.initLogo(resources)
		this.initTeasers({
			resources,
			dictionary,
			isMobileDevice})

		AdaptiveContainer.onResize()
		await this.progressBarView.hide()
		await this.teasersView.presentTeasers()

		await new Promise(resolve => {
			this.eventMode = 'static'
			this.cursor = 'pointer'
			this.on('pointerdown', () => {
				this.removeAllListeners()
				resolve()
			})
		})
	}

	async hide(progressCallback) {
		const timeline = new Timeline()
			.addAnimation({
				duration: 500,
				onProgress: (progress) => {
					this.alpha = 1 - progress
					progressCallback(progress)
				}
			})

		await timeline.play()
		timeline.destroy()
	}
}