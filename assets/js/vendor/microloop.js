/* MicroLoop: bucle de juego e input minimalista (sin dependencias) */
(function () {
  const Keys = {
    pressed: new Set(),
    isDown(code){ return this.pressed.has(code); }
  };
  window.addEventListener('keydown', e => Keys.pressed.add(e.code || e.key));
  window.addEventListener('keyup',   e => Keys.pressed.delete(e.code || e.key));

  function createLoop(update, render){
    let running = false, last = 0, raf = 0;
    function frame(t){
      if (!running) return;
      const dt = (t - last) / 1000; last = t;
      try { update(dt, Keys); } catch(e){ console.error(e); running=false; return; }
      try { render(); } catch(e){ console.error(e); running=false; return; }
      raf = requestAnimationFrame(frame);
    }
    return {
      start(){ if (running) return; running = true; last = performance.now(); raf = requestAnimationFrame(frame); },
      stop(){ running = false; cancelAnimationFrame(raf); },
      isRunning(){ return running; }
    };
  }

  window.MicroLoop = { createLoop, Keys };
})();
