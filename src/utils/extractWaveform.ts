/**
 * Extracts a downsampled waveform (peak amplitude values normalized 0-1)
 * from an audio Blob using the Web Audio API.
 *
 * @param blob - The audio Blob to analyse
 * @param bars  - Number of output bars (default 60)
 * @returns Promise<number[]> - Array of normalised peak values [0..1]
 */
export async function extractWaveform(blob: Blob, bars = 40): Promise<number[]> {
    const audioCtx = new OfflineAudioContext(1, 1, 44100);
    const arrayBuffer = await blob.arrayBuffer();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

    const raw = audioBuffer.getChannelData(0); // Float32Array
    const totalSamples = raw.length;
    const samplesPerBar = Math.floor(totalSamples / bars);

    const peaks: number[] = [];

    for (let i = 0; i < bars; i++) {
        let max = 0;
        const start = i * samplesPerBar;
        const end = Math.min(start + samplesPerBar, totalSamples);

        for (let j = start; j < end; j++) {
            const abs = Math.abs(raw[j]);
            if (abs > max) max = abs;
        }

        peaks.push(max);
    }

    // Normalise to 0-1 (find the loudest peak and scale relative to it)
    const loudest = Math.max(...peaks, 0.001);
    return peaks.map((p) => +(p / loudest).toFixed(3));
}
