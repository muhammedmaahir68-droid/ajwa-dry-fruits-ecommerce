import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import store from './store'
import {Provider } from 'react-redux';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "40px", fontFamily: "sans-serif", textAlign: "center" }}>
          <h2>Something went wrong while displaying this page.</h2>
          <pre style={{ background: "#f4f4f4", padding: "15px", textAlign: "left", borderRadius: "5px", color: "#d9534f" }}>
            {this.state.error?.toString()}
          </pre>
          <button onClick={() => window.location.reload()} className="btn btn-primary mt-3">
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    <Provider store={store}>
      <App />
    </Provider>
  </ErrorBoundary>
);

