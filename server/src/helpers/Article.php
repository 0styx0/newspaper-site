<?php

class ArticleHelper {

    /**
    * Splits up an article into lede, body, images
    */
    public function breakDownArticle(string $article) {

        list($modifiedArticle, $images) = $this->separatePics($article);

        preg_match("/.(?!\/.+>)<\/p>/", $modifiedArticle, $firstParagraph) || preg_match("/<\/p>/", $modifiedArticle, $firstParagraph);

        $charsUntilEndOfParagraphTag = 5;
        $positionOfSecondParagraph = strpos($modifiedArticle, $firstParagraph[0]) + $charsUntilEndOfParagraphTag;

        $lede = substr($modifiedArticle, 0, $positionOfSecondParagraph);

        $body = substr($modifiedArticle, $positionOfSecondParagraph);

        return [
            $lede,
            $body,
            $images
        ];
    }

    /**
    *
    * @return {
    *  images - array of {url: taken from `article`'s `img src`s, slide: whether img can be in slideshow}
    *  modifiedArticle - `article`, but with all <img> `src` replaced with `data-src`
    * }
    */
    private function separatePics(string $article) {

        $images = [];
        $match;

        preg_match_all('/src=([\'"])([^\1]+?)\1/', $article, $picMatches);
        $picSources = $picMatches[2];

        foreach ($picSources as $src) {
            $images[] = ['url' => $src, 'slide' => 1];
        }

        $modifiedArticle = preg_replace('/src=([\'"])([^\1]+?)\1/', 'data-src', $article);

        preg_match_all("/<img.[^>]+/", $article, $imageMatches);
        $imageTags = $imageMatches[0];

        for ($i = 0; $i < count($images); $i++) {

            if (strpos($imageTags[$i], 'previewHidden')) {
                $images[$i]['slide'] = 0;
            }
        }

        return [
            $modifiedArticle,
            $images
        ];
    }

    /**
     * @param $toStrip - string
     *
     * @return $toStrip, stripped of all tags except ones listed in function
     */
    public function stripTags(string $toStrip) {

        $config = HTMLPurifier_Config::createDefault();
        $config->set('URI.AllowedSchemes', ['http' => true,
                                            'https' => true,
                                            'mailto' => true,
                                            'tel' => true,
                                            'data'=>true]);
        $config->set('Attr.DefaultImageAlt', '');
        $config->set('HTML.Allowed', 'h1,h2,h3,h4,h5,h6,pre,img,p,a,table,td,tr,th,tbody,thead,tfoot,strong,b,em,i,u,sub,sup,font,strike,ul,ol,li,q,blockquote,br,abbr,div,span');
        $config->set('AutoFormat.RemoveEmpty', true); // remove empty tag pairs
        $config->set('AutoFormat.RemoveEmpty.RemoveNbsp', true); // remove empty, even if it contains an &nbsp;
        $config->set('AutoFormat.AutoParagraph', true); // remove empty tag pairs

        $purifier = new HTMLPurifier($config);
        $purified = $purifier->purify($toStrip);

        return $purified;
    }

    /**
     * Adds tags to article
     *
     * @param $articleId - id of article to give tags to
     * @param $tags - string[] new tags to give article
     */
    public function addTags(string $articleId, array $tags) {

        if (empty($tags)) {
            return;
        }

        $placeholders = implode(',', array_fill(0, count($tags), '(?, ?)'));

        // doing the $placeholders and loop here since I think it's more efficient than running sql in a loop
        $tagInfo = [];
        foreach ($tags as $tag) {
            array_push($tagInfo, $articleId, $tag);
        }

        Db::query("INSERT INTO tags (art_id, tag) VALUES {$placeholders}", $tagInfo);
    }

    /**
     * Adds images to image db table
     *
     * @param $articleId - id of article the images came from
     * @param $images - assoc array ['url' => url_of_img, 'slide' => if_img_should_be_in_slideshow]
     */
    public function addImages(string $articleId, array $images) {

        if (empty($images)) {
            return;
        }

        $placeholders = implode(',', array_fill(0, count($images), '(?, ?, ?)'));

        // doing the $placeholders and loop here since I think it's more efficient than running sql in a loop
        $imageInfo = [];
        foreach ($images as $image) {
            array_push($imageInfo, $articleId, $image['url'], $image['slide']);
        }

        Db::query("INSERT INTO images (art_id, url, slide) VALUES ({$placeholders})", $imageInfo);
    }
}

?>