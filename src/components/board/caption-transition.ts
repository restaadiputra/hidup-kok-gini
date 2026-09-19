export type CaptionFrame = {
  index: number;
  visible: number;
  phase: "hold" | "erase" | "type";
};

export function advanceCaption(
  frame: CaptionFrame,
  notes: readonly string[],
  reducedMotion: boolean,
): CaptionFrame {
  const nextIndex = (frame.index + 1) % notes.length;

  if (reducedMotion) {
    const index = frame.phase === "type" ? frame.index : nextIndex;
    return { index, visible: Array.from(notes[index]).length, phase: "hold" };
  }

  if (frame.phase === "hold") return { ...frame, phase: "erase" };
  if (frame.phase === "erase") {
    return frame.visible > 1
      ? { ...frame, visible: frame.visible - 1 }
      : { index: nextIndex, visible: 0, phase: "type" };
  }

  const visible = Math.min(frame.visible + 1, Array.from(notes[frame.index]).length);
  return { ...frame, visible, phase: visible === Array.from(notes[frame.index]).length ? "hold" : "type" };
}
