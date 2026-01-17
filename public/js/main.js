// Main JavaScript

// Mobile menu toggle
const menuToggle = document.getElementById('menuToggle');
const navbarMenu = document.getElementById('navbarMenu');

if (menuToggle) {
  menuToggle.addEventListener('click', () => {
    navbarMenu.classList.toggle('active');
  });
}

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
  if (navbarMenu && navbarMenu.classList.contains('active')) {
    if (!navbarMenu.contains(e.target) && !menuToggle.contains(e.target)) {
      navbarMenu.classList.remove('active');
    }
  }
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// Add active class to current nav link
const currentPath = window.location.pathname;
document.querySelectorAll('.navbar-link').forEach(link => {
  if (link.getAttribute('href') === currentPath) {
    link.classList.add('active');
  }
});
// PWA Installation & Connection Status
let deferredPrompt;
const installBtn = document.getElementById('installApp');
const connectionStatus = document.getElementById('connectionStatus');

console.log('PWA: Main.js loaded');

if (connectionStatus) {
  const updateStatus = () => {
    const isOnline = navigator.onLine;
    console.log('PWA: Connectivity changed to', isOnline ? 'Online' : 'Offline');
    connectionStatus.className = `connection-status ${isOnline ? 'status-online' : 'status-offline'}`;
    connectionStatus.querySelector('.status-text').textContent = isOnline ? 'Online' : 'Offline';
  };
  window.addEventListener('online', updateStatus);
  window.addEventListener('offline', updateStatus);
  updateStatus(); // Initial check
}

window.addEventListener('beforeinstallprompt', (e) => {
  console.log('PWA: beforeinstallprompt event fired!');
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  // Stash the event so it can be triggered later.
  deferredPrompt = e;
  // Update UI notify the user they can add to home screen
  if (installBtn) {
    console.log('PWA: Showing install button');
    installBtn.style.display = 'flex';
  }
});

// Check if app is already installed
window.addEventListener('appinstalled', (evt) => {
  console.log('PWA: App was successfully installed');
});

if (installBtn) {
  installBtn.addEventListener('click', (e) => {
    console.log('PWA: Install button clicked');
    if (!deferredPrompt) {
      console.warn('PWA: No deferredPrompt available');
      return;
    }
    // Show the prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult) => {
      console.log('PWA: User choice:', choiceResult.outcome);
      if (choiceResult.outcome === 'accepted') {
        console.log('PWA: User accepted the install prompt');
      } else {
        console.log('PWA: User dismissed the install prompt');
      }
      deferredPrompt = null;
      installBtn.style.display = 'none';
    });
  });
}
