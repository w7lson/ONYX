import React from 'react';
import Quiz from '../components/Onboarding/Quiz';

export default function Onboarding() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-4xl space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                        Tailor Your Learning Experience
                    </h1>
                    <p className="mt-2 text-lg text-gray-600">
                        Answer a few questions to help our AI design the perfect plan for you.
                    </p>
                </div>
                <Quiz />
            </div>
        </div>
    );
}
