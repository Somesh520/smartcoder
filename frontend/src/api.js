export const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
};

export const fetchProblems = async () => {


  const res = await fetch(`${BASE_URL}/problems`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error("Backend connection failed");
  const data = await res.json();
  console.log("[API] Raw Problems Data:", data);

  let problems = [];

  // Check if response is wrapped object with stat_status_pairs
  if (data.stat_status_pairs) {
    if (data.stat_status_pairs.length > 0) {
      console.log("[API] First raw item (pairs):", data.stat_status_pairs[0]);
    }
    problems = data.stat_status_pairs.map(p => ({
      id: p.stat.frontend_question_id || p.stat.question_id,
      title: p.stat.question__title,
      slug: p.stat.question__title_slug,
      difficulty: p.difficulty.level === 1 ? 'Easy' : p.difficulty.level === 2 ? 'Medium' : 'Hard'
    }));
  }
  // Check if it's an array of stat_status_pairs format (has .stat property)
  else if (Array.isArray(data) && data.length > 0 && data[0].stat) {
    console.log("[API] Detected stat_status_pairs array format, count:", data.length);
    problems = data.map(p => ({
      id: p.stat.frontend_question_id || p.stat.question_id,
      title: p.stat.question__title,
      slug: p.stat.question__title_slug,
      difficulty: p.difficulty?.level === 1 ? 'Easy' : p.difficulty?.level === 2 ? 'Medium' : 'Hard'
    }));
  }
  // Alfa API flat format
  else if (Array.isArray(data)) {
    if (data.length > 0) {
      // console.log("[API] First raw item (array):", data[0]);
    }
    problems = data.map(p => ({
      id: p.questionFrontendId || p.frontendQuestionId || p.questionId || p.id,
      title: p.title || p.questionTitle,
      slug: p.title_slug || p.titleSlug || p.slug || p.question__title_slug,
      difficulty: p.difficulty || "Medium"
    }));
  }
  console.log("[API] Normalized Problems Count:", problems.length);
  return problems.filter(p => p.slug && p.title && p.id);
};

export const fetchProblemDetails = async (id) => {
  const res = await fetch(`${BASE_URL}/problem/${id}`, { headers: getAuthHeaders() });
  const json = await res.json();
  const data = json.data?.question || json;
  return data;
};

export const runCode = async (data) => {
  const res = await fetch(`${BASE_URL}/run`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return await res.json();
};

export const submitCode = async (data) => {
  const res = await fetch(`${BASE_URL}/submit`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return await res.json();
};

export const pollResult = async (id, slug, userSession, userCsrf) => {
  const res = await fetch(`${BASE_URL}/poll/${id}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ slug, auth_session: userSession, auth_csrf: userCsrf })
  });
  return await res.json();
};

export const getCurrentUser = async () => {
  const res = await fetch(`${BASE_URL}/auth/current_user`, { headers: getAuthHeaders() });
  if (res.status === 401) {
    localStorage.removeItem('auth_token');
    return null;
  }
  return await res.json();
};


export const logout = async () => {
  localStorage.removeItem('auth_token');
  window.location.href = `${BASE_URL}/auth/logout`;
};

export const fetchSolvedProblems = async () => {
  const session = localStorage.getItem('user_session');
  const csrf = localStorage.getItem('user_csrf');

  if (!session || !csrf || session === "undefined") return [];

  try {
    const res = await fetch(`${BASE_URL}/api/leetcode/solved`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders() // Include token if available (though auth_session is primary)
      },
      body: JSON.stringify({ auth_session: session, auth_csrf: csrf })
    });

    if (!res.ok) return [];
    const responseData = await res.json();

    if (responseData.debug) {
      console.log("[API] Solved Debug Info:", responseData.debug);
      return responseData.solved || [];
    }

    return Array.isArray(responseData) ? responseData : [];
  } catch (e) {
    console.error("Failed to fetch solved stats", e);
    return [];
  }
};

// ==========================================
// SECOND BRAIN API
// ==========================================

// --- NOTES ---
export const fetchNotes = async () => {
  const res = await fetch(`${BASE_URL}/api/brain/notes`, { headers: getAuthHeaders() });
  return await res.json();
};

export const createNote = async (note) => {
  const res = await fetch(`${BASE_URL}/api/brain/notes`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(note)
  });
  return await res.json();
};

export const updateNote = async (id, note) => {
  const res = await fetch(`${BASE_URL}/api/brain/notes/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(note)
  });
  return await res.json();
};

export const deleteNote = async (id) => {
  const res = await fetch(`${BASE_URL}/api/brain/notes/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return await res.json();
};

// --- TASKS ---
export const fetchTasks = async () => {
  const res = await fetch(`${BASE_URL}/api/brain/tasks`, { headers: getAuthHeaders() });
  return await res.json();
};

export const createTask = async (task) => {
  const res = await fetch(`${BASE_URL}/api/brain/tasks`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(task)
  });
  return await res.json();
};

export const updateTask = async (id, task) => {
  const res = await fetch(`${BASE_URL}/api/brain/tasks/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(task)
  });
  return await res.json();
};

export const deleteTask = async (id) => {
  const res = await fetch(`${BASE_URL}/api/brain/tasks/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return await res.json();
};

// --- EVENTS ---
export const fetchEvents = async () => {
  const res = await fetch(`${BASE_URL}/api/brain/events`, { headers: getAuthHeaders() });
  return await res.json();
};

export const createEvent = async (event) => {
  const res = await fetch(`${BASE_URL}/api/brain/events`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(event)
  });
  return await res.json();
};

export const updateEvent = async (id, event) => {
  const res = await fetch(`${BASE_URL}/api/brain/events/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(event)
  });
  return await res.json();
};

export const deleteEvent = async (id) => {
  const res = await fetch(`${BASE_URL}/api/brain/events/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return await res.json();
};

// --- ASSISTANT ---
export const chatWithAssistant = async (message, context) => {
  const res = await fetch(`${BASE_URL}/api/brain/assistant/chat`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ message, context })
  });
  return await res.json();
};

// --- GOOGLE INTEGRATION ---
export const fetchGoogleTasks = async () => {
  const res = await fetch(`${BASE_URL}/api/google/tasks`, { headers: getAuthHeaders() });
  if (res.status === 401) return null; // Return null to indicate "Not Connected"
  return await res.json();
};

export const createGoogleTask = async (task) => {
  const res = await fetch(`${BASE_URL}/api/google/tasks`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(task)
  });
  return await res.json();
};

export const deleteGoogleTask = async (taskId) => {
  const res = await fetch(`${BASE_URL}/api/google/tasks/${taskId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return await res.json();
};

export const fetchGoogleCalendar = async () => {
  const res = await fetch(`${BASE_URL}/api/google/calendar`, { headers: getAuthHeaders() });
  if (res.status === 401) return null;
  return await res.json();
};

export const createGoogleEvent = async (event) => {
  const res = await fetch(`${BASE_URL}/api/google/calendar`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(event)
  });
  return await res.json();
};

export const deleteGoogleEvent = async (id) => {
  const res = await fetch(`${BASE_URL}/api/google/calendar/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return await res.json();
};
