// components/StatusCard.jsx
import React from "react";

const STATE = {
  idle: "idle",
  loading: "loading",
  success: "success",
  error: "error",
};

export default function StatusCard({ title, endpoint, onFetch }) {
  const [state, setState] = React.useState(STATE.idle);
  const [data, setData] = React.useState(null);
  const [error, setError] = React.useState(null);
  const [elapsed, setElapsed] = React.useState(null);

  async function handleFetch() {
    setState(STATE.loading);
    setData(null);
    setError(null);
    const t0 = performance.now();
    try {
      const result = await onFetch();
      setElapsed(Math.round(performance.now() - t0));
      setData(result);
      setState(STATE.success);
    } catch (err) {
      setElapsed(Math.round(performance.now() - t0));
      setError(err.message);
      setState(STATE.error);
    }
  }

  const statusDot =
    state === STATE.idle
      ? "dot dot--idle"
      : state === STATE.loading
      ? "dot dot--loading"
      : state === STATE.success
      ? "dot dot--success"
      : "dot dot--error";

  return (
    <div className={`card card--${state}`}>
      <div className="card__header">
        <div className="card__title-row">
          <span className={statusDot} aria-hidden="true" />
          <h2 className="card__title">{title}</h2>
        </div>
        <code className="card__endpoint">{endpoint}</code>
      </div>

      <button
        className="btn"
        onClick={handleFetch}
        disabled={state === STATE.loading}
        aria-busy={state === STATE.loading}
      >
        {state === STATE.loading ? (
          <span className="btn__spinner" />
        ) : (
          "Run probe"
        )}
      </button>

      {state !== STATE.idle && (
        <div className="card__result">
          <div className="card__meta">
            <span className={`badge badge--${state}`}>
              {state.toUpperCase()}
            </span>
            {elapsed !== null && (
              <span className="card__elapsed">{elapsed} ms</span>
            )}
          </div>

          {state === STATE.error && (
            <pre className="card__pre card__pre--error">{error}</pre>
          )}

          {state === STATE.success && data && (
            <pre className="card__pre card__pre--success">
              {JSON.stringify(data, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
