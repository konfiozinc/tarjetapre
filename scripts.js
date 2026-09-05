(function() {
    const WA = '573206411340';
    let qrGenerado = false;

    function setupModal(btnId, modalId) {
        const btn   = document.getElementById(btnId);
        const modal = document.getElementById(modalId);
        if (!btn || !modal) return;
        const closeBtn = modal.querySelector('.modal-close');

        const open = () => {
            modal.style.display = 'flex';
            setTimeout(() => modal.classList.add('active'), 10);
            document.body.style.overflow = 'hidden';
            if (modalId === 'agenda-modal') resetAgenda();
            if (modalId === 'qr-modal' && !qrGenerado) generarQR();
        };
        const close = () => {
            modal.classList.remove('active');
            setTimeout(() => { modal.style.display = 'none'; }, 300);
            document.body.style.overflow = '';
        };
        btn.addEventListener('click', open);
        if (closeBtn) closeBtn.addEventListener('click', close);
        modal.addEventListener('click', e => { if (e.target === modal) close(); });
    }

    setupModal('agenda-btn',    'agenda-modal');
    setupModal('services-btn',  'services-modal');
    setupModal('portfolio-btn', 'portfolio-modal');
    setupModal('qr-btn',        'qr-modal');
    setupModal('qr-badge-btn',  'qr-modal');
    setupModal('install-btn',   'install-modal');
    setupModal('video-btn',     'video-modal');
    setupModal('video-thumb-btn','video-modal');
    setupModal('compare-btn',   'compare-modal');
    setupModal('faq-btn',       'faq-modal');

    const ANALYTICS_KEY = 'kz_analytics';

    function trackEvent(label) {
        try {
            const raw   = localStorage.getItem(ANALYTICS_KEY);
            const stats = raw ? JSON.parse(raw) : {};
            stats[label] = (stats[label] || 0) + 1;
            localStorage.setItem(ANALYTICS_KEY, JSON.stringify(stats));
        } catch(e) {}
    }

    trackEvent('👁 Vista de tarjeta');

    const trackMap = {
        'agenda-btn':       '📅 Agenda',
        'services-btn':      '📋 Servicios',
        'portfolio-btn':    '🖼 Portafolio',
        'qr-btn':           '🔲 QR',
        'qr-badge-btn':     '🔲 QR (badge)',
        'save-btn':         '💾 Guardar contacto',
        'install-btn':      '📲 Instalar',
        'compare-btn':      '📊 Comparar planes',
        'faq-btn':          '❓ Preguntas',
        'video-thumb-btn':  '▶️ Video',
        'video-btn':        '▶️ Video (btn)',
    };
    Object.entries(trackMap).forEach(([id, label]) => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('click', () => trackEvent(label), { passive: true });
    });

    document.querySelector('a[href^="tel:"]')?.addEventListener('click', () => trackEvent('📞 Llamar'), { passive: true });
    document.querySelector('a[href^="mailto:"]')?.addEventListener('click', () => trackEvent('✉️ Correo'), { passive: true });
    document.querySelector('.whatsapp-fixed')?.addEventListener('click', () => trackEvent('💬 WhatsApp flotante'), { passive: true });
    document.querySelector('.btn-gold')?.addEventListener('click', () => trackEvent('⚡ CTA principal'), { passive: true });
    document.querySelector('.recommend-btn')?.addEventListener('click', () => trackEvent('🤝 Recomiéndame'), { passive: true });

    (function(){
        let taps = 0, timer;
        const footer = document.getElementById('footer-tap');
        if (!footer) return;
        footer.addEventListener('click', () => {
            taps++;
            clearTimeout(timer);
            timer = setTimeout(() => { taps = 0; }, 800);
            if (taps >= 3) {
                taps = 0;
                renderAnalytics();
                const m = document.getElementById('analytics-modal');
                m.style.display = 'flex';
                setTimeout(() => m.classList.add('active'), 10);
                document.body.style.overflow = 'hidden';
            }
        });

        const modal = document.getElementById('analytics-modal');
        const closeBtn = modal?.querySelector('.modal-close');
        if (closeBtn) closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
            setTimeout(() => { modal.style.display = 'none'; }, 300);
            document.body.style.overflow = '';
        });
        modal?.addEventListener('click', e => {
            if (e.target === modal) {
                modal.classList.remove('active');
                setTimeout(() => { modal.style.display = 'none'; }, 300);
                document.body.style.overflow = '';
            }
        });

        document.getElementById('analytics-clear')?.addEventListener('click', () => {
            localStorage.removeItem(ANALYTICS_KEY);
            renderAnalytics();
        });
    })();

    function renderAnalytics() {
        const container = document.getElementById('analytics-content');
        if (!container) return;
        try {
            const raw   = localStorage.getItem(ANALYTICS_KEY);
            const stats = raw ? JSON.parse(raw) : {};
            const entries = Object.entries(stats).sort((a,b) => b[1] - a[1]);
            if (!entries.length) {
                container.innerHTML = '<div class="stat-empty">Aún no hay datos registrados</div>';
                return;
            }
            const max = entries[0][1];
            const total = entries.reduce((s,[,v]) => s+v, 0);
            container.innerHTML = `
                <div style="font-size:11px;color:var(--gold);font-family:'Syne',sans-serif;margin-bottom:12px;text-align:center;">
                    <strong style="font-size:18px;font-family:'Orbitron',sans-serif;">${total}</strong> interacciones totales
                </div>
                ${entries.map(([label, count]) => `
                    <div class="stat-row">
                        <span class="stat-label">${label}</span>
                        <div class="stat-bar-wrap">
                            <div class="stat-bar" style="width:${Math.round(count/max*100)}%"></div>
                        </div>
                        <span class="stat-count">${count}</span>
                    </div>`).join('')}
            `;
        } catch(e) {
            container.innerHTML = '<div class="stat-empty">Error al leer estadísticas</div>';
        }
    }

    document.querySelectorAll('.faq-q').forEach(q => {
        q.addEventListener('click', () => {
            const item = q.parentElement;
            const isOpen = item.classList.contains('open');
            document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
            if (!isOpen) item.classList.add('open');
        });
    });

    function generarQR() {
        const c = document.getElementById('qrcode-container');
        c.innerHTML = '';
        new QRCode(c, {
            text: window.location.href,
            width: 160, height: 160,
            colorDark: '#000000', colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.H
        });
        qrGenerado = true;
    }

    document.getElementById('save-btn').addEventListener('click', () => {
        const vCard = `BEGIN:VCARD\nVERSION:3.0\nFN:Darwin Montalvo\nORG:KONFÍO ZINC\nTITLE:Creador de Tarjetas Digitales\nTEL;TYPE=CELL:+57 320 641 1340\nEMAIL:konfiozinc@gmail.com\nURL:${window.location.href}\nEND:VCARD`;
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([vCard], { type: 'text/vcard;charset=utf-8' }));
        a.download = 'Darwin_Montalvo_KONFIO_ZINC.vcf';
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
    });

    /* ── Portafolio con todos los enlaces actualizados ────────── */
    const portfolioData = [
        { title:'Tarjeta PRE',               sub:'Tarjeta Principal · KONFÍO ZINC',          cat:'tarjetas',     color:'240,180,41', tag:'Tarjeta Principal', url:'https://konfiozinc.github.io/tarjetapre/' },
        { title:'Alí Binary Options',       sub:'Plataforma · Trading Digital',            cat:'plataformas',  color:'168,85,247', tag:'Trading',           url:'https://konfiozinc.github.io/ali-binary-opcion/' },
        { title:'KONFÍO Sports',            sub:'Hub Deportivo · Fútbol Mundial',          cat:'plataformas',  color:'0,229,255',  tag:'Hub Deportivo',     url:'https://konfiozinc.github.io/konfio-sports/' },
        { title:'Quiromasajes GAP',         sub:'Tarjeta Digital · Bienestar',              cat:'tarjetas',     color:'74,222,128', tag:'Tarjeta Digital',   url:'https://konfiozinc.github.io/quiromasajes-gap/' },
        { title:'EL TITI',                  sub:'Menú Digital · Comidas Rápidas',          cat:'catalogos',    color:'249,115,22', tag:'Menú Digital',      url:'https://konfiozinc.github.io/eltiti/' },
        { title:'Abogados DTA',             sub:'Landing Page · Derecho Administrativo',   cat:'landing',      color:'0,229,255',  tag:'Landing Legal',     url:'https://konfiozinc.github.io/abogados-dta/' },
        { title:'Mega Express',            sub:'Tarjeta Digital · Mensajería',            cat:'tarjetas',     color:'249,115,22', tag:'Tarjeta Digital',   url:'https://konfiozinc.github.io/mega-express/' },
        { title:'NP Style',                 sub:'Tarjeta Digital · Peluquería',            cat:'belleza',      color:'244,114,182',tag:'Belleza',           url:'https://konfiozinc.github.io/np-style/' },
        { title:'Fumigaciones Monterrey',  sub:'Tarjeta Digital · Servicios del Hogar',   cat:'tarjetas',     color:'74,222,128', tag:'Tarjeta Digital',   url:'https://konfiozinc.github.io/fumigaciones-monterrey/' },
        { title:'The Big Bang Carranga',   sub:'Tarjeta Digital · Música',                cat:'tarjetas',     color:'168,85,247', tag:'Entretenimiento',   url:'https://konfiozinc.github.io/the-big-bang-carranga/' },
        { title:'Nandy Nails',              sub:'Tarjeta Digital · Nail Art',              cat:'belleza',      color:'244,114,182',tag:'Nail Art',          url:'https://konfiozinc.github.io/nandy_nails/' },
        { title:'Makeup Artist',            sub:'Tarjeta Digital · Maquillaje Artístico', cat:'belleza',      color:'244,114,182',tag:'Makeup',            url:'https://konfiozinc.github.io/makeup_artist/' },
        { title:'Barbería La Cañada',      sub:'Tarjeta Digital · Barbería & Estilo',    cat:'belleza',      color:'0,229,255',  tag:'Barbería',          url:'https://konfiozinc.github.io/ca-ada_style/' },
        { title:'Carnicería La Milagrosa', sub:'Catálogo Digital · Carnicería',          cat:'catalogos',    color:'249,115,22', tag:'Catálogo',          url:'https://konfiozinc.github.io/carniceria_la_milagrosa/' },
        { title:'Fumig Master',            sub:'Tarjeta Digital · Fumigaciones',          cat:'tarjetas',     color:'74,222,128', tag:'Tarjeta Digital',   url:'https://konfiozinc.github.io/fumig_master/' },
        { title:'DG Ventas Avalúos',       sub:'Landing Page · Avalúos & Bienes Raíces', cat:'inmobiliaria', color:'240,180,41', tag:'Avalúos',           url:'https://konfiozinc.github.io/dg_ventas_avaluos/' },
        { title:'Century 21 Radial',       sub:'Landing Page · Inmobiliaria',             cat:'inmobiliaria', color:'240,180,41', tag:'Inmobiliaria',      url:'https://konfiozinc.github.io/century_21_radial/' },
        { title:'GP Inmobiliaria',         sub:'Landing Page · Lotes y Terrenos',         cat:'inmobiliaria', color:'240,180,41', tag:'Finca Raíz',        url:'https://konfiozinc.github.io/gp/' },
        { title:'Calixto Acordeón Mágico', sub:'Tarjeta Digital · Música Vallenata',    cat:'tarjetas',     color:'168,85,247', tag:'Entretenimiento',   url:'https://konfiozinc.github.io/calixto_acordeon_magico/' },
        { title:'Deicy Buitrago',          sub:'Tarjeta Digital · Artista & Creadora',  cat:'belleza',      color:'244,114,182',tag:'Artista',           url:'https://konfiozinc.github.io/deicy-buitrago/' },
        { title:'Proyecto DTA',            sub:'Landing Page · Proyecto Legal',          cat:'landing',      color:'0,229,255',  tag:'Landing Legal',     url:'https://konfiozinc.github.io/proyecto-dta/' },
        { title:'Lizeth Lozano',           sub:'Tarjeta Digital · Contadora Pública',   cat:'tarjetas',     color:'0,229,255',  tag:'Contabilidad',      url:'https://konfiozinc.github.io/lizeth_lozano/' },
        { title:'NutriDrink',              sub:'Catálogo Digital · Nutrición & Bebidas', cat:'catalogos',    color:'74,222,128', tag:'Catálogo',          url:'https://konfiozinc.github.io/nutridrink/' },
        { title:'Dónde Compro',            sub:'Plataforma · Directorio Comercial',     cat:'plataformas',  color:'240,180,41', tag:'Directorio',        url:'https://konfiozinc.github.io/dondecompro/' },
        { title:'Prored FEDPAZCO',         sub:'Landing Page · Organización Social',     cat:'landing',      color:'0,229,255',  tag:'Institucional',     url:'https://konfiozinc.github.io/prored_fedpazco/' },
        { title:'Servicios Odontológicos', sub:'Tarjeta Digital · Salud Dental',         cat:'tarjetas',     color:'0,229,255',  tag:'Salud',             url:'https://konfiozinc.github.io/servicios_odontologicos/' },
        { title:'Cirujana Dentista',       sub:'Tarjeta Digital · Odontología',         cat:'tarjetas',     color:'0,229,255',  tag:'Salud',             url:'https://konfiozinc.github.io/cirujana_dentista/' },
        { title:'Diseño Gráfico',          sub:'Tarjeta Digital · Servicios Creativos',  cat:'tarjetas',     color:'168,85,247', tag:'Creativo',          url:'https://konfiozinc.github.io/diseno_grafico/' },
        { title:'Pastelería Artesanal',    sub:'Catálogo Digital · Repostería',          cat:'catalogos',    color:'249,115,22', tag:'Catálogo',          url:'https://konfiozinc.github.io/pasteleria_artesanal/' },
        { title:'Decoradora de Fiestas',   sub:'Tarjeta Digital · Eventos',             cat:'tarjetas',     color:'244,114,182',tag:'Eventos',           url:'https://konfiozinc.github.io/decoradora_de_fiestas/' },
        { title:'Nutrición Funcional',     sub:'Tarjeta Digital · Salud & Nutrición',   cat:'tarjetas',     color:'74,222,128', tag:'Salud',             url:'https://konfiozinc.github.io/nutricion_funcional/' },
        { title:'Nutricionista',           sub:'Tarjeta Digital · Asesoría Nutricional', cat:'tarjetas',     color:'74,222,128', tag:'Salud',             url:'https://konfiozinc.github.io/nutricionista/' }
    ].map(p => ({ ...p, type: 'project', thumb: `https://image.thum.io/get/width/600/crop/900/${p.url}` }));

    function buildPortfolio() {
        const grid = document.getElementById('pf-grid');
        if (!grid) return;
        grid.innerHTML = portfolioData.map((p, i) => {
            return `
            <div class="pf-card" data-cat="${p.cat}" data-index="${i}">
                <div class="pf-thumb-wrap">
                    <img src="${p.thumb}"
                         alt="${p.title}"
                         loading="lazy"
                         onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
                    <div style="display:none;position:absolute;inset:0;align-items:center;justify-content:center;background:linear-gradient(145deg,rgba(${p.color},0.15),rgba(0,0,0,0.5));">
                        <i class="fas fa-globe" style="font-size:24px;color:rgb(${p.color});opacity:0.7;"></i>
                    </div>
                    <span style="position:absolute;top:6px;left:6px;background:rgba(0,0,0,0.8);border:1px solid rgba(${p.color},0.4);color:rgb(${p.color});font-family:'Syne',sans-serif;font-size:7.5px;font-weight:700;padding:1px 5px;border-radius:4px;letter-spacing:0.04em;backdrop-filter:blur(4px);">${p.tag}</span>
                </div>
                <div class="pf-card-info">
                    <div>
                        <div class="pf-card-name">${p.title}</div>
                        <div class="pf-card-cat">${p.sub}</div>
                    </div>
                    <a href="${p.url}" target="_blank" rel="noopener" class="pf-card-link">
                        <i class="fas fa-arrow-up-right-from-square"></i> Ver Proyecto
                    </a>
                </div>
            </div>`;
        }).join('');
    }

    function filterPortfolio(cat) {
        document.querySelectorAll('.pf-btn').forEach(b =>
            b.classList.toggle('active', b.dataset.cat === cat));
        document.querySelectorAll('.pf-card').forEach(card => {
            const match = cat === 'todos' || card.dataset.cat === cat;
            card.classList.toggle('pf-hidden', !match);
        });
    }

    document.getElementById('pf-filters')?.querySelectorAll('.pf-btn').forEach(btn => {
        btn.addEventListener('click', () => filterPortfolio(btn.dataset.cat));
    });

    buildPortfolio();

    const shareBtn = document.getElementById('native-share-btn');
    if (navigator.share) {
        shareBtn.classList.remove('hidden');
        shareBtn.addEventListener('click', () =>
            navigator.share({ title:'KONFÍO ZINC', text:'Tarjeta digital inteligente', url: window.location.href }));
    }

    let cMonth, cYear, selDate, selTime;

    function resetAgenda() {
        cMonth = new Date().getMonth();
        cYear  = new Date().getFullYear();
        selDate = null; selTime = null;
        renderCalendar();
    }

    function renderCalendar() {
        const firstDay    = new Date(cYear, cMonth, 1).getDay();
        const daysInMonth = new Date(cYear, cMonth+1, 0).getDate();
        const today = new Date(); today.setHours(0,0,0,0);
        const months  = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
        const dayNames= ['Do','Lu','Ma','Mi','Ju','Vi','Sá'];

        let html = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
                <button id="prevMonth" style="padding:7px 12px;border-radius:8px;background:rgba(240,180,41,0.08);border:1px solid rgba(240,180,41,0.2);color:var(--gold);cursor:pointer;font-size:14px;">&#8592;</button>
                <span style="font-family:'Syne',sans-serif;font-weight:700;font-size:15px;color:#fff;">${months[cMonth]} ${cYear}</span>
                <button id="nextMonth" style="padding:7px 12px;border-radius:8px;background:rgba(240,180,41,0.08);border:1px solid rgba(240,180,41,0.2);color:var(--gold);cursor:pointer;font-size:14px;">&#8594;</button>
            </div>
            <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:3px;text-align:center;margin-bottom:6px;">
                ${dayNames.map(d=>`<div style="font-size:10px;color:#444;font-family:'Syne',sans-serif;font-weight:600;padding:3px 0;">${d}</div>`).join('')}
            </div>
            <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:3px;text-align:center;">`;

        for (let i=0;i<firstDay;i++) html += '<div></div>';
        for (let d=1;d<=daysInMonth;d++) {
            const date   = new Date(cYear, cMonth, d);
            const isPast = date < today;
            const isSun  = date.getDay() === 0;
            const isTod  = date.getTime() === today.getTime();
            const isSel  = selDate && date.toDateString()===selDate.toDateString();
            let cls = 'calendar-day';
            if (isPast||isSun) cls+=' disabled';
            if (isTod)  cls+=' today';
            if (isSel)  cls+=' selected';
            const click = (!isPast&&!isSun) ? `onclick="window._agendaDay(${d},${cMonth},${cYear})"` : '';
            html += `<div class="${cls}" ${click}>${d}</div>`;
        }
        html += '</div>';
        document.getElementById('agenda-content').innerHTML = html;
        document.getElementById('prevMonth').addEventListener('click',()=>{cMonth--;if(cMonth<0){cMonth=11;cYear--;}renderCalendar();});
        document.getElementById('nextMonth').addEventListener('click',()=>{cMonth++;if(cMonth>11){cMonth=0;cYear++;}renderCalendar();});
    }

    window._agendaDay = function(d,m,y){ selDate=new Date(y,m,d); renderTimeSlots(); };

    function renderTimeSlots() {
        const dow = selDate.getDay();
        const times = dow>=1&&dow<=5
            ? ['09:00','09:30','10:00','10:30','11:00','11:30','14:00','14:30','15:00','15:30','16:00','16:30']
            : dow===6 ? ['09:00','09:30','10:00','10:30','11:00','11:30'] : [];
        const dateStr = selDate.toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long'});

        let html = `
            <button id="backCal" style="font-size:12px;color:var(--gold);font-family:'Syne',sans-serif;font-weight:600;margin-bottom:12px;background:none;border:none;cursor:pointer;">← Volver</button>
            <p style="font-size:13px;color:#aaa;font-family:'Syne',sans-serif;margin-bottom:12px;text-transform:capitalize;">${dateStr}</p>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">
                ${times.map(t=>`<div class="time-slot" data-time="${t}">${t}</div>`).join('')}
            </div>
            <button id="confirmBtn" disabled
                    style="width:100%;margin-top:18px;padding:12px;background:linear-gradient(135deg,var(--gold),var(--orange));color:#000;font-weight:700;border-radius:12px;border:none;cursor:pointer;font-family:'Syne',sans-serif;font-size:14px;opacity:0.4;pointer-events:none;">
                Continuar →
            </button>`;
        document.getElementById('agenda-content').innerHTML = html;
        document.getElementById('backCal').addEventListener('click', resetAgenda);
        const btn = document.getElementById('confirmBtn');
        document.querySelectorAll('.time-slot').forEach(s => {
            s.addEventListener('click', function(){
                document.querySelectorAll('.time-slot').forEach(x=>x.classList.remove('selected'));
                this.classList.add('selected'); selTime=this.dataset.time;
                btn.disabled=false; btn.style.opacity='1'; btn.style.pointerEvents='auto';
            });
        });
        btn.addEventListener('click', showForm);
    }

    function showForm() {
        const dateStr = selDate.toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
        document.getElementById('agenda-content').innerHTML = `
            <button id="backForm" style="font-size:12px;color:var(--gold);font-family:'Syne',sans-serif;font-weight:600;margin-bottom:12px;background:none;border:none;cursor:pointer;">← Volver</button>
            <p style="font-size:13px;color:#aaa;font-family:'Syne',sans-serif;margin-bottom:16px;text-transform:capitalize;">${dateStr} · ${selTime}</p>
            <div style="display:flex;flex-direction:column;gap:12px;">
                <div><label class="dark-label">Tu nombre *</label><input type="text" id="fNombre" class="dark-input" placeholder="Ej: María García"></div>
                <div><label class="dark-label">Correo electrónico *</label><input type="email" id="fEmail" class="dark-input" placeholder="Ej: maria@email.com"></div>
                <div><label class="dark-label">Motivo</label>
                    <select id="fMotivo" class="dark-input" style="cursor:pointer;">
                        <option>Tarjeta Básica</option><option>Tarjeta Profesional</option>
                        <option>Tarjeta Premium</option><option>Menú Digital</option>
                        <option>Mini Landing Page</option><option>Otro</option>
                    </select>
                </div>
                <div><label class="dark-label">Mensaje adicional</label><textarea id="fMensaje" rows="3" class="dark-input" style="resize:none;" placeholder="Cuéntame más sobre tu proyecto..."></textarea></div>
                <button id="submitForm"
                        style="width:100%;padding:13px;background:linear-gradient(135deg,var(--gold),var(--orange));color:#000;font-weight:700;border-radius:12px;border:none;cursor:pointer;font-family:'Syne',sans-serif;font-size:14px;letter-spacing:0.03em;">
                    <i class="fas fa-check mr-2"></i>Confirmar y Enviar
                </button>
            </div>`;
        document.getElementById('backForm').addEventListener('click', renderTimeSlots);
        document.getElementById('submitForm').addEventListener('click', () => {
            const nombre  = document.getElementById('fNombre').value.trim();
            const email   = document.getElementById('fEmail').value.trim();
            const motivo  = document.getElementById('fMotivo').value;
            const mensaje = document.getElementById('fMensaje').value.trim();
            if (!nombre||!email) { alert('Por favor completa tu nombre y correo.'); return; }
            const dateStr2 = selDate.toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
            const txt = `✅ *NUEVA CITA*%0A%0A📅 *Fecha:* ${dateStr2}%0A🕐 *Hora:* ${selTime}%0A👤 *Nombre:* ${nombre}%0A📧 *Email:* ${email}%0A🎯 *Motivo:* ${motivo}%0A💬 *Mensaje:* ${mensaje||'No especificado'}`;
            document.getElementById('agenda-content').innerHTML = `
                <div style="text-align:center;padding:28px 16px;">
                    <div style="font-size:52px;margin-bottom:12px;">✅</div>
                    <h2 style="font-family:'Syne',sans-serif;font-size:20px;font-weight:800;color:#fff;margin-bottom:6px;">¡Cita Confirmada!</h2>
                    <p style="font-size:13px;color:#999;margin-bottom:8px;">Tu cita está agendada para el</p>
                    <p style="font-family:'Syne',sans-serif;font-size:13px;font-weight:700;color:var(--gold);background:rgba(240,180,41,0.08);border:1px solid rgba(240,180,41,0.2);padding:10px 16px;border-radius:10px;margin-bottom:16px;text-transform:capitalize;">${dateStr2} · ${selTime}</p>
                    <button id="closeAgenda" style="width:100%;padding:11px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.09);color:#fff;border-radius:10px;cursor:pointer;font-family:'Syne',sans-serif;font-size:13px;margin-bottom:10px;">Cerrar</button>
                    <a href="https://wa.me/${WA}?text=${txt}" target="_blank"
                       style="display:block;width:100%;padding:11px;background:linear-gradient(135deg,#25D366,#1da851);color:#fff;border-radius:10px;text-align:center;font-family:'Syne',sans-serif;font-size:13px;font-weight:700;text-decoration:none;">
                        <i class="fab fa-whatsapp mr-2"></i>Abrir WhatsApp
                    </a>
                </div>`;
            document.getElementById('closeAgenda').addEventListener('click', () => {
                const m = document.getElementById('agenda-modal');
                m.classList.remove('active');
                setTimeout(()=>{ m.style.display='none'; },300);
                document.body.style.overflow='';
            });
        });
    }

    resetAgenda();
    window.resetAgenda = resetAgenda;

    (function(){
        const KEY  = 'kz_visits';
        const BASE = 512;
        let n = parseInt(localStorage.getItem(KEY)||'0');
        n = n ? n + Math.floor(Math.random()*4) : BASE + Math.floor(Math.random()*38);
        localStorage.setItem(KEY, n);
        const el = document.getElementById('visitor-num');
        if (!el) return;
        let c = Math.max(BASE, n - 12);
        el.textContent = c;
        const iv = setInterval(()=>{ c++; el.textContent=c; if(c>=n) clearInterval(iv); }, 55);
    })();

    (function(){
        const scroll = document.getElementById('testimonials-scroll');
        const dots   = document.querySelectorAll('.t-dot');
        if (!scroll||!dots.length) return;
        scroll.addEventListener('scroll',()=>{
            const i = Math.round(scroll.scrollLeft/242);
            dots.forEach((d,j)=>d.classList.toggle('active',j===i));
        },{passive:true});
        dots.forEach((d,i)=>d.addEventListener('click',()=>scroll.scrollTo({left:i*242,behavior:'smooth'})));
    })();

    (function(){
        const canvas = document.getElementById('particles-canvas');
        const ctx    = canvas.getContext('2d');

        function resize(){
            canvas.width  = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resize();
        window.addEventListener('resize', resize, { passive:true });

        function rand(a,b){ return Math.random()*(b-a)+a; }

        const PALETTE = [
            [240,180, 41],
            [240,180, 41],
            [240,180, 41],
            [240,180, 41],
            [255,217,125],
            [255,217,125],
            [249,115, 22],
            [  0,229,255],
        ];

        const TOTAL = 70;
        const particles = Array.from({length:TOTAL}, ()=> mkParticle(true));

        function mkParticle(scatter){
            const [r,g,b] = PALETTE[Math.floor(Math.random()*PALETTE.length)];
            return {
                x:     rand(0, canvas.width),
                y:     scatter ? rand(0, canvas.height) : canvas.height + rand(0,20),
                r:     rand(0.7, 2.4),
                speed: rand(0.2, 0.6),
                drift: rand(-0.2, 0.2),
                alpha: rand(0.15, 0.6),
                phase: rand(0, Math.PI*2),
                col:   `${r},${g},${b}`,
            };
        }

        function draw(){
            ctx.clearRect(0,0,canvas.width,canvas.height);
            const t = performance.now()*0.001;

            for (const p of particles){
                const a = p.alpha * (0.55 + 0.45*Math.sin(t*0.8 + p.phase));

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
                ctx.fillStyle = `rgba(${p.col},${a})`;
                ctx.fill();

                if (p.r > 1.4){
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.r*2.8, 0, Math.PI*2);
                    ctx.fillStyle = `rgba(${p.col},${a*0.16})`;
                    ctx.fill();
                }

                p.y    -= p.speed;
                p.x    += p.drift;
                p.phase += 0.01;

                if (p.y < -8)                Object.assign(p, mkParticle(false));
                if (p.x < -8)                p.x = canvas.width + 8;
                if (p.x > canvas.width + 8) p.x = -8;
            }
            requestAnimationFrame(draw);
        }
        draw();
    })();

    (function(){
        const card = document.querySelector('.glass-card');
        const btn  = document.querySelector('.whatsapp-fixed');
        const ring = document.querySelector('.wa-fixed-ring');
        if (!card || !btn || !ring) return;

        function pos() {
            const r     = card.getBoundingClientRect();
            const right = Math.max(16, window.innerWidth - r.right + 16);
            btn.style.right  = right + 'px';
            ring.style.right = right + 'px';
        }

        pos();
        window.addEventListener('resize', pos, { passive: true });
    })();

    (function(){
        const els = document.querySelectorAll('.count-up');
        if (!els.length) return;

        function animateCount(el) {
            const target = parseInt(el.dataset.target);
            const duration = 1400;
            const start = performance.now();
            function step(now) {
                const p = Math.min((now - start) / duration, 1);
                const ease = 1 - Math.pow(1 - p, 3);
                el.textContent = Math.floor(ease * target);
                if (p < 1) requestAnimationFrame(step);
                else el.textContent = target;
            }
            requestAnimationFrame(step);
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    animateCount(e.target);
                    observer.unobserve(e.target);
                }
            });
        }, { threshold: 0.5 });

        els.forEach(el => observer.observe(el));
    })();

    (function(){
        const els = document.querySelectorAll('.reveal');
        if (!els.length) return;
        const obs = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    e.target.classList.add('revealed');
                    obs.unobserve(e.target);
                }
            });
        }, { threshold: 0.12 });
        els.forEach(el => obs.observe(el));
    })();

    (function(){
        const manifest = {
            name: 'KONFÍO ZINC',
            short_name: 'KONFÍO',
            description: 'Tarjeta digital de Darwin Montalvo — KONFÍO ZINC',
            start_url: './',
            display: 'standalone',
            orientation: 'portrait',
            background_color: '#000000',
            theme_color: '#F0B429',
            icons: [
                { src: 'https://i.postimg.cc/L8Ns16L1/Whats-App-Image-2026-05-10-at-14-52-22.jpg', sizes: '192x192', type: 'image/jpeg', purpose: 'any maskable' },
                { src: 'https://i.postimg.cc/L8Ns16L1/Whats-App-Image-2026-05-10-at-14-52-22.jpg', sizes: '512x512', type: 'image/jpeg', purpose: 'any' }
            ]
        };
        try {
            const blob = new Blob([JSON.stringify(manifest)], { type: 'application/json' });
            const link = document.createElement('link');
            link.rel  = 'manifest';
            link.href = URL.createObjectURL(blob);
            document.head.appendChild(link);
        } catch(e) {}

        let installPrompt = null;
        const nativeBtn   = document.getElementById('pwa-install-native');

        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            installPrompt = e;
            if (nativeBtn) nativeBtn.classList.add('show');
        });

        if (nativeBtn) {
            nativeBtn.addEventListener('click', async () => {
                if (!installPrompt) return;
                installPrompt.prompt();
                const { outcome } = await installPrompt.userChoice;
                if (outcome === 'accepted') {
                    nativeBtn.classList.remove('show');
                    installPrompt = null;
                }
            });
        }

        if ('serviceWorker' in navigator) {
            const sw = `
                const C='kz-cache-v1';
                self.addEventListener('install', e => {
                    e.waitUntil(caches.open(C).then(c =>
                        c.add(new Request(self.location.origin + self.location.pathname.replace(/[^/]*$/,'')))
                        .catch(()=>{})
                    ));
                    self.skipWaiting();
                });
                self.addEventListener('activate', e => {
                    e.waitUntil(caches.keys().then(keys =>
                        Promise.all(keys.filter(k=>k!==C).map(k=>caches.delete(k)))
                    ));
                    self.clients.claim();
                });
                self.addEventListener('fetch', e => {
                    if (e.request.method !== 'GET') return;
                    e.respondWith(
                        caches.match(e.request).then(r => r || fetch(e.request).then(res => {
                            if (res.ok) {
                                const clone = res.clone();
                                caches.open(C).then(c => c.put(e.request, clone));
                            }
                            return res;
                        }).catch(() => caches.match(e.request)))
                    );
                });`;
            try {
                const swBlob = new Blob([sw], { type: 'application/javascript' });
                const swUrl  = URL.createObjectURL(swBlob);
                navigator.serviceWorker.register(swUrl).catch(() => {});
            } catch(e) {}
        }
    })();

    (function(){
        const img  = document.getElementById('banner-img');
        const card = document.querySelector('.glass-card');
        if (!img || !card) return;

        let ticking = false;
        function update() {
            const rect    = card.getBoundingClientRect();
            const viewH   = window.innerHeight;
            const progress = 1 - (rect.bottom / (viewH + rect.height));
            const offset   = progress * 36 - 8;
            img.style.transform = `translateY(${Math.max(-12, Math.min(24, offset))}px) scale(1.06)`;
            ticking = false;
        }

        update();
        window.addEventListener('scroll', () => {
            if (!ticking) { requestAnimationFrame(update); ticking = true; }
        }, { passive: true });
        window.addEventListener('resize', update, { passive: true });
    })();

    (function(){
        const canvas = document.getElementById('sparkle-canvas');
        const card   = document.querySelector('.glass-card');
        if (!canvas || !card) return;
        const ctx    = canvas.getContext('2d');
        const sparks = [];

        function resize() {
            canvas.width  = card.offsetWidth;
            canvas.height = card.offsetHeight;
        }
        resize();
        window.addEventListener('resize', resize, { passive: true });

        function rand(a, b) { return Math.random() * (b - a) + a; }

        const COLORS = ['240,180,41', '240,180,41', '255,217,125', '249,115,22', '0,229,255'];

        function spawn(x, y, count = 7) {
            for (let i = 0; i < count; i++) {
                const angle = rand(0, Math.PI * 2);
                const speed = rand(1.2, 4.5);
                sparks.push({
                    x, y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed - rand(0.5, 2),
                    r:  rand(1.2, 3.2),
                    alpha: rand(0.7, 1),
                    decay: rand(0.03, 0.055),
                    col: COLORS[Math.floor(Math.random() * COLORS.length)],
                });
            }
        }

        let animating = false;
        function loop() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = sparks.length - 1; i >= 0; i--) {
                const s = sparks[i];
                const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 3);
                g.addColorStop(0, `rgba(${s.col},${s.alpha * 0.6})`);
                g.addColorStop(1, `rgba(${s.col},0)`);
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r * 3, 0, Math.PI * 2);
                ctx.fillStyle = g;
                ctx.fill();

                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${s.col},${s.alpha})`;
                ctx.fill();

                s.x     += s.vx;
                s.y     += s.vy;
                s.vy    += 0.12;
                s.vx    *= 0.97;
                s.alpha -= s.decay;
                s.r     *= 0.96;

                if (s.alpha <= 0 || s.r < 0.3) sparks.splice(i, 1);
            }
            if (sparks.length > 0) requestAnimationFrame(loop);
            else animating = false;
        }

        function trigger(x, y, count) {
            spawn(x, y, count);
            if (!animating) { animating = true; loop(); }
        }

        card.addEventListener('touchstart', e => {
            const rect = card.getBoundingClientRect();
            Array.from(e.changedTouches).forEach(t =>
                trigger(t.clientX - rect.left, t.clientY - rect.top, 9)
            );
        }, { passive: true });

        let lastMove = 0;
        card.addEventListener('mousemove', e => {
            const now = Date.now();
            if (now - lastMove < 40) return;
            lastMove = now;
            const rect = card.getBoundingClientRect();
            trigger(e.clientX - rect.left, e.clientY - rect.top, 4);
        }, { passive: true });
    })();

    (function(){
        const el = document.getElementById('typewriter-text');
        if (!el) return;

        const PLAIN = 'Tarjetas digitales interactivas que transforman tu presencia profesional';
        const HL_START = 'Tarjetas digitales interactivas que '.length;
        const HL_END   = HL_START + 'transforman'.length;

        let i = 0;

        function buildHTML(upTo) {
            let out = '';
            for (let j = 0; j < upTo; j++) {
                if (j === HL_START)   out += '<span style="color:var(--gold);font-weight:600;">';
                out += PLAIN[j];
                if (j === HL_END - 1) out += '</span>';
            }
            return out;
        }

        function type() {
            if (i > PLAIN.length) return;
            el.innerHTML = buildHTML(i) + (i < PLAIN.length ? '<span class="tw-cursor">|</span>' : '');
            i++;
            const delay = i < 3 ? 120 : i === HL_START || i === HL_END ? 180 : 28 + Math.random() * 22;
            setTimeout(type, delay);
        }

        setTimeout(type, 1100);
    })();

})();
