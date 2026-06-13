const API = process.env.API_BASE ?? "http://localhost:4000/api";

async function changeRole(adminToken: string, targetId: string, role: string) {
  const res = await fetch(`${API}/auth/users/${targetId}/role`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ role }),
  });
  const data = await res.json();
  console.log(JSON.stringify({ status: res.status, data }, null, 2));
}

const targetId = process.argv[2];
const role = process.argv[3] ?? "creator";
const adminToken = process.argv[4];

if (!adminToken || !targetId) {
  console.error("Usage: npx tsx scripts/changeRoleApi.ts <targetId> [role] <adminToken>");
  process.exit(1);
}

changeRole(adminToken, targetId, role).catch((e) => {
  console.error(e);
  process.exit(1);
});
