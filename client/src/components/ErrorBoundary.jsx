import { Component } from 'react';

export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        console.error('ErrorBoundary caught:', error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                        <span className="text-red-500 text-2xl">!</span>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                        Something went wrong
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">
                        An unexpected error occurred. Try refreshing the page.
                    </p>
                    <button
                        onClick={() => this.setState({ hasError: false, error: null })}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                        Try again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
