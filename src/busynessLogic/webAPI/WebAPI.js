import { FakeServer } from "./FakeServer"
const server = new FakeServer

/**
 * Independent wait for latency imitation
 */
function wait(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

export async function makeGameDescriptionRequest(languageCode) {
    // high latency on this initial request makes no sence for this demo anyways 
    await wait(Math.random() * 100)
    return server.getGameDescription(languageCode)
}

export async function makeBetRequest({bet, buyFeaturePrice, desiredReels}) {
    await wait(Math.random() * 2000)
    return server.makeBet({
        bet,
        buyFeaturePrice,
        desiredReels: desiredReels?.map(reel => reel.map(id => id))
    })
}