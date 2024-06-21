-- --------------------------------------------------------
-- Hôte:                         127.0.0.1
-- Version du serveur:           8.0.30 - MySQL Community Server - GPL
-- SE du serveur:                Win64
-- HeidiSQL Version:             12.1.0.6537
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Listage de la structure de la base pour app_soslost
CREATE DATABASE IF NOT EXISTS `app_soslost` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `app_soslost`;

-- Listage de la structure de table app_soslost. child
CREATE TABLE IF NOT EXISTS `child` (
  `id` int NOT NULL AUTO_INCREMENT,
  `prenom` varchar(250) NOT NULL,
  `nom` varchar(250) NOT NULL,
  `age` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Listage des données de la table app_soslost.child : ~0 rows (environ)
INSERT INTO `child` (`id`, `prenom`, `nom`, `age`) VALUES
	(1, 'Kevin', 'Chhem', 8);

-- Listage de la structure de table app_soslost. roles
CREATE TABLE IF NOT EXISTS `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(50) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Listage des données de la table app_soslost.roles : ~2 rows (environ)
INSERT INTO `roles` (`id`, `nom`) VALUES
	(1, 'utilisateur'),
	(2, 'admin');

-- Listage de la structure de table app_soslost. tuteur
CREATE TABLE IF NOT EXISTS `tuteur` (
  `id` int NOT NULL AUTO_INCREMENT,
  `child_id` int NOT NULL,
  `user_id` int NOT NULL,
  `tel` int NOT NULL,
  `lien_affilié` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `tel` (`tel`),
  KEY `FK__child` (`child_id`),
  KEY `FK__user` (`user_id`),
  CONSTRAINT `FK__child` FOREIGN KEY (`child_id`) REFERENCES `child` (`id`),
  CONSTRAINT `FK__user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Listage des données de la table app_soslost.tuteur : ~0 rows (environ)

-- Listage de la structure de table app_soslost. user
CREATE TABLE IF NOT EXISTS `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `prenom` varchar(200) NOT NULL,
  `nom` varchar(200) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `password2` varchar(255) NOT NULL,
  `role_id` int NOT NULL,
  `email_activate` tinyint(1) DEFAULT '0',
  `reset_token` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `reset_token_expiry` varchar(50) DEFAULT NULL,
  `two_factor_secret` varchar(32) DEFAULT NULL,
  `two_factor_enabled` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `Index 2` (`role_id`),
  CONSTRAINT `FK_user_roles` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Listage des données de la table app_soslost.user : ~16 rows (environ)
INSERT INTO `user` (`id`, `prenom`, `nom`, `email`, `password`, `password2`, `role_id`, `email_activate`, `reset_token`, `reset_token_expiry`, `two_factor_secret`, `two_factor_enabled`, `created_at`, `updated_at`) VALUES
	(6, 'Louna', 'Dupont', 'louna.dupont@gmail.com', '$2b$10$Ys0J056cRyTyKnhRcTtZf.dZGWnFf5blxTuA0sy..qnK6smjCOw3i', '$2b$10$Ys0J056cRyTyKnhRcTtZf.dZGWnFf5blxTuA0sy..qnK6smjCOw3i', 1, 0, NULL, NULL, NULL, 0, '2024-06-18 08:25:47', '2024-06-18 08:26:03'),
	(7, 'Kylian', 'Dupont', 'kylian.dupont@gmail.com', '$2b$10$YrwfMKD0m2FHidxgp8xcL.xKOsSqDIO1.BNdcWYBBiJjGOdP55FKW', '$2b$10$YrwfMKD0m2FHidxgp8xcL.xKOsSqDIO1.BNdcWYBBiJjGOdP55FKW', 1, 0, NULL, NULL, NULL, 0, '2024-06-18 08:25:47', '2024-06-18 08:26:03'),
	(8, 'John', 'Doe', 'john.doe@example.com', '$2b$10$m2gjkZC4lTK6zx.jTUCt5u6psHmG8R9BagqxQ983/2qAGgwIivKd6', '$2b$10$m2gjkZC4lTK6zx.jTUCt5u6psHmG8R9BagqxQ983/2qAGgwIivKd6', 1, 0, NULL, NULL, NULL, 0, '2024-06-18 08:25:47', '2024-06-18 08:26:03'),
	(9, 'Soraia', 'Dupuis', 'soraia.dupuis@gmail.com', '$2b$10$liTi8.6lOoSsBhMhWDLjJeCtE3.iwbI1DjIKQTEP1Sa3JYPQznloS', '$2b$10$rOCROOzSDOZ6HODvKTGlOuAu57jI5xPgGEbMzJjmxLUbbZeRj8rfe', 1, 1, NULL, NULL, 'KQ4HE4BOGB2FI6JGIJ3USWCLOV5TMMT3', 1, '2024-06-18 08:25:47', '2024-06-18 12:46:07'),
	(10, 'Malonne', 'Seng', 'malonne.seng@gmail.com', '$2b$10$apHyzQa7GWF4KvVHh40QguJmxIKfkHHqujc6l1QPxtrRfDgE7losK', '$2b$10$nGhpNhi5iXCUSeGkVFqFve9m14E9ODrKFSeRc/lc/fTKPOQ0w9BnC', 1, 1, NULL, NULL, NULL, 0, '2024-06-18 08:25:47', '2024-06-18 08:26:03'),
	(11, 'Merve', 'Gok', 'merve.gok@gmail.com', '$2b$10$SsDLqbFNYaxF2/4WTOhCXu4Xz2IWfAZYi.QUqsajf/htOwX2VkZje', '$2b$10$ng8BpPSPWDtSgxiHdrXIy.t/asM187rSWEPEw9ac.jWjfUUv2TezO', 1, 1, NULL, NULL, 'FB5UA6TLLBEUGQRWNQZFITLXH5SUCOKR', 1, '2024-06-18 12:52:10', '2024-06-18 13:00:06'),
	(12, 'Melissa', 'Gok', 'melissa.gok@gmail.com', '$2b$10$ybSK9kFd6nKrH4K.EDUrfOjlGdS/7JjlwW.rXtUPxw79JPsC/LWRa', '$2b$10$ybSK9kFd6nKrH4K.EDUrfOjlGdS/7JjlwW.rXtUPxw79JPsC/LWRa', 1, 0, NULL, NULL, 'HIVFMRZFJ4XHQ4SHLM5EG3KUJB6WQYJ6', 1, '2024-06-18 14:18:04', '2024-06-18 14:26:27'),
	(13, 'Berat', 'Gok', 'berat.gok@gmail.com', '$2b$10$I5qfmktMEukEZNB4XFW4LOLpt7kEYmZCSuBbad4UPGXwwXn0v7bRG', '$2b$10$I5qfmktMEukEZNB4XFW4LOLpt7kEYmZCSuBbad4UPGXwwXn0v7bRG', 1, 0, NULL, NULL, 'EFNHAU2CNNEE66BOMUYCK42KNZSDUI3B', 0, '2024-06-18 14:27:42', '2024-06-18 14:27:42'),
	(14, 'Charles', 'Pion', 'charles.pion@gmail.com', '$2b$10$/lX3KgCoHu4G8rPdN4c3huXQY5hRgclfCNx57/.zMsDC54tOJPKQi', '$2b$10$/lX3KgCoHu4G8rPdN4c3huXQY5hRgclfCNx57/.zMsDC54tOJPKQi', 1, 1, NULL, NULL, 'NRID4JR6H5REAIZOJFSDAULMPE3USOCG', 0, '2024-06-19 07:27:44', '2024-06-19 07:27:54'),
	(17, 'Charlotte', 'Pion', 'charlotte.pion@gmail.com', '$2b$10$GNmHoW42.clYMNXh8fyac.YvWZT2Pv84XCATMQGDyARmrW5Nwho86', '$2b$10$GNmHoW42.clYMNXh8fyac.YvWZT2Pv84XCATMQGDyARmrW5Nwho86', 1, 1, NULL, NULL, 'IFQV2M2INFCWOUDBK5THMPCJER4HSSKD', 1, '2024-06-19 07:40:03', '2024-06-19 08:38:05'),
	(19, 'Zendaya', 'Coleman', 'zendaya.coleman@example.com', '$2b$10$fnHU1G..oMIIwOpv70fTieMwERPJY7FrsbPN35yt8luTwNb.M8G8e', '$2b$10$fnHU1G..oMIIwOpv70fTieMwERPJY7FrsbPN35yt8luTwNb.M8G8e', 1, 0, NULL, NULL, 'N4THE2JIKJEXI6TBKRWXKR2UMVUG6YZI', 0, '2024-06-19 09:12:33', '2024-06-19 09:12:33'),
	(20, 'James', 'Bond', 'james.bon@example.com', '$2b$10$phR7wIpGzt5LvP9E38O0nekDYilqKH5aL5PQ/nNcx07GwJ3mmxysS', '$2b$10$phR7wIpGzt5LvP9E38O0nekDYilqKH5aL5PQ/nNcx07GwJ3mmxysS', 1, 1, NULL, NULL, '87697', 1, '2024-06-19 09:26:12', '2024-06-20 07:31:15'),
	(21, 'Nolan', 'Lucas', 'nolan.lucas@example.com', '$2b$10$hBBzQv5M2CDkU48f4R7zOOAoVcqxWNQdP.F593rfed1H2GpSGKeYC', '$2b$10$hBBzQv5M2CDkU48f4R7zOOAoVcqxWNQdP.F593rfed1H2GpSGKeYC', 1, 1, NULL, NULL, '49126', 1, '2024-06-19 09:57:42', '2024-06-19 17:19:28'),
	(24, 'Elisabeth', 'Cochet', 'elisabeth.cochet@example.com', '$2b$10$0NeEH/JVkmTpBwNPzJnWPubZR5aOx9v79hf5yuLKxZxUiiK/iU1Wi', '$2b$10$0NeEH/JVkmTpBwNPzJnWPubZR5aOx9v79hf5yuLKxZxUiiK/iU1Wi', 1, 1, NULL, NULL, '72442', 1, '2024-06-20 07:58:01', '2024-06-20 08:03:56'),
	(25, 'Juliette', 'Moreaux', 'juliette.moreaux@gmail.com', '$2b$10$WKVFMxckcELq9jchbeuIX.MJo3CGzRBt.4mYYTRNBc9yp7wn..Pb2', '$2b$10$WKVFMxckcELq9jchbeuIX.MJo3CGzRBt.4mYYTRNBc9yp7wn..Pb2', 1, 1, NULL, NULL, '18299', 1, '2024-06-20 08:02:25', '2024-06-20 08:03:18'),
	(26, 'Jules', 'Desmoreaux', 'jules.desmoreaux@gmail.com', '$2b$10$g/S3SBmBVIXincafrFHL3u70me5gQGqJLIFKuLS95KgVeZkhaU8yO', '$2b$10$g/S3SBmBVIXincafrFHL3u70me5gQGqJLIFKuLS95KgVeZkhaU8yO', 1, 1, NULL, NULL, '84846', 1, '2024-06-20 08:04:54', '2024-06-20 08:05:36');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
