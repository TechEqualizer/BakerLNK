import { Component } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { productionLogger } from '@/utils/logger';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // Log error to production logging service
        productionLogger.error('Application Error Boundary', {
            error: error.toString(),
            errorInfo: errorInfo.componentStack,
            url: window.location.href,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
        });
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
                    <Card className="max-w-md w-full">
                        <CardHeader className="text-center">
                            <div className="flex justify-center mb-4">
                                <AlertTriangle className="h-12 w-12 text-destructive" />
                            </div>
                            <CardTitle>Something went wrong</CardTitle>
                            <CardDescription>
                                We apologize for the inconvenience. The error has been logged and we'll look into it.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="text-center space-y-4">
                            {import.meta.env.DEV && this.state.error && (
                                <div className="text-left bg-gray-100 p-3 rounded text-sm">
                                    <p className="font-mono text-xs break-all">
                                        {this.state.error.toString()}
                                    </p>
                                </div>
                            )}
                            <Button onClick={this.handleReset} className="gap-2">
                                <RefreshCw className="h-4 w-4" />
                                Reload Page
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;