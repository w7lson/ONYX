// Template browser data: 5 focus categories, each with 2 topics, each with 2-3 pre-made goals
// All text uses i18n keys resolved at render time

const T = (category, topic, goal, field) =>
    `goals.templateBrowser.${category}.${topic}.${goal}.${field}`;

const goal = (category, topic, key, focus, duration, milestoneCount) => ({
    key,
    focus,
    duration,
    titleKey: T(category, topic, key, 'title'),
    milestoneKeys: Array.from({ length: milestoneCount }, (_, i) =>
        T(category, topic, key, `m${i + 1}`)
    ),
});

export const TEMPLATE_CATEGORIES = [
    {
        focusKey: 'careerWork',
        topics: [
            {
                topicKey: 'interpersonalSkills',
                goals: [
                    goal('careerWork', 'interpersonalSkills', 'publicSpeaker', 'careerWork', 'shortTerm', 6),
                    goal('careerWork', 'interpersonalSkills', 'negotiation', 'careerWork', 'shortTerm', 5),
                ],
            },
            {
                topicKey: 'jobsEmployment',
                goals: [
                    goal('careerWork', 'jobsEmployment', 'newJob', 'careerWork', 'monthly', 6),
                    goal('careerWork', 'jobsEmployment', 'promotion', 'careerWork', 'shortTerm', 5),
                ],
            },
        ],
    },
    {
        focusKey: 'healthFitness',
        topics: [
            {
                topicKey: 'weightManagement',
                goals: [
                    goal('healthFitness', 'weightManagement', 'loseWeight', 'healthFitness', 'monthly', 6),
                    goal('healthFitness', 'weightManagement', 'healthyEating', 'healthFitness', 'monthly', 5),
                ],
            },
            {
                topicKey: 'exerciseTraining',
                goals: [
                    goal('healthFitness', 'exerciseTraining', 'workoutRoutine', 'healthFitness', 'monthly', 5),
                    goal('healthFitness', 'exerciseTraining', 'run5k', 'healthFitness', 'monthly', 6),
                ],
            },
        ],
    },
    {
        focusKey: 'educationLearning',
        topics: [
            {
                topicKey: 'languages',
                goals: [
                    goal('educationLearning', 'languages', 'learnLanguage', 'educationLearning', 'shortTerm', 6),
                    goal('educationLearning', 'languages', 'proficiencyExam', 'educationLearning', 'shortTerm', 5),
                ],
            },
            {
                topicKey: 'skillsDevelopment',
                goals: [
                    goal('educationLearning', 'skillsDevelopment', 'onlineCert', 'educationLearning', 'monthly', 5),
                    goal('educationLearning', 'skillsDevelopment', 'learnToCode', 'educationLearning', 'shortTerm', 6),
                ],
            },
        ],
    },
    {
        focusKey: 'personalGrowth',
        topics: [
            {
                topicKey: 'readingKnowledge',
                goals: [
                    goal('personalGrowth', 'readingKnowledge', 'read12Books', 'personalGrowth', 'monthly', 6),
                    goal('personalGrowth', 'readingKnowledge', 'journaling', 'personalGrowth', 'monthly', 5),
                ],
            },
            {
                topicKey: 'productivity',
                goals: [
                    goal('personalGrowth', 'productivity', 'timeManagement', 'personalGrowth', 'monthly', 5),
                    goal('personalGrowth', 'productivity', 'morningRoutine', 'personalGrowth', 'monthly', 5),
                ],
            },
        ],
    },
    {
        focusKey: 'moneyFinance',
        topics: [
            {
                topicKey: 'saving',
                goals: [
                    goal('moneyFinance', 'saving', 'emergencyFund', 'moneyFinance', 'shortTerm', 5),
                    goal('moneyFinance', 'saving', 'majorPurchase', 'moneyFinance', 'shortTerm', 5),
                ],
            },
            {
                topicKey: 'budgetingInvesting',
                goals: [
                    goal('moneyFinance', 'budgetingInvesting', 'monthlyBudget', 'moneyFinance', 'monthly', 5),
                    goal('moneyFinance', 'budgetingInvesting', 'startInvesting', 'moneyFinance', 'shortTerm', 5),
                ],
            },
        ],
    },
];
