import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';
import TestList, { EXAMPLE_TEST } from '../components/Tests/TestList';
import TestTaking from '../components/Tests/TestTaking';
import TestResults from '../components/Tests/TestResults';

export default function Tests() {
    const { getToken } = useAuth();
    const [view, setView] = useState('list');
    const [tests, setTests] = useState([]);
    const [activeTest, setActiveTest] = useState(null);
    const [generating, setGenerating] = useState(false);

    const authHeaders = useCallback(async () => {
        const token = await getToken();
        return { headers: { Authorization: `Bearer ${token}` } };
    }, [getToken]);

    const fetchTests = useCallback(async () => {
        try {
            const config = await authHeaders();
            const res = await axios.get('/api/tests', config);
            setTests(res.data);
        } catch (error) {
            console.error('Failed to fetch tests:', error);
        }
    }, [authHeaders]);

    useEffect(() => { fetchTests(); }, [fetchTests]);

    const handleCreateTest = async ({ topic, content, questionCount }) => {
        setGenerating(true);
        try {
            const config = await authHeaders();
            const res = await axios.post('/api/tests/generate', { topic, content, questionCount }, config);
            setActiveTest(res.data);
            setView('taking');
            fetchTests();
        } catch (error) {
            console.error('Failed to generate test:', error);
        } finally {
            setGenerating(false);
        }
    };

    const handleSelectTest = async (test) => {
        if (test.id === '__example__') {
            setActiveTest(EXAMPLE_TEST);
            setView('taking');
            return;
        }
        try {
            const config = await authHeaders();
            const res = await axios.get(`/api/tests/${test.id}`, config);
            setActiveTest(res.data);
            setView(res.data.completedAt ? 'results' : 'taking');
        } catch (error) {
            console.error('Failed to fetch test:', error);
        }
    };

    const handleSubmitExample = (answers) => {
        const questions = activeTest.questions;
        const graded = questions.map(q => ({
            ...q,
            userAnswer: answers.find(a => a.questionId === q.id)?.userAnswer || null,
            isCorrect: (answers.find(a => a.questionId === q.id)?.userAnswer || null) === q.correctAnswer,
        }));
        const score = Math.round((graded.filter(q => q.isCorrect).length / graded.length) * 100);
        const prevAttempts = activeTest.attempts || [];
        const newAttempt = { id: `ex-${Date.now()}`, score, completedAt: new Date().toISOString() };
        setActiveTest({
            ...EXAMPLE_TEST,
            questions: graded,
            score,
            completedAt: new Date().toISOString(),
            attempts: [...prevAttempts, newAttempt],
        });
        setView('results');
    };

    const handleSubmit = async (answers) => {
        if (!activeTest) return;
        if (activeTest.id === '__example__') {
            handleSubmitExample(answers);
            return;
        }
        try {
            const config = await authHeaders();
            const res = await axios.post(`/api/tests/${activeTest.id}/submit`, { answers }, config);
            setActiveTest(res.data);
            setView('results');
            fetchTests();
        } catch (error) {
            console.error('Failed to submit test:', error);
        }
    };

    const handleRetake = () => {
        setView('taking');
    };

    const handleDeleteTest = async (testId) => {
        try {
            const config = await authHeaders();
            await axios.delete(`/api/tests/${testId}`, config);
            fetchTests();
        } catch (error) {
            console.error('Failed to delete test:', error);
        }
    };

    const handleBackToList = () => {
        setView('list');
        setActiveTest(null);
        fetchTests();
    };

    if (view === 'results' && activeTest) {
        return <TestResults test={activeTest} onBack={handleBackToList} onRetake={handleRetake} />;
    }

    if (view === 'taking' && activeTest) {
        return <TestTaking test={activeTest} onSubmit={handleSubmit} onBack={handleBackToList} />;
    }

    return (
        <TestList
            tests={tests}
            onCreateTest={handleCreateTest}
            generating={generating}
            onSelectTest={handleSelectTest}
            onDeleteTest={handleDeleteTest}
        />
    );
}
