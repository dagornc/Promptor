const darkModeToggle = document.getElementById('dark-mode-toggle');
const darkModeIcon = document.getElementById('dark-mode-icon'); // Sélectionner le span de l'icône
const body = document.body;

// Fonction pour mettre à jour l'icône
function updateIcon() {
    if (body.classList.contains('dark-mode')) {
        darkModeIcon.textContent = '☀️'; // Soleil en mode sombre
    } else {
        darkModeIcon.textContent = '🌙'; // Lune en mode clair
    }
}

// Vérifier si le mode sombre est déjà activé (localStorage)
if (localStorage.getItem('darkMode') === 'enabled') {
    body.classList.add('dark-mode');
}
updateIcon(); // Mettre à jour l'icône au chargement

darkModeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    updateIcon(); // Mettre à jour l'icône au clic

    // Sauvegarder la préférence dans localStorage
    if (body.classList.contains('dark-mode')) {
        localStorage.setItem('darkMode', 'enabled');
    } else {
        localStorage.removeItem('darkMode');
    }
});

// --- Logique de redimensionnement de la Sidebar ---

const sidebar = document.querySelector('.sidebar');
const dragHandle = document.getElementById('dragHandle');

let isResizing = false;
let startX;
let startWidth;

// Récupérer la largeur sauvegardée
const savedWidth = localStorage.getItem('sidebarWidth');
if (savedWidth) {
    sidebar.style.width = `${savedWidth}px`;
}

dragHandle.addEventListener('mousedown', (e) => {
    isResizing = true;
    startX = e.clientX;
    startWidth = sidebar.offsetWidth;
    // Empêcher la sélection de texte pendant le redimensionnement
    document.body.style.userSelect = 'none';
    document.body.style.pointerEvents = 'none'; // Empêche les iframes/objets de capturer les événements
    dragHandle.style.cursor = 'col-resize'; // Maintenir le curseur
});

document.addEventListener('mousemove', (e) => {
    if (!isResizing) return;

    const currentX = e.clientX;
    const diffX = currentX - startX;
    let newWidth = startWidth + diffX;

    // Limiter la largeur minimale et maximale si nécessaire
    const minWidth = 150; // Largeur minimale
    const maxWidth = 500; // Largeur maximale
    if (newWidth < minWidth) newWidth = minWidth;
    if (newWidth > maxWidth) newWidth = maxWidth;

    sidebar.style.width = `${newWidth}px`;
});

document.addEventListener('mouseup', () => {
    if (isResizing) {
        isResizing = false;
        // Réactiver la sélection de texte et les événements pointeur
        document.body.style.userSelect = '';
        document.body.style.pointerEvents = ''; 
        dragHandle.style.cursor = 'col-resize'; // Réinitialiser le curseur (peut être géré par CSS aussi)
        
        // Sauvegarder la nouvelle largeur
        localStorage.setItem('sidebarWidth', sidebar.offsetWidth);
    }
}); 