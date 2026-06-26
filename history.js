window.addEventListener('DOMContentLoaded', () => {
    const allHistory = JSON.parse(localStorage.getItem('match_history')) || [];

    if (allHistory.length === 0) {
        const deleteAllBtn = document.getElementById('btn-delete-all');
        if (deleteAllBtn) deleteAllBtn.style.display = 'none';
        return; 
    }

    // 日時の強制ソート（表記ブレ吸収版）
    allHistory.sort((a, b) => {
        const dateA = a.date ? new Date(a.date.replace(/\//g, '-')).getTime() : 0;
        const dateB = b.date ? new Date(b.date.replace(/\//g, '-')).getTime() : 0;
        return (isNaN(dateA) ? 0 : dateA) - (isNaN(dateB) ? 0 : dateB);
    });

    const recent100History = allHistory.slice(-100);

    // 📊 各種計算の実行（すべて直近100戦ベース）
    calculateSummary(recent100History);
    renderCharacterStats(recent100History);
    renderBanStats(recent100History);
    renderEnemyPickStats(recent100History); // 🌟新機能：相手の使用率

    // 📜 履歴テーブル（全件表示）
    renderHistoryTable(allHistory);

    // 👆 タブ切り替えのイベントを設定
    setupTabSystem();
});

// ⚡ タブ切り替え制御関数
function setupTabSystem() {
    const triggers = document.querySelectorAll('.tab-trigger');
    const panes = document.querySelectorAll('.tab-pane');

    triggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const targetId = trigger.getAttribute('data-target');

            // すべてのボタンの「アクティブ状態」を解除
            triggers.forEach(t => {
                t.style.color = '#94a3b8';
                t.style.borderBottomColor = 'transparent';
            });
            // すべてのコンテンツを非表示にする
            panes.forEach(p => p.style.display = 'none');

            // クリックされたタブだけを光らせて表示
            trigger.style.color = '#38bdf8';
            trigger.style.borderBottomColor = '#38bdf8';
            
            const targetPane = document.getElementById(targetId);
            if (targetPane) targetPane.style.display = 'block';
        });
    });
}

// 📊 総合サマリー（トータル勝率）を計算する関数
function calculateSummary(recentHistory) {
    let total = 0; let win = 0; let lose = 0;
    recentHistory.forEach(match => {
        if (!match.result) return;
        const result = match.result.trim().toUpperCase();
        if (result === 'WIN' || result === '勝' || result === '〇' || result === '○') { win++; total++; } 
        else if (result === 'LOSE' || result === '敗' || result === '×') { lose++; total++; }
    });
    const winRate = total > 0 ? Math.round((win / total) * 100) : 0;
    if(document.getElementById('total-matches')) document.getElementById('total-matches').innerText = total;
    if(document.getElementById('total-wins')) document.getElementById('total-wins').innerText = win;
    if(document.getElementById('total-loses')) document.getElementById('total-loses').innerText = lose;
    if(document.getElementById('total-win-rate')) document.getElementById('total-win-rate').innerText = winRate + '%';
}

// 🏆 自分のキャラクター別勝率を計算・描画する関数
function renderCharacterStats(recentHistory) {
    const container = document.getElementById('char-stats-container');
    if (!container) return; container.innerHTML = '';
    const charStats = {};

    recentHistory.forEach(match => {
        const myPick = match.myPick ? match.myPick.trim() : "";
        if (!match.result || !myPick) return;
        const result = match.result.trim().toUpperCase();
        const isWin = (result === 'WIN' || result === '勝' || result === '〇' || result === '○');
        const isLose = (result === 'LOSE' || result === '敗' || result === '×');
        if (!isWin && !isLose) return;

        if (!charStats[myPick]) charStats[myPick] = { win: 0, lose: 0, total: 0 };
        if (isWin) { charStats[myPick].win++; charStats[myPick].total++; } 
        else if (isLose) { charStats[myPick].lose++; charStats[myPick].total++; }
    });

    const sortedStats = Object.keys(charStats).map(charName => {
        const stats = charStats[charName];
        return { name: charName, ...stats, rate: Math.round((stats.win / stats.total) * 100) };
    }).sort((a, b) => b.rate - a.rate || b.total - a.total);

    if (sortedStats.length === 0) {
        container.innerHTML = '<div class="no-data">データがありません。</div>';
        return;
    }
    sortedStats.forEach(stat => {
        const row = document.createElement('div'); row.className = 'char-stats-row';
        const barClass = stat.rate >= 60 ? 'char-stats-bar high-rate' : 'char-stats-bar';
        row.innerHTML = `
            <div class="char-stats-info"><div class="char-stats-name">${stat.name}</div></div>
            <div class="char-stats-bar-container"><div class="${barClass}" style="width: ${stat.rate}%"></div></div>
            <div class="char-stats-nums"><span>${stat.win}勝${stat.lose}敗</span><span class="char-stats-rate">${stat.rate}%</span></div>
        `;
        container.appendChild(row);
    });
}

// 🚫 自分のプール内キャラクター別Ban率を計算・描画する関数
function renderBanStats(recentHistory) {
    const container = document.getElementById('ban-stats-container');
    if (!container) return; container.innerHTML = '';
    const banStats = {};

    recentHistory.forEach(match => {
        const myPool = [match.myPool1, match.myPool2, match.myPool3, match.myPool4].map(c => c ? c.trim() : "").filter(Boolean);
        const enemyBans = [match.myBanned1, match.myBanned2].map(c => c ? c.trim() : "").filter(Boolean);

        myPool.forEach(charName => {
            if (!banStats[charName]) banStats[charName] = { banCount: 0, totalCount: 0 };
            banStats[charName].totalCount++;
            if (enemyBans.includes(charName)) banStats[charName].banCount++;
        });
    });

    const sortedBanStats = Object.keys(banStats).map(charName => {
        const stats = banStats[charName];
        return { name: charName, ...stats, rate: stats.totalCount > 0 ? Math.round((stats.banCount / stats.totalCount) * 100) : 0 };
    }).sort((a, b) => b.rate - a.rate || b.totalCount - a.totalCount);

    if (sortedBanStats.length === 0) {
        container.innerHTML = '<div class="no-data">直近100戦以内にプール編成データがありません。</div>';
        return;
    }
    sortedBanStats.forEach(stat => {
        const row = document.createElement('div'); row.className = 'char-stats-row';
        const barColor = stat.rate >= 50 ? 'linear-gradient(90deg, #ef4444, #f87171)' : 'linear-gradient(90deg, #b91c1c, #ef4444)';
        row.innerHTML = `
            <div class="char-stats-info"><div class="char-stats-name">${stat.name}</div></div>
            <div class="char-stats-bar-container"><div class="char-stats-bar" style="width: ${stat.rate}%; background: ${barColor};"></div></div>
            <div class="char-stats-nums"><span>Ban: ${stat.banCount}回 / 編成: ${stat.totalCount}回</span><span class="char-stats-rate" style="color: #f87171; font-weight: bold;">${stat.rate}%</span></div>
        `;
        container.appendChild(row);
    });
}

// ⚔️ 3.【新機能】相手のキャラクター使用率を計算・描画する関数
function renderEnemyPickStats(recentHistory) {
    const container = document.getElementById('enemy-stats-container');
    if (!container) return; container.innerHTML = '';

    const enemyStats = {};
    let totalEnemyPicks = 0; // 敵がピックした有効な総枠数（分母）

    recentHistory.forEach(match => {
        // 敵のピック1と2を取得して合体
        const enemies = [match.enemyPick1, match.enemyPick2].map(c => c ? c.trim() : "").filter(Boolean);

        enemies.forEach(charName => {
            if (!enemyStats[charName]) {
                enemyStats[charName] = 0;
            }
            enemyStats[charName]++; // 登場回数を+1
            totalEnemyPicks++;     // 全体の分母も+1
        });
    });

    // 配列に変換して使用率（％）を計算し、高い順（降順）にソート
    const sortedEnemyStats = Object.keys(enemyStats).map(charName => {
        const count = enemyStats[charName];
        const rate = totalEnemyPicks > 0 ? Math.round((count / totalEnemyPicks) * 100) : 0;
        return { name: charName, count: count, rate: rate };
    }).sort((a, b) => b.rate - a.rate || b.count - a.count);

    if (sortedEnemyStats.length === 0) {
        container.innerHTML = '<div class="no-data">直近100戦以内に相手のキャラクターデータがありません。</div>';
        return;
    }

    // グラフの描画
    sortedEnemyStats.forEach(stat => {
        const row = document.createElement('div');
        row.className = 'char-stats-row';
        
        // 敵（エネミー）のイメージカラーとして、スタイリッシュな紫色のグラデーションを採用
        const barColor = 'linear-gradient(90deg, #8b5cf6, #a78bfa)';

        row.innerHTML = `
            <div class="char-stats-info">
                <div class="char-stats-name">${stat.name}</div>
            </div>
            <div class="char-stats-bar-container">
                <div class="char-stats-bar" style="width: ${stat.rate}%; background: ${barColor};"></div>
            </div>
            <div class="char-stats-nums">
                <span>確認数: ${stat.count}回</span>
                <span class="char-stats-rate" style="color: #a78bfa; font-weight: bold;">${stat.rate}%</span>
            </div>
        `;
        container.appendChild(row);
    });
}

// 📜 対戦履歴テーブルを描画する関数（全件表示）
function renderHistoryTable(allHistory) {
    const tbody = document.getElementById('history-table-body');
    if (!tbody) return; tbody.innerHTML = '';
    const totalCount = allHistory.length;

    [...allHistory].reverse().forEach((match, displayIndex) => {
        const originalIndex = totalCount - 1 - displayIndex;
        const tr = document.createElement('tr');
        const dateStr = match.date ? match.date.replace('T', ' ').replace(/\//g, '-') : '不明';
        const myPool = [match.myPool1, match.myPool2, match.myPool3, match.myPool4].filter(Boolean).join(', ');
        const tmPool = [match.teammatePool1, match.teammatePool2, match.teammatePool3, match.teammatePool4].filter(Boolean).join(', ');
        const enemyBans = [match.myBanned1, match.myBanned2].filter(Boolean);
        const enemyBanText = enemyBans.length > 0 ? enemyBans.join(', ') : 'なし';
        
        const res = match.result ? match.result.trim().toUpperCase() : "";
        const isWin = (res === 'WIN' || res === '勝' || res === '〇' || res === '○');
        const resultBadge = isWin ? `<span class="badge-win">WIN</span>` : `<span class="badge-lose">LOSE</span>`;

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

function deleteMatchByIndex(index) {
    if (!confirm("この対戦データを削除しますか？")) return;
    const allHistory = JSON.parse(localStorage.getItem('match_history')) || [];
    allHistory.sort((a, b) => {
        const dateA = a.date ? new Date(a.date.replace(/\//g, '-')).getTime() : 0;
        const dateB = b.date ? new Date(b.date.replace(/\//g, '-')).getTime() : 0;
        return (isNaN(dateA) ? 0 : dateA) - (isNaN(dateB) ? 0 : dateB);
    });
    allHistory.splice(index, 1);
    localStorage.setItem('match_history', JSON.stringify(allHistory));
    location.reload();
}

function clearAllHistory() {
    if (confirm("【警告】すべての対戦履歴を完全に削除します。よろしいですか？")) {
        localStorage.removeItem('match_history');
        location.reload();
    }
}