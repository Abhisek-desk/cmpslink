# AI integration checklist

The current repository contains an AI service scaffold and deterministic fallback scoring. For a real AI implementation, add the following.

## 1. Resume AI

Add:
- PDF/DOCX text extraction
- LLM structured extraction
- Validation against a JSON schema
- Resume parsing for skills, projects, certifications, experience and education
- Store the structured profile in MongoDB

Recommended flow:

Resume → text extraction → LLM structured JSON → validation → Student document

## 2. Semantic recruiter matching

Add:
- Embedding model
- Vector database/search (MongoDB Atlas Vector Search or another vector store)
- Job-description embedding
- Student-profile/resume embedding
- Cosine/vector similarity
- Hybrid ranking: hard eligibility rules + semantic similarity + readiness

Example:
final = 30% eligibility + 50% semantic/skill match + 20% readiness

Do not allow semantic similarity to override mandatory CGPA/branch/backlog requirements.

## 3. Explainable AI

For every recommendation return:
- matched requirements
- missing skills
- academic eligibility
- relevant projects/certifications
- readiness contribution
- confidence/limitations

Avoid opaque “AI says yes/no” decisions.

## 4. At-risk prediction

Collect historical data:
- student attributes
- assessment scores
- number of applications
- interview outcomes
- skill gaps
- placement outcome

Train/evaluate a classification model. Start with Logistic Regression, Random Forest or Gradient Boosting before trying complex models.

Evaluate:
- precision
- recall
- F1
- ROC-AUC
- calibration

## 5. AI preparation assistant

Add an LLM chatbot that can:
- explain eligibility
- explain skill gaps
- generate a preparation plan
- recommend practice topics
- answer placement FAQs

Ground answers in the student's stored profile and current drive rules. Do not let the chatbot invent eligibility criteria.

## 6. Mock interview

Optional advanced feature:
- question generation
- answer evaluation
- rubric-based feedback
- communication analysis
- store scores separately from subjective AI comments

## 7. Notifications

Add email/SMS/push provider for:
- shortlist
- interview schedule
- document deadlines
- offer updates
- mentor escalation

## 8. Security

Before production:
- secure JWT/session strategy
- password hashing
- role/permission checks
- rate limiting
- input validation
- file-type/size validation
- malware scanning for uploads
- audit logs
- encryption and privacy controls

## 9. Data and evaluation

The problem statement allows simulated or publicly available placement/recruitment datasets. Build a clean evaluation dataset and report matching/scoring accuracy/performance.

For a hackathon, demonstrate:
1. 100–500 simulated students
2. 3+ simulated drives
3. 5–10 job roles
4. known ground-truth eligibility
5. matching metrics
6. scheduling conflicts
7. offer lifecycle
8. dashboard analytics

## 10. LLM/provider configuration

Keep the provider behind an adapter:

`backend/src/services/aiProvider.js`

Possible choices include a hosted LLM API, an open-source model served locally, or another approved provider. Add the corresponding API key/model settings to `.env`; never commit secrets.

The supplied problem statement says teams may use AI, ML, NLP, recommendation systems, large language models, predictive analytics or hybrid rule + AI models. It does not mandate a particular vendor/model.
