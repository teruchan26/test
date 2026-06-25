window.addEventListener('DOMContentLoaded', () => {
    const allHistory = JSON.parse(localStorage.getItem('match_history')) || [];

    if (allHistory.length === 0) {
        const deleteAllBtn = document.getElementById('btn-delete-all');
        if (deleteAllBtn) deleteAllBtn.style.display = 'none';
        return; 
    }

    // 日時の強制ソート
    allHistory.sort((a, b) => {
        const dateA = a.date ? new Date(a.date.replace(/\//g, '-')).getTime() : 0;
        const dateB = b.date ? new Date(b.date.replace(/\//g, '-')).getTime() : 0;
        return (isNaN(dateA) ? 0 : dateA) - (isNaN(dateB) ? 0 : dateB);
    });

    const recent100History = allHistory.slice(-100);

    calculateSummary(recent100History);
    renderCharacterStats(recent100History);
    
    // 🌟【ここを追加！】直近100戦のBan率を計算して描画
    renderBanStats(recent100History);

    renderHistoryTable(allHistory);
});

// 📊 総合サマリー（トータル勝率）を計算する関数
function calculateSummary(recentHistory) {
    let total = 0;
    let win = 0;
    let lose = 0;

    recentHistory.forEach(match => {
        if (!match.result) return;
        
        // 🌟【改善ポイント2】大文字小文字のブレを統一し、日本語の「勝/敗」や記号にも対応
        const result = match.result.trim().toUpperCase();
        
        if (result === 'WIN' || result === '勝' || result === '〇' || result === '○') {
            win++;
            total++;
        } else if (result === 'LOSE' || result === '敗' || result === '×') {
            lose++;
            total++;
        }
    });

    const winRate = total > 0 ? Math.round((win / total) * 100) : 0;

    // 画面への数値反映
    if(document.getElementById('total-matches')) document.getElementById('total-matches').innerText = total;
    if(document.getElementById('total-wins')) document.getElementById('total-wins').innerText = win;
    if(document.getElementById('total-loses')) document.getElementById('total-loses').innerText = lose;
    if(document.getElementById('total-win-rate')) document.getElementById('total-win-rate').innerText = winRate + '%';
}

// 🏆 キャラクター別勝率を計算・描画する関数
function renderCharacterStats(recentHistory) {
    const container = document.getElementById('char-stats-container');
    if (!container) return;
    container.innerHTML = '';

    const charStats = {};

    recentHistory.forEach(match => {
        const myPick = match.myPick ? match.myPick.trim() : "";
        if (!match.result || !myPick) return;

        // 🌟 ここでも勝敗の表記ブレを吸収
        const result = match.result.trim().toUpperCase();
        const isWin = (result === 'WIN' || result === '勝' || result === '〇' || result === '○');
        const isLose = (result === 'LOSE' || result === '敗' || result === '×');

        if (!isWin && !isLose) return; // どちらでもなければスキップ

        if (!charStats[myPick]) {
            charStats[myPick] = { win: 0, lose: 0, total: 0 };
        }

        if (isWin) {
            charStats[myPick].win++;
            charStats[myPick].total++;
        } else if (isLose) {
            charStats[myPick].lose++;
            charStats[myPick].total++;
        }
    });

    const sortedStats = Object.keys(charStats).map(charName => {
        const stats = charStats[charName];
        const rate = Math.round((stats.win / stats.total) * 100);
        return { name: charName, ...stats, rate: rate };
    }).sort((a, b) => b.rate - a.rate || b.total - a.total);

    if (sortedStats.length === 0) {
        container.innerHTML = '<div class="no-data">直近100戦以内に有効なキャラクター別データがありません。</div>';
        return;
    }

    sortedStats.forEach(stat => {
        const row = document.createElement('div');
        row.className = 'char-stats-row';
        const barClass = stat.rate >= 60 ? 'char-stats-bar high-rate' : 'char-stats-bar';

        row.innerHTML = `
            <div class="char-stats-info"><div class="char-stats-name">${stat.name}</div></div>
            <div class="char-stats-bar-container"><div class="${barClass}" style="width: ${stat.rate}%"></div></div>
            <div class="char-stats-nums"><span>${stat.win}勝${stat.lose}敗</span><span class="char-stats-rate">${stat.rate}%</span></div>
        `;
        container.appendChild(row);
    });
}

// 📜 対戦履歴テーブルを描画する関数
function renderHistoryTable(allHistory) {
    const tbody = document.getElementById('history-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    const totalCount = allHistory.length;

    // 全データを「最新順（降順）」にひっくり返して表示
    [...allHistory].reverse().forEach((match, displayIndex) => {
        const originalIndex = totalCount - 1 - displayIndex;
        const tr = document.createElement('tr');
        
        // 🌟 表示する日時の見た目もハイフン区切りの綺麗な形に統一
        const dateStr = match.date ? match.date.replace('T', ' ').replace(/\//g, '-') : '不明';
        
        const myPool = [match.myPool1, match.myPool2, match.myPool3, match.myPool4].filter(Boolean).join(', ');
        const tmPool = [match.teammatePool1, match.teammatePool2, match.teammatePool3, match.teammatePool4].filter(Boolean).join(', ');
        const enemyBans = [match.myBanned1, match.myBanned2].filter(Boolean);
        const enemyBanText = enemyBans.length > 0 ? enemyBans.join(', ') : 'なし';
        
        // バッジの判定も表記ブレに対応
        const res = match.result ? match.result.trim().toUpperCase() : "";
        const isWin = (res === 'WIN' || res === '勝' || res === '〇' || res === '○');
        const resultBadge = isWin 
            ? `<span class="badge-win">WIN</span>` 
            : `<span class="badge-lose">LOSE</span>`;

        tr.innerHTML = `
            <td>${dateStr}</td>
            <td><div>自: ${myPool || '-'}</div><div class="text-pool-muted">味: ${tmPool || '-'}</div></td>
            <td>${match.myBan || '-'}</td>
            <td class="text-ban-strikethrough">${enemyBanText}</td>
            <td><strong>${match.myPick || '-'}</strong><div class="text-pool-muted">味: ${match.teammatePick || '-'}</div></td>
            <td><div>${match.enemyPick1 || '-'}</div><div>${match.enemyPick2 || '-'}</div></td>
            <td>${resultBadge}</td>
            <td><button type="button" class="btn-delete-row" data-index="${originalIndex}">削除</button></td>
        `;
        tbody.appendChild(tr);
    });

    document.querySelectorAll('.btn-delete-row').forEach(button => {
        button.addEventListener('click', (e) => {
            const index = e.target.getAttribute('data-index');
            deleteMatchByIndex(parseInt(index, 10));
        });
    });
}

// 🗑️ データを1件削除する関数
function deleteMatchByIndex(index) {
    if (!confirm("この対戦データを削除しますか？")) return;
    
    // 全データを一度取得してソート状態をあわせる
    const allHistory = JSON.parse(localStorage.getItem('match_history')) || [];
    allHistory.sort((a, b) => {
        const dateA = a.date ? new Date(a.date.replace(/\//g, '-')).getTime() : 0;
        const dateB = b.date ? new Date(b.date.replace(/\//g, '-')).getTime() : 0;
        return (isNaN(dateA) ? 0 : dateA) - (isNaN(dateB) ? 0 : dateB);
    });

    // 指定されたインデックスを削除
    allHistory.splice(index, 1);
    
    // 保存してリロード
    localStorage.setItem('match_history', JSON.stringify(allHistory));
    location.reload();
}

// ⚠️ 全削除機能
function clearAllHistory() {
    if (confirm("【警告】すべての対戦履歴を完全に削除します。よろしいですか？")) {
        localStorage.removeItem('match_history');
        location.reload();
    }
}

// 🚫 4. プール内キャラクター別Ban率を計算・描画する関数
function renderBanStats(recentHistory) {
    const container = document.getElementById('ban-stats-container');
    if (!container) return;
    container.innerHTML = '';

    const banStats = {};

    recentHistory.forEach(match => {
        // この試合で「自分がプールに編成していたキャラ」をリスト化 (空文字は除外)
        const myPool = [match.myPool1, match.myPool2, match.myPool3, match.myPool4]
            .map(c => c ? c.trim() : "")
            .filter(Boolean);
            
        // この試合で「相手がBanしてきたキャラ」をリスト化
        const enemyBans = [match.myBanned1, match.myBanned2]
            .map(c => c ? c.trim() : "")
            .filter(Boolean);

        // プールにいたキャラごとに、編成回数とBanされた回数を集計
        myPool.forEach(charName => {
            if (!banStats[charName]) {
                banStats[charName] = { banCount: 0, totalCount: 0 };
            }
            
            banStats[charName].totalCount++; // 編成数を +1
            
            // もし相手のBanリストにそのキャラがいたら、Ban数を +1
            if (enemyBans.includes(charName)) {
                banStats[charName].banCount++;
            }
        });
    });

    // 配列に変換してBan率を計算し、高い順（降順）にソート
    const sortedBanStats = Object.keys(banStats).map(charName => {
        const stats = banStats[charName];
        const rate = stats.totalCount > 0 ? Math.round((stats.banCount / stats.totalCount) * 100) : 0;
        return { name: charName, ...stats, rate: rate };
    }).sort((a, b) => b.rate - a.rate || b.totalCount - a.totalCount); // Ban率順（同じなら編成回数順）

    if (sortedBanStats.length === 0) {
        container.innerHTML = '<div class="no-data">直近100戦以内にプール情報（編成データ）がありません。</div>';
        return;
    }

    // グラフの描画（既存の勝率グラフのCSSクラスを流用します）
    sortedBanStats.forEach(stat => {
        const row = document.createElement('div');
        row.className = 'char-stats-row';
        
        // 警戒度高（Ban率50%以上）なら赤いバー、それ以外は少し落ち着いた赤系にする演出
        const barColor = stat.rate >= 50 
            ? 'linear-gradient(90deg, #ef4444, #f87171)' 
            : 'linear-gradient(90deg, #b91c1c, #ef4444)';

        row.innerHTML = `
            <div class="char-stats-info">
                <div class="char-stats-name">${stat.name}</div>
            </div>
            <div class="char-stats-bar-container">
                <div class="char-stats-bar" style="width: ${stat.rate}%; background: ${barColor};"></div>
            </div>
            <div class="char-stats-nums">
                <span>Ban: ${stat.banCount}回 / 編成: ${stat.totalCount}回</span>
                <span class="char-stats-rate" style="color: #f87171; font-weight: bold;">${stat.rate}%</span>
            </div>
        `;
        container.appendChild(row);
    });
}