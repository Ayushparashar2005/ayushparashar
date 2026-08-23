export interface RecordedNote {
  note: number;
  startTick: number; // in ticks (e.g. 96 ticks per quarter note)
  durationTicks: number;
  velocity: number;
}

export interface Clip {
  id: string;
  startTick: number;
  lengthTicks: number;
  notes: RecordedNote[];
}

export interface Track {
  id: string;
  name: string;
  color: string;
  clips: Clip[];
  muted: boolean;
  soloed: boolean;
  volume: number;
  synthParams: any; // We will store the full parameter state here
  arpParams: any;
}

// 96 Ticks per Quarter Note is a standard resolution
export const PPQN = 96;

export class RecordingManager {
  private activeNotes: Map<number, { note: number; startTick: number; velocity: number }> = new Map();
  private recordedNotes: RecordedNote[] = [];

  public startRecording() {
    this.activeNotes.clear();
    this.recordedNotes = [];
  }

  public noteOn(note: number, velocity: number, currentTick: number) {
    this.activeNotes.set(note, { note, startTick: currentTick, velocity });
  }

  public noteOff(note: number, currentTick: number) {
    const activeNote = this.activeNotes.get(note);
    if (activeNote) {
      this.recordedNotes.push({
        note: activeNote.note,
        startTick: activeNote.startTick,
        durationTicks: Math.max(1, currentTick - activeNote.startTick), // Minimum 1 tick
        velocity: activeNote.velocity,
      });
      this.activeNotes.delete(note);
    }
  }

  public getNotes(currentTick: number): RecordedNote[] {
    const allNotes = [...this.recordedNotes];
    
    // Also include any notes that are currently being held down
    this.activeNotes.forEach((activeNote) => {
      allNotes.push({
        note: activeNote.note,
        startTick: activeNote.startTick,
        durationTicks: Math.max(1, currentTick - activeNote.startTick),
        velocity: activeNote.velocity,
      });
    });
    
    return allNotes;
  }

  public stopRecording(currentTick: number): RecordedNote[] {
    const finalNotes = this.getNotes(currentTick);
    
    // Commit the active notes to the recorded array for real,
    // though since we are clearing right after it's optional
    this.activeNotes.clear();
    
    return finalNotes;
  }
}

export const recordingManager = new RecordingManager();
