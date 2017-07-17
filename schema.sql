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
-- Table structure for table `COMMENTS`
--

CREATE TABLE IF NOT EXISTS `COMMENTS` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `ART_ID` int(11) NOT NULL,
  `AUTHORID` int(11) NOT NULL,
  `CONTENT` varchar(500) DEFAULT NULL,
  `CREATED` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID`),
  KEY `ART_ID` (`ART_ID`),
  KEY `AUTHORID` (`AUTHORID`)
) ENGINE=InnoDB AUTO_INCREMENT=360 DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `issues`
--

CREATE TABLE IF NOT EXISTS `issues` (
  `NUM` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `ISPUBLIC` tinyint(1) NOT NULL DEFAULT '0',
  `NAME` varchar(20) DEFAULT NULL,
  `MADEPUB` date DEFAULT NULL,
  PRIMARY KEY (`NUM`),
  UNIQUE KEY `NAME` (`NAME`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `PAGEINFO`
--

CREATE TABLE IF NOT EXISTS `PAGEINFO` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `CREATED` date DEFAULT NULL,
  `URL` varchar(75) NOT NULL,
  `LEDE` blob NOT NULL,
  `IMG_URL` blob,
  `SLIDE_IMG` varchar(100) DEFAULT NULL,
  `BODY` blob NOT NULL,
  `ISSUE` int(11) NOT NULL,
  `AUTHORID` varchar(8) DEFAULT NULL,
  `VIEWS` int(11) NOT NULL DEFAULT '0',
  `DISPLAY_ORDER` int(2) UNSIGNED NOT NULL DEFAULT '0',
  PRIMARY KEY (`ID`),
  UNIQUE KEY `URL` (`URL`),
  UNIQUE KEY `ISSUE` (`ISSUE`,`URL`)
) ENGINE=InnoDB AUTO_INCREMENT=25855 DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `TAGS`
--

CREATE TABLE IF NOT EXISTS `TAGS` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `ART_ID` int(11) NOT NULL,
  `TAG1` varchar(15) NOT NULL,
  `TAG2` varchar(15) DEFAULT NULL,
  `TAG3` varchar(15) DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `ART_ID` (`ART_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=24934 DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `USERS`
--

CREATE TABLE IF NOT EXISTS `USERS` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `USERNAME` char(20) NOT NULL,
  `F_NAME` varchar(10) NOT NULL,
  `M_NAME` char(3) DEFAULT 'N/A',
  `L_NAME` varchar(20) NOT NULL,
  `PASSWORD` text NOT NULL,
  `EMAIL` varchar(255) DEFAULT NULL,
  `LEVEL` int(11) UNSIGNED NOT NULL,
  `AUTH` text,
  `AUTH_TIME` timestamp NULL DEFAULT NULL,
  `NOTIFICATIONS` tinyint(1) NOT NULL DEFAULT '1',
  `TWO_FA_ENABLED` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`ID`),
  UNIQUE KEY `USERNAME` (`USERNAME`),
  UNIQUE KEY `F_NAME` (`F_NAME`,`M_NAME`,`L_NAME`)
) ENGINE=InnoDB AUTO_INCREMENT=15586 DEFAULT CHARSET=utf8;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `COMMENTS`
--
ALTER TABLE `COMMENTS`
  ADD CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`ART_ID`) REFERENCES `PAGEINFO` (`ID`),
  ADD CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`AUTHORID`) REFERENCES `USERS` (`ID`);

--
-- Constraints for table `TAGS`
--
ALTER TABLE `TAGS`
  ADD CONSTRAINT `tags_ibfk_1` FOREIGN KEY (`ART_ID`) REFERENCES `PAGEINFO` (`ID`);
