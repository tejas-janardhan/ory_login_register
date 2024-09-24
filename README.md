Redirect Urls Need to be setup -

Post google login callback screen (ORY Consolel)
Base Redirect URIs (Both on the ORY console and the exact uri needs to be registered with Google Console.)

Setup -

Run - npm run ory-dev
Run - npm run dev

LogOut -

Please delete all cookies to logut (Logout Flow was not in the original spec)

Keeping configurations in sync -

ory.config.json can be used to keep all ory deployments in sync through the ory cli.

Potential Improvements -

Using ejs partials/templates to organise html code.
Using css stylesheets and js files.
Refactor code to reduce code reduce and improve extensability.
Redirects can be smoother - resend code can be its own seperate route.

Roles -

Anyone who signs up is given a role of customer, to test admin route, set the metadata_public path of the identity object to - `{"role":"admin"}`

Note - This project is only for dev environments. (Prod env will need the paid version of ory and some additional configs need to be completed)
