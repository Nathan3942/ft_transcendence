/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   presets.ts                                         :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: njeanbou <njeanbou@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/01/23 15:40:02 by njeanbou          #+#    #+#             */
/*   Updated: 2026/01/23 15:40:13 by njeanbou         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import type { Genome } from "./type";

export const AI_EASY: Genome = {
  anticipation: 0.4,
  reaction: 0.18,
  deadZone: 40,
  mistake: 0.25,
  jitter: 25,
};

export const AI_MEDIUM: Genome = {
  anticipation: 0.75,
  reaction: 0.09,
  deadZone: 18,
  mistake: 0.08,
  jitter: 10,
};

export const AI_HARD: Genome = {
  anticipation: 0.95,
  reaction: 0.02,
  deadZone: 4,
  mistake: 0.01,
  jitter: 2,
};