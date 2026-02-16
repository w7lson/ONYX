import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function TechniqueCard({ icon: Icon, title, description, steps, linkTo, linkLabel }) {
    const [expanded, setExpanded] = useState(false);
    const { t } = useTranslation();

    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center gap-4 p-5 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center shrink-0">
                    <Icon size={24} className="text-blue-600" />
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>
                </div>
                <motion.div
                    animate={{ rotate: expanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <ChevronDown size={20} className="text-gray-400 dark:text-gray-500" />
                </motion.div>
            </button>

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        <div className="px-5 pb-5 pt-0">
                            <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    {t('learning.howItWorks')}
                                </h4>
                                <ul className="space-y-2">
                                    {steps.map((step, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                                            <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                                                {i + 1}
                                            </span>
                                            {step}
                                        </li>
                                    ))}
                                </ul>
                                {linkTo && (
                                    <a
                                        href={linkTo}
                                        className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg font-medium hover:bg-blue-700 transition-colors"
                                    >
                                        {linkLabel || t('learning.tryIt')}
                                    </a>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
