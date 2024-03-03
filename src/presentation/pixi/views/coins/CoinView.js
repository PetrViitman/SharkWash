import { Sprite, MIPMAP_MODES, Container } from 'pixi.js'
import { brightnessToHexColor, getLightSpot } from '../GraphicalPrimitives'

export class CoinView extends Container {
	container
	glowView
	tailsView
	ribView
	stretchView
	headsView
	flipProgress
	angle
	flipProgress = 0
	spinProgress = 0

	constructor(resources, glowColor) {
		super()

		resources.coin_face.baseTexture.mipmap = MIPMAP_MODES.OFF
		resources.coin_stretch.baseTexture.mipmap = MIPMAP_MODES.OFF
		resources.coin_rib.baseTexture.mipmap = MIPMAP_MODES.OFF

		this.container = this.addChild(new Container())

		glowColor && this.initGlow(glowColor)
		this.initRibView(resources)
		this.initStretchView(resources)
		this.initTailsView(resources)
		this.initHeadsView(resources)
	}

	spin(angle) {
		this.spinProgress = angle
		this.container.rotation = angle
	}

	flip(progress) {
		const {
			tailsView,
			ribView,
			stretchView,
			headsView,
		} = this

		const flipProgress = progress % 1
		this.flipProgress = flipProgress
		let distortion = 0

		headsView.visible = false
		tailsView.visible = false

		const halfThickness = ribView.width / 2

		if (flipProgress < 0.25) {
			distortion = flipProgress * 4
			headsView.visible = true
			headsView.scale.x = distortion

			const offset = Math.min(1, (1 - distortion) * 3)
			headsView.x = (offset * halfThickness)
			stretchView.x = (-offset * halfThickness)

			headsView.tint = brightnessToHexColor(distortion)
			ribView.tint = brightnessToHexColor(1 - distortion)
			stretchView.tint = brightnessToHexColor(1 - distortion)
		} else if (flipProgress < 0.5) {
			const offset = Math.min(1, (1 - distortion) * 3)

			// HEADS...
			distortion = 1 - (flipProgress - 0.25) * 4

			headsView.visible = true
			headsView.scale.x = distortion
			headsView.x = (-offset * halfThickness)
			// ...HEADS

			stretchView.x = (offset * halfThickness)

			const brightenTint = brightnessToHexColor(distortion * 2)
			const darkenTint = brightnessToHexColor((1 - distortion) * 2)

			headsView.tint = brightenTint
			ribView.tint = darkenTint
			stretchView.tint = darkenTint
		} else if (flipProgress < 0.75) {
			const offset = Math.min(1, (1 - distortion) * 3)

			// TAILS...
			distortion = (flipProgress - 0.5) * 4

			tailsView.visible = true
			tailsView.scale.x = distortion
			tailsView.x = (offset * halfThickness)
			// ...TAILS

			stretchView.x = (-offset * halfThickness)

			const brightenTint = brightnessToHexColor(distortion * 2)
			const darkenTint = brightnessToHexColor((1 - distortion) * 2)

			tailsView.tint = brightenTint
			ribView.tint = darkenTint
			stretchView.tint = darkenTint
		} else {
			const offset = Math.min(1, (1 - distortion) * 3)

			// TAILS...
			distortion = 1 - (flipProgress - 0.75) * 4

			tailsView.visible = true
			tailsView.scale.x = distortion
			tailsView.x = (-offset * halfThickness)
			// ...TAILS

			stretchView.x = (offset * halfThickness)

			const brightenTint = brightnessToHexColor(distortion * 2)
			const darkenTint = brightnessToHexColor((1 - distortion) * 2)

			tailsView.tint = brightenTint
			ribView.tint = darkenTint
			stretchView.tint = darkenTint
		}

		// MIDDLE...
		stretchView.scale.x = distortion
		ribView.scale.x = 1 - distortion
		this.glowView?.scale.set(1 + distortion, 2)
		// ...MIDDLE
	}

	initGlow(color) {
		this.glowView = getLightSpot({color, intensity: 0.15, radius: 30})
		this.container.addChild(this.glowView)
	}

	initTailsView(resources) {
		this.tailsView = this.container.addChild(new Sprite(resources.coin_face))
		this.tailsView.anchor.set(0.5)
	}

	initRibView(resources) {
		this.ribView = this.container.addChild(new Sprite(resources.coin_rib))
		this.ribView.anchor.set(0.5)
	}

	initStretchView(resources) {
		this.stretchView = this.container.addChild(new Sprite(resources.coin_stretch))
		this.stretchView.anchor.set(0.5)
	}

	initHeadsView(resources) {
		this.headsView = this.container.addChild(new Sprite(resources.coin_face))
		this.headsView.anchor.set(0.5)
	}
}
