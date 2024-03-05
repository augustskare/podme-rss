import forge from "https://esm.sh/node-forge@0.7.0";

export function requireBasicAuth(request: Request) {
  const authorization = request.headers.get("authorization");
  if (authorization !== null) {
    const basicauth = authorization.match(/^Basic\s+(.*)$/);
    if (basicauth) {
      const [username, password] = atob(basicauth[1]).split(":");
      return { username, password };
    }
  }

  throw unauthorized();
}

interface AuthenticateResponse {
  access_token: string;
  refresh_token: string;
  id_token: string;
  expires_in: 86400,
  token_type: "Bearer"
}

export async function authenticate(email: string, rawPassword: string): Promise<AuthenticateResponse> {
  const key = forge.pki.publicKeyFromPem(Deno.env.get("PODME_PUBLIC_KEY"));
  const buffer = forge.util.createBuffer(rawPassword);
  const password = forge.util.encode64(key.encrypt(buffer.getBytes(), "RSAES-PKCS1-V1_5"));
  
  const response = await fetch('https://api.podme.com/web/api/v2/user/login', {
    method: 'POST',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  if (response.ok) {
    return response.json();
  }

  throw response.status === 400 ?  unauthorized() : response;
}

function unauthorized() {
  return new Response("Unauthorized", {
    status: 401,
    statusText: "Unauthorized",
    headers: {
      "www-authenticate": `Basic realm="podme-rss"`,
    },
  });
}