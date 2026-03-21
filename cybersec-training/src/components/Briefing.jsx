export default function Briefing({ onStart }) {
  return (

      <div className="">
        <h1>Mission Briefing</h1>
        <h2>Operation Shadow Entry</h2>
        <p>
          You are assigned as a Security Operations Center (SOC) analyst.
        </p>
        <p>
          Earlier today, an employee reported a suspicious email claiming to be a password reset request.
          Shortly after, abnormal login activity was detected on the internal network.
        </p>
        <p>
          Initial indicators suggest that an attacker may have gained unauthorized access.
        </p>
        <hr />
        <h3>Objectives</h3>
        <ul>
          <li>Analyze phishing attempt</li>
          <li>Recover compromised credentials</li>
          <li>Investigate network activity</li>
          <li>Identify attacker behavior</li>
          <li>Contain the incident</li>
        </ul>
        <hr />
        <h3>Rules of Engagement</h3>
        <ul>
          <li>Work sequentially through each phase</li>
          <li>Validate findings before proceeding</li>
          <li>Incorrect actions may reduce score</li>
        </ul>
        <hr />
        <h3>Mission Status</h3>
        <p className="warning">Threat Active</p>
        <button onClick={onStart}>
          Begin Operation
        </button>
      </div>
  );
}