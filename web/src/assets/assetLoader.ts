// アセットローダー - 画像やサウンドの読み込み管理
import { SkinManager, SpriteData } from './skin';

export class AssetLoader {
  private skinManager: SkinManager;
  private loadedAssets: Map<string, any> = new Map();
  private loadingPromises: Map<string, Promise<any>> = new Map();

  constructor() {
    this.skinManager = new SkinManager();
  }

  public async loadAllAssets(): Promise<void> {
    const loadPromises = [
      this.loadSkinAssets(),
      this.loadAudioAssets(),
      this.loadFontAssets()
    ];

    await Promise.all(loadPromises);
    console.log('All assets loaded successfully');
  }

  private async loadSkinAssets(): Promise<void> {
    // スキンマネージャーが既にアセットを読み込んでいるので、待機のみ
    while (!this.skinManager.isLoaded()) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  private async loadAudioAssets(): Promise<void> {
    // 音声ファイルの読み込み（将来の拡張用）
    const audioFiles = [
      'jump.wav',
      'coin.wav',
      'enemy.wav'
    ];

    for (const audioFile of audioFiles) {
      try {
        const audio = new Audio(`/src/assets/audio/${audioFile}`);
        this.loadedAssets.set(`audio_${audioFile}`, audio);
      } catch (error) {
        console.warn(`Failed to load audio: ${audioFile}`, error);
      }
    }
  }

  private async loadFontAssets(): Promise<void> {
    // フォントの読み込み（将来の拡張用）
    try {
      const font = new FontFace('GameFont', 'url(/src/assets/fonts/gamefont.woff2)');
      await font.load();
      document.fonts.add(font);
      this.loadedAssets.set('font_game', font);
    } catch (error) {
      console.warn('Failed to load custom font, using system font');
    }
  }

  public getSprite(spriteName: string): SpriteData | null {
    return this.skinManager.getSprite(spriteName);
  }

  public getAudio(audioName: string): HTMLAudioElement | null {
    return this.loadedAssets.get(`audio_${audioName}`) || null;
  }

  public getSkinManager(): SkinManager {
    return this.skinManager;
  }

  public async preloadImage(src: string): Promise<HTMLImageElement> {
    if (this.loadedAssets.has(src)) {
      return this.loadedAssets.get(src);
    }

    if (this.loadingPromises.has(src)) {
      return this.loadingPromises.get(src);
    }

    const promise = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.loadedAssets.set(src, img);
        this.loadingPromises.delete(src);
        resolve(img);
      };
      img.onerror = () => {
        this.loadingPromises.delete(src);
        reject(new Error(`Failed to load image: ${src}`));
      };
      img.src = src;
    });

    this.loadingPromises.set(src, promise);
    return promise;
  }

  public getLoadedAssets(): string[] {
    return Array.from(this.loadedAssets.keys());
  }

  public clearCache(): void {
    this.loadedAssets.clear();
    this.loadingPromises.clear();
  }
}
