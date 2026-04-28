
            // Ensure initialization runs reliably at the end of the document
            (function() {
                console.log("[Init] Running final initialization...");
                if (typeof initSelectors === 'function') {
                    initSelectors();
                }
                const savedTheme = localStorage.getItem('theme');
                if (savedTheme === 'dark') document.documentElement.classList.add('dark');
                if (typeof updateThemeBtn === 'function') updateThemeBtn();
                if (typeof loadData === 'function') {
                    loadData();
                }
            })();
        