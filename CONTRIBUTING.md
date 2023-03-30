# Contributing

We welcome all types of contributions.

Found a bug? Please create an [issue](https://github.com/iTwin/{FIXME}/issues).

Want to contribute by creating a pull request? Great! [Fork this repository](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/working-with-forks) to get started.

---

## How to setup

## Prerequisites

- [Git](https://git-scm.com/)
- [Node](https://nodejs.org/en/)
- [Visual Studio Code](https://code.visualstudio.com/) - or an editor of your choice

## Development Setup

Please make sure to follow these steps for running this code sample application:

1. Clone this repository.
1. Make sure npm is installed on your machine.
1. Register a new SPA in [My Apps](https://developer.bentley.com/my-apps/) in the iTwin Developer Portal with:
  - Scopes: `imodelaccess:read imodels:read realitydata:read insights:read insights:modify projects:read`
  - Redirect Urls: `https://localhost:3000/signin-oidc`
1. Optional: Create an [empty iModel](https://developer.bentley.com/my-imodels/). Note down the `iTwinID` and `iModelID`. You may also use any other known `iTwinID` and `iModelID` combination instead of creating a new one.
1. Create a copy of the [template .env file](/.env.template) with the name `.env` in the root of the project directory. Then populate the fields:
  - `IMJS_AUTH_CLIENT_CLIENT_ID = clientID` - the `clientID` generated when you registered a new SPA.
  - `IMJS_AUTH_CLIENT_REDIRECT_URI = "https://localhost:3000/signin-oidc"`
  - `IMJS_AUTH_CLIENT_SCOPES ="imodelaccess:read imodels:read realitydata:read insights:read insights:modify projects:read"`
  - `IMJS_ITWIN_ID = iTwinID` - the `iTwinID` generated when creating your sample iModel.
  - `IMJS_IMODEL_ID = iModelID` - the `iModelID` generated when creating your sample iModel.
1. Run `npm install` in command line to install required packages.
1. Run `npm start` to run the application. Navigate to https://localhost:3000 in your browser.

---

## Pull Requests

Before creating a pull request, make sure your changes address a specific issue. Do a search to see if there are any existing issues that are still open. If you don't find one, you can create one.

To enable us to quickly review and accept your pull requests, always create one pull request per issue. Never merge multiple requests in one unless they have the same root cause. Be sure to follow best practices and keep code changes as small as possible. Avoid pure formatting changes or random "fixes" that are unrelated to the linked issue.

---

## Contributor License Agreement (CLA)

You will be asked to sign a Contribution License Agreement with Bentley before your contributions will be accepted.
This a one-time requirement for Bentley projects in GitHub.
You can read more about [Contributor License Agreements](https://en.wikipedia.org/wiki/Contributor_License_Agreement) on Wikipedia.

> Note: a CLA is not required if the change is trivial (such as fixing a spelling error or a typo).
