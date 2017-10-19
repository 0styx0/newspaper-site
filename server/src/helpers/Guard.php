<?php

class Guard {

    /**
     * Makes sure user is logged in
     *
     * @throw Error 'User must be logged in'
     *
     * @return true if user is logged in, error otherwise
     */
    public static function userMustBeLoggedIn() {

        if (!Jwt::getToken()) {
            throw new Error('User must be logged in');
        }

        return true;
    }
}



?>