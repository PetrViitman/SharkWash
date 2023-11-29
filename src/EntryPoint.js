import { GameLogic } from './busynessLogic/GameLogic'
import { PixiVuePresentation } from './presentation/pixiVue/PixiVuePresentation'
import { ConsolePresentation } from './presentation/console/ConsolePresentation'

const customURLParameters = new URLSearchParams(document.location.search)
const presentationType = customURLParameters.get("presentation")
const languageCode = customURLParameters.get("lang")
const customVFXLevel = customURLParameters.get("vfx")
const customUIOption = customURLParameters.get("view")

let presentation
if (presentationType === 'console') {
    presentation = new ConsolePresentation()
} else {
    presentation = new PixiVuePresentation({
        wrapperHTMLElementId: 'gameWrapper',
        customVFXLevel,
        customUIOption,
    })
}

new GameLogic(presentation).init(languageCode)
