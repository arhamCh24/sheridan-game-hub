import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const read = (name) => readFileSync(new URL(`../${name}`, import.meta.url), 'utf8');
const script = read('js/tech-sprint.js');

// The quiz uses a bundled static question bank. Validate it without a database
// or browser, so accidental content edits cannot make the game unfinishable.
test('Tech Sprint has five valid multiple-choice questions worth 100 points', () => {
  const found = script.match(/const QUESTIONS = (\[[\s\S]*?\]);\s*let store/);
  assert.ok(found, 'Question bank should remain statically inspectable');
  const questions = runInNewContext(found[1]);
  assert.equal(questions.length, 5);
  for (const [i, question] of questions.entries()) {
    assert.ok(question.question.length > 15, `Question ${i + 1} needs a prompt`);
    assert.equal(question.options.length, 4, `Question ${i + 1} needs 4 choices`);
    assert.equal(new Set(question.options).size, 4, `Question ${i + 1} has repeated choices`);
    assert.ok(Number.isInteger(question.answer) && question.answer >= 0 && question.answer <= 3);
    assert.ok(question.note.length > 10, `Question ${i + 1} needs explanatory feedback`);
  }
});

test('Tech Sprint keeps score session active during saves and restores the next question in view', () => {
  const save = script.slice(script.indexOf('async function complete()'), script.indexOf('function showResult('));
  assert.ok(save.indexOf('await store.submitScore') < save.indexOf('setGameplayActive(false)'), 'Switching cannot unprotect an in-flight save');
  assert.match(script, /revealStage\("\.question-panel"\)/);
  assert.match(script, /aria-valuenow/);
  const css = read('css/game.css');
  assert.match(css, /game-title-break/);
  assert.match(css, /game-side-pattern/);
  assert.doesNotMatch(read('games/tech-sprint/index.html'), /aria-hidden="true">✳/);
});
