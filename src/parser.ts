import * as chrono from 'chrono-node';

import refiner from './chrono-refiner.js';
import Reminder from './reminder.js';

const cleanseReminderTitle = (title: string): string => {
    const trimmedTitle = title.replaceAll(/\s+/g, ' ').trim();

    // Remove preposition before the reminder text.
    return trimmedTitle.replace(/^(?:about|that|to)\s+/, '');
};

const parseReminderDate = (text: string): { date: Date; remaining: string } => {
    const chronoParser = chrono.casual.clone();
    chronoParser.refiners.push(refiner);

    const today = new Date();
    const parsedResults = chronoParser.parse(text, today, {
        forwardDate: true,
    });
    if (!parsedResults.length) {
        throw new Error('No date and/or time was found.');
    }

    const parsedResult = parsedResults[0];
    const date = parsedResult.date();
    const dateText = parsedResult.text;
    const dateIndex = parsedResult.index;

    let textBeforeDate = text.substring(0, dateIndex);
    // Remove preposition before the date.
    textBeforeDate = textBeforeDate.replace(/^(?:at|in|on)\s+/, '');
    const textAfterDate = text.substring(dateIndex + dateText.length);
    const remainingText = `${textBeforeDate} ${textAfterDate}`;
    return {
        date,
        remaining: remainingText,
    };
};

const parse = (text: string): Reminder => {
    const { date, remaining } = parseReminderDate(text);
    const title = cleanseReminderTitle(remaining);
    if (!title.trim()) {
        throw new Error('No remind title found.');
    }

    return {
        date,
        title
    };
};

export default parse;
