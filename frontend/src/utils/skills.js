/**
 * CAMPUSLINK Skill Normalizer
 *
 * Converts different ways of writing the same technology
 * into one canonical skill name.
 */

const SKILL_ALIASES = {
  // Frontend
  react: "React",
  "react.js": "React",
  reactjs: "React",
  "react js": "React",

  "next.js": "Next.js",
  nextjs: "Next.js",
  "next js": "Next.js",

  vue: "Vue.js",
  "vue.js": "Vue.js",
  vuejs: "Vue.js",

  angular: "Angular",
  angularjs: "Angular",

  // Backend
  node: "Node.js",
  nodejs: "Node.js",
  "node.js": "Node.js",
  "node js": "Node.js",

  express: "Express.js",
  expressjs: "Express.js",
  "express.js": "Express.js",
  "express js": "Express.js",

  // Databases
  mongodb: "MongoDB",
  "mongo db": "MongoDB",
  "mongo-db": "MongoDB",
  "mongo database": "MongoDB",

  mysql: "MySQL",
  "my sql": "MySQL",

  postgresql: "PostgreSQL",
  postgres: "PostgreSQL",
  "postgre sql": "PostgreSQL",

  sql: "SQL",

  // Languages
  javascript: "JavaScript",
  js: "JavaScript",

  typescript: "TypeScript",
  ts: "TypeScript",

  python: "Python",
  java: "Java",
  cpp: "C++",
  "c++": "C++",
  c: "C#",

  // Styling
  html: "HTML",
  html5: "HTML",

  css: "CSS",
  css3: "CSS",

  tailwind: "Tailwind CSS",
  "tailwind css": "Tailwind CSS",

  bootstrap: "Bootstrap",

  // DevOps / Cloud
  docker: "Docker",

  kubernetes: "Kubernetes",
  k8s: "Kubernetes",

  aws: "AWS",
  "amazon web services": "AWS",

  azure: "Azure",
  "microsoft azure": "Azure",

  gcp: "Google Cloud",
  "google cloud": "Google Cloud",
  "google cloud platform": "Google Cloud",

  // Version control
  git: "Git",
  github: "GitHub",
  gitlab: "GitLab",

  // AI / ML
  ai: "AI",
  "artificial intelligence": "AI",

  ml: "Machine Learning",
  "machine learning": "Machine Learning",

  tensorflow: "TensorFlow",
  pytorch: "PyTorch",
};

/**
 * Basic cleanup.
 */
function cleanSkill(skill) {
  return String(skill || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

/**
 * Convert a skill to its canonical name.
 */
export function normalizeSkill(skill) {
  const cleaned = cleanSkill(skill);

  if (!cleaned) {
    return "";
  }

  return (
    SKILL_ALIASES[cleaned] ||
    String(skill).trim()
  );
}

/**
 * Normalize an entire skill array.
 *
 * Also removes duplicates.
 */
export function normalizeSkills(skills = []) {
  return [
    ...new Map(
      skills
        .filter(Boolean)
        .map((skill) => {
          const normalized = normalizeSkill(skill);

          return [
            normalized.toLowerCase(),
            normalized,
          ];
        })
    ).values(),
  ];
}

/**
 * Check whether two skills represent the same technology.
 */
export function skillsMatch(skillA, skillB) {
  const a = normalizeSkill(skillA).toLowerCase();
  const b = normalizeSkill(skillB).toLowerCase();

  return Boolean(a && b && a === b);
}

/**
 * Check whether a required skill exists in student's skills.
 */
export function hasSkill(studentSkills = [], requiredSkill) {
  return studentSkills.some((skill) =>
    skillsMatch(skill, requiredSkill)
  );
}

/**
 * Find matched skills.
 */
export function getMatchedSkills(
  studentSkills = [],
  requiredSkills = []
) {
  return requiredSkills.filter((requiredSkill) =>
    hasSkill(studentSkills, requiredSkill)
  );
}

/**
 * Find missing skills.
 */
export function getMissingSkills(
  studentSkills = [],
  requiredSkills = []
) {
  return requiredSkills.filter(
    (requiredSkill) =>
      !hasSkill(studentSkills, requiredSkill)
  );
}
