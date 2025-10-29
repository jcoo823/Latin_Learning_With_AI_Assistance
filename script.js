// Global state
let coursesData = [];
let worksData = [];
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
    
    // Filter by level (100 or 200)
    if (filter === '100') {
        filteredCourses = filteredCourses.filter(course => course.id.includes('-10'));
    } else if (filter === '200') {
        filteredCourses = filteredCourses.filter(course => course.id.includes('-20'));
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
        
        const levelBadge = course.level ? `<span class="level-badge">${course.level}</span>` : '';
        
        courseCard.innerHTML = `
            <div class="course-card-header">
                <span class="course-category-badge">${course.category}</span>
                ${levelBadge}
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
    
    // Populate basic info
    const titleEl = document.getElementById('course-title');
    const categoryEl = document.getElementById('course-category');
    const descriptionEl = document.getElementById('course-description');
    
    if (titleEl) titleEl.textContent = course.title;
    if (categoryEl) categoryEl.textContent = course.category;
    if (descriptionEl) descriptionEl.textContent = course.description;
    
    // Populate course overview metadata
    const levelEl = document.getElementById('course-level');
    const durationEl = document.getElementById('course-duration');
    const creditsEl = document.getElementById('course-credits');
    const prerequisitesEl = document.getElementById('course-prerequisites');
    
    if (levelEl) levelEl.textContent = course.level || '-';
    if (durationEl) durationEl.textContent = course.duration || '-';
    if (creditsEl) creditsEl.textContent = course.credits || '-';
    if (prerequisitesEl) prerequisitesEl.textContent = course.prerequisites || '-';
    
    // Populate learning objectives
    const objectivesEl = document.getElementById('learning-objectives');
    if (objectivesEl && course.objectives) {
        objectivesEl.innerHTML = '';
        course.objectives.forEach(objective => {
            const li = document.createElement('li');
            li.textContent = objective;
            objectivesEl.appendChild(li);
        });
    }
    
    // Populate required materials
    const materialsEl = document.getElementById('course-materials');
    if (materialsEl && course.materials) {
        materialsEl.innerHTML = '';
        course.materials.forEach(material => {
            const li = document.createElement('li');
            li.textContent = material; // Use textContent to prevent XSS
            materialsEl.appendChild(li);
        });
    }
    
    // Populate vocabulary goals
    const vocabEl = document.getElementById('vocabulary-goals');
    if (vocabEl && course.vocabularyGoals) {
        // Safely handle line breaks without innerHTML
        vocabEl.textContent = '';
        const lines = course.vocabularyGoals.split('\n');
        lines.forEach((line, index) => {
            vocabEl.appendChild(document.createTextNode(line));
            if (index < lines.length - 1) {
                vocabEl.appendChild(document.createElement('br'));
            }
        });
    }
    
    // Populate modules list
    const modulesListEl = document.getElementById('modules-list');
    if (modulesListEl && course.units) {
        modulesListEl.innerHTML = '';
        course.units.forEach((unit, index) => {
            const moduleItem = document.createElement('div');
            moduleItem.className = 'module-item';
            
            const moduleHeader = document.createElement('div');
            moduleHeader.className = 'module-header';
            
            const moduleTitle = document.createElement('h4');
            moduleTitle.textContent = unit.title;
            moduleHeader.appendChild(moduleTitle);
            
            moduleItem.appendChild(moduleHeader);
            
            if (unit.topics && unit.topics.length > 0) {
                const topicsList = document.createElement('ul');
                topicsList.className = 'topics-list';
                unit.topics.forEach(topic => {
                    const topicItem = document.createElement('li');
                    topicItem.textContent = topic;
                    topicsList.appendChild(topicItem);
                });
                moduleItem.appendChild(topicsList);
            }
            
            modulesListEl.appendChild(moduleItem);
        });
    }
    
    // Handle button states
    const isActive = activeCourses.includes(courseId);
    const isCompleted = completedCourses.includes(courseId);
    
    const addToActiveBtn = document.getElementById('add-to-active');
    const markCompleteBtn = document.getElementById('mark-complete');
    const viewCourseworkBtn = document.getElementById('view-coursework');
    
    // Show "View Coursework" button for courses with available coursework
    const coursesWithCoursework = ['latin-101'];
    if (viewCourseworkBtn && coursesWithCoursework.includes(courseId)) {
        viewCourseworkBtn.style.display = 'inline-block';
        viewCourseworkBtn.href = `coursework-viewer.html?course=${courseId}`;
    }
    
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
    } else if (currentPage === 'works.html') {
        initializeWorksPage();
    }
});

// Load works data
async function loadWorksData() {
    try {
        const response = await fetch('data/works.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        worksData = (await response.json()).works;
        return worksData;
    } catch (error) {
        console.error('Error loading works:', error);
        return [];
    }
}

// Initialize works page
async function initializeWorksPage() {
    await loadWorksData();
    displayWorks();
    
    // Search functionality
    const searchInput = document.getElementById('works-search');
    const searchBtn = document.getElementById('works-search-btn');
    
    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            displayWorks();
        });
    }
    
    if (searchInput) {
        searchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                displayWorks();
            }
        });
    }
    
    // Filter buttons
    document.querySelectorAll('.works-filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const filterType = this.getAttribute('data-filter');
            
            // Remove active class from buttons of the same filter type
            document.querySelectorAll(`.works-filter-btn[data-filter="${filterType}"]`).forEach(b => {
                b.classList.remove('active');
            });
            
            this.classList.add('active');
            displayWorks();
        });
    });
}

// Display works with filtering
function displayWorks() {
    const container = document.getElementById('works-container');
    if (!container) return;
    
    const searchInput = document.getElementById('works-search');
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    
    // Get active filters
    const activeCategoryBtn = document.querySelector('.works-filter-btn[data-filter="category"].active');
    const activeDifficultyBtn = document.querySelector('.works-filter-btn[data-filter="difficulty"].active');
    
    const categoryFilter = activeCategoryBtn ? activeCategoryBtn.getAttribute('data-value') : 'all';
    const difficultyFilter = activeDifficultyBtn ? activeDifficultyBtn.getAttribute('data-value') : 'all';
    
    let filteredWorks = worksData;
    
    // Apply category filter
    if (categoryFilter !== 'all') {
        filteredWorks = filteredWorks.filter(work => work.category === categoryFilter);
    }
    
    // Apply difficulty filter
    if (difficultyFilter !== 'all') {
        filteredWorks = filteredWorks.filter(work => work.difficulty === difficultyFilter);
    }
    
    // Apply search filter
    if (searchTerm) {
        filteredWorks = filteredWorks.filter(work =>
            work.title.toLowerCase().includes(searchTerm) ||
            work.author.toLowerCase().includes(searchTerm) ||
            work.description.toLowerCase().includes(searchTerm) ||
            work.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
            work.category.toLowerCase().includes(searchTerm)
        );
    }
    
    container.innerHTML = '';
    
    if (filteredWorks.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <div class="empty-icon">📚</div>
                <h3>No works found</h3>
                <p>Try adjusting your filters or search terms.</p>
            </div>
        `;
        return;
    }
    
    filteredWorks.forEach(work => {
        const workCard = document.createElement('div');
        workCard.className = 'work-card';
        
        const difficultyClass = work.difficulty.toLowerCase();
        
        workCard.innerHTML = `
            <div class="work-card-header">
                <div class="work-meta">
                    <span class="work-author">${work.author}</span>
                    <span class="work-period">${work.period}</span>
                </div>
                <h3 class="work-title">${work.title}</h3>
            </div>
            <div class="work-card-body">
                <p class="work-description">${work.description}</p>
                <div class="work-excerpt">${work.excerpt}</div>
                <div class="work-tags">
                    ${work.tags.slice(0, 4).map(tag => `<span class="work-tag">#${tag}</span>`).join('')}
                </div>
            </div>
            <div class="work-card-footer">
                <div class="work-badges">
                    <span class="work-category-badge">${work.category}</span>
                    <span class="work-difficulty-badge ${difficultyClass}">${work.difficulty}</span>
                </div>
                <span class="work-length">${work.length}</span>
            </div>
        `;
        
        container.appendChild(workCard);
    });
}

