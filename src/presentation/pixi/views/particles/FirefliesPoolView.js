import { Ticker } from 'pixi.js'
import { AdaptiveContainer } from '../adaptiveDesign/AdaptiveContainer'
import { FireflyView } from './FireflyView'

const PARTICLE_SPAWN_PERIOD = 25

export class FirefliesPoolView extends AdaptiveContainer {
	particles = []
	framesCount = 0
	color
	spawnArea
	scaleFactor
	tickerFunction

	constructor({
		scaleFactor = 1,
		color = 0xFFFF00,
		spawnArea = {
			x: 0,
			y: 0,
			width: 1,
			height: 1,
		},
	}) {
		super()
		this.color = color
		this.spawnArea = spawnArea
		this.scaleFactor = scaleFactor

		this.setSourceArea({width: 1000, height: 1000})
			.setTargetArea({
				x: 0, y: 0, width: 1, height: 1,
			})
			.stretchHorizontally()
			.stretchVertically()


		for (let i = 0; i < PARTICLE_SPAWN_PERIOD * 16; i++)
			this.update(1)

		this.tickerFunction = (timeScale) => { this.update(timeScale) }

		Ticker.shared.add(this.tickerFunction)
	}

	getNextParticle() {
		const {particles} = this

		// Reuse idling particle
		for (let i = 0; i < particles.length; i++)
			if (particles[i].isReadyToBeReused())
				return particles[i]

		// create new if no particles to reuse
		const particle = this.addChild(new FireflyView(this.color))
		particles.push(particle)

		return particle
	}

	update(timeScale = 1) {
		this.framesCount += timeScale * this.scaleFactor

		if (this.framesCount >= PARTICLE_SPAWN_PERIOD) {
			this.framesCount %= PARTICLE_SPAWN_PERIOD
			const particle = this.getNextParticle()
			particle.reset()

			const {spawnArea} = this
			const x = Math.random() * spawnArea.width * 1000
			const y = Math.random() * spawnArea.height * 1000

			particle.position.set(
				spawnArea.x * 1000 + x,
				spawnArea.y * 1000 + y,
			)
		}

		const {
			particles,
			scale: {x, y},
		} = this
		const scaleFactor = Math.min(Math.min(x, y) * 3, 1) * this.scaleFactor

		particles.forEach((particle) => {
			particle.scale.set(scaleFactor / x, scaleFactor / y)
			particle.update(timeScale * this.scaleFactor)
		})
	}

	onAdjustedToTargetArea() {
		this.update(0)
	}

	destroy() {
		Ticker.shared.remove(this.tickerFunction)
		super.destroy(true)
	}

	setColor(color) {
		this.particles.forEach(view => view.setColor(color))
	}
}
