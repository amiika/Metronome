class ClockWorkletProcessor extends AudioWorkletProcessor {
    private interval: number; // Time interval between function calls in seconds
    private nextBang: number; // Time of next call in seconds
    private isOn: boolean; // Whether the scheduler is currently running
    private bpm: number; // Beats per minute
    private logicalTime: number; // Time at which the scheduler was stopped
    private lastPausedTime: number; // Time at which the scheduler was paused
    private totalPausedTime: number; // Total time the scheduler has been paused
    private wasStopped: boolean; // Whether the scheduler was stopped
    private startedAgainTime: number; // Total time the scheduler has been stopped
    private beats: number; // Number of beats from start

    constructor(options: AudioWorkletNodeOptions) {
        super();
        const processorOptions = options.processorOptions ? options.processorOptions : {};
        this.bpm = processorOptions.bpm ? processorOptions.bpm : 80;
        this.interval = (60 / this.bpm);
        this.beats = 0;
        this.nextBang = 0;
        this.isOn = false;
        this.logicalTime = 0;
        this.totalPausedTime = 0;
        this.lastPausedTime = 0;
        this.startedAgainTime = 0;
        this.wasStopped = false;
        this.port.addEventListener('message', this.handleMessage_);
        this.port.start();

    }

    handleMessage_ = (event: MessageEvent) => {
        const {type, data} = event.data;
        switch(type) {
            case 'start':
                this.start_();
                break;
            case 'pause':
                this.pause_();
                break;
            case 'stop':
                this.stop_();
                break;
            case 'bpm':
                this.setBPM_(data);
                break;
            case 'duration':
                this.duration_(data);
                break;
        }
    }

    start_() {
        this.isOn = true;
    }

    pause_() {
        this.isOn = false;
        if(this.lastPausedTime === 0) {
            this.lastPausedTime = currentTime;
            console.log("Paused at", currentTime);
        }
    }

    stop_() {
        this.isOn = false;
        this.wasStopped = true;
        console.log("Stopped at: " + currentTime);
        this.totalPausedTime = 0;
        this.lastPausedTime = 0;
        this.beats = 0;
    }

    setBPM_(bpm: number) {
        this.bpm = bpm;
        this.interval = (60 / this.bpm);
    }

    duration_(beat: number) {
       this.interval = (beat / this.bpm) * 60;
    }

    process(): boolean {
        if(this.isOn) {
            if(this.lastPausedTime>0) {
                const pausedTime = currentTime-this.lastPausedTime;
                this.totalPausedTime += pausedTime;
                this.lastPausedTime = 0;
                console.log("Paused for: " + pausedTime);
                console.log("Total paused time: " + this.totalPausedTime);
                console.log("Started again at: ", currentTime);
            }
            if(this.wasStopped) {
                this.startedAgainTime = currentTime;
                this.wasStopped = false;
                this.nextBang = 0;
                console.log("Started again at: ", currentTime);
            }
            this.logicalTime = currentTime-this.totalPausedTime-this.startedAgainTime;
            if(this.logicalTime >= this.nextBang) {
                this.port.postMessage({ type: "bang", data: {logicalTime: this.logicalTime, currentTime: currentTime, beats: this.beats} });
                console.log("Bang!", this.logicalTime);
                this.nextBang = this.logicalTime + this.interval;
                this.beats++;
            }
        } 
        return true;
    }
}

registerProcessor('clock', ClockWorkletProcessor);