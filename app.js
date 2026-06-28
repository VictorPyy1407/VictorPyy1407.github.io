document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================================
     IMAGE GALLERY CAROUSEL
     ========================================================================== */
  const galleryMain = document.getElementById('gallery-main');
  const galleryThumbs = document.querySelectorAll('.gallery-thumb');
  const galleryPrev = document.getElementById('gallery-prev');
  const galleryNext = document.getElementById('gallery-next');
  const galleryIdxIndicator = document.getElementById('gallery-current-idx');

  const images = [
    './images/Imagen principal.jpg',
    'images/Bolso-Gris.jpg',
    'images/Bolso-Negro.jpg',
    'images/Bolso-Rosa.jpg',
    'images/Bolso-Gris.jpg'
  ];

  let currentImgIdx = 0;

  function updateGallery(index) {
    currentImgIdx = index;

    // Main image transition effect
    galleryMain.style.opacity = '0.3';
    setTimeout(() => {
      galleryMain.src = images[currentImgIdx];
      galleryMain.style.opacity = '1';
    }, 150);

    // Active thumb styling
    galleryThumbs.forEach((thumb, idx) => {
      if (idx === currentImgIdx) {
        thumb.classList.add('active');
      } else {
        thumb.classList.remove('active');
      }
    });

    // Update indicator text
    galleryIdxIndicator.textContent = currentImgIdx + 1;
  }

  // Thumb clicks
  galleryThumbs.forEach((thumb) => {
    thumb.addEventListener('click', () => {
      const idx = parseInt(thumb.getAttribute('data-index'), 10);
      updateGallery(idx);
    });
  });

  // Prev & Next navigation
  galleryPrev.addEventListener('click', () => {
    let nextIdx = currentImgIdx - 1;
    if (nextIdx < 0) nextIdx = images.length - 1;
    updateGallery(nextIdx);
  });

  galleryNext.addEventListener('click', () => {
    let nextIdx = currentImgIdx + 1;
    if (nextIdx >= images.length) nextIdx = 0;
    updateGallery(nextIdx);
  });


  /* ==========================================================================
     ACCORDION TRIGGERING (BIOMECHANICS & FAQ)
     ========================================================================== */
  const setupAccordionGroup = (triggers) => {
    triggers.forEach(trigger => {
      trigger.addEventListener('click', () => {
        const currentItem = trigger.parentElement;
        const group = currentItem.parentElement;
        const allItemsInGroup = group.querySelectorAll('.accordion-item');

        const isActive = currentItem.classList.contains('active');

        // Close all items in this group
        allItemsInGroup.forEach(item => {
          item.classList.remove('active');
          const icon = item.querySelector('.accordion-icon');
          if (icon) icon.textContent = '+';
        });

        // Open clicked item if it was closed
        if (!isActive) {
          currentItem.classList.add('active');
          const icon = currentItem.querySelector('.accordion-icon');
          if (icon) icon.textContent = '-';
        }
      });
    });
  };

  const biomechanicsTriggers = document.querySelectorAll('.accordion-section .accordion-trigger');
  const faqTriggers = document.querySelectorAll('.faq .accordion-trigger');

  setupAccordionGroup(biomechanicsTriggers);
  setupAccordionGroup(faqTriggers);


  /* ==========================================================================
     GPS AUTO-COMPLETION
     ========================================================================== */
  const gpsButton = document.getElementById('gps-button');
  const deptInput = document.getElementById('dept');
  const cityInput = document.getElementById('city');

  // Almacena las coordenadas GPS capturadas
  let gpsCoords = { lat: null, lng: null };

  gpsButton.addEventListener('click', () => {
    gpsButton.disabled = true;
    gpsButton.innerHTML = `
      <svg class="animate-pulse" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="animation: pulse 1s infinite;">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M12 8v4l3 3"></path>
      </svg>
      Obteniendo ubicación...
    `;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Guardamos las coordenadas reales del usuario
          gpsCoords.lat = position.coords.latitude.toFixed(6);
          gpsCoords.lng = position.coords.longitude.toFixed(6);

          // En una app real llamaríamos a una API de geocodificación inversa.
          // Por ahora autocompletamos con datos simulados.
          setTimeout(() => {
            deptInput.value = 'Central';
            cityInput.value = 'Luque';

            // Add custom visual glow to inputs
            deptInput.focus();
            setTimeout(() => cityInput.focus(), 300);

            resetGpsButton(`GPS ✔ (${gpsCoords.lat}, ${gpsCoords.lng})`);
          }, 1500);
        },
        (error) => {
          // Fail gracefully / Fallback to mock data with warning message
          console.warn('Geolocation error code: ' + error.code);
          setTimeout(() => {
            deptInput.value = 'Central';
            cityInput.value = 'Asunción';
            resetGpsButton('Error GPS - Autocompletado central');
          }, 1000);
        },
        { timeout: 6000 }
      );
    } else {
      // Browser doesn't support geolocation
      setTimeout(() => {
        deptInput.value = 'Central';
        cityInput.value = 'Asunción';
        resetGpsButton('No compatible - Autocompletado');
      }, 500);
    }
  });

  function resetGpsButton(text) {
    gpsButton.disabled = false;
    gpsButton.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M12 2v2m0 16v2M2 12h2m16 0h2"></path>
      </svg>
      ${text}
    `;
    setTimeout(() => {
      gpsButton.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M12 2v2m0 16v2M2 12h2m16 0h2"></path>
        </svg>
        Auto-completar con GPS
      `;
    }, 4000);
  }


  /* ==========================================================================
     FORM SUBMISSION & GOOGLE SHEETS INTEGRATION
     ========================================================================== */

  // ⚠️ REEMPLAZÁ esta URL con la URL de tu Web App de Google Apps Script
  // Pasos para obtenerla: ver instrucciones en README o abajo en este archivo
  const GOOGLE_SHEET_WEBHOOK = 'https://script.google.com/macros/s/AKfycbw21Ik8jZccsOnfIxEwDahh_3mm5-hbKNUm8HaWJv1sa1l5YdJ-xkJgz3aPA8coY75XbA/exec';

  const form = document.getElementById('purchase-form');
  const submitBtn = document.getElementById('submit-btn');
  const successModal = document.getElementById('success-modal');
  const modalUserName = document.getElementById('modal-user-name');
  const modalUserPhone = document.getElementById('modal-user-phone');
  const closeModalBtn = document.getElementById('close-modal-btn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nameValue = document.getElementById('name').value.trim();
    const phoneValue = document.getElementById('phone').value.trim();
    const colorValue = document.getElementById('color').value;
    const deptValue = document.getElementById('dept').value.trim();
    const cityValue = document.getElementById('city').value.trim();

    if (!nameValue || !phoneValue || !colorValue || !deptValue || !cityValue) {
      alert('Por favor completá todos los campos obligatorios.');
      return;
    }

    // --- Estado de carga en el botón ---
    const originalBtnHTML = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"
        style="animation: spin 0.8s linear infinite;">
        <circle cx="12" cy="12" r="10" stroke-opacity="0.3"></circle>
        <path d="M12 2a10 10 0 0 1 10 10"></path>
      </svg>
      Enviando pedido...
    `;

    // --- Construir parámetros ---
    const params = new URLSearchParams({
      nombre: nameValue,
      telefono: ` ${phoneValue}`,
      color: colorValue || '—',
      depto: deptValue || '—',
      ciudad: cityValue || '—',
      lat: gpsCoords.lat || '—',
      lng: gpsCoords.lng || '—',
      fecha: new Date().toLocaleString('es-PY', { timeZone: 'America/Asuncion' })
    });

    // --- Enviar a Google Sheets ---
    // Usamos un <img> trick o iframe para evitar CORS bloqueando la respuesta.
    // El Apps Script debe responder con ContentService.MimeType.JSON y tener
    // "Ejecutar como: yo" + "Quién puede acceder: Cualquier usuario" al publicar.
    let enviado = false;

    try {
      if (GOOGLE_SHEET_WEBHOOK && GOOGLE_SHEET_WEBHOOK !== 'TU_URL_AQUI') {

        // Método principal: fetch con no-cors (dispara el request, no podemos leer respuesta)
        fetch(`${GOOGLE_SHEET_WEBHOOK}?${params.toString()}`, {
          method: 'GET',
          mode: 'no-cors'
        });

        // Esperamos 1.5s para que el request llegue al servidor antes de continuar
        await new Promise(r => setTimeout(r, 1500));
        enviado = true;

      } else {
        // Modo desarrollo: solo loguear en consola
        console.log('⚠️  MODO DESARROLLO — Pedido no enviado a Sheets (configurá GOOGLE_SHEET_WEBHOOK)');
        console.table({
          nombre: nameValue,
          telefono: `+595 ${phoneValue}`,
          color: colorValue,
          depto: deptValue,
          ciudad: cityValue,
          lat: gpsCoords.lat || '—',
          lng: gpsCoords.lng || '—'
        });
        await new Promise(r => setTimeout(r, 800));
        enviado = true;
      }
    } catch (err) {
      console.error('❌ Error al enviar a Sheets:', err);
      // Igual mostramos el modal — el pedido puede coordinarse por WhatsApp
      enviado = true;
    }

    if (enviado) {
      // --- Mostrar modal de éxito ---
      modalUserName.textContent = nameValue;
      modalUserPhone.textContent = `+595 ${phoneValue}`;
      successModal.classList.add('active');

      // --- Restaurar botón y resetear formulario ---
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnHTML;
      form.reset();

      // --- WhatsApp de respaldo (opcional) ---
      // Si querés recibir el pedido también por WhatsApp descomentá estas líneas
      // y reemplazá TU_NUMERO con tu número sin el +
      /*
      const msg = encodeURIComponent(
        `🛍️ *Nuevo pedido — Bolso Viajera XL*\n\n` +
        `Nombre: ${nameValue}\n` +
        `Teléfono: +595 ${phoneValue}\n` +
        `Color: ${colorValue}\n` +
        `Departamento: ${deptValue}\n` +
        `Ciudad: ${cityValue}\n` +
        `Total: Gs. 199.000 (COD)`
      );
      setTimeout(() => window.open(`https://wa.me/595972738779?text=${msg}`, '_blank'), 500);
      */
    }
  });

  closeModalBtn.addEventListener('click', () => {
    successModal.classList.remove('active');
  });

  // Cerrar modal al hacer clic fuera del contenido
  successModal.addEventListener('click', (e) => {
    if (e.target === successModal) {
      successModal.classList.remove('active');
    }
  });

});