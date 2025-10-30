// Three-way theme switcher: light -> dark -> synthwave -> light
(function() {
    const THEME_KEY = 'pref-theme';
    const THEMES = ['light', 'dark', 'synthwave'];
    let currentTheme = null; // Track current theme to avoid localStorage race conditions

    // Get current theme from localStorage or default to light
    function getTheme() {
        if (currentTheme) {
            console.log('getTheme: returning cached theme =', currentTheme);
            return currentTheme;
        }
        const stored = localStorage.getItem(THEME_KEY);
        console.log('getTheme: stored value =', stored);
        return THEMES.includes(stored) ? stored : 'light';
    }

    // Apply theme to document
    function applyTheme(theme) {
        console.log('applyTheme: applying theme =', theme);
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(THEME_KEY, theme);
        currentTheme = theme; // Update cached theme
        updateThemeIcon(theme);
    }

    // Update which icon is visible
    function updateThemeIcon(theme) {
        console.log('updateThemeIcon: updating for theme =', theme);
        const moon = document.getElementById('moon');
        const sun = document.getElementById('sun');
        const synthwave = document.getElementById('synthwave');

        if (!moon || !sun || !synthwave) {
            console.error('updateThemeIcon: one or more icons not found');
            return;
        }

        // Hide all icons first
        moon.style.display = 'none';
        sun.style.display = 'none';
        synthwave.style.display = 'none';

        // Show the appropriate icon based on current theme
        // Icon shown = what you'll switch TO when you click
        if (theme === 'light') {
            moon.style.display = 'block'; // Show moon = will switch to dark
        } else if (theme === 'dark') {
            synthwave.style.display = 'block'; // Show lightning = will switch to synthwave
        } else if (theme === 'synthwave') {
            sun.style.display = 'block'; // Show sun = will switch to light
        }
        console.log('updateThemeIcon: icons updated');
    }

    // Cycle to next theme
    function cycleTheme() {
        console.log('cycleTheme: called');
        const current = getTheme();
        console.log('cycleTheme: current theme =', current);
        const currentIndex = THEMES.indexOf(current);
        console.log('cycleTheme: current index =', currentIndex, 'THEMES =', THEMES);
        const nextIndex = (currentIndex + 1) % THEMES.length;
        const nextTheme = THEMES[nextIndex];
        console.log('cycleTheme: cycling from', current, 'to', nextTheme);
        applyTheme(nextTheme);
    }

    // Initialize theme on page load
    const initialTheme = getTheme();
    console.log('Initialization: initial theme =', initialTheme);
    applyTheme(initialTheme);

    // Set up click handler
    document.addEventListener('DOMContentLoaded', function() {
        console.log('DOMContentLoaded: setting up click handler');
        const toggleBtn = document.getElementById('theme-toggle');
        if (toggleBtn) {
            console.log('DOMContentLoaded: toggleBtn found, adding listener');
            toggleBtn.addEventListener('click', cycleTheme);
        } else {
            console.error('DOMContentLoaded: toggleBtn not found');
        }
    });
})();