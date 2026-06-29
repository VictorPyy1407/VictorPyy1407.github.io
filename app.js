document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================================
     SUPABASE CONFIG
     ========================================================================== */
  const SUPABASE_URL = 'https://roruinqorwgolcrhhmpm.supabase.co';
  const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvcnVpbnFvcndnb2xjcmhobXBtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2NTU0MDcsImV4cCI6MjA5ODIzMTQwN30.VzNSqYUM6amTOToZUsJ7Emjapy-y9Y44hDmbC1XG9Eg';

  async function guardarPedido(datos) {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/pedidos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON,
        'Authorization': `Bearer ${SUPABASE_ANON}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(datos)
    });
    if (!response.ok) {
      const err = await response.text();
      throw new Error(err);
    }
  }


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
    'images/Bolso-Lila.jpg'
  ];

  let currentImgIdx = 0;

  function updateGallery(index) {
    currentImgIdx = index;
    galleryMain.style.opacity = '0.3';
    setTimeout(() => {
      galleryMain.src = images[currentImgIdx];
      galleryMain.style.opacity = '1';
    }, 150);
    galleryThumbs.forEach((thumb, idx) => {
      thumb.classList.toggle('active', idx === currentImgIdx);
    });
    galleryIdxIndicator.textContent = currentImgIdx + 1;
  }

  galleryThumbs.forEach((thumb) => {
    thumb.addEventListener('click', () => {
      updateGallery(parseInt(thumb.getAttribute('data-index'), 10));
    });
  });

  galleryPrev.addEventListener('click', () => {
    updateGallery(currentImgIdx - 1 < 0 ? images.length - 1 : currentImgIdx - 1);
  });

  galleryNext.addEventListener('click', () => {
    updateGallery(currentImgIdx + 1 >= images.length ? 0 : currentImgIdx + 1);
  });


  /* ==========================================================================
     ACCORDION (FEATURES & FAQ)
     ========================================================================== */
  const setupAccordionGroup = (triggers) => {
    triggers.forEach(trigger => {
      trigger.addEventListener('click', () => {
        const currentItem = trigger.parentElement;
        const group = currentItem.parentElement;
        const isActive = currentItem.classList.contains('active');

        group.querySelectorAll('.accordion-item').forEach(item => {
          item.classList.remove('active');
          const icon = item.querySelector('.accordion-icon');
          if (icon) icon.textContent = '+';
        });

        if (!isActive) {
          currentItem.classList.add('active');
          const icon = currentItem.querySelector('.accordion-icon');
          if (icon) icon.textContent = '-';
        }
      });
    });
  };

  setupAccordionGroup(document.querySelectorAll('.accordion-section .accordion-trigger'));
  setupAccordionGroup(document.querySelectorAll('.faq .accordion-trigger'));


  /* ==========================================================================
     GPS AUTO-COMPLETION
     ========================================================================== */
  const gpsButton = document.getElementById('gps-button');
  const deptInput = document.getElementById('dept');
  const cityInput = document.getElementById('city');
  let gpsCoords = { lat: null, lng: null };

  gpsButton.addEventListener('click', () => {
    gpsButton.disabled = true;
    gpsButton.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M12 8v4l3 3"></path>
      </svg>
      Obteniendo ubicación...
    `;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          gpsCoords.lat = position.coords.latitude.toFixed(6);
          gpsCoords.lng = position.coords.longitude.toFixed(6);
          setTimeout(() => {
            deptInput.value = 'Central';
            cityInput.value = 'Luque';
            deptInput.focus();
            setTimeout(() => cityInput.focus(), 300);
            resetGpsButton(`GPS activo (${gpsCoords.lat}, ${gpsCoords.lng})`);
          }, 1500);
        },
        (error) => {
          console.warn('GPS error: ' + error.code);
          setTimeout(() => {
            deptInput.value = 'Central';
            cityInput.value = 'Asuncion';
            resetGpsButton('GPS no disponible');
          }, 1000);
        },
        { timeout: 6000 }
      );
    } else {
      setTimeout(() => {
        deptInput.value = 'Central';
        cityInput.value = 'Asuncion';
        resetGpsButton('GPS no compatible');
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
     FORM SUBMISSION → SUPABASE
     ========================================================================== */
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

    // Estado de carga
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
    const colorSelect = document.getElementById("color");
    const selectedColor = document.getElementById("selected-color");

    colorSelect.addEventListener("change", () => {
      selectedColor.textContent = colorSelect.value
        ? colorSelect.value
        : "— Elegí un color";
    });

    try {
      await guardarPedido({
        nombre: nameValue,
        telefono: `+595 ${phoneValue}`,
        color: colorValue,
        departamento: deptValue,
        ciudad: cityValue,
        lat: gpsCoords.lat || null,
        lng: gpsCoords.lng || null
      });

      // Exito — mostrar modal
      modalUserName.textContent = nameValue;
      modalUserPhone.textContent = `+595 ${phoneValue}`;
      successModal.classList.add('active');
      form.reset();

    } catch (err) {
      console.error('Error al guardar pedido:', err);
      alert('Hubo un problema al enviar el pedido. Por favor intentá de nuevo o contactanos por WhatsApp.');
    }

    // Restaurar boton siempre
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnHTML;
  });

  closeModalBtn.addEventListener('click', () => {
    successModal.classList.remove('active');
  });

  successModal.addEventListener('click', (e) => {
    if (e.target === successModal) successModal.classList.remove('active');
  });

});
