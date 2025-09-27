// UI オーバーレイ - ゲーム情報の表示とデバッグ情報
export class GameOverlay {
  private overlay: HTMLDivElement;
  private isVisible: boolean = true;

  constructor() {
    this.createOverlay();
  }

  private createOverlay(): void {
    this.overlay = document.createElement('div');
    this.overlay.id = 'game-overlay';
    this.overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1000;
      font-family: 'Courier New', monospace;
      color: white;
    `;

    // 左上の情報パネル
    const infoPanel = document.createElement('div');
    infoPanel.id = 'info-panel';
    infoPanel.style.cssText = `
      position: absolute;
      top: 20px;
      left: 20px;
      background: rgba(0, 0, 0, 0.8);
      padding: 15px;
      border-radius: 8px;
      border: 1px solid #333;
      min-width: 200px;
    `;

    // 右上のデバッグパネル
    const debugPanel = document.createElement('div');
    debugPanel.id = 'debug-panel';
    debugPanel.style.cssText = `
      position: absolute;
      top: 20px;
      right: 20px;
      background: rgba(0, 0, 0, 0.8);
      padding: 15px;
      border-radius: 8px;
      border: 1px solid #333;
      min-width: 250px;
      font-size: 12px;
    `;

    // 下部のコントロールヒント
    const controlHint = document.createElement('div');
    controlHint.id = 'control-hint';
    controlHint.style.cssText = `
      position: absolute;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.8);
      padding: 10px 20px;
      border-radius: 8px;
      border: 1px solid #333;
      text-align: center;
    `;

    this.overlay.appendChild(infoPanel);
    this.overlay.appendChild(debugPanel);
    this.overlay.appendChild(controlHint);

    document.body.appendChild(this.overlay);
  }

  public updateInfo(data: {
    agent: string;
    score: number;
    time: number;
    position: { x: number; y: number };
    velocity: { x: number; y: number };
    onGround: boolean;
  }): void {
    const infoPanel = document.getElementById('info-panel')!;
    infoPanel.innerHTML = `
      <h3 style="margin: 0 0 10px 0; color: #4CAF50;">Game Info</h3>
      <div><strong>Agent:</strong> ${data.agent}</div>
      <div><strong>Score:</strong> ${data.score}</div>
      <div><strong>Time:</strong> ${Math.floor(data.time / 1000)}s</div>
      <div><strong>Position:</strong> (${Math.floor(data.position.x)}, ${Math.floor(data.position.y)})</div>
      <div><strong>Velocity:</strong> (${data.velocity.x.toFixed(1)}, ${data.velocity.y.toFixed(1)})</div>
      <div><strong>On Ground:</strong> ${data.onGround ? 'Yes' : 'No'}</div>
    `;
  }

  public updateDebug(data: {
    gaStats?: { generation: number; bestFitness: number; avgFitness: number };
    llmStats?: { totalDecisions: number; avgResponseTime: number };
    lastDecision?: { action: any; reason: string };
  }): void {
    const debugPanel = document.getElementById('debug-panel')!;
    let debugContent = '<h3 style="margin: 0 0 10px 0; color: #FF9800;">Debug Info</h3>';

    if (data.gaStats) {
      debugContent += `
        <div><strong>GA Generation:</strong> ${data.gaStats.generation}</div>
        <div><strong>Best Fitness:</strong> ${data.gaStats.bestFitness.toFixed(2)}</div>
        <div><strong>Avg Fitness:</strong> ${data.gaStats.avgFitness.toFixed(2)}</div>
      `;
    }

    if (data.llmStats) {
      debugContent += `
        <div><strong>LLM Decisions:</strong> ${data.llmStats.totalDecisions}</div>
        <div><strong>Avg Response:</strong> ${data.llmStats.avgResponseTime.toFixed(0)}ms</div>
      `;
    }

    if (data.lastDecision) {
      debugContent += `
        <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #333;">
          <div><strong>Last Action:</strong></div>
          <div>Right: ${data.lastDecision.action.right ? '✓' : '✗'}</div>
          <div>Left: ${data.lastDecision.action.left ? '✓' : '✗'}</div>
          <div>Jump: ${data.lastDecision.action.jump ? '✓' : '✗'}</div>
          <div>Run: ${data.lastDecision.action.run ? '✓' : '✗'}</div>
          <div><strong>Reason:</strong> ${data.lastDecision.reason}</div>
        </div>
      `;
    }

    debugPanel.innerHTML = debugContent;
  }

  public updateControlHint(agent: string): void {
    const controlHint = document.getElementById('control-hint')!;
    
    if (agent === 'human') {
      controlHint.innerHTML = `
        <strong>Controls:</strong> 
        ← → (or A/D) to move | 
        ↑ (or W/Space) to jump | 
        Shift to run
      `;
    } else if (agent === 'ga') {
      controlHint.innerHTML = `
        <strong>GA Agent:</strong> 
        Genetic Algorithm is controlling the character
      `;
    } else if (agent === 'llm') {
      controlHint.innerHTML = `
        <strong>LLM Agent:</strong> 
        Large Language Model is controlling the character
      `;
    }
  }

  public show(): void {
    this.overlay.style.display = 'block';
    this.isVisible = true;
  }

  public hide(): void {
    this.overlay.style.display = 'none';
    this.isVisible = false;
  }

  public toggle(): void {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  public destroy(): void {
    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }
  }
}
