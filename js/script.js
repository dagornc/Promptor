// Fichier JavaScript principal 

document.addEventListener('DOMContentLoaded', () => {
    const promptCategories = document.getElementById('prompt-categories');
    const fullPromptTextarea = document.getElementById('full-prompt');
    // const userInputTextarea = document.getElementById('user-input'); // Supprimé
    const runPromptBtn = document.getElementById('run-prompt-btn');
    const promptDisplayDiv = document.querySelector('.prompt-display');
    const resultDisplayDiv = document.querySelector('.result-display');
    const llmResultDiv = document.getElementById('llm-result');

    let currentActivePromptLink = null;

    // Fonction pour afficher la vue du prompt
    function showPromptView() {
        if (resultDisplayDiv) resultDisplayDiv.style.display = 'none';
        if (promptDisplayDiv) promptDisplayDiv.style.display = 'block'; // ou 'grid' si c'était le cas
    }

    // Fonction pour afficher la vue du résultat
    function showResultView() {
        if (promptDisplayDiv) promptDisplayDiv.style.display = 'none';
        if (resultDisplayDiv) resultDisplayDiv.style.display = 'block'; // ou 'grid'
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

}); 