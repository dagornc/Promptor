# Promptor

![HTML](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-green)

**Générateur et optimiseur de prompts IA intelligent** — une application web pour explorer, générer et optimiser des prompts pour les modèles de langage (LLM).

## Table des matières

- [Présentation](#présentation)
- [Fonctionnalités](#fonctionnalités)
- [Démo](#démo)
- [Structure du projet](#structure-du-projet)
- [Installation](#installation)
- [Catégories de prompts](#catégories-de-prompts)
- [Contribution](#contribution)
- [Licence](#licence)

## Présentation

Prompteur est une interface web permettant de générer et d'optimiser des prompts structurés pour l'utilisation avec des modèles d'intelligence artificielle (ChatGPT, Claude, Gemini, etc.).

L'application est déployée via **GitHub Pages** et accessible directement dans le navigateur, sans installation requise.

## Fonctionnalités

- **Bibliothèque de prompts** : Plus de 892 lignes de prompts catégorisés et structurés.
- **Génération intelligente** : Création de prompts adaptés à des cas d'usage spécifiques.
- **Optimiseur de prompts** : Amélioration des prompts existants pour de meilleurs résultats.
- **Interface intuitive** : Design clair et responsive accessible sur tous les appareils.
- **Copie en un clic** : Copie instantanée des prompts générés.

## Démo

L'application est accessible en ligne via GitHub Pages :

**[https://dagornc.github.io/Promptor/](https://dagornc.github.io/Promptor/)**

## Clé API

L'application appelle l'API Mistral pour exécuter les prompts et alimenter le
chatbot. **Aucune clé n'est embarquée dans le code** : elle doit être fournie
par l'utilisateur.

Au premier appel, une invite demande la clé. Elle est ensuite stockée dans le
navigateur (`localStorage`, clé `mistral_api_key`) et n'est jamais transmise
ailleurs qu'à `api.mistral.ai`.

Pour obtenir une clé : <https://console.mistral.ai/api-keys>

Pour l'effacer : `localStorage.removeItem('mistral_api_key')` dans la console
du navigateur.

> **Note d'architecture.** Une clé dans du code client n'est jamais un secret :
> elle est publique par construction. Ce dépôt a embarqué une clé en clair
> jusqu'en octobre 2026, ce qui l'exposait à quiconque ouvrait la page. La
> saisie utilisateur supprime cette exposition. Une architecture de production
> déplacerait l'appel côté serveur, avec une clé restreinte par domaine.

## Structure du projet

```
Promptor/
├── css/
│   └── style.css            # Styles globaux de l'application
├── images/                  # Assets visuels
├── js/
│   ├── api-key.js           # Gestion de la clé API (stockage local)
│   ├── app.js               # Thème, sidebar
│   └── script.js            # Logique JavaScript principale
├── Prompts.txt              # Bibliothèque de prompts (892+ lignes)
├── index.html               # Page principale
└── style.css                # Styles supplémentaires
```

## Installation

### Utilisation en ligne

Accédez directement à la version déployée sur [GitHub Pages](https://dagornc.github.io/Promptor/).

### Installation locale

```bash
# Cloner le dépôt
git clone https://github.com/dagornc/Promptor.git
cd Promptor

# Lancer avec un serveur local
python3 -m http.server 8080
# Ou avec Node.js
npx serve .
```

Ouvrez ensuite `http://localhost:8080` dans votre navigateur.

## Catégories de prompts

La bibliothèque `Prompts.txt` inclut des modèles pour :

- **Rédaction** : Articles, guides comparatifs, newsletters
- **Développement** : Code, debugging, revue de code
- **Marketing** : Copywriting, slogans, campagnes
- **Analyse** : Synthèses, rapports, études de marché
- **Education** : Explications, cours, exercices
- **Créativité** : Idéation, storytelling, brainstorming

## Contribution

Les contributions sont les bienvenues ! Pour ajouter de nouveaux prompts ou améliorer l'interface :

1. Forkez le dépôt.
2. Créez une branche (`git checkout -b feature/nouveaux-prompts`).
3. Ajoutez vos modifications.
4. Committez (`git commit -m 'feat: ajouter prompts [catégorie]'`).
5. Ouvrez une Pull Request.

## Licence

Ce projet est sous licence MIT.

---

> Optimisez vos interactions avec les LLMs grâce à des prompts bien structurés.
