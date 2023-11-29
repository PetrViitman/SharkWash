<script >
	let context
	import { createApp, watch } from 'vue'
	import App from './VueUI.vue'
	export function mountVueUI(wrapperHtmlElementId) {
		context = createApp(App)
		context.mount('#' + wrapperHtmlElementId)
	
		return context
	}

	import Indicator from './components/Indicator.vue'
	import Selector from './components/Selector.vue'
	import TextField from './components/TextField.vue'
	import UIPanelBackground from './components/UIPanelBackground.vue'
	import ButtonSpin from './components/buttons/ButtonSpin.vue'
	import ButtonSkip from './components/buttons/ButtonSkip.vue'
	import ButtonSettings from './components/buttons/ButtonSettings.vue'
	import ButtonTurbo from './components/buttons/ButtonTurbo.vue'
	import ButtonBet from './components/buttons/ButtonBet.vue'
	import ButtonAuto from './components/buttons/ButtonAuto.vue'
	import ButtonStopAuto from './components/buttons/ButtonStopAuto.vue'
	import ButtonBuy from './components/buttons/ButtonBuy.vue'
	import Overlay from './components/popups/Overlay.vue'
	import ErrorPopup from './components/popups/PopupError.vue'
	import PopupSelector from './components/popups/PopupSelector.vue'
	import CheatScreen from './components/popups/CheatScreen.vue'
	import { ref, nextTick } from 'vue'
	export default {
	components: {
		Indicator,
		Selector,
		TextField,
		UIPanelBackground,
		ButtonSpin,
		ButtonSkip,
		ButtonSettings,
		ButtonTurbo,
		ButtonBet,
		ButtonAuto,
		ButtonStopAuto,
		ButtonBuy,
		Overlay,
		ErrorPopup,
		PopupSelector,
		CheatScreen,
	},

	setup() {
		context.resolve = undefined
		context.isHidden = ref(true)
		context.uiAlpha = ref(0)
		context.isSpinExpected = ref(false)
		context.isSkipExpected = ref(false)
		context.activePopupName = ref('buy bet autoplay error cheats') //prerendering
		context.currencyCode = ref('')
		context.errorText = ref('')
		context.isSimplifiedMode = ref(true)
		context.betsValues = ref([])
		context.autoSpinsValues = ref([])
		context.buyFeatureValues = ref([])
		context.payout = ref(0)
		context.balance = ref(0)
		context.bet = ref('')
		context.isTurboMode = ref(false)
		context.remainingAutoSpinsCount = ref(0)
		context.dictionary = ref({})
		context.refresh = (data) => {
		for (const [key, value] of Object.entries(data))
			context[key].value = value
		}
		context.getUserInput = () => {
			closeAllPopups()
			return new Promise(resolve => { context.resolve = resolve })
		}

	  	watch(context.isSimplifiedMode, (newValue) => {
			if(!newValue && context.activePopupName.value === 'bet')
				context.activePopupName.value = ''
		})

	  	watch(context.bet, newValue =>
			betSelector.value.setSelectedValue(newValue))

		function closeAllPopups() {
			nextTick(() => context.activePopupName.value = '')
		}

		function resolve(data) {
			context.resolve?.(data)
			context.resolve = undefined
			closeAllPopups()
		}

		function toggleTurbo() {
			context.isTurboMode.value = !context.isTurboMode.value
			context.onTurboToggle?.(context.isTurboMode.value)
		}

		function setRemainingAutoSpinsCount(remainingAutoSpinsCount) {
			context.remainingAutoSpinsCount.value = remainingAutoSpinsCount
			context.onAutoplaySpinsCountChange?.(remainingAutoSpinsCount)
		}

		function skip() {
			context.onSkipRequested?.()
			context.isSkipExpected.value = false
		}

		const betSelector = ref(null)

		return {
			resolve,
			isHidden: context.isHidden,
			uiAlpha: context.uiAlpha,
			isSpinExpected: context.isSpinExpected,
			isSkipExpected: context.isSkipExpected,
			activePopupName: context.activePopupName,
			currencyCode: context.currencyCode,
			errorText: context.errorText,
			isSimplifiedMode: context.isSimplifiedMode,
			betsValues: context.betsValues,
			autoSpinsValues: context.autoSpinsValues,
			remainingAutoSpinsCount: context.remainingAutoSpinsCount,
			buyFeatureValues: context.buyFeatureValues,
			payout: context.payout,
			balance: context.balance,
			bet: context.bet,
			isTurboMode: context.isTurboMode,
			dictionary: context.dictionary,
			closeAllPopups,
			toggleTurbo,
			setRemainingAutoSpinsCount,
			skip,
			betSelector,
		}
	},
}
</script>

<template>
	<div class="ui-container">
		<UIPanelBackground id="panelBackground"/>
		<ButtonBuy
			:class="{ disabled: !isSpinExpected }"
			@click = "activePopupName='buy'"
			id="buyButton">
			{{ dictionary.buy }}
		</ButtonBuy>
		<Indicator
			id="winIndicator"
			:class="{ decorated: !isSimplifiedMode }"
			:width = "150"
			:textFieldWidth = "120"
			:captionText = "dictionary.win + ' (' + currencyCode + ')'"
			:indicatorValue = "payout">
		</Indicator>
		<Indicator
			id="balanceIndicator"
			:class="{ decorated: !isSimplifiedMode }"
			:width = "150"
			:textFieldWidth = "120"
			:captionText = "dictionary.balance + ' (' + currencyCode + ')'"
			:indicatorValue = "balance">
		</Indicator>
		<Selector
			id="betSelector"
			ref = "betSelector"
			@selected="(selectedIndex) => resolve({
			key: 'change_bet',
			value: selectedIndex
			})"
			:isDecorated = "!isSimplifiedMode"
			:class="{
			decorated: !isSimplifiedMode,
			disabled: !isSimplifiedMode && !isSpinExpected }"
			:width = "150"
			:textFieldWidth = "isSimplifiedMode ? 120 : 70"
			:captionText = "dictionary.bet + ' (' + currencyCode + ')'"
			:selectableValues = "betsValues">
		</Selector>
		<ButtonSpin
			@click = "() => resolve({ key: 'make_bet' })"
			:class="{ disabled: !isSpinExpected }"
			id="spinButton"/>
		<ButtonSkip
			@click="skip()"
			v-show="!isSpinExpected"
			:class="{ disabled: !isSkipExpected }"
			id="skipButton"/>
		<ButtonSettings
			:class="{ disabled: !isSpinExpected }"
			@click="activePopupName = 'cheats'"
			id="settingsButton"/>
		<ButtonTurbo
			:class="{ active: isTurboMode }"
			@click="toggleTurbo()"
			id="turboButton"/>
		<ButtonBet
			v-show="isSimplifiedMode"
			:class="{ disabled: !isSpinExpected }"
			@click = "activePopupName='bet'"
			id="betButton"/>
		<ButtonAuto
			:class="{ disabled: !isSpinExpected || remainingAutoSpinsCount }"
			id="autoButton"
			@click = "activePopupName='autoplay'"
			/>
		<ButtonStopAuto
			v-show="remainingAutoSpinsCount"
			id="stopAutoButton"
			@click = "setRemainingAutoSpinsCount(0)">
			{{ remainingAutoSpinsCount }}
		</ButtonStopAuto>
		<Overlay
			@click="closeAllPopups()"
			v-show="!!activePopupName || errorText"
			id="overlay"/>
		<ErrorPopup
			v-show="errorText || activePopupName.includes('error')"
			@close = "errorText=''"
			:messageText = "errorText"
			:buttonText = "dictionary.ok"
			id="errorPopup"/>

		<PopupSelector
			v-show="activePopupName.includes('autoplay')"
			@close = "closeAllPopups()"
			@confirm = "(selectedIndex) => {
			setRemainingAutoSpinsCount(autoSpinsValues[selectedIndex] - 1)
			resolve({ key: 'make_bet' })
			}"
			:messageText = "dictionary.select_autoplay"
			:buttonText = "dictionary.start"
			:selectableValues = "autoSpinsValues"
			id="autoplayPopup"/>

		<PopupSelector
			v-show="activePopupName.includes('bet')"
			@close = "closeAllPopups()"
			@confirm = "(selectedIndex) => resolve({
			key: 'change_bet',
			value: selectedIndex
			})"
			:messageText = "dictionary.select_bet"
			:buttonText = "dictionary.select"
			:selectableValues = "betsValues"
			:selectorCaptionText = "'(' + currencyCode + ')'"
			id="betPopup"/>

		<PopupSelector
			v-show="activePopupName.includes('buy')"
			@close = "closeAllPopups()"
			@confirm = "(selectedIndex) => resolve({
					key: 'buy_bonus',
					value: selectedIndex
				})"
			:messageText = "dictionary.buy_feature"
			:buttonText = "dictionary.buy"
			:selectableValues = "buyFeatureValues.map(value => value
				+ ' (' + currencyCode + ')')"
			:selectableCaptionValues = "
				betsValues.map(value => value
					+ ' (' + currencyCode + ')'
					+ dictionary.buy_feature_per_spin)"
			id="buyPopup"/>


		<CheatScreen
			v-show="activePopupName.includes('cheats')"
			@close = "closeAllPopups()"
			@confirm = "(reels) => resolve({
			key: 'make_cheat_bet',
			value: reels
			})"
			:messageText = "dictionary.bet + ' ' + bet + ' (' + currencyCode + ')'"
			:buttonText = "dictionary.make_cheat_bet"
			id="cheats">
		</CheatScreen>
	</div>
</template>

<style scoped>
	* {
		pointer-events: auto;
		text-transform: uppercase;
		font-family: roboto;
		font-weight: bold;
		color: #b3b3b3;
		-webkit-touch-callout: none;
		-webkit-user-select: none;
		-khtml-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
		user-select: none;
	}

	.disabled {
		color: #333333;
		pointer-events: none;
	}

	@font-face {
		font-family: "roboto";
		src: url('../../assets/fonts/roboto.ttf');
	}

	.ui-container {
		opacity: v-bind("uiAlpha");
		width: v-bind("!!uiAlpha ? '100%' : 0");
		height: 100%;
		overflow: hidden;
		position: absolute;
		pointer-events: none;
		-webkit-tap-highlight-color: rgba(0,0,0,0);
		-webkit-tap-highlight-color: transparent;
	}
</style>
