// validations/event.ts (new file for frontend)

import * as yup from 'yup';

export const createEventSchema = yup.object({
    name: yup.string()
        .required('Le nom est obligatoire')
        .min(3, 'Le nom doit contenir au moins 3 caractères'),

    description: yup.string()
        .required('La description est obligatoire')
        .min(10, 'La description doit contenir au moins 10 caractères'),

    startDate: yup.date()
        .required('La date de début est obligatoire')
        .min(new Date(), 'La date de début doit être dans le futur'),

    endDate: yup.date()
        .required('La date de fin est obligatoire')
        .min(yup.ref('startDate'), 'La date de fin doit être après la date de début'),

    capacity: yup.number()
        .required('La capacité est obligatoire')
        .min(1, 'La capacité doit être au moins 1')
        .integer('La capacité doit être un nombre entier'),

    // Game-specific validation
    eventType: yup.string()
        .oneOf(['normal', 'game'], 'Type d\'événement invalide'),

    gameType: yup.string()
        .when('eventType', {
            is: 'game',
            then: (schema) => schema.required('Le type de jeu est obligatoire pour un événement de jeu'),
            otherwise: (schema) => schema.optional(),
        }),

    // Team size validation
    minTeamSize: yup.number()
        .when('allowsTeams', {
            is: true,
            then: (schema) => schema
                .required('La taille minimale d\'équipe est obligatoire')
                .min(1, 'La taille minimale d\'équipe doit être au moins 1'),
        }),

    maxTeamSize: yup.number()
        .when('allowsTeams', {
            is: true,
            then: (schema) => schema
                .required('La taille maximale d\'équipe est obligatoire')
                .min(yup.ref('minTeamSize'), 'La taille maximale doit être >= taille minimale'),
        }),
});