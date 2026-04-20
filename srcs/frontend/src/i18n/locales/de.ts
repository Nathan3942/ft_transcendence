import type { TranslationDict } from "../i18n";

const de: TranslationDict = {
	nav: {
		profile: "Profil",
		settings: "Einstellungen",
		logout: "Abmelden",
		leaderboard: "Rangliste",
		login: "Anmelden",

		friends: {
			add: "Freund hinzufügen",
			online: "Online-Freunde",
			offline: "Offline-Freunde",
			requests: "Freundschaftsanfragen",
			idPlaceholder: "Freund-ID",
			requestSent: "Freundschaftsanfrage erfolgreich gesendet an ",
			notFound: "Fehler 404: Der Benutzer, den Sie befreunden möchten, wurde nicht gefunden",
			errorNoRights: "Fehler: Sie haben keine Berechtigung, diese Freundschaft zu beenden",
			errorNotFriends: "Fehler: Sie sind nicht befreundet mit ",
			errorInvalidAction: "Fehler: Ungültige Aktion",
			errorNoPermission: "Fehler: Sie haben keine Berechtigung",
			errorUserNotFound: "Fehler: Der angeforderte Benutzer wurde nicht gefunden",
			errorUnexpected: "Unerwarteter Fehler: ",
			removeFriend: "Freund entfernen",
			errorNoLocalId: "Ihre Benutzer-ID konnte nicht gefunden werden. Bitte laden Sie die Seite neu und versuchen Sie es erneut"
		}
	},

	settings: {
		title: "Benutzereinstellungen",
		avatar: "Avatar",
		avatarMessage: "Klicken Sie auf das Bild, um einen neuen Avatar hochzuladen",
		profileInfo: "Profilinformationen",
		username: "Benutzername",
		email: "E-Mail",
		saveChanges: "Änderungen speichern",
		changePassword: "Passwort ändern",
		currentPassword: "Aktuelles Passwort",
		newPassword: "Neues Passwort",
		updatePassword: "Passwort aktualisieren",
		confirmPassword: "Neues Passwort bestätigen",
		language: "Sprache",
		dangerZone: "Gefahrenzone",
		deleteAccount: "Konto löschen",
		deleteAccountButton: "Konto löschen?",
		deleteAccountConfirmation1: "Sind Sie sicher, dass Sie Ihr Konto löschen möchten?",
		deleteAccountConfirmation2: "Diese Aktion ist unwiderruflich!!",
		deleteAccountConfirmed: "Ich bin sicher, mein Konto löschen",
		usernamePlaceholder: "Max Mustermann",
		emailPlaceholder: "max.mustermann@beispiel.de",
		notAllowed: "Sie sind nicht berechtigt, diese Aktion durchzuführen. Falls Sie glauben, dass dies ein Fehler ist, leeren Sie den Cache mit 'Strg + Umschalt + R' und melden Sie sich erneut an",
		userNotFound: "Der angeforderte Benutzer wurde nicht gefunden",
		infoUpdated: "Informationen erfolgreich aktualisiert",
		avatarUpdated: "Avatar erfolgreich aktualisiert",
		noNewValues: "Sie haben keine neuen Werte eingegeben",
		errorInvalidFields: "Ungültige Felder",
		errorForbidden: "Sie haben keine Berechtigung, diese Daten zu ändern",
		errorTargetNotFound: "Der angegebene Benutzer existiert nicht",
		errorUnexpected: "Unerwarteter Fehler",
		errorDeleteFailed: "Fehler beim Löschen des Kontos",
		passwordUpdated: "Passwort erfolgreich aktualisiert",
		passwordNoMatch: "Passwörter stimmen nicht überein",
		errorCurrentPassIncorrect: "Das aktuelle Passwort ist falsch"
	},

	errors: {
		pageNotFound: "Seite nicht gefunden"
	},

	home: {
		localPlay: "Lokal spielen",
		onlinePlay: "Online spielen",
		leaderboard: "Rangliste",
		about: "Über uns",
	},

	login: {
		title: "Anmelden",
		emailPlaceholder: "E-Mail",
		passwordPlaceholder: "Passwort",
		loginButton: "Anmelden",
		noAccount: "Noch kein Konto?",
		registerLink: "Registrieren.",
		registerTitle: "Registrieren",
		usernamePlaceholder: "Benutzername",
		confirmPasswordPlaceholder: "Passwort bestätigen",
		registerButton: "Registrieren",
		alreadyAccount: "Bereits ein Konto?",
		loginLink: "Anmelden."
	},

	leaderboard: {
		rank: "#",
		userName: "Benutzername",
		wins: "Siege",
		losses: "Niederlagen",
		totalMatches: "Gesamtspiele",
		winrate: "Siegrate",
		errorLoading: "Fehler beim Laden der Rangliste",
		errorRequest: "Anfragefehler",
		errorNetwork: "Netzwerkfehler",
		errorUnexpectedPayload: "Unerwartete Daten, ein Array wurde erwartet"
	},

	browse: {
		browseMatch: "Spiele durchsuchen",
		browseTournaments: "Turniere durchsuchen"
	},

	onlineMode: {
		threePlayers: "3 Spieler",
		fourPlayers: "4 Spieler"
	},

	browseGames: {
		title: "Spiele durchsuchen",
		loading: "Spiele werden geladen...",
		empty: "Noch keine Spiele. Erstellen Sie eines!",
		join: "Beitreten",
		status: "Status",
		mode: "Modus",
		matchCount: "Spiel(e)",
		matchFinished: "beendet",
		deleteConfirm: "Spiel löschen",
		deleteFailed: "Löschen fehlgeschlagen",
		error: "Fehler"
	},

	browseTournaments: {
		title: "Turniere durchsuchen",
		loading: "Turniere werden geladen...",
		empty: "Noch kein Turnier. Erstellen Sie eines!",
		open: "Offen",
		status: "Status",
		winner: "Gewinner",
		created: "Erstellt",
		tournamentCount: "Turnier(e)",
		deleteConfirm: "Turnier löschen",
		deleteFailed: "Löschen fehlgeschlagen",
		deleteNotImplemented: "Turnier-Lösch-API noch nicht implementiert.",
		error: "Fehler"
	},

	common: {
		back: "Zurück",
		delete: "Löschen",
		match: "Spiel"
	},

	profile: {
		userStats: "Benutzerstatistiken",
		totalMatches: "Gesamtspiele",
		tournamentsWon: "Gewonnene Turniere",
		matchHistory: "Spielverlauf",
		matchId: "Spiel-ID",
		opponent: "Gegner",
		score: "Punkte",
		result: "Ergebnis",
		date: "Datum",
		wins: "Siege",
		losses: "Niederlagen",
		online: "Online",
		offline: "Offline",
		win: "Sieg",
		loss: "Niederlage",
		userNotFound: "Benutzer nicht gefunden",
		profilePicture: "Profilbild",
		errorNoIdStats: "Fehler: Keine Benutzer-ID gefunden, Statistiken können nicht geladen werden...",
		errorNoIdHistory: "Fehler: Keine Benutzer-ID gefunden, Spielverlauf kann nicht geladen werden...",
		errorFetchStats: "Fehler: Benutzerstatistiken konnten nicht geladen werden: ",
		errorFetchHistory: "Fehler: Spielverlauf konnte nicht geladen werden: ",
		errorInvalidId: "Ungültige Benutzer-ID",
		errorNotAuthenticated: "Nicht authentifiziert",
		errorUnexpected: "Unerwarteter Fehler",
		recentForm: "Aktuelle Form",
		noRecentMatches: "Noch keine Spiele gespielt",
		unknownDate: "Unbekanntes Datum"
	},

	gameLocal: {
		playerVsAi: "Spieler vs. KI",
		playerVsPlayer: "Spieler vs. Spieler",
		localTournament: "Lokales Turnier"
	},

	gameOnline: {
		createMatch: "Spiel erstellen",
		createTournament: "Turnier erstellen",
		browseGames: "Spiele durchsuchen"
	},

	ingameMsg: {
		ended: "Beendet...",
		start: "Drücken Sie START",
		pause: "PAUSE",
		player: "SPIELER ",
		wins: " GEWINNT!",
		restart: "Drücken Sie START, um neu zu starten"
	},

	about: {
		title: "ÜBER UNS",
		projectDescription: "ft_transcendence ist das Abschlussprojekt des 42-Common-Core. Wir haben von Grund auf eine Echtzeit-Multiplayer-Pong-Plattform gebaut — Full-Stack, mit Docker containerisiert, durchgehend gesichert, mit Funktionen wie Live-Turnieren, Freundschaftssystem und Spielverlauf. Alles in reinem TypeScript und Tailwind CSS!",
		frontendRole: "Frontend",
		frontendBio: "Hat fast alles gestaltet, was Sie sehen können — von Seitenlayouts über Styling bis hin zu subtilen Effekten, die Sie vielleicht nie bemerken.",
		backendRole: "Backend",
		backendBio: "Hat die Logik im Hintergrund entwickelt und kümmert sich um alles von API, Datenbank, Authentifizierung bis hin zur Sicherheit.",
		gameRole: "Spiel",
		gameBio: "Hat das Spiel entwickelt, die KI-Gegner trainiert und diese Website von einer statischen Seite in etwas verwandelt, das man wirklich spielen kann!"
	},

	gameLocalAi: {
		easy: "Einfach",
		medium: "Mittel",
		hard: "Schwer"
	},

	loginErrors: {
		emailEmpty: "E-Mail-Feld ist leer",
		passwordEmpty: "Passwortfeld ist leer",
		usernameEmpty: "Benutzername-Feld ist leer",
		passwordsMismatch: "Passwörter stimmen nicht überein",
		invalidCredentials: "Ungültige Anmeldedaten",
		missingFields: "Fehlende Felder oder Passwort zu kurz (mind. 8 Zeichen)",
		usernameEmailTaken: "Benutzername oder E-Mail bereits vergeben",
		loginFailed: "Anmeldung fehlgeschlagen",
		registrationFailed: "Registrierung fehlgeschlagen",
		unexpectedError: "Unerwarteter Fehler"
	},

	onlineMatch: {
		connecting: "Verbindung wird hergestellt...",
		canvasError: "Canvas-Fehler (kein 2D-Kontext)",
		joiningMatch: "Verbunden. Spiel wird beigetreten...",
		noMatchId: "Keine Spiel-ID (zuerst ein Spiel erstellen).",
		waiting: "warten",
		starting: "startet...",
		pausedBy: "Pausiert von",
		pausedPlayer: "Pausiert (Spieler",
		playerDisconnected: "getrennt)",
		resumed: "Spiel fortgesetzt",
		matchFull: "Spiel voll",
		winner: "Gewinner",
		wsError: "Verbindungsfehler",
		wsClosed: "Verbindung getrennt",
		matchDeleted: "Spiel gelöscht"
	},

	onlineTournament: {
		quarterFinals: "Viertelfinale",
		semiFinals: "Halbfinale",
		final: "Finale",
		tbd: "Noch offen",
		winner: "Gewinner",
		finished: "beendet",
		noMatch: "Noch kein Spiel für Sie",
		goToMatch: "Zu meinem Spiel",
		joiningTournament: "Verbunden. Turnier wird beigetreten...",
		noTournamentId: "Keine Turnier-ID (zuerst ein Turnier erstellen).",
		waiting: "warten",
		started: "gestartet",
		tournamentFinished: "Turnier beendet!",
		tournamentFull: "voll",
		rejoin: "erneut beitreten"
	},

	tournamentLocal: {
		chooseAiDifficulty: "KI-Schwierigkeit wählen",
		champion: "Champion",
		enterPlayerNames: "Spielernamen eingeben",
		playerNamePlaceholder: "Spielername",
		continue: "Weiter",
		playNextMatch: "Nächstes Spiel spielen",
		restartTournament: "Turnier neu starten",
		quarterFinals: "Viertelfinale",
		semiFinals: "Halbfinale",
		final: "Finale",
		match: "Spiel",
		semi: "Halb",
		bot: "Bot"
	}
};

export default de;
