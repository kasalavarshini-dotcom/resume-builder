require("dotenv").config();

const express = require("express");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const PORT = Number(process.env.PORT) || 3000;

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY) {
  throw new Error("Add SUPABASE_URL and SUPABASE_SECRET_KEY to .env");
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  }
);

app.disable("x-powered-by");
app.use(express.json({ limit: "100kb" }));
app.use(express.static(path.join(__dirname, "public")));

const fields = [
  "full_name", "email", "phone", "location", "linkedin",
  "objective", "education", "skills", "projects", "experience"
];

function validateResume(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return "Invalid resume data.";
  }
  if (typeof body.full_name !== "string" || !body.full_name.trim()) {
    return "Full name is required.";
  }
  if (body.full_name.trim().length > 120) {
    return "Full name must be 120 characters or fewer.";
  }
  for (const field of fields) {
    const value = body[field] ?? "";
    if (typeof value !== "string") return `${field} must be text.`;
    if (value.length > 10000) return `${field} is too long.`;
  }
  const email = (body.email || "").trim();
  if (email.length > 254 || (email && !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email))) {
    return "Enter a valid email address.";
  }
  return null;
}

function cleanResume(body) {
  const result = {};
  for (const field of fields) result[field] = (body[field] ?? "").trim();
  return result;
}

function validId(value) {
  return /^\\d+$/.test(value) &&
    Number.isSafeInteger(Number(value)) &&
    Number(value) > 0;
}

app.get("/api/resumes", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("resumes").select("*")
      .order("updated_at", { ascending: false }).limit(100);
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error("List resumes:", error.message);
    res.status(500).json({ error: "Could not load resumes. Check your Supabase setup." });
  }
});

app.get("/api/resumes/:id", async (req, res) => {
  if (!validId(req.params.id)) return res.status(400).json({ error: "Invalid resume ID." });
  try {
    const { data, error } = await supabase
      .from("resumes").select("*").eq("id", Number(req.params.id)).maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: "Resume not found." });
    res.json(data);
  } catch (error) {
    console.error("Get resume:", error.message);
    res.status(500).json({ error: "Could not load this resume." });
  }
});

app.post("/api/resumes", async (req, res) => {
  const problem = validateResume(req.body);
  if (problem) return res.status(400).json({ error: problem });
  try {
    const { data, error } = await supabase
      .from("resumes").insert(cleanResume(req.body)).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error("Create resume:", error.message);
    res.status(500).json({ error: "Could not save the resume. Check your database table and credentials." });
  }
});

app.put("/api/resumes/:id", async (req, res) => {
  if (!validId(req.params.id)) return res.status(400).json({ error: "Invalid resume ID." });
  const problem = validateResume(req.body);
  if (problem) return res.status(400).json({ error: problem });
  try {
    const { data, error } = await supabase
      .from("resumes")
      .update({ ...cleanResume(req.body), updated_at: new Date().toISOString() })
      .eq("id", Number(req.params.id)).select().maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: "Resume not found." });
    res.json(data);
  } catch (error) {
    console.error("Update resume:", error.message);
    res.status(500).json({ error: "Could not update the resume." });
  }
});

app.delete("/api/resumes/:id", async (req, res) => {
  if (!validId(req.params.id)) return res.status(400).json({ error: "Invalid resume ID." });
  try {
    const { data, error } = await supabase
      .from("resumes").delete().eq("id", Number(req.params.id)).select("id").maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: "Resume not found." });
    res.json({ message: "Resume deleted successfully." });
  } catch (error) {
    console.error("Delete resume:", error.message);
    res.status(500).json({ error: "Could not delete the resume." });
  }
});

app.listen(PORT, "127.0.0.1", () => {
  console.log(`Resume Builder running at http://127.0.0.1:${PORT}`);
});
