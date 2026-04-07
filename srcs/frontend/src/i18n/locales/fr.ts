import type { TranslationDict } from "../i18n";

const fr: TranslationDict = {
	nav: {
		profile: "Profil",
		settings: "Paramètres",
		logout: "Déconnexion",
		leaderboard: "Classement",
		login: "Connexion",

		friends: {
			add: "Ajouter un ami",
			online: "Amis en ligne",
			offline: "Amis hors ligne",
			requests: "Demandes d'amis",
			idPlaceholder: "ID de l'ami",
			requestSent: "Demande d'ami envoyée avec succès à ",
			notFound: "Erreur 404 : L'utilisateur que vous essayez d'ajouter est introuvable",
			errorNoRights: "Erreur : Vous n'avez pas le droit de mettre fin à cette amitié",
			errorNotFriends: "Erreur : Vous n'êtes pas ami avec ",
			errorInvalidAction: "Erreur : Action invalide",
			errorNoPermission: "Erreur : Vous n'avez pas la permission",
			errorUserNotFound: "Erreur : L'utilisateur demandé est introuvable",
			errorUnexpected: "Erreur inattendue : ",
			removeFriend: "Retirer l'ami"
		}
	},

	settings: {
		title: "Paramètres Utilisateur",
		avatar: "Avatar",
		avatarMessage: "Cliquez sur l'image pour choisir un nouvel avatar.",
		profileInfo: "Informations de profil",
		username: "Nom d'utilisateur",
		email: "Email",
		saveChanges: "Enregistrer les Modifications",
		changePassword: "Modifier le mot de passe",
		currentPassword: "Mot de passe actuel",
		newPassword: "Nouveau mot de passe",
		updatePassword: "Modifier le mot de passe",
		confirmPassword: "Confirmer le nouveau mot de passe",
		language: "Langue",
		dangerZone: "Zone dangereuse",
		deleteAccount: "Supprimer le compte",
		deleteAccountButton: "Supprimer le compte ?",
		deleteAccountConfirmation1: "Êtes-vous sûr de vouloir supprimer votre compte ?",
		deleteAccountConfirmation2: "Cette opération est irréversible !!",
		deleteAccountConfirmed: "Je suis sûr, supprimez mon compte",
		usernamePlaceholder: "Jean Dupont",
		emailPlaceholder: "jean.dupont@example.com",
		notAllowed: "Vous n'êtes pas autorisé à effectuer cette action. Si vous pensez qu'il s'agit d'une erreur, videz le cache avec 'ctrl + shift + r' et reconnectez-vous",
		userNotFound: "L'utilisateur demandé est introuvable",
		infoUpdated: "Informations mises à jour avec succès",
		avatarUpdated: "Avatar mis à jour avec succès",
		noNewValues: "Vous n'avez pas entré de nouvelles valeurs"
	},

	errors: {
		pageNotFound: "Page Introuvable"
	},

	home: {
		localPlay: "Jeu Local",
		onlinePlay: "Jeu En-Ligne",
		leaderboard: "Classements",
		about: "À propos"
	},

	login: {
		title: "Connexion",
		emailPlaceholder: "Email",
		passwordPlaceholder: "Mot de passe",
		loginButton: "Connexion",
		noAccount: "Pas encore de compte ?",
		registerLink: "S'inscrire.",
		registerTitle: "Inscription",
		usernamePlaceholder: "Nom d'utilisateur",
		confirmPasswordPlaceholder: "Confirmer le mot de passe",
		registerButton: "S'inscrire",
		alreadyAccount: "Déjà un compte ?",
		loginLink: "Se connecter."
	},

	leaderboard: {
		rank: "#",
		userName: "Nom d'utilisateur",
		wins: "Victoires",
		losses: "Défaites",
		totalMatches: "Matchs Totaux",
		winrate: "Taux de Victoire"
	},

	browse: {
		browseMatch: "Parcourir les Matchs",
		browseTournaments: "Parcourir les Tournois"
	},

	onlineMode: {
		threePlayers: "3 Joueurs",
		fourPlayers: "4 Joueurs"
	},

	browseGames: {
		title: "Parcourir les Matchs",
		loading: "Chargement des matchs...",
		empty: "Aucun match pour l'instant. Créez-en un !",
		join: "Rejoindre"
	},

	browseTournaments: {
		title: "Parcourir les Tournois",
		loading: "Chargement des tournois...",
		empty: "Aucun tournoi pour l'instant. Créez-en un !",
		open: "Ouvrir"
	},

	common: {
		back: "Retour",
		delete: "Supprimer"
	},

	profile: {
		userStats: "Statistiques",
		totalMatches: "Matchs Totaux",
		tournamentsWon: "Tournois Gagnés",
		matchHistory: "Historique des Matchs",
		matchId: "ID du Match",
		opponent: "Adversaire",
		score: "Score",
		result: "Résultat",
		date: "Date",
		wins: "Victoires",
		losses: "Défaites",
		online: "En ligne",
		offline: "Hors ligne",
		win: "Victoire",
		loss: "Défaite",
		userNotFound: "Utilisateur introuvable",
		profilePicture: "Photo de profil",
		errorNoIdStats: "Erreur : Aucun identifiant trouvé, impossible de charger les statistiques...",
		errorNoIdHistory: "Erreur : Aucun identifiant trouvé, impossible de charger l'historique des matchs...",
		errorFetchStats: "Erreur : Impossible de charger les statistiques : ",
		errorFetchHistory: "Erreur : Impossible de charger l'historique des matchs : "
	},

	gameLocal: {
		playerVsAi: "Joueur vs IA",
		playerVsPlayer: "Joueur vs Joueur",
		localTournament: "Tournoi Local"
	},

	gameOnline: {
		createMatch: "Créer un Match",
		createTournament: "Créer un Tournoi",
		browseGames: "Parcourir les Matchs"
	},

	about: {
		title: "À PROPOS",
		projectDescription: "ft_transcendence est le projet final du Tronc Commun de 42. Nous avons construit de zéro une plateforme Pong multijoueur en temps réel — full-stack, containerisée avec Docker, sécurisée de bout en bout, avec des fonctionnalités comme les tournois en direct, le système d'amis, et l'historique des matchs. Le tout en TypeScript pur et Tailwind CSS !",
		frontendRole: "Frontend",
		frontendBio: "A réalisé presque tout ce que vous pouvez voir, des mises en page aux effets subtils que vous ne remarquerez peut-être jamais.",
		backendRole: "Backend",
		backendBio: "A conçu la mécanique en coulisses, gère tout ce qui concerne l'API, la base de données, l'authentification et la sécurité.",
		gameRole: "Jeu",
		gameBio: "A développé le jeu, entraîné les IA adverses, et transformé ce site en quelque chose que vous pouvez vraiment jouer !"
	},

	gameLocalAi: {
		easy: "Facile",
		medium: "Moyen",
		hard: "Difficile"
	},

	loginErrors: {
		emailEmpty: "Le champ email est vide",
		passwordEmpty: "Le champ mot de passe est vide",
		usernameEmpty: "Le champ nom d'utilisateur est vide",
		passwordsMismatch: "Les mots de passe ne correspondent pas",
		invalidCredentials: "Identifiants invalides",
		missingFields: "Champ(s) manquant(s) ou mot de passe trop court (min. 8 caractères)",
		usernameEmailTaken: "Nom d'utilisateur ou email déjà utilisé",
		loginFailed: "Échec de la connexion",
		registrationFailed: "Échec de l'inscription"
	}
};

export default fr;
