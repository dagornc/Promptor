// Fichier JavaScript principal 

document.addEventListener('DOMContentLoaded', () => {
    const promptCategories = document.getElementById('prompt-categories');
    const fullPromptDiv = document.getElementById('full-prompt');
    const runPromptBtn = document.getElementById('run-prompt-btn');
    const promptDisplayDiv = document.querySelector('.prompt-display');
    const resultDisplayDiv = document.querySelector('.result-display');
    const llmResultDiv = document.getElementById('llm-result');
    const promptLabelLine = document.getElementById('prompt-label-line');
    const resultLabelLine = document.getElementById('result-label-line');

    let currentActivePromptLink = null;

    // Fonction pour parser et styliser le prompt pour l'affichage dans la div
    function parseAndStylePrompt(text) {
        // 1. Remplacer les &#10; par des <br> pour l'affichage HTML
        let styledText = text.replace(/&#10;/g, '<br>');
        // 2. Trouver les [placeholder] et les entourer d'un span stylisé
        styledText = styledText.replace(/(\[.*?\])/g, '<span class="prompt-placeholder">$1</span>');
        return styledText;
    }

    // Fonction pour afficher la vue du prompt
    function showPromptView() {
        if (resultDisplayDiv) resultDisplayDiv.style.display = 'none';
        if (resultLabelLine) resultLabelLine.style.display = 'none'; 

        if (promptDisplayDiv) promptDisplayDiv.style.display = 'block';
        if (promptLabelLine) promptLabelLine.style.display = 'flex'; 
    }

    // Fonction pour afficher la vue du résultat
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
                // Utiliser innerHTML avec le texte parsé pour la div
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

                // console.log(`Prompt sélectionné (brut): ${selectedPromptText}`);
            }
        });
    }

    // --- Logique pour le bouton "Exécuter le Prompt" ---
    if (runPromptBtn && fullPromptDiv) { // S'assurer que fullPromptDiv existe
        runPromptBtn.addEventListener('click', async () => {
            if (runPromptBtn.textContent === 'Modifier le prompt') {
                showPromptView();
                // Rendre la div éditable (elle l'est déjà par défaut avec contenteditable=true)
                // fullPromptDiv.focus(); // Mettre le focus si souhaité
                runPromptBtn.textContent = 'Exécuter le Prompt';
                return; 
            }

            // Lire le contenu textuel de la div pour l'API
            const fullPrompt = fullPromptDiv.textContent || ''; 
            const apiKey = "76cwpvjZqnFw1U0jLCEBKOHh5FprX2OJ"; 

            if (!fullPrompt.trim()) { // Vérifier si le contenu textuel est vide
                alert("Veuillez d'abord sélectionner ou écrire un prompt.");
                return;
            }
            if (!apiKey) {
                alert("Erreur: Clé API manquante."); 
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
                         messages: [
                             {
                                 role: "user",
                                 content: fullPrompt // Utiliser le textContent de la div
                             }
                         ],
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

    // La fonction generateLoremIpsum n'est plus nécessaire pour le résultat réel, mais peut être gardée pour d'autres tests si besoin.
    function generateLoremIpsum(wordCount) {
        const words = ["lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit", "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore", "magna", "aliqua"];
        let text = "";
        for (let i = 0; i < wordCount; i++) {
            text += words[Math.floor(Math.random() * words.length)] + " ";
        }
        return text.trim() + ".";
    }

    // Afficher la vue initiale du prompt au chargement
    showPromptView();

    // --- Logique pour les boutons/spans de copie --- 
    const copyPromptBtn = document.getElementById('copy-prompt-btn');
    const copyResultBtn = document.getElementById('copy-result-btn');
    const resultDiv = document.getElementById('llm-result'); 

    if (copyPromptBtn && fullPromptDiv) { // Utiliser fullPromptDiv
        copyPromptBtn.addEventListener('click', () => {
            // Copier le contenu textuel de la div
            copyToClipboard(fullPromptDiv.textContent || '', copyPromptBtn); 
        });
    }

    if (copyResultBtn && resultDiv) {
        copyResultBtn.addEventListener('click', () => {
            copyToClipboard(resultDiv.textContent || '', copyResultBtn); 
        });
    }

    // Fonction générique pour copier dans le presse-papiers (devrait déjà exister)
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
            }, 1500); 
        }).catch(err => {
            console.error('Erreur lors de la copie: ', err);
            buttonElement.classList.add('copy-error'); 
             setTimeout(() => {
                buttonElement.classList.remove('copy-error'); 
            }, 1500);
        });
    }

    // --- Logique Chatbot --- 
    const chatbotFab = document.getElementById('chatbot-fab');
    const chatbotWindow = document.getElementById('chatbot-window');
    const closeChatbotBtn = document.getElementById('close-chatbot-btn');
    const chatHistory = document.getElementById('chat-history');
    const chatInput = document.getElementById('chat-input');
    const chatSendBtn = document.getElementById('chat-send-btn');
    const chatSuggestions = document.getElementById('chat-suggestions');
    const chatbotSystemMessage = "Tu es mon coach en IA. Tu es un expert en prompt ingénierie, tu connais parfaitement comment créer des prompt parfait pour le LLM Mistral 7B";
    const apiKey = "76cwpvjZqnFw1U0jLCEBKOHh5FprX2OJ"; // !!! Même clé API que pour les prompts - A SÉCURISER IDÉALEMENT !!!
    let conversationHistory = [{ role: "system", content: chatbotSystemMessage }]; // Initialise avec le message système

    // Fonction pour afficher un message dans le chat
    function displayChatMessage(message, sender) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message', sender === 'user' ? 'user-message' : 'bot-message');
        messageElement.textContent = message;
        chatHistory.appendChild(messageElement);
        // Scroll vers le bas pour voir le dernier message
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    // Fonction pour appeler l'API Mistral pour le chatbot
    async function callChatbotApi(userMessage) {
        displayChatMessage(userMessage, 'user'); // Affiche le message utilisateur
        conversationHistory.push({ role: "user", content: userMessage });
        chatInput.value = ''; // Vide l'input
        displayChatMessage("Réflexion en cours...", 'bot'); // Message d'attente

        try {
            const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: "mistral-tiny", // Ou un autre modèle si nécessaire
                    messages: conversationHistory // Envoie tout l'historique
                })
            });

            // Supprime le message "Réflexion en cours..."
            const thinkingMessage = chatHistory.querySelector(".bot-message:last-child");
            if (thinkingMessage && thinkingMessage.textContent === "Réflexion en cours...") {
                thinkingMessage.remove();
            }

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Erreur API Chatbot:", errorData);
                displayChatMessage(`Erreur: ${errorData.message || response.statusText}`, 'bot');
                // Ne pas ajouter le message d'erreur à l'historique pour l'API
                return;
            }

            const resultData = await response.json();
            let botReply = "Désolé, je n'ai pas pu obtenir de réponse."; // Default

            if (resultData.choices && resultData.choices.length > 0 && resultData.choices[0].message) {
                 botReply = resultData.choices[0].message.content;
            } else {
                 console.warn("Format de réponse chatbot inattendu:", resultData);
            }

            displayChatMessage(botReply, 'bot');
            conversationHistory.push({ role: "assistant", content: botReply }); // Ajoute la réponse du bot à l'historique

        } catch (error) {
             // Supprime le message "Réflexion en cours..." en cas d'erreur réseau aussi
             const thinkingMessage = chatHistory.querySelector(".bot-message:last-child");
             if (thinkingMessage && thinkingMessage.textContent === "Réflexion en cours...") {
                 thinkingMessage.remove();
             }
            console.error("Erreur lors de l'appel API Chatbot:", error);
            displayChatMessage(`Erreur de communication: ${error.message}`, 'bot');
            // Ne pas ajouter ce message d'erreur à l'historique pour l'API
        }
    }

    // Gérer l'ouverture/fermeture du chat
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

    // Gérer l'envoi de message
    if (chatSendBtn) {
        chatSendBtn.addEventListener('click', () => {
            const userMessage = chatInput.value.trim();
            if (userMessage) {
                callChatbotApi(userMessage);
            }
        });
    }
    if (chatInput) {
         chatInput.addEventListener('keypress', (event) => {
             if (event.key === 'Enter') {
                 const userMessage = chatInput.value.trim();
                 if (userMessage) {
                     callChatbotApi(userMessage);
                 }
             }
         });
    }

    // Gérer les clics sur les suggestions
    if (chatSuggestions) {
        chatSuggestions.addEventListener('click', (event) => {
            if (event.target.tagName === 'BUTTON') {
                const suggestionText = event.target.textContent;
                callChatbotApi(suggestionText);
            }
        });
    }
}); 