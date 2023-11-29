import { Timeline } from "../../timeline/Timeline";
import { SpineView } from "../SpineView";
import { TextField } from "../text/TextField";
import { BaseSplashScreen } from "./BaseSplashScreen";

export class BonusAwardSplashScreen extends BaseSplashScreen {
	cameraTimeline = new Timeline

	initBody() {
		const {
			resources,
			dictionary,
			isMobileDevice
		} = this

		super.initBody({
			width: 1000,
			height: 1200
		})

		const { bodyView } = this
		
		this.spineView = bodyView.addChild(new SpineView(resources.bonus_mode_splash.spineData))
		this.spineView.position.set(500, 600)

		bodyView.addChild(
			new TextField({
				maximalWidth: 1000,
				maximalHeight: 125
			}))
			.setFontName('SharkWash')
			.setText(dictionary.congratulations_bmp)
			.setFontColor(0xFFCC3b)
			.setFontSize(90)
			.setAlignCenter()
			.setAlignMiddle()
			.y = 25

		bodyView.addChild(new TextField({
				maximalWidth: 1000,
				maximalHeight: 90
			}))
			.setFontName('SharkWash')
			.setText(dictionary.you_have_won_bmp)
			.setFontColor(0xCCFF3b)
			.setFontSize(75)
			.setAlignCenter()
			.setAlignBottom()
			.y = 150

		this.spinsCountTextField = bodyView
			.addChild(new TextField({
				maximalWidth: 1000,
				maximalHeight: 90
			}))
			.setFontName('SharkWash')
			.setFontColor(0xCCFF3b)
			.setFontSize(75)
			.setAlignCenter()
			.setAlignMiddle()

		this.spinsCountTextField.y = 240
	
		bodyView.addChild(
			new TextField({
				maximalWidth: 1000,
				maximalHeight: 90
			}))
			.setFontName('SharkWash')
			.setText(dictionary[
				(isMobileDevice ? 'tap' : 'click')
				+ '_anywhere_to_continue_bmp'
			])
			.setFontColor(0xFFCC3b)
			.setFontSize(90)
			.setAlignCenter()
			.setAlignMiddle()
			.y = 1060
	}

	async presentAward(freeSpinsCount = 0) {
		this.spinsCountTextField.setText(
			freeSpinsCount + ' ' + this.dictionary.free_spins_bmp)
		this.spineView.playAnimation({
			name: 'animation',
			isLoopMode: true
		})

		this.cameraTimeline
			.deleteAllAnimations()
			.addAnimation({
				duration: 500,
				onProgress: (progress) => {
					this.camera
						.focus({
							view: this.spineView,
						})
						.setZoom(1 + 0.05 * Math.sin(Math.PI * progress))
				}
			})
			.play()

		await super.setVisible()


		await new Promise(resolve => {
			this.eventMode = 'static'
			this.cursor = 'pointer'
			this.on('pointerdown', () => {
				this.removeAllListeners()
				this.eventMode = 'none'
				this.cursor = 'default'
				this.spineView.playAnimation({
					name: 'click',
				})
				resolve()
			})
		})

		return this.setVisible(false)
	}
}