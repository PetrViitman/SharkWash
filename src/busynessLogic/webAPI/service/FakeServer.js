import { SlotMachine } from "./slotMachine/SlotMachine"
import PROBABILITY from "./slotMachine/RTP97"

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
	slotMachine = new SlotMachine(PROBABILITY)
	balance = 10000

	constructor() {
		// const rtpEditor = new RTPEditor(this.slotMachine)
		// rtpEditor.adjustProbability()
	}

	getBetErrorCode({
		bet,
		betsOptions = BETS_VALUES,
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

		if(!betsOptions.includes(bet)) {
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
	getGameDescription() {
		return this.patchResponse({
			coefficients: this.slotMachine.coefficients,
			betsOptions: BETS_VALUES,
			buyFeatureOptions: BUY_FEATURE_VALUES,
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
			const { steps, totalCoefficient } = this
				.slotMachine
				.generateSingleGameDescriptor({
					bet,
					desiredReels: CUSTOM_REELS_EXPECTED && desiredReels,
					isFreeSpinsAwardPurchased: !!buyFeaturePrice
				})

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