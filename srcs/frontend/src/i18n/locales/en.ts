import type { TranslationDict } from "../i18n";

const en: TranslationDict = {
	nav: {
		profile: "Profile",
		settings: "Settings",
		logout: "Logout",
		leaderboard: "Leaderboard",
		login: "Login"
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
		deleteAccountConfirmed: "I'm sure, delete my account"
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
		userName: "User Name",
		wins: "Wins",
		losses: "Losses",
		totalMatches: "Total Matches",
		winrate: "Winrate"
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
		join: "Join"
	},

	browseTournaments: {
		title: "Browse Tournaments",
		loading: "Loading tournaments...",
		empty: "No tournament yet. Create one!",
		open: "Open"
	},

	common: {
		back: "Back",
		delete: "Delete"
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
		losses: "Losses"
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
		usernameEmailTaken: "Username or email is already taken"
	}
};

export default en;
