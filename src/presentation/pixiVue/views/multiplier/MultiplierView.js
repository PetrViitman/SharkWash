import { BLEND_MODES, Container, Graphics, Sprite } from "pixi.js";
import { AdaptiveContainer } from "../adaptiveDesign/AdaptiveContainer";
import { Timeline } from "../../timeline/Timeline";
import { TextField } from "../text/TextField";
import { BubblesPoolView } from "./BubblesPoolView";
import { SpineView } from "../SpineView";
import { REELS_HEIGHT, REELS_WIDTH } from "../../Constants";

const MAX_SECTORS_COUNT = 5
const MULTIPLIER_ORBIT_DISTANCE = 175

export class MultiplierView extends AdaptiveContainer {
	capacity = 0
	multiplier = 1
	contentContainer
	progressMask
	barQuarters
	sectorsSeparatorsViews = []
	flyingMultipliersViews = []
	multiplierPointerView
	glowView
	bubblesPoolView
	timeline = new Timeline
	resources
	timeScale = 1
	isFreeSpinMode
	camera

	constructor({resources, camera}) {
		super()
		this.resources = resources
		this.camera = camera
		this.initBody()
		this.initOrbitMultipliers()
		this.initBubbles()

		new Timeline()
			.addAnimation({
				duration: 20000,
				onProgress: (progress) => {
					this.bubblesPoolView.setProgress(
						(progress * 10) % 1,
						this.multiplierPointerView,
						)
				},
			})
			.setLoopMode()
			.play()

		this.reset()
	}

	initBubbles() {
		const { resources } = this

		this.bubblesPoolView = this.contentContainer.addChild(new BubblesPoolView({
			resources,
			bubblesCount: 10,
			spawnRadius: 30,
			immersionHeight: 150,
			floatingWidth: 25
		}))
	}

	initOrbitMultipliers() {
		const textWidth = 50
		const textHeight = 40
		const {contentContainer, resources} = this

		const positions = new Array(MAX_SECTORS_COUNT)
			.fill(0)
			.map((_, i) => {
				const angle = Math.PI * 2 / MAX_SECTORS_COUNT * i - Math.PI / 2
				return {
					x: MULTIPLIER_ORBIT_DISTANCE * Math.cos(angle),
					y: MULTIPLIER_ORBIT_DISTANCE * Math.sin(angle),
				}
			})

		positions.forEach(({x, y}) => {
			const sprite = contentContainer.addChild(new Sprite(resources.value_background))
			sprite.anchor.set(0.5)
			sprite.position.set(x, y)
		})

		this.multiplierPointerView = contentContainer.addChild(new Sprite(resources.value_glow))
		this.multiplierPointerView.anchor.set(0.5)

		positions.forEach(({x, y}, i) => {
			const textField = contentContainer.addChild(new TextField({
				maximalWidth: textWidth,
				maximalHeight: textHeight,
			}))
			.setFontName('Multiplier')
			.setAlignCenter()
			.setAlignMiddle()
			.setText('x' + (i + 1))
			.setFontSize(textHeight)
			.setFontColor(0x111111)
			
			textField.position.set(x, y)
			textField.pivot.set(textWidth / 2, textHeight / 2)
		})
	}

	initBody() {
		const {resources} = this
		const container = this.addChild(new Container)
		const shadowView = container.addChild(new Sprite(resources.multiplier_shadow))
		
		shadowView.position.set(15, 0)
		shadowView.anchor.set(0.5)
		shadowView.scale.set(2.5)
		shadowView.rotation = -0.35

		container.addChild(new Sprite(resources.progress_bar_background)).anchor.set(0.5)
		this.barQuarters = new Array(4)
			.fill(0)
			.map((_, i) => container
				.addChild(new Sprite(resources['bar_part_' + i])))

		container.addChild(new Sprite(resources.multiplier_label)).anchor.set(0.5)

		this.glowView = container.addChild(new Sprite(resources.multiplier_label))
		this.glowView.anchor.set(0.5)
		this.glowView.blendMode = BLEND_MODES.ADD
		this.glowView.alpha = 0

		this.barQuarters[0].anchor.set(0, 1)
		this.barQuarters[1].anchor.set(0, 0)
		this.barQuarters[2].anchor.set(1, 0)
		this.barQuarters[3].anchor.set(1, 1)

		this.progressMask = container
			.addChild(new Graphics())
			.beginFill(0xFF0000)
			.drawRect(-150, -150, 150, 150)
			.endFill()

		container.position.set(200)

		this.contentContainer = container
	}

	getNextFlyingMultiplier() {
		const {flyingMultipliersViews, resources} = this

		for(const view of flyingMultipliersViews)
			if(!view.timeline.isPlaying)
				return view
		
		const view = new SpineView(resources.bubble_multiplier.spineData)
		this.parent.addChild(view)
		flyingMultipliersViews.push(view)
		view.timeline = new Timeline

		return view
	}

	getSectorSeparator(index = 0) {
		const {sectorsSeparatorsViews} = this
		
		if(!sectorsSeparatorsViews[index]) {
			const sprite = new Sprite(this.resources.sector_separator)
			this.contentContainer.addChildAt(sprite, 6)
			sprite.anchor.set(0.5)
			sectorsSeparatorsViews[index] = sprite
		}

		return sectorsSeparatorsViews[index]
	}

	getBubble(index = 0) {
		const {bubblesViews} = this
		
		if(!bubblesViews[index]) {
			const view = new BubbleView(this.resources)
			this.contentContainer.addChildAt(view, 5)
			bubblesViews[index] = view
		}

		return bubblesViews[index]
	}

	setBarProgress(progress) {
		const finalProgress = Math.min(1, progress)
		const {barQuarters, progressMask} = this

		barQuarters[0].visible = true
		barQuarters[1].visible = finalProgress >= 0.25
		barQuarters[2].visible = finalProgress >= 0.5
		barQuarters[3].visible = finalProgress >= 0.75

		barQuarters[0].mask = finalProgress <= 0.25 ? progressMask : undefined
		barQuarters[1].mask = finalProgress <= 0.5 ? progressMask : undefined
		barQuarters[2].mask = finalProgress <= 0.75 ? progressMask : undefined
		barQuarters[3].mask = finalProgress <= 1 ? progressMask : undefined

		progressMask.rotation = Math.PI * 2 * finalProgress  
	}

	setSectorsCount(sectorsCount) {
		const finalSeparatorsCount = Math.ceil(sectorsCount +  0.001)
		this.sectorsSeparatorsViews.forEach(view => view.visible = false)

		for(let i = 0; i < sectorsCount; i++) {
			const view = this.getSectorSeparator(i)
			view.visible = true
		
			const previousSectorProgress = i / (finalSeparatorsCount - 1)
			const sectorProgress = i / finalSeparatorsCount
			const deltaProgress = sectorProgress - previousSectorProgress
			const progress = previousSectorProgress + deltaProgress * (sectorsCount % 1)
			const distance = 105
			const angle = -Math.PI * 2 * progress - Math.PI * 0.5

			view.rotation = angle
			view.position.set(
				distance * Math.cos(angle),
				distance * Math.sin(angle),
			)
		}
	}

	setMultiplier(value) {
		const progress = (value - 1) / 5
		const angle = Math.PI * 2 * progress - Math.PI / 2
		this.multiplierPointerView.position.set(
			MULTIPLIER_ORBIT_DISTANCE * Math.cos(angle),
			MULTIPLIER_ORBIT_DISTANCE * Math.sin(angle))
	}

	setBubblesProgress(progress) {
		const {multiplierPointerView} = this
		const bubblesCount = 20

		for(let i = 0; i < bubblesCount; i++) {
			const progressPerBubble = (progress + 0.075 * i) % 1

			const bubbleView = this.getBubble(i)

			if(bubbleView.progress > progressPerBubble) {
				const subOrbitDistance = 30
				const subOrbitAngle = (progress + 0.01 * i) % 1 * Math.PI * 2

				bubbleView.scale.set(0.75 + 0.25 * Math.random())
				bubbleView.position.set(
					multiplierPointerView.x + subOrbitDistance * Math.cos(subOrbitAngle),
					multiplierPointerView.y + subOrbitDistance * 1.25 * Math.sin(subOrbitAngle))
			}

			bubbleView.setProgress(progressPerBubble)
		}

	}

	updateTargetArea(sidesRatio) {
		if(sidesRatio > 2) {
			// WIDE LANDSCAPE...
			this.contentContainer.position.set(225, 200)
			this.setSourceArea({width: 1000, height: 400})
				.setTargetArea({
					x: 0,
					y: 0.25,
					width: 0.5,
					height: 0.4,
				})
				.stickRight()
				.stickMiddle()
			// ...WIDE LANDSCAPE
		} else if (sidesRatio >= 1) {
			// NARROW LANDSCAPE...
			this.contentContainer.position.set(200, 200)
			this.setSourceArea({
				width: 400,
				height: 400,
			})
			.setTargetArea({
				x: 0.025,
				y: 0.25,
				width: 0.15,
				height: 0.4,
			})
			.stickCenter()
			.stickMiddle()
			// ...NARROW LANDSCAPE
		} else {
			// PORTRAIT...
			this.contentContainer.position.set(REELS_WIDTH / 2, -250)
			this.setSourceArea({
					width: REELS_WIDTH,
					height: REELS_HEIGHT,
				})
				.setTargetArea({
					x: this.isFreeSpinMode ? 0.1 : 0.05,
					y: 0.25,
					width: this.isFreeSpinMode ? 0.8 : 0.9,
					height: 0.375,
				})
				.stickBottom()
				.stickCenter()
			// ...PORTRAIT
		}
	}

	reset() {
		this.setBarProgress(0)
		this.setSectorsCount(2) 
		this.setMultiplier(1)
		this.capacity = 0
	}

	getSectorsCount(capacity) {
		if(!capacity) return 2
		if(capacity <= 1) return 2
		if(capacity <= 4) return 3
		if(capacity <= 8) return 4
		if(capacity <= 13) return 5
		return 6
	}

	getMultiplier(capacity) {
		if(!capacity) return 1
		if(capacity <= 1) return 1
		if(capacity <= 4) return 2
		if(capacity <= 8) return 3
		if(capacity <= 13) return 4
		return 5
	}

	getElapsedCapacity(sectorsCount) {
		switch(sectorsCount) {
			case 2: return 0
			case 3: return 2
			case 4: return 5
			case 5: return 9
			case 6: return 14
		}
	}

	setTimeScale(scale) {
		this.timeScale = scale
		this.timeline.setTimeScaleFactor({name: 'scale', value: scale})

		for(const view of this.flyingMultipliersViews) {
			view.timeline.setTimeScaleFactor({name: 'scale', value: scale})
			view.setTimeScale({timeScale: scale})
		}
	}

	presentMultiplierIntro({
		sourceView,
		capacity = 1,
	}) {
		const multiplierView = this.getNextFlyingMultiplier()
		multiplierView.playAnimation({name: 'yellow_1_x' + capacity + '_plus'})
		multiplierView.setTimeScale({timeScale: this.timeScale})

		return multiplierView
			.timeline
			.deleteAllAnimations()
			.setTimeScaleFactor({name: 'scale', value: this.timeScale})
			.addAnimation({
				duration: 1000,
				onProgress: (progress) => {
					const sourceGlobalPosition = sourceView.getGlobalPosition()
					const targetGlobalPosition = this.contentContainer.getGlobalPosition()
					const deltaX = sourceGlobalPosition.x - targetGlobalPosition.x
					const deltaY = sourceGlobalPosition.y - targetGlobalPosition.y

					multiplierView.scale.set(this.scale.x)
					multiplierView.position.set(
						sourceGlobalPosition.x - deltaX * progress,
						sourceGlobalPosition.y - deltaY * progress)

					this.camera
						.focus({view: multiplierView})
						.setZoom(1 + 0.25 * progress ** 2)
				},
			})
			.addAnimation({
				delay: 1000,
				duration: 1000,
				onProgress: (progress) => {
					const subProgress = Math.abs(Math.sin(Math.PI * 2 * ((progress * 2) % 1) ))

					this.glowView.alpha = subProgress
					this.glowView.scale.set(1 + 0.1 * subProgress)
					this.camera
						.focus({view: multiplierView})
						.setZoom(1.25 - 0.25 * progress)
				},
			})
			.windToTime(1)
			.play()
	}

	presentMultiplierOutro({targetView, multiplier = 1}) {
		if(multiplier === 1) return

		const multiplierView = this.getNextFlyingMultiplier()

		return multiplierView
			.timeline
			.deleteAllAnimations()
			.addAnimation({
				delay: 500,
				duration: 1000,
				onDelayFinish: () => {
					multiplierView.playAnimation({name: 'yellow_1_x' + multiplier })
				},
				onProgress: (progress) => {
					const sourceGlobalPosition = this.contentContainer.getGlobalPosition()
					const targetGlobalPosition = targetView.getGlobalPosition()
					const deltaX = sourceGlobalPosition.x - targetGlobalPosition.x
					const deltaY = sourceGlobalPosition.y - targetGlobalPosition.y

					multiplierView.scale.set(this.scale.x)
					multiplierView.position.set(
						sourceGlobalPosition.x - deltaX * progress,
						sourceGlobalPosition.y - deltaY * progress,
					)

					this.camera
						.focus({view: multiplierView})
						.setZoom(1 + 0.25 * progress ** 2)
				},
			})
			.windToTime(1)
			.play()
	}

	presentRecharge(harvestedCapacity) {
		if(!harvestedCapacity) return
		if(harvestedCapacity < 0 && !this.capacity) return
		
		const initialSectorsCount = this.getSectorsCount(this.capacity)
		const progressPerSector = 1 / initialSectorsCount
		const initialBarProgress = progressPerSector * (this.capacity - this.getElapsedCapacity(initialSectorsCount))
		const barProgressDelta = harvestedCapacity * progressPerSector
		const initialCapacity = this.capacity
		const finalCapacity = initialCapacity + harvestedCapacity
		const finalSectorsCount = this.getSectorsCount(finalCapacity)
		const sectorsCountDelta = finalSectorsCount - initialSectorsCount
		const capacityOffset = finalCapacity - this.getElapsedCapacity(finalSectorsCount)
		const finalBarProgress = capacityOffset / finalSectorsCount
		const initialMultiplier = this.getMultiplier(this.capacity)
		const multiplierDelta = this.getMultiplier(finalCapacity) - initialMultiplier
		
		this.capacity = Math.max(0, finalCapacity)

		if(initialCapacity && harvestedCapacity < 0) {
			this.reset()
			return this
				.timeline
				.deleteAllAnimations()
				.addAnimation({
					duration: 500,
					onProgress: (progress) => {
						const inversedProgress = 1 - progress

						this.setBarProgress(initialBarProgress * inversedProgress)
						this.setMultiplier(Math.max(1, initialMultiplier * inversedProgress))
						this.setSectorsCount(Math.max(2, initialSectorsCount * inversedProgress))
					},
				})
				.windToTime(1)
				.play()
		}

		return this
			.timeline
			.deleteAllAnimations()
			.addAnimation({
				delay: 1000,
				duration: 500,
				onProgress: (progress) => {
					this.setBarProgress(initialBarProgress + barProgressDelta * progress)
				},
			})
			.addAnimation({
				delay: 1500,
				duration: 500,
				onProgress: (progress) => {
					this.setSectorsCount(initialSectorsCount + sectorsCountDelta * (progress +0.001))
					if(finalSectorsCount > initialSectorsCount)
						this.setBarProgress(finalBarProgress * progress)
					this.setMultiplier(initialMultiplier + multiplierDelta * progress)
				},
			})
			.play()
	}

	setFreeSpinsMode(isFreeSpinMode = true) {
		this.isFreeSpinMode = isFreeSpinMode
		this.onResize()
	}
}