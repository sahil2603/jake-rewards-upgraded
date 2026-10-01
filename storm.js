/* =====================================================================
   JakeRewards — hero storm v2 (home page only)
   - Rain in 3 depth layers with wind gusts, streak tails and ground splashes
   - Drifting storm clouds that light up from inside when lightning strikes
   - Branching lightning (glow + core), multi-flicker restrikes, sheet lightning
   - Strikes can hit the "REWARDING" headline, which flashes when struck
   - Tap / click the sky to call down your own strike
   - Falling J-cards and casino chips that flutter like real cards, tumble in 3D,
     catch the lightning light, and get blown aside by the mouse
   Runs only while the hero is on screen and the tab is visible.
===================================================================== */
(function(){
  var hero = document.querySelector('.hero');
  if(!hero) return;
  var RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FINE = window.matchMedia && matchMedia('(pointer: fine)').matches;
  var MOBILE = window.innerWidth < 700;
  window.JM_STORM = true;
  hero.classList.add('jm-storm');

  var bg = hero.querySelector('.hero-bg') || hero;
  var cv = document.createElement('canvas'); cv.className = 'jm-storm-cv'; cv.setAttribute('aria-hidden', 'true');
  bg.appendChild(cv);
  var ctx = cv.getContext('2d');
  var W = 0, H = 0, DPR = Math.min(window.devicePixelRatio || 1, MOBILE ? 1.5 : 1.25);
  var rnd = function(a, b){ return a + Math.random() * (b - a); };

  /* ---------------- clouds (pre-rendered, dark + lit versions) ---------------- */
  var cloudDark = document.createElement('canvas'), cloudLit = document.createElement('canvas');
  function paintClouds(c, lit){
    var w = c.width = Math.ceil(W * 1.5 * CS), h = c.height = Math.ceil(H * 0.7 * CS), g = c.getContext('2d');
    g.clearRect(0, 0, w, h);
    var n = MOBILE ? 26 : 46;
    var seed = 7;
    function sr(){ seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
    for(var i = 0; i < n; i++){
      var x = sr() * w, y = Math.pow(sr(), 1.8) * h * 0.5, r = (0.08 + sr() * 0.14) * Math.max(w, 900 * CS);
      var gr = g.createRadialGradient(x, y, 0, x, y, r);
      if(lit){ gr.addColorStop(0, 'rgba(255,228,150,0.30)'); gr.addColorStop(0.5, 'rgba(230,180,70,0.1)'); gr.addColorStop(1, 'rgba(200,150,40,0)'); }
      else   { gr.addColorStop(0, 'rgba(34,38,58,0.55)');  gr.addColorStop(0.55, 'rgba(22,26,42,0.25)'); gr.addColorStop(1, 'rgba(14,16,28,0)'); }
      g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 6.2832); g.fill();
    }
    /* fade the bottom out so there is never a hard edge */
    g.globalCompositeOperation = 'destination-in';
    var fade = g.createLinearGradient(0, 0, 0, h); fade.addColorStop(0, '#000'); fade.addColorStop(0.45, 'rgba(0,0,0,.85)'); fade.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = fade; g.fillRect(0, 0, w, h); g.globalCompositeOperation = 'source-over';
  }
  var cloudX = 0, CS = 0.5; /* clouds are soft, so they're rendered at half size and scaled up */

  /* ---------------- rain ---------------- */
  var LAYERS = MOBILE
    ? [{ n: 55, len: [7, 12], sp: [4.8, 6.4], w: 0.8, a: 0.12 }, { n: 34, len: [12, 18], sp: [7, 9], w: 1, a: 0.2 }, { n: 10, len: [18, 26], sp: [10, 12.5], w: 1.3, a: 0.3 }]
    : [{ n: 140, len: [7, 12], sp: [6.2, 8.2], w: 0.8, a: 0.1 }, { n: 84, len: [12, 20], sp: [9, 11.8], w: 1.05, a: 0.18 }, { n: 24, len: [22, 32], sp: [13, 17], w: 1.45, a: 0.3 }];
  var drops = [], splashes = [];
  function mkDrop(L, anywhere){
    return { L: L, x: rnd(-W * 0.2, W * 1.1), y: anywhere ? rnd(-H, H) : rnd(-H * 0.3, -20), len: rnd(L.len[0], L.len[1]), sp: rnd(L.sp[0], L.sp[1]), ground: rnd(H * 0.82, H * 1.02) };
  }
  function seedRain(){ drops = []; LAYERS.forEach(function(L, i){ for(var k = 0; k < L.n; k++){ var d = mkDrop(L, true); d.li = i; drops.push(d); } }); }
  var wind = 1.6, windT = 1.6, windNext = 0;

  /* ---------------- lightning ---------------- */
  var bolts = [], flash = 0, flashX = 0.5, sheet = 0, sheetX = 0.5, nextStrike = performance.now() + rnd(1200, 2600);
  function path(x0, y0, x1, y1, disp, out){
    if(disp < 3){ out.push([x1, y1]); return; }
    var mx = (x0 + x1) / 2 + rnd(-disp, disp), my = (y0 + y1) / 2 + rnd(-disp * 0.25, disp * 0.25);
    path(x0, y0, mx, my, disp / 2, out); path(mx, my, x1, y1, disp / 2, out);
  }
  function makeBolt(x0, y0, x1, y1, depth){
    var pts = [[x0, y0]]; path(x0, y0, x1, y1, Math.hypot(x1 - x0, y1 - y0) * 0.22, pts);
    var b = { pts: pts, kids: [], w: depth ? 0.55 : 1 };
    if(depth < 2){
      var nk = depth ? 1 : (2 + (Math.random() * 3 | 0));
      for(var k = 0; k < nk; k++){
        var p = pts[(pts.length * rnd(0.2, 0.75)) | 0], ang = Math.atan2(y1 - y0, x1 - x0) + rnd(-0.9, 0.9), L = Math.hypot(x1 - x0, y1 - y0) * rnd(0.18, 0.4) / (depth + 1);
        b.kids.push(makeBolt(p[0], p[1], p[0] + Math.cos(ang) * L, p[1] + Math.sin(ang) * L, depth + 1));
      }
    }
    return b;
  }
  var FLICK = [1, 0.35, 0.95, 0.25, 0.8, 0.55, 0.3, 0.15, 0.06, 0];
  var accent = hero.querySelector('.hero-accent');
  function strike(tx, ty, byUser){
    var x0 = tx + rnd(-W * 0.12, W * 0.12), b = makeBolt(x0, -10, tx, ty, 0);
    b.t0 = performance.now(); b.hitTitle = false;
    bolts.push(b); flashX = x0 / W; flash = 1;
    if(accent){
      var r = accent.getBoundingClientRect(), hr = hero.getBoundingClientRect();
      if(tx > r.left - hr.left - 20 && tx < r.right - hr.left + 20 && ty > r.top - hr.top - 30 && ty < r.bottom - hr.top + 30){
        setTimeout(function(){ accent.classList.remove('jm-zap'); void accent.offsetWidth; accent.classList.add('jm-zap'); }, 60);
      }
    }
    
  }
  function autoStrike(now){
    if(Math.random() < 0.28){ sheet = 1; sheetX = rnd(0.15, 0.85); nextStrike = now + rnd(1800, 4200); return; }
    var tx, ty;
    if(accent && Math.random() < 0.3){
      var r = accent.getBoundingClientRect(), hr = hero.getBoundingClientRect();
      tx = rnd(r.left, r.right) - hr.left; ty = r.top - hr.top + 6;
    }else{
      tx = Math.random() < 0.5 ? rnd(W * 0.04, W * 0.3) : rnd(W * 0.7, W * 0.96); ty = rnd(H * 0.45, H * 0.95);
    }
    strike(tx, ty, false);
    nextStrike = now + rnd(3200, 7500);
  }
  function drawBolt(b, k){
    function line(bb, lw, col){ ctx.lineWidth = lw * bb.w; ctx.strokeStyle = col; ctx.beginPath(); ctx.moveTo(bb.pts[0][0], bb.pts[0][1]); for(var i = 1; i < bb.pts.length; i++) ctx.lineTo(bb.pts[i][0], bb.pts[i][1]); ctx.stroke(); bb.kids.forEach(function(c){ line(c, lw, col); }); }
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.shadowColor = 'rgba(255,210,90,0.95)'; ctx.shadowBlur = 30 * k;
    line(b, 12, 'rgba(252,194,0,' + (0.24 * k) + ')');
    ctx.shadowBlur = 18 * k;
    line(b, 4, 'rgba(255,225,130,' + (0.8 * k) + ')');
    ctx.shadowBlur = 6 * k;
    line(b, 1.7, 'rgba(255,255,245,' + (0.97 * k) + ')');
    ctx.restore();
  }

  /* ---------------- falling cards + chips (DOM, 3D) ---------------- */
  var layer = document.createElement('div'); layer.className = 'jm-cards'; layer.setAttribute('aria-hidden', 'true');
  bg.appendChild(layer);
  var SUITS = [['♥', 1], ['♠', 0], ['♦', 1], ['♣', 0]];
  var pieces = [];
  function cardHTML(i){
    var s = SUITS[i % 4];
    return '<div class="hc-face hc-front' + (s[1] ? ' red' : '') + '"><span class="hc-corner tl">J<i>' + s[0] + '</i></span><span class="hc-pip">' + s[0] + '</span><span class="hc-corner br">J<i>' + s[0] + '</i></span></div><div class="hc-face hc-back">J</div>';
  }
  function spawnPiece(p, initial){
    p.z = rnd(0.55, 1.15);
    p.x0 = rnd(0.03, 0.97) * W; p.y = initial ? rnd(-H * 0.2, H) : rnd(-260, -90);
    p.vy = rnd(30, 52) * p.z; p.amp = rnd(5, 12); p.f = rnd(0.1, 0.2); p.ph = rnd(0, 6.28);
    p.spin = rnd(22, 55) * (Math.random() < 0.5 ? -1 : 1); p.ry = rnd(0, 360); p.rz0 = rnd(-30, 30);
    p.pushX = 0; p.vx = 0;
    p.el.style.opacity = ((0.35 + (p.z - 0.55) * 0.9) * (MOBILE ? 0.55 : 1)).toFixed(2);
    p.el.style.zIndex = p.z > 0.9 ? 2 : 0;
  }
  function buildPieces(){
    layer.innerHTML = ''; pieces = [];
    var nCards = MOBILE ? 3 : 5, nChips = 0; /* chips removed on request */
    for(var i = 0; i < nCards + nChips; i++){
      var el = document.createElement('div');
      if(i < nCards){ el.className = 'jm-card'; el.innerHTML = cardHTML(i); }
      else{ el.className = 'jm-chip' + (i % 2 ? ' purple' : ''); el.innerHTML = '<i></i>'; }
      layer.appendChild(el);
      var p = { el: el, chip: i >= nCards }; spawnPiece(p, true); pieces.push(p);
    }
  }
  var mouse = { x: -9999, y: -9999, vx: 0, vy: 0, t: 0 };
  if(FINE){
    hero.addEventListener('pointermove', function(e){
      var r = hero.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      mouse.vx = x - mouse.x; mouse.vy = y - mouse.y; mouse.x = x; mouse.y = y; mouse.t = performance.now();
    });
    hero.addEventListener('pointerleave', function(){ mouse.x = mouse.y = -9999; });
  }

  /* tap-to-strike removed on request; lightning is automatic only */
  window.jmStrike = function(x, y){ strike(x, y, true); };

  /* ---------------- sizing ---------------- */
  function resize(){
    var r = hero.getBoundingClientRect();
    W = Math.max(1, Math.round(r.width)); H = Math.max(1, Math.round(r.height));
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    paintClouds(cloudDark, false); paintClouds(cloudLit, true);
    seedRain();
    if(!pieces.length) buildPieces(); else pieces.forEach(function(p){ spawnPiece(p, true); });
  }
  resize();
  var rt; window.addEventListener('resize', function(){ clearTimeout(rt); rt = setTimeout(resize, 200); });

  /* ---------------- loop ---------------- */
  var visible = true;
  if('IntersectionObserver' in window) new IntersectionObserver(function(es){ visible = es[0].isIntersecting; }, { threshold: 0 }).observe(hero);
  var last = performance.now();
  function frame(now){
    requestAnimationFrame(frame);
    var dt = Math.min(0.05, (now - last) / 1000); last = now;
    if(!visible || document.hidden) return;
    var k60 = dt * 60;

    /* wind gusts */
    if(now > windNext){ windT = rnd(0.6, 3.2); windNext = now + rnd(2500, 6000); }
    wind += (windT - wind) * 0.01 * k60;

    /* strikes */
    if(!RM && now > nextStrike) autoStrike(now);
    var fl = 0;
    for(var i = bolts.length - 1; i >= 0; i--){
      var b = bolts[i], step = (now - b.t0) / 65 | 0;
      if(step >= FLICK.length){ bolts.splice(i, 1); continue; }
      b.k = FLICK[step]; fl = Math.max(fl, b.k);
    }
    flash = Math.max(fl, flash * Math.pow(0.9, k60));
    sheet *= Math.pow(0.9, k60);
    var light = Math.max(flash, sheet * 0.8);
    /* cards catch the light only while a flash is happening (no filter the rest of the time) */
    var lf = light > 0.03 ? 'brightness(' + (1 + light * 0.9).toFixed(2) + ')' : '';
    if(layer._f !== lf){ layer.style.filter = lf; layer._f = lf; }

    ctx.clearRect(0, 0, W, H);

    /* clouds (drift) + lit clouds during flashes */
    cloudX = (Math.sin(now / 1000 * 0.035) * 0.5 + 0.5) * Math.max(0, cloudDark.width / CS - W); /* slow back-and-forth drift, never jumps */
    var cw = cloudDark.width / CS, ch = cloudDark.height / CS;
    ctx.globalAlpha = 0.9; ctx.drawImage(cloudDark, -cloudX, 0, cw, ch);
    if(light > 0.02){
      ctx.globalAlpha = Math.min(1, light); ctx.drawImage(cloudLit, -cloudX, 0, cw, ch);
      var fx = (flash > sheet ? flashX : sheetX) * W;
      var gr = ctx.createRadialGradient(fx, 0, 0, fx, 0, Math.max(W, H) * 0.8);
      gr.addColorStop(0, 'rgba(255,225,140,' + (0.13 * light) + ')'); gr.addColorStop(1, 'rgba(220,170,50,0)');
      ctx.globalAlpha = 1; ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
    }
    ctx.globalAlpha = 1;

    /* rain */
    var boost = 1 + light * 1.1;
    for(var li = 0; li < LAYERS.length; li++){
      var L = LAYERS[li];
      ctx.lineWidth = L.w; ctx.strokeStyle = 'rgba(170,185,225,' + Math.min(0.9, L.a * boost).toFixed(3) + ')';
      ctx.beginPath();
      for(var j = 0; j < drops.length; j++){
        var d = drops[j]; if(d.li !== li) continue;
        var vx = wind * (0.5 + li * 0.35);
        d.y += d.sp * k60; d.x += vx * k60;
        /* drops bend around the mouse like an invisible umbrella */
        if(mouse.x > -999){ var dx = d.x - mouse.x, dy = d.y - mouse.y, dist2 = dx * dx + dy * dy; if(dist2 < 9000 && dy < 40){ d.x += (dx > 0 ? 1 : -1) * 2.2 * k60; } }
        if(d.y > d.ground){
          if(li > 0 && splashes.length < 140){ for(var s = 0; s < 2 + li; s++) splashes.push({ x: d.x, y: d.ground, vx: rnd(-1.4, 1.4) + vx * 0.2, vy: rnd(-2.6, -1.1) * (0.6 + li * 0.25), life: 1 }); }
          var nd = mkDrop(L, false); nd.li = li; drops[j] = nd; continue;
        }
        if(d.x > W + 40) d.x -= W + 80;
        ctx.moveTo(d.x, d.y); ctx.lineTo(d.x - vx * d.len * 0.16, d.y - d.len);
      }
      ctx.stroke();
    }
    /* splashes */
    if(splashes.length){
      ctx.fillStyle = 'rgba(190,205,240,0.55)';
      for(var q = splashes.length - 1; q >= 0; q--){
        var p = splashes[q]; p.vy += 0.18 * k60; p.x += p.vx * k60; p.y += p.vy * k60; p.life -= 0.045 * k60;
        if(p.life <= 0){ splashes.splice(q, 1); continue; }
        ctx.globalAlpha = p.life; ctx.fillRect(p.x, p.y, 1.4, 1.4);
      }
      ctx.globalAlpha = 1;
    }
    /* bolts */
    for(var bi = 0; bi < bolts.length; bi++) if(bolts[bi].k > 0) drawBolt(bolts[bi], bolts[bi].k);

    /* cards + chips */
    var t = now / 1000;
    for(var pi = 0; pi < pieces.length; pi++){
      var c = pieces[pi];
      c.y += c.vy * dt;
      c.ry += c.spin * dt;
      var sway = Math.sin(t * c.f * 6.283 + c.ph);
      var x = c.x0 + sway * c.amp;
      var rz = c.rz0 + sway * 9, rx = Math.cos(t * c.f * 6.283 + c.ph) * 12;
      c.el.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + c.y.toFixed(1) + 'px,0) scale(' + c.z.toFixed(2) + ') rotateZ(' + rz.toFixed(1) + 'deg) rotateX(' + rx.toFixed(1) + 'deg) rotateY(' + (c.chip ? c.ry * 1.6 : c.ry).toFixed(1) + 'deg)';
      if(c.y > H + 120) spawnPiece(c, false);
    }
  }
  if(!RM) requestAnimationFrame(frame);
  else{ ctx.drawImage(cloudDark, 0, 0, cloudDark.width / CS, cloudDark.height / CS); }
})();
