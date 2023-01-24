export const plainObjectDiff = (oldObject, newObject) => {
    let diff = {};
    for (let key in oldObject) {
        if (oldObject[key] !== newObject[key]) {
            diff[key] = newObject[key];
        }
    }
    return Object.keys(diff).length > 0 ? diff : null;
};
