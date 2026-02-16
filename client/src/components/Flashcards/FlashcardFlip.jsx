import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export default function FlashcardFlip({ card, flipped, onFlip }) {
    const { t } = useTranslation();

    return (
        <div
            className="w-full max-w-lg mx-auto cursor-pointer"
            style={{ perspective: '1000px' }}
            onClick={onFlip}
        >
            <motion.div
                className="relative w-full"
                style={{ transformStyle: 'preserve-3d' }}
                animate={{ rotateY: flipped ? 180 : 0 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
            >
                {/* Front */}
                <div
                    className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 min-h-[280px] flex flex-col items-center justify-center"
                    style={{ backfaceVisibility: 'hidden' }}
                >
                    <p className="text-xl font-semibold text-gray-800 dark:text-gray-100 text-center">
                        {card.front}
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-6">
                        {t('flashcards.tapToFlip')}
                    </p>
                </div>

                {/* Back */}
                <div
                    className="absolute inset-0 bg-blue-50 dark:bg-blue-950 rounded-2xl shadow-xl border border-blue-200 dark:border-blue-800 p-8 min-h-[280px] flex items-center justify-center"
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                    <p className="text-xl text-gray-800 dark:text-gray-100 text-center">
                        {card.back}
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
