const form = document.getElementById("resumeForm");
const resumeId = document.getElementById("resumeId");
const saveBtn = document.getElementById("saveBtn");
const message = document.getElementById("message");
const savedList = document.getElementById("savedList");

const fields = [
  "full_name", "email", "phone", "location", "linkedin",
  "objective", "education", "skills", "projects", "experience"
];

let messageTimer;

function showMessage(text, isError = false) {
  clearTimeout(messageTimer);
  message.textContent = text;
  message.className = "message show" + (isError ? " error" : "");
  messageTimer = setTimeout(() => { message.className = "message"; }, 4500);
}

async function api(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers
    }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Something went wrong.");
  return data;
}

function readForm() {
  const data = {};
  for (const field of fields) data[field] = form.elements[field].value.trim();
  return data;
}

function setText(id, value) {
  document.getElementById(id).textContent = value;
}

function updatePreview() {
  const data = readForm();
  setText("p-name", data.full_name || "Your Name");
  const contacts = [data.email, data.phone, data.location].filter(Boolean);
  setText("p-contact", contacts.join(" · ") || "Email · Phone · Location");
  const linkLine = document.getElementById("p-link");
  linkLine.textContent = data.linkedin;
  linkLine.hidden = !data.linkedin;

  const sections = [
    ["objective", "objectiveSection", "p-objective", "Your career objective will appear here."],
    ["education", "educationSection", "p-education", ""],
    ["skills", "skillsSection", "p-skills", ""],
    ["projects", "projectsSection", "p-projects", ""],
    ["experience", "experienceSection", "p-experience", ""]
  ];

  for (const [field, sectionId, previewId, placeholder] of sections) {
    const value = data[field];
    setText(previewId, value || placeholder);
    document.getElementById(sectionId).hidden = !value && !placeholder;
  }
}

function resetForm() {
  form.reset();
  resumeId.value = "";
  saveBtn.textContent = "Save Resume";
  updatePreview();
}

async function loadResumes() {
  savedList.replaceChildren();
  const loading = document.createElement("p");
  loading.className = "empty-state";
  loading.textContent = "Loading saved resumes…";
  savedList.appendChild(loading);

  try {
    const resumes = await api("/api/resumes");
    savedList.replaceChildren();
    if (!resumes.length) {
      const empty = document.createElement("p");
      empty.className = "empty-state";
      empty.textContent = "No saved resumes yet. Create your first one!";
      savedList.appendChild(empty);
      return;
    }

    for (const resume of resumes) {
      const item = document.createElement("div");
      item.className = "saved-item";
      const info = document.createElement("div");
      const title = document.createElement("h3");
      const details = document.createElement("p");
      title.textContent = resume.full_name || "Untitled resume";
      details.textContent = `${resume.email || "No email"} · Updated ${new Date(resume.updated_at).toLocaleDateString()}`;
      info.append(title, details);

      const actions = document.createElement("div");
      actions.className = "saved-actions";
      const edit = document.createElement("button");
      edit.type = "button";
      edit.className = "small-btn";
      edit.textContent = "Edit";
      edit.addEventListener("click", () => editResume(resume.id));

      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "small-btn delete";
      remove.textContent = "Delete";
      remove.addEventListener("click", () => deleteResume(resume.id));

      actions.append(edit, remove);
      item.append(info, actions);
      savedList.appendChild(item);
    }
  } catch (error) {
    savedList.replaceChildren();
    const failed = document.createElement("p");
    failed.className = "empty-state";
    failed.textContent = error.message;
    savedList.appendChild(failed);
  }
}

async function editResume(id) {
  try {
    const resume = await api(`/api/resumes/${id}`);
    resetForm();
    resumeId.value = resume.id;
    for (const field of fields) form.elements[field].value = resume[field] || "";
    saveBtn.textContent = "Update Resume";
    updatePreview();
    window.scrollTo({ top: 0, behavior: "smooth" });
    showMessage("Resume loaded. Make your changes and click Update Resume.");
  } catch (error) {
    showMessage(error.message, true);
  }
}

async function deleteResume(id) {
  if (!window.confirm("Delete this saved resume permanently?")) return;
  try {
    await api(`/api/resumes/${id}`, { method: "DELETE" });
    if (String(resumeId.value) === String(id)) resetForm();
    showMessage("Resume deleted successfully.");
    await loadResumes();
  } catch (error) {
    showMessage(error.message, true);
  }
}

form.addEventListener("input", updatePreview);

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = readForm();
  if (!data.full_name) {
    showMessage("Please enter your full name.", true);
    return;
  }

  const editingId = resumeId.value;
  const url = editingId ? `/api/resumes/${editingId}` : "/api/resumes";
  saveBtn.disabled = true;
  saveBtn.textContent = "Saving…";

  try {
    const saved = await api(url, {
      method: editingId ? "PUT" : "POST",
      body: JSON.stringify(data)
    });
    resumeId.value = saved.id;
    saveBtn.textContent = "Update Resume";
    showMessage(editingId ? "Resume updated successfully!" : "Resume saved to your database!");
    await loadResumes();
  } catch (error) {
    showMessage(error.message, true);
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = resumeId.value ? "Update Resume" : "Save Resume";
  }
});

document.getElementById("newBtn").addEventListener("click", () => {
  resetForm();
  showMessage("Ready to create a new resume.");
  window.scrollTo({ top: 0, behavior: "smooth" });
});

document.getElementById("clearBtn").addEventListener("click", () => {
  resetForm();
  showMessage("Form cleared. Your previously saved resumes remain in the database.");
});

document.getElementById("refreshBtn").addEventListener("click", loadResumes);
document.getElementById("printBtn").addEventListener("click", () => window.print());

updatePreview();
loadResumes();
