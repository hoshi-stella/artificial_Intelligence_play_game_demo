# AI Play Game Demo

このプロジェクトは「AIエージェント（GA/LLM）を操作キャラとして動かす横スクロールゲームのデモ環境」を構築します。  
目的は **LT用のデモ** および **OSS教材/ポートフォリオ** としての再利用です。

## 🎮 概要

AI Play Game Demoは、遺伝的アルゴリズム（GA）と大規模言語モデル（LLM）を操作キャラクターとして使用する横スクロールゲームです。プレイヤーは人間、GA、LLMの3つのモードから選択してゲームを楽しむことができます。

## 🚀 起動手順

### 1. 環境準備

```bash
# プロジェクトディレクトリに移動
cd artificial_intelligence_play_game_demo

# 環境変数ファイルを作成
cp .env.example .env
# または手動で.envファイルを作成し、以下の内容を記述：
# DB_ROOT_PASS=changeme
# DB_NAME=ai_runner
# DB_USER=ai_runner
# DB_PASS=ai_runner
# API_KEY=local-dev-only
# LLM_MODEL=llama3.1:8b-instruct-q4_0
```

### 2. Docker環境起動

```bash
# 全サービス起動
docker compose up -d

# （任意）ローカルLLMモデル取得
docker compose exec ollama ollama pull llama3.1:8b-instruct-q4_0
```

### 3. アクセス確認

- **Web開発（Vite）**: http://localhost:5173
- **Nginx配信**: http://localhost:8080
- **Adminer**: http://localhost:8081
- **phpMyAdmin**: http://localhost:8082 または http://localhost:8080/phpmyadmin/

## 🎯 ゲームモード

### Human Player
- キーボードで直接操作
- 矢印キー（←→）で移動、スペースキーでジャンプ、Shiftで走行

### GA Agent
- 遺伝的アルゴリズムによる自動プレイ
- 世代を重ねて学習・進化
- リアルタイムでフィットネス値と世代数を表示

### LLM Agent
- 大規模言語モデルによる自動プレイ
- ゲーム状況を自然言語で理解し、適切な行動を決定
- 決定理由も表示

## 🛠️ 技術スタック

### フロントエンド
- **TypeScript** - 型安全なJavaScript
- **Vite** - 高速な開発サーバー
- **Canvas API** - ゲーム描画

### バックエンド
- **PHP 8.3** - API サーバー
- **MySQL 8.4** - データベース
- **Nginx** - リバースプロキシ

### AI/ML
- **Ollama** - ローカルLLM実行環境
- **Llama 3.1** - 大規模言語モデル
- **遺伝的アルゴリズム** - カスタム実装

## 📁 プロジェクト構成

```
artificial_intelligence_play_game_demo/
├── docker-compose.yml          # Docker構成
├── nginx/                      # Nginx設定
├── php/                        # PHP API
│   ├── api/                    # REST API
│   └── Dockerfile
├── sql/                        # データベーススキーマ
├── web/                        # フロントエンド
│   ├── src/
│   │   ├── agents/             # AIエージェント
│   │   ├── ui/                 # UI コンポーネント
│   │   ├── assets/             # アセット管理
│   │   ├── engine.ts           # ゲームエンジン
│   │   └── main.ts             # エントリーポイント
│   └── package.json
└── README.md
```

## 🎨 スキンシステム

### charaset1
- URLパラメータ `?skin=charaset1` で切り替え

### charaset2
- 教材用のオリジナルスプライト
- デフォルト設定

## 🔧 開発・カスタマイズ

### 新しいエージェントの追加
1. `web/src/agents/` に新しいエージェントクラスを作成
2. `web/src/ui/controller.ts` でエージェントタイプを追加
3. 必要に応じてAPIエンドポイントを追加

### スキンの追加
1. `web/src/assets/` に新しいスキンディレクトリを作成
2. `manifest.json` でスプライト設定を定義
3. スプライト画像を配置

## 📊 データベース

### テーブル構成
- `agents` - AIエージェント情報
- `levels` - ゲームレベル設定
- `runs` - ゲーム実行記録
- `inputs` - 入力データ記録
- `decisions` - AI決定記録

## 🐛 トラブルシューティング

### よくある問題

1. **Docker起動エラー**
   ```bash
   # ボリュームをクリア
   docker compose down -v
   docker compose up -d
   ```

2. **LLM API接続エラー**
   ```bash
   # Ollamaサービス確認
   docker compose logs ollama
   ```

3. **データベース接続エラー**
   ```bash
   # データベースサービス確認
   docker compose logs db
   ```

## 📝 ライセンス

このプロジェクトは教育・研究目的で作成されています。

## 🤝 貢献

プルリクエストやイシューの報告を歓迎します。

## 📞 サポート

問題が発生した場合は、GitHubのIssuesで報告してください。
