export const level2 = {
  id: "operation_shadow_escalation",
  title: "Operation Shadow Escalation",

  phases: [
    {
      id: "intrusion",
      title: "Intrusion Detection",
      component: "Intrusion"
    },
    {
      id: "lateral_movement",
      title: "Lateral Movement Tracking",
      component: "LateralMovement"
    },
    {
      id: "privilege_escalation",
      title: "Privilege Escalation Detection",
      component: "PrivilegeEscalation"
    },
    {
      id: "data_exfiltration",
      title: "Data Exfiltration Analysis",
      component: "DataExfiltration"
    },
    {
      id: "containment",
      title: "Threat Containment",
      component: "Containment"
    }
  ]
};