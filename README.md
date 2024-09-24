# Redirect Urls Need to be setup -

Post google login callback screen (ORY Console).
Base Redirect URIs (Both on the ORY console and the exact uri needs to be registered with Google Console).

# Setup -

Create an ORY account - install the ory cli, login. Enter the env vars in the .env file.

```
npm i
npx ory tunnel --dev --port <ORY_PORT> --project <ORY_PROJECT_ID> <APP_URL>
npm run dev
```

# LogOut -

Please delete all cookies to logout (Logout Flow was not in the original spec).

# Keeping configurations in sync -

ory.config.json can be used to keep all ory deployments in sync through the ory cli.

# Potential Improvements -

- Using ejs partials/templates to organise html code.
- Using css stylesheets and js files.
- Refactor code to reduce code reuse and improve extensibility.
- Redirects can be smoother - resend code can be its own seperate route.
- Separate route to create an admin user by updating a user with that metadata
- Redirect for oauth register should send to a page to trigger customer role update.

# Roles -

Anyone who signs up (via code) is given a role of customer, to test admin route, set the metadata_public path of the identity object to - `{"role":"admin"}` (You can use ORY Admin APIs to complete this.)

Note - This project is only for dev environments. (Prod env will need the paid version of ory and some additional configs need to be completed)
