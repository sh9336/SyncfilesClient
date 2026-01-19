
import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "./ui/button";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex h-screen w-full flex-col items-center justify-center bg-background p-4 text-foreground">
                    <div className="max-w-md text-center">
                        <h1 className="mb-4 text-4xl font-bold text-destructive">Oops!</h1>
                        <p className="mb-6 text-lg text-muted-foreground">
                            Something went wrong. We apologize for the inconvenience.
                        </p>
                        <div className="mb-6 rounded-md bg-muted p-4 text-left font-mono text-sm">
                            {this.state.error?.message || "Unknown error"}
                        </div>
                        <Button
                            onClick={() => {
                                this.setState({ hasError: false, error: null });
                                window.location.reload();
                            }}
                            variant="default"
                            className="bg-primary hover:bg-primary/90"
                        >
                            Refresh Page
                        </Button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
