import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import FlashcardFlip from './FlashcardFlip';

const qualityMap = [
    { key: 'again', value: 1, color: 'bg-red-500 hover:bg-red-600' },
    { key: 'hard', value: 2, color: 'bg-orange-500 hover:bg-orange-600' },
    { key: 'good', value: 3, color: 'bg-green-500 hover:bg-green-600' },
    { key: 'easy', value: 5, color: 'bg-blue-500 hover:bg-blue-600' },
];

export default function ReviewMode({ cards, onReview, onBack }) {
    const { t } = useTranslation();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const [completed, setCompleted] = useState(false);
    const [reviewedCount, setReviewedCount] = useState(0);

    const currentCard = cards[currentIndex];

    const handleRate = async (quality) => {
        await onReview(currentCard.id, quality);
        setFlipped(false);
        setReviewedCount(prev => prev + 1);

        if (currentIndex + 1 < cards.length) {
            setCurrentIndex(prev => prev + 1);
        } else {
            setCompleted(true);
        }
    };

    if (completed) {
        return (
            <div className="max-w-xl mx-auto text-center py-12">
                <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                    {t('flashcards.reviewComplete')}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                    {t('flashcards.cardsReviewed', { count: reviewedCount })}
                </p>
                <button
                    onClick={onBack}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                    {t('flashcards.backToDecks')}
                </button>
            </div>
        );
    }

    return (
        <div>
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-6 transition-colors"
            >
                <ArrowLeft size={18} />
                {t('flashcards.backToDecks')}
            </button>

            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-6">
                {t('flashcards.cardOf', { current: currentIndex + 1, total: cards.length })}
            </p>

            <FlashcardFlip
                card={currentCard}
                flipped={flipped}
                onFlip={() => setFlipped(!flipped)}
            />

            {flipped && (
                <div className="flex justify-center gap-3 mt-8">
                    {qualityMap.map(({ key, value, color }) => (
                        <button
                            key={key}
                            onClick={() => handleRate(value)}
                            className={`px-5 py-2.5 text-white rounded-lg font-medium transition-colors ${color}`}
                        >
                            {t(`flashcards.${key}`)}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
