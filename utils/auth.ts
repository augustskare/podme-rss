import {
  CookieJar,
  wrapFetch,
} from "https://deno.land/x/another_cookiejar@v4.1.4/mod.ts";

export function requireBasicAuth(request: Request) {
  const authorization = request.headers.get("authorization");
  if (authorization !== null) {
    const basicauth = authorization.match(/^Basic\s+(.*)$/);
    if (basicauth) {
      const [username, password] = atob(basicauth[1]).split(":");
      return { username, password };
    }
  }

  throw new Response("401 Unauthorized", {
    status: 401,
    statusText: "Unauthorized",
    headers: {
      "www-authenticate": `Basic realm="podme-rss"`,
    },
  });
}

interface AuthenticateResponse {
  access_token: string;
  token_type: "Bearer";
  expires_in: "86400";
  id_token: string;
}

export async function authenticate(username: string, password: string) {
  const cookieJar = new CookieJar();
  const fetch = wrapFetch({ cookieJar });

  const authorize = await fetch(podmeAuthUrl(`/oauth2/v2.0/authorize`, {
    ui_locales: "no",
    client_id: "6e1a23e7-71ec-4483-918a-25c33852c9c9",
    "response_type": "token id_token",
    "redirect_uri": "https://podme.com/static/redirect.html",
    "scope": "openid https://reacthello.onmicrosoft.com/reacthelloapi/read",
  }));
  const authorizeResponse = await authorize.text();
  const settings = JSON.parse(
    authorizeResponse.match(/var SETTINGS = ({.*});/)?.[1] || "",
  );

  if (!validSettings(settings)) {
    throw new Response("Server error", { status: 500 });
  }

  const authorizeParams = {
    "tx": settings.transId,
    "p": settings.hosts.policy,
  };

  const body = new FormData();
  body.set("request_type", "RESPONSE");
  body.set("logonIdentifier", username);
  body.set("password", password);

  await fetch(podmeAuthUrl("/SelfAsserted", authorizeParams), {
    method: "post",
    body,
    headers: {
      "x-csrf-token": settings.csrf,
    },
  });

  const confirmed = await fetch(
    podmeAuthUrl("/api/CombinedSigninAndSignup/confirmed", {
      ...authorizeParams,
      csrf_token: settings.csrf,
    }),
    {
      redirect: "manual",
    },
  );

  const location = confirmed.headers.get("location");
  if (typeof location === "string") {
    const hash = new URL(location).hash.replace("#", "");

    const response = Object.fromEntries(new URLSearchParams(hash));
    if (response.access_token) {
      return response as unknown as AuthenticateResponse;
    }
  }

  throw new Response("Server error", {
    status: 500,
  });
}

function podmeAuthUrl(endpoint: string, params: Record<string, string>) {
  const tenant = "reacthello";
  const login_user_flow = "B2C_1_web_combined_login";
  const baseUrl =
    `https://${tenant}.b2clogin.com/${tenant}.onmicrosoft.com/${login_user_flow}`;

  const url = new URL(baseUrl + endpoint);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  return url;
}

interface Settings {
  transId: string;
  hosts: {
    policy: string;
  };
  csrf: string;
}

function validSettings(settings: unknown): settings is Settings {
  const s = settings as Settings;
  return s.transId !== undefined && s.hosts !== undefined &&
    s.csrf !== undefined;
}
