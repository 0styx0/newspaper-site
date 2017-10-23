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
        $purifier = new HTMLPurifier($config);
        $toStrip = $purifier->purify($toStrip);
        return strip_tags($toStrip, '<h1><h2><h3><h4><h5><h6><pre><img><p><a><table><td><tr><th><tbody><thead><tfoot><strong><b><em><i><u><sub><sup><font><strike><ul><ol><li><q><blockquote><br><abbr><div><span>');
    }
}

?>