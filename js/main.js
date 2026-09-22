// js/main.js

// Keep direct index.html requests on the same clean URL as normal navigation.
if (location.pathname.endsWith('/index.html')) {
    history.replaceState(null, '', location.pathname.slice(0, -10) + location.search + location.hash);
}

document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('.site-header');
    const menuButton = document.querySelector('.menu-toggle');

    document.querySelectorAll('.hero').forEach(hero => {
        const content = hero.querySelector('.hero-content');
        if (!content) return;

        const setHeroContentHeight = () => {
            const contentHeight = content.getBoundingClientRect().height;
            hero.style.setProperty('--hero-content-height', `${contentHeight}px`);
        };

        setHeroContentHeight();
        document.fonts?.ready.then(setHeroContentHeight);

        if ('ResizeObserver' in window) {
            new ResizeObserver(setHeroContentHeight).observe(content);
        } else {
            window.addEventListener('resize', setHeroContentHeight, { passive: true });
        }
    });

    const isHomepage = Boolean(document.querySelector('main[data-homepage]'));

    if (menuButton && header) {
        menuButton.addEventListener('click', () => {
            const isOpen = header.classList.toggle('menu-open');
            menuButton.setAttribute('aria-expanded', String(isOpen));
            document.body.style.overflow = isOpen ? 'hidden' : '';
        });

        const navLinks = header.querySelectorAll('.main-nav a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                header.classList.remove('menu-open');
                menuButton.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            });
        });
    }

    // Language Dropdown Click Support
    const langDropdowns = document.querySelectorAll('.lang-dropdown');
    langDropdowns.forEach(dropdown => {
        const btn = dropdown.querySelector('.lang-dropdown-btn');
        if (btn) {
            btn.setAttribute('aria-expanded', 'false');
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const isOpen = dropdown.classList.toggle('is-active');
                btn.setAttribute('aria-expanded', String(isOpen));
            });
        }

        const translatedSectionIds = {
            yaklasim: 'approach', approach: 'yaklasim',
            odak: 'focus', focus: 'odak',
            iletisim: 'contact', contact: 'iletisim',
            top: 'top', fund: 'fund', network: 'network',
            innovaclub: 'innovaclub', komite: 'komite', ekip: 'ekip'
        };
        dropdown.querySelectorAll('.lang-dropdown-menu a').forEach(link => {
            link.addEventListener('click', () => {
                if (!isHomepage) return;
                const validSectionIds = ['top', 'fund', 'yaklasim', 'approach', 'odak', 'focus', 'network', 'innovaclub', 'komite', 'ekip', 'iletisim', 'contact'];
                const focusPoint = window.innerHeight * 0.35;
                const section = validSectionIds
                    .map(id => document.getElementById(id))
                    .filter(Boolean)
                    .reverse()
                    .find(sec => {
                        const bounds = sec.getBoundingClientRect();
                        return bounds.top <= focusPoint && bounds.bottom > 0;
                    });
                if (!section?.id) return;

                const sectionId = translatedSectionIds[section.id] ?? section.id;
                link.hash = sectionId;
            });
        });
    });

    document.addEventListener('click', (e) => {
        langDropdowns.forEach(dropdown => {
            if (!dropdown.contains(e.target)) {
                dropdown.classList.remove('is-active');
                dropdown.querySelector('.lang-dropdown-btn')?.setAttribute('aria-expanded', 'false');
            }
        });
    });

    // ScrollSpy & Section Scroll Calculations
    function initScrollSpy() {
        const navLinks = [...document.querySelectorAll('.main-nav a')];
        const validSectionIds = ['top', 'fund', 'yaklasim', 'approach', 'odak', 'focus', 'network', 'innovaclub', 'komite', 'ekip', 'iletisim', 'contact'];
        
        const getTargetSectionId = (link) => {
            const href = link.getAttribute('href') || '';
            if (href.includes('#')) {
                return href.split('#')[1];
            }
            return href === '/' || href === '/en/' ? 'top' : null;
        };

        const getSections = () => validSectionIds
            .map(id => document.getElementById(id))
            .filter(Boolean);

        const getActiveSectionId = () => {
            const sections = getSections();
            if (!sections.length) return null;

            // Bottom of page check
            if ((window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 30) {
                return sections[sections.length - 1].id;
            }

            const focusPoint = window.innerHeight * 0.35;
            let activeId = null;

            for (const section of sections) {
                const bounds = section.getBoundingClientRect();
                if (bounds.top <= focusPoint && bounds.bottom > 0) {
                    activeId = section.id;
                }
            }

            return activeId || sections[0].id;
        };

        const updateActiveNav = () => {
            const activeId = getActiveSectionId();
            if (!activeId) return;

            // Map sub-sections or aliases to main nav targets (e.g., ekip -> komite)
            const targetId = activeId === 'ekip' ? 'komite' : activeId;

            navLinks.forEach(link => {
                const linkTarget = getTargetSectionId(link);
                const isActive = linkTarget === targetId;
                link.classList.toggle('active', isActive);
                if (isActive) {
                    link.setAttribute('aria-current', 'page');
                } else {
                    link.removeAttribute('aria-current');
                }
            });

            if (history.replaceState && location.hash !== `#${activeId}` && activeId !== 'top') {
                history.replaceState(null, '', `#${activeId}`);
            } else if (activeId === 'top' && location.hash) {
                history.replaceState(null, '', window.location.pathname + window.location.search);
            }
        };

        let tick = false;
        window.addEventListener('scroll', () => {
            if (!tick) {
                requestAnimationFrame(() => {
                    updateActiveNav();
                    tick = false;
                });
                tick = true;
            }
        }, { passive: true });

        updateActiveNav();
    }

    const initialTarget = document.getElementById(location.hash.slice(1));
    const initializeNavigation = () => {
        initialTarget?.scrollIntoView({ behavior: 'instant', block: 'start' });
        initScrollSpy();
    };
    if (document.readyState === 'complete') {
        initializeNavigation();
    } else {
        window.addEventListener('load', initializeNavigation, { once: true });
    }

    // Scroll state for logo animation
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            document.body.classList.add('scrolled');
        } else {
            document.body.classList.remove('scrolled');
        }
    }, { passive: true });

    // Focus Areas Tabs Handler
    document.addEventListener('click', (e) => {
        const tabBtn = e.target.closest('.focus-tab-btn');
        if (!tabBtn) return;

        const targetTab = tabBtn.dataset.tab;

        const navContainer = tabBtn.closest('.focus-tabs-nav');
        const sectionContainer = tabBtn.closest('#odak, #focus') || document;

        if (navContainer) {
            navContainer.querySelectorAll('.focus-tab-btn').forEach(btn => {
                const isActive = btn === tabBtn;
                btn.classList.toggle('active', isActive);
                btn.setAttribute('aria-selected', String(isActive));
            });
        }

        sectionContainer.querySelectorAll('.focus-tab-panel').forEach(panel => {
            const isTarget = panel.dataset.focusPanel === targetTab;
            panel.classList.toggle('active', isTarget);
        });

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    });

    // Initialize Lucide Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});
