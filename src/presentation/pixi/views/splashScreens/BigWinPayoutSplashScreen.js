import { SpineView } from "../SpineView";
import { TextField } from "../text/TextField";
import { BaseSplashScreen } from "./BaseSplashScreen";
import { CoinView } from "../coins/CoinView";
import { Timeline } from "../../timeline/Timeline";
import { formatMoney } from "../../Utils";
import { Container } from "pixi.js";
import { WIN_COEFFICIENTS } from "../../Constants";

const COINS_GROUPS = {
	BIG_WIN: [
		{
			spawnX: 600,
			spawnY: 975,
			firstCoinIndex: 0,
			coinsCount: 5,
		}
	],
	HUGE_WIN: [
		{
			spawnX: 300,
			spawnY: 600,
			firstCoinIndex: 0,
			coinsCount: 5,
		},
		{
			spawnX: 750,
			spawnY: 600,
			firstCoinIndex: 5,
			coinsCount: 5,
		},
	],
	MEGA_WIN: [
		{
			spawnX: 250,
			spawnY: 1050,
			firstCoinIndex: 0,
			coinsCount: 3,
		},
		{
			spawnX: 750,
			spawnY: 1050,
			firstCoinIndex: 3,
			coinsCount: 3,
		},
		{
			spawnX: 200,
			spawnY: 500,
			firstCoinIndex: 6,
			coinsCount: 3,
		},
		{
			spawnX: 850,
			spawnY: 500,
			firstCoinIndex: 9,
			coinsCount: 3,
		},
	]
}

export class BigWinPayoutSplashScreen extends BaseSplashScreen {
	countingTimeline = new Timeline
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
		
		this.spineView = bodyView.addChild(new SpineView(resources.big_win.spineData))
		this.spineView.position.set(500, 775)

		this.coinsContainer = bodyView.addChild(new Container)
		this.coinsViews = new Array(12).fill(0).map(_ =>
			this.coinsContainer.addChild(new CoinView(resources)))

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

		this.captionTextField = bodyView.addChild(
			new TextField({
				maximalWidth: 1000,
				maximalHeight: 200
			}))
			.setFontName('SharkWash')
			.setFontSize(200)
			.setAlignCenter()
			.setAlignMiddle()

		this.captionTextField.pivot.set(500, 100)
		this.captionTextField.position.set(500, 245)

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
		this.payoutTextField.position.set(500, 1275)
		this.payoutTextField.pivot.set(500, 75)
	
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
	}

	setCoinsProgress(
		progress = 0,
		coinsDescriptor,
	) {
		const {
			firstCoinIndex,
			coinsCount,
			spawnX,
			spawnY,
		} = coinsDescriptor

		for (let i = 0;  i < coinsCount; i++) {
			const coinView = this.coinsViews[i + firstCoinIndex]
			const shiftedProgress = (progress + i * 0.2) % 1
			const finalProgress = shiftedProgress ** 2

			coinView.alpha = Math.sin(Math.PI * shiftedProgress)
			coinView.spin(shiftedProgress * Math.PI * 2 )
			coinView.flip( (shiftedProgress + 0.25 * i) % 1)

			coinView.position.set(
				spawnX + (200 * Math.cos(Math.PI * 0.4 * i )) * finalProgress,
				spawnY + 300 * finalProgress,
			)

			coinView.scale.set(Math.min(1, (1 - finalProgress) * 10))
		}
	}

	setupCoinsDrop(coinsDescriptors) {
		const { firstCoinIndex, coinsCount } = coinsDescriptors[coinsDescriptors.length - 1]
		const finalCoinIndex = firstCoinIndex + coinsCount

		this.coinsViews.forEach((view, i) =>
			view.visible = i < finalCoinIndex)

		this.coinsTimeline
			.deleteAllAnimations()
			.addAnimation({
				duration: 1500,
				onProgress: (progress) => {
					coinsDescriptors.forEach((coinsDescriptor, i) => {
						this.setCoinsProgress(
							progress + (i * 0.2) % 1,
							coinsDescriptor
						)
					})
				}
			})
			.setLoopMode()
			.play()
	}

	addSubWinAnimation({
		timeline,
		isFinalSubWin = true,
		spineAnimationName = 'big_win',
		fontColor = 0xCCFF3b,
		coinsDescriptor = COINS_GROUPS.BIG_WIN,
		text = '',
	}) {
		const {
			spineView,
			coinsContainer,
			captionTextField,
		} = this
	
		const delay = timeline.duration || 1
		const duration = isFinalSubWin ? 3000 : 2750

		timeline
		// WIN PRESENTATION...
			.addAnimation({
				delay,
				duration: 300,
				onDelayFinish: () => {
					captionTextField
						.setFontColor(fontColor)
						.setText(text)
					spineView.playAnimation({
						name: spineAnimationName,
						isLoopMode: true
					})
					this.setupCoinsDrop(coinsDescriptor)
				},
				onProgress: (progress) => {
					const reversedProgress = 1 - progress
					captionTextField.alpha = progress ** 2
					coinsContainer.alpha = captionTextField.alpha
					captionTextField.y = 245 + 200 * reversedProgress
					const scaleProgress = Math.sin(Math.PI * progress)
					spineView.scale.set(1 + 0.2 * scaleProgress)
				}
			})
			.addAnimation({
				delay,
				duration,
				onProgress: (progress) => {
					const scaleProgress = Math.abs(Math.cos(Math.PI * 2 * ((progress * 3) % 1))) 
					captionTextField.scale.set(1 - 0.1 * scaleProgress)
				}
			})
		// ...WIN PRESENTATION

		// FADE AWAY TO NEXT SUB WIN...
		isFinalSubWin || timeline
			.addAnimation({
				delay: delay + duration,
				duration: 250,
				onProgress: (progress) => {
					const reversedProgress = 1 - progress

					spineView.scale.set(reversedProgress)
					captionTextField.scale.set(reversedProgress)
					coinsContainer.alpha = reversedProgress
				}
			})
		// ...FADE AWAY TO NEXT SUB WIN
	}

	async presentPayout({
		coefficient, 
		payout
	}) {
		const {
			spineView,
			dictionary,
			captionTextField,
			timeline,
			countingTimeline
		} = this

		this.coinsContainer.alpha = 0
		captionTextField.alpha = 0
		spineView.scale.set(0)

		await this.setVisible()

		timeline.deleteAllAnimations()

		const isHugeWin = coefficient >= WIN_COEFFICIENTS.HUGE
		const isMegaWin = coefficient >= WIN_COEFFICIENTS.MEGA

		this.addSubWinAnimation({
			timeline,
			text: dictionary.big_win_bmp,
			fontColor: 0x3bCCFF,
			spineAnimationName: 'big_win',
			isFinalSubWin: !isHugeWin && !isMegaWin,
			coinsDescriptor: COINS_GROUPS.BIG_WIN
		})

		isHugeWin
		&& this.addSubWinAnimation({
			timeline,
			text: dictionary.huge_win_bmp,
			fontColor: 0xCCFF3b,
			spineAnimationName: 'mega_win',
			isFinalSubWin: !isMegaWin,
			coinsDescriptor: COINS_GROUPS.HUGE_WIN
		})

		isMegaWin
		&& this.addSubWinAnimation({
			timeline,
			text: dictionary.mega_win_bmp,
			fontColor: 0xFF3b00,
			spineAnimationName: 'epic_win',
			coinsDescriptor: COINS_GROUPS.MEGA_WIN
		})

		timeline.play()


		let countingDuration = 3000
		if(isHugeWin) countingDuration += 3000
		if(isMegaWin) countingDuration += 3000
		countingTimeline
			.deleteAllAnimations()
			.addAnimation({
				duration: countingDuration,
				onProgress: (progress) => {
					this.payoutTextField.setText(formatMoney(payout * progress))

					const scaleProgress = Math.abs(Math.cos(Math.PI * ((progress * 10) % 1)))
					this.payoutTextField.scale.set(1 - 0.25 * scaleProgress)
				}
			})
			.play()

		await new Promise(resolve => {
			countingTimeline.addAnimation({
				duration: countingTimeline.duration + 3000,
				onFinish: resolve
			})

			this.eventMode = 'static'
			this.cursor = 'pointer'
			this.on('pointerdown', resolve)
		})

		this.removeAllListeners()
		this.eventMode = 'none'
		this.cursor = 'default'

		await this.setVisible(false)
		this.coinsTimeline.pause()
		this.spineView.reset()
	}
}