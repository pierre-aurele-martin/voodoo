# Candidate Takehome Exercise
This is a simple backend engineer take-home test to help assess candidate skills and practices.  We appreciate your interest in Voodoo and have created this exercise as a tool to learn more about how you practice your craft in a realistic environment.  This is a test of your coding ability, but more importantly it is also a test of your overall practices.

If you are a seasoned Node.js developer, the coding portion of this exercise should take no more than 1-2 hours to complete.  Depending on your level of familiarity with Node.js, Express, and Sequelize, it may not be possible to finish in 2 hours, but you should not spend more than 2 hours.  

We value your time, and you should too.  If you reach the 2 hour mark, save your progress and we can discuss what you were able to accomplish. 

The theory portions of this test are more open-ended.  It is up to you how much time you spend addressing these questions.  We recommend spending less than 1 hour.  


For the record, we are not testing to see how much free time you have, so there will be no extra credit for monumental time investments.  We are looking for concise, clear answers that demonstrate domain expertise.

# Project Overview
This project is a simple game database and consists of 2 components.  

The first component is a VueJS UI that communicates with an API and renders data in a simple browser-based UI.

The second component is an Express-based API server that queries and delivers data from an SQLite data source, using the Sequelize ORM.

This code is not necessarily representative of what you would find in a Voodoo production-ready codebase.  However, this type of stack is in regular use at Voodoo.

# Project Setup
You will need to have Node.js, NPM, and git installed locally.  You should not need anything else.

To get started, initialize a local git repo by going into the root of this project and running `git init`.  Then run `git add .` to add all of the relevant files.  Then `git commit` to complete the repo setup.  You will send us this repo as your final product.
  
Next, in a terminal, run `npm install` from the project root to initialize your dependencies.

Finally, to start the application, navigate to the project root in a terminal window and execute `npm start`

You should now be able to navigate to http://localhost:3000 and view the UI.

You should also be able to communicate with the API at http://localhost:3000/api/games

If you get an error like this when trying to build the project: `ERROR: Please install sqlite3 package manually` you should run `npm rebuild` from the project root.

# Practical Assignments
Pretend for a moment that you have been hired to work at Voodoo.  You have grabbed your first tickets to work on an internal game database application. 

#### FEATURE A: Add Search to Game Database
The main users of the Game Database have requested that we add a search feature that will allow them to search by name and/or by platform.  The front end team has already created UI for these features and all that remains is for the API to implement the expected interface.  The new UI can be seen at `/search.html`

The new UI sends 2 parameters via POST to a non-existent path on the API, `/api/games/search`

The parameters that are sent are `name` and `platform` and the expected behavior is to return results that match the platform and match or partially match the name string.  If no search has been specified, then the results should include everything (just like it does now).

Once the new API method is in place, we can move `search.html` to `index.html` and remove `search.html` from the repo.

#### FEATURE B: Populate your database with the top 100 apps
Add a populate button that calls a new route `/api/games/populate`. This route should populate your database with the top 100 games in the App Store and Google Play Store.
To do this, our data team have put in place 2 files at your disposal in an S3 bucket in JSON format:

- https://interview-marketing-eng-dev.s3.eu-west-1.amazonaws.com/android.top100.json
- https://interview-marketing-eng-dev.s3.eu-west-1.amazonaws.com/ios.top100.json

__Done with adding both features. Tests are missing for feature B as I'm running out of time. Some comments to read as a few comfort features could be easily added__

# Theory Assignments
You should complete these only after you have completed the practical assignments.

The business goal of the game database is to provide an internal service to get data for all apps from all app stores.  
Many other applications at Voodoo will use consume this API.

#### Question 1:
We are planning to put this project in production. According to you, what are the missing pieces to make this project production ready? 
Please elaborate an action plan.

__Answer 1 Start__

We could deploy this project to production as it is, I don't see why it wouldn't work. Using a VPN to secure access and you're good to go.

If this was the start of a business piece to managed games catalog, we would need a few more steps:

    - Get a better dev environment and CI:
        - use nodemon to have HMR (god that was annoying... I just see now that nodemon was installed :( )
        - enforce the lint before commit
        - add test coverage
        - At some point, use TypeScript (i missed it :-)

    - Improve the code quality
        - Split code. Search, Add / Delete, Populate forms are all in the same file. They should be split as independant component
        - I did not test but I'm pretty sure we're missing a proper error catching strategy. If the api fails, I doubt it would be seen on the front-end

    - Improve basic security && performance
        - Using compressed data and helmet on the express app

Now on the heavy lifting, we would need pretty quickly:
    - A proper SQL architecture. Having PG/MySQL databases for dev and prod environment would be more reliable
    - User permission strategy. As now, everybody can add / delete game. This is most likely something we do not want

A lot of this depend on for what and by who the project will be used.

__Answer 1 End__

#### Question 2:
Let's pretend our data team is now delivering new files every day into the S3 bucket, and our service needs to ingest those files
every day through the populate API. Could you describe a suitable solution to automate this? Feel free to propose architectural changes.

__Answer 2 Start__

First thing I'd do is adding a timestamp convention into the filename. Example: `android.top100.json` would become `android.top100.2022.06.01.json`. Assuming it's one file per day per source. Otherwise, another incremental convention would be required.

Then, the populate action should not require someone to click on a button. This should be automated to run everyday as soon as there is a new file. With an email / slack reporting on the process.

I'm not expert on AWS Lamba but it seems it can be planned by cron (https://docs.aws.amazon.com/fr_fr/lambda/latest/dg/services-cloudwatchevents-expressions.html). The function would check if there are some new files since last run, then process those new files and send a reporting to whom it concerns. Maybe S3 also offer a watch system that can trigger a function when a directory is modified.

(If someone want a button to trigger this populate function, that would be possible).

It would also be interesting to have some logs on what the function did, when it ran etc.

Then the populate process would need to be improved. As for now, we don't remove old top 100 games (we can't even identified them). This really depend on what the business requirements are.


PS: We should also specifiy on which criteria the top 100 are ranked.

__Answer 2 End__

#### Question 3:
Both the current database schema and the files dropped in the S3 bucket are not optimal.
Can you find ways to improve them?

__Answer 3 Start__

First obvious thing is that both schema does not match. If we lose S3 files, we lose data. No bueno.

S3 is an array of an array of objects. First level looks useless to me.

I had some encoding issues on my frontend `[ios] - Call of Duty???: Mobile`(SQLite) instead of `Call of Duty\udca8: Mobile - Season 10: Shadows Return`(S3). Didn't looked into but that would be an issue to fix.

I'd add a created_at / updated_at in the SQL Schema (If I remember correctly, Sequelize can do this with an option).

Then, I'm not shocked by the S3 schema. I'd assume it's an export from Google / Apple and we don't have much control on it. As said, what would be really important is the mapping of data from S3 -> SQL.

As an example: `"app_view_url": "/android/us/brhappyfull/app/one-liner-line-to-win/com.one.liner.happyfull/",` (S3) ? Would the be readable from our front-end or do we need to rewrite it to be able to have the game illustraion properly displaying?

Finally, and based on the business requirements, we could make a more complex DB Schema to have relations on publisher, platform and so on.


__Answer 3 End__

