document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname.split('/').pop();

    // Funzioni comuni
    function getTodaysDate() {
        const today = new Date();
        const yyyy = today.getFullYear();
        let mm = today.getMonth() + 1; // Months start at 0!
        let dd = today.getDate();
        if (dd < 10) dd = '0' + dd;
        if (mm < 10) mm = '0' + mm;
        return `${yyyy}-${mm}-${dd}`;
    }

    // --- LOGICA PER INDEX.HTML ---
    if (currentPage === 'index.html' || currentPage === '') {
        const carCards = document.querySelectorAll('.car-card');
        carCards.forEach(card => {
            const button = card.querySelector('.select-car-btn');
            button.addEventListener('click', () => {
                const carId = card.dataset.carId;
                const carName = card.dataset.carName;
                const carImage = card.dataset.carImage;

                localStorage.setItem('selectedCar', JSON.stringify({ id: carId, name: carName, image: carImage }));
                window.location.href = 'booking.html';
            });
        });
        // Nasconde il link "Prenota" nella nav se non c'è un'auto selezionata
        const navBookingLink = document.getElementById('nav-booking-link');
        if (localStorage.getItem('selectedCar')) {
            if (navBookingLink) navBookingLink.style.display = 'inline';
        } else {
            if (navBookingLink) navBookingLink.style.display = 'none';
        }
    }

    // --- LOGICA PER BOOKING.HTML ---
    if (currentPage === 'booking.html') {
        const selectedCarData = JSON.parse(localStorage.getItem('selectedCar'));
        const bookingCarImage = document.getElementById('booking-car-image');
        const bookingCarName = document.getElementById('booking-car-name');
        const searchDealersBtn = document.getElementById('search-dealers-btn');
        const dealersListDiv = document.getElementById('dealers-list');
        const bookingFormSection = document.getElementById('booking-form-section');
        const testDriveForm = document.getElementById('test-drive-form');
        const dateInput = document.getElementById('date');

        if (dateInput) {
            dateInput.setAttribute('min', getTodaysDate());
        }
        
        if (!selectedCarData) {
            // Reindirizza alla home se nessuna auto è selezionata
            window.location.href = 'index.html';
            return;
        }

        if (bookingCarImage) bookingCarImage.src = selectedCarData.image;
        if (bookingCarName) bookingCarName.textContent = selectedCarData.name;
        if (document.getElementById('selected-car-id-form')) {
            document.getElementById('selected-car-id-form').value = selectedCarData.id;
        }


        // Simula la ricerca concessionari
        const mockDealers = [
            { id: 'dealer1', name: 'Concessionario Auto Elite', address: 'Via Roma 1, Milano', city: 'Milano' },
            { id: 'dealer2', name: 'MotorTech Center', address: 'Corso Italia 20, Roma', city: 'Roma' },
            { id: 'dealer3', name: 'FutureDrive Showroom', address: 'Viale Europa 55, Torino', city: 'Torino' },
            { id: 'dealer4', name: 'Speedster Garage', address: 'Via Garibaldi 10, Milano', city: 'Milano' }
        ];

        if (searchDealersBtn) {
            searchDealersBtn.addEventListener('click', () => {
                const locationInput = document.getElementById('location-input').value.toLowerCase();
                dealersListDiv.innerHTML = '<h3>Concessionari Trovati:</h3>';
                
                const mapPlaceholder = document.getElementById('map-placeholder');
                mapPlaceholder.innerHTML = `<p>Simulazione mappa per: ${locationInput || 'tutta Italia'}. In un'app reale, qui ci sarebbe una mappa interattiva.</p>`;
                mapPlaceholder.style.alignItems = 'flex-start'; // Cambia allineamento per testo lungo


                let foundDealers = false;
                mockDealers.forEach(dealer => {
                    // Semplice check se la città inserita è nel nome o indirizzo (o se l'input è vuoto, mostra tutti)
                    if (!locationInput || dealer.city.toLowerCase().includes(locationInput) || dealer.address.toLowerCase().includes(locationInput)) {
                        const dealerDiv = document.createElement('div');
                        dealerDiv.classList.add('dealer-item');
                        dealerDiv.innerHTML = `
                            <div>
                                <h4>${dealer.name}</h4>
                                <p>${dealer.address}</p>
                            </div>
                            <button class="cta-button book-here-btn" data-dealer-id="${dealer.id}" data-dealer-name="${dealer.name}" data-dealer-address="${dealer.address}">Prenota Qui</button>
                        `;
                        dealersListDiv.appendChild(dealerDiv);
                        foundDealers = true;
                    }
                });

                if(!foundDealers) {
                    dealersListDiv.innerHTML += '<p>Nessun concessionario trovato per la tua ricerca.</p>';
                }

                // Aggiungi event listener ai nuovi bottoni "Prenota Qui"
                document.querySelectorAll('.book-here-btn').forEach(button => {
                    button.addEventListener('click', (e) => {
                        const dealerId = e.target.dataset.dealerId;
                        const dealerName = e.target.dataset.dealerName;
                        document.getElementById('selected-dealer-id-form').value = dealerId;
                        document.getElementById('dealer-name-display').value = dealerName;
                        localStorage.setItem('selectedDealerAddress', e.target.dataset.dealerAddress); // Salva indirizzo per confirmation page
                        bookingFormSection.style.display = 'block';
                        bookingFormSection.scrollIntoView({ behavior: 'smooth' });
                    });
                });
            });
        }

        if (testDriveForm) {
            testDriveForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const formData = new FormData(testDriveForm);
                const bookingDetails = {
                    carId: selectedCarData.id,
                    carName: selectedCarData.name,
                    dealerId: formData.get('dealerId'),
                    dealerName: formData.get('dealerNameDisplay'),
                    dealerAddress: localStorage.getItem('selectedDealerAddress'),
                    userName: formData.get('name'),
                    userEmail: formData.get('email'),
                    userPhone: formData.get('phone'),
                    date: formData.get('date'),
                    time: formData.get('time')
                };
                localStorage.setItem('bookingConfirmation', JSON.stringify(bookingDetails));
                window.location.href = 'confirmation.html';
            });
        }
    }

    // --- LOGICA PER CONFIRMATION.HTML ---
    if (currentPage === 'confirmation.html') {
        const bookingData = JSON.parse(localStorage.getItem('bookingConfirmation'));
        if (!bookingData) {
            // Se non ci sono dati di conferma, torna alla home
            window.location.href = 'index.html';
            return;
        }

        document.getElementById('summary-car-name').textContent = bookingData.carName;
        document.getElementById('summary-dealer-name').textContent = bookingData.dealerName;
        document.getElementById('summary-dealer-address').textContent = bookingData.dealerAddress || 'N/D';
        document.getElementById('summary-datetime').textContent = `${new Date(bookingData.date).toLocaleDateString('it-IT')} alle ${bookingData.time}`;
        document.getElementById('summary-user-name').textContent = bookingData.userName;

        // Opzionale: pulire localStorage dopo la conferma
        // localStorage.removeItem('selectedCar');
        // localStorage.removeItem('bookingConfirmation');
        // localStorage.removeItem('selectedDealerAddress');
    }
});
