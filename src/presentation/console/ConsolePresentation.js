const REELS_COUNT = 5
const CELLS_PER_REEL_COUNT = 4
const IDS_EMOJI_MAP = {
	0: '⬛ ',
	1: '🧡 ',
	2: '💛 ',
	3: '💚 ',
	4: '💙 ',
	5: '🐟 ',
	6: '🐢 ',
	7: '🐡 ',
	8: '👺 ',
	9: '⭐ ',
	11: '1️⃣ ',
	22: '2️⃣1',
	21: '2️⃣2',
	33: '3️⃣1',
	32: '3️⃣2',
	31: '3️⃣3',
	44: '4️⃣1',
	43: '4️⃣2',
	42: '4️⃣3',
	41: '4️⃣4',
	55: '5️⃣1',
	54: '5️⃣2',
	53: '5️⃣3',
	52: '5️⃣4',
	51: '5️⃣5',
}

function reelsToString({
	reels = new Array(5).fill(0).map(_ => new Array(4).fill(0)),
	emojiMap = IDS_EMOJI_MAP
}) {
	let text = ''
	for(let y = 0; y < CELLS_PER_REEL_COUNT; y++) {
		for(let x = 0; x < REELS_COUNT; x++)
			text +=  ' ' + (emojiMap[reels[x][y]] ?? emojiMap[-1] ?? '⬛ ')

		if(y < CELLS_PER_REEL_COUNT - 1)
			text += '\n'
	}

	return text
}

function print(text, backgroundColor = '#000000') {
	console.log('%c' + text, 'background: ' + backgroundColor + '; color: #CCCCCC');
}

function formatMoney(value, currencyCode) {
	let text = value.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')

	if(!currencyCode) return text

	return text + '(' + currencyCode + ')'
}

export class ConsolePresentation {
	dictionary
	betsValues
	buyFeatureValues
	currencyCode
	reels

	async init({
		languageCode,
		initialReels,
		currencyCode,
		betsValues,
		buyFeatureValues,
		balance,
		bet,
	}) {
		this.buyFeatureValues = buyFeatureValues
		this.betsValues = betsValues
		this.currencyCode = currencyCode

		const dictionary = await import(
			 /* @vite-ignore */
			 "./translations/" + languageCode + ".json")
		this.dictionary = dictionary
		print(reelsToString({reels: initialReels}) + '\n'
			+ dictionary.welcome + '\n'
			+ dictionary.balance + ': ' + formatMoney(balance, currencyCode) + '\n'
			+ dictionary.available_bets + ': ' + betsValues.map(
				value => formatMoney(value, currencyCode)) + '\n'
			+ dictionary.bet + ': ' + formatMoney(bet, currencyCode))
	}

	async getUserInput({
		bet,
		balance,
		currencyCode,
	}) {
		const betIndex = this.betsValues.indexOf(bet)
		const { dictionary } = this
		const optionsMap = {
			1: { key: 'make_bet' },
			2: {
				key: 'change_bet',
				optionIndex: (betIndex + 1) % this.betsValues.length
			},
			3: {
				key: 'buy_bonus',
				optionIndex: betIndex
			},
		}

		print(
			dictionary.balance + ': ' + formatMoney(balance, currencyCode) + '\n'
			+ dictionary.bet + ': ' + formatMoney(bet, currencyCode) + '\n'
			+ dictionary.buy_feature_price + ': '
			+ formatMoney(this.buyFeatureValues[betIndex], currencyCode) + '\n'
			+ '---------' + '\n'
			+ dictionary.select_option + '\n'
			+ '1: ' +  dictionary[optionsMap[1].key] + '\n'
			+ '2: ' +  dictionary[optionsMap[2].key] + '\n'
			+ '3: ' +  dictionary[optionsMap[3].key] + '\n'
		)

		return new Promise(resolve => {
			const onKeyUp = ({key}) => {
				if(!optionsMap[key]) return
				resolve(optionsMap[key])
				print('> ' + dictionary[optionsMap[key].key], '#0000AA')
				document.removeEventListener('keyup', onKeyUp)
			}

			document.addEventListener('keyup', onKeyUp)
		})
	}

	presentSpinStart() {
		print(reelsToString({emojiMap: {0: '🔻 '}}))
	}

	presentSpinStop(reels) {
		this.reels = reels.map(reel => reel.map(symbolId => symbolId))
		print(reelsToString({reels}))
	}

	presentWin({
		winMap,
		payout,
		commonPayout,
		multiplier,
		currencyCode,
	}) {
		print(
			reelsToString({reels: winMap, emojiMap: {0: '⬛ ', 1: '🟩 ', '-1': '❎ '}}) + '\n'
			+ this.dictionary.multiplier + ': ' + multiplier.toFixed(2) + '\n'
			+ this.dictionary.win + ': ' + formatMoney(payout, currencyCode) + '\n'
			+ this.dictionary.common_win + ': ' + formatMoney(commonPayout, currencyCode)
		)
	}

	presentCascade({
		reels = this.reels,
		corruptionMap,
		patchMap
	}) {
		const fallText = ' 🔻  🔻  🔻  🔻  🔻 '
		const summText = ' ➕  ➕  ➕  ➕  ➕ '

		// MAPPING CASCADE...
        const cascadeMap = reels.map(reel => reel.map(_ => 0))
        for(let x = 0; x < REELS_COUNT; x++) {
            let distance = 0
            for(let y = CELLS_PER_REEL_COUNT - 1; y >= 0; y--) {    
                if(corruptionMap[x][y] > 0) {
                    distance++
                    cascadeMap[x][y] = 0
                } else {
                    cascadeMap[x][y] = distance
                }
            }
        }
        // ...MAPPING CASCADE

		// CORRUPTION...
        for (let x = 0; x < REELS_COUNT; x++)
            for(let y = 0; y < CELLS_PER_REEL_COUNT; y++) 
				if(corruptionMap[x][y]){
					// wild drain
					reels[x][y]--

					if(corruptionMap[x][y] > 0)
						reels[x][y] = 0
				}
		print(reelsToString({reels, emojiMap: {0: '❌ ',...IDS_EMOJI_MAP}}))
        // ...CORRUPTION

		// FALL...
		print(fallText)
        for (let x = 0; x < REELS_COUNT; x++)
            for(let y = CELLS_PER_REEL_COUNT - 1; y >= 0; y--)
                if(cascadeMap[x][y]) {
                    reels[x][y + cascadeMap[x][y]] = reels[x][y]
                    reels[x][y] = 0
                }
		print(reelsToString({reels}))
		print('...')
        // ...FALL
		
		// PATCH...
		print(reelsToString({reels: patchMap}) )
		print(summText)
		print(reelsToString({reels}) )
		print(fallText)
        
		for (let x = 0; x < REELS_COUNT; x++)
            for(let y = 0; y < patchMap[x].length; y++)
                reels[x][y] = patchMap[x][y]
		print(reelsToString({reels}) )
        // ...PATCH
	}

	presentFreeSpinsModeTransition({
        awardedFreeSpinsCount,
        commonFreeSpinsPayout,
		currencyCode = this.currencyCode
    }) {
		if(awardedFreeSpinsCount)
			print('+' + awardedFreeSpinsCount + this.dictionary.free_spins)
		else if (commonFreeSpinsPayout)
			print(this.dictionary.free_pins_total_win
				+ formatMoney(commonFreeSpinsPayout, currencyCode))
	}

	async presentFreeSpinsAward({awardedFreeSpinsCount}) {
        print('+' + awardedFreeSpinsCount + this.dictionary.free_spins)
    }

	presentError(errorCode) {
		print(this.dictionary['error_' + errorCode] ?? errorCode, '#AA0000')
	}
}

