/**
 * Dual-algorithm Spaced Repetition Scheduler
 *
 * Supports two algorithms selectable per deck:
 *   'sm2'  — Anki-style SM-2 (classic, learning steps, ease factor)
 *   'fsrs' — FSRS-5 (modern, three-component memory model, desired retention)
 *
 * Quality values (matching button labels):
 *   1 = Again   3 = Hard   4 = Good   5 = Easy
 */

// ─── Shared Helpers ───────────────────────────────────────────────────────────

function addMinutes(date, minutes) {
    return new Date(date.getTime() + minutes * 60 * 1000);
}

function addDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SM-2  (Anki-style)
// ═══════════════════════════════════════════════════════════════════════════════

export const DEFAULT_CONFIG = {
    learningSteps: [1, 10],       // minute durations before graduating
    graduatingInterval: 1,         // days on Good graduation
    easyInterval: 4,               // days on Easy graduation (skips steps)
    hardStepFactor: 0.8,           // Hard in learning: schedules at this × next step duration
    hardMultiplier: 1.2,           // Hard in review: interval × hardMultiplier
    easyBonus: 1.3,                // Easy in review: extra multiplier on top of EF
    hardEFDelta: -0.15,            // Hard in review reduces EF
    easyEFDelta: 0.15,             // Easy in review/learning increases EF
    lapseEFDelta: -0.20,           // Again in review (lapse) reduces EF
    minEaseFactor: 1.3,            // Minimum ease factor (Anki default)
    defaultEaseFactor: 2.5,        // Starting ease factor for new cards
    relearnSteps: [10],            // Relearning step durations in minutes
};

function clampEF(ef, min) {
    return Math.max(min, parseFloat(ef.toFixed(2)));
}

function scheduleSM2Learning(quality, card, cfg, now) {
    const steps = cfg.learningSteps;
    const { stepIndex = 0, easeFactor = cfg.defaultEaseFactor, repetitions = 0 } = card;

    if (quality === 1) {
        return {
            state: 'learning', stepIndex: 0, interval: 0, easeFactor,
            lapses: card.lapses ?? 0, repetitions,
            stability: card.stability ?? 0, difficulty: card.difficulty ?? 5,
            nextReviewAt: addMinutes(now, steps[0]),
        };
    }
    if (quality === 3) {
        const nextIdx = Math.min(stepIndex + 1, steps.length - 1);
        const delay = Math.max(1, Math.round(steps[nextIdx] * cfg.hardStepFactor));
        return {
            state: 'learning', stepIndex: nextIdx, interval: 0, easeFactor,
            lapses: card.lapses ?? 0, repetitions,
            stability: card.stability ?? 0, difficulty: card.difficulty ?? 5,
            nextReviewAt: addMinutes(now, delay),
        };
    }
    if (quality === 4) {
        const nextIdx = stepIndex + 1;
        if (nextIdx >= steps.length) {
            return {
                state: 'review', stepIndex: 0, interval: cfg.graduatingInterval, easeFactor,
                lapses: card.lapses ?? 0, repetitions: repetitions + 1,
                stability: card.stability ?? 0, difficulty: card.difficulty ?? 5,
                nextReviewAt: addDays(now, cfg.graduatingInterval),
            };
        }
        return {
            state: 'learning', stepIndex: nextIdx, interval: 0, easeFactor,
            lapses: card.lapses ?? 0, repetitions,
            stability: card.stability ?? 0, difficulty: card.difficulty ?? 5,
            nextReviewAt: addMinutes(now, steps[nextIdx]),
        };
    }
    if (quality === 5) {
        return {
            state: 'review', stepIndex: 0, interval: cfg.easyInterval,
            easeFactor: clampEF(easeFactor + cfg.easyEFDelta, cfg.minEaseFactor),
            lapses: card.lapses ?? 0, repetitions: repetitions + 1,
            stability: card.stability ?? 0, difficulty: card.difficulty ?? 5,
            nextReviewAt: addDays(now, cfg.easyInterval),
        };
    }
    throw new Error(`Unknown quality: ${quality}`);
}

function scheduleSM2Relearning(quality, card, cfg, now) {
    const steps = cfg.relearnSteps;
    const {
        stepIndex = 0, interval = 1, easeFactor = cfg.defaultEaseFactor,
        repetitions = 0, lapses = 0,
    } = card;

    if (quality === 1) {
        return {
            state: 'relearning', stepIndex: 0, interval, lapses: lapses + 1, repetitions,
            easeFactor: clampEF(easeFactor + cfg.lapseEFDelta, cfg.minEaseFactor),
            stability: card.stability ?? 0, difficulty: card.difficulty ?? 5,
            nextReviewAt: addMinutes(now, steps[0]),
        };
    }
    if (quality === 3) {
        const delay = Math.max(1, Math.round(steps[stepIndex] * cfg.hardStepFactor));
        return {
            state: 'relearning', stepIndex, interval, easeFactor, lapses, repetitions,
            stability: card.stability ?? 0, difficulty: card.difficulty ?? 5,
            nextReviewAt: addMinutes(now, delay),
        };
    }
    if (quality === 4) {
        const nextIdx = stepIndex + 1;
        if (nextIdx >= steps.length) {
            return {
                state: 'review', stepIndex: 0, interval: Math.max(1, interval),
                easeFactor, lapses, repetitions: repetitions + 1,
                stability: card.stability ?? 0, difficulty: card.difficulty ?? 5,
                nextReviewAt: addDays(now, Math.max(1, interval)),
            };
        }
        return {
            state: 'relearning', stepIndex: nextIdx, interval, easeFactor, lapses, repetitions,
            stability: card.stability ?? 0, difficulty: card.difficulty ?? 5,
            nextReviewAt: addMinutes(now, steps[nextIdx]),
        };
    }
    if (quality === 5) {
        return {
            state: 'review', stepIndex: 0, interval: Math.max(1, interval),
            easeFactor: clampEF(easeFactor + cfg.easyEFDelta, cfg.minEaseFactor),
            lapses, repetitions: repetitions + 1,
            stability: card.stability ?? 0, difficulty: card.difficulty ?? 5,
            nextReviewAt: addDays(now, Math.max(1, interval)),
        };
    }
    throw new Error(`Unknown quality: ${quality}`);
}

function scheduleSM2Review(quality, card, cfg, now) {
    const {
        interval = 1, easeFactor = cfg.defaultEaseFactor,
        repetitions = 0, lapses = 0,
    } = card;

    if (quality === 1) {
        const newEF = clampEF(easeFactor + cfg.lapseEFDelta, cfg.minEaseFactor);
        if (cfg.relearnSteps.length > 0) {
            return {
                state: 'relearning', stepIndex: 0, interval, lapses: lapses + 1, repetitions,
                easeFactor: newEF,
                stability: card.stability ?? 0, difficulty: card.difficulty ?? 5,
                nextReviewAt: addMinutes(now, cfg.relearnSteps[0]),
            };
        }
        return {
            state: 'review', stepIndex: 0, interval: 1, lapses: lapses + 1,
            repetitions: repetitions + 1, easeFactor: newEF,
            stability: card.stability ?? 0, difficulty: card.difficulty ?? 5,
            nextReviewAt: addDays(now, 1),
        };
    }
    if (quality === 3) {
        const newInterval = Math.max(1, Math.round(interval * cfg.hardMultiplier));
        return {
            state: 'review', stepIndex: 0, interval: newInterval,
            easeFactor: clampEF(easeFactor + cfg.hardEFDelta, cfg.minEaseFactor),
            lapses, repetitions: repetitions + 1,
            stability: card.stability ?? 0, difficulty: card.difficulty ?? 5,
            nextReviewAt: addDays(now, newInterval),
        };
    }
    if (quality === 4) {
        const newInterval = Math.max(1, Math.round(interval * easeFactor));
        return {
            state: 'review', stepIndex: 0, interval: newInterval, easeFactor,
            lapses, repetitions: repetitions + 1,
            stability: card.stability ?? 0, difficulty: card.difficulty ?? 5,
            nextReviewAt: addDays(now, newInterval),
        };
    }
    if (quality === 5) {
        const newInterval = Math.max(1, Math.round(interval * easeFactor * cfg.easyBonus));
        return {
            state: 'review', stepIndex: 0, interval: newInterval,
            easeFactor: clampEF(easeFactor + cfg.easyEFDelta, cfg.minEaseFactor),
            lapses, repetitions: repetitions + 1,
            stability: card.stability ?? 0, difficulty: card.difficulty ?? 5,
            nextReviewAt: addDays(now, newInterval),
        };
    }
    throw new Error(`Unknown quality: ${quality}`);
}

function scheduleSM2(quality, card, cfg, now) {
    const state = card.state ?? 'new';
    if (state === 'new' || state === 'learning') return scheduleSM2Learning(quality, card, cfg, now);
    if (state === 'relearning') return scheduleSM2Relearning(quality, card, cfg, now);
    return scheduleSM2Review(quality, card, cfg, now);
}

function previewSM2(quality, card, cfg) {
    const state = card.state ?? 'new';
    const stepIndex = card.stepIndex ?? 0;
    const interval = card.interval ?? 0;
    const easeFactor = card.easeFactor ?? cfg.defaultEaseFactor;

    if (state === 'new' || state === 'learning') {
        const steps = cfg.learningSteps;
        if (quality === 1) return `${steps[0]}m`;
        if (quality === 3) {
            const nextIdx = Math.min(stepIndex + 1, steps.length - 1);
            return `${Math.max(1, Math.round(steps[nextIdx] * cfg.hardStepFactor))}m`;
        }
        if (quality === 4) {
            const nextIdx = stepIndex + 1;
            if (nextIdx >= steps.length) return `${cfg.graduatingInterval}d`;
            return `${steps[nextIdx]}m`;
        }
        if (quality === 5) return `${cfg.easyInterval}d`;
    }
    if (state === 'relearning') {
        const steps = cfg.relearnSteps;
        if (quality === 1) return `${steps[0]}m`;
        if (quality === 3) return `${Math.max(1, Math.round(steps[stepIndex] * cfg.hardStepFactor))}m`;
        if (quality === 4) {
            if (stepIndex + 1 >= steps.length) return `${Math.max(1, interval)}d`;
            return `${cfg.relearnSteps[stepIndex + 1]}m`;
        }
        if (quality === 5) return `${Math.max(1, interval)}d`;
    }
    // Review phase
    if (quality === 1) return cfg.relearnSteps.length > 0 ? `${cfg.relearnSteps[0]}m` : '1d';
    if (quality === 3) return `${Math.max(1, Math.round(interval * cfg.hardMultiplier))}d`;
    if (quality === 4) return `${Math.max(1, Math.round(interval * easeFactor))}d`;
    if (quality === 5) return `${Math.max(1, Math.round(interval * easeFactor * cfg.easyBonus))}d`;
    return '-';
}

// ═══════════════════════════════════════════════════════════════════════════════
// FSRS-5
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * FSRS-5 default weights (from the paper by Ye, 2023).
 * w[0-3]:  initial stability for grades 1-4 (Again/Hard/Good/Easy)
 * w[4]:    difficulty base
 * w[5]:    difficulty grade scaling
 * w[6]:    difficulty update delta
 * w[7]:    mean-reversion weight
 * w[8-10]: recall stability growth parameters
 * w[11-14]: forget stability parameters
 * w[15]:   hard penalty
 * w[16]:   easy bonus
 */
const FSRS5_W = [
    0.40255,   // w0
    1.18385,   // w1
    3.17386,   // w2
    15.69105,  // w3
    7.1949,    // w4
    0.5345,    // w5
    1.4604,    // w6
    0.0046,    // w7
    1.54575,   // w8
    0.1192,    // w9
    1.01925,   // w10
    1.9395,    // w11
    0.11,      // w12
    0.29605,   // w13
    2.2698,    // w14
    0.2315,    // w15
    2.9898,    // w16
    0.51655,   // w17 (unused in basic FSRS-5)
    0.6621,    // w18 (unused in basic FSRS-5)
];

const FSRS_FACTOR = 19 / 81;
const FSRS_DECAY  = -0.5;

/** Maps our quality values to FSRS grades (1-4). */
function qualityToGrade(quality) {
    const map = { 1: 1, 3: 2, 4: 3, 5: 4 };
    return map[quality] ?? 3;
}

/**
 * Retrievability: probability of recall after `elapsedDays` with `stability` S.
 * R(t, S) = (1 + FACTOR * t/S)^DECAY
 */
function fsrsR(elapsedDays, stability) {
    if (stability <= 0) return 0;
    return Math.pow(1 + FSRS_FACTOR * elapsedDays / stability, FSRS_DECAY);
}

/**
 * Next interval (days) to achieve `desiredRetention`.
 * I = (S/FACTOR) * (r^(1/DECAY) - 1)  = (81/19) * S * (r^-2 - 1)
 */
function fsrsInterval(stability, desiredRetention) {
    const r = Math.max(0.01, Math.min(0.99, desiredRetention));
    return Math.max(1, Math.round((stability / FSRS_FACTOR) * (Math.pow(r, 1 / FSRS_DECAY) - 1)));
}

function fsrsInitialStability(grade) {
    return Math.max(0.1, FSRS5_W[grade - 1]);
}

function fsrsInitialDifficulty(grade) {
    return Math.min(10, Math.max(1, FSRS5_W[4] - Math.exp(FSRS5_W[5] * (grade - 1)) + 1));
}

function fsrsUpdateDifficulty(d, grade) {
    const d0_easy = fsrsInitialDifficulty(4);
    const newD = d - FSRS5_W[6] * (grade - 3);
    // Mean reversion toward the easy baseline
    const reverted = FSRS5_W[7] * d0_easy + (1 - FSRS5_W[7]) * newD;
    return Math.min(10, Math.max(1, reverted));
}

function fsrsStabilityRecall(S, D, R, grade) {
    const w = FSRS5_W;
    const hardPenalty = grade === 2 ? w[15] : 1;
    const easyBonus   = grade === 4 ? w[16] : 1;
    const newS = S * (
        Math.exp(w[8]) * (11 - D) * Math.pow(S, -w[9]) * (Math.exp(w[10] * (1 - R)) - 1) + 1
    ) * hardPenalty * easyBonus;
    return Math.max(0.1, newS);
}

function fsrsStabilityForget(S, D, R) {
    const w = FSRS5_W;
    const newS = w[11] * Math.pow(D, -w[12]) * (Math.pow(S + 1, w[13]) - 1) * Math.exp(w[14] * (1 - R));
    return Math.max(0.1, newS);
}

function scheduleFSRS(quality, card, cfg, now) {
    const grade = qualityToGrade(quality);
    const {
        state = 'new',
        stability = 0,
        difficulty = 5,
        repetitions = 0,
        lapses = 0,
        interval = 0,
    } = card;
    const desiredRetention = cfg.desiredRetention ?? 0.9;

    // ── New / Learning ──
    if (state === 'new' || state === 'learning') {
        const S = fsrsInitialStability(grade);
        const D = fsrsInitialDifficulty(grade);

        if (grade === 1) {
            return {
                state: 'learning', stability: S, difficulty: D,
                interval: 0, stepIndex: 0, lapses, repetitions,
                easeFactor: 2.5,
                nextReviewAt: addMinutes(now, 1),
            };
        }
        const I = fsrsInterval(S, desiredRetention);
        return {
            state: 'review', stability: S, difficulty: D,
            interval: I, stepIndex: 0, lapses, repetitions: repetitions + 1,
            easeFactor: 2.5,
            nextReviewAt: addDays(now, I),
        };
    }

    // ── Review ──
    if (state === 'review') {
        const R = fsrsR(interval, stability);

        if (grade === 1) {
            return {
                state: 'relearning',
                stability: fsrsStabilityForget(stability, difficulty, R),
                difficulty: fsrsUpdateDifficulty(difficulty, grade),
                interval, stepIndex: 0, lapses: lapses + 1, repetitions,
                easeFactor: 2.5,
                nextReviewAt: addMinutes(now, 10),
            };
        }
        const newS = fsrsStabilityRecall(stability, difficulty, R, grade);
        const newD = fsrsUpdateDifficulty(difficulty, grade);
        const I = fsrsInterval(newS, desiredRetention);
        return {
            state: 'review', stability: newS, difficulty: newD,
            interval: I, stepIndex: 0, lapses, repetitions: repetitions + 1,
            easeFactor: 2.5,
            nextReviewAt: addDays(now, I),
        };
    }

    // ── Relearning ──
    if (state === 'relearning') {
        const R = fsrsR(0.01, stability); // tiny elapsed time (just entered relearning)

        if (grade === 1) {
            return {
                state: 'relearning',
                stability: fsrsStabilityForget(stability, difficulty, R),
                difficulty: fsrsUpdateDifficulty(difficulty, grade),
                interval, stepIndex: 0, lapses: lapses + 1, repetitions,
                easeFactor: 2.5,
                nextReviewAt: addMinutes(now, 10),
            };
        }
        // Re-graduate: use current (post-forget) stability to compute interval
        const newD = fsrsUpdateDifficulty(difficulty, grade);
        const I = fsrsInterval(stability, desiredRetention);
        return {
            state: 'review', stability, difficulty: newD,
            interval: I, stepIndex: 0, lapses, repetitions: repetitions + 1,
            easeFactor: 2.5,
            nextReviewAt: addDays(now, I),
        };
    }

    throw new Error(`FSRS: unknown state "${state}"`);
}

function previewFSRS(quality, card, cfg) {
    const grade = qualityToGrade(quality);
    const {
        state = 'new',
        stability = 0,
        difficulty = 5,
        interval = 0,
    } = card;
    const desiredRetention = cfg.desiredRetention ?? 0.9;

    if (state === 'new' || state === 'learning') {
        if (grade === 1) return '1m';
        return `${fsrsInterval(fsrsInitialStability(grade), desiredRetention)}d`;
    }
    if (state === 'relearning') {
        if (grade === 1) return '10m';
        return `${fsrsInterval(stability, desiredRetention)}d`;
    }
    // Review
    if (grade === 1) return '10m';
    const R = fsrsR(interval, stability);
    const newS = fsrsStabilityRecall(stability, difficulty, R, grade);
    return `${fsrsInterval(newS, desiredRetention)}d`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Public API
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Schedule a card based on quality rating.
 *
 * @param {number} quality  1=Again, 3=Hard, 4=Good, 5=Easy
 * @param {object} card     Current card fields from DB
 * @param {object} config   Overrides; include `algorithm` ('sm2'|'fsrs') and
 *                          `desiredRetention` (0.7–0.99) for FSRS
 * @param {Date}   now      Reference timestamp (defaults to new Date())
 * @returns {object}        Updated card fields + nextReviewAt
 */
export function schedule(quality, card, config = {}, now = new Date()) {
    const cfg = { ...DEFAULT_CONFIG, ...config };
    if (cfg.algorithm === 'fsrs') return scheduleFSRS(quality, card, cfg, now);
    return scheduleSM2(quality, card, cfg, now);
}

/**
 * Preview the next interval label for a button without modifying state.
 *
 * @param {number} quality
 * @param {object} card
 * @param {object} config  Include `algorithm` and `desiredRetention`
 * @returns {string}  e.g. '1m', '10m', '1d', '4d'
 */
export function previewInterval(quality, card, config = {}) {
    const cfg = { ...DEFAULT_CONFIG, ...config };
    if (cfg.algorithm === 'fsrs') return previewFSRS(quality, card, cfg);
    return previewSM2(quality, card, cfg);
}
