export const notifySubscribers = ({ subscribers, committed, pending, }) => {
    subscribers.forEach(subscriber => {
        subscriber({ committed, pending });
    });
};
