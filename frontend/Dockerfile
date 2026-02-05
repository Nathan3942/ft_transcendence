# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Dockerfile                                         :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: njeanbou <njeanbou@student.42.fr>          +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2026/02/05 14:57:46 by njeanbou          #+#    #+#              #
#    Updated: 2026/02/05 16:12:42 by njeanbou         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #


#   Build

FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build


#   runtime

FROM nginx:1.27-alpine
#   SPA fallback + reverse proxy plus tard
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf

#   Vite
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
