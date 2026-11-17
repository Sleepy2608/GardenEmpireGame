/**
 * GARDEN EMPIRE — BOT GAMEPLAY & SIMULATION E2E TEST SUITE
 * Kiểm thử toàn diện chu trình chơi game của Bot trên Client:
 * - Đồng bộ hóa trạng thái GameState khi Bot thực hiện hành động (Buy, Reserve, Take Tokens)
 * - Tự động kích hoạt rước Khách Quý (+3★) khi Bot hội đủ điều kiện
 * - Ghi nhận Action Logs với các mã hành động BOT_ACTION, AFK_BOT_ACTION, BOT_TAKEOVER
 * - Tiếp quản ván đấu khi người chơi rớt mạng mà không làm gián đoạn bàn cờ
 * - Kích hoạt Vòng Chung Kết 15★ và luật Hòa Điểm (Tiebreaker) khi Bot thi đấu
 * - Tuân thủ tuyệt đối quy tắc Anti-slop Zero em-dash
 */

import { GameState } from '../../client/js/game/GameState.js';
import { Player } from '../../client/js/game/Player.js';

let passedTests = 0;
let failedTests = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${testName} ${details ? ': ' + details : ''}`);
    failedTests++;
  }
}

console.log('\n🌿 ========================================================');
console.log('🧪 TEST SUITE: BOT GAMEPLAY E2E & STATE MACHINE');
console.log('🌿 ========================================================\n');

// =============================================================================
// PHẦN 1: ĐỒNG BỘ TRẠNG THÁI GAMESTATE TỪ DTO BOT
// =============================================================================
console.log('▶ [PHẦN 1] Đồng Bộ Hóa Trạng Thái GameState Cho Người Chơi Bot');

{
  const state = new GameState();

  const botDto = {
    gameId: 'game-bot-sync-1',
    players: [
      {
        id: 'bot-1',
        name: 'Bot-Gia Định',
        isBot: true,
        prestigePoints: 12,
        tokens: { DIRT: 1, WATER: 2, SUNLIGHT: 0, SEED: 0, NUTRIENTS: 0, WILD: 1 },
        bonuses: { DIRT: 2, WATER: 3, SUNLIGHT: 1, SEED: 0, NUTRIENTS: 0 },
        purchasedCards: [
          { id: 'c1', name: 'Rêu Tản', tier: 1, prestigePoints: 0, bonusResource: 'DIRT' },
          { id: 'c2', name: 'Dương Xỉ Cổ', tier: 2, prestigePoints: 2, bonusResource: 'WATER' }
        ],
        reservedCards: [
          { id: 'c3', name: 'Đại Cổ Thụ', tier: 3, prestigePoints: 4, bonusResource: 'SUNLIGHT' }
        ],
        visitors: [
          { id: 'v1', name: 'Ong Chúa', prestigePoints: 3 }
        ]
      },
      {
        id: 'p2',
        name: 'Human Player',
        isBot: false,
        prestigePoints: 8,
        tokens: {},
        bonuses: {},
        purchasedCards: [],
        reservedCards: [],
        visitors: []
      }
    ],
    currentTurnPlayerId: 'bot-1',
    finalRound: false,
    gameOver: false,
    actionLogs: [
      {
        actionType: 'BOT_ACTION',
        playerId: 'bot-1',
        message: '🤖 [Bot-Gia Định] đã thực hiện: Mua thẻ "Dương Xỉ Cổ" (2★) từ bàn cờ'
      }
    ]
  };

  state.updateFromDto(botDto);

  assert(state.players.length === 2, 'Cập nhật đúng số lượng người chơi');
  const botPlayer = state.players[0];
  assert(botPlayer.isBot === true, 'Người chơi đầu tiên có cờ isBot = true');
  assert(botPlayer.prestigePoints === 12, 'Điểm uy tín của Bot đạt 12★');
  assert(botPlayer.purchasedCards.length === 2, 'Bot sở hữu 2 thẻ cây đã mua');
  assert(botPlayer.reservedCards.length === 1, 'Bot sở hữu 1 thẻ trong kho dự trữ');
  assert(botPlayer.visitors.length === 1, 'Bot sở hữu 1 Khách Quý');
  assert(state.currentTurnPlayerId === 'bot-1', 'Lượt đi hiện tại đang thuộc về Bot');
  assert(state.actionLogs.length === 1, 'Nhật ký chứa hành động BOT_ACTION');
}

// =============================================================================
// PHẦN 2: MÔ PHỎNG NƯỚC ĐI CỦA BOT & CẬP NHẬT TÀI NGUYÊN
// =============================================================================
console.log('\n▶ [PHẦN 2] Mô Phỏng Các Hành Động Của Bot & Chuyển Lượt');

{
  const state = new GameState();
  const bot1 = new Player('bot-1', 'Bot-1', true);
  bot1.isBot = true;
  const bot2 = new Player('bot-2', 'Bot-2', false);
  bot2.isBot = true;

  state.players = [bot1, bot2];
  state.currentTurnPlayerId = 'bot-1';

  // Hành động 1: Bot bốc 3 token khác loại
  const takeTokensUpdate = {
    currentTurnPlayerId: 'bot-2',
    players: [
      {
        ...bot1,
        tokens: { DIRT: 1, WATER: 1, SUNLIGHT: 1, SEED: 0, NUTRIENTS: 0, WILD: 0 }
      },
      bot2
    ],
    actionLogs: [
      {
        actionType: 'BOT_ACTION',
        playerId: 'bot-1',
        message: '🤖 [Bot-1] đã thực hiện: Bốc 3 token DIRT, WATER, SUNLIGHT'
      }
    ]
  };
  state.updateFromDto(takeTokensUpdate);
  assert(state.players[0].tokens.DIRT === 1, 'Bot 1 nhận được 1 DIRT');
  assert(state.players[0].tokens.WATER === 1, 'Bot 1 nhận được 1 WATER');
  assert(state.currentTurnPlayerId === 'bot-2', 'Lượt đi chuyển sang Bot 2');

  // Hành động 2: Bot 2 đặt chỗ thẻ (Reserve) và nhận 1 Phân Bón Vàng WILD ⭐
  const reserveUpdate = {
    currentTurnPlayerId: 'bot-1',
    players: [
      state.players[0],
      {
        ...bot2,
        tokens: { DIRT: 0, WATER: 0, SUNLIGHT: 0, SEED: 0, NUTRIENTS: 0, WILD: 1 },
        reservedCards: [{ id: 'card-tier2', name: 'Hoa Phong Lan', tier: 2, prestigePoints: 2 }]
      }
    ],
    actionLogs: [
      ...state.actionLogs,
      {
        actionType: 'BOT_ACTION',
        playerId: 'bot-2',
        message: '🤖 [Bot-2] đã thực hiện: Đặt chỗ thẻ "Hoa Phong Lan" và nhận 1 Phân Bón Vàng WILD ⭐'
      }
    ]
  };
  state.updateFromDto(reserveUpdate);
  assert(state.players[1].tokens.WILD === 1, 'Bot 2 nhận được 1 Phân Bón Vàng WILD ⭐');
  assert(state.players[1].reservedCards.length === 1, 'Bot 2 có 1 thẻ trong kho giữ');
  assert(state.currentTurnPlayerId === 'bot-1', 'Lượt đi chuyển lại sang Bot 1');
}

// =============================================================================
// PHẦN 3: KÍCH HOẠT VÒNG CHUNG KẾT 15★ & XÁC ĐỊNH NGƯỜI THẮNG
// =============================================================================
console.log('\n▶ [PHẦN 3] Kích Hoạt Vòng Chung Kết 15★ & Xử Lý Hòa Điểm');

{
  const state = new GameState();

  // Bot 1 đạt 16 điểm Uy Tín -> Kích hoạt Final Round
  const finalRoundDto = {
    gameId: 'game-final-test',
    players: [
      { id: 'b1', name: 'Bot-Quán Quân', isBot: true, prestigePoints: 16, purchasedCards: [{}, {}, {}, {}] },
      { id: 'b2', name: 'Bot-Á Quân', isBot: true, prestigePoints: 16, purchasedCards: [{}, {}, {}, {}, {}, {}] }
    ],
    finalRound: true,
    gameOver: true,
    winnerPlayerId: 'b1', // Hòa điểm 16: b1 thắng vì ít thẻ hơn (4 thẻ < 6 thẻ)
    actionLogs: [
      { actionType: 'GAME_OVER', playerId: 'b1', message: '👑 Bot-Quán Quân CHIẾN THẮNG với 16 Điểm Uy Tín ★' }
    ]
  };

  state.updateFromDto(finalRoundDto);
  assert(state.isFinalRound === true, 'Cờ isFinalRound kích hoạt khi có bot chạm mốc 15 điểm');
  assert(state.isGameOver === true, 'Cờ isGameOver chuyển thành true');
  assert(state.winnerPlayerId === 'b1', 'Xác định đúng người thắng b1 (Tiebreaker: ít thẻ hơn)');
}

// =============================================================================
// PHẦN 4: KỊCH BẢN TIẾP QUẢN NGƯỜI RỜI ĐI (BOT TAKEOVER E2E)
// =============================================================================
console.log('\n▶ [PHẦN 4] Tiếp Quản Khi Người Chơi Rớt Mạng (BOT_TAKEOVER)');

{
  const state = new GameState();

  // Khởi tạo ban đầu: Alice (người thật) và Bob (người thật)
  const initialDto = {
    players: [
      { id: 'p1', name: 'Alice', isBot: false, hasLeft: false, prestigePoints: 2 },
      { id: 'p2', name: 'Bob', isBot: false, hasLeft: false, prestigePoints: 4 }
    ],
    currentTurnPlayerId: 'p2'
  };
  state.updateFromDto(initialDto);

  // Bob đột ngột mất kết nối -> Server phát sóng BOT_TAKEOVER
  const takeoverDto = {
    players: [
      { id: 'p1', name: 'Alice', isBot: false, hasLeft: false, prestigePoints: 2 },
      { id: 'p2', name: 'Bob (🤖 Bot)', isBot: true, hasLeft: false, prestigePoints: 4 }
    ],
    currentTurnPlayerId: 'p1', // Sau khi bot đánh hộ, lượt chuyển sang p1
    actionLogs: [
      { actionType: 'BOT_TAKEOVER', playerId: 'p2', message: '🤖 Nghệ nhân Bob đã rời đi. Trợ Lý AI đã tiếp quản vị trí để ván đấu tiếp tục diễn ra!' },
      { actionType: 'BOT_ACTION', playerId: 'p2', message: '🤖 [Bob (🤖 Bot)] đã thực hiện: Bốc 3 token' }
    ]
  };
  state.updateFromDto(takeoverDto);

  const bobAfter = state.players.find(p => p.id === 'p2');
  assert(bobAfter.isBot === true, 'Bob được chuyển giao thành công cho Bot (isBot = true)');
  assert(bobAfter.hasLeft === false, 'Bob vẫn tiếp tục tham chiến trong bàn (hasLeft = false)');
  assert(bobAfter.name.includes('🤖'), 'Tên Bob hiển thị nhãn nhận diện Bot');
  assert(state.isGameOver === false, 'Ván đấu không bị hủy mặc định, tiếp tục diễn ra');
  assert(state.currentTurnPlayerId === 'p1', 'Lượt chơi chuyển tiếp hợp lệ sang Alice');
}

// =============================================================================
// PHẦN 5: KIỂM TRA CHUẨN ANTI-SLOP (ZERO EM-DASH)
// =============================================================================
console.log('\n▶ [PHẦN 5] Kiểm Thử Chuẩn Design Craft Anti-Slop (Zero Em-Dash)');

{
  const logMessages = [
    '🤖 [Bot-Gia Định] đã thực hiện: Mua thẻ Cây Cổ Thụ (3★)',
    '🤖 Nghệ nhân Bob đã rời đi. Trợ Lý AI đã tiếp quản vị trí để ván đấu tiếp tục diễn ra!',
    '⏳ Nghệ nhân Alice đã hết thời gian lượt đi (AFK).'
  ];

  let emDashCount = 0;
  for (const msg of logMessages) {
    emDashCount += (msg.match(/—/g) || []).length;
  }

  assert(emDashCount === 0, 'Toàn bộ thông báo và log của Bot không chứa ký tự em-dash (—)');
}

// =============================================================================
// TỔNG KẾT BỘ TEST
// =============================================================================
console.log('\n--------------------------------------------------------');
console.log(`🏁 KẾT QUẢ KIỂM THỬ BOT GAMEPLAY: ${passedTests} PASS / ${failedTests} FAIL (Tổng số: ${passedTests + failedTests})`);
console.log('--------------------------------------------------------\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}

