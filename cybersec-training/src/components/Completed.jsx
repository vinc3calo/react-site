export default function Completed({ flags, onRestart }) {
  const finalFlag = `FLAG{${flags.join('')}}`;

  return (
    <div className="centered">
      <div className="panel">
        <h1 className="success">MISSION COMPLETE</h1>

        <p>{finalFlag}</p>

        <button onClick={onRestart}>
          Restart Mission
        </button>
      </div>
    </div>
  );
}