const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const fetchProblems = async () => {
  const res = await fetch(`${BASE_URL}/problems?t=${Date.now()}`);
  if (!res.ok) throw new Error("Backend connection failed");
  const data = await res.json();

  let problems = [];
  if (data.stat_status_pairs) {
    problems = data.stat_status_pairs.map(p => ({
      id: p.stat.question_id,
      title: p.stat.question__title,
      slug: p.stat.question__title_slug,
      difficulty: p.difficulty.level === 1 ? 'Easy' : p.difficulty.level === 2 ? 'Medium' : 'Hard'
    }));
  } else if (Array.isArray(data)) {
    problems = data.map(p => ({
      id: p.frontendQuestionId || p.questionId || p.id,
      title: p.title || p.questionTitle,
      slug: p.title_slug || p.titleSlug || p.slug || p.question__title_slug,
      difficulty: p.difficulty || "Medium"
    }));
  }
  return problems.filter(p => p.slug && p.title);
};

export const fetchProblemDetails = async (id) => {
  const res = await fetch(`${BASE_URL}/problem/${id}`);
  const json = await res.json();
  const data = json.data?.question || json;
  return data;
};

export const runCode = async (data) => {
  const res = await fetch(`${BASE_URL}/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return await res.json();
};

export const submitCode = async (data) => {
  const res = await fetch(`${BASE_URL}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return await res.json();
};

export const pollResult = async (id, slug, userSession, userCsrf) => {
  const res = await fetch(`${BASE_URL}/poll/${id}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ slug, auth_session: userSession, auth_csrf: userCsrf })
  });
  return await res.json();
};
