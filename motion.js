/* Lenis 1.3.26 (MIT) — smooth scrolling */
(function(){var e=`1.3.26`;function t(e,t,n){return Math.max(e,Math.min(t,n))}function n(e,t,n){return(1-n)*e+n*t}function r(e,t,r,i){return n(e,t,1-Math.exp(-r*i))}function i(e,t){return(e%t+t)%t}var a=class{isRunning=!1;value=0;from=0;to=0;currentTime=0;lerp;duration;easing;onUpdate;advance(e){if(!this.isRunning)return;let n=!1;if(this.duration&&this.easing){this.currentTime+=e;let r=t(0,this.currentTime/this.duration,1);n=r>=1;let i=n?1:this.easing(r);this.value=this.from+(this.to-this.from)*i}else this.lerp?(this.value=r(this.value,this.to,this.lerp*60,e),Math.round(this.value)===Math.round(this.to)&&(this.value=this.to,n=!0)):(this.value=this.to,n=!0);n&&this.stop(),this.onUpdate?.(this.value,n)}stop(){this.isRunning=!1}fromTo(e,t,{lerp:n,duration:r,easing:i,onStart:a,onUpdate:o}){this.from=this.value=e,this.to=t,this.lerp=n,this.duration=r,this.easing=i,this.currentTime=0,this.isRunning=!0,a?.(),this.onUpdate=o}};function o(e,t){let n;return function(...r){clearTimeout(n),n=setTimeout(()=>{n=void 0,e.apply(this,r)},t)}}var s=class{width=0;height=0;scrollHeight=0;scrollWidth=0;debouncedResize;wrapperResizeObserver;contentResizeObserver;constructor(e,t,{autoResize:n=!0,debounce:r=250}={}){this.wrapper=e,this.content=t,n&&(this.debouncedResize=o(this.resize,r),this.wrapper instanceof Window?window.addEventListener(`resize`,this.debouncedResize):(this.wrapperResizeObserver=new ResizeObserver(this.debouncedResize),this.wrapperResizeObserver.observe(this.wrapper)),this.contentResizeObserver=new ResizeObserver(this.debouncedResize),this.contentResizeObserver.observe(this.content)),this.resize()}destroy(){this.wrapperResizeObserver?.disconnect(),this.contentResizeObserver?.disconnect(),this.wrapper===window&&this.debouncedResize&&window.removeEventListener(`resize`,this.debouncedResize)}resize=()=>{this.onWrapperResize(),this.onContentResize()};onWrapperResize=()=>{this.wrapper instanceof Window?(this.width=window.innerWidth,this.height=window.innerHeight):(this.width=this.wrapper.clientWidth,this.height=this.wrapper.clientHeight)};onContentResize=()=>{this.wrapper instanceof Window?(this.scrollHeight=this.content.scrollHeight,this.scrollWidth=this.content.scrollWidth):(this.scrollHeight=this.wrapper.scrollHeight,this.scrollWidth=this.wrapper.scrollWidth)};get limit(){return{x:this.scrollWidth-this.width,y:this.scrollHeight-this.height}}},c=class{events={};emit(e,...t){let n=this.events[e]||[];for(let e=0,r=n.length;e<r;e++)n[e]?.(...t)}on(e,t){return this.events[e]?this.events[e].push(t):this.events[e]=[t],()=>{this.events[e]=this.events[e]?.filter(e=>t!==e)}}off(e,t){this.events[e]=this.events[e]?.filter(e=>t!==e)}destroy(){this.events={}}};let l={passive:!1};function u(e,t){return e===1?16.666666666666668:e===2?t:1}var d=class{touchStart={x:0,y:0};lastDelta={x:0,y:0};window={width:0,height:0};emitter=new c;constructor(e,t={wheelMultiplier:1,touchMultiplier:1}){this.element=e,this.options=t,window.addEventListener(`resize`,this.onWindowResize),this.onWindowResize(),this.element.addEventListener(`wheel`,this.onWheel,l),this.element.addEventListener(`touchstart`,this.onTouchStart,l),this.element.addEventListener(`touchmove`,this.onTouchMove,l),this.element.addEventListener(`touchend`,this.onTouchEnd,l)}on(e,t){return this.emitter.on(e,t)}destroy(){this.emitter.destroy(),window.removeEventListener(`resize`,this.onWindowResize),this.element.removeEventListener(`wheel`,this.onWheel,l),this.element.removeEventListener(`touchstart`,this.onTouchStart,l),this.element.removeEventListener(`touchmove`,this.onTouchMove,l),this.element.removeEventListener(`touchend`,this.onTouchEnd,l)}onTouchStart=e=>{let{clientX:t,clientY:n}=e.targetTouches?e.targetTouches[0]:e;this.touchStart.x=t,this.touchStart.y=n,this.lastDelta={x:0,y:0},this.emitter.emit(`scroll`,{deltaX:0,deltaY:0,event:e})};onTouchMove=e=>{let{clientX:t,clientY:n}=e.targetTouches?e.targetTouches[0]:e,r=-(t-this.touchStart.x)*this.options.touchMultiplier,i=-(n-this.touchStart.y)*this.options.touchMultiplier;this.touchStart.x=t,this.touchStart.y=n,this.lastDelta={x:r,y:i},this.emitter.emit(`scroll`,{deltaX:r,deltaY:i,event:e})};onTouchEnd=e=>{this.emitter.emit(`scroll`,{deltaX:this.lastDelta.x,deltaY:this.lastDelta.y,event:e})};onWheel=e=>{let{deltaX:t,deltaY:n,deltaMode:r}=e,i=u(r,this.window.width),a=u(r,this.window.height);t*=i,n*=a,t*=this.options.wheelMultiplier,n*=this.options.wheelMultiplier,this.emitter.emit(`scroll`,{deltaX:t,deltaY:n,event:e})};onWindowResize=()=>{this.window={width:window.innerWidth,height:window.innerHeight}}};let f=e=>Math.min(1,1.001-2**(-10*e));var p=class{_isScrolling=!1;_isStopped=!1;_isLocked=!1;_preventNextNativeScrollEvent=!1;_resetVelocityTimeout=null;_rafId=null;_isDraggingSelection=!1;reducedMotionMediaQuery=window.matchMedia(`(prefers-reduced-motion: reduce)`);isTouching;isIos;time=0;userData={};lastVelocity=0;velocity=0;direction=0;options;targetScroll;animatedScroll;animate=new a;emitter=new c;dimensions;virtualScroll;constructor({wrapper:t=window,content:n=document.documentElement,eventsTarget:r=t,smoothWheel:i=!0,syncTouch:a=!1,syncTouchLerp:o=.075,touchInertiaExponent:c=1.7,duration:l,easing:u,lerp:p=.1,infinite:m=!1,orientation:h=`vertical`,gestureOrientation:g=h===`horizontal`?`both`:`vertical`,touchMultiplier:_=1,wheelMultiplier:v=1,autoResize:y=!0,prevent:b,virtualScroll:x,overscroll:S=!0,autoRaf:C=!1,anchors:w=!1,autoToggle:T=!1,allowNestedScroll:E=!1,__experimental__naiveDimensions:D=!1,naiveDimensions:O=D,stopInertiaOnNavigate:k=!1,respectReducedMotion:A=!0}={}){window.lenisVersion=e,window.lenis||(window.lenis={}),window.lenis.version=e,h===`horizontal`&&(window.lenis.horizontal=!0),a===!0&&(window.lenis.touch=!0),this.isIos=/(iPad|iPhone|iPod)/g.test(navigator.userAgent),(!t||t===document.documentElement)&&(t=window),typeof l==`number`&&typeof u!=`function`?u=f:typeof u==`function`&&typeof l!=`number`&&(l=1),this.options={wrapper:t,content:n,eventsTarget:r,smoothWheel:i,syncTouch:a,syncTouchLerp:o,touchInertiaExponent:c,duration:l,easing:u,lerp:p,infinite:m,gestureOrientation:g,orientation:h,touchMultiplier:_,wheelMultiplier:v,autoResize:y,prevent:b,virtualScroll:x,overscroll:S,autoRaf:C,anchors:w,autoToggle:T,allowNestedScroll:E,naiveDimensions:O,stopInertiaOnNavigate:k,respectReducedMotion:A},this.dimensions=new s(t,n,{autoResize:y}),this.updateClassName(),this.targetScroll=this.animatedScroll=this.actualScroll,this.options.wrapper.addEventListener(`scroll`,this.onNativeScroll),this.options.wrapper.addEventListener(`scrollend`,this.onScrollEnd,{capture:!0}),(this.options.anchors||this.options.stopInertiaOnNavigate)&&this.options.wrapper.addEventListener(`click`,this.onClick),this.options.wrapper.addEventListener(`pointerdown`,this.onPointerDown),this.virtualScroll=new d(r,{touchMultiplier:_,wheelMultiplier:v}),this.virtualScroll.on(`scroll`,this.onVirtualScroll),this.options.autoToggle&&(this.checkOverflow(),this.rootElement.addEventListener(`transitionend`,this.onTransitionEnd)),this.options.autoRaf&&(this._rafId=requestAnimationFrame(this.raf))}destroy(){this.emitter.destroy(),this.options.wrapper.removeEventListener(`scroll`,this.onNativeScroll),this.options.wrapper.removeEventListener(`scrollend`,this.onScrollEnd,{capture:!0}),this.options.wrapper.removeEventListener(`pointerdown`,this.onPointerDown),(this.options.anchors||this.options.stopInertiaOnNavigate)&&this.options.wrapper.removeEventListener(`click`,this.onClick),this.virtualScroll.destroy(),this.dimensions.destroy(),this.cleanUpClassName(),this._rafId&&cancelAnimationFrame(this._rafId)}on(e,t){return this.emitter.on(e,t)}off(e,t){return this.emitter.off(e,t)}onScrollEnd=e=>{e instanceof CustomEvent||(this.isScrolling===`smooth`||this.isScrolling===!1)&&e.stopPropagation()};dispatchScrollendEvent=()=>{this.options.wrapper.dispatchEvent(new CustomEvent(`scrollend`,{bubbles:this.options.wrapper===window,detail:{lenisScrollEnd:!0}}))};get overflow(){let e=this.isHorizontal?`overflow-x`:`overflow-y`;return getComputedStyle(this.rootElement)[e]}checkOverflow(){[`hidden`,`clip`].includes(this.overflow)?this.internalStop():this.internalStart()}onTransitionEnd=e=>{e.propertyName?.includes(`overflow`)&&e.target===this.rootElement&&this.checkOverflow()};setScroll(e){this.isHorizontal?this.options.wrapper.scrollTo({left:e,behavior:`instant`}):this.options.wrapper.scrollTo({top:e,behavior:`instant`})}onClick=e=>{let t=e.composedPath().filter(e=>e instanceof HTMLAnchorElement&&e.href).map(e=>new URL(e.href)),n=new URL(window.location.href);if(this.options.anchors){let e=t.find(e=>n.host===e.host&&n.pathname===e.pathname&&e.hash);if(e){let t=typeof this.options.anchors==`object`&&this.options.anchors?this.options.anchors:void 0,n=decodeURIComponent(e.hash);this.scrollTo(n,t);return}}if(this.options.stopInertiaOnNavigate&&t.some(e=>n.host===e.host&&n.pathname!==e.pathname)){this.reset();return}};onPointerDown=e=>{e.button===1&&this.reset()};isTouchOnSelectionHandle(e){let t=window.getSelection();if(!t||t.isCollapsed||t.rangeCount===0)return!1;let n=e.targetTouches[0]??e.changedTouches[0];if(!n)return!1;let r=t.getRangeAt(0).getClientRects();if(r.length===0)return!1;let i=r[0],a=r[r.length-1],o=Math.hypot(n.clientX-i.left,n.clientY-i.top)<=40,s=Math.hypot(n.clientX-a.right,n.clientY-a.bottom)<=40;return o||s}onVirtualScroll=e=>{if(typeof this.options.virtualScroll==`function`&&this.options.virtualScroll(e)===!1)return;let{deltaX:t,deltaY:n,event:r}=e;if(this.emitter.emit(`virtual-scroll`,{deltaX:t,deltaY:n,event:r}),r.ctrlKey||r.lenisStopPropagation)return;let i=r.type.includes(`touch`),a=r.type.includes(`wheel`);if(i&&this.isIos&&(r.type===`touchstart`&&(this._isDraggingSelection=this.isTouchOnSelectionHandle(r)),this._isDraggingSelection)){r.type===`touchend`&&(this._isDraggingSelection=!1);return}this.isTouching=r.type===`touchstart`||r.type===`touchmove`;let o=t===0&&n===0;if(this.options.syncTouch&&i&&r.type===`touchstart`&&o&&!this.isStopped&&!this.isLocked){this.reset();return}let s=this.options.gestureOrientation===`vertical`&&n===0||this.options.gestureOrientation===`horizontal`&&t===0;if(o||s)return;let c=r.composedPath();c=c.slice(0,c.indexOf(this.rootElement));let l=this.options.prevent,u=Math.abs(t)>=Math.abs(n)?`horizontal`:`vertical`;if(c.find(e=>e instanceof HTMLElement&&(typeof l==`function`&&l?.(e)||e.hasAttribute?.(`data-lenis-prevent`)||u===`vertical`&&e.hasAttribute?.(`data-lenis-prevent-vertical`)||u===`horizontal`&&e.hasAttribute?.(`data-lenis-prevent-horizontal`)||i&&e.hasAttribute?.(`data-lenis-prevent-touch`)||a&&e.hasAttribute?.(`data-lenis-prevent-wheel`)||this.options.allowNestedScroll&&this.hasNestedScroll(e,{deltaX:t,deltaY:n}))))return;if(this.isStopped||this.isLocked){r.cancelable&&r.preventDefault();return}if(!(this.options.syncTouch&&i||this.options.smoothWheel&&a)){this.isScrolling=`native`,this.animate.stop(),r.lenisStopPropagation=!0;return}let d=n;this.options.gestureOrientation===`both`?d=Math.abs(n)>Math.abs(t)?n:t:this.options.gestureOrientation===`horizontal`&&(d=t),(!this.options.overscroll||this.options.infinite||this.options.wrapper!==window&&this.limit>0&&(this.animatedScroll>0&&this.animatedScroll<this.limit||this.animatedScroll===0&&n>0||this.animatedScroll===this.limit&&n<0))&&(r.lenisStopPropagation=!0),r.cancelable&&r.preventDefault();let f=i&&this.options.syncTouch,p=i&&r.type===`touchend`;p&&(d=Math.sign(d)*Math.abs(this.velocity)**this.options.touchInertiaExponent),this.scrollTo(this.targetScroll+d,{programmatic:!1,...f?{lerp:p?this.options.syncTouchLerp:1}:{lerp:this.options.lerp,duration:this.options.duration,easing:this.options.easing}})};resize(){this.dimensions.resize(),this.animatedScroll=this.targetScroll=this.actualScroll,this.emit()}emit(){this.emitter.emit(`scroll`,this)}onNativeScroll=()=>{if(this._resetVelocityTimeout!==null&&(clearTimeout(this._resetVelocityTimeout),this._resetVelocityTimeout=null),this._preventNextNativeScrollEvent){this._preventNextNativeScrollEvent=!1;return}if(this.isScrolling===!1||this.isScrolling===`native`){let e=this.animatedScroll;this.animatedScroll=this.targetScroll=this.actualScroll,this.lastVelocity=this.velocity,this.velocity=this.animatedScroll-e,this.direction=Math.sign(this.animatedScroll-e),this.isStopped||(this.isScrolling=`native`),this.emit(),this.velocity!==0&&(this._resetVelocityTimeout=setTimeout(()=>{this.lastVelocity=this.velocity,this.velocity=0,this.isScrolling=!1,this.emit()},400))}};reset(){this.isLocked=!1,this.isScrolling=!1,this.animatedScroll=this.targetScroll=this.actualScroll,this.lastVelocity=this.velocity=0,this.animate.stop()}start(){if(this.isStopped){if(this.options.autoToggle){this.rootElement.style.removeProperty(`overflow`);return}this.internalStart()}}internalStart(){this.isStopped&&(this.reset(),this.isStopped=!1,this.emit())}stop(){if(!this.isStopped){if(this.options.autoToggle){this.rootElement.style.setProperty(`overflow`,`clip`);return}this.internalStop()}}internalStop(){this.isStopped||(this.reset(),this.isStopped=!0,this.emit())}raf=e=>{let t=e-(this.time||e);this.time=e,this.animate.advance(t*.001),this.options.autoRaf&&(this._rafId=requestAnimationFrame(this.raf))};scrollTo(e,{offset:n=0,immediate:r=!1,lock:i=!1,programmatic:a=!0,lerp:o=a?this.options.lerp:void 0,duration:s=a?this.options.duration:void 0,easing:c=a?this.options.easing:void 0,onStart:l,onComplete:u,force:d=!1,userData:p}={}){if(this.prefersReducedMotion&&(a?r=!0:(o=1,s=void 0,c=void 0)),(this.isStopped||this.isLocked)&&!d)return;let m=e,h=n;if(typeof m==`string`&&[`top`,`left`,`start`,`#`].includes(m))m=0;else if(typeof m==`string`&&[`bottom`,`right`,`end`].includes(m))m=this.limit;else{let e=null;if(typeof m==`string`?(e=m.startsWith(`#`)?document.getElementById(m.slice(1)):document.querySelector(m),e||(m===`#top`?m=0:console.warn(`Lenis: Target not found`,m))):m instanceof HTMLElement&&m?.nodeType&&(e=m),e){if(this.options.wrapper!==window){let e=this.rootElement.getBoundingClientRect();h-=this.isHorizontal?e.left:e.top}let t=e.getBoundingClientRect(),n=getComputedStyle(e),r=this.isHorizontal?Number.parseFloat(n.scrollMarginLeft):Number.parseFloat(n.scrollMarginTop),i=getComputedStyle(this.rootElement),a=this.isHorizontal?Number.parseFloat(i.scrollPaddingLeft):Number.parseFloat(i.scrollPaddingTop);m=(this.isHorizontal?t.left:t.top)+this.animatedScroll-(Number.isNaN(r)?0:r)-(Number.isNaN(a)?0:a)}}if(typeof m==`number`){if(m+=h,this.options.infinite){if(a){this.targetScroll=this.animatedScroll=this.scroll;let e=m-this.animatedScroll;e>this.limit/2?m-=this.limit:e<-this.limit/2&&(m+=this.limit)}}else m=t(0,m,this.limit);if(m===this.targetScroll){l?.(this),u?.(this);return}if(this.userData=p??{},r){this.animatedScroll=this.targetScroll=m,this.setScroll(this.scroll),this.reset(),this.preventNextNativeScrollEvent(),this.emit(),u?.(this),this.userData={},requestAnimationFrame(()=>{this.dispatchScrollendEvent()});return}a||(this.targetScroll=m),typeof s==`number`&&typeof c!=`function`?c=f:typeof c==`function`&&typeof s!=`number`&&(s=1),this.animate.fromTo(this.animatedScroll,m,{duration:s,easing:c,lerp:o,onStart:()=>{i&&(this.isLocked=!0),this.isScrolling=`smooth`,l?.(this)},onUpdate:(e,t)=>{this.isScrolling=`smooth`,this.lastVelocity=this.velocity,this.velocity=e-this.animatedScroll,this.direction=Math.sign(this.velocity),this.animatedScroll=e,this.setScroll(this.scroll),a&&(this.targetScroll=e),t||this.emit(),t&&(this.reset(),this.emit(),u?.(this),this.userData={},requestAnimationFrame(()=>{this.dispatchScrollendEvent()}),this.preventNextNativeScrollEvent())}})}}preventNextNativeScrollEvent(){this._preventNextNativeScrollEvent=!0,requestAnimationFrame(()=>{this._preventNextNativeScrollEvent=!1})}hasNestedScroll(e,{deltaX:t,deltaY:n}){let r=Date.now();e._lenis||={};let i=e._lenis,a,o,s,c,l,u,d,f,p,m;if(r-(i.time??0)>2e3){i.time=Date.now();let t=window.getComputedStyle(e);if(i.computedStyle=t,a=[`auto`,`overlay`,`scroll`].includes(t.overflowX),o=[`auto`,`overlay`,`scroll`].includes(t.overflowY),l=[`auto`].includes(t.overscrollBehaviorX),u=[`auto`].includes(t.overscrollBehaviorY),i.hasOverflowX=a,i.hasOverflowY=o,!(a||o))return!1;d=e.scrollWidth,f=e.scrollHeight,p=e.clientWidth,m=e.clientHeight,s=d>p,c=f>m,i.isScrollableX=s,i.isScrollableY=c,i.scrollWidth=d,i.scrollHeight=f,i.clientWidth=p,i.clientHeight=m,i.hasOverscrollBehaviorX=l,i.hasOverscrollBehaviorY=u}else s=i.isScrollableX,c=i.isScrollableY,a=i.hasOverflowX,o=i.hasOverflowY,d=i.scrollWidth,f=i.scrollHeight,p=i.clientWidth,m=i.clientHeight,l=i.hasOverscrollBehaviorX,u=i.hasOverscrollBehaviorY;if(!(a&&s||o&&c))return!1;let h=Math.abs(t)>=Math.abs(n)?`horizontal`:`vertical`,g,_,v,y,b,x;if(h===`horizontal`)g=Math.round(e.scrollLeft),_=d-p,v=t,y=a,b=s,x=l;else if(h===`vertical`)g=Math.round(e.scrollTop),_=f-m,v=n,y=o,b=c,x=u;else return!1;return!x&&(g>=_||g<=0)?!0:(v>0?g<_:g>0)&&y&&b}get rootElement(){return this.options.wrapper===window?document.documentElement:this.options.wrapper}get limit(){return this.options.naiveDimensions?this.isHorizontal?this.rootElement.scrollWidth-this.rootElement.clientWidth:this.rootElement.scrollHeight-this.rootElement.clientHeight:this.dimensions.limit[this.isHorizontal?`x`:`y`]}get isHorizontal(){return this.options.orientation===`horizontal`}get actualScroll(){let e=this.options.wrapper;return this.isHorizontal?e.scrollX??e.scrollLeft:e.scrollY??e.scrollTop}get scroll(){return this.options.infinite?i(this.animatedScroll,this.limit):this.animatedScroll}get progress(){return this.limit===0?1:this.scroll/this.limit}get isScrolling(){return this._isScrolling}set isScrolling(e){this._isScrolling!==e&&(this._isScrolling=e,this.updateClassName())}get isStopped(){return this._isStopped}set isStopped(e){this._isStopped!==e&&(this._isStopped=e,this.updateClassName())}get isLocked(){return this._isLocked}set isLocked(e){this._isLocked!==e&&(this._isLocked=e,this.updateClassName())}get isSmooth(){return this.isScrolling===`smooth`}get prefersReducedMotion(){return this.options.respectReducedMotion&&this.reducedMotionMediaQuery.matches}get className(){let e=`lenis`;return this.options.autoToggle&&(e+=` lenis-autoToggle`),this.isStopped&&(e+=` lenis-stopped`),this.isLocked&&(e+=` lenis-locked`),this.isScrolling&&(e+=` lenis-scrolling`),this.isScrolling===`smooth`&&(e+=` lenis-smooth`),e}updateClassName(){this.cleanUpClassName(),this.className.split(` `).forEach(e=>{this.rootElement.classList.add(e)})}cleanUpClassName(){for(let e of Array.from(this.rootElement.classList))(e===`lenis`||e.startsWith(`lenis-`))&&this.rootElement.classList.remove(e)}};globalThis.Lenis=p,globalThis.Lenis.prototype=p.prototype})();

/* =====================================================================
   JakeRewards motion layer (site-wide) — see motion.css
   1. Smooth scrolling (Lenis, inlined above; mouse wheel only, phones keep native scroll)
   2. Soft fade between pages
   3. Scroll reveals + word-by-word heading reveals
   4. Nav tightens on scroll, hides going down, returns going up
   5. Desktop only: card tilt + magnetic buttons (no cursor glow)
   6. Home: hero entrance, scroll parallax, crossing marquee bands, drawing steps line
===================================================================== */
(function(){
  var RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FINE = window.matchMedia && matchMedia('(pointer: fine)').matches;
  var root = document.documentElement;
  var isHome = !!document.querySelector('.hero .hero-title');


  /* shared "Copy Code" chip on page tops */
  window.pgCopy = function(btn){
    try{ navigator.clipboard && navigator.clipboard.writeText('JAKE'); }catch(e){}
    var c = btn.querySelector('.pg-code-c'); btn.classList.add('done'); c.textContent = 'Copied ✓';
    setTimeout(function(){ btn.classList.remove('done'); c.textContent = 'Copy Code'; }, 1600);
  };
  /* ---------- 1. smooth scroll ---------- */
  var lenis = null;
  if(!RM && window.Lenis){
    try{
      lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.95, smoothWheel: true, syncTouch: false, allowNestedScroll: true });
      window.jmLenis = lenis;
    }catch(e){ lenis = null; }
  }
  /* the site's own "back to top" button glides with the same engine */
  var btt = document.getElementById('back-to-top');
  if(btt && lenis) btt.onclick = function(){ lenis.scrollTo(0, { duration: 1.4 }); };
  /* in-page #anchor links glide too */
  document.addEventListener('click', function(e){
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if(!a || !lenis) return;
    var id = a.getAttribute('href'); if(id.length < 2) return;
    var t = document.querySelector(id); if(!t) return;
    e.preventDefault(); lenis.scrollTo(t, { offset: -90, duration: 1.3 });
  });

  /* ---------- 2. page transitions ---------- */
  var veil = document.getElementById('jm-veil');
  if(veil && !RM){
    document.addEventListener('click', function(e){
      if(e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest && e.target.closest('a[href]');
      if(!a || a.target === '_blank' || a.hasAttribute('download')) return;
      var href = a.getAttribute('href');
      if(!href || href.charAt(0) === '#' || /^(mailto|tel|javascript):/i.test(href)) return;
      var url; try{ url = new URL(a.href, location.href); }catch(err){ return; }
      if(url.origin !== location.origin) return;
      if(url.pathname === location.pathname && url.hash) return;
      e.preventDefault();
      root.classList.add('jm-leaving');
      setTimeout(function(){ location.href = url.href; }, 280);
    });
    window.addEventListener('pageshow', function(e){ if(e.persisted) root.classList.remove('jm-leaving'); });
  }

  /* entrance animations step aside once finished, so the site's own looping animations resume */
  document.addEventListener('animationend', function(e){ if(e.animationName === 'jmHin' && e.target.classList) e.target.classList.remove('jm-hin'); });

  /* ---------- 3. reveals ---------- */
  /* word splitter: text is split into words that rise out of a mask; child elements move as one unit */
  function split(el){
    if(!el || el.classList.contains('jm-split')) return;
    var i = 0, frag = document.createDocumentFragment();
    [].slice.call(el.childNodes).forEach(function(n){
      if(n.nodeType === 3){
        n.textContent.split(/(\s+)/).forEach(function(part){
          if(!part) return;
          if(/^\s+$/.test(part)){ frag.appendChild(document.createTextNode(' ')); return; }
          var w = document.createElement('span'); w.className = 'jm-w';
          var inner = document.createElement('span'); inner.className = 'jm-wi'; inner.style.setProperty('--jm-i', i++); inner.textContent = part;
          w.appendChild(inner); frag.appendChild(w);
        });
      }else if(n.nodeType === 1 && n.tagName !== 'BR'){
        var w2 = document.createElement('span'); w2.className = 'jm-w';
        if(getComputedStyle(n).display === 'block') w2.classList.add('jm-blk');
        n.classList.add('jm-wi'); n.style.setProperty('--jm-i', i++);
        w2.appendChild(n); frag.appendChild(w2);
      }else frag.appendChild(n);
    });
    el.textContent = ''; el.appendChild(frag); el.classList.add('jm-split');
    el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
  }

  /* elements the site already animates in on its own (they use .visible) are left alone */
  var OWN = '.rh-card,.reward-card,.podium-card,.social-card,.how-step,.faq-item,.hub-card,.tier-card,.bonus-card,.refer-hero-card';
  var REVEAL = [
    '.section-header', '.rh-start', '.pg-start', '.jm-rail', '.access-stake-banner-new', '.vip-rules-card', '.hrb-card', '.referral-gets',
    '.lb-tabs', '.countdown-bar', '.lb-pool-card', '.cutoff-banner', '.lb-podium-wrap', '.lb-table-wrap', '.wager-rules', '.claim-notice',
    '.refer-update-banner', '.refer-section-label', '.rg-card', '.ref-step', '.refer-cta', '.refer-fine',
    '.stream-info', '.stream-card', '.paid-inner', '.legal-wrap',
    '.footer-brand', '.footer-col', '.footer-responsible', '.footer-disclaimer'
  ].join(',');
  var els = [].slice.call(document.querySelectorAll(REVEAL)).filter(function(el){ return !el.matches(OWN) && !el.closest('.hero') && !el.closest('#mobile-bottom-nav'); });
  document.querySelectorAll('.section-header h2, .page-hero h1').forEach(split);
  els.forEach(function(el){ el.classList.add('jm-rv'); });
  var st = document.querySelector('.stream-info'), sc = document.querySelector('.stream-card');
  if(st) st.classList.add('jm-rv-l'); if(sc) sc.classList.add('jm-rv-r');

  function done(el){
    /* hand the element back to the site's own transitions once it has settled */
    setTimeout(function(){ el.classList.remove('jm-rv', 'jm-rv-l', 'jm-rv-r', 'jm-in'); el.style.removeProperty('--jm-d'); }, 1500);
  }
  if(RM || !('IntersectionObserver' in window)){
    els.forEach(function(el){ el.classList.add('jm-in'); done(el); });
    document.querySelectorAll('.jm-split').forEach(function(h){ h.classList.add('jm-in'); });
  }else{
    var io = new IntersectionObserver(function(es){
      var shown = es.filter(function(e){ return e.isIntersecting; })
        .sort(function(a, b){ return (a.boundingClientRect.top - b.boundingClientRect.top) || (a.boundingClientRect.left - b.boundingClientRect.left); });
      shown.forEach(function(e, k){
        var el = e.target; io.unobserve(el);
        if(!el.style.getPropertyValue('--jm-d')) el.style.setProperty('--jm-d', (Math.min(k, 6) * 0.075) + 's');
        el.classList.add('jm-in');
        if(el.classList.contains('jm-rv')) done(el);
        var h = el.querySelector && el.querySelector('.jm-split'); if(h) h.classList.add('jm-in');
        var tg = el.querySelector && el.querySelector('.section-tag'); if(tg) tg.classList.add('jm-sweep');
      });
    }, { threshold: 0, rootMargin: '0px 0px -8% 0px' }); /* threshold 0: very tall blocks (a 100-row leaderboard) must still reveal */
    els.forEach(function(el){ io.observe(el); });
    document.querySelectorAll('.jm-split').forEach(function(h){ if(!h.closest('.jm-rv')) io.observe(h); });
  }

  /* inner-page heroes: aurora + staggered entrance */
  document.querySelectorAll('.page-hero').forEach(function(ph){
    var au = document.createElement('div'); au.className = 'jm-aurora'; au.setAttribute('aria-hidden', 'true');
    au.innerHTML = '<b></b><i></i><i></i><i></i>'; ph.insertBefore(au, ph.firstChild);
    var d = 0.1;
    [].slice.call(ph.children).forEach(function(c){
      if(c === au) return;
      if(c.tagName === 'H1'){ c.style.setProperty('--jm-d0', d + 's'); setTimeout(function(){ c.classList.add('jm-in'); }, 30); }
      else{ c.classList.add('jm-hin'); c.style.setProperty('--jm-d', d + 's'); if(c.classList.contains('section-tag')) c.classList.add('jm-sweep'); }
      d += 0.12;
    });
    au.setAttribute('data-jm-par', '0.35');
  });

  /* ---------- 6. home ---------- */
  var heroContent = null, heroCards = null, bands = [], howline = null;
  if(isHome){
    var hero = document.querySelector('.hero');
    heroContent = hero.querySelector('.hero-content');
    heroCards = hero.querySelector('.hero-cards');
    var title = hero.querySelector('.hero-title');
    split(title); title.style.setProperty('--jm-d0', '.25s');
    setTimeout(function(){ title.classList.add('jm-in'); }, 40);
    var d2 = 0.1;
    /* the site already fades the hero pieces in; only the "$1,000,000 given away" pill needed one */
    var ga = heroContent.querySelector('.hero-givenaway');
    if(ga){ ga.classList.add('jm-hin'); ga.style.setProperty('--jm-d', '.22s'); }

    /* crossing gold marquee bands, between the rewards grid and "how it works" */
    var how = document.querySelector('.how-section');
    if(how){
      var items = ['Code <b>JAKE</b>', '$75,000 Monthly Leaderboard', '$500 Daily Giveaway', 'Rank-Up Rewards', 'Lossback', 'Refer a Friend', 'Over $1,000,000 Given Away'];
      var row = items.map(function(t){ return '<span>' + t.replace(/<\/?b>/g, '') + '</span><i>✦</i>'; }).join('');
      var wrap = document.createElement('div'); wrap.className = 'jm-bands'; wrap.setAttribute('aria-hidden', 'true');
      wrap.innerHTML = '<div class="jm-band b"><div class="jm-mq-track"><div class="jm-mq-row">' + row + '</div><div class="jm-mq-row">' + row + '</div><div class="jm-mq-row">' + row + '</div></div></div>'
                     + '<div class="jm-band a"><div class="jm-mq-track"><div class="jm-mq-row">' + row + '</div><div class="jm-mq-row">' + row + '</div><div class="jm-mq-row">' + row + '</div></div></div>';
      how.parentNode.insertBefore(wrap, how);
      bands = [
        { el: wrap.querySelector('.jm-band.a .jm-mq-track'), x: 0, dir: -1, w: 0 },
        { el: wrap.querySelector('.jm-band.b .jm-mq-track'), x: 0, dir: 1, w: 0 }
      ];
      bands.wrap = wrap;
    }
  }
  function measureBands(){ bands.forEach(function(b){ var r = b.el.firstElementChild; b.w = r ? r.getBoundingClientRect().width : 0; if(b.dir > 0) b.x = -b.w; }); }
  if(bands.length){ setTimeout(measureBands, 300); if(document.fonts && document.fonts.ready) document.fonts.ready.then(measureBands); window.addEventListener('resize', measureBands); }

  /* ---------- 7. polish: card beams, floating icons, count-ups, gold dust, table rows ---------- */
  var CARDS = '.rh-card,.reward-card,.hub-card,.tier-card,.bonus-card,.social-card,.lb-pool-card,.refer-hero-card,.rg-card,.how-step,.countdown-bar,.vip-rules-card,.access-stake-banner-new,.faq-item,.ref-step';
  var beamIO = ('IntersectionObserver' in window && !FINE && !RM) ? new IntersectionObserver(function(es){
    es.forEach(function(e){ if(e.isIntersecting){ var b = e.target.querySelector(':scope > .jm-beam'); if(b) b.classList.add('jm-once'); beamIO.unobserve(e.target); } });
  }, { threshold: 0.45 }) : null;
  document.querySelectorAll(CARDS).forEach(function(c){
    if(c.querySelector(':scope > .jm-beam')) return;
    if(getComputedStyle(c).position === 'static') c.style.position = 'relative';
    var b = document.createElement('span'); b.className = 'jm-beam'; b.setAttribute('aria-hidden', 'true'); c.appendChild(b);
    if(beamIO && !c.matches('.faq-item,.ref-step')) beamIO.observe(c);
  });

  if(!RM) document.querySelectorAll('.reward-icon,.hub-icon-wrap,.tier-icon,.how-icon-wrap,.social-icon,.bonus-icon,.rh-icon,.rg-icon').forEach(function(el, i){
    if(getComputedStyle(el).animationName !== 'none') return;
    el.classList.add('jm-bob'); el.style.setProperty('--jm-bd', (-(i % 7) * 0.65) + 's');
  });

  /* amounts count up the first time they scroll into view (only simple single numbers) */
  var NUM = /^(\D*?)(\d[\d,]*(?:\.\d+)?)(\D*)$/;
  var cntIO = ('IntersectionObserver' in window && !RM) ? new IntersectionObserver(function(es){
    es.forEach(function(e){
      if(!e.isIntersecting) return; cntIO.unobserve(e.target);
      var el = e.target, orig = el.getAttribute('data-jm-orig'), m = orig.match(NUM); if(!m) return;
      var to = parseFloat(m[2].replace(/,/g, '')), dec = (m[2].split('.')[1] || '').length, comma = m[2].indexOf(',') > -1, t0 = performance.now(), dur = 1500;
      (function step(now){
        var k = Math.min(1, (now - t0) / dur), v = to * (1 - Math.pow(1 - k, 4));
        var txt = dec ? v.toFixed(dec) : String(Math.round(v)); if(comma) txt = Number(txt).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
        el.textContent = k < 1 ? m[1] + txt + m[3] : orig;
        if(k < 1) requestAnimationFrame(step); else { el.classList.add('jm-counted'); }
      })(t0);
    });
  }, { threshold: 0.6 }) : null;
  if(cntIO) document.querySelectorAll('.pg-stat b,.pc-val,.rh-stat b,.rh-art-big,.reward-amount,.tier-reward,.tc-reward,.rg-val,.bonus-amount-badge,.paid-counter-static').forEach(function(el){
    if(el.children.length) return;
    var t = el.textContent.trim(); if(!NUM.test(t)) return;
    el.setAttribute('data-jm-orig', t); cntIO.observe(el);
  });

  function dustShadows(n, w, h){
    var out = [];
    for(var k = 0; k < n; k++){
      var x = Math.round(Math.random() * w), y = Math.round(Math.random() * h), a = (0.18 + Math.random() * 0.45).toFixed(2), sp = Math.random() < 0.3 ? 1 : 0;
      var col = Math.random() < 0.8 ? 'rgba(252,194,0,' + a + ')' : 'rgba(255,240,200,' + a + ')';
      out.push(x + 'px ' + y + 'px 0 ' + sp + 'px ' + col, x + 'px ' + (y + h) + 'px 0 ' + sp + 'px ' + col);
    }
    return out.join(',');
  }
  var dustIO = ('IntersectionObserver' in window) ? new IntersectionObserver(function(es){ es.forEach(function(e){ e.target.classList.toggle('jm-off', !e.isIntersecting); }); }, { rootMargin: '100px 0px' }) : null;
  if(!RM) document.querySelectorAll('.rewards-section,.how-section,.faq-section,.socials-section,.lb-preview-section,.page-hero,.vip-rules-section,.lb-wrap,.refer-wrap,.hub-grid,.bonus-grid').forEach(function(sec){
    sec.classList.add('jm-dusty');
    var d = document.createElement('div'); d.className = 'jm-dust'; d.setAttribute('aria-hidden', 'true');
    var w = Math.max(1600, sec.offsetWidth);
    d.innerHTML = '<i style="box-shadow:' + dustShadows(26, w, 1200) + '"></i><i style="box-shadow:' + dustShadows(16, w, 1200) + '"></i>';
    sec.insertBefore(d, sec.firstChild);
    if(dustIO) dustIO.observe(sec);
  });

  /* leaderboard rows slide in as the table renders */
  var lbBody = document.getElementById('lb-body');
  if(lbBody && 'MutationObserver' in window && !RM){
    new MutationObserver(function(){
      var i = 0;
      lbBody.querySelectorAll('tr.lb-row:not(.jm-row-done)').forEach(function(tr){
        tr.classList.add('jm-row-done');
        if(i < 24){ tr.classList.add('jm-row'); tr.style.setProperty('--jm-i', i); }
        i++;
      });
    }).observe(lbBody, { childList: true });
  }

  /* reading progress bar on pages that didn't have one */
  var sbar = document.getElementById('scroll-bar');
  if(!sbar){ sbar = document.createElement('div'); sbar.id = 'scroll-bar'; sbar.style.cssText = 'position:fixed;top:0;left:0;height:3px;width:0;background:linear-gradient(90deg,#FCC200,#ff9d2f,#00d4ff);z-index:9999;box-shadow:0 0 10px rgba(252,194,0,.6);pointer-events:none'; document.body.appendChild(sbar); sbar._jm = 1; }

  /* ---------- 4 + 6. one scroll/animation loop ---------- */
  var nav = document.querySelector('.nav');
  var mob = document.getElementById('mobile-nav');
  var pars = [].slice.call(document.querySelectorAll('[data-jm-par]'));
  var lastY = window.scrollY, vel = 0, skew = 0, navY = 0, acc = 0;
  function tick(t){
    requestAnimationFrame(tick);
    if(lenis) lenis.raf(t);
    if(document.hidden) return;
    var y = lenis ? lenis.scroll : window.scrollY, dy = y - lastY; lastY = y;
    vel += (dy - vel) * 0.2;
    var vh = window.innerHeight;

    if(nav){
      nav.classList.toggle('jm-scrolled', y > 24);
      var open = mob && mob.classList.contains('open');
      if(dy > 0) acc = Math.max(0, acc) + dy; else if(dy < 0) acc = Math.min(0, acc) + dy;
      if(!open && y > 420 && acc > 60) nav.classList.add('jm-hide');
      if(open || y < 200 || acc < -24) nav.classList.remove('jm-hide');
    }
    if(RM) return;
    if(Math.abs(dy) > 0.05 || !tick.i){
      tick.i = 1;
      if(sbar && sbar._jm){ var tot = (document.documentElement.scrollHeight - vh) || 1; sbar.style.width = Math.min(100, y / tot * 100) + '%'; }
      pars.forEach(function(el){ if(y < vh * 1.5) el.style.translate = '0 ' + (y * parseFloat(el.getAttribute('data-jm-par'))).toFixed(1) + 'px'; });
      /* hero text stays fully visible while scrolling (the code card must always be readable); only the background moves */
      if(heroCards && y < vh * 1.3) heroCards.style.translate = '0 ' + (y * -0.12).toFixed(1) + 'px';
      if(howline){
        var r = howline.parentNode.getBoundingClientRect();
        if(r.top < vh && r.bottom > 0){ var p = Math.max(0, Math.min(1, (vh * 0.75 - r.top) / (r.height * 0.7))); howline.style.setProperty('--p', p.toFixed(3)); }
      }
    }
    if(bands.length && bands[0].w){
      var br = bands.wrap.getBoundingClientRect();
      if(br.bottom > -40 && br.top < vh + 40){
        var sp = 0.6 + Math.min(Math.abs(vel) * 0.3, 12);
        skew += ((Math.max(-7, Math.min(7, -vel * 0.3))) - skew) * 0.12;
        bands.forEach(function(b){
          b.x += sp * b.dir;
          if(b.x <= -b.w) b.x += b.w; if(b.x > 0) b.x -= b.w;
          b.el.style.transform = 'translate3d(' + b.x.toFixed(2) + 'px,0,0) skewX(' + skew.toFixed(2) + 'deg)';
        });
      }
    }
    springs();
  }
  requestAnimationFrame(tick);

  /* ---------- 5. tilt + magnetic (desktop) ---------- */
  var active = [];
  function springs(){
    for(var n = active.length - 1; n >= 0; n--){
      var s = active[n];
      s.cx += (s.tx - s.cx) * 0.14; s.cy += (s.ty - s.cy) * 0.14;
      if(s.kind === 'tilt'){
        var ang = Math.sqrt(s.cx * s.cx + s.cy * s.cy);
        s.el.style.rotate = ang < 0.02 ? '' : ((-s.cy).toFixed(3) + ' ' + s.cx.toFixed(3) + ' 0 ' + ang.toFixed(2) + 'deg');
      }else{
        s.el.style.translate = (Math.abs(s.cx) < 0.05 && Math.abs(s.cy) < 0.05) ? '' : (s.cx.toFixed(2) + 'px ' + s.cy.toFixed(2) + 'px');
      }
      if(!s.on && Math.abs(s.cx) < 0.02 && Math.abs(s.cy) < 0.02){ s.el.style.rotate = ''; s.el.style.translate = ''; s.el._jm = null; active.splice(n, 1); }
    }
  }
  function state(el, kind){ if(!el._jm){ el._jm = { el: el, kind: kind, cx: 0, cy: 0, tx: 0, ty: 0, on: true }; active.push(el._jm); } el._jm.on = true; return el._jm; }
  if(FINE && !RM){
    var TILT = '.rh-card,.reward-card,.hub-card,.tier-card,.bonus-card,.social-card,.lb-pool-card,.refer-hero-card,.rg-card,.how-step,.hs-card';
    var MAG = '.btn-primary,.btn-ghost,.nav-cta,.code-copy-btn,.asb-cta,.stream-watch-btn';
    document.querySelectorAll(TILT).forEach(function(c){ if(c.parentNode) c.parentNode.style.perspective = '1100px'; });
    document.addEventListener('pointermove', function(e){
      var t = e.target.closest && e.target.closest(TILT);
      if(t){ var r = t.getBoundingClientRect(), s = state(t, 'tilt');
        var max = r.width > 420 ? 3.5 : 6;
        s.tx = ((e.clientX - r.left) / r.width - .5) * 2 * max; s.ty = ((e.clientY - r.top) / r.height - .5) * 2 * max; }
      var m = e.target.closest && e.target.closest(MAG);
      if(m){ var mr = m.getBoundingClientRect(), ms = state(m, 'mag');
        ms.tx = (e.clientX - mr.left - mr.width / 2) * 0.22; ms.ty = (e.clientY - mr.top - mr.height / 2) * 0.3; }
    }, { passive: true });
    document.addEventListener('pointerout', function(e){
      var el = e.target.closest && e.target.closest(TILT + ',' + MAG);
      if(!el || !el._jm || (e.relatedTarget && el.contains(e.relatedTarget))) return;
      el._jm.tx = 0; el._jm.ty = 0; el._jm.on = false;
    });
  }
})();

/* ── Performance: pause every looping CSS animation inside sections that are off-screen ──
   Looping glows/shines keep the browser repainting even when you can't see them, which is what
   makes long pages stutter on phones. Sections resume (with 200px of lead) as they scroll back in. */
(function(){
  if(!('IntersectionObserver' in window)) return;
  var SEL = 'section, footer, .page-hero, .hero, .lb-wrap > *, .refer-wrap > *, .rh-grid > *, .rh-start, .vt-wrap, .tiers-grid > *, .bonus-card, .wins-ticker, .rewards-grid > *, .faq-item, .pg-strip';
  function arm(){
    var els = [].slice.call(document.querySelectorAll(SEL));
    if(!els.length) return;
    var io = new IntersectionObserver(function(es){ es.forEach(function(e){ e.target.classList.toggle('jm-pz', !e.isIntersecting); }); }, { rootMargin: '200px 0px' });
    els.forEach(function(el){ if(!el.__jmPz){ el.__jmPz = 1; io.observe(el); } });
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arm); else arm();
  window.addEventListener('load', arm);
})();
