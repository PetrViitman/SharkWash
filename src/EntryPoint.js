import { GameLogic } from './busynessLogic/GameLogic'
const presentations = import.meta.glob('./presentation/*/Presentation.js')

const customURLParameters = new URLSearchParams(document.location.search)
const presentationType = customURLParameters.get("presentation") ?? 'pixi'
const languageCode = customURLParameters.get("lang") ?? 'en'
const customVFXLevel = customURLParameters.get("vfx")
const customUIOption = customURLParameters.get("view")

async function run() {
    const module = await presentations[
        './presentation/' + presentationType + '/Presentation.js'
    ]()

    new GameLogic(
        new module.Presentation({
            wrapperHTMLElementId: 'gameWrapper',
            customVFXLevel,
            customUIOption,
            languageCode,
        })
    ).init()
}

run()