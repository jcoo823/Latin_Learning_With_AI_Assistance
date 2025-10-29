// Coursework Viewer - Documentation-style display for course materials

// Course materials structure mapping
const courseStructures = {
    'latin-101': {
        title: 'Latin 101 – Beginner Grammar & Vocabulary',
        baseUrl: 'coursework/latin-101/',
        sections: [
            {
                title: 'Course Overview',
                items: [
                    { title: 'Course Index', file: 'COURSE-INDEX.md', icon: '📋' },
                    { title: 'README', file: 'README.md', icon: '📘' }
                ]
            },
            {
                title: 'Units',
                items: [
                    { title: 'Unit 1: Introduction to Latin', file: 'units/unit-01-introduction-to-latin.md', icon: '📖' },
                    { title: 'Unit 2: Verbs and Second Declension', file: 'units/unit-02-verbs-and-second-declension.md', icon: '📖' },
                    { title: 'Unit 3: Third Declension and More Verbs', file: 'units/unit-03-third-declension-and-more-verbs.md', icon: '📖' },
                    { title: 'Unit 4: Fourth and Fifth Declensions', file: 'units/unit-04-fourth-and-fifth-declensions.md', icon: '📖' },
                    { title: 'Unit 5: Adjectives and Pronouns', file: 'units/unit-05-adjectives-and-pronouns.md', icon: '📖' },
                    { title: 'Unit 6: Additional Grammar and Review', file: 'units/unit-06-additional-grammar-and-review.md', icon: '📖' }
                ]
            },
            {
                title: 'Resources',
                items: [
                    { title: 'Master Vocabulary List', file: 'vocabulary/master-vocabulary-list.md', icon: '📚' },
                    { title: 'Reading Passages', file: 'readings/reading-passages.md', icon: '📖' },
                    { title: 'Comprehensive Exercises', file: 'exercises/comprehensive-exercises.md', icon: '✏️' },
                    { title: 'Quizzes and Tests', file: 'assessments/quizzes-and-tests.md', icon: '📝' },
                    { title: 'Quick Reference Guide', file: 'quick-reference-guide.md', icon: '📋' }
                ]
            }
        ]
    }
};

// State management
let currentCourseId = null;
let currentFile = null;

// Initialize coursework viewer on page load
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('coursework-viewer.html')) {
        initCourseworkViewer();
    }
});

// Initialize the coursework viewer
function initCourseworkViewer() {
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get('course');
    const file = urlParams.get('file');

    if (!courseId || !courseStructures[courseId]) {
        showError('Course not found');
        return;
    }

    currentCourseId = courseId;
    const courseStructure = courseStructures[courseId];

    // Set course title
    const titleEl = document.getElementById('course-title-sidebar');
    if (titleEl) {
        titleEl.textContent = courseStructure.title;
    }

    // Build navigation
    buildCourseworkNavigation(courseStructure);

    // Load initial file or default to first item
    const fileToLoad = file || courseStructure.sections[0].items[0].file;
    loadCourseworkFile(fileToLoad);

    // Setup sidebar toggle
    setupSidebarToggle();
}

// Build the sidebar navigation
function buildCourseworkNavigation(courseStructure) {
    const navEl = document.getElementById('coursework-nav');
    if (!navEl) return;

    navEl.innerHTML = '';

    courseStructure.sections.forEach(section => {
        const sectionDiv = document.createElement('div');
        sectionDiv.className = 'nav-section';

        const sectionHeader = document.createElement('h3');
        sectionHeader.className = 'nav-section-header';
        sectionHeader.textContent = section.title;
        sectionDiv.appendChild(sectionHeader);

        const itemsList = document.createElement('ul');
        itemsList.className = 'nav-items';

        section.items.forEach(item => {
            const li = document.createElement('li');
            const link = document.createElement('a');
            link.href = '#';
            link.className = 'nav-item';
            link.innerHTML = `${item.icon} ${item.title}`;
            link.dataset.file = item.file;

            link.addEventListener('click', function(e) {
                e.preventDefault();
                loadCourseworkFile(item.file);
                // Update active state
                document.querySelectorAll('.nav-item').forEach(a => a.classList.remove('active'));
                link.classList.add('active');
            });

            li.appendChild(link);
            itemsList.appendChild(li);
        });

        sectionDiv.appendChild(itemsList);
        navEl.appendChild(sectionDiv);
    });
}

// Load and display a coursework file
async function loadCourseworkFile(filename) {
    if (!currentCourseId) return;

    currentFile = filename;
    const courseStructure = courseStructures[currentCourseId];
    const fileUrl = courseStructure.baseUrl + filename;

    const contentEl = document.getElementById('coursework-content');
    if (!contentEl) return;

    // Show loading state
    contentEl.innerHTML = `
        <div class="loading-state">
            <div class="spinner"></div>
            <p>Loading content...</p>
        </div>
    `;

    try {
        const response = await fetch(fileUrl);
        if (!response.ok) {
            throw new Error(`Failed to load file: ${response.status}`);
        }

        const markdown = await response.text();
        const html = convertMarkdownToHTML(markdown);

        contentEl.innerHTML = html;

        // Generate table of contents
        generateTableOfContents();

        // Highlight active nav item
        highlightActiveNavItem(filename);

        // Smooth scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error) {
        console.error('Error loading coursework file:', error);
        contentEl.innerHTML = `
            <div class="error-state">
                <h2>Error Loading Content</h2>
                <p>Unable to load the requested file. Please try again later.</p>
                <p class="error-details">${error.message}</p>
            </div>
        `;
    }
}

// Convert Markdown to HTML (basic implementation)
function convertMarkdownToHTML(markdown) {
    let html = markdown;

    // Escape HTML special characters first
    const escapeHTML = (text) => {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    };

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Bold
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    
    // Italic
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Code blocks
    html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    
    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

    // Unordered lists
    html = html.replace(/^\s*[-*+]\s+(.*)$/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

    // Ordered lists
    html = html.replace(/^\s*\d+\.\s+(.*)$/gim, '<li>$1</li>');

    // Blockquotes
    html = html.replace(/^\> (.*)$/gim, '<blockquote>$1</blockquote>');

    // Horizontal rules
    html = html.replace(/^---$/gim, '<hr>');

    // Tables (basic support)
    html = html.replace(/\|(.+)\|/g, function(match) {
        const cells = match.split('|').filter(cell => cell.trim());
        const cellHTML = cells.map(cell => `<td>${cell.trim()}</td>`).join('');
        return `<tr>${cellHTML}</tr>`;
    });
    html = html.replace(/(<tr>.*<\/tr>)/s, '<table>$1</table>');

    // Paragraphs (lines separated by blank lines)
    html = html.replace(/\n\n/g, '</p><p>');
    html = '<p>' + html + '</p>';

    // Clean up empty paragraphs
    html = html.replace(/<p><\/p>/g, '');
    html = html.replace(/<p>(<h[1-6]>)/g, '$1');
    html = html.replace(/(<\/h[1-6]>)<\/p>/g, '$1');
    html = html.replace(/<p>(<ul>)/g, '$1');
    html = html.replace(/(<\/ul>)<\/p>/g, '$1');
    html = html.replace(/<p>(<table>)/g, '$1');
    html = html.replace(/(<\/table>)<\/p>/g, '$1');
    html = html.replace(/<p>(<hr>)<\/p>/g, '$1');
    html = html.replace(/<p>(<blockquote>)/g, '$1');
    html = html.replace(/(<\/blockquote>)<\/p>/g, '$1');
    html = html.replace(/<p>(<pre>)/g, '$1');
    html = html.replace(/(<\/pre>)<\/p>/g, '$1');

    return html;
}

// Generate table of contents from headers
function generateTableOfContents() {
    const contentEl = document.getElementById('coursework-content');
    const tocEl = document.getElementById('toc-nav');
    if (!contentEl || !tocEl) return;

    const headers = contentEl.querySelectorAll('h1, h2, h3');
    if (headers.length === 0) {
        tocEl.innerHTML = '<p class="toc-empty">No sections</p>';
        return;
    }

    tocEl.innerHTML = '';
    const tocList = document.createElement('ul');
    tocList.className = 'toc-list';

    headers.forEach((header, index) => {
        const id = `section-${index}`;
        header.id = id;

        const li = document.createElement('li');
        li.className = `toc-item toc-${header.tagName.toLowerCase()}`;

        const link = document.createElement('a');
        link.href = `#${id}`;
        link.textContent = header.textContent;
        link.addEventListener('click', function(e) {
            e.preventDefault();
            header.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });

        li.appendChild(link);
        tocList.appendChild(li);
    });

    tocEl.appendChild(tocList);
}

// Highlight the active navigation item
function highlightActiveNavItem(filename) {
    document.querySelectorAll('.nav-item').forEach(item => {
        if (item.dataset.file === filename) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// Setup sidebar toggle for mobile
function setupSidebarToggle() {
    const toggleBtn = document.getElementById('toggle-sidebar');
    const sidebar = document.querySelector('.coursework-sidebar');

    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', function() {
            sidebar.classList.toggle('collapsed');
        });
    }
}

// Show error message
function showError(message) {
    const contentEl = document.getElementById('coursework-content');
    if (contentEl) {
        contentEl.innerHTML = `
            <div class="error-state">
                <h2>Error</h2>
                <p>${message}</p>
                <a href="courses.html" class="btn btn-primary">Back to Courses</a>
            </div>
        `;
    }
}
