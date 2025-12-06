const API_KEY = '5099f373';

document.addEventListener('DOMContentLoaded', () => {
	const exploreBtn = document.querySelector('.hero-cta');
	const resultsEl = document.getElementById('results');
	const loadingEl = document.getElementById('loading');
	const searchForm = document.getElementById('search-form');
	const searchInput = document.getElementById('search-input');
	const prevBtn = document.getElementById('prev-page');
	const nextBtn = document.getElementById('next-page');
	const pageInfo = document.getElementById('page-info');

	let currentQuery = 'Avengers';
	let currentPage = 1;
	let totalResults = 0;
	let totalPages = 1;
	let lastResults = [];
	const sortSelect = document.getElementById('sort-year');

	async function fetchMovies(query = currentQuery, page = 1) {
		currentQuery = query;
		currentPage = page;
		loadingEl.style.display = 'block';
		resultsEl.innerHTML = '';
		updatePagination();
		try {
			const res = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&s=${encodeURIComponent(query)}&type=movie&page=${page}`);
			const data = await res.json();
			if (data && data.Response === 'True' && Array.isArray(data.Search)) {
				totalResults = parseInt(data.totalResults || '0', 10) || 0;
				totalPages = Math.max(1, Math.ceil(totalResults / 10));
				lastResults = Array.isArray(data.Search) ? data.Search.slice() : [];
				applySortAndRender();
			} else {
				resultsEl.innerHTML = `<p>No results found for "${escapeHtml(query)}".</p>`;
				totalResults = 0;
				totalPages = 1;
			}
		} catch (err) {
			console.error(err);
			resultsEl.innerHTML = `<p>Failed to load results.</p>`;
		} finally {
			loadingEl.style.display = 'none';
			updatePagination();
		}
	}

	function renderResults(items) {
		const frag = document.createDocumentFragment();
		items.forEach(item => {
			const card = document.createElement('article');
			card.className = 'movie-card';

			card.tabIndex = 0;
			card.setAttribute('role', 'button');

			const img = document.createElement('img');
			img.alt = item.Title;
			img.src = item.Poster !== 'N/A' ? item.Poster : 'https://via.placeholder.com/300x450?text=No+Image';

			const meta = document.createElement('div');
			meta.className = 'meta';

			const title = document.createElement('div');
			title.className = 'title';
			title.textContent = item.Title;

			const year = document.createElement('div');
			year.className = 'year';
			year.textContent = item.Year;

			meta.appendChild(title);
			meta.appendChild(year);

			card.appendChild(img);
			card.appendChild(meta);

			
			card.addEventListener('click', () => {
				card.classList.add('pressed');
				setTimeout(() => card.classList.remove('pressed'), 260);
			});
			card.addEventListener('keydown', (ev) => {
				if (ev.key === 'Enter' || ev.key === ' ') {
					ev.preventDefault();
					card.classList.add('pressed');
					setTimeout(() => card.classList.remove('pressed'), 260);
				}
			});

			frag.appendChild(card);
		});
		resultsEl.appendChild(frag);
	}

	function parseYear(item) {
		if (!item || !item.Year) return 0;
		const m = String(item.Year).match(/(\d{4})/);
		return m ? parseInt(m[1], 10) : 0;
	}

	function applySortAndRender() {
		resultsEl.innerHTML = '';
		let toRender = lastResults.slice();
		if (sortSelect) {
			const val = sortSelect.value;
			if (val === 'newest') {
				toRender.sort((a,b) => parseYear(b) - parseYear(a));
			} else if (val === 'oldest') {
				toRender.sort((a,b) => parseYear(a) - parseYear(b));
			}
		}
		renderResults(toRender);
	}

	function updatePagination() {
		pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
		prevBtn.disabled = currentPage <= 1;
		nextBtn.disabled = currentPage >= totalPages;
	}

	function escapeHtml(str) {
		return String(str).replace(/[&<>"']/g, function (s) {
			return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[s];
		});
	}

	exploreBtn.addEventListener('click', (e) => {
		e.preventDefault();
		const target = document.getElementById('explore');
		if (target) target.scrollIntoView({ behavior: 'smooth' });
		
		if (!resultsEl.hasChildNodes()) {
			fetchMovies(currentQuery, 1);
		}
	});

	
	searchForm.addEventListener('submit', (e) => {
		e.preventDefault();
		const q = (searchInput.value || '').trim();
		if (!q) return;
		currentQuery = q;
		fetchMovies(currentQuery, 1);
		
		const target = document.getElementById('explore');
		if (target) target.scrollIntoView({ behavior: 'smooth' });
	});


	prevBtn.addEventListener('click', () => {
		if (currentPage > 1) fetchMovies(currentQuery, currentPage - 1);
	});

	nextBtn.addEventListener('click', () => {
		if (currentPage < totalPages) fetchMovies(currentQuery, currentPage + 1);
	});

	
	searchInput.addEventListener('keydown', (e) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			searchForm.requestSubmit();
		}
	});

	// handle sort select changes (re-render current page results)
	if (sortSelect) {
		sortSelect.addEventListener('change', () => {
			applySortAndRender();
		});
	}



	const backToTopBtn = document.querySelector('.back-to-top');
	if (backToTopBtn) {
		backToTopBtn.addEventListener('click', () => {
			window.scrollTo({ top: 0, behavior: 'smooth' });
		});
	}
});

