const CHARACTER_BY_COST = {
    '3.0': [
        { id: 'akatsuki', name: 'アカツキ'},
        { id: 'akigumo', name: '秋雲'},
        { id: 'cammy', name: 'キャミィ'},
        { id: 'cavalry', name: 'キャヴァリー'},
        { id: 'cherubim', name: 'ケルビム'},
        { id: 'convallaria', name: 'スズラン'},
        { id: 'elfin', name: 'エルフィン'},
        { id: 'ether', name: 'イーザー'},
        { id: 'griffin', name: 'グリフィン'},
        { id: 'hikari', name: 'ヒカリ'},
        { id: 'longinus', name: 'ロンギヌス'},
        { id: 'nameless', name: '無銘'},
        { id: 'pliszka', name: 'プリシュカ'},
        { id: 'qiuyu', name: 'シュウウ'},
        { id: 'rasiel', name: 'ラジエル'},
        { id: 'rhine', name: 'ライン'},
        { id: 'rota', name: 'ロタ'},
        { id: 'shadow', name: '影'},
        { id: 'siren', name: 'セイレン'},
        { id: 'voidsaber', name: 'ヴォイドセーバー'},
    ],
    '2.5': [
        { id: 'aliz', name: 'アリス'},
        { id: 'angelis', name: 'アンジェリス'},
        { id: 'baselard', name: 'バーゼラルド'},
        { id: 'blackrockshooter', name: 'ブラック★ロックシューター'},
        { id: 'cygnus', name: 'シグナス'},
        { id: 'dead-alive', name: 'デッド・アライヴ'},
        { id: 'deadmaster', name: 'デッドマスター'},
        { id: 'dragoner', name: 'ドラグナー'},
        { id: 'ffreedo', name: 'フリード'},
        { id: 'galahad_25', name: 'ガラハッド・暁'},
        { id: 'gourai-kai', name: '轟雷・改'},
        { id: 'haruka', name: 'ハルカ'},
        { id: 'ine', name: '稲'},
        { id: 'iva', name: 'エヴァ'},
        { id: 'kaze', name: 'カゼ'},
        { id: 'lancelot', name: 'ランスロット'},
        { id: 'nora', name: 'ノーラ'},
        { id: 'reki', name: 'レキ'},
        { id: 'sharp', name: 'シャープ'},
        { id: 'skysaber', name: 'スカイセーバー'},
        { id: 'thunderbolt', name: 'サンダーボルト・OTOME'},
        { id: 'valkia', name: 'ヴァルキア'},
        { id: 'xiaoling', name: 'シャオリン'},
        { id: 'xviii', name: '十八号'},
    ],
    '2.0': [
        { id: 'aida', name: 'アイーダ'},
        { id: 'aisling', name: 'アイスリン'},
        { id: 'beta', name: 'ベータ'},
        { id: 'borzoi', name: 'ボルゾイ'},
        { id: 'breaker', name: 'ブリーカー'},
        { id: 'darkstar', name: 'ダークスター'},
        { id: 'deucalion', name: 'デュカリオン'},
        { id: 'emika', name: '咲迦'},
        { id: 'franca', name: 'フランカー'},
        { id: 'galahad', name: 'ガラハッド'},
        { id: 'hibiki', name: 'ヒビキ'},
        { id: 'kitty', name: 'キャッティ'},
        { id: 'krista', name: 'クリスタ'},
        { id: 'lm', name: 'レム'},
        { id: 'pallas', name: 'パラス'},
        { id: 'phoebe', name: 'フィービー'},
        { id: 'qingni', name: 'チンニ'},
        { id: 'scorpion', name: 'スコーピオン'},
        { id: 'seraphim', name: 'セラフィム'},
        { id: 'stylet', name: 'スティレット'},
        { id: 'tatiana', name: 'タチアナ'},
        { id: 'virtue', name: 'ヴァーチェ'},
        { id: 'zakharova', name: 'ザハロワ'},
    ],
    '1.5': [
        { id: 'katerina', name: 'カタリナ'},
        { id: 'orchid', name: 'オーキッド'},
        { id: 'roland', name: 'ローランド'},
        { id: 'snowowl', name: 'スノーウィル'},
        { id: 'yammyn', name: 'ヤミン'},
    ]
};

// キャラクター定義の下あたりに追記してください

let activeTargetId = null; 
let dateUpdateInterval = null; // 🌟 時間自動更新用のタイマー管理変数

// 🌟 現在のローカル時刻を取得して入力欄にセットする関数
function updateDateTimeToNow() {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(now - offset)).toISOString().slice(0, 16);
    document.getElementById('match-date').value = localISOTime;
}

// ページ初期化処理
window.addEventListener('DOMContentLoaded', () => {
    // 1. 初回表示時に現在時刻をセット
    updateDateTimeToNow();

    // 2. 🌟 1分（60000ミリ秒）ごとに現在時刻を自動で上書きし続ける
    dateUpdateInterval = setInterval(updateDateTimeToNow, 60000);

    // 3. 🌟 ユーザーが手動で日時を変更した場合、勝手に今戻されると困るので自動更新を止める
    document.getElementById('match-date').addEventListener('input', () => {
        if (dateUpdateInterval) {
            clearInterval(dateUpdateInterval);
            dateUpdateInterval = null; // タイマーを完全に破棄
        }
    });

    generateModalCharacters('ALL');
    setupTabEvents();
});

window.addEventListener('DOMContentLoaded', () => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(now - offset)).toISOString().slice(0, 16);
    document.getElementById('match-date').value = localISOTime;

    generateModalCharacters('ALL'); // 新しい関数構造で全表示
    setupTabEvents();
});

// ポップアップ内のキャラクターリストを生成（コスト別フォルダ対応）
function generateModalCharacters(filterCost = 'ALL') {
    const grid = document.getElementById('modal-char-grid');
    grid.innerHTML = ''; 

    let targetChars = [];

    if (filterCost === 'ALL') {
        targetChars = Object.values(CHARACTER_BY_COST).flat();
    } else {
        targetChars = CHARACTER_BY_COST[filterCost] || [];
    }

    targetChars.forEach(char => {
        // キャラクターが属しているコスト（フォルダ名になります）
        const currentCost = Object.keys(CHARACTER_BY_COST).find(key => 
            CHARACTER_BY_COST[key].some(c => c.id === char.id)
        );

        const item = document.createElement('div');
        item.className = 'modal-char-item';
        // 🌟 src属性のパスをコストフォルダ経由に変更しました
        item.innerHTML = `
            <div class="char-img-container">
                <img src="image/${currentCost}/${char.id}.png" alt="${char.name}" class="char-icon-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div class="char-img-placeholder">${char.initial}</div>
            </div>
            <div class="char-name-label">${char.name}<span class="char-cost-label">${currentCost}</span></div>
        `;
        
        item.addEventListener('click', () => selectCharacter(char.name, currentCost));
        grid.appendChild(item);
    });
}

function setupTabEvents() {
    const tabs = document.querySelectorAll('.modal-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const selectedCost = tab.getAttribute('data-cost');
            generateModalCharacters(selectedCost);
        });
    });
}

// ポップアップ開閉
const modal = document.getElementById('char-modal');
const selectButtons = document.querySelectorAll('.btn-char-select');

selectButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        activeTargetId = btn.getAttribute('data-id');

        const tabs = document.querySelectorAll('.modal-tab');
        tabs.forEach(t => t.classList.remove('active'));
        document.querySelector('[data-cost="ALL"]').classList.add('active');
        generateModalCharacters('ALL');

        modal.classList.add('open');
    });
});

document.getElementById('modal-close-btn').addEventListener('click', () => {
    modal.classList.remove('open');
});

// 選択クリア時の初期テキスト復元
document.getElementById('btn-clear-selection').addEventListener('click', () => {
    if (activeTargetId) {
        const hiddenInput = document.getElementById(activeTargetId);
        const targetButton = document.querySelector(`[data-id="${activeTargetId}"]`);

        hiddenInput.value = "";
        targetButton.classList.remove('selected-active');

        // どの項目だったかに応じて初期テキストに戻す
        if (activeTargetId.includes('pool')) {
            targetButton.textContent = activeTargetId.slice(-1); // 1,2,3,4の数字
        } else if (activeTargetId.includes('banned-1')) {
            targetButton.textContent = "1人目";
        } else if (activeTargetId.includes('banned-2')) {
            targetButton.textContent = "2人目";
        } else {
            targetButton.textContent = "選択";
        }
    }
    modal.classList.remove('open');
});

// キャラクター確定＆ボタンのアイコン化処理（コスト別フォルダ対応）
function selectCharacter(charName, cost) {
    if (activeTargetId) {
        const hiddenInput = document.getElementById(activeTargetId); 
        const targetButton = document.querySelector(`[data-id="${activeTargetId}"]`); 
        
        hiddenInput.value = charName; 
        
        const allChars = Object.values(CHARACTER_BY_COST).flat();
        const charData = allChars.find(c => c.name === charName);
        
        // 🌟 src属性のパスをコストフォルダ経由（引数のcostを利用）に変更しました
        targetButton.innerHTML = `
            <div class="char-img-container">
                <img src="image/${cost}/${charData.id}.png" class="char-icon-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div class="char-img-placeholder">${charData.initial}</div>
            </div>
            <div class="btn-char-name-text">${charData.name}</div>
        `;
        targetButton.classList.add('selected-active'); 
    }
    modal.classList.remove('open'); 
}

// 勝敗トグル
let selectedResult = null;
const winBtn = document.getElementById('btn-win');
const loseBtn = document.getElementById('btn-lose');

winBtn.addEventListener('click', () => {
    winBtn.classList.add('win-active');
    loseBtn.classList.remove('lose-active');
    selectedResult = "WIN";
});
loseBtn.addEventListener('click', () => {
    loseBtn.classList.add('lose-active');
    winBtn.classList.remove('win-active');
    selectedResult = "LOSE";
});

// フォーム送信処理（全データを1つのオブジェクトにビルド）
document.getElementById('match-form').addEventListener('submit', (e) => {
    e.preventDefault();

    if (!selectedResult) {
        alert("勝負の結果（WINまたはLOSE）を選択してください。");
        return;
    }

    const matchRecord = {
        date: document.getElementById('match-date').value,
        // 持ち込みプール(各4名)
        myPool1: document.getElementById('my-pool-1').value,
        myPool2: document.getElementById('my-pool-2').value,
        myPool3: document.getElementById('my-pool-3').value,
        myPool4: document.getElementById('my-pool-4').value,
        teammatePool1: document.getElementById('teammate-pool-1').value,
        teammatePool2: document.getElementById('teammate-pool-2').value,
        teammatePool3: document.getElementById('teammate-pool-3').value,
        teammatePool4: document.getElementById('teammate-pool-4').value,
        // Ban / 被Ban
        myBan: document.getElementById('my-ban').value,
        teammateBan: document.getElementById('teammate-ban').value,
        myBanned1: document.getElementById('my-banned-1').value,
        myBanned2: document.getElementById('my-banned-2').value,
        teammateBanned1: document.getElementById('teammate-banned-1').value,
        teammateBanned2: document.getElementById('teammate-banned-2').value,
        // Pick
        myPick: document.getElementById('my-pick').value,
        teammatePick: document.getElementById('teammate-pick').value,
        enemyPick1: document.getElementById('enemy-pick-1').value,
        enemyPick2: document.getElementById('enemy-pick-2').value,
        result: selectedResult
    };

    let history = JSON.parse(localStorage.getItem('match_history')) || [];
    history.push(matchRecord);
    localStorage.setItem('match_history', JSON.stringify(history));

    alert("対戦データをすべて保存しました！");
    location.reload(); 
});

// 💾 試合データを普通に保存する関数（上限なし）
function saveMatchData(newMatchRecord) {
    let history = JSON.parse(localStorage.getItem('match_history')) || [];

    // 🌟 件数制限はせず、そのまま末尾に追加
    history.push(newMatchRecord);

    localStorage.setItem('match_history', JSON.stringify(history));
    alert("戦績を保存しました！");
    location.reload();
}

// 📥 CSVインポート機能（上限なし・自動日時ソート版）
function importCSV(input) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const text = e.target.result;
        const lines = text.split(/\r?\n/).filter(line => line.trim() !== "");
        if (lines.length <= 1) { alert("データが見つかりませんでした。"); return; }

        const isOverwrite = confirm("CSVデータを読み込みます。\n\n【OK】➡️ 完全上書き\n【キャンセル】➡️ 現在のデータに追記");
        const importedHistory = [];

        for (let i = 1; i < lines.length; i++) {
            const row = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            if (row.length < CSV_HEADERS.length) continue;

            const matchRecord = {};
            CSV_HEADERS.forEach((key, index) => {
                let val = row[index] ? row[index].trim() : "";
                if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1).replace(/""/g, '"');
                matchRecord[key] = val;
            });
            importedHistory.push(matchRecord);
        }

        let currentHistory = isOverwrite ? [] : (JSON.parse(localStorage.getItem('match_history')) || []);
        let newHistory = currentHistory.concat(importedHistory);
        
        // 日時の古い順（昇順）にソートして、全件そのまま保存
        newHistory.sort((a, b) => (a.date || "").localeCompare(b.date || ""));

        localStorage.setItem('match_history', JSON.stringify(newHistory));
        alert(`${importedHistory.length}件のデータを読み込み、時系列順に整理しました！`);
        location.reload();
    };
    reader.readAsText(file, "UTF-8");
}

// ==========================================
// 📄 CSVエクスポート & インポート機能
// ==========================================

// CSVの項目順を定義（これに基づいて列を並び替えます）
const CSV_HEADERS = [
    "date", "myPool1", "myPool2", "myPool3", "myPool4",
    "teammatePool1", "teammatePool2", "teammatePool3", "teammatePool4",
    "myBan", "teammateBan", "myBanned1", "myBanned2",
    "teammateBanned1", "teammateBanned2", "myPick", "teammatePick",
    "enemyPick1", "enemyPick2", "result"
];

// 日本語のヘッダー名（Excelで見た時に分かりやすくするため）
const CSV_HEADER_LABELS = [
    "日時", "自プール1", "自プール2", "自プール3", "自プール4",
    "味プール1", "味プール2", "味プール3", "味プール4",
    "自Ban", "味Ban", "自被Ban1", "自被Ban2",
    "味被Ban1", "味被Ban2", "自Pick", "味Pick",
    "敵Pick1", "敵Pick2", "試合結果"
];

// 📤 1. CSVエクスポート機能
function exportCSV() {
    const history = JSON.parse(localStorage.getItem('match_history')) || [];

    if (history.length === 0) {
        alert("保存されている対戦データがありません。");
        return;
    }

    // CSVの文字列を作成（まずはヘッダー行）
    let csvContent = CSV_HEADER_LABELS.join(",") + "\r\n";

    // データを1行ずつCSV形式に変換
    history.forEach(match => {
        const row = CSV_HEADERS.map(key => {
            // データ内にカンマや改行が含まれる場合の安全対策（今回は基本ないですが念のため）
            let value = match[key] || "";
            if (value.includes(",") || value.includes('"') || value.includes("\n") || value.includes("\r")) {
                value = '"' + value.replace(/"/g, '""') + '"';
            }
            return value;
        });
        csvContent += row.join(",") + "\r\n";
    });

    // 🌟 Excel文字化け対策：UTF-8のBOM（Byte Order Mark）を先頭に付与
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const blob = new Blob([bom, csvContent], { type: "text/csv;charset=utf-8;" });

    // ダウンロード用のリンクを動的に作成してクリックさせる
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    // ファイル名を「star_wings_年月日_時分.csv」にする
    const now = new Date();
    const dateStr = now.getFullYear() + 
                    String(now.getMonth() + 1).padStart(2, '0') + 
                    String(now.getDate()).padStart(2, '0') + "_" +
                    String(now.getHours()).padStart(2, '0') + 
                    String(now.getMinutes()).padStart(2, '0');
                    
    link.setAttribute("href", url);
    link.setAttribute("download", `star_wings_${dateStr}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // メモリ解放
    URL.revokeObjectURL(url);
}

// 📥 CSVインポート機能（直近100戦制限・追記対応完全版）
function importCSV(input) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const text = e.target.result;
        const lines = text.split(/\r?\n/).filter(line => line.trim() !== "");
        if (lines.length <= 1) { alert("データが見つかりませんでした。"); return; }

        const isOverwrite = confirm("CSVデータを読み込みます。\n\n【OK】➡️ 完全上書き\n【キャンセル】➡️ 現在のデータに追記");
        const importedHistory = [];

        for (let i = 1; i < lines.length; i++) {
            const row = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            if (row.length < CSV_HEADERS.length) continue;

            const matchRecord = {};
            CSV_HEADERS.forEach((key, index) => {
                let val = row[index] ? row[index].trim() : "";
                if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1).replace(/""/g, '"');
                matchRecord[key] = val;
            });
            importedHistory.push(matchRecord);
        }

        let currentHistory = isOverwrite ? [] : (JSON.parse(localStorage.getItem('match_history')) || []);
        let newHistory = currentHistory.concat(importedHistory);
        
        // 1. まず日時の古い順（昇順）にソート
        newHistory.sort((a, b) => (a.date || "").localeCompare(b.date || ""));

        // 🌟 2.【ここが重要！】100件を超えていたら、日付が新しい方から数えて100件だけを切り取る
        // 古い順に並んでいるので、後ろから100件（.slice(-100)）を抽出します
        if (newHistory.length > 100) {
            newHistory = newHistory.slice(-100);
        }

        localStorage.setItem('match_history', JSON.stringify(newHistory));
        alert(`データを読み込み、直近100戦のデータとして時系列順に整理しました！`);
        location.reload();
    };
    reader.readAsText(file, "UTF-8");
}