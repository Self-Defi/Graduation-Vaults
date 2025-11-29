/**
 * Graduation Vaults Proxy — Cloudflare Worker
 * Routes:
 *  GET /api/poolSummary
 *  GET /api/vaults
 *  GET /api/vault/:safeAddress
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS for public read-only UI
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: cors() });
    }

    try {
      if (path === "/api/poolSummary") {
        const vaults = await getVaults(env);
        const totalPol = vaults.reduce((a,v)=>a+(v.polBalance||0),0);
        const totalUsd = vaults.reduce((a,v)=>a+(v.usdBalance||0),0);

        return json({
          totalVaults: vaults.length,
          totalPol,
          totalUsd,
          signersGlobal: [
            "Parent/Guardian (required)",
            "School Representative",
            "Counselor/Staff",
            "Independent Trustee"
          ],
          lastSync: new Date().toISOString()
        });
      }

      if (path === "/api/vaults") {
        const vaults = await getVaults(env);
        return json(vaults);
      }

      if (path.startsWith("/api/vault/")) {
        const safeAddress = path.split("/").pop();
        const vault = await getVaultByAddress(env, safeAddress);
        return json(vault);
      }

      return new Response("Not found", { status: 404, headers: cors() });
    } catch (err) {
      return json({ error: err.message }, 500);
    }
  }
};

function cors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
}

function json(data, status=200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { "Content-Type": "application/json", ...cors() }
  });
}

async function getVaults(env) {
  const safes = (env.SAFE_LIST || "").split(",").filter(Boolean);

  if (!safes.length) {
    // Fallback mock until SAFE integration is wired
    return [
      {
        studentId: "GV-001",
        displayName: "Aaliyah R.",
        safeAddress: "0x1111111111111111111111111111111111111111",
        gradYear: 2029,
        polBalance: 120.5,
        usdBalance: 30.1,
        status: "Locked",
        signers: {
          parentGuardian: "0xaaaa…1111",
          schoolRep: "0xbbbb…2222",
          staffOrCounselor: "0xcccc…3333",
          independentTrustee: "0xdddd…4444",
          threshold: "3 of 4 (Parent Required)"
        },
        lastActivity: new Date().toISOString()
      }
    ];
  }

  // Example skeleton for SAFE integration:
  // const vaults = await Promise.all(safes.map(a => getVaultByAddress(env,a)));
  // return vaults;

  return [];
}

async function getVaultByAddress(env, safeAddress) {
  // SAFE API skeleton:
  // const res = await fetch(`https://safe-client.gnosis.io/v1/safes/${safeAddress}/`, {
  //   headers: { "Authorization": `Bearer ${env.SAFE_API_KEY}` }
  // });
  // const safe = await res.json();
  // ...then fetch balances, owners, etc

  return { safeAddress };
}
