export interface SM2Data {
  repetition: number;
  easinessFactor: number;
  interval: number;
  nextReviewDate: string;
}

/**
 * SuperMemo-2 (SM-2) Spaced Repetition Algorithm
 * 
 * @param quality - Quality of response (0-5)
 *  5: perfect response
 *  4: correct response after a hesitation
 *  3: correct response recalled with serious difficulty
 *  2: incorrect response; where the correct one seemed easy to recall
 *  1: incorrect response; the correct one remembered
 *  0: complete blackout
 * @param previousData - Previous SM2 data (or undefined for new item)
 * @returns - Updated SM2 data
 */
export function calculateSM2(quality: number, previousData?: SM2Data): SM2Data {
  let { repetition, easinessFactor, interval } = previousData || {
    repetition: 0,
    easinessFactor: 2.5,
    interval: 0,
  };

  // Quality >= 3 indicates a correct response
  if (quality >= 3) {
    if (repetition === 0) {
      if (quality === 3) interval = 1;
      else if (quality === 4) interval = 2;
      else if (quality === 5) interval = 3;
      else interval = 1;
    } else if (repetition === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easinessFactor);
    }
    repetition += 1;
  } else {
    // Quality < 3 indicates an incorrect response, reset repetition
    repetition = 0;
    interval = 1;
  }

  // Update easiness factor
  easinessFactor = easinessFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easinessFactor < 1.3) {
    easinessFactor = 1.3;
  }

  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);

  return {
    repetition,
    easinessFactor,
    interval,
    nextReviewDate: nextReviewDate.toISOString(),
  };
}
