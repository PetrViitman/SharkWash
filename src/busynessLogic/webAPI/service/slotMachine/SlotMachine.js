const REELS_COUNT = 5
const CELLS_PER_REEL_COUNT = 4
const SCATTER_SYMBOL_ID = 9
const LOW_VALUE_IDS = [1, 2, 3, 4]
const HIGH_VALUE_IDS = [5, 6, 7, 8]
const SPECIAL_SYMBOLS_IDS = [SCATTER_SYMBOL_ID, 11, 22, 33, 44, 55]
const DEFAULT_SYMBOLS_IDS = [3, 2, 5, 8, 7,  1, 4, 6]
const SYMBOLS_IDS = [...DEFAULT_SYMBOLS_IDS, ...SPECIAL_SYMBOLS_IDS]
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

export class SlotMachine {
	coefficients = COEFFICIENTS
	lowValueIds = LOW_VALUE_IDS
	highValueIds = HIGH_VALUE_IDS
	defaultSymbolsIds = DEFAULT_SYMBOLS_IDS
	specialSymbolsIds = SPECIAL_SYMBOLS_IDS
	symbolsIds = SYMBOLS_IDS
	width = REELS_COUNT
	height = CELLS_PER_REEL_COUNT
	probability = []
	statistics = {
		roundsCount: 0,
		winCoefficients: [],
		reSpins: [],
		totalReSpinsCount: 0,
		freeSpins: [],
		totalFreeSpinsCount: 0,
		maxCoefficient: 0
	}

	constructor(probability) {
		this.probability = probability
	}

	roll() {
		const { probability } = this
		const reels = new Array(REELS_COUNT).fill(0).map(_ => new Array(CELLS_PER_REEL_COUNT).fill(0).map(_ => 0))
	
		reels.forEach((reel, x) => {
			const offsetY = Math.trunc(Math.random() * CELLS_PER_REEL_COUNT)
			reel.forEach((_, y) => {
				const randomNumber = Math.random()
				let probabilityOffset = 0

				for (let i = 0; i < SYMBOLS_IDS.length; i++) {
					const id = SYMBOLS_IDS[i]
					const symbolProbability = probabilityOffset + probability[id][x][y]	
					if (randomNumber <= symbolProbability) {
						reel[(y + offsetY) % CELLS_PER_REEL_COUNT] = id
						break
					}
		
					probabilityOffset = symbolProbability
				}
			})
		})

		return reels
	}

	generateSingleGameDescriptor({
		bet = 1,
		isFreeSpinsAwardPurchased,
		desiredReels,
	}) {
		let roundSteps = []
		let isFreeSpinsMode
		let freeSpinsCount = 0
		let isReSpinRequired
		let multiplierCapacity = 0

		do {
			freeSpinsCount = Math.max(0, freeSpinsCount - 1)
			let reels = desiredReels ?? this.roll()
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
				?? BONUS_IDS_COUNT_AWARD_MAP[5]

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

			// RE-SPIN DETECTION...
			if(isReSpinRequired)
				subSteps[0].isReSpin = true

			isReSpinRequired = false
			if (!isFreeSpinsMode)
				for(const step of subSteps) {
					if (step.harvestedCapacity) {
						isReSpinRequired = true
						break
					}
				}
			// ...RE-SPIN DETECTION

			roundSteps = [...roundSteps, ...subSteps]

			// cheat reels dropped after 1st spin
			desiredReels = undefined

			// just to make it easier to adjust reels values while developing
			if(roundSteps.length > 100)
				throw 'infinite wins! 😱😱😱'

		} while (freeSpinsCount || isReSpinRequired)

		// TOTAL COEFFICIENT...
		let totalCoefficient = 0
		roundSteps.forEach(({coefficient}) => {
			totalCoefficient += (coefficient || 0)
		})
		// ...TOTAL COEFFICIENT

		// STATISTICS UPDATE...
		const { statistics } = this
		if (statistics) {
			// WIN COEFFICIENTS...
			totalCoefficient && statistics.winCoefficients.push({
				roundIndex: statistics.roundsCount,
				coefficient: totalCoefficient
			})
			// ...WIN COEFFICIENTS

			// FREE SPINS & RE-SPINS...
			const freeSpins = { roundIndex: statistics.roundsCount, freeSpinsCount: 0 }
			const reSpins = { roundIndex: statistics.roundsCount, reSpinsCount: 0 }
	
			
			roundSteps.forEach(({isReSpin, awardedFreeSpinsCount}) => {
				if(awardedFreeSpinsCount) {
					statistics.totalFreeSpinsCount += awardedFreeSpinsCount
					freeSpins.freeSpinsCount += awardedFreeSpinsCount
				}
				if(isReSpin) {
					statistics.totalReSpinsCount++
					reSpins.reSpinsCount++
				}
			})
			freeSpins.freeSpinsCount && statistics.freeSpins.push(freeSpins)
			reSpins.reSpinsCount && statistics.reSpins.push(reSpins)
			// ...FREE SPINS & RE-SPINS

			// MAX COEFFICIENT...
			if(totalCoefficient > statistics.maxCoefficient)
				statistics.maxCoefficient = totalCoefficient
			// ...MAX COEFFICIENT

			statistics.roundsCount++
		}
		// ...STATISTICS UPDATE


		return {
			steps: roundSteps,
			totalCoefficient
		}
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
			let winWidth = 0
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

				winWidth++

				if(winSymbolsCount > winLinesCount)
					winLinesCount = winSymbolsCount
			}

			if(winWidth >= 3) {
				coefficient += this.coefficients[symbolId][winWidth - 1] * winLinesCount * multiplier

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
		const reels = this.roll()
		const reelsPatch = cascadedReels.map((reel, x) => {
			let cellsCount = 0
			for(let y = 0; y < CELLS_PER_REEL_COUNT; y++) {
				if(reel[y]) break
				cellsCount++
			}

			const singleReelPatch = []
			
			for(let y = 0; y < cellsCount; y++)
				singleReelPatch.push(reels[x][y])

			return singleReelPatch
		})

		return reelsPatch
	}

	// DEBUG...
	/*
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
	*/
	// ...DEBUG
}