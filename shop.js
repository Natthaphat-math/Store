// The buy pages' shared script: prices, the PromptPay QR with the amount in
// it, reading the slip's QR, and talking to the shop's Apps Script web app
// (tracking/shop/). Each page sets window.SHOP first with what is its own:
//
//   prices     {product: {instant, manual}} -- must match PRODUCTS in
//              tracking/shop/Config.gs; the server checks the amount against
//              its own copy, this one is only what the teacher sees
//   app        the app's name, printed under the saved QR
//   slug       for the saved QR's file name
//   howTo      where the key goes in the app, shown under the keys
//   fallback   the old payment form, used only if the endpoint is not set
(function () {
'use strict';
var SHOP = window.SHOP;

// The shop's Apps Script web app. Both buy pages and the status page use
// the same one. Until this is a real deployment the page still shows prices
// and the QR, and step 4 points to the fallback form instead of taking a
// slip it cannot send anywhere.
var SHOP_ENDPOINT = 'https://script.google.com/macros/s/AKfycbwE4SAse73Uo5EotnIfEj3VDbDe0nHQBX49r-xZo6xYsi7TT5GO-aSMq6M2MfcyCU9Q/exec';
var SHOP_LIVE = /^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(SHOP_ENDPOINT);
var FALLBACK_FORM = SHOP.fallback;
var PRICES = SHOP.prices;
// The K PLUS PromptPay e-wallet ID from the seller's own QR.
var PROMPTPAY_ID = '004999007182735';

var $ = function (id) { return document.getElementById(id); };
function el(tag, cls, text) {
  var n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
}
function chosen(name) { return document.querySelector('input[name="' + name + '"]:checked').value; }
function price() { return PRICES[chosen('product')][chosen('method')]; }
function baht(n) { return n.toLocaleString('th-TH') + ' บาท'; }

// ---- prices follow the method
function showPrices() {
  var method = chosen('method');
  document.querySelectorAll('[data-price]').forEach(function (node) {
    node.textContent = baht(PRICES[node.getAttribute('data-price')][method]);
  });
  if ($('step3').getAttribute('aria-disabled') === 'false') drawQr();
}
document.querySelectorAll('input[name=product],input[name=method]').forEach(function (r) {
  r.addEventListener('change', showPrices);
});
showPrices();

// ---- PromptPay QR with the amount in it (EMVCo, as the bank apps read it)
function tlv(tag, value) { return tag + ('0' + value.length).slice(-2) + value; }
function crc16(text) {
  var crc = 0xffff;
  for (var i = 0; i < text.length; i++) {
    crc ^= text.charCodeAt(i) << 8;
    for (var b = 0; b < 8; b++) crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
  }
  return ('000' + crc.toString(16).toUpperCase()).slice(-4);
}
function promptPayPayload(amount) {
  var id = PROMPTPAY_ID;
  // 01 phone, 02 national ID or tax ID, 03 e-wallet ID -- told apart by length.
  var sub = id.length === 15 ? '03' : id.length === 13 ? '02' : '01';
  var body = tlv('00', '01') + tlv('01', '12') +
    tlv('29', tlv('00', 'A000000677010111') + tlv(sub, id)) +
    tlv('53', '764') + tlv('54', amount.toFixed(2)) + tlv('58', 'TH') + '6304';
  return body + crc16(body);
}
function drawQr() {
  var amount = price();
  var qr = qrcode(0, 'M');
  qr.addData(promptPayPayload(amount));
  qr.make();
  var box = $('qr');
  box.textContent = '';
  var img = new Image();
  img.alt = 'QR PromptPay ' + baht(amount);
  img.src = qr.createDataURL(8, 16);
  box.appendChild(img);
  $('amount').textContent = baht(amount);
  qrPicture = null;
  // The picture that gets saved: the QR with the amount and payee under
  // it, as a PNG -- Photos takes a PNG, and a bank app scanning from the
  // gallery reads it like a screenshot. The on-page image becomes the same
  // picture, so a long press saves it too.
  var drawn = qrCard(qr, amount);
  drawn.toBlob(function (blob) {
    qrPicture = blob;
    img.src = URL.createObjectURL(blob);
  }, 'image/png');
}

var qrPicture = null;

function qrCard(qr, amount) {
  var cells = qr.getModuleCount();
  var cell = 12, pad = 48, size = cells * cell;
  var c = document.createElement('canvas');
  c.width = size + pad * 2;
  c.height = size + pad * 2 + 150;
  var x = c.getContext('2d');
  x.fillStyle = '#ffffff';
  x.fillRect(0, 0, c.width, c.height);
  x.fillStyle = '#000000';
  for (var r = 0; r < cells; r++) {
    for (var k = 0; k < cells; k++) {
      if (qr.isDark(r, k)) x.fillRect(pad + k * cell, pad + r * cell, cell, cell);
    }
  }
  var font = getComputedStyle(document.body).fontFamily;
  x.textAlign = 'center';
  x.fillStyle = '#17181a';
  x.font = '700 44px ' + font;
  x.fillText(baht(amount), c.width / 2, size + pad + 70);
  x.fillStyle = '#3f434a';
  x.font = '26px ' + font;
  x.fillText('นาย ณัฐภาส ทองโสม · ' + SHOP.app, c.width / 2, size + pad + 118);
  return c;
}

// On a phone, the share sheet is what reaches Photos ("บันทึกรูปภาพ" /
// "Save Image"); a download only reaches Files, where a bank app will not
// look. A computer without file sharing just downloads the PNG.
$('saveQr').addEventListener('click', function () {
  if (!qrPicture) return;
  var name = 'promptpay-' + SHOP.slug + '-' + price() + '.png';
  var file = null;
  try { file = new File([qrPicture], name, { type: 'image/png' }); } catch (err) { file = null; }
  if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
    navigator.share({ files: [file], title: 'QR PromptPay ' + baht(price()) }).catch(function () {});
    return;
  }
  var link = document.createElement('a');
  link.href = URL.createObjectURL(qrPicture);
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
});

// ---- email, twice
function email() { return $('email').value.trim(); }
$('toPay').addEventListener('click', function () {
  var msg = $('emailMsg');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email())) {
    msg.textContent = 'พิมพ์อีเมลให้ครบ เช่น somchai@gmail.com'; msg.hidden = false; $('email').focus(); return;
  }
  if (email().toLowerCase() !== $('email2').value.trim().toLowerCase()) {
    msg.textContent = 'อีเมลสองช่องไม่ตรงกัน ตรวจตัวสะกดอีกครั้ง'; msg.hidden = false; $('email2').focus(); return;
  }
  msg.hidden = true;
  $('step3').setAttribute('aria-disabled', 'false');
  $('step4').setAttribute('aria-disabled', 'false');
  drawQr();
  $('step3').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

// ---- the slip
function say(text, kind) {
  var m = $('slipMsg');
  m.className = 'msg' + (kind ? ' ' + kind : '');
  m.textContent = text;
  m.hidden = false;
}

function loadImage(file) {
  return new Promise(function (resolve, reject) {
    var url = URL.createObjectURL(file);
    var img = new Image();
    img.onload = function () { resolve(img); };
    img.onerror = reject;
    img.src = url;
  });
}

// Read the QR on the slip. Slips put a small QR in a corner, so the image
// is tried at a couple of sizes before giving up.
function readSlipQr(img) {
  var sizes = [1600, 1000, 2400];
  for (var i = 0; i < sizes.length; i++) {
    var scale = Math.min(1, sizes[i] / Math.max(img.naturalWidth, img.naturalHeight));
    var w = Math.round(img.naturalWidth * scale), h = Math.round(img.naturalHeight * scale);
    var c = document.createElement('canvas');
    c.width = w; c.height = h;
    var ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0, w, h);
    var found = jsQR(ctx.getImageData(0, 0, w, h).data, w, h, { inversionAttempts: 'attemptBoth' });
    if (found && found.data) return found.data.trim();
  }
  return '';
}

// A smaller JPEG for the manual route: enough to read, quick to send.
function compress(img) {
  var scale = Math.min(1, 1600 / Math.max(img.naturalWidth, img.naturalHeight));
  var c = document.createElement('canvas');
  c.width = Math.round(img.naturalWidth * scale);
  c.height = Math.round(img.naturalHeight * scale);
  c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
  return c.toDataURL('image/jpeg', 0.85).split(',')[1];
}

function send(body) {
  // text/plain (a plain string body) needs no CORS preflight, which Apps
  // Script cannot answer.
  return fetch(SHOP_ENDPOINT, { method: 'POST', body: JSON.stringify(body), credentials: 'omit' })
    .then(function (r) { return r.json(); });
}

function showKeys(res) {
  var box = $('keys');
  box.textContent = '';
  (res.keys || []).forEach(function (k, i) {
    var card = el('div', 'keybox');
    card.appendChild(el('strong', null, (res.keys.length > 1 ? 'รหัสที่ ' + (i + 1) + ' — ' : 'รหัส — ') + String(k.label || '')));
    card.appendChild(el('code', null, String(k.key || '')));
    var copy = el('button', 'btn btn-secondary', 'คัดลอกรหัส');
    copy.type = 'button';
    copy.addEventListener('click', function () {
      navigator.clipboard.writeText(String(k.key)).then(function () { copy.textContent = 'คัดลอกแล้ว ✓'; });
    });
    card.appendChild(copy);
    box.appendChild(card);
  });
  box.appendChild(el('p', 'note', SHOP.howTo +
    ((res.keys || []).length > 1 ? ' ใส่ทีละรหัสจนครบ' : '') +
    ' · ส่งรหัสเดียวกันไปที่ ' + String(res.email || 'อีเมลของคุณ') + ' แล้ว (ถ้าไม่เห็น ดูในกล่องสแปม)'));
  box.hidden = false;
}

function answer(res) {
  if (res && res.ok && res.status === 'issued') {
    say('ชำระเงินเรียบร้อย ☑️ นี่คือรหัสไลเซนส์ของคุณ', 'ok');
    showKeys(res);
  } else if (res && res.ok && res.status === 'pending') {
    say('ได้รับสลิปแล้ว ⏳ ' + (res.reason ? '(' + res.reason + ') ' : '') +
      'ผู้พัฒนาจะตรวจและส่งรหัสไปที่ ' + String(res.email || 'อีเมลของคุณ') +
      ' โดยปกติภายใน 1 วัน เช็กสถานะได้ที่หน้า “เช็กสถานะรหัส”', 'wait');
  } else {
    var why = {
      used: 'สลิปนี้ถูกใช้รับรหัสไปแล้ว ถ้าเป็นของคุณเอง เช็กสถานะรหัสด้วยอีเมลที่ใช้ครั้งนั้น',
      busy: 'ตอนนี้มีคนส่งพร้อมกันหลายคน ลองใหม่อีกครั้งในอีกหนึ่งนาที',
      unreadable: 'อ่าน QR บนสลิปไม่ได้ ลองรูปสลิปที่ชัดและเห็น QR ครบ',
      too_big: 'รูปใหญ่เกินไป ลองภาพหน้าจอสลิปแทน',
    }[res && res.error] || 'ส่งไม่สำเร็จ ลองใหม่อีกครั้ง หรือส่งสลิปทางอีเมล natthaphat_official@outlook.com';
    say(why, 'bad');
  }
}

$('slip').addEventListener('change', function () {
  var file = this.files && this.files[0];
  this.value = '';
  if (!file) return;
  if (!SHOP_LIVE) {
    say('ระบบรับสลิปอัตโนมัติยังไม่เปิดใช้งาน ระหว่างนี้แจ้งการชำระเงินผ่านแบบฟอร์มเดิมได้ที่ ' + FALLBACK_FORM, 'wait');
    return;
  }
  var method = chosen('method');
  var base = { email: email(), product: chosen('product') };
  $('keys').hidden = true;
  say('กำลังอ่านสลิป…');
  loadImage(file).then(function (img) {
    var payload = readSlipQr(img);
    if (method === 'instant') {
      if (!payload) {
        say('อ่าน QR บนสลิปไม่ได้ ลองรูปสลิปที่ชัดกว่านี้ หรือเลือก “ส่งทางอีเมลภายใน 1 วัน” แล้วส่งรูปเดิมได้เลย', 'bad');
        return null;
      }
      say('กำลังตรวจสลิปกับธนาคาร… ใช้เวลาไม่กี่วินาที');
      return send(Object.assign({ action: 'instant', slipPayload: payload }, base));
    }
    say('กำลังส่งสลิป…');
    return send(Object.assign({ action: 'manual', slipImage: compress(img), slipType: 'image/jpeg', slipPayload: payload }, base));
  }).then(function (res) {
    if (res) answer(res);
  }).catch(function () {
    say('ส่งไม่สำเร็จ ตรวจอินเทอร์เน็ตแล้วลองใหม่ หรือส่งสลิปทางอีเมล natthaphat_official@outlook.com', 'bad');
  });
});
})();
