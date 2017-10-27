<?php

require_once(__DIR__ . '/../../vendor/autoload.php');
require_once(__DIR__ . '/GenerateMockRow.php');
use Faker\Provider\Base;

class GenerateMockRows extends GenerateMockRow {

    public $users = [], $issues = [], $pageinfo = [], $tag_list = [], $tags = [], $comments = [], $images = [];

    public function users() {

        $amount = rand(3, 100);

        $levelsNeeded = [1, 2, 3];

        while ($amount-- > 0) {

            $user = $this->user();

            if (!empty($levelsNeeded)) {
                $user['level'] = array_shift($levelsNeeded);
            }

            $this->users[] = $user;
        }
    }

    public function issues() {

        $amount = rand(1, 100);

        while ($amount-- > 1) {

            $issue = $this->issue();
            $issue['num'] = $amount;

            $this->issues[] = $issue;
        }

        $this->issues[0]['ispublic'] = 0;
    }

    public function pageinfos() {

        $faker = Faker\Factory::create();

        $issueUsed = 1;
        $maxIssue = count($this->issues);

        $amount = rand(1, 100);

        while ($amount-- > 0) {

            $page = parent::pageinfo();

            $page['authorid'] = $faker->randomElement($this->users)['id'];

            // if not all issues have an article, give it one, else assign random issue
            if ($issueUsed < $maxIssue) {

                $page['issue'] = $issueUsed++;
            } else {

                $page['issue'] = rand(1, $maxIssue);
            }

            $this->pageinfo[] = $page;
        }
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