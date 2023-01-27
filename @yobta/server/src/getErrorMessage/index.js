export const getErrorMessage = (error, fallbackMessage) => {
    if (error instanceof Error) {
        return error.message;
    }
    else if (typeof error === 'string') {
        return error;
    }
    else {
        return fallbackMessage || 'Unknown error';
    }
};
