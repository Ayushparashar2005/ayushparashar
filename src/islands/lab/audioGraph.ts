import type { NodeState, EdgeState } from './types';

class AudioGraphManager {
  private ctx: AudioContext | null = null;
  private nodes: Map<string, AudioNode> = new Map();
  private oscillators: Map<string, OscillatorNode> = new Map();

  public getContext() {
    if (!this.ctx) {
      this.ctx = new AudioContext();
    }
    return this.ctx;
  }

  public compile(nodes: NodeState[], edges: EdgeState[]) {
    const ctx = this.getContext();
    
    // Cleanup old graph
    this.nodes.forEach(node => node.disconnect());
    this.oscillators.forEach(osc => osc.stop());
    this.nodes.clear();
    this.oscillators.clear();

    const audioOutNode = nodes.find(n => n.type === 'AUDIO_OUT');
    if (!audioOutNode) return;

    // We use a GainNode as the master out before destination
    const masterOut = ctx.createGain();
    masterOut.connect(ctx.destination);
    this.nodes.set(audioOutNode.id, masterOut);

    // Find all audio nodes and instantiate them
    nodes.forEach(node => {
      if (node.type === 'SYNTH_OSC') {
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth'; // default
        
        // Find if freq is connected or use default
        const freqEdge = edges.find(e => e.targetNodeId === node.id && e.targetInputId === 'freq');
        if (!freqEdge) {
          // If no connection, maybe we have customData or just use 440
          osc.frequency.value = node.customData?.freq || 440;
        }
        
        osc.start();
        this.nodes.set(node.id, osc);
        this.oscillators.set(node.id, osc);
      }
    });

    // Connect nodes based on edges
    edges.forEach(edge => {
      const sourceAudio = this.nodes.get(edge.sourceNodeId);
      const targetAudio = this.nodes.get(edge.targetNodeId);

      if (sourceAudio && targetAudio) {
        // If connecting to a specific AudioParam (like frequency), we'd handle it here
        // For simplicity, we just connect node to node (audio signal flow)
        sourceAudio.connect(targetAudio);
      }
    });
  }
}

export const AudioGraph = new AudioGraphManager();
