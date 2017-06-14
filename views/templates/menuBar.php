<?php
    require_once(__DIR__."/../../controller/vendor/autoload.php");
    $User = new User();
    $token = $User->getJWT();
?>
<nav>


    <ul>
        <li> <a href="/">Home</a></li>


            <label for='menuToggle'>
                <li class='showMenu hidden'> ||| </li>
            </label>

            <input id='menuToggle' checked tabindex="-1" type='checkbox'>

         <li>
            <select id="artTypes">
              <option value="all">Current Issue</option>
              <option value="reaction">Reaction</option>
              <option value="opinion">Opinion</option>
              <option value="poll">Poll</option>
               <option value="features">Features</option>
               <option value="sports">Sports</option>
               <option value="news">News</option>
               <option value="politics">Politics</option>
              <option value="other">Other</option>
            </select>
        </li>

        <?php echo !isset($token->level) ? '<li><a href="/login">Log In</a></li>' : "" ?>

        <li><a href="/signup">
            <?php echo isset($token->level) ? "Create Accounts" : "Sign Up"; ?>
            </a></li>
        <li><a href="/u">Journalists</a></li>
        <li><a href="/mission">Mission</a></li>
        <li><a href="/issue/">Issues</a></li>

        <?php


            if (isset($token->level)) {

                $items = "";

                switch($token->level) {
                    case 3:
                        $items .= '<li><a href="/modifyArticles">Articles</a></li>';
                    case 2:
                    case 1:
                        $items .= '
                        <li><a href="/publish">Publish</a></li>';
                }

                // separate so if have 2fa but no code yet and want to log out of that portion
                if (isset($token->id)) {
                        $items .= '<li id="logout">
                                       <form id="menuOut" method="post" action="/api/userStatus">
                                           <input id="logoutInpt" type="submit" name="logout" value="Log Out" />
                                       </form>
                                   </li>
                        <li class="profile"><a href="/u/'.$token->email.'">'.$token->email.'</a></li>';
                }
            echo $items;

            }

        ?>
    </ul>

</nav>


<div class="messages"></div>
