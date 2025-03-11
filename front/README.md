
## バックエンドの起動の仕方

### git clone した後にやること

```
cd back
source /workspaces/hackson_support_agent/back/venv/bin/activate
pip install -r requirements.txt
```

### バックエンドの起動したい時のコマンド
```
cd back
source /workspaces/hackson_support_agent/back/venv/bin/activate
```

アプリケーションの起動
```
python app.py
```




## フロントエンドの起動の仕方

git pull, git cloneした後にやること
```
cd front
npm install
```

localhost:3000でアプリケーションを起動
```
npm run dev 
```

## ブランチ周りの規則
main: 本番環境、完成品しか載せない
develop: 開発環境、プルリク送る先はこっち
dev/(名前): 作業ブランチ　backendとfrontendのどちらにも機能を作る場合
feature/(名前) back branchとfrontエンド branchのどちらかに機能を作る場合