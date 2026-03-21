import { useState } from 'react';

export default function MITMLab({ onComplete }) {
  const [input, setInput] = useState('');

  return (
    <div className="panel">
      <h3>MITM Simulation</h3>

      <p>
        The attacker intercepted credentials during transmission.
      </p>

      <pre>
username=admin  
password=???
      </pre>

      <input
        placeholder="Enter captured password"
        onChange={(e) => setInput(e.target.value)}
      />

      <button
        onClick={() =>
          input === 'admin123'
            ? onComplete('mitm_')
            : alert('Incorrect')
        }
      >
        Submit
      </button>
    </div>
  );
}