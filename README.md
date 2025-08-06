# りょべりおん
Discord用多機能BOTを作ろう

## プロジェクト構造
```
├── events/
│   ├── interactionCreate.js
│   └── ready.js
├── commands/
│   └── slashcommands/
│     ├── ojisan.js
│     ├── mc2tja.js
│     └── (others...)
│   └── contextmenu/
├── lib/
│   └── mc2tja/
│     ├── mc2tja.js
│     ├── mcreader.js
│     └── (others...)
│   └── translate/
│     ├── translator.js
│     └── specialTranslator.js
├── utils/
│   ├── checkPermissions.js
│   └── createEmbed.js
├── public/
│   └── index.html
├── deploy-commands.js
└── index.js
```
## 開発環境のセットアップ
・Node.js (v18.0.0以上)
・npm

## インストール手順
1. リポジトリをクローン
    ```bash
    git clone https://github.com/veda00133912/ryoberion
    cd ryoberion
    ```
2. 依存関係のインストール
    ```bash
    npm install
    ```
3. 環境変数の設定
    - `.env` ファイルを作成し、以下の内容を追加
    ```env
    TOKEN=あなたのDiscordトークン
    CLIENT_ID=あなたのクライアントID
    ```
4. BOTの起動
    ```bash
    npm start
    ```     