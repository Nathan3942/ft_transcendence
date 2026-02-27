/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   onlineStore.ts                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: njeanbou <njeanbou@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/02/18 17:26:14 by njeanbou          #+#    #+#             */
/*   Updated: 2026/02/27 11:53:02 by njeanbou         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

// stock l'id des match

const KEY = "online.currentMatchId";

let currentMatchMode: number | null = null;

export function setCurrentMatchId(id: string) {
	sessionStorage.setItem(KEY, id);
}

export function getCurrentMatchId(): string | null {
	return (sessionStorage.getItem(KEY));
}

export function clearCurrentMatchId() {
	sessionStorage.removeItem(KEY);
}


export function setCurrentMatchMode(mode: number) {
	currentMatchMode = mode;
}
export function getCurrentMatchMode() {
	return currentMatchMode;
}