import * as setCookie from "https://cdn.skypack.dev/set-cookie-parser";

export function requireBasicAuth(request: Request) {
  const authorization = request.headers.get("authorization");
  if (authorization !== null) {
    const basicauth = authorization.match(/^Basic\s+(.*)$/);
    if (basicauth) {
      const [email, password] = atob(basicauth[1]).split(":");
      return { email, password };
    }
  }

  throw new Response("", { status: 401 });
}

export async function requireAuth(username: string, password: string) {
  const login = await fetch(
    "https://reacthello.b2clogin.com/reacthello.onmicrosoft.com/B2C_1_web_combined_login/oauth2/v2.0/authorize?ui_locales=nb&prompt=login&client_id=6e1a23e7-71ec-4483-918a-25c33852c9c9&response_type=token+id_token&redirect_uri=https%3A%2F%2Fpodme.com%2Fstatic%2Fredirect.html&state=%7B%22client_id%22%3A%226e1a23e7-71ec-4483-918a-25c33852c9c9%22%2C%22network%22%3A%22adB2CSignIn%22%2C%22display%22%3A%22popup%22%2C%22callback%22%3A%22_hellojs_2q3f3g1x%22%2C%22state%22%3A%22%22%2C%22redirect_uri%22%3A%22https%3A%2F%2Fpodme.com%2Fstatic%2Fredirect.html%22%2C%22scope%22%3A%22openid%2Chttps%3A%2F%2Freacthello.onmicrosoft.com%2Freacthelloapi%2Fread%22%7D&scope=openid+https%3A%2F%2Freacthello.onmicrosoft.com%2Freacthelloapi%2Fread",
  );
  const cookies = setCookie.parse(
    setCookie.splitCookiesString(login.headers.get("set-cookie")),
  );
  const csrf = cookies.find((c: Cookie) => c.name === "x-ms-cpim-csrf");
  const loginPage = await login.text();
  const settings = JSON.parse(
    loginPage.match(/var SETTINGS = {.*};/)?.toString().replace(
      "var SETTINGS = ",
      "",
    ).slice(0, -1) as string,
  );

  const body = new FormData();
  body.set("request_type", "RESPONSE");
  body.set("logonIdentifier", username);
  body.set("password", password);

  const url = new URL(
    "https://reacthello.b2clogin.com/reacthello.onmicrosoft.com/B2C_1_web_combined_login/SelfAsserted",
  );
  url.searchParams.set("tx", settings.transId);
  url.searchParams.set("p", settings.hosts.policy);

  const loginReq = await fetch(url, {
    "method": "POST",
    body,
    "headers": {
      "x-csrf-token": csrf.value,
      "cookie": normalizeCookie(cookies),
    },
  });

  const confirm = new URL(
    "https://reacthello.b2clogin.com/reacthello.onmicrosoft.com/B2C_1_web_combined_login/api/CombinedSigninAndSignup/confirmed",
  );
  confirm.searchParams.set("rememberMe", "false");
  confirm.searchParams.set("csrf_token", csrf.value);
  confirm.searchParams.set("tx", settings.transId);
  confirm.searchParams.set("p", settings.hosts.policy);

  const authcookies = setCookie.parse(
    setCookie.splitCookiesString(loginReq.headers.get("set-cookie")),
  );

  const confirmReq = await fetch(confirm, {
    redirect: "manual",
    "headers": {
      "x-csrf-token": csrf.value,
      Cookie: normalizeCookie([...authcookies, {
        name: "x-ms-cpim-csrf",
        value: csrf.value,
      }]),
    },
  });

  const location = new URL(
    (confirmReq.headers.get("location") as string).replace("#", "?"),
  );
  return new Response(
    JSON.stringify(Object.fromEntries(location.searchParams)),
    {
      status: 200,
    },
  );
}

interface Cookie {
  name: string;
  value: string;
}

function normalizeCookie(cookies: Cookie[]) {
  return cookies.map((c) => c.name + "=" + c.value).join("; ");
}
