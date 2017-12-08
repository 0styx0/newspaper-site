# eyeStorm

<p>This is the code behind my school newspaper's site, currently <strike>located at <a href="https://tabceots.com">https://tabceots.com</a></strike> not online anymore.</p>

<h2>Table of Contents</h2>
<ul>
    <li><a href="#about">About</a></li>
    <li><a href="#typesOfUsers">Types of users</a></li>
    <li><a href="#publishing">How to publish (along with commenting rules)</a></li>
    <li><a href="#accountManagement">Sign up/account deletion</a></li>
    <li><a href="#howToBuild">How to build</a></li>
</ul>

<h2 id="about">About</h2>
<p>This is a newspaper site. Simply put, one can create an account, publish articles, and eventually have it world viewable. It is designed to be a fully featured web-app.</p>


<h2 id="typesOfUsers">Types of users</h2>
<p>In this site there are 4 types of users. Note that each type of user can do at least that of the user before it.</p>
<ol>
    <li>
      <details>
        <summary>Random, not logged in users</summary>
        <ul>
          <li>Can view all articles in world viewable issues</li>
          <li>Can see basic info about all users (name, articles created, views)</li>
          <li>Can view individual users' profiles</li>
        </ul>
    </li>
    <li>
      <details>
        <summary>Level 1 users</summary>
          <ul>
              <li>Can create articles</li>
              <li>View all articles whether world-viewable or not</li>
              <li>Delete their own articles</li>
              <li>Edit their own articles <u>until it becomes world-viewable</u></li>
              <li>Delete their own account</li>
              <li>Manage their own notification settings</li>
              <li>Toggle their own two factor authentication</li>
              <li>Change their own password</li>
          </ul>
        </details>
    </li>
    <li>
      <details>
        <summary>Level 2 users</summary>
          <ul>
              <li>Can delete users less than themselves</li>
              <li>Create other users of the same or lower level</li>
              <li>Can add to the list of available tags one can give articles when publishing</li>
          </ul>
      </details>
    </li>
    <li>
      <details>
        <summary>Level 3 users</summary>
          <ul>
              <li>Can make issues world-viewable</li>
              <li>Give an issue a name (until it becomes world viewable)</li>
              <li>Delete any article</li>
              <li>Change the order articles display on the home page</li>
              <li>Update an article's tags</li>
              <li>Edit any article (even after it becomes world-viewable)</li>
              <li>Edit the mission statement</li>
              <li>Get notified whenever an article is published</li>
          </ul>
      </details>
    </li>
</ol>

<h2 id="publishing">Publishing - From start to end</h2>
<ol>
    <li>
        <details>
            <summary>Logged in user goes to <code>/publish</code>, fills out the form</summary>
            <p>
              An email goes out to all level 3 users who have notifications enabled that an article was created <br />
               At this point, even if the user who published it is level 1, they can edit it <br />
               At any point from here on the creator or level 3 users can delete it</p>
        </details>
    </li>
    <li>
        <details>
            <summary>After a few articles have been uploaded, you might decide it's time to make the issue world viewable, and publish the issue. To do this, a level 3 user goes to <code>/issue</code>, gives the issue a name, toggles the "Published" table cell to "Yes", and submits the form</summary>
            <p>At this point, only level 3 users can edit the article, although both the owner and level 3s can still delete articles <br />The issue name is now permanent, and the issue cannot be set to private again</p>
        </details>
    </li>
    <li>Done. The next article published will be in a new, private issue</li>
</ol>

<h2>Commenting</h2>
<ul>
    <li>Comments must be at least 5 characters long</li>
    <li>Can only comment on public articles </li>
    <li>Views only increment when not logged in, and when viewing public articles</li>
</ul>

<h3>Tags - An explanation</h3>
<ul>
    <li>When creating an article, one can pick from a list of tags (or if you're level 2+, create a new tag)</li>
    <li>These are used so readers can easily find articles that they're interested in</li>
</ul>

<h2 id="accountManagement">Signup/account deletion</h2>
<h3>Signing up</h3>
<ul>
    <li>Fill out form on /signup</li>
    <li>You'll get an email with a verification code</li>
    <li>When you try to log in, after putting in your regular info, you'll be redirected to a page which asks for the code which was emailed to you</li>
    <li>You're in!</li>
</ul>

<h3>Deleting your account</h3>
<ul>
    <li>When an account gets deleted (whether by deleting your own account, or an admin deleting someone else's account), a question arises: What to do with the articles the user has published</li>
    <li>The answer? They get transferred to a special user called User Deleted, and so live on</li>
</ul>

<h2 id="howToBuild">Build Instructions</h2>

<h3>Installation</h3>
<ol>
    <li>$ <code>git clone https://github.com/DovidM/eyeStorm-nodeJS.git</code></li>
    <li>$ <code>cd eyeStorm-nodeJS</code></li>
</ol>


<h3 id="configFile">Config File</h3>

<p>Create a file called <code>.env</code> in <code>server/</code></p>
<p>Before beginning, there is a <code>.env.example</code> file which has all variables needed (so you can copy/paste that into your newly created <code>.env</code></p>

<details>
  <summary>Example file</summary>
  <pre>
    DB_HOST="name_of_database_host" # likely "localhost"
    DB_PORT="port_the_db_is_on" # a common one is 3306
    DB_USER="db_username" # default might be "root"
    DB_PASS="strong_password" # default might be "root". Strongly suggested to change if in production
    DB_NAME="name_of_database" # database to use. Does not (and should not) exist before using this project

    EMAIL_ADDR="example@example.org" # used when sending any emails (such as 2 step auth, or after publishing an article)
    EMAIL_PASS="strong_password"
    EMAIL_HOST="smtp.gmail.com" # if using gmail. It might be smtp.domain.tld if you're not sure
    EMAIL_PORT="587" # port for sending secure messages (using ssl)
    EMAIL_NAME="Newspaper" # whatever you want users to see when looking at who sent them an email
    USER_EMAIL_HOST="gmail.com" # if you want to restrict users who sign up to a specific email provider. Use "*" to allow all email addresses

    URL_LENGTH="6" # minimum length of article urls (see /publish)

    testing=0 # don't change unless you're contributing and have read CONTRIBUTING.md

    JWT_SECRET="extremely_secure_random_password" # this is what prevents random people from logging in as others. I recommend using a password generator
  </pre>
</details>


<h3>Firing Up</h3>

<p>You MUST have filled out <code>server/.env</code> before this step</p>

<ol>
    <li>Install <code>composer</code> from <a href="https://getcomposer.org/download/">https://getcomposer.org/download/</a> (to check if you already have it run $ <code>composer -V</code>)
    <li>
      <details>
        <summary>
          $ <code>./install-all --email="your_email" --password="secure_password"</code>
        </summary>
        <ul>
          <li>Note: If the script fails to run, you may need to adjust the shebang (first line in the file)
           to the output of $<code> which php</code>, or the path to whatever php version your webserver is running (possibly #!/usr/local/bin/php)
          </li>
          <li>To see options that can be passed in, run $ <code>./install-all -h</code> (in particular, if you want to have some prefilled data, add <code>--fill-db="true"</code>)
          <li>Installs npm modules needed for frontend</li>
          <li>Uploads database schema to the database named in .env#DB_NAME</li>
          <li>Creates an account with the username "admin" with the email and password passed in</li>
        </ul>
    </li>
    <li>To run on localhost: $ <code>cd client/</code>, $ <code>npm start</code>, and start your webserver pointing at <code>server/public/</code>, then go to <a href="http://localhost:3000">http://localhost:3000</a></li>
    <li>To run in production: $ <code>cd client/</code>, $ <code>npm run build</code>, copy the contents of <code>public/</code> and <code>server/</code> to your server. You may need to adjust <code>server/public/.htacess#Header set Access-Control-Allow-Origin</code>, to the url of your front-end site, and switch <code>client/src/index.tsx</code>'s <code>localhost</code> to the url of your server</li>
</ol>


<h2>Database Information</h2>

<p>Note: You don't need to know any of this to use the project</p>
<p>See <code>server/src/test/GenerateMockRow.php</code> and/or <code>schema.sql</code></p>
