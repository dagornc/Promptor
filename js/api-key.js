/**
 * Gestion de la clé API Mistral — stockage local, jamais dans le code.
 *
 * POURQUOI CE MODULE EXISTE
 *
 * La version précédente embarquait une clé API Mistral en clair dans
 * `js/script.js`. Le dépôt est public et la démo GitHub Pages est en ligne :
 * la clé était donc lisible par quiconque ouvrait la page, et servie pendant
 * ~18 mois. Une clé dans du code client n'est jamais un secret — elle est
 * publique par construction.
 *
 * Ce module remplace la clé en dur par une saisie utilisateur, stockée
 * uniquement dans le navigateur de l'utilisateur (`localStorage`). Aucune clé
 * n'est versionnée dans le dépôt.
 *
 * LIMITE ASSUMÉE : la clé reste exposée au réseau (elle part dans l'en-tête
 * `Authorization` de la requête vers api.mistral.ai) et au navigateur. C'est
 * acceptable pour un usage personnel. Une architecture de production
 * déplacerait l'appel côté serveur, avec une clé restreinte par domaine.
 *
 * Ce fichier est chargé comme script classique (pas de module ES) : il expose
 * son API sur `window.PromptorApiKey`.
 */
(function () {
    'use strict';

    var STORAGE_KEY = 'mistral_api_key';

    /** Lit la clé stockée. Retourne une chaîne vide si absente. */
    function getApiKey() {
        try {
            return localStorage.getItem(STORAGE_KEY) || '';
        } catch (e) {
            // localStorage indisponible (navigation privée stricte, cookies bloqués)
            return '';
        }
    }

    /** Enregistre la clé. Une chaîne vide efface l'entrée. */
    function setApiKey(key) {
        try {
            var clean = (key || '').trim();
            if (clean) {
                localStorage.setItem(STORAGE_KEY, clean);
            } else {
                localStorage.removeItem(STORAGE_KEY);
            }
            return true;
        } catch (e) {
            return false;
        }
    }

    /** Indique si une clé est configurée, sans révéler sa valeur. */
    function hasApiKey() {
        return getApiKey().length > 0;
    }

    /** Supprime la clé stockée. */
    function clearApiKey() {
        return setApiKey('');
    }

    /**
     * Demande la clé à l'utilisateur si elle n'est pas configurée.
     * Retourne la clé, ou une chaîne vide si l'utilisateur annule.
     */
    function requireApiKey() {
        var existing = getApiKey();
        if (existing) return existing;

        var entered = window.prompt(
            "Clé API Mistral requise.\n\n" +
            "Cette application n'embarque plus de clé : elle doit être fournie par " +
            "l'utilisateur et reste stockée dans votre navigateur uniquement.\n\n" +
            "Obtenir une clé : https://console.mistral.ai/api-keys\n\n" +
            "Collez votre clé ci-dessous :"
        );

        if (entered && entered.trim()) {
            setApiKey(entered);
            return getApiKey();
        }
        return '';
    }

    window.PromptorApiKey = {
        getApiKey: getApiKey,
        setApiKey: setApiKey,
        hasApiKey: hasApiKey,
        clearApiKey: clearApiKey,
        requireApiKey: requireApiKey
    };
})();
