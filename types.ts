export type TreeState = 'CHAOS' | 'FORMED';

export interface TreeColors {
  bottom: string;
  top: string;
}

export interface HandGesture {
  isOpen: boolean;
  position: { x: number; y: number }; // Normalized -1 to 1
  isDetected: boolean;
  // Pinch and pull gesture for photo viewing
  indexFinger?: { x: number; y: number }; // Index finger position normalized -1 to 1
  isPinching?: boolean; // Thumb and index finger are close together
  isPulling?: boolean; // Pulling up motion detected
  pullVelocity?: number; // Vertical pull velocity
}
