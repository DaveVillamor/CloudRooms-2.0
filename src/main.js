// Funcionalidad para el contenedor píldora y sección de vuelos
document.addEventListener('DOMContentLoaded', function() {
  const checkboxes = document.querySelectorAll('.pill-checkbox');
  const flightsSection = document.getElementById('flights-section');
  const flightsCheckbox = document.getElementById('vuelos');
  const tripTypeButtons = document.querySelectorAll('.trip-type-btn');
  const returnDateCol = document.getElementById('return-date-col');
  const searchFlightBtn = document.getElementById('search-flight-btn');
  const addFlightBtn = document.getElementById('add-flight-btn');
  const flightResults = document.getElementById('flight-results');
  const jsonOutput = document.getElementById('json-output');
  
  let currentTripType = 'round-trip';
  let departureFlatpickr, returnFlatpickr;
  let passengersCount = 1;
  let childrenCount = 0;
  
  // Variables para hoteles
  let roomsCount = 1;
  let adultsCount = 2;
  let hotelChildrenCount = 0;
  let checkinFlatpickr, checkoutFlatpickr;
  
  // Funcionalidad para mostrar/ocultar secciones según checkboxes
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      const label = this.nextElementSibling;
      
      // Agregar efecto de click
      label.style.transform = 'scale(0.95)';
      setTimeout(() => {
        label.style.transform = '';
      }, 150);
      
      // Mostrar/ocultar sección de vuelos
      if (this.id === 'vuelos') {
        if (this.checked) {
          flightsSection.style.display = 'block';
          // Inicializar flatpickr después de mostrar la sección
          setTimeout(() => {
            initializeFlatpickr();
          }, 100);
        } else {
          flightsSection.style.display = 'none';
          flightResults.style.display = 'none';
          // Limpiar flatpickr al ocultar
          if (departureFlatpickr) departureFlatpickr.destroy();
          if (returnFlatpickr) returnFlatpickr.destroy();
        }
      }
      
      // Mostrar/ocultar sección de hoteles
      if (this.id === 'hoteles') {
        const hotelsSection = document.getElementById('hotels-section');
        if (this.checked) {
          hotelsSection.style.display = 'block';
          // Inicializar flatpickr para hoteles después de mostrar la sección
          setTimeout(() => {
            initializeHotelFlatpickr();
          }, 100);
        } else {
          hotelsSection.style.display = 'none';
          document.getElementById('hotel-results').style.display = 'none';
          // Limpiar flatpickr al ocultar
          if (checkinFlatpickr) checkinFlatpickr.destroy();
          if (checkoutFlatpickr) checkoutFlatpickr.destroy();
        }
      }
      
      // Mostrar en consola qué opción fue seleccionada/deseleccionada
      const serviceName = this.id.charAt(0).toUpperCase() + this.id.slice(1);
      console.log(`${serviceName}: ${this.checked ? 'Seleccionado' : 'Deseleccionado'}`);
      
      updateSelectedServices();
    });
  });
  
  // Funcionalidad para botones de tipo de viaje
  tripTypeButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Remover clase active de todos los botones
      tripTypeButtons.forEach(btn => btn.classList.remove('active'));
      
      // Agregar clase active al botón clickeado
      this.classList.add('active');
      
      // Actualizar tipo de viaje actual
      currentTripType = this.dataset.type;
      
      // Mostrar/ocultar fecha de vuelta
      if (currentTripType === 'one-way') {
        returnDateCol.style.display = 'none';
        returnFlatpickr.clear();
      } else {
        returnDateCol.style.display = 'block';
      }
      
      console.log('Tipo de viaje seleccionado:', currentTripType);
    });
  });
  
  // Funcionalidad para contadores de pasajeros
  function setupCounter(counterId, valueId, minusId, plusId, minValue, maxValue, initialValue) {
    const valueElement = document.getElementById(valueId);
    const minusBtn = document.getElementById(minusId);
    const plusBtn = document.getElementById(plusId);
    
    let currentValue = initialValue;
    valueElement.textContent = currentValue;
    
    function updateButtons() {
      minusBtn.disabled = currentValue <= minValue;
      plusBtn.disabled = currentValue >= maxValue;
    }
    
    minusBtn.addEventListener('click', function() {
      if (currentValue > minValue) {
        currentValue--;
        valueElement.textContent = currentValue;
        updateButtons();
        updateCounterValue(counterId, currentValue);
      }
    });
    
    plusBtn.addEventListener('click', function() {
      if (currentValue < maxValue) {
        currentValue++;
        valueElement.textContent = currentValue;
        updateButtons();
        updateCounterValue(counterId, currentValue);
      }
    });
    
    updateButtons();
    return () => currentValue;
  }
  
  function updateCounterValue(counterId, value) {
    if (counterId === 'passengers') {
      passengersCount = value;
    } else if (counterId === 'children') {
      childrenCount = value;
    } else if (counterId === 'rooms') {
      roomsCount = value;
    } else if (counterId === 'adults') {
      adultsCount = value;
    } else if (counterId === 'hotel-children') {
      hotelChildrenCount = value;
    }
  }
  
  // Inicializar contadores
  const getPassengersCount = setupCounter('passengers', 'passengers-value', 'passengers-minus', 'passengers-plus', 1, 9, 1);
  const getChildrenCount = setupCounter('children', 'children-value', 'children-minus', 'children-plus', 0, 8, 0);
  
  // Inicializar contadores de hoteles
  const getRoomsCount = setupCounter('rooms', 'rooms-value', 'rooms-minus', 'rooms-plus', 1, 5, 1);
  const getAdultsCount = setupCounter('adults', 'adults-value', 'adults-minus', 'adults-plus', 1, 8, 2);
  const getHotelChildrenCount = setupCounter('hotel-children', 'hotel-children-value', 'hotel-children-minus', 'hotel-children-plus', 0, 6, 0);
  
  // Inicializar flatpickr para fechas
  function initializeFlatpickr() {
    // Configuración común para ambos datepickers
    const commonConfig = {
      dateFormat: 'Y-m-d',
      minDate: 'today',
      locale: 'es',
      theme: 'dark'
    };
    
    // Datepicker para fecha de ida
    departureFlatpickr = flatpickr('#departure-date', {
      ...commonConfig,
      onChange: function(selectedDates, dateStr, instance) {
        // Si es ida y vuelta, configurar fecha mínima para vuelta
        if (currentTripType === 'round-trip' && returnFlatpickr) {
          returnFlatpickr.set('minDate', dateStr);
        }
      }
    });
    
    // Datepicker para fecha de vuelta
    returnFlatpickr = flatpickr('#return-date', {
      ...commonConfig,
      mode: currentTripType === 'round-trip' ? 'range' : 'single'
    });
  }
  
  // Inicializar flatpickr cuando se muestra la sección de vuelos
  function initializeFlightsSection() {
    if (flightsSection.style.display !== 'none') {
      initializeFlatpickr();
    }
  }
  
  // Inicializar flatpickr para fechas de hoteles
  function initializeHotelFlatpickr() {
    const commonConfig = {
      dateFormat: 'Y-m-d',
      minDate: 'today',
      locale: 'es',
      theme: 'dark'
    };
    
    // Datepicker para check-in
    checkinFlatpickr = flatpickr('#checkin-date', {
      ...commonConfig,
      onChange: function(selectedDates, dateStr, instance) {
        // Configurar fecha mínima para check-out
        if (checkoutFlatpickr) {
          checkoutFlatpickr.set('minDate', dateStr);
        }
      }
    });
    
    // Datepicker para check-out
    checkoutFlatpickr = flatpickr('#checkout-date', {
      ...commonConfig
    });
  }
  
  // Funcionalidad para búsqueda de hoteles
  document.addEventListener('click', function(e) {
    if (e.target && e.target.id === 'search-hotel-btn') {
      const searchData = {
        destination: document.getElementById('hotel-destination').value,
        checkin: document.getElementById('checkin-date').value,
        checkout: document.getElementById('checkout-date').value,
        rooms: roomsCount,
        adults: adultsCount,
        children: hotelChildrenCount,
        searchTimestamp: new Date().toISOString(),
        searchId: generateSearchId()
      };
      
      // Simular respuesta de API
      const apiResponse = simulateHotelAPI(searchData);
      
      // Generar tarjetas de hoteles
      generateHotelCards(apiResponse.results.hotels);
      
      // Mostrar JSON para debugging
      document.getElementById('hotel-json-output').textContent = JSON.stringify(apiResponse, null, 2);
      document.getElementById('hotel-results').style.display = 'block';
      
      // Scroll a resultados
      document.getElementById('hotel-results').scrollIntoView({ behavior: 'smooth' });
      
      console.log('Búsqueda de hoteles:', searchData);
      console.log('Respuesta API simulada:', apiResponse);
    }
  });
  
  // Funcionalidad para buscar vuelos
  searchFlightBtn.addEventListener('click', function() {
    const searchData = {
      tripType: currentTripType,
      from: document.getElementById('from-location').value,
      to: document.getElementById('to-location').value,
      departureDate: document.getElementById('departure-date').value,
      returnDate: currentTripType === 'round-trip' ? document.getElementById('return-date').value : null,
      passengers: passengersCount,
      children: childrenCount,
      searchTimestamp: new Date().toISOString(),
      searchId: generateSearchId()
    };
    
    // Simular respuesta de API
    const apiResponse = simulateFlightAPI(searchData);
    
    // Generar tarjetas de vuelos organizadas por tipo
    generateFlightCards(apiResponse.results);
    
    // Mostrar JSON para debugging
    jsonOutput.textContent = JSON.stringify(apiResponse, null, 2);
    flightResults.style.display = 'block';
    
    // Scroll a resultados
    flightResults.scrollIntoView({ behavior: 'smooth' });
    
    console.log('Búsqueda de vuelos:', searchData);
    console.log('Respuesta API simulada:', apiResponse);
  });
  
  // Funcionalidad para agregar nuevo vuelo
  addFlightBtn.addEventListener('click', function() {
    // Aquí puedes implementar lógica para duplicar el formulario
    // o crear un nuevo formulario de búsqueda
    console.log('Agregar nuevo vuelo');
    
    // Efecto visual del botón
    this.style.transform = 'scale(0.95)';
    setTimeout(() => {
      this.style.transform = '';
    }, 150);
  });
  
  function updateSelectedServices() {
    const selectedServices = [];
    checkboxes.forEach(checkbox => {
      if (checkbox.checked) {
        selectedServices.push(checkbox.id);
      }
    });
    
    console.log('Servicios seleccionados:', selectedServices);
  }
  
  function generateSearchId() {
    return 'SEARCH_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
  
  function generateFlightCards(results) {
    const container = document.getElementById('flight-cards-container');
    container.innerHTML = '';
    
    // Variables para almacenar selecciones
    window.selectedDeparture = null;
    window.selectedReturn = null;
    
    // Generar sección de vuelos de ida
    if (results.departureFlights.length > 0) {
      const departureSection = createFlightSection('Vuelos de Ida', results.departureFlights, 'departure');
      container.appendChild(departureSection);
    }
    
    // Generar sección de vuelos de vuelta (solo si es ida y vuelta)
    if (currentTripType === 'round-trip' && results.returnFlights.length > 0) {
      const returnSection = createFlightSection('Vuelos de Vuelta', results.returnFlights, 'return');
      container.appendChild(returnSection);
    }
    
    // Generar botón de finalizar
    const finalizeSection = createFinalizeSection();
    container.appendChild(finalizeSection);
  }
  
  function createFlightSection(title, flights, type) {
    const section = document.createElement('div');
    section.className = 'flight-section';
    
    const sectionTitle = document.createElement('h6');
    sectionTitle.className = 'flight-section-title';
    sectionTitle.textContent = title;
    section.appendChild(sectionTitle);
    
    const cardsContainer = document.createElement('div');
    cardsContainer.className = 'flight-cards-row';
    
    flights.forEach(flight => {
      const card = createFlightCard(flight, type);
      cardsContainer.appendChild(card);
    });
    
    section.appendChild(cardsContainer);
    return section;
  }
  
  function createFinalizeSection() {
    const section = document.createElement('div');
    section.className = 'finalize-section';
    
    section.innerHTML = `
      <div class="finalize-container">
        <div class="selection-summary">
          <h6>Resumen de Selección</h6>
          <div id="selection-details">
            <p id="departure-summary">Vuelo de ida: No seleccionado</p>
            ${currentTripType === 'round-trip' ? '<p id="return-summary">Vuelo de vuelta: No seleccionado</p>' : ''}
          </div>
          <div class="price-summary" id="flight-price-summary" style="display: none;">
            <div class="price-breakdown">
              <div class="price-item">
                <span>Vuelo de ida</span>
                <span id="departure-price">$0</span>
              </div>
              ${currentTripType === 'round-trip' ? `
              <div class="price-item">
                <span>Vuelo de vuelta</span>
                <span id="return-price">$0</span>
              </div>
              ` : ''}
              <div class="price-item">
                <span>Pasajeros</span>
                <span id="passengers-count">1</span>
              </div>
              <div class="price-divider"></div>
              <div class="price-item total">
                <span>Total</span>
                <span id="total-price">$0</span>
              </div>
            </div>
          </div>
        </div>
        <button class="finalize-btn" id="finalize-btn" disabled>
          Finalizar Reserva
        </button>
      </div>
    `;
    
    // Agregar evento al botón de finalizar
    const finalizeBtn = section.querySelector('#finalize-btn');
    finalizeBtn.addEventListener('click', finalizeReservation);
    
    return section;
  }
  
  function createFlightCard(flight, type) {
    const card = document.createElement('div');
    card.className = 'flight-card';
    card.dataset.flightId = flight.id;
    card.dataset.flightType = type;
    
    // Calcular precio total
    const totalPrice = flight.price.adult + (flight.price.child * childrenCount);
    const formattedPrice = new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(totalPrice);
    
    // Generar código de aeropuerto
    const fromCode = flight.departure.airport.split(' ')[0].substring(0, 3).toUpperCase();
    const toCode = flight.arrival.airport.split(' ')[0].substring(0, 3).toUpperCase();
    
    // Obtener iniciales de aerolínea
    const airlineInitials = flight.airline.split(' ').map(word => word[0]).join('').toUpperCase();
    
    card.innerHTML = `
      <div class="flight-card-header">
        <div class="airline-info">
          <div class="airline-logo">${airlineInitials}</div>
          <div class="airline-details">
            <h6>${flight.airline}</h6>
            <p class="flight-number">${flight.flightNumber}</p>
          </div>
        </div>
        <div class="flight-price">
          <p class="price-amount">${formattedPrice}</p>
          <p class="price-currency">por persona</p>
        </div>
      </div>
      
      <div class="flight-route">
        <div class="route-segment">
          <p class="airport-code">${fromCode}</p>
          <p class="airport-name">${flight.departure.airport}</p>
          <p class="flight-time">${flight.departure.time}</p>
          <p class="flight-duration">Terminal ${flight.departure.terminal}</p>
        </div>
        
        <div class="flight-path">
          <div class="flight-path-line"></div>
        </div>
        
        <div class="route-segment">
          <p class="airport-code">${toCode}</p>
          <p class="airport-name">${flight.arrival.airport}</p>
          <p class="flight-time">${flight.arrival.time}</p>
          <p class="flight-duration">Terminal ${flight.arrival.terminal}</p>
        </div>
      </div>
      
      <div class="flight-details">
        <div class="flight-info">
          <div class="flight-info-item">
            <span class="flight-info-label">Duración</span>
            <span class="flight-info-value">${flight.duration}</span>
          </div>
          <div class="flight-info-item">
            <span class="flight-info-label">Escalas</span>
            <span class="flight-info-value">${flight.stops}</span>
          </div>
          <div class="flight-info-item">
            <span class="flight-info-label">Avión</span>
            <span class="flight-info-value">${flight.aircraft}</span>
          </div>
          <div class="flight-info-item">
            <span class="flight-info-label">Clase</span>
            <span class="flight-info-value">${flight.class}</span>
          </div>
        </div>
        <button class="select-flight-btn" data-flight-id="${flight.id}" data-flight-type="${type}">
          Seleccionar
        </button>
      </div>
    `;
    
    // Agregar evento de click a la tarjeta
    card.addEventListener('click', function(e) {
      if (!e.target.classList.contains('select-flight-btn')) {
        selectFlight(flight.id, type);
      }
    });
    
    // Agregar evento al botón de seleccionar
    const selectBtn = card.querySelector('.select-flight-btn');
    selectBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      selectFlight(flight.id, type);
    });
    
    return card;
  }
  
  function selectFlight(flightId, type) {
    // Remover selección anterior del mismo tipo
    document.querySelectorAll(`[data-flight-type="${type}"]`).forEach(card => {
      card.classList.remove('selected');
      const btn = card.querySelector('.select-flight-btn');
      if (btn) {
        btn.textContent = 'Seleccionar';
        btn.classList.remove('selected');
      }
    });
    
    // Seleccionar nueva tarjeta
    const selectedCard = document.querySelector(`[data-flight-id="${flightId}"]`);
    if (selectedCard) {
      selectedCard.classList.add('selected');
      
      const selectBtn = selectedCard.querySelector('.select-flight-btn');
      if (selectBtn) {
        selectBtn.textContent = '✓ Seleccionado';
        selectBtn.classList.add('selected');
      }
      
      // Almacenar selección
      if (type === 'departure') {
        window.selectedDeparture = flightId;
      } else if (type === 'return') {
        window.selectedReturn = flightId;
      }
      
      // Actualizar resumen
      updateSelectionSummary();
      
      console.log(`${type === 'departure' ? 'Vuelo de ida' : 'Vuelo de vuelta'} seleccionado:`, flightId);
    }
  }
  
  function updateSelectionSummary() {
    const departureSummary = document.getElementById('departure-summary');
    const returnSummary = document.getElementById('return-summary');
    const finalizeBtn = document.getElementById('finalize-btn');
    const priceSummary = document.getElementById('flight-price-summary');
    
    if (departureSummary) {
      departureSummary.textContent = window.selectedDeparture 
        ? `Vuelo de ida: ${window.selectedDeparture}` 
        : 'Vuelo de ida: No seleccionado';
    }
    
    if (returnSummary) {
      returnSummary.textContent = window.selectedReturn 
        ? `Vuelo de vuelta: ${window.selectedReturn}` 
        : 'Vuelo de vuelta: No seleccionado';
    }
    
    // Habilitar botón de finalizar si se cumplen las condiciones
    const canFinalize = window.selectedDeparture && 
                       (currentTripType === 'one-way' || window.selectedReturn);
    
    if (finalizeBtn) {
      finalizeBtn.disabled = !canFinalize;
    }
    
    // Actualizar resumen de precios
    updatePriceSummary();
  }
  
  function updatePriceSummary() {
    const priceSummary = document.getElementById('flight-price-summary');
    const departurePrice = document.getElementById('departure-price');
    const returnPrice = document.getElementById('return-price');
    const passengersCount = document.getElementById('passengers-count');
    const totalPrice = document.getElementById('total-price');
    
    if (!priceSummary) return;
    
    // Mostrar/ocultar resumen de precios
    const hasSelection = window.selectedDeparture && 
                        (currentTripType === 'one-way' || window.selectedReturn);
    
    priceSummary.style.display = hasSelection ? 'block' : 'none';
    
    if (hasSelection) {
      let total = 0;
      
      // Obtener precios de los vuelos seleccionados
      const departureCard = document.querySelector(`[data-flight-id="${window.selectedDeparture}"]`);
      if (departureCard) {
        const priceText = departureCard.querySelector('.price-amount').textContent;
        const price = parsePrice(priceText);
        total += price;
        if (departurePrice) departurePrice.textContent = formatPrice(price);
      }
      
      if (window.selectedReturn && currentTripType === 'round-trip') {
        const returnCard = document.querySelector(`[data-flight-id="${window.selectedReturn}"]`);
        if (returnCard) {
          const priceText = returnCard.querySelector('.price-amount').textContent;
          const price = parsePrice(priceText);
          total += price;
          if (returnPrice) returnPrice.textContent = formatPrice(price);
        }
      }
      
      // Actualizar pasajeros y total
      if (passengersCount) passengersCount.textContent = passengersCount;
      if (totalPrice) totalPrice.textContent = formatPrice(total);
    }
  }
  
  function parsePrice(priceText) {
    // Extraer número del texto de precio (ej: "$450,000" -> 450000)
    const cleanPrice = priceText.replace(/[$,.]/g, '');
    return parseInt(cleanPrice) || 0;
  }
  
  function formatPrice(price) {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  }
  
  function finalizeReservation() {
    const selection = {
      departure: window.selectedDeparture,
      return: currentTripType === 'round-trip' ? window.selectedReturn : null,
      tripType: currentTripType,
      passengers: passengersCount,
      children: childrenCount
    };
    
    console.log('Reserva finalizada:', selection);
    
    // Aquí puedes agregar lógica para continuar con el proceso de reserva
    // Por ejemplo: redirigir a página de pago, mostrar formulario de pasajeros, etc.
    alert(`¡Reserva confirmada!\nVuelo de ida: ${selection.departure}\n${selection.return ? `Vuelo de vuelta: ${selection.return}` : 'Solo ida'}`);
  }
  
  function simulateFlightAPI(searchData) {
    // Simular datos de vuelos - múltiples opciones
    const departureFlights = [
      {
        id: 'DEP001',
        airline: 'Aerolíneas Nacionales',
        flightNumber: 'AN-456',
        departure: {
          time: '08:30',
          airport: 'Aeropuerto Internacional ' + searchData.from,
          terminal: 'T1'
        },
        arrival: {
          time: '11:45',
          airport: 'Aeropuerto Internacional ' + searchData.to,
          terminal: 'T2'
        },
        duration: '3h 15m',
        price: {
          adult: 450000,
          child: 225000,
          currency: 'COP'
        },
        aircraft: 'Boeing 737-800',
        stops: 'Directo',
        class: 'Económica',
        type: 'departure'
      },
      {
        id: 'DEP002',
        airline: 'Vuelos Express',
        flightNumber: 'VE-789',
        departure: {
          time: '14:20',
          airport: 'Aeropuerto Internacional ' + searchData.from,
          terminal: 'T1'
        },
        arrival: {
          time: '17:35',
          airport: 'Aeropuerto Internacional ' + searchData.to,
          terminal: 'T2'
        },
        duration: '3h 15m',
        price: {
          adult: 520000,
          child: 260000,
          currency: 'COP'
        },
        aircraft: 'Airbus A320',
        stops: 'Directo',
        class: 'Económica',
        type: 'departure'
      },
      {
        id: 'DEP003',
        airline: 'Avianca',
        flightNumber: 'AV-123',
        departure: {
          time: '19:45',
          airport: 'Aeropuerto Internacional ' + searchData.from,
          terminal: 'T3'
        },
        arrival: {
          time: '22:30',
          airport: 'Aeropuerto Internacional ' + searchData.to,
          terminal: 'T1'
        },
        duration: '2h 45m',
        price: {
          adult: 380000,
          child: 190000,
          currency: 'COP'
        },
        aircraft: 'Boeing 737-900',
        stops: 'Directo',
        class: 'Económica',
        type: 'departure'
      }
    ];

    const returnFlights = currentTripType === 'round-trip' ? [
      {
        id: 'RET001',
        airline: 'Aerolíneas Nacionales',
        flightNumber: 'AN-457',
        departure: {
          time: '13:15',
          airport: 'Aeropuerto Internacional ' + searchData.to,
          terminal: 'T2'
        },
        arrival: {
          time: '16:30',
          airport: 'Aeropuerto Internacional ' + searchData.from,
          terminal: 'T1'
        },
        duration: '3h 15m',
        price: {
          adult: 450000,
          child: 225000,
          currency: 'COP'
        },
        aircraft: 'Boeing 737-800',
        stops: 'Directo',
        class: 'Económica',
        type: 'return'
      },
      {
        id: 'RET002',
        airline: 'Vuelos Express',
        flightNumber: 'VE-790',
        departure: {
          time: '18:45',
          airport: 'Aeropuerto Internacional ' + searchData.to,
          terminal: 'T2'
        },
        arrival: {
          time: '22:00',
          airport: 'Aeropuerto Internacional ' + searchData.from,
          terminal: 'T1'
        },
        duration: '3h 15m',
        price: {
          adult: 520000,
          child: 260000,
          currency: 'COP'
        },
        aircraft: 'Airbus A320',
        stops: 'Directo',
        class: 'Económica',
        type: 'return'
      },
      {
        id: 'RET003',
        airline: 'Avianca',
        flightNumber: 'AV-124',
        departure: {
          time: '07:20',
          airport: 'Aeropuerto Internacional ' + searchData.to,
          terminal: 'T1'
        },
        arrival: {
          time: '10:05',
          airport: 'Aeropuerto Internacional ' + searchData.from,
          terminal: 'T3'
        },
        duration: '2h 45m',
        price: {
          adult: 380000,
          child: 190000,
          currency: 'COP'
        },
        aircraft: 'Boeing 737-900',
        stops: 'Directo',
        class: 'Económica',
        type: 'return'
      }
    ] : [];

    const allFlights = [...departureFlights, ...returnFlights];
    
    return {
      search: searchData,
      results: {
        totalFlights: allFlights.length,
        searchTime: '0.245s',
        flights: allFlights,
        departureFlights: departureFlights,
        returnFlights: returnFlights
      },
      metadata: {
        apiVersion: '1.0',
        timestamp: new Date().toISOString(),
        provider: 'CloudRooms Flight API'
      }
    };
  }
  
  // Funciones para hoteles
  function simulateHotelAPI(searchData) {
    const hotels = [
      {
        id: 'HTL001',
        name: 'Hotel Gran Central',
        location: 'Centro Histórico, ' + searchData.destination,
        rating: 4.5,
        stars: '★★★★☆',
        price: {
          perNight: 180000,
          total: 180000 * calculateNights(searchData.checkin, searchData.checkout),
          currency: 'COP'
        },
        amenities: ['WiFi', 'Piscina', 'Gimnasio', 'Spa', 'Restaurante'],
        rooms: roomsCount,
        guests: adultsCount + hotelChildrenCount,
        image: 'hotel-image-1',
        checkin: searchData.checkin,
        checkout: searchData.checkout
      },
      {
        id: 'HTL002',
        name: 'Resort Paradise',
        location: 'Zona Hotelera, ' + searchData.destination,
        rating: 4.8,
        stars: '★★★★★',
        price: {
          perNight: 320000,
          total: 320000 * calculateNights(searchData.checkin, searchData.checkout),
          currency: 'COP'
        },
        amenities: ['WiFi', 'Piscina', 'Playa Privada', 'Spa', 'Restaurante', 'Bar'],
        rooms: roomsCount,
        guests: adultsCount + hotelChildrenCount,
        image: 'hotel-image-2',
        checkin: searchData.checkin,
        checkout: searchData.checkout
      },
      {
        id: 'HTL003',
        name: 'Boutique Hotel Luna',
        location: 'Zona Rosa, ' + searchData.destination,
        rating: 4.2,
        stars: '★★★★☆',
        price: {
          perNight: 240000,
          total: 240000 * calculateNights(searchData.checkin, searchData.checkout),
          currency: 'COP'
        },
        amenities: ['WiFi', 'Desayuno', 'Concierge', 'Valet Parking'],
        rooms: roomsCount,
        guests: adultsCount + hotelChildrenCount,
        image: 'hotel-image-3',
        checkin: searchData.checkin,
        checkout: searchData.checkout
      }
    ];
    
    return {
      search: searchData,
      results: {
        totalHotels: hotels.length,
        searchTime: '0.189s',
        hotels: hotels
      },
      metadata: {
        apiVersion: '1.0',
        timestamp: new Date().toISOString(),
        provider: 'CloudRooms Hotel API'
      }
    };
  }
  
  function calculateNights(checkin, checkout) {
    if (!checkin || !checkout) return 1;
    const checkinDate = new Date(checkin);
    const checkoutDate = new Date(checkout);
    const diffTime = Math.abs(checkoutDate - checkinDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1;
  }
  
  function generateHotelCards(hotels) {
    const container = document.getElementById('hotel-cards-container');
    container.innerHTML = '';
    
    // Variable para almacenar selección
    window.selectedHotel = null;
    
    hotels.forEach(hotel => {
      const card = createHotelCard(hotel);
      container.appendChild(card);
    });
    
    // Generar sección de finalización
    const finalizeSection = createHotelFinalizeSection();
    container.appendChild(finalizeSection);
  }
  
  function createHotelCard(hotel) {
    const card = document.createElement('div');
    card.className = 'hotel-card';
    card.dataset.hotelId = hotel.id;
    
    const totalPrice = hotel.price.total;
    const formattedPrice = new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(totalPrice);
    
    const perNightPrice = new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(hotel.price.perNight);
    
    card.innerHTML = `
      <div class="hotel-card-header">
        <div class="hotel-info">
          <h6 class="hotel-name">${hotel.name}</h6>
          <p class="hotel-location">${hotel.location}</p>
          <div class="hotel-rating">
            <span class="rating-stars">${hotel.stars}</span>
            <span class="rating-text">${hotel.rating} (Excelente)</span>
          </div>
        </div>
        <div class="hotel-price">
          <p class="price-amount">${formattedPrice}</p>
          <p class="price-per-night">${perNightPrice} por noche</p>
        </div>
      </div>
      
      <div class="hotel-image">
        <span>Imagen del hotel</span>
      </div>
      
      <div class="hotel-amenities">
        ${hotel.amenities.map(amenity => `<span class="amenity-tag">${amenity}</span>`).join('')}
      </div>
      
      <div class="hotel-details">
        <div class="hotel-info-details">
          <div class="hotel-info-item">
            <span class="hotel-info-label">Habitaciones</span>
            <span class="hotel-info-value">${hotel.rooms}</span>
          </div>
          <div class="hotel-info-item">
            <span class="hotel-info-label">Huéspedes</span>
            <span class="hotel-info-value">${hotel.guests}</span>
          </div>
          <div class="hotel-info-item">
            <span class="hotel-info-label">Check-in</span>
            <span class="hotel-info-value">${hotel.checkin}</span>
          </div>
          <div class="hotel-info-item">
            <span class="hotel-info-label">Check-out</span>
            <span class="hotel-info-value">${hotel.checkout}</span>
          </div>
        </div>
        <button class="select-hotel-btn" data-hotel-id="${hotel.id}">
          Seleccionar
        </button>
      </div>
    `;
    
    // Agregar evento de click a la tarjeta
    card.addEventListener('click', function(e) {
      if (!e.target.classList.contains('select-hotel-btn')) {
        selectHotel(hotel.id);
      }
    });
    
    // Agregar evento al botón de seleccionar
    const selectBtn = card.querySelector('.select-hotel-btn');
    selectBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      selectHotel(hotel.id);
    });
    
    return card;
  }
  
  function selectHotel(hotelId) {
    // Remover selección anterior
    document.querySelectorAll('.hotel-card').forEach(card => {
      card.classList.remove('selected');
      const btn = card.querySelector('.select-hotel-btn');
      if (btn) {
        btn.textContent = 'Seleccionar';
        btn.classList.remove('selected');
      }
    });
    
    // Seleccionar nueva tarjeta
    const selectedCard = document.querySelector(`[data-hotel-id="${hotelId}"]`);
    if (selectedCard) {
      selectedCard.classList.add('selected');
      
      const selectBtn = selectedCard.querySelector('.select-hotel-btn');
      if (selectBtn) {
        selectBtn.textContent = '✓ Seleccionado';
        selectBtn.classList.add('selected');
      }
      
      // Almacenar selección
      window.selectedHotel = hotelId;
      
      // Actualizar resumen
      updateHotelSelectionSummary();
      
      console.log('Hotel seleccionado:', hotelId);
    }
  }
  
  function updateHotelSelectionSummary() {
    const hotelSummary = document.getElementById('hotel-summary');
    const finalizeBtn = document.getElementById('finalize-hotel-btn');
    
    if (hotelSummary) {
      hotelSummary.textContent = window.selectedHotel 
        ? `Hotel seleccionado: ${window.selectedHotel}` 
        : 'Hotel: No seleccionado';
    }
    
    // Habilitar botón de finalizar
    if (finalizeBtn) {
      finalizeBtn.disabled = !window.selectedHotel;
    }
    
    // Actualizar resumen de precios
    updateHotelPriceSummary();
  }
  
  function updateHotelPriceSummary() {
    const priceSummary = document.getElementById('hotel-price-summary');
    const hotelSelectedPrice = document.getElementById('hotel-selected-price');
    const roomsCount = document.getElementById('rooms-count');
    const guestsCount = document.getElementById('guests-count');
    const nightsCount = document.getElementById('nights-count');
    const totalPrice = document.getElementById('hotel-total-price');
    
    if (!priceSummary) return;
    
    // Mostrar/ocultar resumen de precios
    priceSummary.style.display = window.selectedHotel ? 'block' : 'none';
    
    if (window.selectedHotel) {
      // Obtener precio del hotel seleccionado
      const hotelCard = document.querySelector(`[data-hotel-id="${window.selectedHotel}"]`);
      if (hotelCard) {
        const priceText = hotelCard.querySelector('.price-amount').textContent;
        const price = parsePrice(priceText);
        
        if (hotelSelectedPrice) hotelSelectedPrice.textContent = formatPrice(price);
        if (roomsCount) roomsCount.textContent = roomsCount;
        if (guestsCount) guestsCount.textContent = adultsCount + hotelChildrenCount;
        if (nightsCount) {
          const checkin = document.getElementById('checkin-date').value;
          const checkout = document.getElementById('checkout-date').value;
          nightsCount.textContent = calculateNights(checkin, checkout);
        }
        if (totalPrice) totalPrice.textContent = formatPrice(price);
      }
    }
  }
  
  function createHotelFinalizeSection() {
    const section = document.createElement('div');
    section.className = 'finalize-section';
    
    section.innerHTML = `
      <div class="finalize-container">
        <div class="selection-summary">
          <h6>Resumen de Selección</h6>
          <div id="hotel-selection-details">
            <p id="hotel-summary">Hotel: No seleccionado</p>
          </div>
          <div class="price-summary" id="hotel-price-summary" style="display: none;">
            <div class="price-breakdown">
              <div class="price-item">
                <span>Hotel seleccionado</span>
                <span id="hotel-selected-price">$0</span>
              </div>
              <div class="price-item">
                <span>Habitaciones</span>
                <span id="rooms-count">1</span>
              </div>
              <div class="price-item">
                <span>Huéspedes</span>
                <span id="guests-count">2</span>
              </div>
              <div class="price-item">
                <span>Noches</span>
                <span id="nights-count">1</span>
              </div>
              <div class="price-divider"></div>
              <div class="price-item total">
                <span>Total</span>
                <span id="hotel-total-price">$0</span>
              </div>
            </div>
          </div>
        </div>
        <button class="finalize-btn" id="finalize-hotel-btn" disabled>
          Finalizar Reserva
        </button>
      </div>
    `;
    
    // Agregar evento al botón de finalizar
    const finalizeBtn = section.querySelector('#finalize-hotel-btn');
    finalizeBtn.addEventListener('click', finalizeHotelReservation);
    
    return section;
  }
  
  function finalizeHotelReservation() {
    const selection = {
      hotel: window.selectedHotel,
      rooms: roomsCount,
      adults: adultsCount,
      children: hotelChildrenCount
    };
    
    console.log('Reserva de hotel finalizada:', selection);
    
    alert(`¡Reserva de hotel confirmada!\nHotel: ${selection.hotel}\nHabitaciones: ${selection.rooms}\nHuéspedes: ${selection.adults + selection.children}`);
  }
  
  // Inicializar
  updateSelectedServices();
});
