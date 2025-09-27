// ゲームエンジン - 基本的な横スクロールゲームの実装
export interface GameState {
  player: {
    x: number;
    y: number;
    vx: number;
    vy: number;
    onGround: boolean;
    width: number;
    height: number;
  };
  camera: {
    x: number;
    y: number;
  };
  level: {
    width: number;
    height: number;
    platforms: Array<{x: number, y: number, width: number, height: number}>;
    enemies: Array<{x: number, y: number, width: number, height: number, vx: number}>;
  };
  score: number;
  time: number;
  running: boolean;
}

export interface GameInput {
  right: boolean;
  left: boolean;
  jump: boolean;
  run: boolean;
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private state: GameState;
  private lastTime: number = 0;
  private inputHandler: (state: GameState) => GameInput;

  constructor(canvas: HTMLCanvasElement, inputHandler: (state: GameState) => GameInput) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.inputHandler = inputHandler;
    
    this.state = {
      player: {
        x: 50,
        y: 400,
        vx: 0,
        vy: 0,
        onGround: false,
        width: 24,
        height: 24
      },
      camera: {
        x: 0,
        y: 0
      },
      level: {
        width: 2000,
        height: 540,
        platforms: this.generatePlatforms(),
        enemies: this.generateEnemies()
      },
      score: 0,
      time: 0,
      running: false
    };
  }

  private generatePlatforms() {
    const platforms = [];
    // 地面
    platforms.push({x: 0, y: 430, width: 2000, height: 110});
    
    // 追加のプラットフォーム
    for (let i = 0; i < 20; i++) {
      const x = 200 + i * 100;
      const y = 350 + Math.sin(i * 0.5) * 50;
      platforms.push({x, y, width: 80, height: 20});
    }
    
    return platforms;
  }

  private generateEnemies() {
    const enemies = [];
    for (let i = 0; i < 10; i++) {
      enemies.push({
        x: 300 + i * 200,
        y: 400,
        width: 20,
        height: 20,
        vx: -1
      });
    }
    return enemies;
  }

  public start() {
    this.state.running = true;
    this.gameLoop();
  }

  public stop() {
    this.state.running = false;
  }

  public getState(): GameState {
    return { ...this.state };
  }

  public updateInput(input: GameInput) {
    const player = this.state.player;
    
    // 水平移動
    if (input.right) {
      player.vx = input.run ? 4 : 2;
    } else if (input.left) {
      player.vx = input.run ? -4 : -2;
    } else {
      player.vx *= 0.8; // 摩擦
    }

    // ジャンプ
    if (input.jump && player.onGround) {
      player.vy = -12;
      player.onGround = false;
    }

    // 重力
    if (!player.onGround) {
      player.vy += 0.8;
    }

    // 位置更新
    player.x += player.vx;
    player.y += player.vy;

    // 地面との衝突判定
    player.onGround = false;
    for (const platform of this.state.level.platforms) {
      if (this.checkCollision(player, platform)) {
        if (player.vy > 0 && player.y < platform.y) {
          player.y = platform.y - player.height;
          player.vy = 0;
          player.onGround = true;
        }
      }
    }

    // 敵との衝突判定
    for (const enemy of this.state.level.enemies) {
      if (this.checkCollision(player, enemy)) {
        this.state.running = false;
        break;
      }
    }

    // カメラ更新
    this.state.camera.x = Math.max(0, player.x - this.canvas.width / 2);
    
    // スコア更新
    this.state.score = Math.max(this.state.score, Math.floor(player.x / 10));
    
    // 時間更新
    this.state.time += 16; // 約60FPS想定
  }

  private checkCollision(rect1: any, rect2: any): boolean {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
  }

  private gameLoop = (currentTime: number = 0) => {
    if (!this.state.running) return;

    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    // 入力処理
    const input = this.inputHandler(this.state);
    this.updateInput(input);

    // 描画
    this.render();

    requestAnimationFrame(this.gameLoop);
  };

  private render() {
    const { ctx, canvas, state } = this;
    
    // 背景クリア
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // カメラ変換
    ctx.save();
    ctx.translate(-state.camera.x, -state.camera.y);

    // プラットフォーム描画
    ctx.fillStyle = '#0f0';
    for (const platform of state.level.platforms) {
      ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    }

    // 敵描画
    ctx.fillStyle = '#f00';
    for (const enemy of state.level.enemies) {
      ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    }

    // プレイヤー描画
    ctx.fillStyle = '#fff';
    ctx.fillRect(state.player.x, state.player.y, state.player.width, state.player.height);

    ctx.restore();

    // UI描画
    ctx.fillStyle = '#fff';
    ctx.font = '16px Arial';
    ctx.fillText(`Score: ${state.score}`, 10, 30);
    ctx.fillText(`Time: ${Math.floor(state.time / 1000)}s`, 10, 50);
    ctx.fillText(`X: ${Math.floor(state.player.x)}`, 10, 70);
  }
}
