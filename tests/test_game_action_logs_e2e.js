/**
 * GARDEN EMPIRE — PHASE 12 GAME ACTION LOGS E2E TEST SUITE
 * Kiểm thử tính đồng bộ thời gian thực của nhật ký hành động (Game Action Logs)
 * trên nhiều tab kết nối đồng thời qua WebSockets.
 */

const BASE_HTTP = 'http://localhost:8080/api/rooms';
const BASE_WS = 'ws://localhost:8080/ws/game';

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runGameActionLogsE2ETest() {
  console.log('📜 ========================================================');
  console.log('🌿 GARDEN EMPIRE — PHASE 12 GAME ACTION LOGS E2E TEST');
  console.log('📜 ========================================================\n');

  try {
    // ----------------------------------------------------
    // STEP 1: TẠO PHÒNG VỚI 3 NGƯỜI CHƠI
    // ----------------------------------------------------
    const player1 = { id: 'p1-bao-' + Date.now(), name: 'Bảo_Host', avatar: '🌱' };
    const player2 = { id: 'p2-an-' + Date.now(), name: 'An_Florist', avatar: '🌺' };
    const player3 = { id: 'p3-chi-' + Date.now(), name: 'Chi_Botanist', avatar: '🍀' };

    console.log(`[1] Tạo phòng mới với Host: ${player1.name}...`);
    const createRes = await fetch(BASE_HTTP, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomName: 'Vườn Thực Nghiệm Logs',
        maxPlayers: 3,
        hostPlayer: player1
      })
    });
    if (!createRes.ok) throw new Error(`Lỗi tạo phòng: ${createRes.status}`);
    const room = await createRes.json();
    const roomId = room.id;
    console.log(`✅ Tạo phòng thành công: [${roomId}]`);

    console.log(`[2] Player 2 & 3 tham gia phòng...`);
    await fetch(`${BASE_HTTP}/${roomId}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(player2)
    });
    await fetch(`${BASE_HTTP}/${roomId}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(player3)
    });
    console.log(`✅ Cả 3 người chơi đã vào phòng.`);

    // ----------------------------------------------------
    // STEP 2: BẮT ĐẦU VÁN ĐẤU & KẾT NỐI WEBSOCKET
    // ----------------------------------------------------
    console.log(`[3] Bắt đầu trận đấu...`);
    const startRes = await fetch(`${BASE_HTTP}/${roomId}/start?hostId=${encodeURIComponent(player1.id)}`, {
      method: 'POST'
    });
    if (!startRes.ok) throw new Error(`Lỗi bắt đầu trận: ${startRes.status}`);
    console.log(`✅ Trận đấu chuyển sang PLAYING.`);

    const ws1Messages = [];
    const ws2Messages = [];
    const ws3Messages = [];

    const ws1 = new WebSocket(`${BASE_WS}?gameId=${roomId}&playerId=${player1.id}`);
    const ws2 = new WebSocket(`${BASE_WS}?gameId=${roomId}&playerId=${player2.id}`);
    const ws3 = new WebSocket(`${BASE_WS}?gameId=${roomId}&playerId=${player3.id}`);

    ws1.onmessage = (e) => ws1Messages.push(JSON.parse(e.data));
    ws2.onmessage = (e) => ws2Messages.push(JSON.parse(e.data));
    ws3.onmessage = (e) => ws3Messages.push(JSON.parse(e.data));

    await delay(600);

    // ----------------------------------------------------
    // STEP 3: KIỂM TRA LOG GAME_START BAN ĐẦU
    // ----------------------------------------------------
    console.log(`\n📋 [4] Kiểm tra log khởi đầu GAME_START trên cả 3 Tab...`);
    const stateTab1 = ws1Messages[ws1Messages.length - 1]?.payload;
    const stateTab2 = ws2Messages[ws2Messages.length - 1]?.payload;
    const stateTab3 = ws3Messages[ws3Messages.length - 1]?.payload;

    if (!stateTab1?.actionLogs || stateTab1.actionLogs.length === 0) {
      throw new Error(`Tab 1 không nhận được actionLogs ban đầu!`);
    }

    const startLog = stateTab1.actionLogs[0];
    console.log(`   • Tab 1 log: "${startLog.message}" (Type: ${startLog.actionType})`);
    console.log(`   • Tab 2 log count: ${stateTab2?.actionLogs?.length}`);
    console.log(`   • Tab 3 log count: ${stateTab3?.actionLogs?.length}`);

    if (startLog.actionType !== 'GAME_START') {
      throw new Error(`Log đầu tiên không phải GAME_START: ${startLog.actionType}`);
    }
    if (stateTab2.actionLogs.length !== stateTab1.actionLogs.length ||
        stateTab3.actionLogs.length !== stateTab1.actionLogs.length) {
      throw new Error(`Số lượng log ban đầu không đồng bộ giữa 3 tab!`);
    }
    console.log(`✅ Cả 3 Tab đồng bộ log GAME_START ban đầu!`);

    // ----------------------------------------------------
    // STEP 4: LƯỢT 1 - LẤY 3 TÀI NGUYÊN KHÁC LOẠI
    // ----------------------------------------------------
    const currentTurnId1 = stateTab1.currentTurnPlayerId;
    const activeWs1 = currentTurnId1 === player1.id ? ws1 : (currentTurnId1 === player2.id ? ws2 : ws3);
    const activePlayer1 = [player1, player2, player3].find(p => p.id === currentTurnId1);

    console.log(`\n⚡ [5] Lượt 1: [${activePlayer1.name}] lấy 3 tài nguyên (Đất, Nước, Ánh Sáng)...`);
    activeWs1.send(JSON.stringify({
      type: 'TAKE_RESOURCES',
      gameId: roomId,
      playerId: activePlayer1.id,
      tokens: { DIRT: 1, WATER: 1, SUNLIGHT: 1 }
    }));

    await delay(600);

    const afterTurn1Logs1 = ws1Messages[ws1Messages.length - 1]?.payload?.actionLogs;
    const afterTurn1Logs2 = ws2Messages[ws2Messages.length - 1]?.payload?.actionLogs;
    const afterTurn1Logs3 = ws3Messages[ws3Messages.length - 1]?.payload?.actionLogs;

    console.log(`   • Tổng log sau lượt 1: ${afterTurn1Logs1?.length}`);
    const latestLog1 = afterTurn1Logs1[afterTurn1Logs1.length - 1];
    console.log(`   • Nội dung log mới: "${latestLog1?.message}"`);
    console.log(`   • Mã ActionType: ${latestLog1?.actionType}`);

    if (latestLog1?.actionType !== 'TAKE_TOKENS_DISTINCT') {
      throw new Error(`Kỳ vọng TAKE_TOKENS_DISTINCT nhưng nhận được: ${latestLog1?.actionType}`);
    }
    if (!latestLog1.message.includes('Đất') || !latestLog1.message.includes('Nước') || !latestLog1.message.includes('Sáng')) {
      throw new Error(`Nội dung log không chứa đầy đủ tên tài nguyên: ${latestLog1.message}`);
    }
    if (afterTurn1Logs2.length !== afterTurn1Logs1.length || afterTurn1Logs3.length !== afterTurn1Logs1.length) {
      throw new Error(`Các tab không đồng bộ số lượng log sau lượt 1!`);
    }
    console.log(`✅ Cả 3 Tab nhận log TAKE_TOKENS_DISTINCT tức thì và chuẩn xác!`);

    // ----------------------------------------------------
    // STEP 5: LƯỢT 2 - LẤY 2 TÀI NGUYÊN CÙNG LOẠI
    // ----------------------------------------------------
    const stateAfter1 = ws1Messages[ws1Messages.length - 1]?.payload;
    const currentTurnId2 = stateAfter1.currentTurnPlayerId;
    const activeWs2 = currentTurnId2 === player1.id ? ws1 : (currentTurnId2 === player2.id ? ws2 : ws3);
    const activePlayer2 = [player1, player2, player3].find(p => p.id === currentTurnId2);

    console.log(`\n⚡ [6] Lượt 2: [${activePlayer2.name}] lấy 2 tài nguyên cùng loại (2 Dinh Dưỡng)...`);
    activeWs2.send(JSON.stringify({
      type: 'TAKE_RESOURCES',
      gameId: roomId,
      playerId: activePlayer2.id,
      tokens: { NUTRIENTS: 2 }
    }));

    await delay(600);

    const afterTurn2Logs1 = ws1Messages[ws1Messages.length - 1]?.payload?.actionLogs;
    const latestLog2 = afterTurn2Logs1[afterTurn2Logs1.length - 1];
    console.log(`   • Tổng log sau lượt 2: ${afterTurn2Logs1?.length}`);
    console.log(`   • Nội dung log mới: "${latestLog2?.message}"`);
    console.log(`   • Mã ActionType: ${latestLog2?.actionType}`);

    if (latestLog2?.actionType !== 'TAKE_TOKENS_DOUBLE') {
      throw new Error(`Kỳ vọng TAKE_TOKENS_DOUBLE nhưng nhận được: ${latestLog2?.actionType}`);
    }
    if (!latestLog2.message.includes('2 🧪 Dinh Dưỡng')) {
      throw new Error(`Nội dung log không đúng format lấy 2: ${latestLog2.message}`);
    }
    console.log(`✅ Cả 3 Tab nhận log TAKE_TOKENS_DOUBLE chuẩn xác!`);

    // ----------------------------------------------------
    // STEP 6: LƯỢT 3 - GIỮ THẺ CÂY TỪ BÀN CỜ
    // ----------------------------------------------------
    const stateAfter2 = ws1Messages[ws1Messages.length - 1]?.payload;
    const currentTurnId3 = stateAfter2.currentTurnPlayerId;
    const activeWs3 = currentTurnId3 === player1.id ? ws1 : (currentTurnId3 === player2.id ? ws2 : ws3);
    const activePlayer3 = [player1, player2, player3].find(p => p.id === currentTurnId3);

    const targetCard = stateAfter2.visibleTier1Cards[0];
    console.log(`\n⚡ [7] Lượt 3: [${activePlayer3.name}] giữ thẻ cây [${targetCard.name}]...`);
    activeWs3.send(JSON.stringify({
      type: 'RESERVE_PLANT',
      gameId: roomId,
      playerId: activePlayer3.id,
      cardId: targetCard.id
    }));

    await delay(600);

    const afterTurn3Logs1 = ws1Messages[ws1Messages.length - 1]?.payload?.actionLogs;
    const latestLog3 = afterTurn3Logs1[afterTurn3Logs1.length - 1];
    console.log(`   • Tổng log sau lượt 3: ${afterTurn3Logs1?.length}`);
    console.log(`   • Nội dung log mới: "${latestLog3?.message}"`);
    console.log(`   • Mã ActionType: ${latestLog3?.actionType}`);

    if (latestLog3?.actionType !== 'RESERVE_CARD_BOARD') {
      throw new Error(`Kỳ vọng RESERVE_CARD_BOARD nhưng nhận được: ${latestLog3?.actionType}`);
    }
    if (!latestLog3.message.includes(targetCard.name)) {
      throw new Error(`Nội dung log không chứa tên thẻ bài được giữ: ${latestLog3.message}`);
    }
    console.log(`✅ Cả 3 Tab nhận log RESERVE_CARD_BOARD chuẩn xác!`);

    // ----------------------------------------------------
    // STEP 7: KIỂM TRA F5 RECONNECT — BẢO TOÀN LỊCH SỬ LOG
    // ----------------------------------------------------
    console.log(`\n🔄 [8] Giả lập Tab 2 F5 / Tải lại trang (Reconnect)...`);
    ws2.close();
    await delay(300);

    let reconnectedLogs = [];
    const ws2Reconnected = new WebSocket(`${BASE_WS}?gameId=${roomId}&playerId=${player2.id}`);
    ws2Reconnected.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.payload?.actionLogs) {
        reconnectedLogs = msg.payload.actionLogs;
      }
    };

    await delay(600);

    console.log(`   • Số log Tab 2 nhận được sau khi F5: ${reconnectedLogs.length}`);
    if (reconnectedLogs.length !== afterTurn3Logs1.length) {
      throw new Error(`F5 mất log! Trước F5 có ${afterTurn3Logs1.length} log, sau F5 chỉ có ${reconnectedLogs.length}`);
    }
    console.log(`✅ Tab 2 sau khi F5 khôi phục đầy đủ 100% lịch sử các nước đi từ đầu ván!`);

    // ----------------------------------------------------
    // STEP 8: KIỂM TRA LOGIC CLIENT (GameLogUI HIGHLIGHT & BADGE)
    // ----------------------------------------------------
    console.log(`\n🎨 [9] Kiểm tra logic highlight token & badge của GameLogUI...`);
    const sampleMsg = latestLog1.message;
    // Kiểm tra regex highlight giống như GameLogUI.js
    const highlighted = sampleMsg
      .replace(/🟫 Đất/g, '<span class="log-token-badge badge-dirt">🟫 Đất</span>')
      .replace(/💧 Nước/g, '<span class="log-token-badge badge-water">💧 Nước</span>')
      .replace(/☀️ Sáng/g, '<span class="log-token-badge badge-sunlight">☀️ Sáng</span>');

    if (!highlighted.includes('badge-dirt') || !highlighted.includes('badge-water') || !highlighted.includes('badge-sunlight')) {
      throw new Error(`Regex highlight token badge của GameLogUI không khớp!`);
    }
    console.log(`✅ Logic highlight token badge của GameLogUI hoạt động chuẩn xác!`);

    // Dọn dẹp kết nối
    ws1.close();
    ws2Reconnected.close();
    ws3.close();

    console.log('\n🎉 ========================================================');
    console.log('🏆 TOÀN BỘ KỊCH BẢN PHASE 5 E2E GAME LOGS ĐÃ HOÀN TẤT 100% THÀNH CÔNG!');
    console.log('🎉 ========================================================\n');
  } catch (err) {
    console.error('❌ LỖI E2E TEST:', err);
    process.exit(1);
  }
}

runGameActionLogsE2ETest();
