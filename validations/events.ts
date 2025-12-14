// validations/events.ts
import * as yup from 'yup';

export const createEventSchema = yup.object({
    name: yup.string()
        .required('Name is required')
        .min(3, 'Name must be at least 3 characters'),

    description: yup.string()
        .required('Description is required')
        .min(10, 'Description must be at least 10 characters'),

    startDate: yup.date()
        .required('Start date is required')
        .min(new Date(), 'Start date must be in the future'),

    endDate: yup.date()
        .required('End date is required')
        .min(yup.ref('startDate'), 'End date must be after start date'),

    capacity: yup.number()
        .required('Capacity is required')
        .min(1, 'Capacity must be at least 1')
        .integer('Capacity must be an integer'),

    // Game-specific validation
    eventType: yup.string()
        .oneOf(['normal', 'game'], 'Invalid event type'),

    gameType: yup.string()
        .when('eventType', {
            is: 'game',
            then: (schema) => schema.required('Game type is required for game events'),
            otherwise: (schema) => schema.optional(),
        }),

    // Team size validation
    minTeamSize: yup.number()
        .when('allowsTeams', {
            is: true,
            then: (schema) => schema
                .required('Minimum team size is required')
                .min(1, 'Minimum team size must be at least 1'),
        }),

    maxTeamSize: yup.number()
        .when('allowsTeams', {
            is: true,
            then: (schema) => schema
                .required('Maximum team size is required')
                .min(yup.ref('minTeamSize'), 'Maximum team size must be >= minimum team size'),
        }),
});