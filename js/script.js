// Fichier JavaScript principal 

document.addEventListener('DOMContentLoaded', () => {
    const sidebarToggleButton = document.getElementById('sidebar-toggle-button');
    const sidebar = document.querySelector('.sidebar'); // Sélectionne par classe
    const sidebarOverlay = document.getElementById('sidebar-overlay');

    // --- Logique pour afficher/masquer la sidebar sur mobile --- 
    if (sidebarToggleButton && sidebar && sidebarOverlay) {
        sidebarToggleButton.addEventListener('click', () => {
            const isExpanded = sidebarToggleButton.getAttribute('aria-expanded') === 'true';
            document.body.classList.toggle('sidebar-mobile-active');
            sidebarToggleButton.classList.toggle('active');
            sidebarToggleButton.setAttribute('aria-expanded', !isExpanded);
            // Empêcher le scroll du body quand la sidebar est ouverte
            document.body.style.overflow = !isExpanded ? 'hidden' : '';
        });

        // Fermer la sidebar en cliquant sur l'overlay
        sidebarOverlay.addEventListener('click', () => {
            document.body.classList.remove('sidebar-mobile-active');
            sidebarToggleButton.classList.remove('active');
            sidebarToggleButton.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = ''; // Réactiver le scroll
        });

        // Fermer la sidebar en cliquant sur un lien dedans
        sidebar.addEventListener('click', (event) => {
            // Vérifier si on est en mode mobile (body a la classe active) et si on a cliqué sur un lien
            if (document.body.classList.contains('sidebar-mobile-active') && event.target.tagName === 'A') {
                 document.body.classList.remove('sidebar-mobile-active');
                 sidebarToggleButton.classList.remove('active');
                 sidebarToggleButton.setAttribute('aria-expanded', 'false');
                 document.body.style.overflow = ''; // Réactiver le scroll
            }
        });
    }

    // --- Logique pour le redimensionnement de la sidebar --- (Code existant)
    const dragHandle = document.getElementById('dragHandle');
    // const sidebar = document.querySelector('.sidebar'); // Déjà sélectionné plus haut
    let isResizing = false;
    let startX, startWidth;

    if (dragHandle && sidebar) {
        dragHandle.addEventListener('mousedown', (e) => {
            isResizing = true;
            startX = e.clientX;
            startWidth = sidebar.offsetWidth;
            // Empêche la sélection de texte pendant le glisser
            document.addEventListener('selectstart', preventSelection);
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', stopResizing);
        });
    }

    function handleMouseMove(e) {
        if (!isResizing) return;
        const currentX = e.clientX;
        const diffX = currentX - startX;
        let newWidth = startWidth + diffX;

        // Limiter la largeur minimale et maximale
        const minWidth = 150; // Largeur minimale
        const maxWidth = 500; // Largeur maximale
        if (newWidth < minWidth) newWidth = minWidth;
        if (newWidth > maxWidth) newWidth = maxWidth;

        sidebar.style.width = `${newWidth}px`;
    }

    function stopResizing() {
        if (isResizing) {
            isResizing = false;
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', stopResizing);
            document.removeEventListener('selectstart', preventSelection);
        }
    }

    function preventSelection(e) {
        e.preventDefault();
    }

    // --- Logique pour le Dark Mode --- 
    const darkModeButton = document.getElementById('dark-mode-toggle-btn');
    const darkModeIcon = document.getElementById('dark-mode-icon');
    const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");

    // Fonction pour appliquer le thème ET mettre à jour l'icône
    function applyTheme(isDark) {
        if (isDark) {
            document.body.classList.add('dark-mode');
            if (darkModeIcon) darkModeIcon.textContent = '☀️'; // Soleil
        } else {
            document.body.classList.remove('dark-mode');
            if (darkModeIcon) darkModeIcon.textContent = '🌙'; // Lune
        }
    }

    // Vérifier la préférence système au chargement et appliquer
    const systemPrefersDark = prefersDarkScheme.matches;
    applyTheme(systemPrefersDark);

    // Écouter les changements de préférence système
    prefersDarkScheme.addEventListener('change', (e) => applyTheme(e.matches));

    // Gérer le clic sur le bouton
    if (darkModeButton) {
        darkModeButton.addEventListener('click', () => {
            const isCurrentlyDark = document.body.classList.contains('dark-mode');
            applyTheme(!isCurrentlyDark); // Inverse le thème actuel
        });
    } else {
        console.error('Bouton pour le mode sombre non trouvé!');
    }
    // --- Fin Logique Dark Mode ---

    // --- Logique pour charger les prompts et gérer l'API --- (Code existant)
    const promptCategories = document.getElementById('prompt-categories');
    const fullPromptDiv = document.getElementById('full-prompt');
    const runPromptBtn = document.getElementById('run-prompt-btn');
    const promptDisplayDiv = document.querySelector('.prompt-display');
    const resultDisplayDiv = document.querySelector('.result-display');
    const llmResultDiv = document.getElementById('llm-result');
    const promptLabelLine = document.getElementById('prompt-label-line');
    const resultLabelLine = document.getElementById('result-label-line');
    let currentActivePromptLink = null;

    function parseAndStylePrompt(text) {
        let styledText = text.replace(/&#10;/g, '<br>');
        styledText = styledText.replace(/(\[.*?\])/g, '<span class="prompt-placeholder">$1</span>');
        return styledText;
    }

    function showPromptView() {
        if (resultDisplayDiv) resultDisplayDiv.style.display = 'none';
        if (resultLabelLine) resultLabelLine.style.display = 'none'; 
        if (promptDisplayDiv) promptDisplayDiv.style.display = 'block';
        if (promptLabelLine) promptLabelLine.style.display = 'flex'; 
    }

    function showResultView() {
        if (promptDisplayDiv) promptDisplayDiv.style.display = 'none';
        if (promptLabelLine) promptLabelLine.style.display = 'none'; 
        if (resultDisplayDiv) resultDisplayDiv.style.display = 'block'; 
        if (resultLabelLine) resultLabelLine.style.display = 'flex'; 
    }

    if (promptCategories) {
        promptCategories.addEventListener('click', (event) => {
            if (event.target.tagName === 'A' && event.target.dataset.prompt) {
                event.preventDefault(); 
                const selectedPromptText = event.target.dataset.prompt;
                if (fullPromptDiv) {
                    fullPromptDiv.innerHTML = parseAndStylePrompt(selectedPromptText);
                }
                if (currentActivePromptLink) {
                    currentActivePromptLink.classList.remove('active');
                }
                event.target.classList.add('active');
                currentActivePromptLink = event.target;
                showPromptView();
                if(runPromptBtn) runPromptBtn.textContent = 'Exécuter le Prompt';
            }
        });
    }

    if (runPromptBtn && fullPromptDiv) {
        runPromptBtn.addEventListener('click', async () => {
            if (runPromptBtn.textContent === 'Modifier le prompt') {
                showPromptView();
                runPromptBtn.textContent = 'Exécuter le Prompt';
                return; 
            }
            const fullPrompt = fullPromptDiv.textContent || ''; 
            // La clé n'est plus embarquée : elle est fournie par l'utilisateur
            // et stockée dans son navigateur (voir js/api-key.js).
            const apiKey = window.PromptorApiKey.requireApiKey();
            if (!fullPrompt.trim()) {
                alert("Veuillez d'abord sélectionner ou écrire un prompt.");
                return;
            }
            if (!apiKey) {
                alert("Aucune clé API configurée. L'exécution est impossible sans clé.");
                return;
            }
            const originalButtonText = runPromptBtn.textContent;
            runPromptBtn.textContent = 'Exécution en cours...';
            runPromptBtn.disabled = true;
            if (llmResultDiv) llmResultDiv.textContent = 'Chargement...';
             showResultView();
            try {
                const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${apiKey}` 
                    },
                    body: JSON.stringify({
                         model: "mistral-small-latest", 
                         messages: [{ role: "user", content: fullPrompt }],
                         temperature: 0.7,
                         max_tokens: 32000, 
                         stream: false 
                    })
                });
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ message: `Erreur HTTP ${response.status}` }));
                    throw new Error(errorData.message || `Erreur API Mistral: ${response.status}`);
                }
                const resultData = await response.json();
                if (llmResultDiv) {
                    if (resultData.choices && resultData.choices.length > 0 && resultData.choices[0].message) {
                         llmResultDiv.textContent = resultData.choices[0].message.content;
                    } else {
                         llmResultDiv.textContent = "Réponse reçue mais format inattendu.";
                         console.warn("Format de réponse inattendu:", resultData);
                    }
                }
            } catch (error) {
                console.error("Erreur lors de l'appel API Mistral:", error);
                alert(`Une erreur est survenue lors de l'appel à Mistral: ${error.message}`);
                if (llmResultDiv) {
                    llmResultDiv.textContent = `Erreur: ${error.message}`;
                }
            } finally {
                runPromptBtn.textContent = 'Modifier le prompt'; 
                runPromptBtn.disabled = false;
            }
        });
    }

    // --- Logique pour les boutons/spans de copie --- (Code existant)
    const copyPromptBtn = document.getElementById('copy-prompt-btn');
    const copyResultBtn = document.getElementById('copy-result-btn');
    const resultDiv = document.getElementById('llm-result'); 
    if (copyPromptBtn && fullPromptDiv) {
        copyPromptBtn.addEventListener('click', () => {
            copyToClipboard(fullPromptDiv.textContent || '', copyPromptBtn); 
        });
    }
    if (copyResultBtn && resultDiv) {
        copyResultBtn.addEventListener('click', () => {
            copyToClipboard(resultDiv.textContent || '', copyResultBtn); 
        });
    }
    function copyToClipboard(text, buttonElement) {
        if (!text) {
             console.warn("Tentative de copie de texte vide.");
             buttonElement.classList.add('copy-error');
             setTimeout(() => {
                 buttonElement.classList.remove('copy-error');
             }, 1000);
             return; 
        }
        navigator.clipboard.writeText(text).then(() => {
            buttonElement.classList.add('copied'); 
            setTimeout(() => {
                buttonElement.classList.remove('copied');
            }, 375);
        }).catch(err => {
            console.error('Erreur lors de la copie: ', err);
            buttonElement.classList.add('copy-error'); 
             setTimeout(() => {
                buttonElement.classList.remove('copy-error'); 
            }, 1500);
        });
    }

    // --- Logique Chatbot --- (Code existant)
    const chatbotFab = document.getElementById('chatbot-fab');
    const chatbotWindow = document.getElementById('chatbot-window');
    const closeChatbotBtn = document.getElementById('close-chatbot-btn');
    const chatHistory = document.getElementById('chat-history');
    const chatInput = document.getElementById('chat-input');
    const chatSendBtn = document.getElementById('chat-send-btn');
    const chatSuggestions = document.getElementById('chat-suggestions');
    const chatbotSystemMessage = "Tu es mon coach en IA. Tu es un expert en prompt ingénierie, tu connais parfaitement comment créer des prompt parfait pour le LLM Mistral 7B";
    // La clé n'est plus embarquée : elle est fournie par l'utilisateur
    // et stockée dans son navigateur (voir js/api-key.js).
    let conversationHistory = [{ role: "system", content: chatbotSystemMessage }];

    function displayChatMessage(message, sender) {
        if (!chatHistory) return; // Vérifier si chatHistory existe
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message', sender === 'user' ? 'user-message' : 'bot-message');
        messageElement.textContent = message;
        chatHistory.appendChild(messageElement);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    async function callChatbotApi(userMessage) {
        if (!chatInput) return;
        const apiKeyChat = window.PromptorApiKey.requireApiKey();
        if (!apiKeyChat) {
            displayChatMessage("Aucune clé API configurée. Le chatbot ne peut pas répondre.", 'bot');
            return;
        }
        displayChatMessage(userMessage, 'user');
        conversationHistory.push({ role: "user", content: userMessage });
        chatInput.value = '';
        displayChatMessage("Réflexion en cours...", 'bot');
        try {
            const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Authorization": `Bearer ${apiKeyChat}`
                },
                body: JSON.stringify({ model: "mistral-tiny", messages: conversationHistory })
            });
            const thinkingMessage = chatHistory?.querySelector(".bot-message:last-child");
            if (thinkingMessage && thinkingMessage.textContent === "Réflexion en cours...") {
                thinkingMessage.remove();
            }
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({message: "Erreur inconnue"}));
                console.error("Erreur API Chatbot:", errorData);
                displayChatMessage(`Erreur: ${errorData.message || response.statusText}`, 'bot');
                return;
            }
            const resultData = await response.json();
            let botReply = "Désolé, je n'ai pas pu obtenir de réponse.";
            if (resultData.choices && resultData.choices.length > 0 && resultData.choices[0].message) {
                 botReply = resultData.choices[0].message.content;
            }
            displayChatMessage(botReply, 'bot');
            conversationHistory.push({ role: "assistant", content: botReply });
        } catch (error) {
             const thinkingMessage = chatHistory?.querySelector(".bot-message:last-child");
             if (thinkingMessage && thinkingMessage.textContent === "Réflexion en cours...") {
                 thinkingMessage.remove();
             }
            console.error("Erreur lors de l'appel API Chatbot:", error);
            displayChatMessage(`Erreur de communication: ${error.message}`, 'bot');
        }
    }

    if (chatbotFab) {
        chatbotFab.addEventListener('click', () => {
            if (chatbotWindow) chatbotWindow.style.display = 'flex';
        });
    }
    if (closeChatbotBtn) {
        closeChatbotBtn.addEventListener('click', () => {
            if (chatbotWindow) chatbotWindow.style.display = 'none';
        });
    }
    if (chatSendBtn) {
        chatSendBtn.addEventListener('click', () => {
            if(chatInput?.value.trim()) callChatbotApi(chatInput.value.trim());
        });
    }
    if (chatInput) {
         chatInput.addEventListener('keypress', (event) => {
             if (event.key === 'Enter' && chatInput.value.trim()) {
                 callChatbotApi(chatInput.value.trim());
             }
         });
    }
    if (chatSuggestions) {
        chatSuggestions.addEventListener('click', (event) => {
            if (event.target.tagName === 'BUTTON') {
                callChatbotApi(event.target.textContent);
            }
        });
    }

    // Afficher la vue initiale du prompt au chargement
    showPromptView();
}); 