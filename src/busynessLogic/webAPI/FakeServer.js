const ALLOWED_LANGUAGES_CODES = ['en', 'ru']
const CUSTOM_REELS_EXPECTED = true
const ERROR_CODES = {
	INTERNAL_ERROR: 100,
	OUT_OF_BALANCE: 200,
	BET_IS_INVALID: 300,
	CUSTOM_REELS_ARE_NOT_EXPECTED: 400,
	CUSTOM_REELS_ARE_INVALID: 401,
}
const CURRENCY_CODE = 'FUN'
const BETS_VALUES = [1, 5, 10, 20, 50, 100]
const BUY_FEATURE_BET_MULTIPLIER = 80
const BUY_FEATURE_VALUES = BETS_VALUES.map(value => value * BUY_FEATURE_BET_MULTIPLIER)
const REELS_COUNT = 5
const CELLS_PER_REEL_COUNT = 4
const SCATTER_SYMBOL_ID = 9
const DEFAULT_SYMBOLS_IDS = [1, 2, 3, 4, 5, 6, 7, 8]
const WILD_IDS_CAPACITY = {
	10: 0, 11: 1,// Wild x1
	20: 0, 21: 2, 22: 2,// Wild x2
	30: 0, 31: 3, 32: 3, 33: 3,// Wild x3
	40: 0, 41: 4, 42: 4, 43: 4, 44: 4,// Wild x4
	50: 0, 51: 5, 52: 5, 53: 5, 54: 5, 55: 5,// Wild x5
}

const BONUS_IDS_COUNT_AWARD_MAP = {
	0: 0,
	1: 0,
	2: 0,
	3: 7,
	4: 10,
	5: 15
}

const COEFFICIENTS = [
	undefined, // (0) Empty
	[0, 0, 0.6, 0.8, 1.2], // (1) low value symbol
	[0, 0, 0.6, 0.8, 1.2], // (2) low value symbol
	[0, 0, 0.6, 0.8, 1.2], // (3) low value symbol
	[0, 0, 0.6, 0.8, 1.2], // (4) low value symbol
	[0, 0, 1.0, 1.5, 2.5], // (5) High value symbol
	[0, 0, 1.4, 2.0, 3.5], // (6) High value symbol
	[0, 0, 2.0, 3.5, 7.0], // (7) High value symbol
	[0, 0, 3.0, 6.0, 15], // (8) High value symbol
	// undefined, (9) Scatter
	// undefined, (11) Wild x1
	// undefined, (22) Wild x2
	// undefined, (33) Wild x3
	// undefined, (44) Wild x4
	// undefined, (55) Wild x5
]

const REELS = [
	[1, 2, 1, 8, 3, 1, 4, 1, 5, 1, 6, 1, 7, 1, 2, 1, 3, 1, 4, 1, 5, 1, 6, 1, 7, 9, 1, 2, 1, 3, 8, 1, 4, 1, 5, 1, 6, 1, 7],
	[1, 2, 2, 2, 3, 2, 4, 2, 5, 2, 8, 6, 2, 7, 2, 9, 1, 5, 1, 2, 8, 1, 6, 1, 1, 5, 1, 2, 1, 6, 1, 44, 1, 2, 2, 2, 3, 2, 4, 2, 5, 2, 6, 2, 7, 2, 1, 5, 1, 2, 1, 6, 1, 11, 1, 2, 2, 2, 3, 2, 4, 2, 5, 2, 6, 2, 7, 2],
	[1, 3, 2, 3, 8, 3, 3, 4, 3, 5, 3, 6, 3, 7, 3, 9, 1, 2, 3, 2, 7, 2, 1, 2, 3, 2, 7, 2, 55, 1, 3, 2, 3, 3, 3, 4, 3, 5, 3, 6, 3, 7, 3, 1, 8, 2, 3, 2, 7, 2, 22, 1, 3, 2, 3, 3, 3, 4, 3, 5, 3, 6, 3, 7, 3],
	[1, 4, 2, 4, 3, 4, 4, 4, 5, 4, 6, 4, 7, 4, 9, 3, 2, 3, 4, 3, 1, 3, 8, 3, 2, 3, 4, 3, 1, 3, 11, 1, 8, 4, 2, 4, 3, 4, 4, 4, 5, 4, 6, 4, 7, 4, 3, 2, 3, 4, 3, 1, 3, 33, 1, 4, 2, 4, 3, 4, 4, 4, 5, 4, 6, 4, 7, 4],
	[4, 1, 4, 5, 4, 2, 8, 4, 5, 4, 3, 5, 4, 5, 5, 5, 6, 5, 7, 5, 9, 4, 1, 4, 5, 4, 2, 4, 5, 4, 3, 5, 4, 5, 5, 5, 6, 5, 7, 5, 4, 1, 8, 4, 5, 4, 2, 4, 5, 4, 3, 5, 4, 5, 5, 5, 6, 5, 7, 5],
]

export const DEFAULT_REEL_POSSIBLE_IDS = [...DEFAULT_SYMBOLS_IDS, SCATTER_SYMBOL_ID]
export const WILD_REEL_POSSIBLE_IDS = [...DEFAULT_REEL_POSSIBLE_IDS, 11, 22, 33, 44, 55]
export const POSSIBLE_REELS_IDS = [
	DEFAULT_REEL_POSSIBLE_IDS,
	WILD_REEL_POSSIBLE_IDS,
	WILD_REEL_POSSIBLE_IDS,
	WILD_REEL_POSSIBLE_IDS,
	DEFAULT_REEL_POSSIBLE_IDS,
]

/**
 * This is a simple fake server, which powers
 * this demo. Although it is fake, it does imitate
 * original game and its coefficients, except for the RTP,
 * which is set much higher in order to intensify game events.
 * For consistency reasons the fake server side is hidden from client,
 * therefor it doesn't refer to any constants or logic described there
 */
export class FakeServer {
	balance = 10000

	getRolledReels() {		
		return REELS.map(reel => {
			const finalReel = []
			const offset = Math.trunc(Math.random() * reel.length)
			for(let i = 0; i < CELLS_PER_REEL_COUNT; i++)
				finalReel.push(reel[(offset + i) % reel.length])

			return finalReel
		})
	}

	generateSingleGameSteps({
		bet,
		isFreeSpinsAwardPurchased,
		desiredReels,
	}) {
		let roundSteps = []
		let isFreeSpinsMode
		let freeSpinsCount = 0
		let isRespinRequired
		let multiplierCapacity = 0

		do {
			freeSpinsCount = Math.max(0, freeSpinsCount - 1)
			let reels = desiredReels ?? this.getRolledReels()
			// PURCHASED BONUS PATCH...
			if(
				!roundSteps.length
				&& isFreeSpinsAwardPurchased
			) {
				const reelsIndexes = []
				for(let i = 0; i < 3; i++) {
					let reelIndex = Math.trunc(Math.random() * REELS_COUNT)
					while (reelsIndexes.includes(reelIndex)) {
						reelIndex = (reelIndex + 1) % REELS_COUNT
					}
					reelsIndexes.push(reelIndex)
					const cellIndex = Math.trunc(Math.random() * CELLS_PER_REEL_COUNT)
					reels[reelIndex][cellIndex] = SCATTER_SYMBOL_ID
				}
			}
			// ...PURCHASED BONUS PATCH
			
			const subSteps = this.getCascadeSteps({reels, multiplierCapacity, bet})
			const lastSubStep = subSteps[subSteps.length - 1]
			
			multiplierCapacity = lastSubStep.multiplierCapacity ?? 0

			// FREE SPINS DETECTION...
			let bonusIdsCount = 0
			for(const reel of reels)
				for(const symbolId of reel)
					if(symbolId === SCATTER_SYMBOL_ID)
						bonusIdsCount++

			if (freeSpinsCount)
				for(const step of subSteps)
					step.freeSpinsCount = freeSpinsCount
			const awardedFreeSpinsCount = isFreeSpinsMode
				? bonusIdsCount
				: BONUS_IDS_COUNT_AWARD_MAP[bonusIdsCount]
				?? BONUS_IDS_COUNT_AWARD_MAP.at(-1)

			if(isFreeSpinsMode)
				lastSubStep.freeSpinsCount = freeSpinsCount
			
			if(awardedFreeSpinsCount) {
				freeSpinsCount += awardedFreeSpinsCount
				lastSubStep.awardedFreeSpinsCount = awardedFreeSpinsCount

				if(!isFreeSpinsMode) {
					multiplierCapacity = 0
					isFreeSpinsMode = true
				}
			}
			// ...FREE SPINS DETECTION

			// RESPIN DETECTION...
			if(isRespinRequired)
				subSteps[0].isRespin = true

			isRespinRequired = false
			if(!isFreeSpinsMode)
				for(const step of subSteps)
					if(step.harvestedCapacity) {
						isRespinRequired = true
						break
					}
			// ...RESPIN DETECTION

			roundSteps = [...roundSteps, ...subSteps]

			// cheat reels dropped after 1st spin
			desiredReels = undefined

			// just to make it easier to adjust reels values while developing
			if(roundSteps.length > 100)
				throw 'infinite wins! 😱😱😱'

		} while (freeSpinsCount || isRespinRequired)

		return roundSteps
	}

	getCascadeSteps({
		bet,
		reels,
		multiplierCapacity = 0,
	}) {
		const steps = []
		let updatedMultiplierCapacity = multiplierCapacity
		let winDescriptor

		do {
			const step = {multiplierCapacity: updatedMultiplierCapacity}
			const isFirstStep = !steps.length
			const multiplier = this.getMultiplier(updatedMultiplierCapacity)

			winDescriptor = this.getWinDescriptor(reels, multiplier)

			if(isFirstStep)
				step.reels = reels.map(reel => reel.map(symbolId => symbolId))
	
			if(isFirstStep || winDescriptor)
				steps.push(step)

			if(!winDescriptor) { break }
			
			const {
				winMap,
				coefficient,
				harvestedCapacity
			} = winDescriptor

			if(winMap) {
				step.winMap = winMap
				step.coefficient = coefficient
				step.multiplier = multiplier
				step.payout = Number((coefficient * bet).toFixed(2))
				step.harvestedCapacity = harvestedCapacity
			}

			updatedMultiplierCapacity += harvestedCapacity
			step.multiplierCapacity = updatedMultiplierCapacity
			step.reelsPatch = this.cascadeReels(reels, winMap)
		} while (winDescriptor)

		return steps
	}

	getMultiplier(capacity) {
		if(!capacity) return 1 // 2 sectors
		if(capacity <= 1) return 1 // 2 sectors
		if(capacity <= 4) return 2 // 3 sectors
		if(capacity <= 8) return 3 // 4 sectors
		if(capacity <= 13) return 4 // 5 sectors
		return 5 // 6 sectors
	}

	getWinDescriptor(reels, multiplier = 1) {
		const winMap = reels.map(reel => reel.map(_ => 0))
		let harvestedCapacity = 0
		let coefficient = 0

		DEFAULT_SYMBOLS_IDS.forEach(symbolId => {
			const map = reels.map(reel => reel.map(_ => 0))
			let winReelsCount = 0
			let winLinesCount = 0

			for(let x = 0; x < reels.length; x++ ) {
				let isWinReel = false
				let winSymbolsCount = 0
				reels[x].forEach((reelSymbolId, y) => {
					const wildCapacity = WILD_IDS_CAPACITY[reelSymbolId]
					const isMatch = symbolId === reelSymbolId
				
					if (isMatch || wildCapacity) {
						map[x][y] = 1
						isWinReel = true
						winSymbolsCount++
					}
				})

				if(!isWinReel) break

				winReelsCount++

				if(winSymbolsCount > winLinesCount)
					winLinesCount = winSymbolsCount
			}

			if(winReelsCount >= 3) {
				coefficient += COEFFICIENTS[symbolId][winReelsCount - 1] * winLinesCount * multiplier

				for(let x = 0; x < REELS_COUNT; x++)
					for(let y = 0; y < CELLS_PER_REEL_COUNT; y++) {
						if(!map[x][y]) continue
						if(winMap[x][y]) continue

						const reelSymbolId = reels[x][y]
						const wildCapacity = WILD_IDS_CAPACITY[reelSymbolId]
						const isWildCorruption = WILD_IDS_CAPACITY[reelSymbolId - 1] === 0

						if(isWildCorruption) {
							harvestedCapacity += wildCapacity
							winMap[x][y] = wildCapacity
						} else if(wildCapacity)
							winMap[x][y] = -1
						else
							winMap[x][y] = 1
					}
					
			}
		})

		if(!coefficient) return

		coefficient = Number(coefficient.toFixed(2))

		return {
			winMap,
			coefficient,
			harvestedCapacity,
		}
	}

	cascadeReels(reels, corruptionMap) {
		// WILD DRAIN...
		for (let x = 0; x < REELS_COUNT; x++)
			for(let y = 0; y < CELLS_PER_REEL_COUNT; y++)
				if(corruptionMap[x][y]
					&& WILD_IDS_CAPACITY[reels[x][y]]) {
						reels[x][y]--
					if(WILD_IDS_CAPACITY[reels[x][y]] === 0)
						reels[x][y] = 0
				}
		// ...WILD DRAIN

		// MAPPING CASCADE...
		const cascadeMap = reels.map(reel => reel.map(_ => 0))
		for(let x = 0; x < REELS_COUNT; x++) {
			let distance = 0
			for(let y = CELLS_PER_REEL_COUNT - 1; y >= 0; y--) {    
				if(corruptionMap[x][y] && !WILD_IDS_CAPACITY[reels[x][y]]) {
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
				if(corruptionMap[x][y] && !WILD_IDS_CAPACITY[reels[x][y]])
					reels[x][y] = 0
		// ...CORRUPTION

		// FALL...
		for (let x = 0; x < REELS_COUNT; x++)
			for(let y = CELLS_PER_REEL_COUNT - 1; y >= 0; y--)
				if(cascadeMap[x][y]) {
					reels[x][y + cascadeMap[x][y]] = reels[x][y]
					reels[x][y] = 0
				}
		// ...FALL

		// PATCH...
		const reelsPatch = this.getReelsPatch(reels)
		for (let x = 0; x < REELS_COUNT; x++)
			for(let y = 0; y < reelsPatch[x].length; y++)
				reels[x][y] = reelsPatch[x][y]
		// ...PATCH

		return reelsPatch
	}

	getReelsPatch(cascadedReels) {
		const reelsPatch = cascadedReels.map((reel, x) => {
			let cellsCount = 0
			for(let y = 0; y < CELLS_PER_REEL_COUNT; y++) {
				if(reel[y]) break
				cellsCount++
			}

			const singleReelPatch = []
			const offset = Math.trunc(Math.random() * REELS[x].length)

			for(let y = 0; y < cellsCount; y++)
				singleReelPatch.push(REELS[x][(offset + y) % REELS[x].length])


			return singleReelPatch
		})

		return reelsPatch
	}

	// DEBUG...
	print(reels, caption = '___') {
		let text = caption
		for(let y = 0; y < reels[0].length; y++) {
			text += '\n|'
			for(let x = 0; x < reels.length; x++) {
				const symbolId = (reels[x][y] ?? ' ') + ''

				text += ' ' + symbolId + (symbolId.length === 1 ? ' |' : '|')
			}
		}

		console.log(text)
	}
	// ...DEBUG

	getBetErrorCode({
		bet,
		betsValues = BETS_VALUES,
		desiredReels
	}) {
		if(desiredReels) {
			if(!CUSTOM_REELS_EXPECTED)
				return ERROR_CODES.CUSTOM_REELS_ARE_NOT_EXPECTED

			for (let x = 0; x < REELS_COUNT; x++)
				for (let y = 0; y < CELLS_PER_REEL_COUNT; y++)
					if(!POSSIBLE_REELS_IDS[x].includes(desiredReels[x][y]))
						return ERROR_CODES.CUSTOM_REELS_ARE_INVALID
		}

		if(!betsValues.includes(bet)) {
			return ERROR_CODES.INVALID_BET
		}

		if(this.balance < bet)
			return ERROR_CODES.OUT_OF_BALANCE
	}

	patchResponse(response) {
		return {
			...response,
			balance: Number(this.balance.toFixed(2)),
			currencyCode: CURRENCY_CODE,
		}
	}

	// API...
	getGameDescription(desiredLanguageCode) {
		return this.patchResponse({
			coefficients: COEFFICIENTS,
			betsValues: BETS_VALUES,
			buyFeatureValues: BUY_FEATURE_VALUES,
			languageCode: ALLOWED_LANGUAGES_CODES.includes(desiredLanguageCode)
				? desiredLanguageCode
				: ALLOWED_LANGUAGES_CODES[0],
		})
	}

	makeBet({
		bet = 10,
		buyFeaturePrice,
		desiredReels,
	}) {
		const finalPrice = buyFeaturePrice ?? bet

		if (buyFeaturePrice) {
			const errorCode = this.getBetErrorCode(
				buyFeaturePrice,
				BUY_FEATURE_VALUES
			)
			if(errorCode)
				return this.patchResponse({errorCode})
		}

		const errorCode = this.getBetErrorCode({bet, BETS_VALUES, desiredReels})
	
		if(errorCode)
			return this.patchResponse({errorCode})
		
		try {
			this.balance -= finalPrice
			const steps = this.generateSingleGameSteps({
				bet,
				desiredReels: CUSTOM_REELS_EXPECTED && desiredReels,
				isFreeSpinsAwardPurchased: !!buyFeaturePrice
			})

			let totalCoefficient = 0
			for(const {coefficient} of steps)
				totalCoefficient += coefficient ?? 0

			const totalPayout = Number((totalCoefficient * bet).toFixed(2))
			this.balance += totalPayout

			return this.patchResponse({
				totalCoefficient,
				totalPayout,
				steps
			})
		} catch (_) {
			return this.patchResponse({errorCode: ERROR_CODES.INTERNAL_ERROR})
		}
	}
	// ...API
}