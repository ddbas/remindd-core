import * as chrono from 'chrono-node';

/**
 * Determines whether the parsed time needs to be forwarded.
 * It assumes that the parsed date is at least today's date
 * because `forwardDate` is `true`.
 */
const shouldTimeBeForwarded = (
    today: Date,
    parsedComponents: chrono.ParsedComponents
): boolean => {
    const parsedDate = parsedComponents.date();
    return (
        !parsedComponents.isCertain('meridiem') && // AM and PM wasn't specified
        parsedDate.getFullYear() === today.getFullYear() &&
        parsedDate.getMonth() === today.getMonth() &&
        parsedDate.getDay() === today.getDay() &&
        (parsedDate.getHours() < today.getHours() ||
            (parsedDate.getHours() === today.getHours() &&
                parsedDate.getMinutes() < today.getMinutes()) ||
            (parsedDate.getMinutes() === today.getMinutes() &&
                parsedDate.getSeconds() < today.getSeconds()))
    );
};

/**
 * Forwards the time of the parsed date if
 * `forwardDate` is true and the time wasn't
 * properly forwarded.
 */
const forwardTime = (
    parsedComponents: chrono.ParsedComponents,
    referenceDate: Date
): chrono.ParsedComponents => {
    if (shouldTimeBeForwarded(referenceDate, parsedComponents)) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        parsedComponents.assign('meridiem', 1);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        parsedComponents.assign('hour', parsedComponents.get('hour') + 12);
    }

    return parsedComponents;
};

const refiner: chrono.Refiner = {
    refine: (context, results) => {
        if (!context.option.forwardDate) {
            return results;
        }

        results.forEach((result) => {
            forwardTime(result.start, result.refDate);
            if (result.end) {
                forwardTime(result.end, result.refDate);
            }
        });

        return results;
    },
};

export default refiner;
