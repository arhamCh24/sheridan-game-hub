import GameModel from "./models/GameModel.js";
import GameView from "./views/GameView.js";
import GameController from "./controllers/GameController.js";
import { loadLevel } from "./LevelLoader.js";
import levels from "../../levels/manifest.js";
import { initQuestShell, createQuestProgressStore } from "../../js/hub-integration.js";

const params = new URLSearchParams(window.location.search);
const levelNumber = params.get("level") || "1";

const { store, user, setGameplayActive } = await initQuestShell({ gameplay: true });
const implementedLevels = levels.filter((level) => level.implemented).sort((a, b) => a.id - b.id);
const progressStore = createQuestProgressStore(store, implementedLevels.map((level) => level.id));

async function startGame() {
  const view = new GameView();
  try {
    const levelData = await loadLevel(levelNumber);
    const manifestLevel = implementedLevels.find((level) => level.id === Number(levelData.id));
    if (!manifestLevel) {
      window.location.replace("../home.html#levels");
      return;
    }
    const state = progressStore.getSnapshot();
    if (!state.levels[levelData.id]?.unlocked) {
      window.location.replace("../home.html#levels");
      return;
    }
    await progressStore.startLevel(levelData.id);
    const model = new GameModel(levelData);
    new GameController(model, view, {
      user,
      progressStore,
      onFinished: () => setGameplayActive(false),
    });
  } catch (error) {
    console.error("Unable to load level:", error);
    setGameplayActive(false);
    view.showLoadError();
  }
}
await startGame();
