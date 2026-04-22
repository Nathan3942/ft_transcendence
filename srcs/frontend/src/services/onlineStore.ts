/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   onlineStore.ts                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: njeanbou <njeanbou@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/02/18 17:26:14 by njeanbou          #+#    #+#             */
/*   Updated: 2026/04/02 06:15:11 by njeanbou         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

// stock l'id des match

const KEY = "online.currentMatchId";
const KEY_T = "online.currentTournamentId";

let currentMatchMode: number | null = null;


// Match

export function setCurrentMatchId(id: string) {
	sessionStorage.setItem(KEY, id);
}

export function getCurrentMatchId(): string | null {
	return (sessionStorage.getItem(KEY));
}

export function clearCurrentMatchId() {
	sessionStorage.removeItem(KEY);
}


// Tournament

export function setCurrentTournamentId(id: string) {
	sessionStorage.setItem(KEY_T, id);
}

export function getCurrentTournamentId() {
	return sessionStorage.getItem(KEY_T);
}

export function clearCurrentTournamentId() {
	sessionStorage.removeItem(KEY_T);
}

// Match Mode

export function setCurrentMatchMode(mode: number) {
	currentMatchMode = mode;
}
export function getCurrentMatchMode() {
	return currentMatchMode;
}

