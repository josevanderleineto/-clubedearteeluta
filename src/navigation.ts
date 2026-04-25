type MobileMenuSelectors = {
  toggle: string;
  close: string;
  menu: string;
  state: string;
  link: string;
};

type MobileMenuOptions = Partial<MobileMenuSelectors> & {
  desktopBreakpoint?: number;
};

const defaultSelectors: MobileMenuSelectors = {
  toggle: '#menu-toggle',
  close: '#menu-close',
  menu: '#mobile-menu',
  state: '#mobile-menu-state',
  link: '.mobile-link',
};

const defaultDesktopBreakpoint = 1024;

let lockedScrollY = 0;
let scrollLocked = false;

function lockPageScroll() {
  if (scrollLocked) return;

  // Preserve the current scroll position so the page does not move behind the overlay on mobile.
  lockedScrollY = window.scrollY;
  document.body.style.position = 'fixed';
  document.body.style.top = `-${lockedScrollY}px`;
  document.body.style.left = '0';
  document.body.style.right = '0';
  document.body.style.width = '100%';
  scrollLocked = true;
}

function unlockPageScroll() {
  if (!scrollLocked) return;

  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.left = '';
  document.body.style.right = '';
  document.body.style.width = '';
  window.scrollTo(0, lockedScrollY);
  scrollLocked = false;
}

function syncMenuState(
  menuState: HTMLInputElement,
  menu: HTMLElement,
  toggle: HTMLElement | null
) {
  const open = menuState.checked;

  menu.setAttribute('aria-hidden', String(!open));
  document.documentElement.classList.toggle('mobile-menu-open', open);
  document.body.classList.toggle('mobile-menu-open', open);
  if (open) {
    lockPageScroll();
  } else {
    unlockPageScroll();
  }

  if (toggle) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  }
}

function setMenuState(
  menuState: HTMLInputElement,
  menu: HTMLElement,
  toggle: HTMLElement | null,
  open: boolean
) {
  menuState.checked = open;
  syncMenuState(menuState, menu, toggle);
}

export function initMobileMenu(options: MobileMenuOptions = {}) {
  const { desktopBreakpoint = defaultDesktopBreakpoint, ...selectors } = options;
  const resolved = { ...defaultSelectors, ...selectors };
  const menuToggle = document.querySelector<HTMLElement>(resolved.toggle);
  const menuClose = document.querySelector<HTMLElement>(resolved.close);
  const mobileMenu = document.querySelector<HTMLElement>(resolved.menu);
  const menuState = document.querySelector<HTMLInputElement>(resolved.state);

  if (!menuToggle || !menuClose || !mobileMenu || !menuState) {
    console.warn('Mobile menu elements not found:', { menuToggle, menuClose, mobileMenu, menuState });
    return false;
  }

  const mobileLinks = mobileMenu.querySelectorAll<HTMLAnchorElement>(resolved.link);

  const openMenu = () => setMenuState(menuState, mobileMenu, menuToggle, true);
  const closeMenu = () => setMenuState(menuState, mobileMenu, menuToggle, false);
  const toggleMenu = () => setMenuState(menuState, mobileMenu, menuToggle, !menuState.checked);
  const syncResponsiveMenuState = () => {
    if (window.innerWidth >= desktopBreakpoint && menuState.checked) {
      closeMenu();
    }
  };

  syncMenuState(menuState, mobileMenu, menuToggle);

  menuState.addEventListener('change', () => {
    syncMenuState(menuState, mobileMenu, menuToggle);
  });

  // Ensure initial state is correct
  syncMenuState(menuState, mobileMenu, menuToggle);

  menuToggle.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleMenu();
    }
  });

  menuClose.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      closeMenu();
    }
  });

  menuClose.addEventListener('click', (event) => {
    event.preventDefault();
    closeMenu();
  });

  mobileMenu.addEventListener('click', (event) => {
    const target = event.target as HTMLElement | null;

    if (target?.dataset.mobileMenuBackdrop === 'true') {
      closeMenu();
    }
  });

  mobileLinks.forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeMenu();
    }
  });

  syncResponsiveMenuState();
  window.addEventListener('resize', syncResponsiveMenuState);

  return { openMenu, closeMenu, toggleMenu };
}

export function initHeaderScroll() {
  const header = document.querySelector<HTMLElement>('header');
  const headerShell = header?.querySelector<HTMLElement>('.header-shell') ?? header;

  if (!header || !headerShell) return;

  const syncHeaderState = () => {
    if (window.scrollY > 50) {
      header.classList.add('bg-black/95');
      header.classList.remove('bg-black/80');
      headerShell.classList.add('py-2');
      headerShell.classList.remove('py-3');
    } else {
      header.classList.remove('bg-black/95');
      header.classList.add('bg-black/80');
      headerShell.classList.remove('py-2');
      headerShell.classList.add('py-3');
    }
  };

  syncHeaderState();

  window.addEventListener('scroll', () => {
    syncHeaderState();
  });
}

export function initSmoothScroll() {
  document
    .querySelectorAll<HTMLAnchorElement>('a[href^="#"]')
    .forEach((anchor) => {
      anchor.addEventListener('click', (event) => {
        const href = anchor.getAttribute('href');

        if (!href || href === '#') return;

        event.preventDefault();
        const target = document.querySelector(href);

        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
          });
        }
      });
    });
}

export function initSiteNavigation() {
  initMobileMenu();
  initHeaderScroll();
  initSmoothScroll();
}
