/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   hard.ts                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: njeanbou <njeanbou@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/01/26 15:18:00 by njeanbou          #+#    #+#             */
/*   Updated: 2026/01/26 15:18:12 by njeanbou         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */


import type { Genome } from "../type";

export const HARD: Genome = {
  anticipation: 0.9,
  reaction: 0.03,
  deadZone: 6,
  mistake: 0.02,
  jitter: 2,
};