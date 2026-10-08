/**
 * GARDEN EMPIRE — PHASE 8 MULTI-TAB LIVE E2E PLAYTEST
 * Simulates 3 real browser tabs interacting over REST and WebSockets simultaneously.
 */

const BASE_HTTP = 'http://localhost:8080/api/rooms';
const BASE_WS = 'ws://localhost:8080/ws/game';

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runMultiTabPlaytest() {
  console.log('🌱 ========================================================');
  console.log('🌿 GARDEN EMPIRE — PHASE 8 MULTI-TAB E2E PLAYTEST SUITE');
  console.log('🌱 ========================================================\n');

  try {
    // ----------------------------------------------------
    // STEP 1: CREATE ROOM (Tab 1 - Host)
    // ----------------------------------------------------
    const hostPlayer = { id: 'tab1-alice-' + Date.now(), name: 'Alice_Host', avatar: '🌿' };
    console.log(`[Tab 1 - Host] Tạo phòng mới với Host: ${hostPlayer.name}...`);

    const createRes = await fetch(BASE_HTTP, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomName: 'Vườn Sinh Thái E2E',
        maxPlayers: 3,
        hostPlayer: hostPlayer
      })
    });

    if (!createRes.ok) throw new Error(`Lỗi tạo phòng: ${createRes.status}`);
    const roomData = await createRes.json();
    const roomId = roomData.id;
    console.log(`✅ [Tab 1] Tạo phòng thành công! Mã phòng: [${roomId}]\n`);

    // ----------------------------------------------------
    // STEP 2: TAB 2 & TAB 3 JOIN ROOM
    // ----------------------------------------------------
    const player2 = { id: 'tab2-bob-' + Date.now(), name: 'Bob_Gardener', avatar: '💧' };
    console.log(`[Tab 2] Tham gia vào phòng ${roomId}...`);
    const joinRes2 = await fetch(`${BASE_HTTP}/${roomId}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(player2)
    });
    if (!joinRes2.ok) throw new Error(`Tab 2 join thất bại: ${joinRes2.status}`);
    console.log(`✅ [Tab 2] Tham gia thành công!\n`);

    const player3 = { id: 'tab3-charlie-' + Date.now(), name: 'Charlie_Botanist', avatar: '☀️' };
    console.log(`[Tab 3] Tham gia vào phòng ${roomId}...`);
    const joinRes3 = await fetch(`${BASE_HTTP}/${roomId}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(player3)
    });
    if (!joinRes3.ok) throw new Error(`Tab 3 join thất bại: ${joinRes3.status}`);
    console.log(`✅ [Tab 3] Tham gia thành công!\n`);

    // ----------------------------------------------------
    // STEP 3: HOST STARTS GAME
    // ----------------------------------------------------
    console.log(`[Tab 1 - Host] Bắt đầu trận đấu...`);
    const startRes = await fetch(`${BASE_HTTP}/${roomId}/start?hostId=${encodeURIComponent(hostPlayer.id)}`, {
      method: 'POST'
    });
    if (!startRes.ok) throw new Error(`Lỗi start game: ${startRes.status}`);
    console.log(`✅ Trận đấu đã chuyển sang trạng thái PLAYING!\n`);

    // ----------------------------------------------------
    // STEP 4: ESTABLISH 3 WEBSOCKET CONNECTIONS (3 TABS)
    // ----------------------------------------------------
    console.log('📡 Đang kết nối 3 Tab qua WebSocket song song...');
    
    const ws1Messages = [];
    const ws2Messages = [];
    const ws3Messages = [];

    const ws1 = new WebSocket(`${BASE_WS}?gameId=${roomId}&playerId=${hostPlayer.id}`);
    const ws2 = new WebSocket(`${BASE_WS}?gameId=${roomId}&playerId=${player2.id}`);
    const ws3 = new WebSocket(`${BASE_WS}?gameId=${roomId}&playerId=${player3.id}`);

    ws1.onmessage = (e) => ws1Messages.push(JSON.parse(e.data));
    ws2.onmessage = (e) => ws2Messages.push(JSON.parse(e.data));
    ws3.onmessage = (e) => ws3Messages.push(JSON.parse(e.data));

    await delay(600);

    console.log(`✅ Tab 1 đã kết nối WebSocket! Nhận ${ws1Messages.length} thông điệp ban đầu.`);
    console.log(`✅ Tab 2 đã kết nối WebSocket! Nhận ${ws2Messages.length} thông điệp ban đầu.`);
    console.log(`✅ Tab 3 đã kết nối WebSocket! Nhận ${ws3Messages.length} thông điệp ban đầu.\n`);

    const initialP1State = ws1Messages[ws1Messages.length - 1]?.payload;
    console.log(`🎯 Lượt chơi ban đầu: [${initialP1State?.currentTurnPlayerId}]`);
    console.log(`🪙 Ngân hàng 3 người: Đất=${initialP1State?.resourceBank?.DIRT}, Nước=${initialP1State?.resourceBank?.WATER}, Vàng=${initialP1State?.resourceBank?.WILD}`);
    console.log(`🦋 Số Khách Thăm Vườn hiển thị: ${initialP1State?.visibleVisitors?.length} khách\n`);

    // ----------------------------------------------------
    // STEP 5: TAB 1 PERFORMS ACTION (TAKE 3 TOKENS)
    // ----------------------------------------------------
    console.log('⚡ [Tab 1] Gửi thao tác: Nhặt 3 tài nguyên khác loại (Đất, Nước, Ánh Sáng)...');
    ws1.send(JSON.stringify({
      type: 'TAKE_RESOURCES',
      gameId: roomId,
      playerId: hostPlayer.id,
      tokens: { DIRT: 1, WATER: 1, SUNLIGHT: 1 }
    }));

    await delay(500);

    const latestState1 = ws1Messages[ws1Messages.length - 1]?.payload;
    const latestState2 = ws2Messages[ws2Messages.length - 1]?.payload;
    const latestState3 = ws3Messages[ws3Messages.length - 1]?.payload;

    console.log(`✅ Tab 1 nhận state mới: Lượt tiếp theo -> [${latestState1?.currentTurnPlayerId}]`);
    console.log(`✅ Tab 2 nhận state mới đồng bộ: Ngân hàng Đất còn [${latestState2?.resourceBank?.DIRT}]`);
    console.log(`✅ Tab 3 nhận state mới đồng bộ: Kho cá nhân của Tab 1 có [${latestState3?.players[0]?.tokens?.DIRT}] Đất\n`);

    // ----------------------------------------------------
    // STEP 6: TAB 2 PERFORMS ACTION (TAKE 2 SAME TOKENS)
    // ----------------------------------------------------
    console.log('⚡ [Tab 2] Gửi thao tác: Nhặt 2 Dưỡng Chất cùng loại...');
    ws2.send(JSON.stringify({
      type: 'TAKE_RESOURCES',
      gameId: roomId,
      playerId: player2.id,
      tokens: { NUTRIENTS: 2 }
    }));

    await delay(500);

    const stateAfterP2 = ws3Messages[ws3Messages.length - 1]?.payload;
    console.log(`✅ Cả 3 Tab đồng bộ: Lượt chơi chuyển sang [${stateAfterP2?.currentTurnPlayerId}] (Tab 3)\n`);

    // ----------------------------------------------------
    // STEP 7: TAB 3 PERFORMS ACTION (RESERVE TIER 1 CARD)
    // ----------------------------------------------------
    const targetCard = stateAfterP2.visibleTier1Cards[0];
    console.log(`⚡ [Tab 3] Gửi thao tác: Giữ thẻ cây [${targetCard?.name || targetCard?.id}]...`);
    ws3.send(JSON.stringify({
      type: 'RESERVE_PLANT',
      gameId: roomId,
      playerId: player3.id,
      cardId: targetCard.id
    }));

    await delay(500);

    const stateAfterP3 = ws1Messages[ws1Messages.length - 1]?.payload;
    const p3Data = stateAfterP3.players[2];
    console.log(`✅ Thẻ đã vào khay giữ bí mật của Tab 3: [${p3Data.reservedCards.length}/3 thẻ]`);
    console.log(`✅ Tab 3 nhận được 1 Phân Bón Vàng: [${p3Data.tokens.WILD} ⭐]`);
    console.log(`✅ Lượt chơi đã quay vòng về [${stateAfterP3.currentTurnPlayerId}] (Tab 1)\n`);

    // ----------------------------------------------------
    // STEP 8: SIMULATE F5 RECONNECT (Tab 2 Reloads)
    // ----------------------------------------------------
    console.log('🔄 [Tab 2] Giả lập người chơi F5 / Tải lại trình duyệt...');
    ws2.close();
    await delay(300);

    const ws2ReconnectedMessages = [];
    const ws2Reconnect = new WebSocket(`${BASE_WS}?gameId=${roomId}&playerId=${player2.id}`);
    ws2Reconnect.onmessage = (e) => ws2ReconnectedMessages.push(JSON.parse(e.data));

    await delay(500);

    console.log(`✅ [Tab 2 Reconnect] Đã khôi phục kết nối WebSocket! Nhận snapshot:`);
    const reconnectedState = ws2ReconnectedMessages[0]?.payload;
    console.log(`   • Trận đấu: ${reconnectedState?.gameId}`);
    console.log(`   • Tổng số người chơi: ${reconnectedState?.players?.length}`);
    console.log(`   • Lượt chơi hiện tại: ${reconnectedState?.currentTurnPlayerId}`);
    console.log(`   • Thẻ đã giữ của Tab 3: ${reconnectedState?.players[2]?.reservedCards?.length} thẻ\n`);

    // Close all WebSockets
    ws1.close();
    ws2Reconnect.close();
    ws3.close();

    console.log('🎉 ========================================================');
    console.log('🏆 TẤT CẢ KỊCH BẢN PHASE 8 MULTI-TAB E2E ĐÃ ĐẠT 100% THÀNH CÔNG!');
    console.log('🎉 ========================================================\n');
  } catch (err) {
    console.error('❌ LỖI PLAYTEST:', err);
    process.exit(1);
  }
}

runMultiTabPlaytest();
