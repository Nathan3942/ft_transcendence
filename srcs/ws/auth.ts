/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   auth.ts                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: njeanbou <njeanbou@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/02/17 14:37:59 by njeanbou          #+#    #+#             */
/*   Updated: 2026/02/17 15:33:26 by njeanbou         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import type { FastifyRequest } from "fastify";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { string } from "zod";

export type WsAuthResult = 
    | { ok: true; userId: string }
    | { ok: false; reason: string };

/*
    recuper token
*/
function extractToken(req: FastifyRequest): string | null {

    const auth = req.headers.authorization;
    if (auth?.startsWith("Bearer "))
        return (auth.slice("Bearer ".length).trim());

    const q = (req.query as any)?.token;
    if (typeof q === "string" && q.length > 0)
        return (q);

    return (null);
}

// verifie token et retourne userId
export function wsAuthenticate(req: FastifyRequest): WsAuthResult {

    const token = extractToken(req);
    if (!token)
        return { ok: false, reason: "Missing token" };

    try {
        const payload = jwt.verify(token, env.JWT_SECRET) as any;
        const userId = payload?.sub ?? payload?.userId ?? payload?.id;

        if (!userId)
            return { ok: false, reason: "Token payload missing user id" };

        return { ok: true, userId: String(userId) };
    }
    catch (e) {
        return { ok: false, reason: "Invalid token" };
    }
}

