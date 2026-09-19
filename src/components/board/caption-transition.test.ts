import assert from "node:assert/strict";
import { test } from "vitest";
import { advanceCaption, type CaptionFrame } from "./caption-transition";

const notes = ["Lama", "Baru"];

test("caption erases the old sentence before typing the next one", () => {
  let frame: CaptionFrame = { index: 0, visible: 4, phase: "hold" };
  frame = advanceCaption(frame, notes, false);
  assert.deepEqual(frame, { index: 0, visible: 4, phase: "erase" });
  for (let i = 0; i < 4; i += 1) frame = advanceCaption(frame, notes, false);
  assert.deepEqual(frame, { index: 1, visible: 0, phase: "type" });
  for (let i = 0; i < 4; i += 1) frame = advanceCaption(frame, notes, false);
  assert.deepEqual(frame, { index: 1, visible: 4, phase: "hold" });
});

test("reduced motion switches directly to a complete sentence", () => {
  assert.deepEqual(
    advanceCaption({ index: 0, visible: 4, phase: "hold" }, notes, true),
    { index: 1, visible: 4, phase: "hold" },
  );
  assert.deepEqual(
    advanceCaption({ index: 0, visible: 2, phase: "erase" }, notes, true),
    { index: 1, visible: 4, phase: "hold" },
  );
  assert.deepEqual(
    advanceCaption({ index: 1, visible: 2, phase: "type" }, notes, true),
    { index: 1, visible: 4, phase: "hold" },
  );
});
