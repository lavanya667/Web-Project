// --- DATA ---
const movies = [];
const basePosters = [
    'assets/poster_scifi.png',
    'assets/poster_action.png',
    'assets/poster_drama.png'
];
const genres = ['Action', 'Sci-Fi', 'Drama', 'Thriller', 'Comedy', 'Horror'];
const movieTitles = [
    'Quantum Nexus', 'Velocity Run', 'Silenced Echo', 'Neon Nights', 
    'The Last Vanguard', 'Dark Matter', 'Crimson Tide', 'Zero Gravity',
    'Solar Flare', 'Midnight Paradox', 'Cyber Heist', 'Rogue Protocol',
    'Abyssal Depth', 'Fallen Empire', 'Steel Horizon', 'Shadow Broker',
    'Time Weaver', 'Lunar Base', 'Infinite Loop', 'Ghost in the Machine',
    'Iron Will', 'Phantom Strike', 'Eternity Gate', 'Blood Reign', 'Apex Predator'
];

// Generate 25 movies dynamically
for (let i = 0; i < 25; i++) {
    const poster = basePosters[i % 3];
    const genre = genres[Math.floor(Math.random() * genres.length)];
    const price = Math.floor(Math.random() * 8) + 8; // $8 to $15
    const rating = (Math.random() * 3 + 6.5).toFixed(1); // 6.5 to 9.5
    const duration = Math.floor(Math.random() * 60) + 90; // 90 to 150 min
    
    movies.push({
        id: i + 1,
        title: movieTitles[i],
        poster: poster,
        genre: genre,
        price: price,
        rating: rating,
        duration: duration,
        desc: `Experience the breathtaking journey of ${movieTitles[i]}. A thrilling cinematic experience filled with stunning visuals, gripping narrative, and unforgettable moments.`
    });
}

// --- STATE ---
let currentMovie = null;
const rows = 6;
const seatsPerRow = 8;
const rowLetters = ['A', 'B', 'C', 'D', 'E', 'F'];

// --- DOM ELEMENTS ---
// Wait for DOM
document.addEventListener('DOMContentLoaded', () => {
    // Only run this logic if we are on index.html (i.e., homeView exists)
    const homeView = document.getElementById('home-view');
    if (!homeView) return;

    const movieView = document.getElementById('movie-view');
    const movieGrid = document.getElementById('movie-grid');
    const loader = document.getElementById('loading-overlay');
    const backBtn = document.getElementById('back-to-movies');
    const navLogo = document.getElementById('nav-logo');

    const theaterGrid = document.getElementById('theater-grid');
    const countEl = document.getElementById('count');
    const totalEl = document.getElementById('total');
    const confirmBtn = document.getElementById('confirm-btn');

    const dImg = document.getElementById('detail-img');
    const dTitle = document.getElementById('detail-title');
    const dGenre = document.getElementById('detail-genre');
    const dDuration = document.getElementById('detail-duration');
    const dRating = document.getElementById('detail-rating');
    const dDesc = document.getElementById('detail-desc');
    const dPrice = document.getElementById('detail-price');

    const modal = document.getElementById('modal');
    const closeBtn = document.getElementById('close-btn');

    // Hide loader smoothly
    setTimeout(() => {
        loader.classList.add('hidden');
        setTimeout(() => loader.style.display = 'none', 400);
    }, 500);

    function showLoader(cb) {
        loader.style.display = 'flex';
        // force reflow
        void loader.offsetWidth;
        loader.classList.remove('hidden');
        
        setTimeout(() => {
            cb();
            setTimeout(() => {
                loader.classList.add('hidden');
                setTimeout(() => loader.style.display = 'none', 400);
            }, 400);
        }, 400);
    }

    function renderMovies() {
        movieGrid.innerHTML = '';
        movies.forEach(m => {
            const card = document.createElement('div');
            card.classList.add('movie-card');
            card.innerHTML = `
                <img src="${m.poster}" alt="${m.title}">
                <div class="card-info">
                    <h3 class="card-title">${m.title}</h3>
                    <div class="card-meta">
                        <span>${m.genre}</span>
                        <span>⭐ ${m.rating}</span>
                    </div>
                </div>
            `;
            card.addEventListener('click', () => openMovie(m));
            movieGrid.appendChild(card);
        });
    }

    function openMovie(movie) {
        showLoader(() => {
            currentMovie = movie;
            
            // Populate detail view
            dImg.src = movie.poster;
            dTitle.innerText = movie.title;
            dGenre.innerText = movie.genre;
            dDuration.innerText = `${movie.duration} min`;
            dRating.innerText = movie.rating;
            dDesc.innerText = movie.desc;
            dPrice.innerText = movie.price;
            
            buildTheater();
            
            // Toggle view visibility
            homeView.classList.remove('active-view');
            homeView.classList.add('hidden-view');
            setTimeout(() => {
                homeView.style.display = 'none';
                movieView.style.display = 'block';
                // Trigger reflow
                void movieView.offsetWidth;
                movieView.classList.remove('hidden-view');
                movieView.classList.add('active-view');
            }, 500); // Wait for fade out
        });
    }

    function closeMovie() {
        showLoader(() => {
            movieView.classList.remove('active-view');
            movieView.classList.add('hidden-view');
            setTimeout(() => {
                movieView.style.display = 'none';
                homeView.style.display = 'block';
                // Trigger reflow
                void homeView.offsetWidth;
                homeView.classList.remove('hidden-view');
                homeView.classList.add('active-view');
                currentMovie = null;
            }, 500);
        });
    }

    // Seeded random for consistent booked seats per movie
    function seededRandom(seed) {
        var x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    }

    function buildTheater() {
        theaterGrid.innerHTML = '';
        let seed = currentMovie.id * 100;
        
        for (let r = 0; r < rows; r++) {
            const rowDiv = document.createElement('div');
            rowDiv.classList.add('seat-row');
            
            const letterDiv = document.createElement('div');
            letterDiv.classList.add('row-letter');
            letterDiv.innerText = rowLetters[r];
            rowDiv.appendChild(letterDiv);
            
            for (let s = 1; s <= seatsPerRow; s++) {
                const seat = document.createElement('div');
                seat.classList.add('seat');
                if (s === 4) seat.style.marginRight = '2rem'; 
                
                const label = `${rowLetters[r]}${s}`;
                seat.dataset.label = label;
                seat.innerText = label;
                
                // Deterministic random
                if (seededRandom(seed++) < 0.25) {
                    seat.classList.add('booked');
                }
                
                rowDiv.appendChild(seat);
            }
            theaterGrid.appendChild(rowDiv);
        }
        
        restoreSelections();
        updateCount();
    }

    function restoreSelections() {
        if(!currentMovie) return;
        const saved = JSON.parse(localStorage.getItem(`seats_movie_${currentMovie.id}`));
        if(saved && saved.length > 0) {
            const allSeats = document.querySelectorAll('.row-labels .seat');
            saved.forEach(idx => {
                if(allSeats[idx] && !allSeats[idx].classList.contains('booked')) {
                    allSeats[idx].classList.add('selected');
                }
            });
        }
    }

    function updateCount() {
        const selected = document.querySelectorAll('.row-labels .seat.selected');
        const c = selected.length;
        countEl.innerText = c;
        totalEl.innerText = c * (currentMovie ? currentMovie.price : 0);
        
        confirmBtn.disabled = c === 0;
        
        if(currentMovie) {
            const allSeats = [...document.querySelectorAll('.row-labels .seat')];
            const idxs = [...selected].map(s => allSeats.indexOf(s));
            localStorage.setItem(`seats_movie_${currentMovie.id}`, JSON.stringify(idxs));
        }
    }

    // Bind UI Events
    backBtn.addEventListener('click', closeMovie);
    navLogo.addEventListener('click', () => { if(currentMovie) closeMovie(); });

    theaterGrid.addEventListener('click', e => {
        if (e.target.classList.contains('seat') && !e.target.classList.contains('booked')) {
            e.target.classList.toggle('selected');
            updateCount();
        }
    });

    confirmBtn.addEventListener('click', () => {
        const selected = document.querySelectorAll('.row-labels .seat.selected');
        const labels = [...selected].map(s => s.dataset.label).join(', ');
        
        document.getElementById('modal-movie').innerText = currentMovie.title;
        document.getElementById('modal-seats').innerText = labels;
        document.getElementById('modal-total').innerText = totalEl.innerText;
        
        modal.classList.add('show');
    });

    closeBtn.addEventListener('click', () => {
        modal.classList.remove('show');
        const selected = document.querySelectorAll('.row-labels .seat.selected');
        selected.forEach(s => {
            s.classList.remove('selected');
            s.classList.add('booked');
        });
        updateCount();
    });

    // Fire it up
    renderMovies();
});
