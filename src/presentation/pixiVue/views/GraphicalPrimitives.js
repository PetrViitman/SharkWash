import { Graphics } from "pixi.js"

export function getGradient({
	width = 123,
	height = 123,
	color = 0xFFFFFF,
}) {
	const halfWidth = width / 2
	const alphaStep = 1 / halfWidth
	const graphics = new Graphics()

	let alpha = alphaStep

	for (let x = 0; x < halfWidth; x++) {
		alpha = Math.min(1, alpha + alphaStep)
		graphics
			.beginFill(color, alpha)
			.drawRect(x, 0, 1, height)
			.drawRect(width - x, 0, 1, height)
	}

	graphics.endFill()
	graphics.cacheAsBitmap = true
	graphics.pivot.set(halfWidth, height / 2)

	return graphics
}

export function getLightSpot({
	intensity = 0.1,
	radius = 123,
	color = 0xFFFFFF,
}) {
	const alphaStep = intensity / radius
	const graphics = new Graphics()

	let alpha = alphaStep

	for (let x = radius; x > 0; x--) {
		alpha = Math.min(1, alpha + alphaStep)
		graphics
			.beginFill(color, alpha)
			.drawCircle(0, 0, x)
	}

	graphics.endFill()
	graphics.cacheAsBitmap = true

	return graphics
}

export function getRectangleSpot({
	intensity = 0.1,
	width = 123,
	height = 123,
	color = 0xFFFFFF,
}) {
	const sideSize = Math.max(width, height)
	const alphaStep = intensity / sideSize
	const graphics = new Graphics()
	const scaleFactor = width / height
	let alpha = alphaStep

	for (let y = sideSize; y > 0; y--) {
		alpha = Math.min(1, alpha + alphaStep)
		graphics
			.beginFill(color, alpha)
			.drawRoundedRect(
				-(y / 2) * scaleFactor,
				-y / 2,
				y * scaleFactor,
				y,
			);
	}

	graphics.endFill()
	graphics.cacheAsBitmap = true

	return graphics
}

export function brightnessToHexColor(brightness) {
	let hex = Math.trunc(255 * Math.min(1, Math.max(0, brightness))).toString(16)
	if (hex.length === 1) { hex = '0' + hex }

	return parseInt('0x' + hex + hex + hex, 16)
}