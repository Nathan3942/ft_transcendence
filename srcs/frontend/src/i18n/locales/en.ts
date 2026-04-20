import type { TranslationDict } from "../i18n";

const en: TranslationDict = {
	nav: {
		profile: "Profile",
		settings: "Settings",
		logout: "Logout",
		leaderboard: "Leaderboard",
		login: "Login",

		friends: {
			add: "Add Friend",
			online: "Online Friends",
			offline: "Offline Friends",
			requests: "Friend Requests",
			idPlaceholder: "Friend ID",
			requestSent: "Successfully sent a friend request to ",
			notFound: "Error 404: The user you are trying to friend cannot be found",
			errorNoRights: "Error: You do not have the rights to terminate this friendship",
			errorNotFriends: "Error: You are not friends with ",
			errorInvalidAction: "Error: Invalid action performed",
			errorNoPermission: "Error: You do not have permission",
			errorUserNotFound: "Error: The requested user was not found",
			errorUnexpected: "Error: Unexpected error: ",
			removeFriend: "Remove friend",
			errorNoLocalId: "Could not find your user ID, please refresh the page and try again"
		}
	},

	settings: {
		title: "User Settings",
		avatar: "Avatar",
		avatarMessage: "Click the picture to upload a new avatar",
		profileInfo: "Profile Info",
		username: "Username",
		email: "Email",
		saveChanges: "Save Changes",
		changePassword: "Change Password",
		currentPassword: "Current Password",
		newPassword: "New password",
		updatePassword: "Update Password",
		confirmPassword: "Confirm New Password",
		language: "Language",
		dangerZone: "Danger Zone",
		deleteAccount: "Delete Account",
		deleteAccountButton: "Delete Account?",
		deleteAccountConfirmation1: "Are you sure you want to delete your account?",
		deleteAccountConfirmation2: "This action is irreversable!!",
		deleteAccountConfirmed: "I'm sure, delete my account",
		usernamePlaceholder: "John Doe",
		emailPlaceholder: "john.doe@example.com",
		notAllowed: "You are not allowed to perform this action, if you think this is a mistake, clear your cache with 'ctrl + shift + r' and log back in",
		userNotFound: "The requested user was not found",
		infoUpdated: "Information updated successfully",
		avatarUpdated: "Avatar updated successfully",
		noNewValues: "You have not entered any new values",
		errorInvalidFields: "Invalid fields",
		errorForbidden: "You don't have the permissions to modify this data",
		errorTargetNotFound: "The specified user does not exist",
		errorUnexpected: "Unexpected error",
		errorDeleteFailed: "Error deleting account",
		passwordUpdated: "Password updated successfully",
		passwordNoMatch: "Passwords do not match",
		errorCurrentPassIncorrect: "Current password is incorrect"
	},

	errors: {
		pageNotFound: "Page Not Found"
	},

	home: {
		localPlay: "Local Play",
		onlinePlay: "Online Play",
		leaderboard: "Leaderboard",
		about: "About",
	},

	login: {
		title: "Login",
		emailPlaceholder: "Email",
		passwordPlaceholder: "Password",
		loginButton: "Login",
		noAccount: "Don't have an account?",
		registerLink: "Register.",
		registerTitle: "Register",
		usernamePlaceholder: "Username",
		confirmPasswordPlaceholder: "Confirm password",
		registerButton: "Register",
		alreadyAccount: "Already have an account?",
		loginLink: "Login."
	},

	leaderboard: {
		rank: "#",
		userName: "User Name",
		wins: "Wins",
		losses: "Losses",
		totalMatches: "Total Matches",
		winrate: "Winrate",
		errorLoading: "Error loading leaderboard",
		errorRequest: "Request error",
		errorNetwork: "Network error",
		errorUnexpectedPayload: "Unexpected payload, expected an array"
	},

	browse: {
		browseMatch: "Browse Match",
		browseTournaments: "Browse Tournaments"
	},

	onlineMode: {
		threePlayers: "3 Players",
		fourPlayers: "4 Players"
	},

	browseGames: {
		title: "Browse Games",
		loading: "Loading matches...",
		empty: "No matches yet. Create one!",
		join: "Join",
		status: "Status",
		mode: "Mode",
		matchCount: "match(es)",
		matchFinished: "finished",
		deleteConfirm: "Delete match",
		deleteFailed: "Delete failed",
		error: "Error"
	},

	browseTournaments: {
		title: "Browse Tournaments",
		loading: "Loading tournaments...",
		empty: "No tournament yet. Create one!",
		open: "Open",
		status: "Status",
		winner: "Winner",
		created: "Created",
		tournamentCount: "tournament(s)",
		deleteConfirm: "Delete tournament",
		deleteFailed: "Delete failed",
		deleteNotImplemented: "Delete tournament API not implemented yet.",
		error: "Error"
	},

	common: {
		back: "Back",
		delete: "Delete",
		match: "Match"
	},

	profile: {
		userStats: "User Stats",
		totalMatches: "Total Matches",
		tournamentsWon: "Tournaments Won",
		matchHistory: "Match History",
		matchId: "Match ID",
		opponent: "Opponent",
		score: "Score",
		result: "Result",
		date: "Date",
		wins: "Wins",
		losses: "Losses",
		online: "Online",
		offline: "Offline",
		win: "Win",
		loss: "Loss",
		userNotFound: "User not found",
		profilePicture: "Profile picture",
		errorNoIdStats: "Error: No user id found, cannot load statistics...",
		errorNoIdHistory: "Error: No user id found, cannot load match history...",
		errorFetchStats: "Error: Unable to fetch user stats: ",
		errorFetchHistory: "Error: Unable to fetch match history: ",
		errorInvalidId: "Invalid user ID",
		errorNotAuthenticated: "Not authenticated",
		errorUnexpected: "Unexpected error",
		recentForm: "Recent Form",
		noRecentMatches: "No matches played yet",
		unknownDate: "Unknown date"
	},

	gameLocal: {
		playerVsAi: "Player vs AI",
		playerVsPlayer: "Player vs Player",
		localTournament: "Local Tournament"
	},

	gameOnline: {
		createMatch: "Create Match",
		createTournament: "Create Tournament",
		browseGames: "Browse Games"
	},

	ingameMsg: {
		ended: "Ended...",
		start: "Press START",
		pause: "PAUSED",
		player: "PLAYER ",
		wins: " WINS!",
		restart: "Press START to restart"
	},

	about: {
		title: "ABOUT",
		projectDescription: "ft_transcendence is the final project of 42's Common Core. We built a real-time multiplayer Pong platform from scratch — full-stack, containerised with Docker, secured end-to-end, and loaded with features like live tournaments, friend systems, and match history / statistics. All using pure TypeScript and Tailwind CSS!",
		frontendRole: "Frontend",
		frontendBio: "Made most everything you can see, from page layouts, to styling, to subtle effects you'll never notice.",
		backendRole: "Backend",
		backendBio: "Made the brains behind the scenes, handles everything from API, database, auth, and security.",
		gameRole: "Game",
		gameBio: "Made the game, trained the AI opponents, and turned this from a boring rather static website to something you can play!"
	},

	gameLocalAi: {
		easy: "Easy",
		medium: "Medium",
		hard: "Hard"
	},

	loginErrors: {
		emailEmpty: "Email field is empty",
		passwordEmpty: "Password field is empty",
		usernameEmpty: "Username field is empty",
		passwordsMismatch: "Passwords do not match",
		invalidCredentials: "Invalid credentials",
		missingFields: "Missing field(s) or password is too short (min. 8 chars)",
		usernameEmailTaken: "Username or email is already taken",
		loginFailed: "Login failed",
		registrationFailed: "Registration failed",
		unexpectedError: "Unexpected error"
	},

	onlineMatch: {
		connecting: "Connecting...",
		canvasError: "Canvas error (no 2D context)",
		joiningMatch: "Connected. Joining match...",
		noMatchId: "No match ID (create a match first).",
		waiting: "waiting",
		starting: "starting...",
		pausedBy: "Paused by",
		pausedPlayer: "Paused (player",
		playerDisconnected: "disconnected)",
		resumed: "Game resumed",
		matchFull: "Match full",
		winner: "Winner",
		wsError: "Connection error",
		wsClosed: "Connection closed",
		matchDeleted: "Match deleted"
	},

	onlineTournament: {
		quarterFinals: "Quarter Finals",
		semiFinals: "Semi Finals",
		final: "Final",
		tbd: "TBD",
		winner: "Winner",
		finished: "finished",
		noMatch: "No match for you yet",
		goToMatch: "Go to my match",
		joiningTournament: "Connected. Joining tournament...",
		noTournamentId: "No tournament ID (create a tournament first).",
		waiting: "waiting",
		started: "started",
		tournamentFinished: "Tournament finished!",
		tournamentFull: "full",
		rejoin: "rejoin"
	},

	tournamentLocal: {
		chooseAiDifficulty: "Choose AI difficulty",
		champion: "Champion",
		enterPlayerNames: "Enter player names",
		playerNamePlaceholder: "Player name",
		continue: "Continue",
		playNextMatch: "Play next match",
		restartTournament: "Restart tournament",
		quarterFinals: "Quarterfinals",
		semiFinals: "Semifinals",
		final: "Final",
		match: "Match",
		semi: "Semi",
		bot: "Bot"
	}
};

export default en;
