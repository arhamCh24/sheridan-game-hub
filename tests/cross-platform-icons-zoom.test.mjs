import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (filename) => readFileSync(path.join(root, filename), 'utf8');

test('game card decorations and shared on-screen UI use SVGs instead of OS-specific emoji', () => {
  const portal = read('js/portal.js');
  const icons = read('js/icons.js');
  assert.match(portal, /card-spark-two[^\n]*icon\("sparkle", 19\)/);
  assert.match(portal, /card-status-dot/);
  assert.match(icons, /export function icon\(/);
  for (const filename of [
    'index.html', 'leaderboard.html', 'js/portal.js', 'js/ui.js',
    'games/hardware-challenge/hardware.js', 'games/tech-sprint/index.html',
    'games/program-explorer/index.html', 'games/find-the-undercover/app.js',
    'games/campus-quest/game/game.html', 'games/campus-quest/game/js/views/GameView.js',
  ]) {
    assert.doesNotMatch(read(filename), /[\u{1F300}-\u{1FAFF}\u2733\u26A1]/u, `${filename} uses OS-dependent artwork`);
  }
});

test('mobile Quest zoom keeps the clue dock and correct-view popup above the scrollable scene', () => {
  const markup = read('games/campus-quest/game/game.html');
  const script = read('games/campus-quest/game/js/views/GameView.js');
  const css = read('games/campus-quest/css/hub-integration.css');
  for (const id of ['roomZoomViewport', 'roomZoomClue', 'roomZoomProgress', 'roomZoomPrompt', 'roomZoomHint', 'roomZoomFeedback', 'roomZoomAudioButton']) {
    assert.ok(markup.includes(`id="${id}"`), `${id} missing from document`);
  }
  assert.match(script, /syncZoomClue\(\)/);
  assert.match(script, /updateZoomDimensions\(\)/);
  assert.match(script, /this\.roomZoomHint\.textContent = this\.clueHint\.textContent/);
  assert.match(script, /this\.roomZoomViewport\.scrollLeft = 0/);
  assert.match(css, /\.room-stage\.is-zoomed \.room-zoom-clue/);
  assert.match(css, /\.quest-scene-zoom-open \.popup \{ z-index: 1500; \}/);
});
