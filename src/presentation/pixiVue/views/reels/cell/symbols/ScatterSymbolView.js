import { BaseSymbolView } from "./BaseSymbolView";

export class ScatterSymbolView extends BaseSymbolView {
	isLocked = true

	setLocked(isLocked = true) {
		if(this.isLocked === isLocked)
			return

		this.isLocked = isLocked

		if(isLocked) return this.resetBody()

		this.presentAnimation({index: 0})
		this.bodyView.wind(1)
	}

	setBlur(strength) {
		super.setBlur(strength)
		this.blurredBodyView.visible = this.isLocked
	}

	presentTeasing() {
		return this.presentAnimation({index: 1})
	}

	presentUnclock() {
		this.setLocked(false)
		return this.presentAnimation({index: 0})
	}
}