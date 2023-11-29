import { AdaptiveContainer } from "../adaptiveDesign/AdaptiveContainer";
import { Timeline } from "../../timeline/Timeline";

export class BaseSplashScreen extends AdaptiveContainer {
	overlayView
	dictionary
	resources
	isMobileDevice
	camera
	timeline = new Timeline
	
	constructor({
		resources,
		dictionary,
		isMobileDevice,
		camera,
	}) {
		super()

		
		this.resources = resources
		this.dictionary = dictionary
		this.isMobileDevice = isMobileDevice
		this.camera = camera

		this.initOverlay()
		this.initBody({})
		this.visible = false
	}

	initOverlay() {
		const view = new AdaptiveContainer()
			.setSourceArea({
				width: 100,
				height: 100 
			})
			.setTargetArea({
				x: 0,
				y: 0,
				witdth: 1,
				height: 1,
			})
			.stretchHorizontally()
			.stretchVertically()
			.highlight(0x000000, 0.75)

		this.overlayView = this.addChild(view)
	}

	initBody({
		width = 750,
		height = 750
	}) {
		const view = new AdaptiveContainer()
			.setSourceArea({
				width,
				height 
			})

		this.bodyView = this.addChild(view)
	}

	updateTargetArea(sidesRatio) {
		const {
			bodyView,
			isMobileDevice
		} = this

		if(sidesRatio > 1.25) {
			 // WIDE LANDSCAPE...
			bodyView
				.setTargetArea({x: 0, y: 0, width: 1, height: isMobileDevice ? 0.8 : 0.9})
				.stickMiddle()
			// ...WIDE LANSCAPE
		} else if (sidesRatio >= 1) {
			// NARROW LANDSCAPE...
			bodyView.setTargetArea({
				x: 0.25,
				y: 0.1,
				width: 0.5,
				height: 0.7,
			})
			.stickMiddle()
			// ...NARROW LANDSCAPE
		} else {
			// PORTRAIT...
			bodyView.setTargetArea({
				x: 0,
				y: 0.1,
				width: 1,
				height: 0.575,
			})
			.stickBottom()
			// ...PORTRAIT
		}
	}

	setVisible(isVisible = true) {
		return this
			.timeline
			.deleteAllAnimations()
			.addAnimation({
				duration: 300,
				target: this,
				key: 'alpha',
				initialValue: isVisible ? 0 : 1,
				finalValue: isVisible ? 1 : 0,
				onStart: () => {
					this.visible = true
				},
				onFinish: () => {
					this.visible = isVisible
				}
			})
			.play()
	}
}