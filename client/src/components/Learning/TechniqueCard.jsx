import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function TechniqueCard({ icon: Icon, title, description, steps, linkTo, linkLabel }) {
    const [expanded, setExpanded] = useState(false);
    const { t } = useTranslation();

    return (
        <div className="bg-[#161A22] rounded-lg border border-white/[0.06] overflow-hidden">
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center gap-4 p-5 text-left hover:bg-white/[0.04] transition-colors cursor-pointer"
            >
                <div className="w-12 h-12 rounded-md bg-primary-500/10 flex items-center justify-center shrink-0">
                    <Icon size={24} className="text-primary-500" />
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
                    <p className="text-sm text-slate-400 mt-0.5">{description}</p>
                </div>
                <motion.div
                    animate={{ rotate: expanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <ChevronDown size={20} className="text-slate-500" />
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
                            <div className="border-t border-white/[0.06] pt-4">
                                <h4 className="text-sm font-semibold text-slate-300 mb-2">
                                    {t('learning.howItWorks')}
                                </h4>
                                <ul className="space-y-2">
                                    {steps.map((step, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                                            <span className="w-5 h-5 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                                                {i + 1}
                                            </span>
                                            {step}
                                        </li>
                                    ))}
                                </ul>
                                {linkTo && (
                                    <a
                                        href={linkTo}
                                        className="inline-block mt-4 px-4 py-2 bg-primary-600 text-white text-sm rounded-md font-medium hover:bg-primary-700 transition-colors"
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
