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

settings.MIPMAP_MODES = MIPMAP_MODES.ON

export class PixiVuePresentation {
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

	constructor({
		wrapperHTMLElementId,
		customVFXLevel,
		customUIOption,
	}) {
		this.vueContext = mountVueUI(wrapperHTMLElementId)

		// CANVAS WRAPPER SETUP...
		const element = document.createElement('div')
		Object.assign(element.style, {
			width: '100%',
			height: '100%',
			position: 'absolute',
			'z-index': -1,
		})
		document.getElementById(wrapperHTMLElementId).appendChild(element)
		// ...CANVAS WRAPPER SETUP

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

		element.appendChild(this.pixiApplication.view)
		AdaptiveContainer.install(this.pixiApplication, true)
		Ticker.shared.add(() => { Timeline.update() })
	}

	async init({
		initialReels,
		currencyCode,
		betsValues,
		buyFeatureValues,
		balance,
		bet,
		languageCode,
		coefficients,
	}) {
		const {stage} = this.pixiApplication

		this.dictionary = await import(
			/* @vite-ignore */
			"./translations/" + languageCode + ".json")
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
		this.initTransitionView()
		AdaptiveContainer.onResize()

		this.vueContext.refresh({
			dictionary: this.dictionary,
			currencyCode,
			betsValues: betsValues.map(value => formatMoney(value)),
			autoSpinsValues: [5, 10, 25, 50, 100, Infinity],
			buyFeatureValues: buyFeatureValues.map(value => formatMoney(value)),
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
			this.gameplayTimeScale = isTurboMode ? TURBO_MODE_TIME_SCALE : 1
			this.isTurboMode = isTurboMode
			this.setGameplayTimeScale()
		}

		this.vueContext.onSkipRequested = () => {
			this.setGameplayTimeScale(10)
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

	initTransitionView() {
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

	setGameplayTimeScale(scale = 1) {
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
		this.setGameplayTimeScale()
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
		isRespin,
		balance,
		commonPayout = 0,
		commonFreeSpinsPayout,
		freeSpinsCount,
	}) {
		const { reelsView } = this

		this.setGameplayTimeScale()

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

		isRespin && await reelsView.presentRespinAward()

		return reelsView.presentSpinStart()
	}

	presentSpinStop(targetSymbols) {
		this.setGameplayTimeScale()
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
		this.setGameplayTimeScale()
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
		this.setGameplayTimeScale()

		return this.reelsView.presentCascade({corruptionMap, patchMap})
	}

	presentMultiplierRecharge(harvestedCapacity) {
		this.vueContext.refresh({ isSkipExpected: true })
		this.setGameplayTimeScale()

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
		this.setGameplayTimeScale()
		this.remainingAutoSpinsCount = 0
		this.vueContext.refresh({
			isSkipExpected: false,
			remainingAutoSpinsCount: 0,
			errorText: this.dictionary['error_' + errorCode] ?? errorCode
		})
	}
	// ...API
}