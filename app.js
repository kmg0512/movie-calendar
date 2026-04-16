// State
let currentDate = new Date();
// Movies keyed by YYYY-MM-DD
// Structure: { poster, title, cinema, seat, memo }
let watchedMovies = JSON.parse(localStorage.getItem('watchedMovies')) || {};
let activeDateStr = null;
let tempSelectedMovie = null;

// Mock Data for "API" search
const MOCK_MOVIES = [
    { title: "Dune: Part Two", year: 2024, poster: "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2JGqq9TrU.jpg" },
    { title: "Oppenheimer", year: 2023, poster: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg" },
    { title: "Poor Things", year: 2023, poster: "https://image.tmdb.org/t/p/w500/kCGlIMHnOm8Ph-rvCGKV71q4G4O.jpg" },
    { title: "Spider-Man: Across the Spider-Verse", year: 2023, poster: "https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg" },
    { title: "Everything Everywhere All at Once", year: 2022, poster: "https://image.tmdb.org/t/p/w500/w3LxiVYdWWRvEVdn5RYq6jIqkb1.jpg" },
    { title: "Interstellar", year: 2014, poster: "https://image.tmdb.org/t/p/w500/gEU2QlsUUHXjNpeVD85eXqN182E.jpg" },
    { title: "The Dark Knight", year: 2008, poster: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg" },
    { title: "Inception", year: 2010, poster: "https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg" },
    { title: "Parasite", year: 2019, poster: "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg" },
    { title: "Mad Max: Fury Road", year: 2015, poster: "https://image.tmdb.org/t/p/w500/hA2ple9q4cbBUGRVG37DI58I10n.jpg" }
];

// DOM Elements
const currentMonthYearEl = document.getElementById('currentMonthYear');
const calendarGridEl = document.getElementById('calendarGrid');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');

const modal = document.getElementById('movieModal');
const closeModalBtn = document.getElementById('closeModal');
const modalDateLabel = document.getElementById('modalDateLabel');

// Views
const modalSearchView = document.getElementById('modalSearchView');
const modalDetailsView = document.getElementById('modalDetailsView');

// Search Elements
const movieSearchInput = document.getElementById('movieSearchInput');
const searchResults = document.getElementById('searchResults');
const customUrlInput = document.getElementById('customUrlInput');
const proceedCustomUrlBtn = document.getElementById('proceedCustomUrl');

// Details Elements
const detailsPoster = document.getElementById('detailsPoster');
const detailsTitle = document.getElementById('detailsTitle');
const changeMovieBtn = document.getElementById('changeMovieBtn');
const cinemaInput = document.getElementById('cinemaInput');
const seatInput = document.getElementById('seatInput');
const memoInput = document.getElementById('memoInput');

const saveDetailsBtn = document.getElementById('saveDetailsBtn');
const removeMovieBtn = document.getElementById('removeMovieBtn');

// Helper formatting
const formatYearMonth = (date) => {
    return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date);
};

const formatDateObj = (dateObj) => {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

// Render Calendar
function renderCalendar() {
    calendarGridEl.innerHTML = '';
    currentMonthYearEl.textContent = formatYearMonth(currentDate);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const todayStr = formatDateObj(new Date());

    // Empty cells for days of prev month
    for (let i = 0; i < firstDayOfMonth; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'calendar-day empty';
        calendarGridEl.appendChild(emptyCell);
    }

    // Days of current month
    for (let i = 1; i <= daysInMonth; i++) {
        const dayCell = document.createElement('div');
        dayCell.className = 'calendar-day';
        
        const cellDate = new Date(year, month, i);
        const dateStr = formatDateObj(cellDate);
        
        if (dateStr === todayStr) {
            dayCell.classList.add('today');
        }

        dayCell.innerHTML = `<span class="day-number">${i}</span>`;
        dayCell.dataset.date = dateStr;

        // Check if there's a movie saved for this date
        if (watchedMovies[dateStr]) {
            dayCell.classList.add('has-movie');
            const posterImg = document.createElement('img');
            posterImg.src = watchedMovies[dateStr].poster;
            posterImg.alt = "Movie Poster";
            posterImg.className = "movie-poster";
            
            const overlay = document.createElement('div');
            overlay.className = "day-overlay";

            dayCell.appendChild(posterImg);
            dayCell.appendChild(overlay);
        }

        dayCell.addEventListener('click', () => openModal(dateStr, cellDate));
        
        calendarGridEl.appendChild(dayCell);
    }
}

// Modal logic
function openModal(dateStr, dateObj) {
    activeDateStr = dateStr;
    const formattedDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(dateObj);
    modalDateLabel.textContent = `Log movie for ${formattedDate}`;
    
    // Reset all inputs
    movieSearchInput.value = '';
    customUrlInput.value = '';
    searchResults.innerHTML = '';
    searchResults.classList.add('hidden');
    cinemaInput.value = '';
    seatInput.value = '';
    memoInput.value = '';
    tempSelectedMovie = null;

    if (watchedMovies[dateStr]) {
        // Unpack existing movie details
        const m = watchedMovies[dateStr];
        showDetailsView(m.poster, m.title, m.cinema, m.seat, m.memo);
        removeMovieBtn.classList.remove('hidden');
    } else {
        // Start fresh with search
        showSearchView();
        removeMovieBtn.classList.add('hidden');
    }

    modal.classList.remove('hidden');
}

function showSearchView() {
    modalSearchView.classList.remove('hidden');
    modalDetailsView.classList.add('hidden');
    movieSearchInput.focus();
}

function showDetailsView(poster, title, cinema = '', seat = '', memo = '') {
    tempSelectedMovie = { poster, title };
    
    detailsPoster.src = poster;
    detailsTitle.textContent = title;
    
    cinemaInput.value = cinema || '';
    seatInput.value = seat || '';
    memoInput.value = memo || '';
    
    modalSearchView.classList.add('hidden');
    modalDetailsView.classList.remove('hidden');
    cinemaInput.focus();
}

function closeModal() {
    modal.classList.add('hidden');
    activeDateStr = null;
    tempSelectedMovie = null;
}

// Save Movie Details
function saveMovieDetails() {
    if (!activeDateStr || !tempSelectedMovie) return;

    watchedMovies[activeDateStr] = {
        poster: tempSelectedMovie.poster,
        title: tempSelectedMovie.title,
        cinema: cinemaInput.value.trim(),
        seat: seatInput.value.trim(),
        memo: memoInput.value.trim()
    };
    
    localStorage.setItem('watchedMovies', JSON.stringify(watchedMovies));
    renderCalendar();
    closeModal();
}

// Remove Movie
function removeMovie() {
    if (!activeDateStr) return;
    delete watchedMovies[activeDateStr];
    localStorage.setItem('watchedMovies', JSON.stringify(watchedMovies));
    renderCalendar();
    closeModal();
}

// Search Logic
function handleSearch(e) {
    const query = e.target.value.toLowerCase().trim();
    searchResults.innerHTML = '';
    
    if (query.length === 0) {
        searchResults.classList.add('hidden');
        return;
    }

    const filtered = MOCK_MOVIES.filter(m => m.title.toLowerCase().includes(query));
    
    if (filtered.length > 0) {
        filtered.forEach(movie => {
            const item = document.createElement('div');
            item.className = 'search-item';
            item.innerHTML = `
                <img src="${movie.poster}" alt="${movie.title}">
                <div class="search-item-info">
                    <span class="search-item-title">${movie.title}</span>
                    <span class="search-item-year">${movie.year}</span>
                </div>
            `;
            item.addEventListener('click', () => {
                showDetailsView(movie.poster, movie.title);
            });
            searchResults.appendChild(item);
        });
        searchResults.classList.remove('hidden');
    } else {
        searchResults.classList.add('hidden');
    }
}

// Event Listeners
prevMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

nextMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

closeModalBtn.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});

movieSearchInput.addEventListener('input', handleSearch);

proceedCustomUrlBtn.addEventListener('click', () => {
    const url = customUrlInput.value.trim();
    if (url) {
        showDetailsView(url, 'Custom Entry');
    }
});

changeMovieBtn.addEventListener('click', () => {
    showSearchView();
});

saveDetailsBtn.addEventListener('click', saveMovieDetails);
removeMovieBtn.addEventListener('click', removeMovie);

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    renderCalendar();
});
