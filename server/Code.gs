/**
 * Distributor P&L Simulator · API lưu bài nộp của NPP vào Google Sheet.
 * Cài đặt: xem server/README.md
 * Script Properties cần có: ADMIN_PASSWORD và NPP_PASSWORD (trùng GitHub secrets).
 */
const SHEET = 'Submissions';
const LOG = 'Log';
const HEAD = ['Key', 'DisID', 'NPP', 'Khu vực', 'Tháng', 'Gửi lúc', 'Người gửi', 'Lần gửi',
  'Sản lượng (thùng)', 'Doanh thu', 'Chi phí vận hành', 'PAT', 'ROI (%)', 'Công nợ thị trường',
  'Xăng xe tải', 'Xăng xe máy', 'Thuê xe ngoài', 'Thuê kho', 'Lương tài xế', 'Lương phụ xế',
  'Thúc đẩy bán ra', 'Số SKU có giá', 'Payload (JSON)'];
const COL = Object.fromEntries(HEAD.map((h, i) => [h, i]));

function doGet() { return out_({ ok: true, service: 'npp-pnl', time: new Date().toISOString() }); }

function doPost(e) {
  try {
    const req = JSON.parse(e.postData.contents || '{}');
    const role = role_(req.auth);
    if (!role) return out_({ ok: false, error: 'Sai thông tin đăng nhập. Hãy đăng xuất và đăng nhập lại.' });
    switch (req.action) {
      case 'ping': return out_({ ok: true, role });
      case 'submit': return out_(submit_(req.sub, role));
      case 'list':
        if (role !== 'admin') return out_({ ok: false, error: 'Chỉ Admin được xem danh sách.' });
        return out_({ ok: true, items: list_(req.month) });
      case 'get': return out_({ ok: true, item: list_().find(x => x.key === req.key) || null });
      case 'fa_list': return out_(fa_list_());
      case 'fa_save':
        if (role !== 'admin') return out_({ ok: false, error: 'Chỉ Admin được lưu sổ TSCĐ.' });
        return out_(fa_save_(req.items, role));
      default: return out_({ ok: false, error: 'Action không hợp lệ.' });
    }
  } catch (err) {
    return out_({ ok: false, error: String(err && err.message || err) });
  }
}

function submit_(s, role) {
  if (!s || !s.key || !s.disId || !s.month) return { ok: false, error: 'Thiếu dữ liệu bài nộp.' };
  const payload = JSON.stringify(s.data || {});
  if (payload.length > 49000) return { ok: false, error: 'Dữ liệu quá lớn.' };
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sh = sheet_(SHEET, HEAD), now = new Date(), sm = s.summary || {}, c = sm.costs || {};
    const keys = sh.getLastRow() > 1 ? sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues().map(r => String(r[0])) : [];
    const idx = keys.indexOf(s.key);
    const n = idx >= 0 ? Number(sh.getRange(idx + 2, COL['Lần gửi'] + 1).getValue() || 0) + 1 : 1;
    const row = [s.key, String(s.disId), s.code || '', s.area || '', "'" + s.month, now, role, n,
      num_(sm.vol), num_(sm.rev), num_(sm.opex), num_(sm.pat), num_(sm.roi), num_(sm.credit),
      num_(c.petro), num_(c.bike), num_(c.rent), num_(c.wh), num_(c.drv), num_(c.asst), num_(c.promo),
      num_(sm.skus), payload];
    if (idx >= 0) sh.getRange(idx + 2, 1, 1, row.length).setValues([row]);
    else sh.appendRow(row);
    sheet_(LOG, ['Thời gian', 'Key', 'NPP', 'Tháng', 'Người gửi', 'Lần gửi', 'PAT', 'Công nợ'])
      .appendRow([now, s.key, s.code || '', "'" + s.month, role, n, num_(sm.pat), num_(sm.credit)]);
    return { ok: true, at: now.getTime(), n };
  } finally { lock.releaseLock(); }
}

function list_(month) {
  const sh = sheet_(SHEET, HEAD);
  if (sh.getLastRow() < 2) return [];
  return sh.getRange(2, 1, sh.getLastRow() - 1, HEAD.length).getValues()
    .filter(r => r[0] && (!month || String(r[COL['Tháng']]) === month))
    .map(r => {
      let data = {};
      try { data = JSON.parse(r[COL['Payload (JSON)']] || '{}'); } catch (e) { }
      return {
        key: r[0], disId: String(r[1]), code: r[2], area: r[3], month: String(r[4]),
        at: r[5] instanceof Date ? r[5].getTime() : Number(r[5]) || 0, by: r[6], n: r[7],
        summary: { vol: r[8], rev: r[9], opex: r[10], pat: r[11], roi: r[12], credit: r[13] }, data
      };
    });
}

// Sổ TSCĐ dùng chung: sheet 'TSCD', Admin lưu toàn bộ danh sách; NPP và Admin đều đọc được
const FA_SHEET = 'TSCD';
const FA_HEAD = ['Key', 'DisID', 'Tên TSCĐ', 'Loại TSCĐ', 'Nguyên giá', 'Ngày bắt đầu', 'Số tháng KH', 'Cập nhật lúc', 'Người cập nhật'];

function fa_list_() {
  const sh = SpreadsheetApp.getActive().getSheetByName(FA_SHEET);
  if (!sh) return { ok: true, saved: false, items: [] };
  if (sh.getLastRow() < 2) return { ok: true, saved: true, items: [] };
  const items = sh.getRange(2, 1, sh.getLastRow() - 1, 7).getValues().filter(r => r[0]).map(r => ({
    k: String(r[0]), d: String(r[1]), n: String(r[2]), c: String(r[3]), v: Number(r[4]), s: String(r[5]), l: Number(r[6]) || 60 }));
  return { ok: true, saved: true, items };
}

function fa_save_(items, role) {
  if (!Array.isArray(items)) return { ok: false, error: 'Thiếu dữ liệu sổ TSCĐ.' };
  const valid = items.every(x => x && x.k && x.d && x.n && x.c && +x.v > 0 && /^\d{4}-\d{2}-\d{2}$/.test(x.s || '')
    && Number.isInteger(+x.l) && +x.l >= 1 && +x.l <= 240);
  if (!valid) return { ok: false, error: 'Có dòng TSCĐ thiếu hoặc sai dữ liệu.' };
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sh = sheet_(FA_SHEET, FA_HEAD), now = new Date();
    if (sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, FA_HEAD.length).clearContent();
    if (items.length) sh.getRange(2, 1, items.length, FA_HEAD.length).setValues(items.map(x => [
      String(x.k), String(x.d), x.n, x.c, +x.v, "'" + x.s, +x.l, now, role]));
    return { ok: true, count: items.length };
  } finally { lock.releaseLock(); }
}

function role_(auth) {
  if (!auth) return null;
  const p = PropertiesService.getScriptProperties();
  const a = p.getProperty('ADMIN_PASSWORD'), n = p.getProperty('NPP_PASSWORD');
  if (a && auth === sha_(a)) return 'admin';
  if (n && auth === sha_(n)) return 'npp';
  return null;
}

function sha_(s) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, s, Utilities.Charset.UTF_8)
    .map(b => ((b + 256) % 256).toString(16).padStart(2, '0')).join('');
}

function sheet_(name, head) {
  const ss = SpreadsheetApp.getActive();
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.getRange(1, 1, 1, head.length).setValues([head]).setFontWeight('bold')
      .setBackground('#00843D').setFontColor('#FFFFFF');
    sh.setFrozenRows(1);
  }
  return sh;
}

const num_ = v => (v == null || v === '' || !isFinite(v)) ? '' : Number(v);
const out_ = o => ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
