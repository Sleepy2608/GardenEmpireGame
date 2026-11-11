/**
 * GARDEN EMPIRE - RULES & CODEX COMPONENT (RulesUI.js)
 * Design System: Deep Forest Botanical Glassmorphism
 * Adheres strictly to design-taste-frontend: No AI-slop, no em-dashes, rich botanical data
 */

export class RulesUI {
  /**
   * Tạo chuỗi HTML hoàn chỉnh cho Cẩm Nang Luật Chơi
   * @param {Object} options
   * @param {boolean} options.isModal - Nếu true, render thêm nút đóng modal
   * @param {string} options.prefixId - Tiền tố id để phân biệt inline vs modal
   */
  static getRulesTemplate({ isModal = false, prefixId = 'codex' } = {}) {
    const closeBtnHtml = isModal
      ? `<button type="button" class="codex-close-btn" id="${prefixId}-btn-close" aria-label="Đóng cẩm nang" title="Đóng (Esc)">✕</button>`
      : '';

    return `
      <div class="codex-wrapper" id="${prefixId}-wrapper">
        <!-- Header -->
        <header class="codex-header">
          <div class="codex-title-wrap">
            <div class="codex-emblem" aria-hidden="true">📖</div>
            <div>
              <h2 class="codex-heading">CẨM NANG NGHỆ NHÂN SINH THÁI</h2>
              <p class="codex-subheading">Luật chơi cốt lõi, chiến thuật tài nguyên và cơ chế tranh danh tiếng</p>
            </div>
          </div>
          ${closeBtnHtml}
        </header>

        <!-- Tab Bar -->
        <nav class="codex-tabs-bar" role="tablist" aria-label="Danh mục cẩm nang luật">
          <button type="button" class="codex-tab-btn active" role="tab" id="${prefixId}-tab-btn-overview" aria-selected="true" aria-controls="${prefixId}-panel-overview" data-tab="overview">
            <span class="tab-icon">🌿</span> <span>Giới Thiệu</span>
          </button>
          <button type="button" class="codex-tab-btn" role="tab" id="${prefixId}-tab-btn-energies" aria-selected="false" aria-controls="${prefixId}-panel-energies" data-tab="energies">
            <span class="tab-icon">💎</span> <span>6 Nguồn Năng Lượng</span>
          </button>
          <button type="button" class="codex-tab-btn" role="tab" id="${prefixId}-tab-btn-actions" aria-selected="false" aria-controls="${prefixId}-panel-actions" data-tab="actions">
            <span class="tab-icon">⚡</span> <span>3 Hành Động Trong Lượt</span>
          </button>
          <button type="button" class="codex-tab-btn" role="tab" id="${prefixId}-tab-btn-tiers" aria-selected="false" aria-controls="${prefixId}-panel-tiers" data-tab="tiers">
            <span class="tab-icon">🌳</span> <span>Chợ Cây 3 Cấp Độ</span>
          </button>
          <button type="button" class="codex-tab-btn" role="tab" id="${prefixId}-tab-btn-endgame" aria-selected="false" aria-controls="${prefixId}-panel-endgame" data-tab="endgame">
            <span class="tab-icon">🏆</span> <span>Khách Quý & Chung Kết 15★</span>
          </button>
        </nav>

        <!-- Body with 5 Panels -->
        <div class="codex-content-body">
          
          <!-- PANEL 1: TỔNG QUAN & MỤC TIÊU -->
          <div class="codex-panel active" id="${prefixId}-panel-overview" role="tabpanel" aria-labelledby="${prefixId}-tab-btn-overview">
            <p class="codex-lead">
              <strong>Garden Empire</strong> đưa bạn vào vai các nghệ nhân thực vật học tài hoa, cạnh tranh kiến tạo khu vườn thượng uyển tráng lệ nhất vương quốc. Trò chơi lấy cảm hứng từ kiệt tác chiến thuật Splendor, kết hợp chủ đề nuôi dưỡng sinh thái và tối ưu hóa tài nguyên thời gian thực.
            </p>

            <div class="overview-grid">
              <div class="overview-stat-card">
                <div class="stat-badge">👥</div>
                <div class="stat-label">Số Lượng Người Chơi</div>
                <p class="stat-desc">Hỗ trợ 2 đến 4 người chơi trong một phòng đấu đồng bộ thời gian thực qua WebSocket độ trễ thấp.</p>
              </div>

              <div class="overview-stat-card highlight">
                <div class="stat-badge">⭐</div>
                <div class="stat-label">Cột Mốc 15 Điểm Uy Tín</div>
                <p class="stat-desc">Khi có nghệ nhân chạm mốc 15 điểm uy tín (★), Vòng Chung Kết sẽ lập tức được kích hoạt để tìm ra người chiến thắng.</p>
              </div>

              <div class="overview-stat-card">
                <div class="stat-badge">🔄</div>
                <div class="stat-label">Lượt Đi Cân Bằng</div>
                <p class="stat-desc">Vòng chung kết tiếp tục đến người chơi cuối cùng của chu kỳ, bảo đảm mọi người chơi đều có số lượt đi ngang nhau.</p>
              </div>

              <div class="overview-stat-card">
                <div class="stat-badge">🏛️</div>
                <div class="stat-label">Bàn Cờ Tabletop 3D</div>
                <p class="stat-desc">Không gian chiếu cờ 3D sống động ở trung tâm, các đối thủ ngồi bao quanh bàn cờ và co giãn tự động theo kích thước màn hình.</p>
              </div>
            </div>
          </div>

          <!-- PANEL 2: 6 NGUỒN NĂNG LƯỢNG -->
          <div class="codex-panel" id="${prefixId}-panel-energies" role="tabpanel" aria-labelledby="${prefixId}-tab-btn-energies">
            <p class="codex-lead">
              Khu vườn vận hành dựa trên 5 loại năng lượng sinh thái tự nhiên và 1 loại phân bón đa năng vạn năng (WILD). Mỗi loại đóng vai trò là đồng tiền thanh toán để gieo trồng các giống cây tương ứng.
            </p>

            <div class="energies-bento">
              <div class="energy-chip-card">
                <div class="energy-gem gem-dirt">🟫</div>
                <div class="energy-info">
                  <div class="energy-name">Đất Màu Mỡ (Earth / Dirt)</div>
                  <p class="energy-desc">Phù sa giàu chất khoáng, làm nền tảng nuôi dưỡng rễ cây bám sâu và bền vững.</p>
                </div>
              </div>

              <div class="energy-chip-card">
                <div class="energy-gem gem-water">💧</div>
                <div class="energy-info">
                  <div class="energy-name">Nguồn Nước (Water)</div>
                  <p class="energy-desc">Dòng nước tưới tiêu trong lành duy trì dòng chảy sinh khí và độ ẩm vườn cây.</p>
                </div>
              </div>

              <div class="energy-chip-card">
                <div class="energy-gem gem-sunlight">☀️</div>
                <div class="energy-info">
                  <div class="energy-name">Ánh Sáng (Sunlight)</div>
                  <p class="energy-desc">Năng lượng quang hợp ấm áp giúp tán lá vươn cao đón ánh ban mai.</p>
                </div>
              </div>

              <div class="energy-chip-card">
                <div class="energy-gem gem-seed">🌰</div>
                <div class="energy-info">
                  <div class="energy-name">Hạt Giống (Seed)</div>
                  <p class="energy-desc">Mầm sống thuần khiết bắt đầu chu trình sinh sôi nảy nở của mọi loài thực vật.</p>
                </div>
              </div>

              <div class="energy-chip-card">
                <div class="energy-gem gem-nutrients">🧪</div>
                <div class="energy-info">
                  <div class="energy-name">Dinh Dưỡng (Nutrient)</div>
                  <p class="energy-desc">Khoáng chất vi lượng tối ưu hóa tốc độ sinh trưởng và sức đề kháng.</p>
                </div>
              </div>

              <div class="energy-chip-card wild">
                <div class="energy-gem gem-wild">⭐</div>
                <div class="energy-info">
                  <div class="energy-name">Phân Bón Vàng (Wild Gold)</div>
                  <p class="energy-desc">Năng lượng vạn năng thay thế cho bất kỳ tài nguyên nào bị thiếu khi mua cây trồng!</p>
                </div>
              </div>
            </div>

            <div class="codex-card-title">⚖️ Thiết Lập Ngân Hàng Năng Lượng Theo Số Người Chơi</div>
            <table class="bank-setup-table">
              <thead>
                <tr>
                  <th>Số Người Chơi</th>
                  <th>Mỗi Loại Token Thường</th>
                  <th>Phân Bón Vàng (WILD ⭐)</th>
                  <th>Tổng Số Token Cả Bàn</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>2 Người Chơi</strong></td>
                  <td>4 viên (tổng 20)</td>
                  <td>5 viên</td>
                  <td>25 viên</td>
                </tr>
                <tr>
                  <td><strong>3 Người Chơi</strong></td>
                  <td>5 viên (tổng 25)</td>
                  <td>5 viên</td>
                  <td>30 viên</td>
                </tr>
                <tr>
                  <td><strong>4 Người Chơi</strong></td>
                  <td>7 viên (tổng 35)</td>
                  <td>5 viên</td>
                  <td>40 viên</td>
                </tr>
              </tbody>
            </table>

            <div class="action-note-pill" style="margin-top: 1rem;">
              ⚠️ Giới hạn cầm tay: Mỗi người chơi chỉ được giữ tối đa 10 token trên tay. Nếu cuối lượt vượt quá 10, bạn bắt buộc phải trả lại ngân hàng các viên thừa tùy chọn.
            </div>
          </div>

          <!-- PANEL 3: 3 HÀNH ĐỘNG TRONG LƯỢT -->
          <div class="codex-panel" id="${prefixId}-panel-actions" role="tabpanel" aria-labelledby="${prefixId}-tab-btn-actions">
            <p class="codex-lead">
              Khi đến lượt đi của bạn, bạn được chọn thực hiện <strong>duy nhất 1 trong 3 hành động</strong> dưới đây:
            </p>

            <div class="action-cards-stack">
              <!-- Action 1 -->
              <div class="action-spec-card action-1">
                <div class="action-header-row">
                  <h3 class="codex-card-title" style="margin: 0;">1. Thu Thập Năng Lượng Từ Ngân Hàng</h3>
                  <span class="action-badge">Bốc Token</span>
                </div>
                <ul class="action-bullets">
                  <li><strong>Cách A:</strong> Lấy <strong>3 viên token khác màu nhau</strong> trong 5 loại token thường.</li>
                  <li><strong>Cách B:</strong> Lấy <strong>2 viên token cùng màu</strong> (hành động này chỉ hợp lệ khi chồng màu đó trong ngân hàng còn từ <strong>4 viên trở lên</strong>).</li>
                </ul>
                <div class="action-note-pill">
                  🚫 Nghiêm cấm bốc trực tiếp Phân Bón Vàng (⭐) bằng hành động này.
                </div>
              </div>

              <!-- Action 2 -->
              <div class="action-spec-card action-2">
                <div class="action-header-row">
                  <h3 class="codex-card-title" style="margin: 0;">2. Mua Và Gieo Trồng Thẻ Cây (Plant Card)</h3>
                  <span class="action-badge">Mua Cây</span>
                </div>
                <ul class="action-bullets">
                  <li>Chọn 1 thẻ cây đang mở ngửa trên bàn (trong 4 thẻ hiển thị ở mỗi Tier) hoặc 1 thẻ đang trong khay giữ chỗ cá nhân của bạn.</li>
                  <li>Trả số lượng token tương ứng trên thẻ sau khi đã <strong>trừ đi mức giảm giá vĩnh viễn</strong> từ các cây đã trồng trước đó.</li>
                  <li>Nếu thiếu tài nguyên, bạn có thể bù đắp bằng các viên <strong>Phân Bón Vàng (⭐)</strong> đang có.</li>
                  <li>Cây được đưa vào khu vườn: bạn nhận điểm uy tín (★) và nhận thêm 1 biểu tượng giảm giá vĩnh viễn mới! Thẻ bài mới trên xấp bài sẽ ngay lập tức được lật lên lấp vào chỗ trống.</li>
                </ul>
              </div>

              <!-- Action 3 -->
              <div class="action-spec-card action-3">
                <div class="action-header-row">
                  <h3 class="codex-card-title" style="margin: 0;">3. Đặt Chỗ Thẻ Cây (Reserve Card)</h3>
                  <span class="action-badge">Giữ Bài</span>
                </div>
                <ul class="action-bullets">
                  <li>Giữ 1 thẻ cây đang mở trên bàn hoặc rút úp bí mật thẻ trên cùng của bất kỳ xấp bài nào (Tier 1, 2 hoặc 3) vào khay bài giữ của bạn.</li>
                  <li>Nhận ngay <strong>1 viên Phân Bón Vàng (WILD ⭐)</strong> từ ngân hàng (nếu ngân hàng còn). Nếu ngân hàng đã hết vàng, bạn vẫn được quyền giữ thẻ nhưng không nhận được vàng.</li>
                  <li>Hành động này giúp bạn khóa chặt thẻ cây giá trị không để đối thủ mua trước, đồng thời tích lũy phân bón vạn năng.</li>
                </ul>
                <div class="action-note-pill">
                  📑 Giới hạn giữ bài: Bạn chỉ được giữ tối đa 3 thẻ trên tay cùng một lúc. Khi đã có đủ 3 thẻ giữ, bạn không thể chọn hành động này.
                </div>
              </div>
            </div>
          </div>

          <!-- PANEL 4: CHỢ CÂY 3 CẤP ĐỘ -->
          <div class="codex-panel" id="${prefixId}-panel-tiers" role="tabpanel" aria-labelledby="${prefixId}-tab-btn-tiers">
            <p class="codex-lead">
              Chợ Cây bao gồm <strong>90 loài thực vật độc bản</strong> được phân thành 3 tầng sinh thái rõ rệt. Mỗi tầng đòi hỏi nguồn lực chăm sóc và mang lại giá trị danh tiếng khác nhau:
            </p>

            <div class="tiers-showcase-grid">
              <div class="tier-detail-card tier-1">
                <span class="tier-tag">TIER 1 (MẦM NON)</span>
                <h3 class="tier-name">Mầm Non & Thảo Mộc</h3>
                <div class="tier-spec-row">
                  <span>Tổng số lượng thẻ:</span>
                  <strong>40 Thẻ</strong>
                </div>
                <div class="tier-spec-row">
                  <span>Chi phí thanh toán:</span>
                  <strong>3 - 5 Token</strong>
                </div>
                <div class="tier-spec-row">
                  <span>Điểm uy tín:</span>
                  <strong>0 - 1 Điểm ★</strong>
                </div>
                <p class="stat-desc">Dây leo, thảo dược, rêu phong và mầm lá nhỏ. Chi phí rất rẻ, là nền móng cốt lõi để xây dựng dàn giảm giá vĩnh viễn đầu trận.</p>
              </div>

              <div class="tier-detail-card tier-2">
                <span class="tier-tag">TIER 2 (CÂY HOA)</span>
                <h3 class="tier-name">Cây Hoa & Bụi Quý</h3>
                <div class="tier-spec-row">
                  <span>Tổng số lượng thẻ:</span>
                  <strong>30 Thẻ</strong>
                </div>
                <div class="tier-spec-row">
                  <span>Chi phí thanh toán:</span>
                  <strong>5 - 8 Token</strong>
                </div>
                <div class="tier-spec-row">
                  <span>Điểm uy tín:</span>
                  <strong>1 - 3 Điểm ★</strong>
                </div>
                <p class="stat-desc">Hoa hồng, hoa sen, dương xỉ cổ và cây bụi hoa thơm ngát. Bước đệm chiến lược quan trọng kết hợp giữa điểm số và giảm giá cao cấp.</p>
              </div>

              <div class="tier-detail-card tier-3">
                <span class="tier-tag">TIER 3 (CỔ THỤ)</span>
                <h3 class="tier-name">Cổ Thụ Đại Ngàn</h3>
                <div class="tier-spec-row">
                  <span>Tổng số lượng thẻ:</span>
                  <strong>20 Thẻ</strong>
                </div>
                <div class="tier-spec-row">
                  <span>Chi phí thanh toán:</span>
                  <strong>7 - 14 Token</strong>
                </div>
                <div class="tier-spec-row">
                  <span>Điểm uy tín:</span>
                  <strong>3 - 5 Điểm ★</strong>
                </div>
                <p class="stat-desc">Baobab, cự sam Sequoia, sồi ngàn năm và rừng ngập mặn. Đòi hỏi nguồn tích lũy giảm giá khổng lồ, là đòn quyết định chạm đích 15★.</p>
              </div>
            </div>

            <div class="engine-callout-box">
              <div class="callout-icon">💡</div>
              <div class="callout-text">
                <h4>Cơ Chế Giảm Giá Vĩnh Viễn (Engine Building)</h4>
                <p>
                  Mỗi thẻ cây sau khi trồng sẽ cấp cho bạn vĩnh viễn 1 biểu tượng năng lượng tương ứng. Khi mua các cây tiếp theo, bạn được trừ trực tiếp số biểu tượng này vào chi phí yêu cầu! Khi bạn đã tích lũy đủ nhiều cây, bạn có thể mua các thẻ cây đắt giá hoàn toàn <strong>miễn phí 0 token</strong>.
                </p>
              </div>
            </div>
          </div>

          <!-- PANEL 5: KHÁCH QUÝ & VÒNG CHUNG KẾT -->
          <div class="codex-panel" id="${prefixId}-panel-endgame" role="tabpanel" aria-labelledby="${prefixId}-tab-btn-endgame">
            <p class="codex-lead">
              Đỉnh cao của nghệ thuật làm vườn là thu hút các loài sinh vật quý tộc về trú ngụ và trở thành người đầu tiên đạt mốc 15 điểm uy tín danh giá.
            </p>

            <div class="endgame-split-grid">
              <div class="endgame-feature-card">
                <div class="stat-badge">🦋</div>
                <h3 class="codex-card-title">Khách Thăm Vườn (Garden Nobles)</h3>
                <ul class="action-bullets">
                  <li>Số lượng khách xuất hiện trên bàn luôn bằng <strong>Số người chơi + 1</strong> (2 người: 3 khách; 3 người: 4 khách; 4 người: 5 khách).</li>
                  <li>Mỗi vị khách mang lại cố định <strong>3 Điểm Uy Tín (★)</strong>.</li>
                  <li><strong>Tự động ghé thăm:</strong> Vào cuối lượt đi của bạn, nếu số thẻ cây bạn đã trồng thỏa mãn điều kiện giảm giá của vị khách nào, vị khách đó sẽ tự động bay về vườn của bạn (không tốn lượt).</li>
                  <li>Mỗi lượt đi chỉ được đón tối đa 1 vị khách. Khách đã về vườn không bao giờ bị cướp lại.</li>
                </ul>
              </div>

              <div class="endgame-feature-card victory">
                <div class="stat-badge">🏆</div>
                <h3 class="codex-card-title">Vòng Chung Kết & Tiebreaker</h3>
                <ul class="action-bullets">
                  <li>Ngay khi có người chơi tích lũy từ <strong>15 Điểm Uy Tín (★) trở lên</strong>, ván đấu bước vào chu kỳ lượt đi cuối cùng.</li>
                  <li>Tất cả người chơi sau đó trong vòng đều được thực hiện lượt đi cuối cùng để bảo đảm công bằng.</li>
                  <li>Người có tổng điểm uy tín cao nhất khi hết vòng là <strong>Quán Quân</strong>!</li>
                </ul>
                <div class="tiebreaker-box">
                  <strong>⚖️ Luật Hòa Điểm (Tiebreaker):</strong> Nếu có từ 2 người chơi trở lên bằng điểm uy tín nhau, người <strong>trồng ít thẻ cây hơn</strong> (tối ưu hóa tài nguyên xuất sắc hơn) sẽ giành chiến thắng chung cuộc!
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    `;
  }

  /**
   * Kích hoạt chuyển tab trên một container cụ thể
   * @param {HTMLElement|string} container - Element hoặc selector chứa cẩm nang
   */
  static initTabs(container) {
    const root = typeof container === 'string' ? document.querySelector(container) : container;
    if (!root) return;

    const tabButtons = root.querySelectorAll('.codex-tab-btn');
    const panels = root.querySelectorAll('.codex-panel');

    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.dataset.tab;

        // Cập nhật trạng thái nút tab
        tabButtons.forEach(b => {
          const isCurrent = b === btn;
          b.classList.toggle('active', isCurrent);
          b.setAttribute('aria-selected', isCurrent ? 'true' : 'false');
        });

        // Chuyển panel nội dung
        panels.forEach(p => {
          const isTarget = p.id.endsWith(`panel-${targetTab}`);
          p.classList.toggle('active', isTarget);
        });
      });

      // Hỗ trợ phím mũi tên trái / phải
      btn.addEventListener('keydown', (e) => {
        let targetBtn = null;
        if (e.key === 'ArrowRight') {
          targetBtn = btn.nextElementSibling || tabButtons[0];
        } else if (e.key === 'ArrowLeft') {
          targetBtn = btn.previousElementSibling || tabButtons[tabButtons.length - 1];
        }

        if (targetBtn && targetBtn.classList.contains('codex-tab-btn')) {
          e.preventDefault();
          targetBtn.focus();
          targetBtn.click();
        }
      });
    });
  }

  /**
   * Khởi tạo và gắn Modal Luật Chơi vào body của trang (dùng cho Sảnh Chờ hoặc Dashboard)
   * @param {Object} options
   * @param {string} options.modalId - Id của modal overlay
   * @param {string} options.openTriggerSelector - Selector của nút bấm mở modal
   */
  static setupModal({ modalId = 'rules-modal', openTriggerSelector = '#btn-open-rules' } = {}) {
    let modalOverlay = document.getElementById(modalId);

    // Nếu modal chưa có trong DOM, tự động tạo mới
    if (!modalOverlay) {
      modalOverlay = document.createElement('div');
      modalOverlay.id = modalId;
      modalOverlay.className = 'codex-modal-overlay';
      modalOverlay.setAttribute('role', 'dialog');
      modalOverlay.setAttribute('aria-modal', 'true');
      modalOverlay.setAttribute('aria-label', 'Cẩm nang luật chơi Garden Empire');

      const dialogWrapper = document.createElement('div');
      dialogWrapper.className = 'codex-modal-dialog';
      dialogWrapper.innerHTML = RulesUI.getRulesTemplate({ isModal: true, prefixId: 'modal-codex' });
      modalOverlay.appendChild(dialogWrapper);
      document.body.appendChild(modalOverlay);

      // Kích hoạt tabs trong modal
      RulesUI.initTabs(dialogWrapper);

      // Nút đóng modal bên trong
      const closeBtn = dialogWrapper.querySelector('#modal-codex-btn-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => RulesUI.closeModal(modalId));
      }

      // Đóng khi click ngoài backdrop
      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
          RulesUI.closeModal(modalId);
        }
      });

      // Đóng bằng phím Esc
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
          RulesUI.closeModal(modalId);
        }
      });
    }

    // Gắn sự kiện mở cho các trigger nút bấm
    if (openTriggerSelector) {
      const triggers = document.querySelectorAll(openTriggerSelector);
      triggers.forEach(trig => {
        trig.addEventListener('click', (e) => {
          e.preventDefault();
          RulesUI.openModal(modalId);
        });
      });
    }

    return modalOverlay;
  }

  /**
   * Mở modal luật chơi
   */
  static openModal(modalId = 'rules-modal') {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';

      // Focus vào nút tab đầu tiên để trợ năng
      const firstTab = modal.querySelector('.codex-tab-btn.active') || modal.querySelector('.codex-tab-btn');
      if (firstTab) firstTab.focus();
    }
  }

  /**
   * Đóng modal luật chơi
   */
  static closeModal(modalId = 'rules-modal') {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }
}

