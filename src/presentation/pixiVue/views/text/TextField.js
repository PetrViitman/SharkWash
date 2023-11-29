import { Graphics, BitmapText, Container } from 'pixi.js'
import { AtlasText } from './AtlasText'

const ALIGN_IDS = {
	LEFT: 0,
	CENTER: 1,
	RIGHT: 2,
	TOP: 0,
	MIDDLE: 1,
	BOTTOM: 2,
}

export class TextField extends Container {
	text
	maximalWidth
	maximalHeight
	style = {
		familyName: undefined,
		fontSize: 20,
		fontColor: 0xffffff,
		letterSpacing: 0,
		letterFalling: 0,
	}
	areaGraphics
	horizontalAlignMode = ALIGN_IDS.LEFT
	verticalAlignMode = ALIGN_IDS.TOP
	bitmapText
	atlasText
	textView

	constructor({
		maximalWidth = undefined,
		maximalHeight = undefined,
	}) {
		super()

		this.maximalWidth = maximalWidth
		this.maximalHeight = maximalHeight
		this.setFontName()
		this.setText('')
	}

	highlightArea() {
		if (!this.areaGraphics)
			this.areaGraphics = this.addChildAt(new Graphics(), 0)

		const width = this.maximalWidth ?? this.width
		const height = this.maximalHeight ?? this.height

		this.areaGraphics
			.clear()
			.beginFill(0xffffff, 0.25)
			.drawRect(0, 0, width, height)
			.drawRect(
				0,
				0,
				width,
				height,
			)
			.endFill()

		return this
	}

	setText(text = '') {
		const finalText = text + ''
		if (finalText === this.text)
			return this

		this.text = finalText

		if (!this.textView)
			return this

		this.textView.text = finalText
		if (this.atlasText)
			this.atlasText.setText(finalText)

		return this.adjust()
	}

	setMaximalWidth(maximalWidth) {
		this.maximalWidth = maximalWidth

		return this.adjust()
	}

	setMaximalHeight(maximalHeight) {
		this.maximalHeight = maximalHeight

		return this.adjust()
	}

	setAlignLeft() {
		return this.setHorizontalAlignMode(ALIGN_IDS.LEFT)
	}

	setAlignCenter() {
		return this.setHorizontalAlignMode(ALIGN_IDS.CENTER)
	}

	setAlignRight() {
		return this.setHorizontalAlignMode(ALIGN_IDS.RIGHT)
	}

	setAlignTop() {
		return this.setVerticalAlignMode(ALIGN_IDS.TOP)
	}

	setAlignMiddle() {
		return this.setVerticalAlignMode(ALIGN_IDS.MIDDLE)
	}

	setAlignBottom() {
		return this.setVerticalAlignMode(ALIGN_IDS.BOTTOM)
	}

	setHorizontalAlignMode(horizontalAlignMode) {
		if (this.horizontalAlignMode === horizontalAlignMode)
			return this

		this.horizontalAlignMode = horizontalAlignMode
		this.adjust()

		return this
	}

	setVerticalAlignMode(verticalAlignMode) {
		if (this.verticalAlignMode === verticalAlignMode)
			return this

		this.verticalAlignMode = verticalAlignMode
		this.adjust()

		return this
	}

	adjust() {
		if (!this.textView) return this

		this.areaGraphics?.clear()
		this.textView.scale.set(1)
		this.textView.visible = true

		const textFullWidth = this.textView.width
		const textFullHeight = this.textView.height
		const maximalWidth = this.maximalWidth ?? textFullWidth
		const maximalHeight = this.maximalHeight ?? textFullHeight

		let scaleX = 1
		let scaleY = 1

		if (maximalWidth)
			scaleX = Math.min(1, maximalWidth / textFullWidth)

		if (textFullHeight)
			scaleY = Math.min(1, maximalHeight / textFullHeight)
		
		const scale = Math.min(scaleX, scaleY)

		this.textView.scale.set(scale)

		let x = 0
		let y = 0

		switch (this.horizontalAlignMode) {
			case ALIGN_IDS.CENTER:
				x = (maximalWidth - textFullWidth * scale) * 0.5
				break
			case ALIGN_IDS.RIGHT:
				x = (maximalWidth - textFullWidth * scale)
				break
			default:
				x = 0
				break
		}

		switch (this.verticalAlignMode) {
			case ALIGN_IDS.TOP:
				y = 0
				break
			case ALIGN_IDS.BOTTOM:
				y = maximalHeight - this.textView.height * scaleY
				break
			default:
				y = maximalHeight * 0.5 - this.textView.height * 0.5
				break
		}

		this.textView.position.set(x, y)

		if (this.areaGraphics)
			this.highlightArea()

		return this
	}

	setLetterSpacing(letterSpacing = 0) {
		this.style.letterSpacing = letterSpacing

		if (this.bitmapText)
			this.bitmapText.letterSpacing = letterSpacing
		else if (this.atlasText)
			this.atlasText.setLetterSpacing(letterSpacing)

		this.adjust()

		return this
	}

	setFontName(fontName = '', textures) {
		if (this.style.familyName === fontName && !textures)
			return this

		this.style.familyName = fontName
		if (this.textView) {
			this.removeChild(this.textView)
			this.textView.destroy()
			this.textView = null
		}

		// atlas font case
		if (textures && fontName) {
			this.atlasText = new AtlasText({
				availableCharacters: fontName,
				textures,
			})
			this.bitmapText = null
			this.textView = this.addChild(this.atlasText)
		}

		// bitmap font as second highest priority
		if (!this.textView) {
			try {
				this.atlasText = null
				this.bitmapText = new BitmapText('', {fontName})
				this.textView = this.addChild(this.bitmapText)
			} catch (e) {}
		}

		return this.setFontSize(this.style.fontSize)
			.setFontColor(this.style.fontColor)
			.setLetterSpacing(this.style.letterSpacing)
			.setHorizontalAlignMode(this.horizontalAlignMode)
			.setVerticalAlignMode(this.verticalAlignMode)
			.setText(this.text)
	}

	setFontSize(fontSize) {
		this.style.fontSize = fontSize

		if (this.bitmapText)
			this.bitmapText.fontSize = fontSize
		else if (this.atlasText)
			this.atlasText.setFontSize(fontSize)

		return this.adjust()
	}

	setFontColor(color) {
		this.style.fontColor = color
		this.atlasText?.setColor(color)
		if (this.bitmapText) 
			this.bitmapText.tint = color

		return this.adjust()
	}
}
