// Global state
let coursesData = [];
let activeCourses = JSON.parse(localStorage.getItem('activeCourses')) || [];
let completedCourses = JSON.parse(localStorage.getItem('completedCourses')) || [];

// Load courses data
async function loadCoursesData() {
    try {
        const response = await fetch('data/courses.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        coursesData = (await response.json()).courses;
        return coursesData;
    } catch (error) {
        console.error('Error loading courses:', error);
        return [];
    }
}

// Calculate current term and weeks remaining
function calculateTermInfo() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // 1-12
    
    let quarter, quarterEnd;
    
    if (month >= 1 && month <= 3) {
        quarter = 'Q1';
        quarterEnd = new Date(year, 3, 0); // Last day of March
    } else if (month >= 4 && month <= 6) {
        quarter = 'Q2';
        quarterEnd = new Date(year, 6, 0); // Last day of June
    } else if (month >= 7 && month <= 9) {
        quarter = 'Q3';
        quarterEnd = new Date(year, 9, 0); // Last day of September
    } else {
        quarter = 'Q4';
        quarterEnd = new Date(year, 12, 0); // Last day of December
    }
    
    const weeksRemaining = Math.ceil((quarterEnd - now) / (1000 * 60 * 60 * 24 * 7));
    
    return {
        term: `${quarter} ${year}`,
        weeksRemaining: Math.max(0, weeksRemaining)
    };
}

// Update home page term information
function updateTermDisplay() {
    const termInfo = calculateTermInfo();
    const currentTermEl = document.getElementById('current-term');
    const weeksRemainingEl = document.getElementById('weeks-remaining');
    const completedModulesEl = document.getElementById('completed-modules');
    const progressFillEl = document.getElementById('progress-fill');
    
    if (currentTermEl) currentTermEl.textContent = termInfo.term;
    if (weeksRemainingEl) weeksRemainingEl.textContent = `${termInfo.weeksRemaining} weeks`;
    
    if (completedModulesEl) {
        const totalCourses = coursesData.length || 19;
        const completedCount = completedCourses.length;
        completedModulesEl.textContent = completedCount;
        
        if (progressFillEl) {
            const percentage = (completedCount / totalCourses) * 100;
            progressFillEl.style.width = `${percentage}%`;
        }
    }
}

// Display courses on courses page
function displayCourses(filter = 'all', searchTerm = '') {
    const container = document.getElementById('courses-container');
    if (!container) return;
    
    let filteredCourses = coursesData;
    
    // Filter by category
    if (filter !== 'all') {
        filteredCourses = filteredCourses.filter(course => course.category === filter);
    }
    
    // Filter by search term
    if (searchTerm) {
        const search = searchTerm.toLowerCase();
        filteredCourses = filteredCourses.filter(course =>
            course.title.toLowerCase().includes(search) ||
            course.category.toLowerCase().includes(search) ||
            course.description.toLowerCase().includes(search)
        );
    }
    
    container.innerHTML = '';
    
    if (filteredCourses.length === 0) {
        container.innerHTML = '<div class="empty-state"><h3>No courses found</h3></div>';
        return;
    }
    
    filteredCourses.forEach(course => {
        const isCompleted = completedCourses.includes(course.id);
        const courseCard = document.createElement('div');
        courseCard.className = 'course-card';
        if (isCompleted) courseCard.classList.add('completed');
        
        courseCard.innerHTML = `
            <div class="course-card-header">
                <span class="course-category-badge">${course.category}</span>
                ${isCompleted ? '<span class="completed-badge">✓ Completed</span>' : ''}
            </div>
            <h3 class="course-card-title">${course.title}</h3>
            <p class="course-card-description">${course.description}</p>
            <div class="course-card-actions">
                <a href="course-detail.html?id=${course.id}" class="btn btn-primary">View Details</a>
            </div>
        `;
        
        container.appendChild(courseCard);
    });
}

// Display active courses
function displayActiveCourses() {
    const container = document.getElementById('active-courses-list');
    if (!container) return;
    
    if (activeCourses.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📚</div>
                <h3>No Active Courses</h3>
                <p>Visit the <a href="courses.html">Course List</a> to add courses to your active path.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    activeCourses.forEach(courseId => {
        const course = coursesData.find(c => c.id === courseId);
        if (!course) return;
        
        const isCompleted = completedCourses.includes(course.id);
        const courseCard = document.createElement('div');
        courseCard.className = 'active-course-card';
        if (isCompleted) courseCard.classList.add('completed');
        
        courseCard.innerHTML = `
            <div class="active-course-header">
                <h3>${course.title}</h3>
                <span class="course-category-badge">${course.category}</span>
            </div>
            <p class="active-course-description">${course.description}</p>
            <div class="active-course-actions">
                <a href="course-detail.html?id=${course.id}" class="btn btn-primary">Continue</a>
                <button class="btn btn-secondary remove-course" data-id="${course.id}">Remove</button>
            </div>
            <div class="course-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${isCompleted ? '100' : '0'}%"></div>
                </div>
            </div>
        `;
        
        container.appendChild(courseCard);
    });
    
    // Add event listeners for remove buttons
    document.querySelectorAll('.remove-course').forEach(btn => {
        btn.addEventListener('click', function() {
            const courseId = this.getAttribute('data-id');
            activeCourses = activeCourses.filter(id => id !== courseId);
            localStorage.setItem('activeCourses', JSON.stringify(activeCourses));
            displayActiveCourses();
        });
    });
}

// Load course detail page
function loadCourseDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get('id');
    
    if (!courseId) return;
    
    const course = coursesData.find(c => c.id === courseId);
    if (!course) return;
    
    const titleEl = document.getElementById('course-title');
    const categoryEl = document.getElementById('course-category');
    const descriptionEl = document.getElementById('course-description');
    const addToActiveBtn = document.getElementById('add-to-active');
    const markCompleteBtn = document.getElementById('mark-complete');
    
    if (titleEl) titleEl.textContent = course.title;
    if (categoryEl) categoryEl.textContent = course.category;
    if (descriptionEl) descriptionEl.textContent = course.description;
    
    const isActive = activeCourses.includes(courseId);
    const isCompleted = completedCourses.includes(courseId);
    
    if (addToActiveBtn) {
        if (isActive) {
            addToActiveBtn.textContent = 'Remove from Active Courses';
            addToActiveBtn.classList.remove('btn-primary');
            addToActiveBtn.classList.add('btn-secondary');
        }
        
        addToActiveBtn.addEventListener('click', function() {
            if (activeCourses.includes(courseId)) {
                activeCourses = activeCourses.filter(id => id !== courseId);
                this.textContent = 'Add to Active Courses';
                this.classList.add('btn-primary');
                this.classList.remove('btn-secondary');
            } else {
                activeCourses.push(courseId);
                this.textContent = 'Remove from Active Courses';
                this.classList.remove('btn-primary');
                this.classList.add('btn-secondary');
            }
            localStorage.setItem('activeCourses', JSON.stringify(activeCourses));
        });
    }
    
    if (markCompleteBtn) {
        if (isCompleted) {
            markCompleteBtn.textContent = 'Mark as Incomplete';
        }
        
        markCompleteBtn.addEventListener('click', function() {
            if (completedCourses.includes(courseId)) {
                completedCourses = completedCourses.filter(id => id !== courseId);
                this.textContent = 'Mark as Complete';
            } else {
                completedCourses.push(courseId);
                this.textContent = 'Mark as Incomplete';
            }
            localStorage.setItem('completedCourses', JSON.stringify(completedCourses));
            updateTermDisplay();
        });
    }
}

// Settings page functionality
function initializeSettings() {
    const themeSelect = document.getElementById('theme-select');
    const currentYearInput = document.getElementById('current-year');
    const resetProgressBtn = document.getElementById('reset-progress');
    const exportDataBtn = document.getElementById('export-data');
    const saveSettingsBtn = document.getElementById('save-settings');
    
    // Load saved settings
    const savedTheme = localStorage.getItem('portalTheme') || 'light';
    const savedYear = localStorage.getItem('academicYear') || new Date().getFullYear();
    
    if (themeSelect) {
        themeSelect.value = savedTheme;
        document.body.className = '';
        document.body.classList.add(`theme-${savedTheme}`);
        
        themeSelect.addEventListener('change', function() {
            document.body.className = '';
            document.body.classList.add(`theme-${this.value}`);
        });
    }
    
    if (currentYearInput) {
        currentYearInput.value = savedYear;
    }
    
    if (resetProgressBtn) {
        resetProgressBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
                localStorage.removeItem('activeCourses');
                localStorage.removeItem('completedCourses');
                activeCourses = [];
                completedCourses = [];
                alert('All progress has been reset.');
            }
        });
    }
    
    if (exportDataBtn) {
        exportDataBtn.addEventListener('click', function() {
            const data = {
                activeCourses,
                completedCourses,
                exportDate: new Date().toISOString()
            };
            
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `learning-portal-data-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
        });
    }
    
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', function() {
            if (themeSelect) localStorage.setItem('portalTheme', themeSelect.value);
            if (currentYearInput) localStorage.setItem('academicYear', currentYearInput.value);
            alert('Settings saved successfully!');
        });
    }
}

// Anki flashcard functionality
let ankiData = {};

// Load Anki data
async function loadAnkiData() {
    try {
        const response = await fetch('data/anki-data.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        ankiData = await response.json();
        return ankiData;
    } catch (error) {
        console.error('Error loading Anki data:', error);
        return {};
    }
}

// Load Anki main page
async function loadAnkiPage() {
    await loadAnkiData();
    
    // Update card counts for each deck
    const courses = ['latin-101', 'latin-102', 'latin-103', 'latin-104', 
                     'latin-105', 'latin-106', 'latin-201', 'latin-202', 
                     'latin-203', 'latin-204'];
    
    courses.forEach(courseId => {
        const countEl = document.getElementById(`deck-${courseId}-count`);
        if (countEl && ankiData[courseId]) {
            const cardCount = ankiData[courseId].cards.length;
            countEl.textContent = `${cardCount} cards`;
        }
    });
}

// Load and manage Anki deck study page
let currentDeck = [];
let currentCardIndex = 0;
let isFlipped = false;

async function loadAnkiDeck() {
    await loadAnkiData();
    
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get('course');
    
    if (!courseId || !ankiData[courseId]) {
        console.error('Invalid course ID');
        return;
    }
    
    const deckData = ankiData[courseId];
    currentDeck = [...deckData.cards]; // Copy array
    currentCardIndex = 0;
    
    // Update deck header
    const deckTitle = document.getElementById('deck-title');
    const deckCategory = document.getElementById('deck-category');
    const totalCards = document.getElementById('total-cards');
    
    if (deckTitle) deckTitle.textContent = deckData.title;
    if (deckCategory) deckCategory.textContent = deckData.level;
    if (totalCards) totalCards.textContent = currentDeck.length;
    
    // Display first card
    displayCard();
    
    // Add event listeners
    const flashcard = document.getElementById('flashcard');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const shuffleBtn = document.getElementById('shuffle-btn');
    
    if (flashcard) {
        flashcard.addEventListener('click', flipCard);
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', previousCard);
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', nextCard);
    }
    
    if (shuffleBtn) {
        shuffleBtn.addEventListener('click', shuffleDeck);
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', handleKeyPress);
}

function displayCard() {
    if (!currentDeck || currentDeck.length === 0) return;
    
    const card = currentDeck[currentCardIndex];
    const questionEl = document.getElementById('card-question');
    const answerEl = document.getElementById('card-answer');
    const progressEl = document.getElementById('card-progress');
    const categoryEl = document.getElementById('current-category');
    const flashcard = document.getElementById('flashcard');
    
    if (questionEl) questionEl.textContent = card.question;
    if (answerEl) answerEl.textContent = card.answer;
    if (progressEl) progressEl.textContent = `Card ${currentCardIndex + 1} of ${currentDeck.length}`;
    if (categoryEl) categoryEl.textContent = card.category;
    
    // Reset flip state
    if (flashcard) {
        flashcard.classList.remove('flipped');
    }
    isFlipped = false;
}

function flipCard() {
    const flashcard = document.getElementById('flashcard');
    if (flashcard) {
        flashcard.classList.toggle('flipped');
        isFlipped = !isFlipped;
    }
}

function nextCard() {
    if (currentCardIndex < currentDeck.length - 1) {
        currentCardIndex++;
        displayCard();
    }
}

function previousCard() {
    if (currentCardIndex > 0) {
        currentCardIndex--;
        displayCard();
    }
}

function shuffleDeck() {
    // Fisher-Yates shuffle
    for (let i = currentDeck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [currentDeck[i], currentDeck[j]] = [currentDeck[j], currentDeck[i]];
    }
    currentCardIndex = 0;
    displayCard();
}

function handleKeyPress(e) {
    const currentPage = window.location.pathname.split('/').pop();
    if (currentPage !== 'anki-deck.html') return;
    
    if (e.key === 'ArrowRight') {
        nextCard();
    } else if (e.key === 'ArrowLeft') {
        previousCard();
    } else if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault(); // Prevent page scroll
        flipCard();
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async function() {
    // Load courses data first
    await loadCoursesData();
    
    // Apply saved theme
    const savedTheme = localStorage.getItem('portalTheme') || 'light';
    document.body.className = '';
    document.body.classList.add(`theme-${savedTheme}`);
    
    // Page-specific initialization
    const currentPage = window.location.pathname.split('/').pop();
    
    if (currentPage === 'index.html' || currentPage === '') {
        updateTermDisplay();
    } else if (currentPage === 'courses.html') {
        displayCourses();
        
        // Search functionality
        const searchInput = document.getElementById('course-search');
        const searchBtn = document.getElementById('search-btn');
        
        if (searchBtn) {
            searchBtn.addEventListener('click', function() {
                const searchTerm = searchInput.value;
                const activeFilterBtn = document.querySelector('.filter-btn.active');
                const activeFilter = activeFilterBtn ? activeFilterBtn.getAttribute('data-category') : 'all';
                displayCourses(activeFilter, searchTerm);
            });
        }
        
        if (searchInput) {
            searchInput.addEventListener('keyup', function(e) {
                if (e.key === 'Enter') {
                    const activeFilterBtn = document.querySelector('.filter-btn.active');
                    const activeFilter = activeFilterBtn ? activeFilterBtn.getAttribute('data-category') : 'all';
                    displayCourses(activeFilter, this.value);
                }
            });
        }
        
        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                const filter = this.getAttribute('data-category');
                const searchTerm = searchInput ? searchInput.value : '';
                displayCourses(filter, searchTerm);
            });
        });
    } else if (currentPage === 'active-courses.html') {
        displayActiveCourses();
    } else if (currentPage === 'course-detail.html') {
        loadCourseDetail();
    } else if (currentPage === 'settings.html') {
        initializeSettings();
    } else if (currentPage === 'anki.html') {
        loadAnkiPage();
    } else if (currentPage === 'anki-deck.html') {
        loadAnkiDeck();
    }
});
