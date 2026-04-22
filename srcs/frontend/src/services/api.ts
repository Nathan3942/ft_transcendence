/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   api.ts                                             :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: njeanbou <njeanbou@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/02/19 14:57:26 by njeanbou          #+#    #+#             */
/*   Updated: 2026/04/19 18:37:37 by njeanbou         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */



const API_BASE = `/api/v1`;

type ApiSuccess<T> = { success: true, data: T };
type ApiError = { success?: false; error?: string, message?: string; details?: unknown };

export async function api<T>(path: string, opts?: RequestInit): Promise<T> {
	const headers: Record<string, string> = {};

	if (opts?.body) {
		headers["Content-Type"] = "application/json";
	}
	
	const res = await fetch(`${API_BASE}${path}`, {
		headers,
		...opts,
	});

	const text = await res.text().catch(() => "");
	const json = text ? JSON.parse(text) : null;

	if (!res.ok) {
		const retryAfter = res.headers.get("retry-after");
		const remaining = res.headers.get("x-ratelimit-remaining");

		const msg =
			(json as ApiError)?.message ||
			(json as ApiError)?.error ||
			text ||
			res.statusText;

		if (remaining === "0" || retryAfter) {
			throw new Error(`Rate limit exceeded. Retry after ${retryAfter ?? "a few"} seconds.`);
		}

		throw new Error(`API ${res.status}: ${msg}`);
	}

	if (json && (json as ApiSuccess<T>).success === true && "data" in json) {
		return (json as ApiSuccess<T>).data;
	}

	return json as T;
}