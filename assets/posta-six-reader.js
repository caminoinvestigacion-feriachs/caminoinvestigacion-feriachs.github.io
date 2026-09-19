(() => {
  const assets = new URL('./', document.currentScript.src);
  const readers = new WeakMap();
  window.PostaSixReader = {
    step(host, direction) { readers.get(host)?.step(direction); },
    mount(host, download, methodSlides, methodPdf) {
      const sections = [
        { label: 'Aspectos metodológicos de la investigación', pages: methodSlides, pdf: methodPdf },
        { label: 'Microrrelatos', pages: Array.from({ length: 28 }, (_, i) =>
          new URL(`microrrelatos/page-${String(i + 1).padStart(2, '0')}.webp`, assets).href),
          pdf: new URL('pdfs/Feria_Ciencias_2026_Microrrelato.pdf', assets).href }
      ];
      const positions = sections.map(() => ({ page: 0, zoom: 1, x: 0, y: 0 }));
      let active = 0;
      host.innerHTML = `<section class="six-reader" aria-label="Materiales de la Posta 6">
        <div class="six-tabs" role="tablist" aria-label="Temas de la Posta 6"></div>
        <div class="six-toolbar" aria-label="Controles de lectura">
          <button type="button" data-action="prev" aria-label="Página anterior">‹</button>
          <output class="six-page-count" aria-live="polite"></output>
          <button type="button" data-action="next" aria-label="Página siguiente">›</button>
          <button type="button" data-action="out" aria-label="Alejar página">−</button>
          <button type="button" data-action="fit" aria-label="Ajustar página a la pantalla">100%</button>
          <button type="button" data-action="in" aria-label="Acercar página">+</button>
        </div>
        <div class="six-page-scroll" role="tabpanel" id="six-panel" tabindex="0">
          <img class="six-page" alt="">
        </div>
        <a class="six-form-link" href="https://forms.gle/2WQxnZh98Cae4dLr9" target="_blank" rel="noopener" hidden>Abrir formulario de microrrelato ↗</a>
      </section>`;
      const tabs = host.querySelector('.six-tabs');
      const scroll = host.querySelector('.six-page-scroll');
      const image = host.querySelector('.six-page');
      const counter = host.querySelector('.six-page-count');
      const button = action => host.querySelector(`[data-action="${action}"]`);
      const remember = () => {
        positions[active].x = scroll.scrollLeft;
        positions[active].y = scroll.scrollTop;
      };
      const fit = () => {
        const ratio = image.naturalWidth / image.naturalHeight || 16 / 9;
        const width = Math.min(scroll.clientWidth, scroll.clientHeight * ratio);
        image.style.width = `${Math.max(1, width) * positions[active].zoom}px`;
      };
      const render = () => {
        const section = sections[active], state = positions[active];
        [...tabs.children].forEach((tab, index) => {
          tab.setAttribute('aria-selected', String(index === active));
          tab.tabIndex = index === active ? 0 : -1;
        });
        scroll.setAttribute('aria-labelledby', `six-tab-${active}`);
        image.src = section.pages[state.page];
        image.alt = `${section.label}, página ${state.page + 1} de ${section.pages.length}`;
        counter.textContent = `${state.page + 1} / ${section.pages.length}`;
        host.querySelector('.six-form-link').hidden = active !== 1 || state.page !== 26;
        button('prev').disabled = state.page === 0;
        button('next').disabled = state.page === section.pages.length - 1;
        button('fit').textContent = `${Math.round(state.zoom * 100)}%`;
        button('out').disabled = state.zoom <= 1;
        button('in').disabled = state.zoom >= 3;
        download.href = section.pdf;
        download.download = section.pdf.split('/').pop();
        download.textContent = `⇩ Descargar PDF · ${active ? 'Microrrelatos' : 'Metodología'}`;
        fit();
        scroll.scrollTo(state.x, state.y);
      };
      sections.forEach((section, index) => {
        const tab = document.createElement('button');
        tab.type = 'button';
        tab.id = `six-tab-${index}`;
        tab.setAttribute('role', 'tab');
        tab.setAttribute('aria-controls', 'six-panel');
        tab.textContent = section.label;
        const select = () => { remember(); active = index; render(); };
        tab.addEventListener('click', select);
        tab.addEventListener('keydown', event => {
          if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
          event.preventDefault();
          event.stopPropagation();
          const next = event.key === 'Home' ? 0 : event.key === 'End' ? 1 : 1 - index;
          tabs.children[next].click();
          tabs.children[next].focus();
        });
        tabs.appendChild(tab);
      });
      const step = direction => {
        const state = positions[active];
        state.page = Math.max(0, Math.min(sections[active].pages.length - 1, state.page + direction));
        state.x = state.y = 0;
        render();
      };
      readers.set(host, { step });
      button('prev').onclick = () => step(-1);
      button('next').onclick = () => step(1);
      ['out', 'in', 'fit'].forEach(action => {
        button(action).onclick = () => {
          const state = positions[active];
          state.zoom = action === 'fit' ? 1 : Math.max(1, Math.min(3, state.zoom + (action === 'in' ? .5 : -.5)));
          state.x = state.y = 0;
          render();
        };
      });
      image.onload = () => { fit(); scroll.scrollTo(positions[active].x, positions[active].y); };
      image.onerror = () => { counter.textContent = 'No se pudo cargar la página. Podés descargar el PDF.'; };
      const observer = new ResizeObserver(() => {
        if (!host.contains(scroll)) return observer.disconnect();
        fit();
      });
      observer.observe(scroll);
      render();
    }
  };
})();
