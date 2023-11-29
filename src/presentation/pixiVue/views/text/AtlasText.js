import { Container } from 'pixi.js'
import { AtlasCharacter } from './AtlasCharacter'

export class AtlasText extends Container {
	bitmapCharacters = []
	availableCharacters
	textures
	letterSpacing
	text = ''
	color = 0xffffff
	sampleHeight = 0
	fontScaleFactor

	constructor({availableCharacters, textures}) {
		super()
		this.textures = textures
		this.availableCharacters = availableCharacters

		Object.values(textures).forEach((texture) => {
			this.sampleHeight = Math.max(
				texture.trim?.height ?? texture.orig.height,
				this.sampleHeight,
			)
		})

		this.setFontSize(this.sampleHeight)
	}

	getBitmapCharacter(index) {
		if (!this.bitmapCharacters[index]) {
			const bitmapCharacter = new AtlasCharacter({
				characters: this.availableCharacters,
				textures: this.textures,
			})
			this.bitmapCharacters[index] = this.addChild(bitmapCharacter)
		}

		return this.bitmapCharacters[index]
	}

	setText(text = '') {
		this.text = text

		return this.adjust()
	}

	setColor(color = 0xffffff) {
		this.color = color

		return this.adjust()
	}

	setLetterSpacing(letterSpacing = 0) {
		this.letterSpacing = letterSpacing
		this.adjust()

		return this
	}

	adjust() {
		let x = 0
		for (let i = 0; i < this.text.length; i++) {
			const bitmapCharacter = this.getBitmapCharacter(i)
			bitmapCharacter.visible = true
			bitmapCharacter.scale.set(this.fontScaleFactor)
			bitmapCharacter.setCharacter(this.text[i])
			bitmapCharacter.setColor(this.color)
			bitmapCharacter.x = x

			const characterWidth = bitmapCharacter.width < 1
				? this.sampleHeight * this.fontScaleFactor
				: bitmapCharacter.width
			x += characterWidth + this.letterSpacing

			bitmapCharacter.scale.x = this.fontScaleFactor
			bitmapCharacter.setColor(this.color)
		}

		for (let i = this.text.length; i < this.bitmapCharacters.length; i++) {
			this.bitmapCharacters[i].visible = false
		}

		return this
	}

	setFontSize(fontSize = 20) {
		this.fontScaleFactor = fontSize / this.sampleHeight

		return this.adjust()
	}
}
