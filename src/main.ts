import './style.css'
import ClockWorkletProcessor from './ClockWorkletProcessor?url'
import { MetronomeNode } from './MetronomeNode';
// @ts-ignore
import { ZZFX, zzfx } from "zzfx";

const audioContext = new AudioContext({ latencyHint: "playback", sampleRate: 96000 });
await audioContext.audioWorklet.addModule(ClockWorkletProcessor);

let bpm = 80;
let node = new MetronomeNode(audioContext, {processorOptions: {bpm: bpm}});

const start = () => {
    audioContext.resume();
    node.start();
}

const pause = () => {
    node.pause();
}

const stop = () => {
    node.stop();
}

const setBPM = (event: Event) => {
    const target = event.target as HTMLInputElement;
    bpm = parseInt(target.value);
    node.bpm(bpm);
}

document.getElementById("bpm")?.addEventListener("change", setBPM);
document.getElementById("start")?.addEventListener("click", start);
document.getElementById("pause")?.addEventListener("click", pause);
document.getElementById("stop")?.addEventListener("click", stop);