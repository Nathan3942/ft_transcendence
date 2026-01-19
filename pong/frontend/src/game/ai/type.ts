/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   type.ts                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: njeanbou <njeanbou@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/01/14 12:47:47 by njeanbou          #+#    #+#             */
/*   Updated: 2026/01/19 10:47:33 by njeanbou         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

export type Genome = {
    anticipation:	number; //vise pos cible
    reaction:		number;	//temps avant de reagir
    deadZone:		number;	//zone mort evite tranblement
    mistake:		number;	//erreur aleatoir
    jitter:			number;
};

export type GAConfig = {
    popSize:			number;
    elitism:			number;
    mutationRate:		number;
	mutationSigma:		number;
	generation:			number;
	episodesPerGenome:	number;
};

export type TrainProgress = {
    gen:			number;
    bestFitness:	number;
    bestGenome:		Genome;
};