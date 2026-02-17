/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   index.ts                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: njeanbou <njeanbou@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/02/17 16:36:03 by njeanbou          #+#    #+#             */
/*   Updated: 2026/02/17 16:41:17 by njeanbou         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { buildApp } from "./app";
import { env, isDev } from "./config/env";

async function start() {
  const app = await buildApp();
  app.printRoutes();
  await app.listen({ port: env.PORT, host: "0.0.0.0" });

  app.log.info(`🚀 Server started on http://localhost:${env.PORT}`);
  app.log.info(`📍 Environment: ${env.NODE_ENV}`);
  app.log.info(`✅ CORS enabled for: ${isDev ? "all origins" : env.FRONTEND_URL}`);
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});