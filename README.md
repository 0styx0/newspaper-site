# eyeStorm-nodeJS

<h1>Background</h1>
<p>This is the code behind my school newspaper's site, currently located at <a href="https://tabceots.com">https://tabceots.com</a></p>

<h2>Table of Contents</h2>
<ul>
    <li><a href="#about">About</a></li>
    <li><a href="#typesOfUsers">Types of users</a></li>
    <li><a href="#publishing">How to publish</a></li>
    <li><a href="#commenting">Rules of commenting</a></li>
    <li>Business Logic</li> // ? signup process, article's tags (publishing process), what happens when user is deleted, how commenting works
    <li><a href="#build">How to build</a></li>
</ul>

<h2 id="about">About</h2>
<p>This is a newspaper site. Simply put, one can create an account, publish articles, and eventually have it world viewable.</p>

<h2 id="typesOfUsers">About - In Depth</h2>

<h2>Types of users</h2>
<p>In this site there are 4 types of users. Note that each type of user can do at least that of the user before it.
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
               At this point, even if the user is level 1, they can edit it <br />
               At any point from here on the creator or level 3 users can delete it</p>
        </details>
    </li>
    <li>
        <details>
            <summary>After a few articles have been uploaded, it's time to make it world viewable, and publish the issue. To do this, a level 3 user goes to <code>/issue</code>, gives the issue a name, toggles the "Published" table cell to "Yes", and submits the form</summary>
            <p>At this point, only level 3 users can edit the article, although both the owner and level 3s can still delete articles <br />The issue name is now permanent, and the issue cannot be set to private again</p>
        </details>
    </li>
    <li>Done. The next article published will be in a new, private issue</li>
</ol>

<h2 id="commenting">Commenting</h2>
<ul>
    <li>Comments must be at least 5 characters long</li>
    <li>Can only comment on public articles </li>
    <li>Views only increment when not logged in, and when viewing public articles</li>
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

    testing=0 # don't change unless you're contributing and have read <a href="CONTRIBUTING.md#testing">CONTRIBUTING.md</a>

    JWT_SECRET="extremely_secure_random_password" # this is what prevents random people from logging in as others. I recommend using a password generator
  </pre>
</details>


<h3>Firing Up</h3>
// TODO: update this
<p>You MUST have filled out <code>server/.env</code> before this step</p>

<ol>
    <li>
      <details>
        <summary>
          <code>$ node ./install-all -email your_email -password secure_password</code>
          (note: bcrypt module might cause problems. Rerun the command if that happens and it should work)
        </summary>
        <ul>
          <li>Installs nodejs modules needed for backend and frontend</li>
          <li>Uploads database schema to the database named in config.json</li>
          <li>Creates an account with the username "admin" with the email and password passed in</li>
        </ul>
    </li>
    <li><code>node ./start-all</code> // starts front and backend servers</li>
    <li>Go to <a href="http://localhost:3001">http://localhost:3001</a> in your browser</li>
</ol>


<h1>Database Information</h1>

<p>Note: You don't need to know any of this to use the project</p>

<h3 id="dbUsersInfo">users</h3>
<ul>
    <li><code>username</code>, <code>f_name</code>, <code>m_name</code> (optional), <code>l_name</code> - 1 word</li>
    <li><code>email</code> - must end with <a href="#configFile">config.json</a>'s EMAIL_HOST (or anything, if EMAIL_HOST is '*'</li>
    <li><code>level</code> - 1-3</li>
    <li><code>password</code>, <code>auth</code> - bcrypt hashed</li>
    <li><code>notifications</code>, <code>two_fa_enabled</code> - 1 or 0, default is 1</li>
    <li><code>auth_time</code> - regular old timestamp</li>
</ul>

<h3>pageinfo</h3>
<ul>
    <li><code>created</code> - timestamp when article was created</li>
    <li><code>url</code> - url of where, relative to the root directory, the article with be located</li>
    <li><code>lede</code> - first part of article (title, author, first paragraph), separate from rest to make it easier (and with my limited knowledge I think easier than getting the entire article every time someone goes to the main page (for this is what is viewable on the main page)</li>
    <li><code>img_url</code> - stringified array of all images in the article. The actual <img> src is replaced with data-src</li>
    <li><code>slide_img</code> - stringifed array of 1,0 for whether an image should be in the slideshow shown in the home page. Corresponds with img_url</li>
    <li><code>body</code> - body of article (basically everything in the article except the lede)</li>
    <li><code>issue</code> - issue number, corresponds with <code>issue.num</code></li>
    <li><code>authorid</code> - id of author</li>
    <li><code>views</code> - how many views an article has. This number should not be affected by logged in users viewing articles</li>
    <li><code>display_order</code> - which articles should display where on the home page. Highest number displays first</li>
</ul>

<h3>issues</h3>
<ul>
    <li><code>num</code> - issue number (primary key, autoincremented)</li>
    <li><code>ispublic</code> - boolean if articles in issue are viewable by everyone, or just logged in users</li>
    <li><code>name</code> - name of issue (displayed in home page)</li>
    <li><code>madepub</code> - date the issue was made public</li>
</ul>

<h3>comments</h3>
<ul>
    <li><code>art_id</code> - id of article (foreign key)</li>
    <li><code>authorid</code> - id of author of comment (foreign key)</li>
    <li><code>content</code> - actual comment (html)</li>
    <li><code>created</code> - date comment was posted</li>
</ul>

<h3>tag_list</h3>
<ul>
    <li><code>tag</code> - string. Only entries in here can be used as <code>tag</code> in the <code>tags</code> table</li>
</ul>

<h3>tags</h3>
<ul>
    <li><code>art_id</code> - see comments.art_id</li>
    <li><code>tag</code> - tags of the article</li>
</ul>
