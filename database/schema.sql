-- phpMyAdmin SQL Dump
-- version 4.6.5.2
-- https://www.phpmyadmin.net/
--
-- Generation Time: Sep 10, 2017 at 11:41 PM
-- Server version: 5.6.35
-- PHP Version: 7.0.15

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

-- --------------------------------------------------------

--
-- Table structure for table `comments`
--

CREATE TABLE `comments` (
  `id` int(11) NOT NULL,
  `art_id` int(11) NOT NULL,
  `authorid` int(11) NOT NULL,
  `content` varchar(500) DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `images`
--

CREATE TABLE `images` (
  `id` int(11) NOT NULL,
  `slide` tinyint(1) DEFAULT '1',
  `art_id` int(11) NOT NULL,
  `url` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `issues`
--

CREATE TABLE `issues` (
  `num` int(11) UNSIGNED NOT NULL,
  `ispublic` tinyint(1) NOT NULL DEFAULT '0',
  `name` varchar(20) DEFAULT NULL,
  `madepub` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `pageinfo`
--

CREATE TABLE `pageinfo` (
  `id` int(11) NOT NULL,
  `created` date DEFAULT NULL,
  `url` varchar(75) NOT NULL,
  `lede` blob NOT NULL,
  `body` blob NOT NULL,
  `issue` int(11) UNSIGNED NOT NULL,
  `authorid` int(11) NOT NULL,
  `views` int(11) NOT NULL DEFAULT '0',
  `display_order` int(2) UNSIGNED NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `tags`
--

CREATE TABLE `tags` (
  `id` int(11) NOT NULL,
  `tag` varchar(20) DEFAULT NULL,
  `art_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `tag_list`
--

CREATE TABLE `tag_list` (
  `tag` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` char(20) NOT NULL,
  `f_name` varchar(10) NOT NULL,
  `m_name` char(3) DEFAULT NULL,
  `l_name` varchar(20) NOT NULL,
  `password` text NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `level` int(11) UNSIGNED NOT NULL,
  `auth` text,
  `auth_time` timestamp NULL DEFAULT NULL,
  `notifications` tinyint(1) NOT NULL DEFAULT '1',
  `two_fa_enabled` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `comments`
--
ALTER TABLE `comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `art_id` (`art_id`),
  ADD KEY `authorid` (`authorid`);

--
-- Indexes for table `images`
--
ALTER TABLE `images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `art_id` (`art_id`);

--
-- Indexes for table `issues`
--
ALTER TABLE `issues`
  ADD PRIMARY KEY (`num`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `pageinfo`
--
ALTER TABLE `pageinfo`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `url` (`url`),
  ADD UNIQUE KEY `issue` (`issue`,`url`);

--
-- Indexes for table `tags`
--
ALTER TABLE `tags`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_tags` (`art_id`,`tag`),
  ADD KEY `tag` (`tag`);

--
-- Indexes for table `tag_list`
--
ALTER TABLE `tag_list`
  ADD PRIMARY KEY (`tag`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `f_name` (`f_name`,`m_name`,`l_name`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `comments`
--
ALTER TABLE `comments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `images`
--
ALTER TABLE `images`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `issues`
--
ALTER TABLE `issues`
  MODIFY `num` int(11) UNSIGNED NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `pageinfo`
--
ALTER TABLE `pageinfo`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `tags`
--
ALTER TABLE `tags`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
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
-- Constraints for table `images`
--
ALTER TABLE `images`
  ADD CONSTRAINT `images_ibfk_1` FOREIGN KEY (`art_id`) REFERENCES `pageinfo` (`id`);


--
-- Constraints for table `pageinfo`
--
ALTER TABLE `pageinfo`
  ADD CONSTRAINT `pageinfo_ibfk_1` FOREIGN KEY (`authorid`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `pageinfo_ibfk_2` FOREIGN KEY (`issue`) REFERENCES `issues` (`num`);

--
-- Constraints for table `tags`
--
ALTER TABLE `tags`
  ADD CONSTRAINT `tags_ibfk_1` FOREIGN KEY (`art_id`) REFERENCES `pageinfo` (`id`),
  ADD CONSTRAINT `tags_ibfk_2` FOREIGN KEY (`tag`) REFERENCES `tag_list` (`tag`);
