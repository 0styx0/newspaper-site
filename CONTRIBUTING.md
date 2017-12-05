
<h2>Table of Contents</h2>
<ol>
    <li><a href="#idealHelper">Who can contribute</a></li>
    <li><a href="#technologies">Technologies</a></li>
    <li><a href="#pullRequests">Pull Requests</a></li>
    <li><a href="#testing">Testing</a></li>
    <li><a href="#docs">Building documentation</a></li>
</ol>

<h2>Who Can Contribute</h2>
<p>Anyone can! Anything from fixing a spelling mistake, adding documentation, writing tests, fixing bugs, to adding entire features are all welcome. With that in mind, please be sure to read the <a href="#pullRequests">Pull Requests</a> section before contributing</p>

<h2 id="technologies">Technologies Used</h2>

<h3>Front-end:</h3>
<ul>
    <li>TypeScript</li>
    <li>React</li>
    <li>GraphQL</li>
</ul>

<h3>Server:</h3>
<ul>
    <li>PHP</li>
    <li>GraphQL</li>
</ul>


<h2 id="pullRequests">Pull Requests</h2>
<ol>
    <li>See <a href="README.md">README.MD</a> for instructions on setting up</li>
    <li>Create a branch named for the feature you'd like to add</li>
    <li>All pull requests must pass client and server side tests (explained below)</li>
    <li>When possible, follow existing rules (such as tslint)</li>
    <li>Make code as easy as possible to read. Clear variable names and/or jsdoc comments generally do it</li>
    <li><strong>Add tests for any new features</strong></li>
</ol>

<h2 id="testing">Testing</h2>

<h3>Front-end:</h2>
<ul>
    <li>Run $ <code>npm test</code> in the <code>client/</code> directory</li>
    <li>
      <details>
        <summary>NOTE: <code>TagSelect</code> must have <code>test = true</code> and uncomment graphql lines
        </summary>
        This is because of problems with mocking graphql. Feel free to fix this
    </li>
</ul>

<h3>Server:</h3>
<strong>Note: This will DELETE ALL DATA in your database</strong>
<ul>
    <li>Set <code>server/.env</code>'s <code>test=1</code></li>
    <li>$ <code>cd server/src/test</code></li>
    <li>$ <code>php runAll.php</code></li>
</ul>

<h2 id="docs">Docs</h2>
<p>Documentation is available for client-side. Run $ <code>cd client/</code>, $ <code>npm run docs</code>, and $ <code>open docs/index.html</code> in your browser</p>
