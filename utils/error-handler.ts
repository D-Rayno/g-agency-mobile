// utils/error-handler.ts

export class ApiError extends Error {
    constructor(
        public message: string,
        public status: number = 500,
        public code?: string
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

export const handleApiError = (error: any): ApiError => {
    if (error.response) {
        const { status, data } = error.response;
        return new ApiError(
            data.message || 'Une erreur est survenue',
            status,
            data.code
        );
    }

    if (error.request) {
        return new ApiError(
            'Pas de réponse du serveur. Vérifiez votre connexion.',
            0,
            'NETWORK_ERROR'
        );
    }

    return new ApiError(
        error.message || 'Erreur inconnue',
        500,
        'UNKNOWN_ERROR'
    );
};