import { Container, Graphics } from "pixi.js"

const TARGET_DEVICE_TIME = 750

function isIOS() {
	return [
		'iPad Simulator',
		'iPhone Simulator',
		'iPod Simulator',
		'iPad',
		'iPhone',
		'iPod'
	].includes(navigator.platform)
	|| (navigator.userAgent.includes("Mac") && "ontouchend" in document)
}

export function getVFXLevel(pixiApplication) {
	if(isIOS()) return 0.75

	const benchStartTimeStamp = performance.now()
	const container = pixiApplication.stage.addChild(new Container)

	for(let i = 0; i < 100_000; i++) {
		container
			.addChild(new Graphics)
			.beginFill(0x00FF00, 0.5)
			.drawRect(0, 0, 1000, 1000)
			.beginFill()
	}

	container.destroy()

	const elapsedTime = performance.now() - benchStartTimeStamp

	return Math.min(1, TARGET_DEVICE_TIME / elapsedTime)
}
