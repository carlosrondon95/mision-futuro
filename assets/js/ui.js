(function(){
  const root = document.getElementById('qr-modal-root');

  function close(){ const m = document.querySelector('.qr-modal'); if (m) m.remove(); }

  function questionModal(qObj, onAnswer){
    if (document.querySelector('.qr-modal')) return;
    const modal = document.createElement('div');
    modal.className = 'qr-modal';
    const card = document.createElement('div');
    card.className = 'qr-card';

    card.innerHTML = `
      <div class="qr-q">${qObj.q}</div>
      <div class="qr-opts"></div>
    `;

    const opts = card.querySelector('.qr-opts');
    qObj.opts.forEach(op=>{
      const b = document.createElement('button');
      b.className = 'qr-opt';
      b.textContent = op;
      b.addEventListener('click', ()=>{ close(); onAnswer && onAnswer(op); });
      opts.appendChild(b);
    });

    modal.appendChild(card); root.appendChild(modal);
  }

  function formModal(onSubmit){
    if (document.querySelector('.qr-modal')) return;
    const modal = document.createElement('div');
    modal.className = 'qr-modal';
    const card = document.createElement('div');
    card.className = 'qr-card';

    card.innerHTML = `
      <div class="qr-q">Déjanos tus datos y te enviaremos tu resultado</div>
      <div class="qr-row"><label>Nombre</label><input class="qr-input" id="fName" type="text" placeholder="Tu nombre"></div>
      <div class="qr-row"><label>Email</label><input class="qr-input" id="fEmail" type="email" placeholder="tu@email">
      </div>
      <div class="qr-row"><label>Teléfono</label><input class="qr-input" id="fPhone" type="tel" placeholder="+34 600 000 000"></div>
      <div class="qr-row qr-consent"><label><input id="fConsent" type="checkbox"> Acepto la Política de Privacidad</label></div>
      <button class="qr-btn" id="btnSend">Enviar</button>
    `;

    card.querySelector('#btnSend').addEventListener('click', ()=>{
      const name = val('#fName'); const email = val('#fEmail'); const phone = val('#fPhone');
      const consent = checked('#fConsent') ? '1':'0';
      if (!name || !email) return alert('Nombre y email son obligatorios');
      if (consent!=='1')     return alert('Debes aceptar la política');
      close();
      onSubmit && onSubmit({name,email,phone,consent});
    });

    modal.appendChild(card); root.appendChild(modal);
  }

  function endingModal(result, onRestart){
    const { top1, top2, bullets } = result;
    const modal = document.createElement('div');
    modal.className = 'qr-modal';
    const card = document.createElement('div');
    card.className = 'qr-card';
    card.innerHTML = `
      <h3 class="qr-title">🎖 Ceremonia de Asignación</h3>
      <p>Tu senda encaja con:</p>
      <div class="qr-badge">${top1}</div>
      ${top2 ? `<div class="qr-badge">También: ${top2}</div>` : ''}
      <ul style="text-align:left; display:inline-block; font-size:14px; padding-left:18px;">
        ${bullets.map(b=>`<li>${b}</li>`).join('')}
      </ul>
      <button class="qr-btn" id="btnRestart">Reiniciar</button>
    `;
    modal.appendChild(card); root.appendChild(modal);
    document.getElementById('btnRestart').addEventListener('click', onRestart);
  }

  function val(sel){ const n = document.querySelector(sel); return n ? n.value.trim() : ''; }
  function checked(sel){ const n = document.querySelector(sel); return !!(n && n.checked); }

  window.QRUI = { questionModal, formModal, endingModal, close };
})();
