/**
 * SM-2 Spaced Repetition Algorithm
 * @param {number} quality - User rating 0-5 (0=complete blackout, 5=perfect)
 * @param {number} repetitions - Current repetition count
 * @param {number} easeFactor - Current ease factor (default 2.5)
 * @param {number} interval - Current interval in days
 * @returns {{ repetitions: number, easeFactor: number, interval: number, nextReviewAt: Date }}
 */
export function sm2(quality, repetitions, easeFactor, interval) {
    let newRepetitions = repetitions;
    let newEaseFactor = easeFactor;
    let newInterval = interval;

    if (quality < 3) {
        // Failed review: reset
        newRepetitions = 0;
        newInterval = 0;
    } else {
        // Successful review
        if (newRepetitions === 0) {
            newInterval = 1;
        } else if (newRepetitions === 1) {
            newInterval = 6;
        } else {
            newInterval = Math.round(interval * easeFactor);
        }
        newRepetitions += 1;
    }

    // Update ease factor (minimum 1.3)
    newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (newEaseFactor < 1.3) newEaseFactor = 1.3;

    const nextReviewAt = new Date();
    nextReviewAt.setDate(nextReviewAt.getDate() + newInterval);

    return {
        repetitions: newRepetitions,
        easeFactor: parseFloat(newEaseFactor.toFixed(2)),
        interval: newInterval,
        nextReviewAt,
    };
}
