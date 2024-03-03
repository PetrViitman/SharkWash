import { Container, Sprite } from "pixi.js";
import { Timeline } from "../../timeline/Timeline";

export class ReelHitEffect extends Container {
    timeline = new Timeline

    constructor(resources) {
        super()

        this.visible = false
        const sprites = [0, 0, 0].map((_, i) => {
            const sprite = new Sprite(resources.reel_hit_bubbles)
            sprite.anchor.set(0.5, 0.75)
            sprite.scale.x = i % 2 === 0 ? 1.25 : - 1.25
            return this.addChild(sprite)
        })

        this.timeline
            .addAnimation({
                duration: 750,
                onStart: () => this.visible = true,
                onProgress: progress => {
                    this.alpha =  Math.min(1, Math.sin(Math.PI * 2 * progress) * 3)

                    sprites.forEach((sprite, i) => {
                        const shiftedProgress = (progress + i * 0.2) % 1
                        sprite.y = -400 * shiftedProgress ** 3
                        sprite.scale.y = 1 + 1 * shiftedProgress
                        sprite.alpha = Math.sin(Math.PI * 2 * shiftedProgress)
                    })
                },
                onFinish: () => this.visible = false
            })
    }

    presentHit() {
        return this.timeline.wind(0).play()
    }
}