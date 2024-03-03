import { AdaptiveProxyHTMLContainer } from "../adaptiveDesign/AdaptiveProxyHTMLContainer";
import { AdaptiveContainer } from "../adaptiveDesign/AdaptiveContainer";

export class VueUIContainer extends AdaptiveContainer {
	vueContext
	isMobileDevice

	constructor({vueContext, isMobileDevice}) {
		super()

		this.isMobileDevice = isMobileDevice
		this.vueContext = vueContext

		this.popupsContainer = this.addChild(new AdaptiveProxyHTMLContainer)
		const popupIds = [
			'errorPopup',
			'autoplayPopup',
			'betPopup',
			'buyPopup',
			'cheats'
		].forEach(id => {
			this.popupsContainer.attach({
					name: id,
					element: document.getElementById(id)
				})
		})

		this.buttonsGroupContainer = this.addChild(new AdaptiveProxyHTMLContainer)
		const buttonsGroupIds = [
			'spinButton',
			'skipButton',
			'settingsButton',
			'turboButton',
			'betButton',
			'autoButton',
			'stopAutoButton',
		].forEach(id => {
			this.buttonsGroupContainer.attach({
					name: id,
					element: document.getElementById(id)
				})
		})

		const ids = [
			'panelBackground',
			'winIndicator',
			'balanceIndicator',
			'betSelector',
			'buyButton',
			'overlay',
		].forEach(id => {

			this[id] = this
				.addChild(new AdaptiveProxyHTMLContainer)
				.attach({
					name: 'element',
					element: document.getElementById(id)
				})
		})

		this.overlay
			.setTargetArea({x: 0, y: 0, width: 1, height: 1})
			.setSourceArea({width: 100, height: 100})
			.stretchHorizontally()
			.stretchVertically()
	}

	updateTargetArea(sidesRatio) {
		const {
			panelBackground,
			winIndicator,
			balanceIndicator,
			betSelector,
			buyButton,
			buttonsGroupContainer,
			popupsContainer,
			isMobileDevice
		} = this

		if(sidesRatio > 1.25 && !isMobileDevice) {
			// DESKTOP WIDE LANDSCAPE...
			this.vueContext.isSimplifiedMode.value = false
			panelBackground
				.setSourceArea({width: 200, height: 60})
				.setTargetArea({x: 0, y: 0.9, width: 1, height: 0.1})
				.stretchVertically()
				.stretchHorizontally()
			
			buyButton
				.stickCenter()
				.stickTop()
				.setSourceArea({width: 1000, height: 60})
				.setTargetArea({x: 0, y: 0.9, width: 1, height: 0.1})
				.translateElement({name: 'element', x: 100, y: 5})

			buttonsGroupContainer
				.stickCenter()
				.stickTop()
				.setSourceArea({width: 1000, height: 60})
				.setTargetArea({x: 0, y: 0.9, width: 1, height: 0.1})
				.translateElement({name: 'settingsButton', x: 20, y: 5})
				.translateElement({name: 'spinButton', x: 465, y: -20})
				.translateElement({name: 'skipButton', x: 465, y: -20})
				.translateElement({name: 'turboButton', x: 410, y: 5})
				.translateElement({name: 'autoButton', x: 540, y: 5})
				.translateElement({name: 'stopAutoButton', x: 540, y: 5})

			winIndicator
				.stickCenter()
				.stickTop()
				.setSourceArea({width: 1000, height: 60})
				.setTargetArea({x: 0, y: 0.9, width: 1, height: 0.1})
				.translateElement({name: 'element', x: 625, y: 5})

			balanceIndicator
				.stickCenter()
				.stickTop()
				.setSourceArea({width: 1000, height: 60})
				.setTargetArea({x: 0, y: 0.9, width: 1, height: 0.1})
				.translateElement({name: 'element', x: 815, y: 5})

			betSelector
				.stickCenter()
				.stickTop()
				.setSourceArea({width: 1000, height: 60})
				.setTargetArea({x: 0, y: 0.9, width: 1, height: 0.1})
				.translateElement({name: 'element', x: 225, y: 5})
			
			popupsContainer
				.setTargetArea({x: 0.3, y: 0.25, width: 0.4, height: 0.5})
				.setSourceArea({width: 300, height: 200})
			// ...DESKTOP WIDE LANDSCAPE
		} else if (sidesRatio >= 1) {
			// MOBILE OR NARROW DESKTOP LANDSCAPE...
			const panelHeight = isMobileDevice ? 0.2 : 0.1

			this.vueContext.isSimplifiedMode.value = true
			panelBackground
				.setSourceArea({width: 200, height: 60})
				.setTargetArea({x: 0, y: 1 - panelHeight, width: 1, height: panelHeight})
				.stretchVertically()
				.stretchHorizontally()
				
			buyButton
				.stickLeft()
				.stickBottom()
				.setSourceArea({width: 500, height: 60})
				.setTargetArea(
					isMobileDevice
					? {x: 0, y: 0.65, width: 1, height: 0.15}
					: {x: 0, y: 0.825, width: 1, height: 0.075})
				.translateElement({name: 'element', x: 20, y: 5})


			buttonsGroupContainer
				.stickRight()
				.stickMiddle()
				.setSourceArea({width: 75, height: 700})
				.setTargetArea(
					isMobileDevice
					? {x: 0.75, y: -0.555, width: 0.25, height: 2}
					: {x: 0.75, y: 0, width: 0.25, height: 1})
				.translateElement({name: 'betButton', x: 20, y: 197})
				.translateElement({name: 'autoButton', x: 20, y: 250})
				.translateElement({name: 'stopAutoButton', x: 20, y: 250})
				.translateElement({name: 'spinButton', x: -10, y: 300})
				.translateElement({name: 'skipButton', x: -10, y: 300})
				.translateElement({name: 'turboButton', x: 20, y: 370})
				.translateElement({name: 'settingsButton', x: 20, y: 423})

			betSelector
				.stickLeft()
				.stickMiddle()
				.setSourceArea({width: 600, height: 60})
				.setTargetArea({x: 0, y: 1 - panelHeight, width: 1, height: panelHeight})
				.translateElement({name: 'element', x: 20, y: 5})

			winIndicator
				.stickCenter()
				.stickMiddle()
				.setSourceArea({width: 600, height: 60})
				.setTargetArea({x: 0, y: 1 - panelHeight, width: 1, height: panelHeight})
				.translateElement({name: 'element', x: 225, y: 5})

			balanceIndicator
				.stickRight()
				.stickMiddle()
				.setSourceArea({width: 600, height: 60})
				.setTargetArea({x: 0, y: 1 - panelHeight, width: 1, height: panelHeight})
				.translateElement({name: 'element', x: 430, y: 5})

			this.popupsContainer
				.setTargetArea({x: 0.3, y: 0.25, width: 0.4, height: 0.5})
				.setSourceArea({width: 300, height: 200})
			// ...MOBILE OR NARROW DESKTOP LANDSCAPE
		} else {
			// PORTRAIT...
			this.vueContext.isSimplifiedMode.value = true
			panelBackground
				.setSourceArea({width: 200, height: 60})
				.setTargetArea({x: 0, y: 0.9, width: 1, height: 0.1})
				.stretchVertically()
				.stretchHorizontally()
			
			buyButton
				.stickCenter()
				.stickBottom()
				.setSourceArea({width: 400, height: 150})
				.setTargetArea({x: 0, y: 0.65, width: 1, height: 0.25})
				.translateElement({name: 'element', x: 150, y: 20})

			buttonsGroupContainer
				.stickCenter()
				.stickBottom()
				.setSourceArea({width: 400, height: 150})
				.setTargetArea({x: 0, y: 0.65, width: 1, height: 0.25})
				.translateElement({name: 'settingsButton', x: 25, y: 95})
				.translateElement({name: 'turboButton', x: 95, y: 95})
				.translateElement({name: 'spinButton', x: 166, y: 75})
				.translateElement({name: 'skipButton', x: 166, y: 75})
				.translateElement({name: 'autoButton', x: 255, y: 95})
				.translateElement({name: 'stopAutoButton', x: 255, y: 95})
				.translateElement({name: 'betButton', x: 325, y: 95})

			betSelector
				.stickLeft()
				.stickTop()
				.setSourceArea({width: 400, height: 60})
				.setTargetArea({x: 0, y: 0.9, width: 1, height: 0.1})
				.translateElement({name: 'element', x: 0, y: 5})

			winIndicator
				.stickCenter()
				.stickTop()
				.setSourceArea({width: 400, height: 60})
				.setTargetArea({x: 0, y: 0.9, width: 1, height: 0.1})
				.translateElement({name: 'element', x: 125, y: 5})

			balanceIndicator
				.stickRight()
				.stickTop()
				.setSourceArea({width: 400, height: 60})
				.setTargetArea({x: 0, y: 0.9, width: 1, height: 0.1})
				.translateElement({name: 'element', x: 250, y: 5})

			this.popupsContainer
				.setTargetArea({x: 0.05, y: 0, width: 0.9, height: 1})
				.setSourceArea({width: 300, height: 200})
			// ...PORTRAIT
		}
	}
}