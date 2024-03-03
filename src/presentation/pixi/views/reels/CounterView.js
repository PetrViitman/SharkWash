import { Container, Sprite } from "pixi.js";
import { Timeline } from "../../timeline/Timeline";
import { TextField } from "../text/TextField";
import { SpineView } from "../SpineView";

export class CounterView extends Container {
	contentContainer
	flyingValuesViews = []
	timeline = new Timeline
	resources
	timeScale = 1
	contentScale = 1
	currentText
	camera

	constructor({
		resources,
		captionText,
		camera
	}) {
		super()
		this.camera = camera
		this.contentContainer = this.addChild(new Container)
		this.resources = resources
		this.initBody()
		this.initCaption(captionText)
		this.initTextField()
	}

	initBody() {
		const {resources} = this

		this.contentContainer
			.addChild(new Sprite(resources.counter_panel))
			.anchor.set(0.5)
	}

	initCaption(captionText) {
		const textField = new TextField({
			maximalWidth: 300,
			maximalHeight: 70
		})
			.setFontName('SharkWash')
			.setFontSize(70)
			.setText(captionText)
			.setAlignCenter()
			.setAlignBottom()
			.setFontColor(0xCCFF3b)

		textField.pivot.set(150, 50)
		textField.y = -40
		this.contentContainer.addChild(textField)
	}

	initTextField() {
		const textField = new TextField({
			maximalWidth: 300,
			maximalHeight: 100
		})
			.setFontName('SharkWash')
			.setFontSize(100)
			.setAlignCenter()
			.setAlignMiddle()
			.setFontColor(0xFFCC3b)
		
		textField.pivot.set(150, 50)
		textField.y = 40
		this.textField = this.contentContainer.addChild(textField)
	}

	getNextFlyingView() {
		const {flyingValuesViews, resources} = this

		for(const view of flyingValuesViews)
			if(!view.timeline.isPlaying)
				return view
		
		const view = new SpineView(resources.bubble_multiplier.spineData)
		this.parent.addChild(view)
		flyingValuesViews.push(view)
		view.timeline = new Timeline

		return view
	}

  

	setTimeScale(scale) {

		this.timeScale = scale
		this.timeline.setTimeScaleFactor({name: 'scale', value: scale})

		for(const view of this.flyingValuesViews) {
			view.timeline.setTimeScaleFactor({name: 'scale', value: scale})
			view.setTimeScale({timeScale: scale})
		}
	}

	presentHarvesting(sourceView, finalFreeSpinsCount) {
		const view = this.getNextFlyingView()
		view.playAnimation({name: 'yellow_1_x1_plus'})
		view.setTimeScale({timeScale: this.timeScale})
		this.currentText = '' + finalFreeSpinsCount

		return view
			.timeline
			.deleteAllAnimations()
			.setTimeScaleFactor({name: 'scale', value: this.timeScale})
			.addAnimation({
				duration: 1000,
				onProgress: (progress) => {
					const { x, y } = this.parent.toLocal(sourceView.getGlobalPosition())

					view.position.set(
						x + (this.x - x) * progress,
						y + (this.y - y) * progress)

					this.camera
						.focus({view})
						.setZoom(1 + 0.25 * progress ** 2)
				},
			})
			.addAnimation({
				delay: 1000,
				duration: 500,
				onDelayFinish: () => {
					this.textField.setText(this.currentText)
				},
				onProgress: (progress) => {
					this.contentContainer.scale.set(
						this.contentScale - 0.25 * (1 - progress) * Math.sin(Math.PI * ((progress * 3) % 1))
					)

					this.camera
						.focus({view: this})
						.setZoom(1 + 0.25 * (1 - progress))
				},
			})
			.windToTime(1)
			.play()
	}

	async presentText(text) {
		if(this.currentText === text)
			return
		
		this.currentText = text

		return this
			.timeline
			.deleteAllAnimations()
			.addAnimation({
				duration: 150,
				onProgress: (progress) => {
					this.textField.alpha = 1 - progress
				},
				onFinish: () => {
					this.textField.setText(text)
				}
			})
			.addAnimation({
				delay: 150,
				duration: 150,
				onProgress: (progress) => {
					this.textField.alpha = progress
				},
			})
			.addAnimation({
				delay: 300,
				duration: 250,
			})
			.play()
	}

	setContentScale(scale = 1) {
		this.contentScale = scale
		this.contentContainer.scale.set(scale)
	}
}