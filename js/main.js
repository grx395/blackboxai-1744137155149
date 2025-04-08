document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const searchInput = document.getElementById('searchInput');
    const sortFilter = document.getElementById('sortFilter');
    const tagSearchBtn = document.getElementById('tagSearchBtn');
    const viewToggle = document.getElementById('viewToggle');
    const songsList = document.getElementById('songsList');
    const adminBtn = document.getElementById('adminBtn');
    const adminModal = document.getElementById('adminModal');
    const adminLoginForm = document.getElementById('adminLoginForm');
    const closeAdminModal = document.getElementById('closeAdminModal');

    let isGridView = localStorage.getItem('viewMode') === 'grid';
    let currentTags = [];

    // Initialize view
    updateViewMode();
    renderSongs();

    // Search and filter handlers
    searchInput.addEventListener('input', renderSongs);
    sortFilter.addEventListener('change', renderSongs);

    // View toggle
    viewToggle.addEventListener('click', () => {
        isGridView = !isGridView;
        localStorage.setItem('viewMode', isGridView ? 'grid' : 'list');
        updateViewMode();
        renderSongs();
    });

    // Admin login
    adminBtn.addEventListener('click', () => {
        console.log('Admin button clicked');
        if (adminModal) {
            adminModal.classList.remove('hidden');
            requestAnimationFrame(() => {
                const modalContent = adminModal.querySelector('.bg-white');
                modalContent.classList.remove('translate-y-4', 'opacity-0');
            });
        } else {
            console.error('Admin modal not found');
        }
    });

    const closeModal = () => {
        const modalContent = adminModal.querySelector('.bg-white');
        modalContent.classList.add('translate-y-4', 'opacity-0');
        setTimeout(() => {
            adminModal.classList.add('hidden');
        }, 300);
    };

    closeAdminModal.addEventListener('click', closeModal);

    // Close modal when clicking outside
    adminModal.addEventListener('click', (e) => {
        if (e.target === adminModal) {
            closeModal();
        }
    });

    adminLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('adminEmail').value;
        const password = document.getElementById('adminPassword').value;

        if (email === 'maxyrocs01@gmail.com' && password === 'maxyrocs01@gmail.com') {
            localStorage.setItem('adminAuth', 'true');
            window.location.href = 'admin.html';
        } else {
            alert('Invalid credentials');
        }
    });

    // Tag search
    tagSearchBtn.addEventListener('click', () => {
        const allTags = storage.getAllTags();
        if (allTags.length === 0) {
            alert('No tags available');
            return;
        }

        const tagList = document.createElement('div');
        tagList.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        tagList.innerHTML = `
            <div class="modal-content rounded-2xl p-6 w-11/12 max-w-md transition-all duration-300">
                <div class="flex justify-between items-center mb-6">
                    <div>
                        <h3 class="text-xl font-semibold theme-text">Select Tags</h3>
                        <p class="theme-text opacity-60 text-sm">Filter songs by tags</p>
                    </div>
                    <button class="p-2 rounded-full transition-all duration-300" id="closeTagModal" data-accent>
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="flex flex-wrap gap-2 mb-6">
                    ${allTags.map(tag => `
                        <button class="tag-btn px-3 py-1 rounded-full transition-all duration-300 ${
                            currentTags.includes(tag) ? 'theme-button' : 'bg-black/5 theme-text'
                        }" data-tag="${tag}">
                            ${tag}
                        </button>
                    `).join('')}
                </div>
                <button class="w-full theme-button py-2 px-4 rounded-md transition-all duration-300" id="applyTags">
                    Apply Filters
                </button>
            </div>
        `;

        document.body.appendChild(tagList);

        // Tag selection
        const tagButtons = tagList.querySelectorAll('.tag-btn');
        tagButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const tag = btn.dataset.tag;
                if (currentTags.includes(tag)) {
                    currentTags = currentTags.filter(t => t !== tag);
                    btn.classList.remove('bg-teal-500', 'text-white');
                } else {
                    currentTags.push(tag);
                    btn.classList.add('bg-teal-500', 'text-white');
                }
            });
        });

        // Close modal
        document.getElementById('closeTagModal').addEventListener('click', () => {
            tagList.remove();
        });

        // Apply filters
        document.getElementById('applyTags').addEventListener('click', () => {
            tagList.remove();
            renderSongs();
        });
    });

    function updateViewMode() {
        viewToggle.innerHTML = isGridView ? 
            '<i class="fas fa-list"></i>' : 
            '<i class="fas fa-th-large"></i>';
        
        songsList.className = isGridView ?
            'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' :
            'space-y-4';
    }

    function renderSongs() {
        const query = searchInput.value;
        const sortBy = sortFilter.value;
        const songs = storage.searchSongs(query, sortBy, currentTags);

        songsList.innerHTML = '';

        if (songs.length === 0) {
            songsList.innerHTML = `
                <div class="col-span-full text-center py-8">
                    <i class="fas fa-music text-4xl text-gray-400 mb-2"></i>
                    <p class="text-gray-500">No songs found</p>
                </div>
            `;
            return;
        }

        songs.forEach(song => {
            const songElement = document.createElement('div');
            songElement.className = isGridView ?
                'song-card rounded-xl p-4 cursor-pointer transform hover:-translate-y-1 transition-all duration-300 flex flex-col' :
                'song-card rounded-xl p-4 cursor-pointer transition-all duration-300 flex gap-4 items-center';

            const hasAudio = storage.getAudioData(song.id) !== null;
            
                songElement.innerHTML = `
                <div class="${isGridView ? '' : 'flex-1'}">
                    <h3 class="font-semibold text-lg mb-1 theme-text">${song.name}</h3>
                    <p class="theme-text opacity-60 text-sm mb-2">${song.composer}</p>
                    <div class="flex flex-wrap gap-1 mb-2">
                        ${song.tags.map(tag => `
                            <span class="text-xs px-2 py-1 bg-black/5 backdrop-blur-sm rounded-full theme-text">${tag}</span>
                        `).join('')}
                    </div>
                    <div class="flex items-center gap-2 text-sm theme-text opacity-60">
                        <i class="far fa-calendar"></i>
                        <span>${new Date(song.date).toLocaleDateString()}</span>
                        ${hasAudio ? '<i class="fas fa-music ml-2" data-accent></i>' : ''}
                    </div>
                </div>
            `;

            songElement.addEventListener('click', () => showSongDetails(song));
            songsList.appendChild(songElement);
        });
    }

    function showSongDetails(song) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        
        const audioData = storage.getAudioData(song.id);
        
        modal.innerHTML = `
            <div class="modal-content rounded-2xl p-6 w-11/12 max-w-2xl max-h-[90vh] overflow-y-auto transition-all duration-300">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-semibold theme-text">${song.name}</h2>
                    <button class="p-2 rounded-full transition-all duration-300" id="closeSongModal" data-accent>
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="space-y-6">
                    <div>
                        <h3 class="text-sm font-medium theme-text opacity-60">Composer</h3>
                        <p class="text-lg theme-text mt-1">${song.composer}</p>
                    </div>
                    <div class="bg-black/5 backdrop-blur-sm rounded-xl p-4">
                        <div class="flex items-center justify-between mb-2">
                            <h3 class="text-sm font-medium theme-text opacity-60">Audio Player</h3>
                            <i class="fas fa-music" data-accent></i>
                        </div>
                        ${audioData ? `
                            <audio controls class="w-full">
                                <source src="${audioData}" type="audio/mpeg">
                                Your browser does not support the audio element.
                            </audio>
                        ` : `
                            <div class="text-center py-4">
                                <i class="fas fa-volume-mute text-2xl mb-2 theme-text opacity-60"></i>
                                <p class="text-sm theme-text opacity-60">No audio available for this song</p>
                            </div>
                        `}
                    </div>
                    <div>
                        <h3 class="text-sm font-medium theme-text opacity-60 mb-2">Lyrics</h3>
                        <pre class="whitespace-pre-wrap font-poppins theme-text p-4 bg-black/5 rounded-xl backdrop-blur-sm">${song.lyrics}</pre>
                    </div>
                    <div>
                        <h3 class="text-sm font-medium theme-text opacity-60 mb-2">Tags</h3>
                        <div class="flex flex-wrap gap-2">
                            ${song.tags.map(tag => `
                                <span class="px-3 py-1 rounded-full text-sm theme-text bg-black/5 backdrop-blur-sm">${tag}</span>
                            `).join('')}
                        </div>
                    </div>
                    <div class="theme-text opacity-60 text-sm">
                        Added on ${new Date(song.date).toLocaleDateString()}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close modal
        document.getElementById('closeSongModal').addEventListener('click', () => {
            modal.remove();
        });

        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
});
