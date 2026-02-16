import { Layers, Timer, Brain, RefreshCw, MessageSquare, FileQuestion } from 'lucide-react';
import TechniqueCard from '../components/Learning/TechniqueCard';

const techniques = [
    {
        icon: Layers,
        title: 'Spaced Repetition',
        description: 'Review material at increasing intervals to move it into long-term memory.',
        steps: [
            'Learn something new (a fact, concept, or vocabulary word).',
            'Review it after a short gap — say 1 day.',
            'If you remembered it, wait longer before the next review (3 days, then 7, then 14...).',
            'If you forgot, reset the interval and review again soon.',
        ],
        linkTo: '/flashcards',
        linkLabel: 'Try Flashcards',
    },
    {
        icon: Timer,
        title: 'Pomodoro Technique',
        description: 'Work in focused bursts with regular breaks to maintain concentration.',
        steps: [
            'Pick one task to focus on.',
            'Set a timer for 25 minutes (one "pomodoro") and work with zero distractions.',
            'When the timer rings, take a 5-minute break.',
            'After 4 pomodoros, take a longer 15-30 minute break.',
        ],
        linkTo: '/pomodoro',
        linkLabel: 'Start a Pomodoro',
    },
    {
        icon: Brain,
        title: 'Memory Palace',
        description: 'Link information to familiar locations in your mind to remember it easily.',
        steps: [
            'Think of a place you know really well (your house, your walk to school).',
            'Pick specific spots along the route (front door, kitchen table, couch).',
            'Mentally place each thing you need to remember at one of those spots.',
            'To recall, mentally walk through the place and "see" each item where you left it.',
        ],
    },
    {
        icon: RefreshCw,
        title: 'Active Recall',
        description: 'Test yourself instead of re-reading — it strengthens memory far more.',
        steps: [
            'After reading or watching a lesson, close the material.',
            'Try to write down or say out loud everything you remember.',
            'Check what you got right and what you missed.',
            'Focus your next study session on the gaps.',
        ],
        linkTo: '/flashcards',
        linkLabel: 'Practice with Flashcards',
    },
    {
        icon: MessageSquare,
        title: 'Feynman Technique',
        description: 'Explain a topic in simple words — if you can\'t, you don\'t truly understand it.',
        steps: [
            'Choose a concept you want to understand.',
            'Explain it in plain, simple language as if teaching a 12-year-old.',
            'Identify any parts where your explanation breaks down or gets vague.',
            'Go back to the source material, fill the gaps, and simplify your explanation again.',
        ],
    },
    {
        icon: FileQuestion,
        title: 'Testing After Learning',
        description: 'Take a quiz or test right after studying to lock in what you learned.',
        steps: [
            'Study a topic for a set amount of time.',
            'Immediately take a practice test or quiz on that topic.',
            'Review your wrong answers and understand why you got them wrong.',
            'Re-test on your weak areas within a day or two.',
        ],
        linkTo: '/tests',
        linkLabel: 'Take an AI Test',
    },
];

export default function Learning() {
    return (
        <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Learning Techniques</h1>
            <p className="text-gray-500 mb-8">
                Science-backed study methods explained in plain language. Click any technique to learn how it works.
            </p>

            <div className="space-y-3">
                {techniques.map((technique) => (
                    <TechniqueCard key={technique.title} {...technique} />
                ))}
            </div>
        </div>
    );
}
