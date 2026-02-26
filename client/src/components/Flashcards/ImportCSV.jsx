import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, FileText, AlertTriangle, X } from 'lucide-react';

function parseCSVLine(line, delimiter) {
    const fields = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (inQuotes) {
            if (char === '"' && line[i + 1] === '"') {
                current += '"';
                i++;
            } else if (char === '"') {
                inQuotes = false;
            } else {
                current += char;
            }
        } else {
            if (char === '"') {
                inQuotes = true;
            } else if (char === delimiter) {
                fields.push(current);
                current = '';
            } else {
                current += char;
            }
        }
    }
    fields.push(current);
    return fields;
}

function detectDelimiter(lines) {
    // Count tabs vs commas across first few lines to pick delimiter
    const sample = lines.slice(0, Math.min(5, lines.length));
    const tabCount = sample.reduce((sum, line) => sum + (line.match(/\t/g) || []).length, 0);
    const commaCount = sample.reduce((sum, line) => sum + (line.match(/,/g) || []).length, 0);
    // If tabs appear consistently, use tab; otherwise use comma
    const linesWithTabs = sample.filter(l => l.includes('\t')).length;
    if (linesWithTabs >= sample.length * 0.5 && tabCount >= linesWithTabs) return '\t';
    return ',';
}

function isHeaderRow(fields) {
    const joined = fields.map(f => f.trim().toLowerCase()).join(' ');
    return (joined.includes('front') || joined.includes('question') || joined.includes('term'))
        && (joined.includes('back') || joined.includes('answer') || joined.includes('definition'));
}

function parseCSV(text) {
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length === 0) return { cards: [], skipped: 0 };

    const delimiter = detectDelimiter(lines);

    // Check if first line is a header
    let startIndex = 0;
    const headerFields = parseCSVLine(lines[0], delimiter);
    if (isHeaderRow(headerFields)) {
        startIndex = 1;
    }

    const cards = [];
    let skipped = 0;

    for (let i = startIndex; i < lines.length; i++) {
        let fields = parseCSVLine(lines[i], delimiter);

        // Handle badly converted CSVs where entire tab-delimited line is wrapped in quotes
        if (fields.length === 1 && fields[0].includes('\t')) {
            fields = fields[0].split('\t');
        }

        const front = fields[0]?.trim();
        // If more than 2 fields, join the rest as back (handles unquoted commas in values)
        const back = fields.length > 2
            ? fields.slice(1).join(delimiter === '\t' ? '\t' : ', ').trim()
            : fields[1]?.trim();

        if (front && back) {
            cards.push({ front, back });
        } else {
            skipped++;
        }
    }

    return { cards, skipped };
}

export default function ImportCSV({ decks, onImport, onClose }) {
    const { t } = useTranslation();
    const fileInputRef = useRef(null);
    const [parsedCards, setParsedCards] = useState([]);
    const [skippedCount, setSkippedCount] = useState(0);
    const [fileName, setFileName] = useState('');
    const [target, setTarget] = useState('new'); // 'new' | 'existing'
    const [newDeckTitle, setNewDeckTitle] = useState('');
    const [selectedDeckId, setSelectedDeckId] = useState(decks[0]?.id || '');
    const [importing, setImporting] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setError('');
        setFileName(file.name);

        // Default new deck title from filename
        const nameWithoutExt = file.name.replace(/\.(csv|tsv|txt)$/i, '');
        setNewDeckTitle(nameWithoutExt);

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target.result;
            const { cards, skipped } = parseCSV(text);
            setParsedCards(cards);
            setSkippedCount(skipped);

            if (cards.length === 0) {
                setError(t('flashcards.import.noValidCards'));
            }
        };
        reader.readAsText(file);
    };

    const handleImport = async () => {
        if (parsedCards.length === 0) return;
        if (target === 'new' && !newDeckTitle.trim()) return;
        if (target === 'existing' && !selectedDeckId) return;

        setImporting(true);
        setError('');

        try {
            await onImport({
                cards: parsedCards,
                target,
                newDeckTitle: newDeckTitle.trim(),
                existingDeckId: selectedDeckId,
            });
        } catch (err) {
            setError(t('flashcards.import.error'));
        } finally {
            setImporting(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-teal-200 dark:border-teal-800 p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                    {t('flashcards.import.title')}
                </h3>
                <button
                    onClick={onClose}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                    <X size={18} />
                </button>
            </div>

            {/* File picker */}
            <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-teal-400 dark:hover:border-teal-600 transition-colors mb-4"
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.tsv,.txt"
                    onChange={handleFileChange}
                    className="hidden"
                />
                {fileName ? (
                    <div className="flex items-center justify-center gap-2 text-teal-600 dark:text-teal-400">
                        <FileText size={20} />
                        <span className="font-medium">{fileName}</span>
                    </div>
                ) : (
                    <div>
                        <Upload size={24} className="text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {t('flashcards.import.selectFile')}
                        </p>
                    </div>
                )}
            </div>

            <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
                {t('flashcards.import.formatHint')}
            </p>

            {/* Preview */}
            {parsedCards.length > 0 && (
                <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t('flashcards.import.preview', { count: parsedCards.length })}
                        </span>
                        {skippedCount > 0 && (
                            <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                                <AlertTriangle size={12} />
                                {t('flashcards.import.skipped', { count: skippedCount })}
                            </span>
                        )}
                    </div>
                    <div className="max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                                <tr>
                                    <th className="text-left px-3 py-1.5 text-gray-500 dark:text-gray-400 font-medium">
                                        {t('flashcards.front')}
                                    </th>
                                    <th className="text-left px-3 py-1.5 text-gray-500 dark:text-gray-400 font-medium">
                                        {t('flashcards.back')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {parsedCards.slice(0, 20).map((card, i) => (
                                    <tr key={i} className="border-t border-gray-100 dark:border-gray-800">
                                        <td className="px-3 py-1.5 text-gray-700 dark:text-gray-300 truncate max-w-[200px]">
                                            {card.front}
                                        </td>
                                        <td className="px-3 py-1.5 text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                                            {card.back}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {parsedCards.length > 20 && (
                            <p className="text-xs text-gray-400 text-center py-1.5">
                                +{parsedCards.length - 20} more
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Deck target */}
            {parsedCards.length > 0 && (
                <div className="mb-4 space-y-3">
                    <div className="flex gap-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="importTarget"
                                checked={target === 'new'}
                                onChange={() => setTarget('new')}
                                className="accent-teal-600"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                {t('flashcards.import.createNew')}
                            </span>
                        </label>
                        {decks.length > 0 && (
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="importTarget"
                                    checked={target === 'existing'}
                                    onChange={() => setTarget('existing')}
                                    className="accent-teal-600"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                    {t('flashcards.import.addToExisting')}
                                </span>
                            </label>
                        )}
                    </div>

                    {target === 'new' && (
                        <input
                            type="text"
                            value={newDeckTitle}
                            onChange={(e) => setNewDeckTitle(e.target.value)}
                            placeholder={t('flashcards.import.deckTitle')}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                    )}

                    {target === 'existing' && decks.length > 0 && (
                        <select
                            value={selectedDeckId}
                            onChange={(e) => setSelectedDeckId(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        >
                            {decks.map(d => (
                                <option key={d.id} value={d.id}>{d.title}</option>
                            ))}
                        </select>
                    )}
                </div>
            )}

            {/* Error */}
            {error && (
                <p className="text-sm text-red-500 mb-3">{error}</p>
            )}

            {/* Import button */}
            {parsedCards.length > 0 && (
                <button
                    onClick={handleImport}
                    disabled={importing || (target === 'new' && !newDeckTitle.trim())}
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors disabled:opacity-50"
                >
                    {importing
                        ? t('flashcards.import.importing')
                        : t('flashcards.import.importCards', { count: parsedCards.length })}
                </button>
            )}
        </div>
    );
}
