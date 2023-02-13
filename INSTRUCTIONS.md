# Module 5 Assignment: Express/MySQL CRUD Operations

(**NOTE:** View a rendered version of this file in VS Code with `ctrl-shift-v` or `cmd-shift-v`)

&nbsp;
## Introduction

For this assignment, you will create and deploy an e-commerce application for musical equipment using Node, Express, and MySQL. [You can see an example of the completed application here](https://music-shop-api.herokuapp.com/).

&nbsp;
## Setup

Copy the starter files inside of `unsolved` into the root directory of your GitHub repository.

Ensure you include a `.gitignore` file in your repo that includes at minimum:

```
**/.DS_Store
**/node_modules/
.env
```

Run `npm i` in the root directory of your repository (your `package.json` should be in the root directory).

&nbsp;
## Instructions

Navigate to the `api-routes.js` file and follow the instructions to create the necessary routes for the store inventory. These routes will cover creating, reading, updating, and deleting inventory items.

Your finished application must be deployed to [Heroku](https://www.heroku.com/). Please see [these instructions](./Adding_MySQL_to_Heroku.md) for how to add MySQL to your Heroku deployments.

&nbsp;
## App Behavior

The completed application should behave in the same manner as [this example](https://music-shop-api.herokuapp.com/).

To run the application locally, run:

```
npm run dev
```

You can then navigate to [http://localhost:3000](http://localhost:3000) to view the application.

&nbsp;
## Testing

Automated tests are included with this assignment. To receive full credit, all automated tests must pass.

To run the tests once, run:

```
npm test
```

To run the tests in watch mode, run:

```
npm run test:watch
```

&nbsp;
## Requirements for full credit

To receive full credit for this assignment, your program MUST:

  * Be implemented according to the above [instructions](#instructions).
  * Be deployed to Heroku with a JawsDB-powered database that is seeded.
  * Pass all automated tests.

&nbsp;
## Submission

When submitting this assignment, please include:

  * A link to the assignment's GitHub repository.
  * A link to the deployed application on Heroku.
  * A screenshot of the automated test results.