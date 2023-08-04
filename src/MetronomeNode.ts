export class MetronomeNode extends AudioWorkletNode {

    $logicalTime: HTMLElement;
    $currentTime: HTMLElement;
    $beats: HTMLElement;

    constructor(context: BaseAudioContext, options?: AudioWorkletNodeOptions) {
        super(context, 'clock', options);
        this.$currentTime = document.getElementById("currentTime")!;
        this.$logicalTime = document.getElementById("logicalTime")!;
        this.$beats = document.getElementById("beats")!;
        this.port.addEventListener("message", this.handleMessage);
        this.port.start();
    }

    handleMessage = (event: MessageEvent) => {
        const {type, data} = event.data;
        if(type === 'bang') {
            this.beep();
            this.$currentTime.innerText = data.currentTime.toFixed(4);
            this.$logicalTime.innerText = data.logicalTime.toFixed(4);
            this.$beats.innerText = data.beats;
        }
    }

    beep() {
        const oscillator = this.context.createOscillator();
        oscillator.type = 'square';
        oscillator.frequency.value = 440;
        oscillator.connect(this.context.destination);
        oscillator.start();
        oscillator.stop(this.context.currentTime+0.05);
    }

    start() {
        this.port.postMessage({type: 'start'});
    }

    stop() {
        this.port.postMessage({type: 'stop'});
    }

    pause() {
        this.port.postMessage({type: 'pause'});
    }

    bpm(value: number) {
        this.port.postMessage({type: 'bpm', data: value});
    }

}