import { Application, settings, MIPMAP_MODES, Ticker, BitmapFont } from "pixi.js"
import { AdaptiveContainer } from "./views/adaptiveDesign/AdaptiveContainer"
import { Timeline } from "./timeline/Timeline"
import { BackgroundView } from "./views/BackgroundView"
import { MultiplierView } from "./views/multiplier/MultiplierView"
import { getPreloadingResources, getResources } from "./Loader"
import { ReelsView } from "./views/reels/ReelsView"
import { mountVueUI } from "./views/vueUI/VueUI.vue"
import { VueUIContainer } from "./views/vueUI/VueUIContainer"
import { formatMoney } from "./Utils"
import { TURBO_MODE_TIME_SCALE, WIN_COEFFICIENTS } from "./Constants"
import { BonusAwardSplashScreen } from "./views/splashScreens/BonusAwardSplashScreen"
import { BonusPayoutSplashScreen } from "./views/splashScreens/BonusPayoutSplashScreen"
import { TransitionView } from "./views/TransitionView"
import { ForegroundView } from "./views/foreground/ForegroundView"
import { FirefliesPoolView } from "./views/particles/FirefliesPoolView"
import { LoadingScreen } from "./views/loadingScreen/LoadingScreen"
import { getVFXLevel } from "./Benchmark"
import { BigWinPayoutSplashScreen } from "./views/splashScreens/BigWinPayoutSplashScreen"
import { Camera } from "./views/adaptiveDesign/Camera"

const locales = import.meta.glob('../../../public/pixi/translations/*.json')

settings.MIPMAP_MODES = MIPMAP_MODES.ON

export class Presentation {
	resources
	pixiApplication
	loadingScreen
	backgroundView
	foregroundView
	reelsView
	multiplierView
	transitionView
	bonusAwardSplashScreen
	bonusPayoutSplashScreen
	bigWinPayoutSplashScreen
	vueContext
	remainingAutoSpinsCount = 0
	isTurboMode
	vfxLevel
	isMobileDevice
	camera
	languageCode

	constructor({
		wrapperHTMLElementId,
		customVFXLevel,
		customUIOption,
		languageCode,
	}) {
		this.vueContext = mountVueUI(wrapperHTMLElementId)
		this.languageCode = languageCode

		// UI OPTION DETECT...
		this.isMobileDevice =
			'ontouchstart' in window
			|| navigator.maxTouchPoints > 0 
			|| navigator.msMaxTouchPoints > 0
		
		if (customUIOption === 'mobile')
			this.isMobileDevice = true
		else if (customUIOption === 'desktop')
			this.isMobileDevice = false
		// ...UI OPTION DETECT

		// ADJUSTING RESOLUTION...
		this.pixiApplication = new Application()
		const highestResolution = window.devicePixelRatio
		const lowestResolution = this.isMobileDevice ? Math.min(1.5, highestResolution) : 1
		const resolutionDelta = highestResolution - lowestResolution
		const vfxLevel = customVFXLevel ?? getVFXLevel(this.pixiApplication)
		const finalVFXLevel = Math.min(1, Math.max(0, vfxLevel))
		this.pixiApplication.renderer.resolution = lowestResolution + resolutionDelta * finalVFXLevel
		this.vfxLevel = finalVFXLevel
		// ...ADJUSTING RESOLUTION

		// CANVAS APPENDING...
		Object.assign(this.pixiApplication.view.style, {
			width: '100%',
			height: '100%',
			position: 'absolute',
			'z-index': 1,
		})
		document.getElementById(wrapperHTMLElementId)
				.appendChild(this.pixiApplication.view)
		// ...CANVAS APPENDING


		AdaptiveContainer.install(this.pixiApplication, true)
		
		let timeStampFPS = 0
		Ticker.shared.add(() => {
			Timeline.update()

			const currentTime = Date.now()
			if(currentTime - timeStampFPS < 1000) return

			timeStampFPS = currentTime
			this.vueContext.refresh({FPS: Math.trunc(Ticker.shared.FPS)})
		})
	}

	async init({
		initialReels,
		currencyCode,
		betsOptions,
		buyFeatureOptions,
		balance,
		bet,
		coefficients,
	}) {
		// FETCHING DICTIONARY...
		const prefix = '../../../public/pixi/translations/'
		if (!locales[prefix + this.languageCode + '.json'])
			this.languageCode = 'en'

		this.dictionary = await locales[prefix + this.languageCode + '.json']()
		// ...FETCHING DICTIONARY

		const {stage} = this.pixiApplication
		this.resources = await getPreloadingResources()
		this.initBitmapFonts()
		this.initLoadingScreen()
		this.initFireflies()
		AdaptiveContainer.onResize()

		this.resources = await getResources((progress) => {
			this.loadingScreen.setProgress(progress)
		})


		this.initCamera()
		this.initBackground()
		this.initReels(initialReels, coefficients)
		this.initForeground()
		this.initMultiplier()
		this.initSplashScreens()
		this.initVueUIContainer()
		stage.addChild(this.loadingScreen)
		this.firefliesPoolView && stage.addChild(this.firefliesPoolView)
		this.initTransition()

		AdaptiveContainer.onResize()

		this.vueContext.refresh({
			dictionary: this.dictionary,
			currencyCode,
			betsOptions: betsOptions.map(value => formatMoney(value)),
			autoSpinsValues: [5, 10, 25, 50, 100, Infinity],
			buyFeatureOptions: buyFeatureOptions.map(value => formatMoney(value)),
			balance: formatMoney(balance),
			payout: formatMoney(0),
			bet: formatMoney(bet),
		})

		await this.preRender()
		await this
			.loadingScreen
			.presentTeasers({
				resources: this.resources,
				dictionary: this.dictionary,
				isMobileDevice: this.isMobileDevice})

		this.vueContext.refresh({activePopupName: ''})

		await this.loadingScreen.hide((progress) => {
			this.vueContext.refresh({uiAlpha: progress})
		})
		this.loadingScreen.destroy()
		

		this.vueContext.onAutoplaySpinsCountChange = (spinsCount) => {
			this.remainingAutoSpinsCount = spinsCount
		}

		this.vueContext.onTurboToggle = (isTurboMode) => {
			this.gamePlayTimeScale = isTurboMode ? TURBO_MODE_TIME_SCALE : 1
			this.isTurboMode = isTurboMode
			this.setGamePlayTimeScale()
		}

		this.vueContext.onSkipRequested = () => {
			this.setGamePlayTimeScale(10)
		}
	}

	initLoadingScreen() {
		const {
			pixiApplication: {stage},
			resources,
			dictionary,
		} = this

		this.loadingScreen = stage
		.addChild(new LoadingScreen(
			resources,
			dictionary
		))
	}

	initBackground() {
		const {
			pixiApplication: {stage},
			resources,
			vfxLevel
		} = this

		this.backgroundView = stage.addChild(new BackgroundView({resources, vfxLevel}))
	}

	initForeground() {
		const {
			pixiApplication: {stage},
			resources
		} = this

		this.foregroundView = stage.addChild(new ForegroundView(resources))
	}

	initReels(initialSymbolsIds, coefficients) {
		const {
			pixiApplication: {stage},
			resources,
			dictionary,
			vfxLevel,
			isMobileDevice,
			camera
		} = this

		this.reelsView = stage.addChild(
			new ReelsView({
				initialSymbolsIds,
				resources,
				dictionary,
				coefficients,
				vfxLevel,
				isMobileDevice,
				camera
			}))
	}

	initMultiplier() {
		const {
			pixiApplication: {stage},
			resources,
			camera
		} = this

		this.multiplierView = stage.addChild(new MultiplierView({resources, camera}))
		this.reelsView.multiplierView = this.multiplierView
	}

	initFireflies() {
		if (this.vfxLevel < 0.5) return

		const { pixiApplication: { stage }} = this

		this.firefliesPoolView = stage
			.addChild(
				new FirefliesPoolView({
					scaleFactor: 1,
					color: 0x00FFFF,
					spawnArea: {
						x: 0,
						y: 0,
						width: 1,
						height: 1
					}
				})
			)
	}

	initSplashScreens() {
		const {
			pixiApplication: {stage},
			resources,
			dictionary,
			isMobileDevice,
			camera
		} = this

		this.bonusAwardSplashScreen = stage
			.addChild(new BonusAwardSplashScreen({
				camera,
				resources,
				dictionary,
				isMobileDevice
			}))
		this.bonusPayoutSplashScreen = stage
			.addChild(new BonusPayoutSplashScreen({
				camera,
				resources,
				dictionary,
				isMobileDevice
			}))
		this.bigWinPayoutSplashScreen = stage
			.addChild(new BigWinPayoutSplashScreen({
				camera,
				resources,
				dictionary,
				isMobileDevice
			}))
	}

	initTransition() {
		const {
			pixiApplication: { stage },
			camera,
			reelsView
		} = this

		this.transitionView = stage.addChild(
			new TransitionView({camera, reelsView}))
	}

	initCamera() {
		this.camera = new Camera(this.pixiApplication.stage)
	}

	initVueUIContainer() {
		const {
			vueContext,
			isMobileDevice,
			pixiApplication: {stage}
		} = this
		stage.addChild(new VueUIContainer({vueContext, isMobileDevice}))
	}

	async initBitmapFonts() {
		const bitmapPhrases = []
		for (const [key, value] of Object.entries(this.dictionary))
			if (key.includes('_bmp'))
				bitmapPhrases.push(value)

		BitmapFont.from(
			"SharkWash",
			{
				fontFamily: "bangopro",
				dropShadow: true,
				dropShadowDistance: 10,
				dropShadowAngle: Math.PI / 2,
				dropShadowColor: 0x555555,
				fontWeight: 'bold',
				fontSize: 100,
				fill: ['#FFFFFF', '#AAAAAA'],
			},
			{
				chars: [
					...new Set(bitmapPhrases.join('').split('')),
					...'0123456789x:,.'
				]
			}
		)

		BitmapFont.from(
			"Multiplier",
			{
				fontFamily: "bangopro",
				fontSize: 100,
				fill: '#FFFFFF',
			},
			{
				chars: '12345x'
			}
		)
	}

	preRender() {
		this.reelsView.preRenderSymbols()

		return new Promise(resolve => {
			const {stage} = this.pixiApplication
			stage.drawnFramesCount = 0
			const baseRender = stage.render.bind(stage)
			const render = (renderer) => {
				baseRender(renderer)
				stage.drawnFramesCount++
				if (stage.drawnFramesCount > 10) {
					stage.render = baseRender
					this.reelsView.onPreRendered()
					resolve()
				}
			}

			stage.render = render.bind(stage)
		})
	}


	// API...
	destroy() {
		AdaptiveContainer.uninstall()
		Ticker.shared.stop()
		this.pixiApplication.stage.destroy(true)
		Timeline.destroy()
	}

	setGamePlayTimeScale(scale = 1) {
		const turboMultiplier = this.isTurboMode ? TURBO_MODE_TIME_SCALE : 1
		const finalTimeSale = scale * turboMultiplier
		this.reelsView.setTimeScale(finalTimeSale)
		this.multiplierView.setTimeScale(finalTimeSale)
	}

	async getUserInput({
		bet,
		balance,
		currencyCode,
	}) {
		this.setGamePlayTimeScale()
		this.vueContext.refresh({
			bet: formatMoney(bet),
			balance: formatMoney(balance),
			currencyCode,
			isSpinExpected: true,
			isSkipExpected: false,
		})

		this.reelsView.refreshPayoutsInfo(bet)
		this.reelsView.setInteractive()

		if(this.remainingAutoSpinsCount) {
			this.remainingAutoSpinsCount--
			return { key: 'make_bet', bet}
		}

		return this.vueContext.getUserInput()
	}
	
	async presentSpinStart({
		isReSpin,
		balance,
		commonPayout = 0,
		commonFreeSpinsPayout,
		freeSpinsCount,
	}) {
		const { reelsView } = this

		this.setGamePlayTimeScale()

		freeSpinsCount !== undefined
		&& reelsView.presentRemainingFreeSpinsCount(freeSpinsCount)

		commonFreeSpinsPayout !== undefined
		&& reelsView.presentCommonFreeSpinsPayout(formatMoney(commonFreeSpinsPayout))
		
		this.vueContext.refresh({
			remainingAutoSpinsCount: this.remainingAutoSpinsCount,
			isSpinExpected: false,
			isSkipExpected: false,
			balance: formatMoney(balance),
			payout: formatMoney(commonPayout),
		})

		isReSpin && await reelsView.presentReSpinAward()

		return reelsView.presentSpinStart()
	}

	presentSpinStop(targetSymbols) {
		this.setGamePlayTimeScale()
		this.vueContext.refresh({ isSkipExpected: true })

		return this.reelsView.presentSpinStop(targetSymbols)
	}

	presentWin({
		winMap,
		multiplier = 1,
		payout,
		coefficient,
		commonPayout,
	}) {
		this.vueContext.refresh({ isSkipExpected: true })
		this.setGamePlayTimeScale()
		const { reelsView, multiplierView } = this

		this.vueContext.refresh({
			payout: formatMoney(commonPayout)
		})

		return Promise.all([
			multiplierView.presentMultiplierOutro({
				targetView: reelsView.winTabloidView,
				multiplier
			}),
			reelsView.presentWin({
				winMap,
				multiplier,
				payout,
				coefficient,
			})
		])
	}

	presentCascade({
		corruptionMap,
		patchMap,
	}) {
		this.vueContext.refresh({ isSkipExpected: true })
		this.setGamePlayTimeScale()

		return this.reelsView.presentCascade({corruptionMap, patchMap})
	}

	presentMultiplierRecharge(harvestedCapacity) {
		this.vueContext.refresh({ isSkipExpected: true })
		this.setGamePlayTimeScale()

		return this.multiplierView.presentRecharge(harvestedCapacity)
	}

	presentFreeSpinsAward({freeSpinsCount}) {
		//
		return this.reelsView.presentFreeSpinsAward({
			freeSpinsCount,
			isHarvestingRequired: true})
	}

	async presentFreeSpinsModeTransition({
		freeSpinsCount,
		awardedFreeSpinsCount,
		commonFreeSpinsPayout,
	}) {
		this.vueContext.refresh({ isSkipExpected: false })

		if(awardedFreeSpinsCount) {
			await this.reelsView.presentFreeSpinsAward({freeSpinsCount})
			await this.bonusAwardSplashScreen.presentAward(awardedFreeSpinsCount)
			await this.transitionView.presentTransition()
			this.backgroundView.setFreeSpinsMode()
			this.reelsView.setFreeSpinsMode()
			this.foregroundView.visible = false
			this.firefliesPoolView?.setColor(0xFFAA00)

			return
		}
		const formattedPayout = formatMoney(commonFreeSpinsPayout)

		this.reelsView.presentCommonFreeSpinsPayout(formattedPayout)
		await this.bonusPayoutSplashScreen.presentPayout(formattedPayout)
		await this.transitionView.presentTransition()
		this.vueContext.refresh({ payout: formatMoney(0) })
		this.reelsView.setFreeSpinsMode(false)
		this.backgroundView.setFreeSpinsMode(false)
		this.firefliesPoolView?.setColor(0x00FFFF)
		this.foregroundView.visible = true
	}

	presentTotalWin({
		totalCoefficient,
		totalPayout,
	}) {
		if(totalCoefficient < WIN_COEFFICIENTS.BIG) return

		this.vueContext.refresh({ isSkipExpected: false })

		return this.bigWinPayoutSplashScreen.presentPayout({
			coefficient: totalCoefficient,
			payout: totalPayout,
		})
	}

	presentError(errorCode) {
		this.setGamePlayTimeScale()
		this.remainingAutoSpinsCount = 0
		this.vueContext.refresh({
			isSkipExpected: false,
			remainingAutoSpinsCount: 0,
			errorText: this.dictionary['error_' + errorCode] ?? errorCode
		})
	}
	// ...API
}