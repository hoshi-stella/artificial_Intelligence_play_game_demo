// AI Play Game Demo - メインエントリーポイント
import { GameController } from './ui/controller';
import { GameOverlay } from './ui/overlay';

// アプリケーション初期化
function initApp(): void {
  const app = document.getElementById('app')!;
  
  // ゲームキャンバス作成
  const canvas = document.createElement('canvas');
  canvas.width = 960;
  canvas.height = 540;
  canvas.style.cssText = 'display: block; margin: 20px auto; border: 2px solid #333;';
  app.appendChild(canvas);

  // ゲームコントローラー初期化
  const controller = new GameController(canvas);
  
  // UIオーバーレイ初期化
  const overlay = new GameOverlay();
  
  // オーバーレイの表示/非表示切り替え
  document.addEventListener('keydown', (e) => {
    if (e.key === 'F1') {
      e.preventDefault();
      overlay.toggle();
    }
  });

  // ゲームループでオーバーレイ更新
  function updateOverlay(): void {
    const engine = controller.getEngine();
    const state = engine.getState();
    const agent = controller.getCurrentAgent();
    
    overlay.updateInfo({
      agent: agent.toUpperCase(),
      score: state.score,
      time: state.time,
      position: state.player,
      velocity: { x: state.player.vx, y: state.player.vy },
      onGround: state.player.onGround
    });

    // エージェント別のデバッグ情報
    if (agent === 'ga') {
      const gaRunner = (controller as any).gaRunner;
      overlay.updateDebug({
        gaStats: gaRunner.getStats()
      });
    } else if (agent === 'llm') {
      const llmRunner = (controller as any).llmRunner;
      overlay.updateDebug({
        llmStats: llmRunner.getStats()
      });
    }

    overlay.updateControlHint(agent);
    
    requestAnimationFrame(updateOverlay);
  }

  // オーバーレイ更新開始
  updateOverlay();

  // グローバルに公開（デバッグ用）
  (window as any).gameController = controller;
  (window as any).gameOverlay = overlay;
}

// DOM読み込み完了後に初期化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
