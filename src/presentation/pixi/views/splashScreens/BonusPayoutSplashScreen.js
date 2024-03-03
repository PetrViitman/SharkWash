import { Timeline } from "../../timeline/Timeline";
import { SpineView } from "../SpineView";
import { CoinView } from "../coins/CoinView";
import { TextField } from "../text/TextField";
import { BaseSplashScreen } from "./BaseSplashScreen";

export class BonusPayoutSplashScreen extends BaseSplashScreen {
	coinsTimeline = new Timeline

	initBody() {
		const {
			resources,
			dictionary,
			isMobileDevice
		} = this

		super.initBody({
			resources,
			width: 1000,
			height: 1500
		})

		const { bodyView } = this
		
		bodyView.setTargetArea({
			x: 0,
			y: 0,
			width: 1,
			height: 0.9
		})
		
		this.spineView = bodyView.addChild(new SpineView(resources.bonus_payout_splash.spineData))
		this.spineView.position.set(500, 775)

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

		bodyView.addChild(
			new TextField({
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

		this.payoutTextField = bodyView.addChild(
			new TextField({
				maximalWidth: 1000,
				maximalHeight: 150
			}))
			.setFontName('SharkWash')
			.setFontColor(0xFFCC3b)
			.setFontSize(150)
			.setAlignCenter()
			.setAlignMiddle()
		this.payoutTextField.y = 1200
	
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
			.setFontColor(0xCCFF3b)
			.setFontSize(90)
			.setAlignCenter()
			.setAlignMiddle()
			.y = 1355

		this.coinsViews = new Array(5).fill(0).map(_ =>
			bodyView.addChild(new CoinView(resources)))
	}

	async presentPayout(payout = 0) {		
		this.coinsTimeline
			.deleteAllAnimations()
			.addAnimation({
				duration: 1000,
				onProgress: (progress) => {
					this.coinsViews.forEach((coinView, i) => {
						const shiftedProgress = (progress + i * 0.2) % 1
						const finalProgress = shiftedProgress ** 2

						coinView.alpha = Math.min(1, shiftedProgress * 3)
						coinView.spin(shiftedProgress * Math.PI * 2 )
						coinView.flip( (shiftedProgress + 0.25 * i) % 1)

						coinView.position.set(
							600 + (200 * Math.cos(Math.PI * 2 * 1 / 5 * i )) * finalProgress,
							500 + 500 * finalProgress,
						)
						coinView.scale.set(1 + 0.2 * finalProgress)
					})
				}
			})
			.setLoopMode()
			.play()
		
		this.payoutTextField.setText(payout + '')
		this.spineView.playAnimation({
			name: 'animation',
			isLoopMode: true
		})

		await this.setVisible()

		await new Promise(resolve => {
			this.timeline
				.deleteAllAnimations()
				.addAnimation({
					duration: 5000,
					onFinish: resolve
				})
				.play()

			this.eventMode = 'static'
			this.cursor = 'pointer'
			this.on('pointerdown', resolve)
		})

		this.removeAllListeners()
		this.eventMode = 'none'
		this.cursor = 'default'

		await this.setVisible(false)
		this.coinsTimeline.pause()
	}
}