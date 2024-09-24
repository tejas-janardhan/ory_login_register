import ory from "./ory";
import { Router } from "express";
import { checkRole, protectRoute, unProtectRoute } from "./middleware";

export const homeRouter = Router();

homeRouter.get("/home", protectRoute, async (req, res) => {
  res.render("protectedHome", {
    email: req?.session?.identity?.traits?.email ?? "No Email",
    loggedInAt: req?.session?.issued_at,
  });
});
homeRouter.get(
  "/home/customer",
  protectRoute,
  checkRole("customer"),
  async (req, res) => {
    res.render("protectedHome", {
      email: req?.session?.identity?.traits?.email ?? "No Email",
      loggedInAt: req?.session?.issued_at,
    });
  }
);
homeRouter.get(
  "/home/admin",
  checkRole("admin"),
  protectRoute,
  async (req, res) => {
    res.render("protectedHome", {
      email: req?.session?.identity?.traits?.email ?? "No Email",
      loggedInAt: req?.session?.issued_at,
    });
  }
);

export const loginRouter = Router();

loginRouter.get("/login", unProtectRoute, async (req, res) => {
  const { flow, email } = req.query;
  let loginFlow;

  if (flow) {
    loginFlow = await ory.frontEnd.getLoginFlow({
      id: flow as string,
      cookie: req.headers.cookie,
    });
  } else {
    loginFlow = await ory.frontEnd.createBrowserLoginFlow({});
  }

  if (loginFlow.headers["set-cookie"]) {
    res.setHeader("set-cookie", loginFlow.headers["set-cookie"] as string[]);
  }

  res.render("login", {
    flow: loginFlow.data.id,
    state: loginFlow.data.state,
    email: email ? atob(email as string) : null,
    csrfToken:
      (
        loginFlow.data.ui.nodes.find(
          (node) => (node.attributes as any).name === "csrf_token"
        )?.attributes as any
      )?.value ?? "",
  });
});

loginRouter.post("/login", async (req, res) => {
  const { flow, email, code, csrfToken } = req.body;

  const loginFlow = await ory.frontEnd.updateLoginFlow(
    {
      flow: flow as string,
      cookie: req.headers.cookie,
      updateLoginFlowBody: {
        csrf_token: csrfToken,
        method: "code",
        identifier: email,
        ...(code ? { code } : {}),
      },
    },
    {
      validateStatus: () => true,
    }
  );

  if (
    !(
      (loginFlow.status >= 200 && loginFlow.status <= 400) ||
      loginFlow.status === 400
    )
  ) {
    throw new Error(JSON.stringify(loginFlow.data));
  }

  if (loginFlow.headers["set-cookie"]) {
    res.setHeader("set-cookie", loginFlow.headers["set-cookie"] as string[]);
  }

  return res.status(loginFlow.status).json(loginFlow.data);
});

loginRouter.post("/google/login", async (req, res) => {
  const { flow, csrfToken } = req.body;

  const registerFlow = await ory.frontEnd.updateLoginFlow(
    {
      flow: flow as string,
      cookie: req.headers.cookie,
      updateLoginFlowBody: {
        csrf_token: csrfToken,
        method: "oidc",
        provider: "google",
      },
    },
    {
      validateStatus: () => true,
    }
  );

  if (
    !(
      (registerFlow.status >= 200 && registerFlow.status < 400) ||
      registerFlow.status === 422
    )
  ) {
    throw new Error(JSON.stringify(registerFlow.data));
  }

  if (registerFlow.headers["set-cookie"]) {
    res.setHeader("set-cookie", registerFlow.headers["set-cookie"] as string[]);
  }
  return res.status(registerFlow.status).json(registerFlow.data);
});

export const registerRouter = Router();

registerRouter.get("/register", unProtectRoute, async (req, res) => {
  const { flow, email } = req.query;
  let registerFlow;

  if (flow) {
    registerFlow = await ory.frontEnd.getRegistrationFlow({
      id: flow as string,
      cookie: req.headers.cookie,
    });
  } else {
    registerFlow = await ory.frontEnd.createBrowserRegistrationFlow({});
  }

  if (registerFlow.headers["set-cookie"]) {
    res.setHeader("set-cookie", registerFlow.headers["set-cookie"] as string[]);
  }

  res.render("register", {
    flow: registerFlow.data.id,
    state: registerFlow.data.state,
    email: email ? atob(email as string) : null,
    csrfToken:
      (
        registerFlow.data.ui.nodes.find(
          (node) => (node.attributes as any).name === "csrf_token"
        )?.attributes as any
      )?.value ?? "",
  });
});

registerRouter.post("/google/register", async (req, res) => {
  const { flow, csrfToken } = req.body;

  const registerFlow = await ory.frontEnd.updateRegistrationFlow(
    {
      flow: flow as string,
      cookie: req.headers.cookie,
      updateRegistrationFlowBody: {
        csrf_token: csrfToken,
        method: "oidc",
        provider: "google",
      },
    },
    {
      validateStatus: () => true,
    }
  );

  if (
    !(
      (registerFlow.status >= 200 && registerFlow.status < 400) ||
      registerFlow.status === 422
    )
  ) {
    throw new Error(JSON.stringify(registerFlow.data));
  }

  if (registerFlow.headers["set-cookie"]) {
    res.setHeader("set-cookie", registerFlow.headers["set-cookie"] as string[]);
  }
  return res.status(registerFlow.status).json(registerFlow.data);
});

registerRouter.post("/register", async (req, res) => {
  const { flow, email, csrfToken } = req.body;

  const registerFlow = await ory.frontEnd.updateRegistrationFlow(
    {
      flow: flow as string,
      cookie: req.headers.cookie,
      updateRegistrationFlowBody: {
        csrf_token: csrfToken,
        method: "code",
        traits: {
          email,
        },
      },
    },
    {
      validateStatus: () => true,
    }
  );

  if (registerFlow.status === 200) {
    // Needs wait since it cannot update immediately after registration, in practice this can be a job that needs to be consumed wihtin 10 min.
    await new Promise((resolve) => {
      setTimeout(() => resolve(undefined), 5000);
    });
    await ory.updateIdentity({
      id: registerFlow.data.identity.id,
      updateIndentityBody: {
        schema_id: registerFlow.data.identity.schema_id,
        state: registerFlow.data.identity.state ?? "active",
        traits: registerFlow.data.identity.traits,
        metadata_public: { role: "customer" },
      },
    });
  }

  if (
    !(
      (registerFlow.status >= 200 && registerFlow.status <= 400) ||
      registerFlow.status === 400
    )
  ) {
    throw new Error(JSON.stringify(registerFlow.data));
  }

  if (registerFlow.headers["set-cookie"]) {
    res.setHeader("set-cookie", registerFlow.headers["set-cookie"] as string[]);
  }
  return res.status(registerFlow.status).json(registerFlow.data);
});
