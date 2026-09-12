import { useEffect, useMemo, useRef, useState } from "react";
import { normalizeSkills, hasSkill } from "../utils/skills.js";
import {
  Bot,
  FileText,
  MessageCircle,
  Send,
  ShieldAlert,
  Sparkles,
  Target,
  Upload,
  WandSparkles,
} from "lucide-react";
import api from "../services/api.js";

export default function AICenter() {
  const [profile, setProfile] = useState(null);
  const [resume, setResume] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [gap, setGap] = useState(null);
  const [risk, setRisk] = useState(null);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  const bottom = useRef(null);

  /*
   * IMPORTANT:
   * Do not make the useEffect callback async.
   * React expects the callback to return either:
   *   - nothing
   *   - a cleanup function
   *
   * An async function returns a Promise, which can cause:
   * "destroy is not a function"
   */
  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      try {
        setError("");

        const response = await api.get("/students/me");

        if (mounted) {
          setProfile(response.data);
        }
      } catch (err) {
        console.error("Failed to load student profile:", err);

        if (mounted) {
          setError(
            err?.response?.data?.message ||
              "Unable to load your profile. Please try again.",
          );
        }
      }
    };

    loadProfile();

    // This is a valid cleanup function.
    return () => {
      mounted = false;
    };
  }, []);

  /*
   * Scroll chat to the latest message.
   *
   * This effect intentionally returns nothing.
   */
  useEffect(() => {
    if (bottom.current) {
      bottom.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [chat]);

  const requiredSkills = useMemo(
    () => ["React", "Node.js", "MongoDB", "SQL", "Docker"],
    [],
  );

  const normalizedStudentSkills = useMemo(
    () => normalizeSkills(profile?.skills || []),
    [profile?.skills],
  );

  /*
   * Resume Analyzer
   */
  async function analyzeResume() {
    if (!resume) {
      return;
    }

    setBusy("resume");
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", resume);

      const response = await api.post("/ai/resume/analyze", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const data = response.data;

      setAnalysis(data);

      /*
       * Automatically calculate skill gap after resume analysis.
       */
      if (data?.skills?.length) {
        const gapResponse = await api.post("/ai/skill-gap", {
          studentSkills: data.skills,
          requiredSkills,
        });

        setGap(gapResponse.data);
      }
    } catch (err) {
      console.error("Resume analysis failed:", err);

      setError(
        err?.response?.data?.message ||
          "Resume analysis failed. Make sure the AI service is running.",
      );
    } finally {
      setBusy("");
    }
  }

  /*
   * Skill Gap Analysis
   */
  async function analyzeSkillGap() {
    setBusy("gap");
    setError("");

    try {
      const response = await api.post("/ai/skill-gap", {
        studentSkills: profile?.skills || [],
        requiredSkills,
      });

      setGap(response.data);
    } catch (err) {
      console.error("Skill gap analysis failed:", err);

      setError(
        err?.response?.data?.message || "Unable to analyze your skill gap.",
      );
    } finally {
      setBusy("");
    }
  }

  /*
   * Placement Risk
   */
  async function runRisk() {
    if (!profile) {
      setError("Student profile is not available yet.");
      return;
    }

    setBusy("risk");
    setError("");

    try {
      const response = await api.post("/ai/risk", {
        readinessScore: Number(profile?.readinessScore || 0),
        applications: Number(profile?.applications || 0),
        interviewScore: Number(profile?.interviewScore || 0),
        skillGaps: Number(gap?.missing?.length || 0),
      });

      setRisk(response.data);
    } catch (err) {
      console.error("Risk assessment failed:", err);

      setError(
        err?.response?.data?.message || "Unable to assess placement risk.",
      );
    } finally {
      setBusy("");
    }
  }

  /*
   * AI Chat
   */
  async function send() {
    const question = message.trim();

    if (!question) {
      return;
    }

    setMessage("");

    setChat((currentChat) => [
      ...currentChat,
      {
        role: "user",
        text: question,
      },
    ]);

    setBusy("chat");
    setError("");

    try {
      const response = await api.post("/ai/chat", {
        message: question,
        context: {
          name: profile?.userId?.name,
          branch: profile?.branch,
          cgpa: profile?.cgpa,
          readinessScore: profile?.readinessScore,
          skills: profile?.skills || [],
        },
      });

      setChat((currentChat) => [
        ...currentChat,
        {
          role: "ai",
          text:
            response?.data?.answer ||
            "I received your question but could not generate an answer.",
        },
      ]);
    } catch (err) {
      console.error("AI chat failed:", err);

      setChat((currentChat) => [
        ...currentChat,
        {
          role: "ai",
          text: "I couldn't reach the AI service. Please make sure your FastAPI AI server is running on port 8000 and your Groq API key is configured.",
        },
      ]);
    } finally {
      setBusy("");
    }
  }

  /*
   * Handle Enter key in chat.
   * Shift + Enter can still be used without sending.
   */
  function handleChatKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      send();
    }
  }

  const riskPercent = Math.max(
    0,
    Math.min(100, Number(risk?.riskPercent || 0)),
  );

  return (
    <section className="ai-center">
      {/* HERO */}
      <div className="ai-hero card">
        <div>
          <span className="pill">
            <Sparkles size={13} />
            AI WORKSPACE
          </span>

          <h2>Your placement copilot</h2>

          <p>
            Analyze your resume, identify skill gaps, assess placement risk and
            ask career questions.
          </p>
        </div>

        <div className="ai-orb">
          <Bot size={34} />
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="ai-error">
          <ShieldAlert size={18} />

          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
            className="error-close"
          >
            ×
          </button>
        </div>
      )}

      {/* AI TOOLS */}
      <div className="ai-grid">
        {/* =========================
            RESUME ANALYZER
        ========================== */}
        <div className="card ai-tool">
          <div className="tool-icon">
            <FileText />
          </div>

          <h3>Resume Analyzer</h3>

          <p className="muted">
            Upload PDF, DOCX or TXT. The AI extracts skills, projects and
            certifications.
          </p>

          <label className="file-upload">
            <Upload size={18} />

            <span>{resume ? resume.name : "Choose your resume"}</span>

            <input
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={(event) => {
                const file = event.target.files?.[0] || null;
                setResume(file);
                setAnalysis(null);
                setError("");
              }}
            />
          </label>

          <button
            type="button"
            className="primary"
            onClick={analyzeResume}
            disabled={!resume || busy === "resume"}
          >
            <Upload size={16} />

            {busy === "resume" ? "Analyzing..." : "Analyze resume"}
          </button>

          {analysis && (
            <div className="result-box">
              <span className="pill">{analysis.provider || "AI"}</span>

              <p>
                <b>Skills:</b>{" "}
                {analysis.skills?.length
                  ? analysis.skills.join(", ")
                  : "None detected"}
              </p>

              <p>
                <b>Projects:</b> {analysis.projects?.length || 0}
              </p>

              <p>
                <b>Certifications:</b> {analysis.certifications?.length || 0}
              </p>

              {analysis.education && (
                <p>
                  <b>Education:</b>{" "}
                  {typeof analysis.education === "string"
                    ? analysis.education
                    : "Detected"}
                </p>
              )}

              {analysis.experience && (
                <p>
                  <b>Experience:</b>{" "}
                  {Array.isArray(analysis.experience)
                    ? analysis.experience.length
                    : "Detected"}
                </p>
              )}
            </div>
          )}
        </div>

        {/* =========================
            SKILL GAP
        ========================== */}
        <div className="card ai-tool">
          <div className="tool-icon">
            <Target />
          </div>

          <h3>Skill Gap</h3>

          <p className="muted">
            Compare your profile against a sample full-stack developer role.
          </p>
          <div className="skill-cloud">
            {requiredSkills.map((skill) => {
              const matched = hasSkill(normalizedStudentSkills, skill);

              return (
                <span
                  key={skill}
                  className={matched ? "skill matched" : "skill"}
                >
                  {skill}
                </span>
              );
            })}
          </div>

          {gap && (
            <div className="result-box">
              <b>{gap.matchPercent ?? 0}% match</b>

              {gap.matched?.length > 0 && (
                <p>
                  <b>Matched:</b> {gap.matched.join(", ")}
                </p>
              )}

              <p className="muted">
                <b>Missing:</b>{" "}
                {gap.missing?.length ? gap.missing.join(", ") : "No major gaps"}
              </p>

              {gap.recommendations?.length > 0 && (
                <div>
                  <b>Recommendations:</b>

                  <ul>
                    {gap.recommendations.map((recommendation, index) => (
                      <li key={index}>{recommendation}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={analyzeSkillGap}
            disabled={busy === "gap"}
          >
            <WandSparkles size={16} />

            {busy === "gap" ? "Checking..." : "Analyze my gap"}
          </button>
        </div>

        {/* =========================
            PLACEMENT RISK
        ========================== */}
        <div className="card ai-tool">
          <div className="tool-icon">
            <ShieldAlert />
          </div>

          <h3>Placement Risk</h3>

          <p className="muted">
            A transparent risk indicator based on readiness, interview
            performance and skill gaps.
          </p>

          <div className="risk-meter">
            <div
              style={{
                width: `${riskPercent}%`,
              }}
            />
          </div>

          {risk ? (
            <>
              <div className="risk-number">
                {riskPercent}%<small>{risk.level || "Unknown"} risk</small>
              </div>

              {risk.recommendations?.length > 0 && (
                <div className="result-box">
                  <b>Recommended actions</b>

                  <ul>
                    {risk.recommendations.map((recommendation, index) => (
                      <li key={index}>{recommendation}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <p className="muted">Run an assessment to see your current risk.</p>
          )}

          <button
            type="button"
            onClick={runRisk}
            disabled={!profile || busy === "risk"}
          >
            {busy === "risk" ? "Assessing..." : "Assess placement risk"}
          </button>
        </div>

        {/* =========================
            AI CHAT
        ========================== */}
        <div className="card ai-tool chat-tool">
          <div className="tool-icon">
            <MessageCircle />
          </div>

          <h3>CampusLink AI</h3>

          <p className="muted">
            Ask about your readiness, skills or placement preparation.
          </p>

          <div className="chat-box">
            {chat.length === 0 && (
              <div className="empty-chat">
                <Bot size={28} />

                <span>Ask me: "What should I improve before placements?"</span>
              </div>
            )}

            {chat.map((item, index) => (
              <div
                key={`${item.role}-${index}`}
                className={`chat-msg ${item.role}`}
              >
                <span className="chat-role">
                  {item.role === "user" ? "You" : "CAMPUSLINK AI"}
                </span>

                <div>{item.text}</div>
              </div>
            ))}

            {busy === "chat" && (
              <div className="chat-msg ai">
                <span className="chat-role">CAMPUSLINK AI</span>

                <div className="typing">Thinking...</div>
              </div>
            )}

            <div ref={bottom} />
          </div>

          <div className="chat-input">
            <input
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={handleChatKeyDown}
              placeholder="Ask CAMPUSLINK AI..."
              disabled={busy === "chat"}
            />

            <button
              type="button"
              className="primary"
              onClick={send}
              disabled={!message.trim() || busy === "chat"}
              aria-label="Send message"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
