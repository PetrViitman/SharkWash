import { Container, Sprite } from "pixi.js";
import { AdaptiveContainer } from "../adaptiveDesign/AdaptiveContainer";
import { TextField } from "../text/TextField";
import { Timeline } from "../../timeline/Timeline";

const TEASER_WIDTH = 804
const TEASER_HEIGHT = 650
const LOGO_OFFSET = 400

export class TeasersView extends AdaptiveContainer {
	teasersViews
	textField
	timeline = new Timeline
	
	constructor({
		resources,
		dictionary,
		isMobileDevice
	}) {
		super()
	
		this.initTeasers(resources, dictionary)
		this.initTextField(dictionary, isMobileDevice)
		this.alpha = 0
	}

	initTeasers(resources, dictionary) {
		this.teasersViews = [
			{
				text: dictionary.free_spins_teaser_bmp,
				texture: resources.splash_default_game
			},
			{
				text: dictionary.wild_multipliers_teaser_bmp,
				texture: resources.splash_free_spins
			},
		].map(({text, texture}) => {
			const container = this.addChild(new Container)
			container.addChild(new Sprite(texture))
			container.addChild(new TextField({
					maximalWidth: TEASER_WIDTH,
					maximalHeight: 150
				}))
				.setFontName('SharkWash')
				.setFontSize(50)
				.setText(text)
				.setAlignCenter()
				.setAlignMiddle()
				.setFontColor(0xCCFF3b)
				.y = 550

			return container
		})
	}

	initTextField(dictionary, isMobileDevice) {
		const textField = this.addChild(new TextField({
				maximalWidth: TEASER_WIDTH,
				maximalHeight: 200
			}))
			.setFontName('SharkWash')
			.setFontSize(50)
			.setText(dictionary[
				(isMobileDevice ? 'tap' : 'click')
				+ '_anywhere_to_continue_bmp'
			])
			.setAlignCenter()
			.setAlignMiddle()
			.setFontColor(0xFFCC3b)

		textField.pivot.set(TEASER_WIDTH / 2, 100)
		textField.timeline = new Timeline()
            .addAnimation({
                duration: 1500,
                onProgress: (progress) => {
                    textField.scale.set(
                        1,
                        1 + 0.1  * (1 - progress) * Math.cos(Math.PI * 2 * ((progress * 5) % 1)))
                },

            })
			.setLoopMode()

		textField.timeline.play()

		this.textField = textField
	}

	updateTargetArea(sidesRatio) {
		const {
			teasersViews,
			textField
		} = this
		
		if(sidesRatio > 1) {
			teasersViews[0].position.set(0, LOGO_OFFSET)
			teasersViews[1].position.set(TEASER_WIDTH, LOGO_OFFSET)
			textField.position.set(TEASER_WIDTH, LOGO_OFFSET + TEASER_HEIGHT + 100)
			this.setSourceArea({width: TEASER_WIDTH * 2, height: LOGO_OFFSET + TEASER_HEIGHT + 200})
				.setTargetArea({x: 0, y: 0, width: 1, height: 1})
		} else {
			teasersViews[0].position.set(0, LOGO_OFFSET)
			teasersViews[1].position.set(0, LOGO_OFFSET + TEASER_HEIGHT)
			textField.position.set(TEASER_WIDTH / 2, LOGO_OFFSET + TEASER_HEIGHT * 2 + 100)
			this.setSourceArea({width: TEASER_WIDTH, height: LOGO_OFFSET + TEASER_HEIGHT * 2 + 200})
				.setTargetArea({x: 0.05, y: 0, width: 0.9, height: 1})
		}
	}

	presentTeasers() {
		return this
			.timeline
            .addAnimation({
                duration: 500,
                onProgress: (progress) => {
					this.alpha = progress
                },

            })
			.windToTime(1)
            .play()
	}
}