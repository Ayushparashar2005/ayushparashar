import type { Track } from './RecordingManager';

function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2 + 44;
  const bufferArray = new ArrayBuffer(length);
  const view = new DataView(bufferArray);
  const channels: Float32Array[] = [];
  let i;
  let sample;
  let offset = 0;
  let pos = 0;

  const setUint16 = (data: number) => {
    view.setUint16(pos, data, true);
    pos += 2;
  };

  const setUint32 = (data: number) => {
    view.setUint32(pos, data, true);
    pos += 4;
  };

  // write WAVE header
  setUint32(0x46464952);                         // "RIFF"
  setUint32(length - 8);                         // file length - 8
  setUint32(0x45564157);                         // "WAVE"

  setUint32(0x20746d66);                         // "fmt " chunk
  setUint32(16);                                 // length = 16
  setUint16(1);                                  // PCM (uncompressed)
  setUint16(numOfChan);
  setUint32(buffer.sampleRate);
  setUint32(buffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
  setUint16(numOfChan * 2);                      // block-align
  setUint16(16);                                 // 16-bit (hardcoded)

  setUint32(0x61746164);                         // "data" - chunk
  setUint32(length - pos - 4);                   // chunk length

  // write interleaved data
  for(i = 0; i < buffer.numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  while(pos < length) {
    for(i = 0; i < numOfChan; i++) {             // interleave channels
      sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767)|0; // scale to 16-bit signed int
      view.setInt16(pos, sample, true);          // write 16-bit sample
      pos += 2;
    }
    offset++;                                     // next source sample
  }

  return new Blob([bufferArray], {type: "audio/wav"});
}

export class Exporter {
  // Audio Export via MediaRecorder (Saves as WebM/MP4 depending on browser)
  public static async exportAudio(mediaStream: MediaStream, durationMs: number): Promise<void> {
    return new Promise((resolve) => {
      let mimeType = '';
      let ext = 'webm';
      if (MediaRecorder.isTypeSupported('audio/webm')) {
        mimeType = 'audio/webm';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
        ext = 'mp4';
      } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
        mimeType = 'audio/ogg';
        ext = 'ogg';
      }

      const mediaRecorder = new MediaRecorder(mediaStream, mimeType ? { mimeType } : undefined);
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        try {
          const webmBlob = new Blob(chunks, { type: mimeType || 'audio/webm' });
          
          // Decode the compressed browser recording back into raw PCM audio
          const arrayBuffer = await webmBlob.arrayBuffer();
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          const ctx = new AudioContextClass();
          const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
          
          // Convert the raw PCM audio into a true .wav file
          const wavBlob = audioBufferToWav(audioBuffer);
          
          const url = URL.createObjectURL(wavBlob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Studio_Export_${Date.now()}.wav`;
          document.body.appendChild(a);
          a.click();
          setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }, 100);
          resolve();
        } catch (e) {
          console.error("Failed to create download", e);
          resolve();
        }
      };

      try {
        mediaRecorder.start();
        
        // Automatically stop after the specified duration
        setTimeout(() => {
          if (mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
          }
        }, durationMs);
      } catch (e: any) {
        alert("Failed to start recording: " + e.message);
        resolve();
      }
    });
  }

  // Basic MIDI Export (Type 0)
  public static exportMIDI(track: Track, bpm: number, ppqn: number = 96) {
    // 1. Flatten all notes from clips into a single array
    const allEvents: { tick: number; type: 'on' | 'off'; note: number; velocity: number }[] = [];

    track.clips.forEach(clip => {
      clip.notes.forEach(n => {
        const absoluteStart = clip.startTick + n.startTick;
        const absoluteEnd = absoluteStart + n.durationTicks;
        allEvents.push({ tick: absoluteStart, type: 'on', note: n.note, velocity: n.velocity });
        allEvents.push({ tick: absoluteEnd, type: 'off', note: n.note, velocity: 0 });
      });
    });

    // Sort by absolute tick
    allEvents.sort((a, b) => a.tick - b.tick);

    // 2. Build MIDI Byte Array
    const bytes: number[] = [];

    const writeString = (s: string) => {
      for (let i = 0; i < s.length; i++) bytes.push(s.charCodeAt(i));
    };

    const write32 = (v: number) => {
      bytes.push((v >> 24) & 0xFF, (v >> 16) & 0xFF, (v >> 8) & 0xFF, v & 0xFF);
    };

    const write16 = (v: number) => {
      bytes.push((v >> 8) & 0xFF, v & 0xFF);
    };

    const writeVarLength = (v: number) => {
      let buffer = v & 0x7F;
      while ((v >>= 7)) {
        buffer <<= 8;
        buffer |= ((v & 0x7F) | 0x80);
      }
      while (true) {
        bytes.push(buffer & 0xFF);
        if (buffer & 0x80) buffer >>= 8;
        else break;
      }
    };

    // Header Chunk
    writeString('MThd');
    write32(6); // Chunk length
    write16(0); // Format 0 (single track)
    write16(1); // 1 track
    write16(ppqn); // Division (ticks per quarter note)

    // Track Chunk Data
    const trackBytes: number[] = [];
    
    // Set Tempo Meta Event (microseconds per quarter note)
    const msPerQuarter = Math.round(60000000 / bpm);
    trackBytes.push(0x00, 0xFF, 0x51, 0x03);
    trackBytes.push((msPerQuarter >> 16) & 0xFF, (msPerQuarter >> 8) & 0xFF, msPerQuarter & 0xFF);

    let lastTick = 0;
    
    const writeTrackVarInt = (val: number) => {
        // Encode variable length quantity for track bytes
        const buffer = [];
        buffer.push(val & 0x7f);
        while (val >>= 7) {
            buffer.push((val & 0x7f) | 0x80);
        }
        for (let i = buffer.length - 1; i >= 0; i--) {
            trackBytes.push(buffer[i]);
        }
    }

    allEvents.forEach(evt => {
      const delta = evt.tick - lastTick;
      writeTrackVarInt(delta);
      
      if (evt.type === 'on') {
        trackBytes.push(0x90, evt.note, evt.velocity); // Channel 0 Note On
      } else {
        trackBytes.push(0x80, evt.note, 0); // Channel 0 Note Off
      }
      
      lastTick = evt.tick;
    });

    // End of track meta event
    trackBytes.push(0x00, 0xFF, 0x2F, 0x00);

    // Track Chunk Header
    writeString('MTrk');
    write32(trackBytes.length);
    bytes.push(...trackBytes);

    // Generate File
    const blob = new Blob([new Uint8Array(bytes)], { type: 'audio/midi' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Studio_Export_${Date.now()}.mid`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }
}
