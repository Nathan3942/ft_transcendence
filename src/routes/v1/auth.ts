/*
 * ⚠️ TODO: Routes d'authentification OAuth (désactivées pour l'instant)
 *
 * Ce fichier contient le squelette des routes d'authentification OAuth.
 * Ces routes seront implémentées dans une prochaine itération.
 *
 * Routes prévues:
 * - GET /auth/:provider → Redirection vers le provider OAuth
 * - GET /auth/:provider/callback → Callback après authentification
 *
 * À implémenter:
 * - Validation des providers supportés
 * - Génération et vérification du state (CSRF)
 * - Échange du code contre un access token
 * - Récupération des infos utilisateur
 * - Création de session / JWT
 */

import { FastifyInstance } from 'fastify'
import { success } from '../../utils/response'

export default async function authRoutes(server: FastifyInstance) {

    /************************* GET /auth/:provider **********************************/
    server.get('/auth/:provider', async (request) => {
        // Point d'entrée : redirige l'utilisateur vers le provider pour s'authentifier
        const { provider } = request.params as { provider: string }

        // TODO: Valider que le provider est supporté (42, google, etc.)
        // TODO: Générer un state (sécurité CSRF)
        // TODO: Construire l'URL de redirection vers le provider
        // TODO: Rediriger l'utilisateur (reply.redirect)

        return success({
            message: `Auth flow started for provider: ${provider}`,
            note: "Cette route redirigera vers le provider"
        })
    })

    /************************* GET /auth/:provider/callback **********************************/
    server.get('/auth/:provider/callback', async (request) => {
        // Point de retour : le provider redirige l'utilisateur ici avec un code
        const { provider } = request.params as { provider: string }
        const { code, state } = request.query as { code?: string, state?: string }

        // TODO: Vérifier que code et state sont présents
        // TODO: Vérifier que le state est valide (protection CSRF)
        // TODO: Échanger le code contre un access token
        //       fetch('https://api.intra.42.fr/oauth/token', {
        //           method: 'POST',
        //           body: { code, client_id, client_secret, ... }
        //       })
        // TODO: Récupérer les infos utilisateur depuis le provider
        // TODO: Créer ou récupérer l'utilisateur dans la DB
        // TODO: Créer une session / JWT

        return success({
            message: `Callback received from ${provider}`,
            receivedCode: code ? "yes" : "no",
            receivedState: state ? "yes" : "no"
        })
    })
}
