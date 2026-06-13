
const API = process.env.API_BASE ?? "http://localhost:4000/api";

async function register(username: string, email: string, password: string) {
  const res = await fetch(`${API}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });
  const data = await res.json();
  console.log(JSON.stringify({ status: res.status, data }, null, 2));
  return data;
}

async function run() {
  console.log("Registering tempadmin...");
  await register("tempadmin", "tempadmin@example.com", "Password123!");
  console.log("Registering target user...");
  await register("targetuser", "target@example.com", "Password123!");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
