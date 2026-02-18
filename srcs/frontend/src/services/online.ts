/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   online.ts                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: njeanbou <njeanbou@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/02/18 16:53:19 by njeanbou          #+#    #+#             */
/*   Updated: 2026/02/18 17:40:02 by njeanbou         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */


const API_BASE = "http://192.168.1.40:3000/api/v1";  //a changer selon setup



async function api<T>(path: string, opts?: RequestInit): Promise<T> {

    const res = await fetch(`${API_BASE}${path}`, {
        headers: { "Content-Type": "application/json" },
        ...opts, 
    });
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`API error ${res.status}: ${text || res.statusText}`);
    }
    return (res.json() as Promise<T>);
}


export async function createOnlineMatch() {

    const data = await api<{ id: string }>("/matches", {
        method: "POST",
        body: JSON.stringify({ mode: "online" }),
    });

    return (data.id);
}


export async function createOnlineTournament() {

    const t = await api<{ id: string }>("/tournaments", {
        method: "POST",
        body: JSON.stringify({ name: "My tournament" }),
    });
    
    return (t.id);
}

export async function browseGames() {

    window.location.hash = `#/games`;
}