import 'pixi-spine'
import { Assets } from "pixi.js"
const COMMON_PATH = './src/presentation/pixiVue/assets'
let commonResources = {}

function spreadWrappedTextures(resources) {
	for (const {textures} of Object.values(resources))
		if (textures)
			for (const [name, texture] of Object.entries(textures))
				resources[name] = texture

	return resources
}


export async function getPreloadingResources() {
	Assets.addBundle('preloading', {
		loading_background: COMMON_PATH + '/jpg/loading_background.jpg',
		preloading_elements: COMMON_PATH + '/atlases/preloading_elements.json',
		bangopro:  COMMON_PATH + '/fonts/bangopro.otf',
	})

	commonResources = spreadWrappedTextures(
		await Assets.loadBundle('preloading'))

	return commonResources
}

export async function getResources(onProgressCallback) {    
	Assets.addBundle('gameAssets', {
		// SPINES...
		H1:  COMMON_PATH + '/spines/H1@2x.json',
		H2: COMMON_PATH + '/spines/H2@2x.json',
		H3: COMMON_PATH + '/spines/H3@2x.json',
		H4: COMMON_PATH + '/spines/H4@2x.json',
		L1: COMMON_PATH + '/spines/L1@2x.json',
		L2: COMMON_PATH + '/spines/L2@2x.json',
		L3: COMMON_PATH + '/spines/L3@2x.json',
		L4: COMMON_PATH + '/spines/L4@2x.json',
		SC: COMMON_PATH + '/spines/SC@2x.json',
		WR: COMMON_PATH + '/spines/WR@2x.json',
		bonus_mode_splash: COMMON_PATH + '/spines/Intro@2x.json',
		bonus_payout_splash: COMMON_PATH + '/spines/outro@2x.json',
		bubbles: COMMON_PATH + '/spines/bubbles@2x.json',
		bubble_multiplier: COMMON_PATH + '/spines/bubble_multiplier@2x.json',
		big_win: COMMON_PATH + '/spines/win_feedback@2x.json',
		// ...SPINES
	
		// ATLASES...
		wild_elements: COMMON_PATH + '/atlases/wild_elements.json',
		bonus_reels_elements: COMMON_PATH + '/atlases/bonus_reels_elements.json',
		bright_blue_elements: COMMON_PATH + '/atlases/bright_blue_elements.json',
		colorless_elements: COMMON_PATH + '/atlases/colorless_elements.json',
		default_reels_elements: COMMON_PATH + '/atlases/default_reels_elements.json',
		multiplier_elements: COMMON_PATH + '/atlases/multiplier_elements.json',
		teaser_elements: COMMON_PATH + '/atlases/teaser_elements.json',
		wild_elements: COMMON_PATH + '/atlases/wild_elements.json',
		yellow_elements: COMMON_PATH + '/atlases/yellow_elements.json',
		elements: COMMON_PATH + '/atlases/elements.json',
		// ...ATLASES

		// JPG...
		background_tile: COMMON_PATH + '/jpg/background_tile.jpg',
		background_free_spins: COMMON_PATH + '/jpg/background_free_spins.jpg',
		// ...JPG
	})

	const resources = spreadWrappedTextures(
		await Assets.loadBundle('gameAssets', onProgressCallback))

	return {...commonResources, ...resources}
}
