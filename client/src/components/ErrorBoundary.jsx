import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        console.error("Uncaught Error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                    <div className="bg-white p-8 rounded-3xl shadow-xl max-w-lg w-full text-center">
                        <div className="text-4xl mb-4">😿</div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
                        <p className="text-gray-500 mb-6">We're sorry, an unexpected error occurred.</p>

                        <div className="bg-red-50 p-4 rounded-xl text-left mb-6 overflow-auto max-h-48 text-xs font-mono text-red-700">
                            {this.state.error && this.state.error.toString()}
                            <br />
                            {this.state.errorInfo && this.state.errorInfo.componentStack}
                        </div>

                        <button
                            onClick={() => {
                                localStorage.clear();
                                window.location.href = '/#/';
                                window.location.reload();
                            }}
                            className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition-colors w-full"
                        >
                            Clear Cache & Restart
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
