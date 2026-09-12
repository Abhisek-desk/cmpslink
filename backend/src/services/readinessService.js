export function calculateReadiness(student) {
  const technical = Math.min((student.skills?.length || 0) * 10, 100);
  const academics = Math.min((student.cgpa || 0) * 10, 100);
  const aptitude = student.aptitudeScore || 0;
  const interview = student.interviewScore || 0;
  const communication = student.communicationScore || 0;
  const projects = Math.min((student.projects?.length || 0) * 25, 100);
  const backlogPenalty = Math.min((student.backlogs || 0) * 5, 30);

  const score = Math.max(0, Math.round(
    technical * .25 +
    academics * .20 +
    aptitude * .20 +
    interview * .15 +
    communication * .10 +
    projects * .10 -
    backlogPenalty
  ));

  let level = "Not Ready";
  if (score >= 80) level = "Highly Employable";
  else if (score >= 60) level = "Ready";
  else if (score >= 40) level = "Developing";

  return { score, level };
}
