// LLM（大規模言語モデル）エージェント
export interface LLMParams {
  model: string;
  temperature: number;
  maxTokens: number;
  apiUrl: string;
  apiKey: string;
}

export class LLMRunner {
  private params: LLMParams;
  private decisionHistory: Array<{obs: any, action: any, reason: string}> = [];

  constructor(params: Partial<LLMParams> = {}) {
    this.params = {
      model: params.model || 'llama3.1:8b-instruct-q4_0',
      temperature: params.temperature || 0.2,
      maxTokens: params.maxTokens || 48,
      apiUrl: params.apiUrl || 'http://localhost:8080/api/decide',
      apiKey: params.apiKey || 'local-dev-only'
    };
  }

  public async getAction(gameState: any): Promise<{ right: boolean; left: boolean; jump: boolean; run: boolean; reason: string }> {
    const obs = this.extractObservation(gameState);
    
    try {
      const response = await this.callLLM(obs);
      this.decisionHistory.push({
        obs,
        action: response,
        reason: response.reason || 'LLM decision'
      });

      // 履歴を保持（最新100件）
      if (this.decisionHistory.length > 100) {
        this.decisionHistory = this.decisionHistory.slice(-100);
      }

      return {
        right: response.right || false,
        left: response.left || false,
        jump: response.jump || false,
        run: response.run || false,
        reason: response.reason || 'LLM decision'
      };
    } catch (error) {
      console.error('LLM API Error:', error);
      // フォールバック行動
      return this.getFallbackAction(obs);
    }
  }

  private extractObservation(gameState: any): any {
    const player = gameState.player;
    const platforms = gameState.level.platforms;
    const enemies = gameState.level.enemies;

    // 前方の状況を分析
    const forwardPlatforms = platforms.filter((p: any) => 
      p.x > player.x && p.x < player.x + 200
    ).sort((a: any, b: any) => a.x - b.x);

    const forwardEnemies = enemies.filter((e: any) => 
      e.x > player.x - 50 && e.x < player.x + 150
    );

    // ギャップ検出
    let gap = 0;
    let nextPlatform = null;
    
    if (forwardPlatforms.length > 0) {
      nextPlatform = forwardPlatforms[0];
      gap = nextPlatform.x - (player.x + player.width);
    }

    // 地面の高さ
    const groundY = platforms.find((p: any) => 
      p.x <= player.x && p.x + p.width >= player.x
    )?.y || 430;

    return {
      x: Math.floor(player.x),
      y: Math.floor(player.y),
      vx: player.vx,
      vy: player.vy,
      onGround: player.onGround,
      gap: Math.floor(gap),
      nextPlatform: nextPlatform ? {
        x: Math.floor(nextPlatform.x),
        y: Math.floor(nextPlatform.y),
        width: nextPlatform.width
      } : null,
      enemies: forwardEnemies.map((e: any) => ({
        x: Math.floor(e.x),
        y: Math.floor(e.y),
        vx: e.vx
      })),
      groundY: Math.floor(groundY),
      score: gameState.score,
      time: Math.floor(gameState.time / 1000)
    };
  }

  private async callLLM(obs: any): Promise<any> {
    const response = await fetch(this.params.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.params.apiKey
      },
      body: JSON.stringify({ obs })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }

  private getFallbackAction(obs: any): { right: boolean; left: boolean; jump: boolean; run: boolean; reason: string } {
    // シンプルなルールベースのフォールバック
    const right = true; // 基本的に右に進む
    const left = false;
    const jump = obs.gap > 0 && obs.gap < 2 && obs.onGround; // ギャップがあればジャンプ
    const run = obs.gap > 0; // ギャップがあれば走る

    return {
      right,
      left,
      jump,
      run,
      reason: 'fallback-rule-based'
    };
  }

  public getDecisionHistory(): Array<{obs: any, action: any, reason: string}> {
    return [...this.decisionHistory];
  }

  public clearHistory(): void {
    this.decisionHistory = [];
  }

  public getStats(): { totalDecisions: number; avgResponseTime: number } {
    return {
      totalDecisions: this.decisionHistory.length,
      avgResponseTime: 0 // TODO: 実装
    };
  }
}
