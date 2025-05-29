document.addEventListener('DOMContentLoaded', () => {
    // Función para formatear la fecha
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };
    
    // Función para calcular la edad
    const calculateAge = (dob) => {
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        return age;
    };
    
    // Función para renderizar las tarjetas de persona
    const renderPersonCards = (people) => {
        const personList = document.getElementById('personList');
        personList.innerHTML = '';
        
        people.forEach(person => {
            const age = calculateAge(person.dob.date);
            
            const card = document.createElement('div');
            card.className = 'person-card';
            
            card.innerHTML = `
                <div class="person-header">
                    <img src="${person.picture.large}" alt="${person.name.first}" class="person-img">
                    <div>
                        <div class="person-name">${person.name.title} ${person.name.first} ${person.name.last}</div>
                        <div class="person-title">Edad: ${age} años</div>
                    </div>
                </div>
                <div class="person-details">
                    <div class="detail-item">
                        <div class="detail-icon">
                            <i class="fas ${person.gender === 'male' ? 'fa-mars' : 'fa-venus'}"></i>
                        </div>
                        <div class="detail-content">
                            <div class="detail-label">GÉNERO</div>
                            <div class="detail-value gender-${person.gender}">${person.gender === 'male' ? 'Masculino' : 'Femenino'}</div>
                        </div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-icon">
                            <i class="fas fa-map-marker-alt"></i>
                        </div>
                        <div class="detail-content">
                            <div class="detail-label">UBICACIÓN</div>
                            <div class="detail-value">${person.location.city}, ${person.location.country}</div>
                        </div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-icon">
                            <i class="fas fa-envelope"></i>
                        </div>
                        <div class="detail-content">
                            <div class="detail-label">CORREO</div>
                            <div class="detail-value">${person.email}</div>
                        </div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-icon">
                            <i class="fas fa-birthday-cake"></i>
                        </div>
                        <div class="detail-content">
                            <div class="detail-label">FECHA DE NACIMIENTO</div>
                            <div class="detail-value">${formatDate(person.dob.date)}</div>
                        </div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-icon">
                            <i class="fas fa-phone"></i>
                        </div>
                        <div class="detail-content">
                            <div class="detail-label">TELÉFONO</div>
                            <div class="detail-value">${person.phone}</div>
                        </div>
                    </div>
                </div>
            `;
            
            personList.appendChild(card);
        });
    };
    
    // Función para actualizar estadísticas
    const updateStats = (people) => {
        // Total de personas
        document.getElementById('totalPersons').textContent = people.length;
        
        // Distribución de género
        const males = people.filter(p => p.gender === 'male').length;
        const females = people.filter(p => p.gender === 'female').length;
        const malePercentage = Math.round((males / people.length) * 100);
        const femalePercentage = 100 - malePercentage;
        document.getElementById('genderRatio').textContent = `${malePercentage}% H / ${femalePercentage}% M`;
        
        // Países diferentes
        const countries = [...new Set(people.map(p => p.location.country))];
        document.getElementById('countriesCount').textContent = countries.length;
    };
    
    // Función para manejar la búsqueda
    const setupSearch = (people) => {
        const searchInput = document.getElementById('searchInput');
        
        searchInput.addEventListener('input', () => {
            const searchTerm = searchInput.value.toLowerCase();
            const filteredPeople = people.filter(person => {
                const fullName = `${person.name.first} ${person.name.last}`.toLowerCase();
                const location = `${person.location.city}, ${person.location.country}`.toLowerCase();
                return fullName.includes(searchTerm) || 
                       location.includes(searchTerm) ||
                       person.email.toLowerCase().includes(searchTerm);
            });
            
            renderPersonCards(filteredPeople);
        });
    };
    
    // Función para manejar filtros
    const setupFilters = (people) => {
        const genderFilter = document.getElementById('genderFilter');
        const sortBy = document.getElementById('sortBy');
        
        const applyFilters = () => {
            let filteredPeople = [...people];
            
            // Aplicar filtro de género
            if (genderFilter.value !== 'all') {
                filteredPeople = filteredPeople.filter(
                    p => p.gender === genderFilter.value
                );
            }
            
            // Aplicar ordenamiento
            switch(sortBy.value) {
                case 'name':
                    filteredPeople.sort((a, b) => 
                        `${a.name.first} ${a.name.last}`.localeCompare(`${b.name.first} ${b.name.last}`)
                    );
                    break;
                case 'age':
                    filteredPeople.sort((a, b) => 
                        calculateAge(a.dob.date) - calculateAge(b.dob.date)
                    );
                    break;
                case 'country':
                    filteredPeople.sort((a, b) => 
                        a.location.country.localeCompare(b.location.country)
                    );
                    break;
            }
            
            renderPersonCards(filteredPeople);
        };
        
        genderFilter.addEventListener('change', applyFilters);
        sortBy.addEventListener('change', applyFilters);
    };
    
    // Cargar datos de la API
    fetch('https://randomuser.me/api/?results=10&nat=us,gb,ca,au,es')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            const people = data.results;
            renderPersonCards(people);
            updateStats(people);
            setupSearch(people);
            setupFilters(people);
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            const personList = document.getElementById('personList');
            personList.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #ff6b6b; margin-bottom: 20px;"></i>
                    <h3>Error al cargar los datos</h3>
                    <p>No se pudo cargar la información de las personas. Por favor, inténtalo de nuevo más tarde.</p>
                    <button class="btn btn-primary" style="margin-top: 20px;" onclick="location.reload()">
                        <i class="fas fa-sync-alt"></i> Reintentar
                    </button>
                </div>
            `;
        });
});