<?php

require_once(__DIR__ . '/../../vendor/autoload.php');
require_once(__DIR__ . '/GenerateMockRow.php');
use Faker\Provider\Base;

class GenerateMockRows extends GenerateMockRow {

    public $users = [], $issues = [], $pageinfo = [], $tag_list = [], $tags = [], $comments = [], $images = [];

    /**
     * Generates random number of users, but always at least 1 user per level
     *
     */
    public function users() {

        $levelsNeeded = [1, 2, 3];

        $amount = rand(count($levelsNeeded), 100);

        while ($amount-- > 0) {

            $user = $this->user();

            if (!empty($levelsNeeded)) {
                $user['level'] = array_shift($levelsNeeded);
            }

            $this->users[] = $user;
        }
    }

    /**
     * Generates random number of issues, the last being private the others public. [0] is private
     *
     */
    public function issues() {

        $amount = rand(2, 100); // 2, so at least 1 public 1 private

        while ($amount-- > 1) {

            $issue = $this->issue();
            $issue['num'] = $amount;

            $this->issues[] = $issue;
        }

        $this->issues[0]['ispublic'] = 0;
    }

    private function ensureAllIssuesHaveArticle(int $maxIssue, GenerateMockRows $self) {

        $faker = Faker\Factory::create();
        $amount = rand($maxIssue, 100);

        while ($amount-- > 1) {

            $page = $self->pageinfo();

            $page['authorid'] = $faker->randomElement($self->users)['id'];

            $page['issue'] = $amount > $maxIssue ? $faker->randomElement($self->issues)['num'] : $amount;

            $self->pageinfo[] = $page;
        }
    }

    private function ensureAllLevelsHavePrivateArticle(int $maxIssue, GenerateMockRows $self) {

        for ($i = 1; $i < 4; $i++) {

            $page = $self->pageinfo();

            $author = HelpTests::searchArray($self->users, function($currentUser, int $levelOfAuthor) {
                return $currentUser['level'] == $levelOfAuthor;
            }, $i);

            $page['authorid'] = $author['id'];
            $page['issue'] = $maxIssue;
            $self->pageinfo[] = $page;
        }
    }


    private function ensureAllLevelsHavePublicArticle(int $maxIssue, GenerateMockRows $self) {

        for ($i = 1; $i < 4; $i++) {

            $page = $self->pageinfo();

            $author = HelpTests::searchArray($self->users, function($currentUser, int $levelOfAuthor) {
                return $currentUser['level'] == $levelOfAuthor;
            }, $i);

            $page['authorid'] = $author['id'];
            $page['issue'] = rand(1, $maxIssue - 1);
            $self->pageinfo[] = $page;
        }
    }


    public function pageinfos() {

        $maxIssue = count($this->issues);

        $this->ensureAllIssuesHaveArticle($maxIssue, $this);

        $this->ensureAllLevelsHavePrivateArticle($maxIssue, $this);

        $this->ensureAllLevelsHavePrivateArticle($maxIssue, $this);
    }

    public function tag_lists() {

        $amount = rand(1, 100);

        while ($amount-- > 0) {

            $this->tag_list[] = parent::tag_list();
        }
    }

    public function tags() {

        $faker = Faker\Factory::create();

        $availableTags = count($this->tag_list);

        foreach ($this->pageinfo as $article) {

            $tagsToUse = rand(1, $availableTags);
            $tags = array_column($faker->randomElements($this->tag_list, $tagsToUse), 'tag');

            foreach ($tags as $tag) {

                $articleTag = parent::tag();

                $articleTag['tag'] = $tag;
                $articleTag['art_id'] = $article['id'];

                $this->tags[] = $articleTag;
            }
        }
    }

    public function comments() {

        $faker = Faker\Factory::create();

        foreach ($faker->randomElements($this->pageinfo) as $article) {

            $numberOfComments = rand(1, 100);

            while ($numberOfComments-- > 0) {

                $comment = parent::comment();

                $comment['art_id'] = $article['id'];
                $comment['authorid'] = $faker->randomElement($this->users)['id'];

                $this->comments[] = $comment;
            }
        }
    }

    public function images() {

        $faker = Faker\Factory::create();

        foreach ($faker->randomElements($this->pageinfo) as $article) {

            $amount = rand(1, 100);

            while ($amount-- > 0) {

                $article['body'] .= '<img data-src />';

                $image = parent::image();
                $image['art_id'] = $article['id'];

                $this->images[] = $image;
            }

        }
    }

    public function all() {

        $this->users();
        $this->issues();
        $this->pageinfos();
        $this->tag_lists();
        $this->tags();
        $this->comments();
        $this->images();
    }

}

?>