-- phpMyAdmin SQL Dump
-- version 4.6.5.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:8889
-- Generation Time: Jul 17, 2017 at 02:10 PM
-- Server version: 5.6.35
-- PHP Version: 7.0.15

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

--
-- Database: `MY_TEST`
--

-- --------------------------------------------------------

--
-- Table structure for table `comments`
--

CREATE TABLE IF NOT EXISTS `comments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `art_id` int(11) NOT NULL,
  `authorid` int(11) NOT NULL,
  `content` varchar(500) DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `art_id` (`art_id`),
  KEY `authorid` (`authorid`)
) ENGINE=InnoDB AUTO_INCREMENT=360 DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `issues`
--

CREATE TABLE IF NOT EXISTS `issues` (
  `num` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `ispublic` tinyint(1) NOT NULL DEFAULT '0',
  `name` varchar(20) DEFAULT NULL,
  `madepub` date DEFAULT NULL,
  PRIMARY KEY (`num`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `pageinfo`
--

CREATE TABLE IF NOT EXISTS `pageinfo` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `created` date DEFAULT NULL,
  `url` varchar(75) NOT NULL,
  `lede` blob NOT NULL,
  `img_url` blob,
  `slide_img` varchar(100) DEFAULT NULL,
  `body` blob NOT NULL,
  `issue` int(11) NOT NULL,
  `authorid` varchar(8) DEFAULT NULL,
  `views` int(11) NOT NULL DEFAULT '0',
  `display_order` int(2) UNSIGNED NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `url` (`url`),
  UNIQUE KEY `issue` (`issue`,`url`)
) ENGINE=InnoDB AUTO_INCREMENT=25855 DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `tags`
--

CREATE TABLE IF NOT EXISTS `tags` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `art_id` int(11) NOT NULL,
  `tag1` varchar(15) NOT NULL,
  `tag2` varchar(15) DEFAULT NULL,
  `tag3` varchar(15) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `art_id` (`art_id`)
) ENGINE=InnoDB AUTO_INCREMENT=24934 DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` char(20) NOT NULL,
  `f_name` varchar(10) NOT NULL,
  `m_name` char(3) DEFAULT 'N/A',
  `l_name` varchar(20) NOT NULL,
  `password` text NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `level` int(11) UNSIGNED NOT NULL,
  `auth` text,
  `auth_time` timestamp NULL DEFAULT NULL,
  `notifications` tinyint(1) NOT NULL DEFAULT '1',
  `two_fa_enabled` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `f_name` (`f_name`,`m_name`,`l_name`)
) ENGINE=InnoDB AUTO_INCREMENT=15586 DEFAULT CHARSET=utf8;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `comments`
--
ALTER TABLE `comments`
  ADD CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`art_id`) REFERENCES `pageinfo` (`id`),
  ADD CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`authorid`) REFERENCES `users` (`id`);

--
-- Constraints for table `tags`
--
ALTER TABLE `tags`
  ADD CONSTRAINT `tags_ibfk_1` FOREIGN KEY (`art_id`) REFERENCES `pageinfo` (`id`);
