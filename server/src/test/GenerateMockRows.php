<?php

require_once(__DIR__ . '/../../vendor/autoload.php');
require_once(__DIR__ . '/GenerateMockRow.php');
use Faker\Provider\Base;

$dotenv = new Dotenv\Dotenv(__DIR__ . '/../../');
$dotenv->load();

class GenerateMockRows extends GenerateMockRow {

    public $users = [], $issues = [], $pageinfo = [], $tag_list = [], $tags = [], $comments = [], $images = [];

    /**
     *
     * @param $differentSettings - in form of [
     *    ['db_row_name' => [value_1, value_n], 'db_row_name' => value_1, value_n],
     *  ]
     *
     *  @param $generateRow - name of method to call to generate db row
     *
     * @return array of rows generated by GenerateMockRow->$generateRow,
     *  with values in each row assigned using each row of $differentSettings
     *
     * @example ensureAllSettingVariations([['level' => [1, 2, 3]]], 'user') returns 3 rows with results of
     *  GenerateMockRow->user(), with first row having level 1, second level 2, etc
     */
    private function ensureAllSettingVariations(array $differentSettings, string $generateRow) {

        $customRows = [];

        foreach ($differentSettings as $row) {

            $customRow = [];

            foreach ($row as $settingName => $options) {

                foreach ($options as $key => $value) { // when need to change multiple settings

                    if (!isset($customRow[$key])) {
                        $customRow[$key] = $this->{$generateRow}();;
                    }

                    $customRow[$key][$settingName] = $value;
                }
            }

            $customRows = array_merge($customRows, $customRow);
        }

        return $customRows;
    }

    /**
     * Generates random number of users, but always at least 1 user per level
     *
     */
    public function users() {

        $differentSettings = [
            ['level' => [1, 2, 3, 1, 2, 3]], // all levels, double so can test if user is modifying same level user
            ['notifications' => [1, 0]],
            ['two_fa_enabled' => [1, 0]]
        ];

        $this->users = $this->ensureAllSettingVariations($differentSettings, 'user');
    }

    /**
     * Generates random number of issues, the last being private the others public. [0] is private
     *
     */
    public function issues() {

        $differentSettings = [
            // 2 must be first since previous code depends on $this->issues[0]['ispublic'] being false
            ['num' => [2, 1]]
        ];

        $this->issues = $this->ensureAllSettingVariations($differentSettings, 'issue');

        $this->issues[0]['ispublic'] = 0;
    }

    private function ensureAllIssuesHaveArticle() {

        $idsNeeded = count($this->issues);

        $randomIds = array_column(HelpTests::faker()->randomElements($this->users, $idsNeeded), 'id');

        $differentSettings = [
            ['issue' => array_column($this->issues, 'num'), 'authorid' => $randomIds]
        ];

        return $this->ensureAllSettingVariations($differentSettings, 'pageinfo');
    }

    private function getIdsOfAllLevels() {

        $allLevels = array_unique(array_column($this->users, 'level'));

        $usersOfAllLevels = [];

        foreach ($this->users as $user) {

            $levelWasNotYetFound = array_search($user['level'], $allLevels);

           if ($levelWasNotYetFound !== false) {
               $usersOfAllLevels[] = $user['id'];
               array_splice($allLevels, $levelWasNotYetFound, 1);
           }
        }

        return $usersOfAllLevels;
    }

    private function ensureAllLevelsHavePrivateArticle() {

        $usersOfAllLevels = $this->getIdsOfAllLevels();
        $privateIssue = array_fill(0, count($usersOfAllLevels), $this->issues[0]['num']);

        $differentSettings = [
            ['authorid' => $usersOfAllLevels, 'issue' => $privateIssue]
        ];

        return $this->ensureAllSettingVariations($differentSettings, 'pageinfo');
    }

    private function ensureAllLevelsHavePublicArticle() {

        $usersOfAllLevels = $this->getIdsOfAllLevels();
        $publicIssue = array_fill(0, count($usersOfAllLevels), $this->issues[1]['num']);

        $differentSettings = [
            ['authorid' => $usersOfAllLevels, 'issue' => $publicIssue]
        ];

        return $this->ensureAllSettingVariations($differentSettings, 'pageinfo');
    }


    public function pageinfos() {

        $this->pageinfo = array_merge($this->ensureAllIssuesHaveArticle(),
         $this->ensureAllLevelsHavePrivateArticle(),
         $this->ensureAllLevelsHavePublicArticle()
        );
    }

    public function tag_lists() {

        $amount = rand(1, 10); // 10 is random

        while ($amount-- > 0) {

            $this->tag_list[] = parent::tag_list();
        }
    }

    public function tags() { // every article needs at least 1

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
        $publicCommentCreated = false;

        // giving random articles comments, but making sure at least 1 private and 1 public article has one
        foreach ($this->pageinfo as $article) {

            $ispublic = $article['issue'] !== $this->issues[0]['num'];

            if (rand(0, 1) && $ispublic && $publicCommentCreated) {
                continue;
            }

            $numberOfComments = rand(1, 5); // random numbers

            while ($numberOfComments-- > 0) {

                $comment = parent::comment();

                $comment['art_id'] = $article['id'];
                $comment['authorid'] = $faker->randomElement($this->users)['id'];

                $this->comments[] = $comment;
            }

            if ($ispublic) {
                $publicCommentCreated = true;
            }
        }
    }

    public function images() {

        $faker = Faker\Factory::create();

        foreach ($faker->randomElements($this->pageinfo) as $article) {

            $amount = rand(1, 10); // 10 is random

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