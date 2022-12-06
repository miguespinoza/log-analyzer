import * as React from "react";
import { FeedbackFormModal } from "./FeedbackForm";

export class LogViewerErrorBoundary extends React.Component<
  { children: React.ReactElement },
  { hasError: boolean; error: any }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: undefined };
  }

  static getDerivedStateFromError(error: any) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div>
          <h1>Something went wrong.</h1>
          <FeedbackFormModal
            setShowModal={(state: boolean) => {
              this.setState({ hasError: state });
            }}
            showModal={this.state.hasError}
            forwardProps={{
              title: "Something went wrong :(",
              exception: this.state.error,
              onComplete: () => {
                this.setState({ hasError: false, error: undefined });
                window.location.reload();
              },
              onCancel: () => {
                this.setState({ hasError: false, error: undefined });
                window.location.reload();
              },
            }}
          />
        </div>
      );
    }

    return this.props.children;
  }
}
