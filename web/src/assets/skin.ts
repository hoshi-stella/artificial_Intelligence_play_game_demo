// スキン管理システム
export interface SkinManifest {
  name: string;
  version: string;
  description: string;
  author: string;
  sprites: {
    player_idle: string;
    player_run: string;
    enemy_slime: string;
    tileset: string;
    ui_controller: string;
  };
}

export interface SpriteData {
  image: HTMLImageElement;
  width: number;
  height: number;
  frames?: number;
  frameWidth?: number;
  frameHeight?: number;
}

export class SkinManager {
  private currentSkin: string = 'charaset2'; // デフォルトは教材用
  private manifests: Map<string, SkinManifest> = new Map();
  private sprites: Map<string, SpriteData> = new Map();
  private loaded: boolean = false;

  constructor() {
    this.loadDefaultSkin();
  }

  private async loadDefaultSkin(): Promise<void> {
    // URLパラメータからスキンを取得
    const urlParams = new URLSearchParams(window.location.search);
    const skinParam = urlParams.get('skin');
    if (skinParam) {
      this.currentSkin = skinParam;
    }

    // 環境変数からスキンを取得
    const envSkin = import.meta.env.VITE_DEFAULT_SKIN;
    if (envSkin) {
      this.currentSkin = envSkin;
    }

    await this.loadSkin(this.currentSkin);
  }

  public async loadSkin(skinName: string): Promise<void> {
    try {
      // マニフェスト読み込み
      const manifestResponse = await fetch(`/src/assets/${skinName}/manifest.json`);
      const manifest: SkinManifest = await manifestResponse.json();
      this.manifests.set(skinName, manifest);

      // スプライト読み込み
      const spritePromises = Object.entries(manifest.sprites).map(async ([key, filename]) => {
        const image = new Image();
        image.src = `/src/assets/${skinName}/${filename}`;
        
        await new Promise((resolve, reject) => {
          image.onload = resolve;
          image.onerror = reject;
        });

        // スプライトデータ作成
        const spriteData: SpriteData = {
          image,
          width: image.width,
          height: image.height
        };

        // アニメーション用のフレーム情報を設定
        if (key.includes('player_run')) {
          spriteData.frames = 4;
          spriteData.frameWidth = image.width / 4;
          spriteData.frameHeight = image.height;
        }

        this.sprites.set(`${skinName}_${key}`, spriteData);
      });

      await Promise.all(spritePromises);
      this.currentSkin = skinName;
      this.loaded = true;

      console.log(`Skin loaded: ${skinName}`);
    } catch (error) {
      console.error(`Failed to load skin ${skinName}:`, error);
      // フォールバックとしてデフォルトスキンを読み込み
      if (skinName !== 'charaset2') {
        await this.loadSkin('charaset2');
      }
    }
  }

  public getSprite(spriteName: string): SpriteData | null {
    const key = `${this.currentSkin}_${spriteName}`;
    return this.sprites.get(key) || null;
  }

  public getCurrentSkin(): string {
    return this.currentSkin;
  }

  public getAvailableSkins(): string[] {
    return Array.from(this.manifests.keys());
  }

  public getSkinManifest(skinName: string): SkinManifest | null {
    return this.manifests.get(skinName) || null;
  }

  public isLoaded(): boolean {
    return this.loaded;
  }

  public async switchSkin(skinName: string): Promise<void> {
    if (skinName === this.currentSkin) return;
    
    await this.loadSkin(skinName);
    
    // URLを更新（履歴に追加しない）
    const url = new URL(window.location.href);
    url.searchParams.set('skin', skinName);
    window.history.replaceState({}, '', url.toString());
  }
}
