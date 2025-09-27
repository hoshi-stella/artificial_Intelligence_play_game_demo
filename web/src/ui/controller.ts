// UI コントローラー - ゲームの制御とエージェント管理
import { GameEngine, GameState } from '../engine';
import { GARunner } from '../agents/gaRunner';
import { LLMRunner } from '../agents/llmRunner';

export type AgentType = 'human' | 'ga' | 'llm';

export class GameController {
  private canvas: HTMLCanvasElement;
  private engine: GameEngine;
  private currentAgent: AgentType = 'human';
  private gaRunner: GARunner;
  private llmRunner: LLMRunner;
  private isRunning: boolean = false;
  private runId: number | null = null;
  private startTime: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.gaRunner = new GARunner();
    this.llmRunner = new LLMRunner();
    
    this.engine = new GameEngine(canvas, (state) => this.getInput(state));
    this.setupUI();
  }

  private setupUI(): void {
    const container = document.getElementById('app')!;
    
    // コントロールパネル
    const controls = document.createElement('div');
    controls.className = 'controls';
    controls.innerHTML = `
      <button id="startBtn">Start Game</button>
      <button id="stopBtn" disabled>Stop Game</button>
      <select id="agentSelect">
        <option value="human">Human Player</option>
        <option value="ga">GA Agent</option>
        <option value="llm">LLM Agent</option>
      </select>
      <button id="resetBtn">Reset</button>
    `;
    container.appendChild(controls);

    // ステータス表示
    const status = document.createElement('div');
    status.id = 'status';
    status.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0,0,0,0.8);
      color: white;
      padding: 10px;
      border-radius: 4px;
      font-family: monospace;
      font-size: 12px;
    `;
    container.appendChild(status);

    // イベントリスナー
    document.getElementById('startBtn')!.addEventListener('click', () => this.startGame());
    document.getElementById('stopBtn')!.addEventListener('click', () => this.stopGame());
    document.getElementById('resetBtn')!.addEventListener('click', () => this.resetGame());
    document.getElementById('agentSelect')!.addEventListener('change', (e) => {
      this.currentAgent = (e.target as HTMLSelectElement).value as AgentType;
    });

    // キーボード入力
    document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    document.addEventListener('keyup', (e) => this.handleKeyUp(e));
  }

  private keys: { [key: string]: boolean } = {};

  private handleKeyDown(e: KeyboardEvent): void {
    this.keys[e.key.toLowerCase()] = true;
  }

  private handleKeyUp(e: KeyboardEvent): void {
    this.keys[e.key.toLowerCase()] = false;
  }

  private getInput(state: GameState): { right: boolean; left: boolean; jump: boolean; run: boolean } {
    if (this.currentAgent === 'human') {
      return {
        right: this.keys['arrowright'] || this.keys['d'],
        left: this.keys['arrowleft'] || this.keys['a'],
        jump: this.keys[' '] || this.keys['arrowup'] || this.keys['w'],
        run: this.keys['shift']
      };
    } else if (this.currentAgent === 'ga') {
      return this.gaRunner.getAction(state);
    } else if (this.currentAgent === 'llm') {
      // LLMは非同期なので、前回の決定を返す
      return { right: true, left: false, jump: false, run: false };
    }
    
    return { right: false, left: false, jump: false, run: false };
  }

  private async startGame(): Promise<void> {
    if (this.isRunning) return;

    this.isRunning = true;
    this.startTime = Date.now();
    
    // UI更新
    (document.getElementById('startBtn') as HTMLButtonElement).disabled = true;
    (document.getElementById('stopBtn') as HTMLButtonElement).disabled = false;
    (document.getElementById('agentSelect') as HTMLSelectElement).disabled = true;

    // ゲーム実行開始をAPIに記録
    if (this.currentAgent !== 'human') {
      try {
        const response = await fetch('http://localhost:8080/api/run_start', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': 'local-dev-only'
          },
          body: JSON.stringify({
            agent_id: this.currentAgent === 'ga' ? 1 : 2,
            level_id: 1
          })
        });
        
        const data = await response.json();
        this.runId = data.run_id;
      } catch (error) {
        console.error('Failed to start run:', error);
      }
    }

    this.engine.start();
    this.updateStatus();
  }

  private stopGame(): void {
    if (!this.isRunning) return;

    this.isRunning = false;
    this.engine.stop();
    
    // UI更新
    (document.getElementById('startBtn') as HTMLButtonElement).disabled = false;
    (document.getElementById('stopBtn') as HTMLButtonElement).disabled = true;
    (document.getElementById('agentSelect') as HTMLSelectElement).disabled = false;

    // ゲーム終了をAPIに記録
    if (this.runId !== null) {
      this.recordGameEnd();
    }

    this.updateStatus();
  }

  private resetGame(): void {
    this.stopGame();
    
    // エージェントリセット
    if (this.currentAgent === 'ga') {
      this.gaRunner.initializePopulation();
    } else if (this.currentAgent === 'llm') {
      this.llmRunner.clearHistory();
    }

    // ゲーム状態リセット
    this.runId = null;
    this.startTime = 0;
    
    this.updateStatus();
  }

  private async recordGameEnd(): Promise<void> {
    if (this.runId === null) return;

    const duration = Date.now() - this.startTime;
    const state = this.engine.getState();
    
    try {
      await fetch('http://localhost:8080/api/run_end', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'local-dev-only'
        },
        body: JSON.stringify({
          run_id: this.runId,
          duration_ms: duration,
          result: state.running ? 'completed' : 'failed',
          score: state.score,
          notes: `Agent: ${this.currentAgent}`
        })
      });
    } catch (error) {
      console.error('Failed to record game end:', error);
    }
  }

  private updateStatus(): void {
    const status = document.getElementById('status')!;
    const state = this.engine.getState();
    
    let statusText = `
Agent: ${this.currentAgent}
Score: ${state.score}
Time: ${Math.floor(state.time / 1000)}s
Position: (${Math.floor(state.player.x)}, ${Math.floor(state.player.y)})
    `;

    if (this.currentAgent === 'ga') {
      const stats = this.gaRunner.getStats();
      statusText += `
GA Generation: ${stats.generation}
Best Fitness: ${stats.bestFitness.toFixed(2)}
Avg Fitness: ${stats.avgFitness.toFixed(2)}
      `;
    } else if (this.currentAgent === 'llm') {
      const stats = this.llmRunner.getStats();
      statusText += `
LLM Decisions: ${stats.totalDecisions}
      `;
    }

    status.textContent = statusText;
  }

  public getEngine(): GameEngine {
    return this.engine;
  }

  public getCurrentAgent(): AgentType {
    return this.currentAgent;
  }
}
