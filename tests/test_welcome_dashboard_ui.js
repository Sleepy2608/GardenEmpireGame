/**
 * GARDEN EMPIRE — WELCOME DASHBOARD UI TEST SUITE
 * Kiểm thử tự động trang Welcome Dashboard (welcome.html, welcome.css, welcome.js)
 * Áp dụng các tiêu chí từ skill design-taste-frontend, gpt-taste, charles-unslop, charles-polish
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

let passedTests = 0;
let failedTests = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${testName} ${details ? '— ' + details : ''}`);
    failedTests++;
  }
}

console.log('\n🌿 ========================================================');
console.log('🧪 TEST SUITE: WELCOME DASHBOARD UI & DESIGN CRAFT');
console.log('🌿 ========================================================\n');

// 1. Kiểm tra sự tồn tại của các file cấu thành
console.log('▶ [PHẦN 1] Tính Toàn Vẹn Của Các Tệp Mã Nguồn');
const welcomeHtmlPath = path.join(rootDir, 'client', 'welcome.html');
const welcomeCssPath = path.join(rootDir, 'client', 'css', 'welcome.css');
const welcomeJsPath = path.join(rootDir, 'client', 'js', 'welcome.js');

assert(fs.existsSync(welcomeHtmlPath), 'Tệp client/welcome.html phải tồn tại');
assert(fs.existsSync(welcomeCssPath), 'Tệp client/css/welcome.css phải tồn tại');
assert(fs.existsSync(welcomeJsPath), 'Tệp client/js/welcome.js phải tồn tại');

const htmlContent = fs.readFileSync(welcomeHtmlPath, 'utf8');
const cssContent = fs.readFileSync(welcomeCssPath, 'utf8');
const jsContent = fs.readFileSync(welcomeJsPath, 'utf8');

// 2. Kiểm tra các quy tắc cốt lõi từ skill gpt-taste
console.log('\n▶ [PHẦN 2] Chuẩn Mực AIDA & Thiết Kế Cao Cấp (gpt-taste)');

// 2.1. Iron Rule: H1 không quá dài, container rộng
assert(htmlContent.includes('hero-headline-wide'), 'Tiêu đề Hero H1 sử dụng container rộng hero-headline-wide');
assert(cssContent.includes('clamp('), 'H1 sử dụng clamp() để co giãn font chữ linh hoạt chống gãy 4-6 dòng');

// 2.2. Nút Bắt Đầu Chơi liên kết sang index.html
assert(htmlContent.includes('href="index.html"'), 'Có nút CTA liên kết trực tiếp sang giao diện index.html');
assert(htmlContent.includes('id="hero-btn-start"'), 'Nút Hero CTA chính có id="hero-btn-start"');
assert(htmlContent.includes('id="footer-btn-enter"'), 'Nút Footer Grand Portal có id="footer-btn-enter"');

// 2.3. Gapless Bento Grid
assert(cssContent.includes('grid-auto-flow: dense'), 'Bento Grid áp dụng grid-auto-flow: dense triệt tiêu ô chết');

// 2.4. Không chứa nhãn meta rẻ tiền (SECTION 01, QUESTION 05...)
assert(!htmlContent.includes('SECTION 01') && !htmlContent.includes('SECTION 02'), 'Không chứa cheap meta-labels (SECTION 01, SECTION 02...)');

// 3. Kiểm tra tính phong phú của nội dung (charles-accent-heroes & Garden Empire Lore)
console.log('\n▶ [PHẦN 3] Hệ Thống Tài Nguyên, Thực Vật & Giám Tuyển');

// 3.1. 6 Token năng lượng
const expectedTokens = ['dirt.png', 'water.png', 'sunlight.png', 'seed.png', 'nutrient.png', 'fertilizer.png'];
const hasAllTokens = expectedTokens.every(tok => htmlContent.includes(tok));
assert(hasAllTokens, 'Hiển thị đầy đủ 6 loại tinh hoa năng lượng (Đất, Nước, Nắng, Hạt, Dinh dưỡng, Phân bón vàng)');

// 3.2. 3 Tầng thẻ cây
assert(htmlContent.includes('t1_e1') && htmlContent.includes('t2_w1') && htmlContent.includes('t3_su1'), 'Showcase 3 thẻ bài đại diện cho 3 Tier sinh thái');

// 3.3. 10 Khách thăm vườn hoàng gia
const hasVisitors = htmlContent.includes('v_01_ong_chua.png') && htmlContent.includes('v_10_chuon_chuon.png');
assert(hasVisitors, 'Hiển thị dải avatar của 10 Vị Khách Hoàng Gia (Royal Visitors)');

// 3.4. Canvas đom đóm / hạt sáng sinh thái
assert(htmlContent.includes('id="particles-canvas"'), 'Tích hợp canvas hạt sáng sinh thái #particles-canvas');

// 4. Kiểm tra khả năng tiếp cận & Tối ưu chuyển động (charles-ux-animation & charles-polish)
console.log('\n▶ [PHẦN 4] Tối Ưu UX, Animation & Phản Hồi Mượt Mà');

// 4.1. Hỗ trợ prefers-reduced-motion
assert(cssContent.includes('prefers-reduced-motion: reduce'), 'CSS hỗ trợ media query prefers-reduced-motion cho người dùng nhạy cảm');
assert(jsContent.includes('prefers-reduced-motion: reduce'), 'JS kiểm tra prefers-reduced-motion trước khi render animation canvas');

// 4.2. Tabular Numbers
assert(cssContent.includes('font-variant-numeric: tabular-nums'), 'CSS áp dụng tabular-nums cho các con số chỉ số để không bị giật xô lệch');

// 4.3. Zero-latency prefetch
assert(jsContent.includes('requestIdleCallback') && jsContent.includes('prefetch'), 'JS sử dụng requestIdleCallback để prefetch trước index.html và /api/rooms');

// 5. Kiểm tra liên kết ngược từ index.html và cấu hình routing
console.log('\n▶ [PHẦN 5] Đồng Bộ Routing & Điều Hướng Hệ Thống');
const indexHtmlContent = fs.readFileSync(path.join(rootDir, 'client', 'index.html'), 'utf8');
assert(indexHtmlContent.includes('href="welcome.html"'), 'client/index.html có nút liên kết quay lại welcome.html');

const vercelJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'vercel.json'), 'utf8'));
const hasVercelRoot = vercelJson.rewrites.some(r => r.source === '/' && r.destination === '/client/welcome');
assert(hasVercelRoot, 'vercel.json định tuyến root "/" tới "/client/welcome"');

const serveJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'client', 'serve.json'), 'utf8'));
const hasServeRoot = serveJson.rewrites.some(r => r.source === '/' && r.destination === '/welcome.html');
assert(hasServeRoot, 'client/serve.json định tuyến root "/" tới "/welcome.html"');

console.log('\n--------------------------------------------------------');
console.log(`🏁 KẾT QUẢ KIỂM THỬ: ${passedTests} PASS / ${failedTests} FAIL`);
console.log('--------------------------------------------------------\n');

if (failedTests > 0) {
  process.exit(1);
}

