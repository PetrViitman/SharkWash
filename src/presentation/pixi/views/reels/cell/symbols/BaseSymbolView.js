import { BlurFilter, Container } from 'pixi.js'
import { SpineView } from '../../../SpineView'
import { brightnessToHexColor } from '../../../GraphicalPrimitives'

const BLUR_FILTER = new BlurFilter()
BLUR_FILTER.blurX = 0
BLUR_FILTER.blurY = 20

const DESCRIPTORS = {
    0: {},
    1: {name: 'L1'},
    2: {name: 'L2'},
    3: {name: 'L3'},
    4: {name: 'L4'},
    5: {name: 'H4', isFramesBased: true},
    6: {name: 'H3', isFramesBased: true},
    7: {name: 'H2', isFramesBased: true},
    8: {name: 'H1', isFramesBased: true},
    9: {name: 'SC'},
    11:{name: 'WR', isFramesBased: true},
}

export class BaseSymbolView extends Container {
    bodyView
    blurredBodyView
    brightness = 1
    isFramesBased

    constructor({id, resources, vfxLevel}) {
        super()
        const {name, isFramesBased} = DESCRIPTORS[id]
        this.isFramesBased = isFramesBased 
        this.initBody(name, resources)
        this.initBlurredBody({name, resources, vfxLevel})
    }

    generateBodySpine({name, resources}) {
        const view = this.addChild(new SpineView(resources[name].spineData))
        view.playAnimation({name: view.animationsNames[0]})

        return view
    }

    initBody(name, resources) {
        if(!name) {
            this.bodyView = this.addChild(new Container())
            return
        }

        this.bodyView = this.generateBodySpine({name, resources})
        this.resetBody()
        this.setVisible(false)
    }

    initBlurredBody({name, resources, vfxLevel = 0}) {
        if(!name || vfxLevel < 1) {
            this.blurredBodyView = this.addChild(new Container())
            return
        }

        this.blurredBodyView = this.generateBodySpine({name, resources})
        this.blurredBodyView.reset?.(!this.isFramesBased)
        this.blurredBodyView.filters = [BLUR_FILTER]

        this.blurredBodyView.cacheAsBitmap = true
    }

    setBrightness(brightness) {
        this.brightness = Math.min(1, Math.max(0.25, brightness))

        if(!this.bodyView) { return }
        this.bodyView.tint = brightnessToHexColor(this.brightness)
    }

    setBlur(strength = 1) {
        this.blurredBodyView.alpha = strength
    }

    /**
     * The performance impact on making spine 
     * visible rather than cutting off alpha
     * has changed since pixi 6
     */
    setVisible(isVisible = true) {
        this.visible = isVisible
    }

    presentAnimation({index, isReversed = false}) {
        return this.bodyView.playAnimation?.({
            name: this.bodyView.animationsNames[index],
            isReversed
        })
    }

    async presentCorruption() {
        await this.bodyView.playAnimation?.({
            name: this.bodyView.animationsNames[1]
        })

        if(this.isFramesBased) return

        this.resetBody()
        this.setVisible(false)
    }

    resetBody() {
        this.bodyView.reset?.(!this.isFramesBased)
    }

    setTimeScale(timeScale) {
        this.bodyView?.setTimeScale?.({
            timeScale,
            ignoreInversion: true
        })
    }
}
