// Fichier JavaScript principal 

document.addEventListener('DOMContentLoaded', () => {
    const promptCategories = document.getElementById('prompt-categories');
    const fullPromptTextarea = document.getElementById('full-prompt');
    // const userInputTextarea = document.getElementById('user-input'); // Supprimé
    const runPromptBtn = document.getElementById('run-prompt-btn');
    const promptDisplayDiv = document.querySelector('.prompt-display');
    const resultDisplayDiv = document.querySelector('.result-display');
    const llmResultDiv = document.getElementById('llm-result');
    // Ajout des références aux lignes de label
    const promptLabelLine = document.getElementById('prompt-label-line');
    const resultLabelLine = document.getElementById('result-label-line');

    let currentActivePromptLink = null;

    // Fonction pour afficher la vue du prompt
    function showPromptView() {
        if (resultDisplayDiv) resultDisplayDiv.style.display = 'none';
        if (resultLabelLine) resultLabelLine.style.display = 'none'; // Cacher le label résultat

        if (promptDisplayDiv) promptDisplayDiv.style.display = 'block';
        if (promptLabelLine) promptLabelLine.style.display = 'flex'; // Afficher le label prompt (utiliser 'flex' car défini en CSS)
    }

    // Fonction pour afficher la vue du résultat
    function showResultView() {
        if (promptDisplayDiv) promptDisplayDiv.style.display = 'none';
        if (promptLabelLine) promptLabelLine.style.display = 'none'; // Cacher le label prompt

        if (resultDisplayDiv) resultDisplayDiv.style.display = 'block'; 
        if (resultLabelLine) resultLabelLine.style.display = 'flex'; // Afficher le label résultat (utiliser 'flex')
    }

    if (promptCategories) {
        promptCategories.addEventListener('click', (event) => {
            // Vérifier si l'élément cliqué est bien un lien de prompt (<a>)
            if (event.target.tagName === 'A' && event.target.dataset.prompt) {
                event.preventDefault(); // Empêcher le comportement par défaut du lien

                const selectedPromptText = event.target.dataset.prompt;
                fullPromptTextarea.value = selectedPromptText;

                // Gérer le style actif
                if (currentActivePromptLink) {
                    currentActivePromptLink.classList.remove('active');
                }
                event.target.classList.add('active');
                currentActivePromptLink = event.target;

                // Revenir à la vue du prompt et réinitialiser le bouton
                showPromptView();
                if(runPromptBtn) runPromptBtn.textContent = 'Exécuter le Prompt';

                console.log(`Prompt sélectionné: ${selectedPromptText}`);
            }
        });
    }

    // --- Logique pour le bouton "Exécuter le Prompt" ---
    if (runPromptBtn) {
        runPromptBtn.addEventListener('click', async () => { // Utiliser async pour await

            // Comportement différent selon le texte du bouton
            if (runPromptBtn.textContent === 'Modifier le prompt') {
                showPromptView();
                runPromptBtn.textContent = 'Exécuter le Prompt';
                return; // Ne pas exécuter l'appel API
            }

            // Si le texte est "Exécuter le Prompt"
            const fullPrompt = fullPromptTextarea.value;
            const apiKey = "76cwpvjZqnFw1U0jLCEBKOHh5FprX2OJ"; // !!! CLÉ API EXPOSÉE !!!

            if (!fullPrompt) {
                alert("Veuillez d'abord sélectionner un prompt dans le menu.");
                return;
            }
            if (!apiKey) {
                alert("Erreur: Clé API manquante."); // Sécurité basique
                return;
            }


            // Afficher l'état de chargement
            const originalButtonText = runPromptBtn.textContent;
            runPromptBtn.textContent = 'Exécution en cours...';
            runPromptBtn.disabled = true;
            if (llmResultDiv) llmResultDiv.textContent = 'Chargement...'; // Indiquer le chargement
             showResultView(); // Afficher la zone résultat pendant le chargement


            try {
                // --- Appel réel à l'API Mistral ---
                const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${apiKey}` // La clé API est ici
                    },
                    body: JSON.stringify({
                         model: "mistral-small-latest", // Vous pouvez changer ce modèle si besoin (ex: mistral-7b-instruct-v0.2 si disponible)
                         messages: [
                             {
                                 role: "user",
                                 content: fullPrompt
                             }
                         ],
                         temperature: 0.7,
                         max_tokens: 32000, // Positionné à 32000
                         stream: false // On attend la réponse complète
                    })
                });

                if (!response.ok) {
                    // Gérer les erreurs HTTP (ex: 4xx, 5xx) venant de l'API Mistral
                    const errorData = await response.json().catch(() => ({ message: `Erreur HTTP ${response.status}` })); // Tenter de lire le JSON d'erreur
                    throw new Error(errorData.message || `Erreur API Mistral: ${response.status}`);
                }

                const resultData = await response.json();

                // Afficher le résultat reçu de Mistral
                if (llmResultDiv) {
                    if (resultData.choices && resultData.choices.length > 0 && resultData.choices[0].message) {
                         llmResultDiv.textContent = resultData.choices[0].message.content;
                    } else {
                         llmResultDiv.textContent = "Réponse reçue mais format inattendu.";
                         console.warn("Format de réponse inattendu:", resultData);
                    }
                }
               // showResultView(); // Déjà fait avant le try

            } catch (error) {
                // Gérer les erreurs réseau ou les erreurs levées
                console.error("Erreur lors de l'appel API Mistral:", error);
                alert(`Une erreur est survenue lors de l'appel à Mistral: ${error.message}`);
                if (llmResultDiv) {
                    llmResultDiv.textContent = `Erreur: ${error.message}`;
                }
               // showResultView(); // Déjà fait avant le try
            } finally {
                // Rétablir le bouton ET changer son texte dans tous les cas (succès ou erreur)
                runPromptBtn.textContent = 'Modifier le prompt'; // Nouveau texte
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
    const promptTextarea = document.getElementById('full-prompt'); // Cible la textarea pour le prompt
    const resultDiv = document.getElementById('llm-result'); // Cible la div de résultat par son ID

    if (copyPromptBtn && promptTextarea) {
        copyPromptBtn.addEventListener('click', () => {
            copyToClipboard(promptTextarea.value, copyPromptBtn);
        });
    }

    if (copyResultBtn && resultDiv) {
        copyResultBtn.addEventListener('click', () => {
            // Utiliser textContent pour obtenir le texte brut de la div
            copyToClipboard(resultDiv.textContent || '', copyResultBtn); 
        });
    }

    // Fonction générique pour copier dans le presse-papiers (devrait déjà exister)
    function copyToClipboard(text, buttonElement) {
        if (!text) {
             console.warn("Tentative de copie de texte vide.");
             // Optionnel : retour visuel pour indiquer qu'il n'y a rien à copier
             buttonElement.classList.add('copy-error');
             setTimeout(() => {
                 buttonElement.classList.remove('copy-error');
             }, 1000);
             return; // Ne rien faire si le texte est vide
        }
        
        navigator.clipboard.writeText(text).then(() => {
            // Succès de la copie
            buttonElement.classList.add('copied'); // Ajoute la classe pour le style

            // Réinitialise le style après un court délai
            setTimeout(() => {
                buttonElement.classList.remove('copied');
            }, 1500); // 1.5 secondes
        }).catch(err => {
            console.error('Erreur lors de la copie: ', err);
            // Gérer l'erreur visuellement
            buttonElement.classList.add('copy-error'); // Ajout d'une classe pour l'erreur
             setTimeout(() => {
                buttonElement.classList.remove('copy-error'); // Retire la classe d'erreur
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