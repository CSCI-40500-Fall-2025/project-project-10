type User = { id: string; name: string; employer: string };
type UserRow = { id: string; name: string; employer: string; salt: string; hash: string };

const USERS_KEY = "demo_users_v1";
const SESSION_KEY = "demo_session_v1";

function getUsers(): Record<string, UserRow> {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || "{}"); } catch { return {}; }
}
function setUsers(map: Record<string, UserRow>) {
  localStorage.setItem(USERS_KEY, JSON.stringify(map));
}
function randId(len = 16) {
  const arr = new Uint8Array(len);
  crypto.getRandomValues(arr);
  return Array.from(arr, b => b.toString(16).padStart(2, "0")).join("");
}
async function sha256(input: string) {
  const enc = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

export async function signup(name: string, employer: string, password: string): Promise<User> {
    const res = await fetch("http://localhost:4000/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), employer: employer.trim(), password }),
    });
  
    let data: any = null;
    try { data = await res.json(); } catch {}
  
    if (!res.ok) {
      throw new Error(data?.message || "Signup failed");
    }
    const { token, user } = data;
    localStorage.setItem("authToken", token);
    return user as User; // { id, name, employer }
  }
  
  export async function login(name: string, password: string): Promise<User> {
    const res = await fetch("http://localhost:4000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), password }),
    });
  
    let data: any = null;
    try { data = await res.json(); } catch {}
  
    if (!res.ok) {
      throw new Error(data?.message || "Invalid credentials");
    }
    const { token, user } = data;
    localStorage.setItem("authToken", token);
    return user as User;
  }
  
  export function logout() {
    localStorage.removeItem("authToken");
  }

export function currentUser(): User | null {
  const sessRaw = localStorage.getItem(SESSION_KEY);
  if (!sessRaw) return null;
  try {
    const sess = JSON.parse(sessRaw) as { sub: string; name: string };
    const users = getUsers();
    const row = Object.values(users).find(u => u.id === sess.sub);
    return row ? { id: row.id, name: row.name, employer: row.employer } : null;
  } catch { return null; }
}