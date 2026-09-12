function norm(value) {
  return String(value || "").trim().toLowerCase();
}

export function matchStudentToJob(student, job) {
  const studentSkills = new Set((student.skills || []).map(norm));
  const required = (job.requiredSkills || []).map(norm);
  const matched = required.filter(s => studentSkills.has(s));
  const missing = required.filter(s => !studentSkills.has(s));

  const cgpaEligible = (student.cgpa || 0) >= (job.minimumCGPA || 0);
  const branchEligible = !job.eligibleBranches?.length || job.eligibleBranches.map(norm).includes(norm(student.branch));

  const eligibilityScore = (cgpaEligible ? 50 : 0) + (branchEligible ? 50 : 0);
  const skillMatchScore = required.length ? Math.round(matched.length / required.length * 100) : 100;
  const readinessScore = student.readinessScore || 0;
  const finalMatchScore = Math.round(eligibilityScore * .30 + skillMatchScore * .50 + readinessScore * .20);

  const reasons = [];
  if (!cgpaEligible) reasons.push(`CGPA ${student.cgpa} is below the required ${job.minimumCGPA}`);
  if (!branchEligible) reasons.push(`Branch ${student.branch} is not in the eligible branch list`);
  if (matched.length) reasons.push(`Matched skills: ${matched.join(", ")}`);
  if (missing.length) reasons.push(`Skill gaps: ${missing.join(", ")}`);

  return {
    eligibilityScore, skillMatchScore, readinessScore, finalMatchScore,
    explanation: reasons.join(". ") || "Strong overall profile match.",
    eligible: cgpaEligible && branchEligible,
    missingSkills: missing,
    matchedSkills: matched
  };
}
