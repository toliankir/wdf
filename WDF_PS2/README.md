**REQUIREMENT**

Any actual version of Node.js and npm.
https://nodejs.org/en/

**INSTALLATION**

Install node.js according to instruction from official site.
 
Run 'npm i' in project folder.

**HOW IT'S WORK**

First of all removes prev distributive folder. Then collects all 'js' and 'css' libraries dependencies to distributive vendor folder. Minimizes vendor files. 

Copies, converts, checks and minimizes all user files. 

Injects all dependencies files to './*html' files.

Then gulp starts web server on 3000 port if it is free(if it is busy runs on 3002 etc). 

Starts watching for files './*html' and in './src' folder:

- './src/style/*.less' files converts to css, concatenates, minimizes and copy to one file - './dist/style.min.css'

- './src/js/*.js' files checks for errors, minimizes and concatenates to one file './dist/script.min.js'.

- './*.html' Looking for any changes, if it is reloads browser window.

After any changing of user files and handling them, reloads browser window. 


**RUN GULP**

    *gulp --silent watch*

Executes main gulp task, that runs all other tasks according to it is order.

--silent argument hides messages of starting and finishing tasks.

Running gulp without arguments shows help.
