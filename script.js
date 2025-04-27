// DOM Elements
const carousel = document.querySelector(".carousel");
const leftArrow = document.getElementById("left");
const rightArrow = document.getElementById("right");
const currentCard = document.getElementById("actuel");
const backToTopButton = document.getElementById('backToTop');
const exportButton = document.getElementById('exportButton');
const importButton = document.getElementById('importButton');
const importDataButton = document.getElementById('importDataButton');
const titleContent = document.title;

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    // Load saved data
    loadCompletedSections();

    // Set up event listeners
    setupEventListeners();

    // Scroll to current card in nav
    scrollToCurrentCard();

    // Set up video controls
    setupVideoControls();
});

// Scroll to current navigation card
function scrollToCurrentCard() {
    if (currentCard && carousel) {
        const carouselRect = carousel.getBoundingClientRect();
        const cardRect = currentCard.getBoundingClientRect();
        const offset = cardRect.left - carouselRect.left - (carouselRect.width / 2) + (cardRect.width / 2);

        carousel.scrollBy({
            left: offset,
            behavior: "smooth",
        });
    }
}

// Navigation arrows
leftArrow.addEventListener("click", () => {
    carousel.scrollBy({ left: -200, behavior: "smooth" });
});

rightArrow.addEventListener("click", () => {
    carousel.scrollBy({ left: 200, behavior: "smooth" });
});

// Section navigation - Fixed to show section at top of viewport
function navigateToSection(direction, currentIndex) {
    const sections = document.querySelectorAll('.section');
    let targetIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;

    if (targetIndex >= 0 && targetIndex < sections.length) {
        // Get the header height to account for sticky header
        const headerHeight = document.querySelector('header').offsetHeight;
        const elementPosition = sections[targetIndex].getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerHeight - 20; // 20px extra padding

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    } else {
        alert(direction === 'next' ? 'You are at the last video!' : 'You are at the first video!');
    }
}

// Page navigation
function navigate(targetPage) {
    window.location.href = targetPage;
}

// Back to top button
window.onscroll = function() {
    backToTopButton.style.display = (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100)
        ? "flex" : "none";
};

backToTopButton.onclick = function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Data export
exportButton.addEventListener('click', exportData);

function exportData() {
    const localStorageData = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        localStorageData[key] = localStorage.getItem(key);
    }

    const blob = new Blob([JSON.stringify(localStorageData)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${titleContent}_backup.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Data import
importDataButton.addEventListener('click', () => importButton.click());
importButton.addEventListener('change', handleFileImport);

function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const jsonData = JSON.parse(e.target.result);
            Object.entries(jsonData).forEach(([key, value]) => {
                localStorage.setItem(key, typeof value === 'string' ? value.replace(/\\n/g, '\n') : value);
            });
            alert('Data imported successfully!');
            location.reload();
        } catch (error) {
            console.error('Import error:', error);
            alert('Error importing data. Please check the console.');
        }
    };
    reader.readAsText(file);
}

function loadCompletedSections() {
    const pagePath = window.location.pathname;

    document.querySelectorAll(".section").forEach((section) => {
        const sectionId = section.id;

        // Load completion status
        if (localStorage.getItem(`${pagePath}-${sectionId}`)) {
            updateSectionStyle(section, true);
        }

        // Load notes
        const notes = localStorage.getItem(`${pagePath}-notes-${sectionId}`);
        const notesTextArea = section.querySelector(".notes-input");
        if (notes && notesTextArea) {
            notesTextArea.value = notes;
        }
    });
}

function setupEventListeners() {
    const pagePath = window.location.pathname;

    document.querySelectorAll('.section').forEach(section => {
        const completeButton = section.querySelector('.complete-btn');
        const unmarkButton = section.querySelector('.unmark-btn');
        const notesTextArea = section.querySelector('.notes-input');

        completeButton?.addEventListener('click', () => {
            localStorage.setItem(`${pagePath}-${section.id}`, 'completed');
            updateSectionStyle(section, true);
        });

        unmarkButton?.addEventListener('click', () => {
            localStorage.removeItem(`${pagePath}-${section.id}`);
            updateSectionStyle(section, false);
        });

        notesTextArea?.addEventListener('input', () => {
            localStorage.setItem(`${pagePath}-notes-${section.id}`, notesTextArea.value);
        });
    });
}

function updateSectionStyle(section, isComplete) {
    if (isComplete) {
        section.style.backgroundColor = '#0d660d';
        section.querySelectorAll('*').forEach(el => {
            if (el.tagName.toLowerCase() !== 'textarea' && !el.classList.contains('button-group')) {
                el.style.color = "#000";
            }
        });
    } else {
        section.style.backgroundColor = 'rgb(24, 26, 27)';
        section.querySelectorAll('*').forEach(el => {
            if (el.tagName.toLowerCase() !== 'button') {
                el.style.color = "#fff";
            }
        });
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadCompletedSections();

    if (window.innerWidth > 768) {
        setupEventListeners();

        leftArrow.addEventListener("click", () => {
            carousel.scrollBy({ left: -200, behavior: "smooth" });
        });

        rightArrow.addEventListener("click", () => {
            carousel.scrollBy({ left: 200, behavior: "smooth" });
        });
    }

    scrollToCurrentCard();
    setupVideoControls();
});

function exportData() {
    const pagePath = window.location.pathname;
    const localStorageData = {};

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith(pagePath)) {
            localStorageData[key] = localStorage.getItem(key);
        }
    }

    const blob = new Blob([JSON.stringify(localStorageData)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${titleContent}_backup.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const pagePath = window.location.pathname;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const jsonData = JSON.parse(e.target.result);
            Object.entries(jsonData).forEach(([key, value]) => {
                if (key.startsWith(pagePath)) {
                    localStorage.setItem(key, typeof value === 'string' ? value.replace(/\\n/g, '\n') : value);
                }
            });
            alert('Data imported successfully!');
            location.reload();
        } catch (error) {
            console.error('Import error:', error);
            alert('Error importing data. Please check the console.');
        }
    };
    reader.readAsText(file);
}