# Adding MySQL to a Heroku Application

(**NOTE:** View a rendered version of this file in VS Code with `ctrl-shift-v` or `cmd-shift-v`)

&nbsp;
## Introduction to JawsDB 🦈

Up until now, we've been using MySQL locally on our development machines, however this won't work for our deployed sites. Just like we'll need a separate machine to run our server code in the cloud, we'll need to do the same for our database program. Fortunately, there are multiple database-as-a-service (DAAS) companies that offer solutions.

[JawsDB](https://www.jawsdb.com/) is one such DAAS solution that happens to have a Heroku integration. We'll use the JawsDB free tier in our Heroku deployments to connect our apps to a cloud-based MySQL database.

&nbsp;
## Instructions

To connect JawsDB to a Heroku app:

1. Create a Heroku app like you normally would through the Heroku dashboard (or the CLI if you're so inclined).
1. Open your app's dashboard page and navigate to the "resources" tab.
1. In the search bar, type "jawsdb" and select "JawsDB MySQL". This should bring up a modal for the pricing plan for JawsDB.
1. Ensure the pricing plan is set to "Kitefin Shared - Free" and click "Submit Order Form".

At this point, you should have JawsDB available to your Heroku app. If you navigate to the "settings" tab of your heroku project and click "reveal config vars", you'll see a variable that's been set called "JAWSDB_URL". This is a [MySQL connection string](https://dev.mysql.com/doc/refman/8.0/en/connecting-using-uri-or-key-value-pairs.html), which is a single URL that contains the address/protocol for the MySQL app along with the port, username, and password.

If you navigate to [db.js](unsolved/db.js), you'll see that `process.env.JAWSDB_URL` is preset in the connection configuration so that your app will connect to JawsDB if the connection string is available in the environment.

&nbsp;
## Schema and Seeding JawsDB 🌱🦈

The assignments for class are scripted in a way that they automatically run the `schema.sql` and `seed.sql` files for local development, however, when deploying to Heroku you will need to run these files manually.

Copy the JawsDB connection string from the Heroku dashboard environmental vars and use that connection string in either the [SQLTools extension](https://marketplace.visualstudio.com/items?itemName=mtxr.sqltools) or [TablePlus](https://tableplus.com/) to connect to your production database. Then run your schema/seed.sql files to initialize and populate your database.