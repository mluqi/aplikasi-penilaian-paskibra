-- MySQL dump 10.13  Distrib 8.4.5, for Linux (aarch64)
--
-- Host: 127.0.0.1    Database: db_paskib
-- ------------------------------------------------------
-- Server version	8.4.5

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Anggota_teams`
--

DROP TABLE IF EXISTS `Anggota_teams`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Anggota_teams` (
  `anggota_id` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `anggota_nama` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `anggota_tempat_lahir` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `anggota_tanggal_lahir` datetime DEFAULT NULL,
  `anggota_is_danton` tinyint(1) DEFAULT '0',
  `team_id` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`anggota_id`),
  KEY `team_id` (`team_id`),
  CONSTRAINT `Anggota_teams_ibfk_1` FOREIGN KEY (`team_id`) REFERENCES `Teams` (`team_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Anggota_teams`
--

LOCK TABLES `Anggota_teams` WRITE;
/*!40000 ALTER TABLE `Anggota_teams` DISABLE KEYS */;
INSERT INTO `Anggota_teams` VALUES ('AGT0001','Udin','Cirebon','2024-11-30 17:00:00',1,'TM0001','2025-10-10 06:26:12','2025-10-10 06:26:12'),('AGT0002','Udin 1','Cirebon','2025-09-30 17:00:00',0,'TM0001','2025-10-10 06:26:29','2025-10-10 06:26:29'),('AGT0003','Udin 3','Cirebon','2025-09-30 17:00:00',0,'TM0001','2025-10-10 06:28:16','2025-10-10 06:28:16');
/*!40000 ALTER TABLE `Anggota_teams` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `AspekNilais`
--

DROP TABLE IF EXISTS `AspekNilais`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `AspekNilais` (
  `id` int NOT NULL AUTO_INCREMENT,
  `penilaian_id` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `aspek_id` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `nilai_aspek` decimal(5,2) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `penilaian_id` (`penilaian_id`),
  KEY `aspek_id` (`aspek_id`),
  CONSTRAINT `AspekNilais_ibfk_1` FOREIGN KEY (`penilaian_id`) REFERENCES `Penilaians` (`penilaian_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `AspekNilais_ibfk_2` FOREIGN KEY (`aspek_id`) REFERENCES `Aspeks` (`aspek_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=107 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `AspekNilais`
--

LOCK TABLES `AspekNilais` WRITE;
/*!40000 ALTER TABLE `AspekNilais` DISABLE KEYS */;
INSERT INTO `AspekNilais` VALUES (1,'PEN-EVT0002-TM0002-001','ASP001-EVT0002',80.00,'2025-10-16 03:59:45','2025-10-16 03:59:45'),(2,'PEN-EVT0002-TM0002-001','ASP002-EVT0002',82.10,'2025-10-16 03:59:45','2025-10-16 03:59:45'),(3,'PEN-EVT0002-TM0002-001','ASP003-EVT0002',85.00,'2025-10-16 03:59:45','2025-10-16 03:59:45'),(4,'PEN-EVT0002-TM0001-001','ASP001-EVT0002',86.00,'2025-10-16 07:02:27','2025-10-16 07:02:27'),(5,'PEN-EVT0002-TM0001-001','ASP002-EVT0002',88.50,'2025-10-16 07:02:27','2025-10-16 07:02:27'),(6,'PEN-EVT0002-TM0001-001','ASP003-EVT0002',86.50,'2025-10-16 07:02:27','2025-10-16 07:02:27'),(13,'PEN-EVT0002-TM0002-002','ASP001-EVT0002',84.50,'2025-10-16 13:09:07','2025-10-16 13:09:07'),(14,'PEN-EVT0002-TM0002-002','ASP002-EVT0002',85.00,'2025-10-16 13:09:07','2025-10-16 13:09:07'),(15,'PEN-EVT0002-TM0002-002','ASP003-EVT0002',84.00,'2025-10-16 13:09:07','2025-10-16 13:09:07'),(16,'PEN-EVT0002-TM0001-002','ASP001-EVT0002',84.00,'2025-10-16 13:10:04','2025-10-16 13:10:04'),(17,'PEN-EVT0002-TM0001-002','ASP002-EVT0002',87.00,'2025-10-16 13:10:04','2025-10-16 13:10:04'),(18,'PEN-EVT0002-TM0001-002','ASP003-EVT0002',82.50,'2025-10-16 13:10:04','2025-10-16 13:10:04'),(59,'PEN-EVT0003-TM0002-001','ASP001-EVT0003',80.00,'2025-10-21 04:16:46','2025-10-21 04:16:46'),(60,'PEN-EVT0003-TM0002-001','ASP002-EVT0003',79.00,'2025-10-21 04:16:46','2025-10-21 04:16:46'),(61,'PEN-EVT0003-TM0002-001','ASP003-EVT0003',90.00,'2025-10-21 04:16:46','2025-10-21 04:16:46'),(62,'PEN-EVT0003-TM0002-001','ASP004-EVT0003',90.00,'2025-10-21 04:16:46','2025-10-21 04:16:46'),(63,'PEN-EVT0003-TM0001-001','ASP001-EVT0003',76.00,'2025-10-21 04:16:49','2025-10-21 04:16:49'),(64,'PEN-EVT0003-TM0001-001','ASP002-EVT0003',94.00,'2025-10-21 04:16:49','2025-10-21 04:16:49'),(65,'PEN-EVT0003-TM0001-001','ASP003-EVT0003',95.00,'2025-10-21 04:16:49','2025-10-21 04:16:49'),(66,'PEN-EVT0003-TM0001-001','ASP004-EVT0003',100.00,'2025-10-21 04:16:49','2025-10-21 04:16:49'),(87,'PEN-EVT0001-TM0001-001','ASP001-EVT0001',85.00,'2025-10-21 04:40:14','2025-10-21 04:40:14'),(88,'PEN-EVT0001-TM0001-001','ASP002-EVT0001',77.50,'2025-10-21 04:40:14','2025-10-21 04:40:14'),(89,'PEN-EVT0001-TM0001-001','ASP003-EVT0001',80.00,'2025-10-21 04:40:14','2025-10-21 04:40:14'),(90,'PEN-EVT0001-TM0002-001','ASP001-EVT0001',75.00,'2025-10-21 04:40:17','2025-10-21 04:40:17'),(91,'PEN-EVT0001-TM0002-001','ASP002-EVT0001',77.50,'2025-10-21 04:40:17','2025-10-21 04:40:17'),(92,'PEN-EVT0001-TM0002-001','ASP003-EVT0001',70.00,'2025-10-21 04:40:17','2025-10-21 04:40:17'),(93,'PEN-EVT0003-TM0002-002','ASP001-EVT0003',81.00,'2025-10-21 04:40:26','2025-10-21 04:40:26'),(94,'PEN-EVT0003-TM0002-002','ASP002-EVT0003',81.00,'2025-10-21 04:40:26','2025-10-21 04:40:26'),(95,'PEN-EVT0003-TM0002-002','ASP003-EVT0003',80.00,'2025-10-21 04:40:26','2025-10-21 04:40:26'),(96,'PEN-EVT0003-TM0002-002','ASP004-EVT0003',80.00,'2025-10-21 04:40:26','2025-10-21 04:40:26'),(97,'PEN-EVT0003-TM0001-002','ASP001-EVT0003',80.00,'2025-10-21 04:40:29','2025-10-21 04:40:29'),(98,'PEN-EVT0003-TM0001-002','ASP002-EVT0003',77.00,'2025-10-21 04:40:29','2025-10-21 04:40:29'),(99,'PEN-EVT0003-TM0001-002','ASP003-EVT0003',85.00,'2025-10-21 04:40:29','2025-10-21 04:40:29'),(100,'PEN-EVT0003-TM0001-002','ASP004-EVT0003',90.00,'2025-10-21 04:40:29','2025-10-21 04:40:29'),(101,'PEN-EVT0001-TM0001-002','ASP001-EVT0001',75.00,'2025-10-21 04:40:42','2025-10-21 04:40:42'),(102,'PEN-EVT0001-TM0001-002','ASP002-EVT0001',77.50,'2025-10-21 04:40:42','2025-10-21 04:40:42'),(103,'PEN-EVT0001-TM0001-002','ASP003-EVT0001',75.00,'2025-10-21 04:40:42','2025-10-21 04:40:42'),(104,'PEN-EVT0001-TM0002-002','ASP001-EVT0001',75.00,'2025-10-21 04:40:44','2025-10-21 04:40:44'),(105,'PEN-EVT0001-TM0002-002','ASP002-EVT0001',72.50,'2025-10-21 04:40:44','2025-10-21 04:40:44'),(106,'PEN-EVT0001-TM0002-002','ASP003-EVT0001',70.00,'2025-10-21 04:40:44','2025-10-21 04:40:44');
/*!40000 ALTER TABLE `AspekNilais` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Aspeks`
--

DROP TABLE IF EXISTS `Aspeks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Aspeks` (
  `aspek_id` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `event_id` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `nama_aspek` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `bobot` decimal(5,2) DEFAULT NULL,
  `urutan` int DEFAULT NULL,
  PRIMARY KEY (`aspek_id`),
  KEY `event_id` (`event_id`),
  CONSTRAINT `Aspeks_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `Events` (`event_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Aspeks`
--

LOCK TABLES `Aspeks` WRITE;
/*!40000 ALTER TABLE `Aspeks` DISABLE KEYS */;
INSERT INTO `Aspeks` VALUES ('ASP001-EVT0001','EVT0001','PBB',40.00,1),('ASP001-EVT0002','EVT0002','Kerapihan',30.00,1),('ASP001-EVT0003','EVT0003','PBB',50.00,1),('ASP002-EVT0001','EVT0001','Sikap',30.00,2),('ASP002-EVT0002','EVT0002','Kekompakan',40.00,2),('ASP002-EVT0003','EVT0003','Gerakan',30.00,2),('ASP003-EVT0001','EVT0001','Seragam',30.00,3),('ASP003-EVT0002','EVT0002','Gerakan',30.00,3),('ASP003-EVT0003','EVT0003','Kerapian',10.00,3),('ASP004-EVT0003','EVT0003','Seragam',10.00,4);
/*!40000 ALTER TABLE `Aspeks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Event_juris`
--

DROP TABLE IF EXISTS `Event_juris`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Event_juris` (
  `id` int NOT NULL AUTO_INCREMENT,
  `event_id` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `juri_id` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `event_id` (`event_id`),
  KEY `juri_id` (`juri_id`),
  CONSTRAINT `Event_juris_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `Events` (`event_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Event_juris_ibfk_2` FOREIGN KEY (`juri_id`) REFERENCES `Users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Event_juris`
--

LOCK TABLES `Event_juris` WRITE;
/*!40000 ALTER TABLE `Event_juris` DISABLE KEYS */;
INSERT INTO `Event_juris` VALUES (1,'EVT0001','JRI0001'),(5,'EVT0002','JRI0001'),(6,'EVT0002','JRI0002'),(7,'EVT0003','JRI0002'),(8,'EVT0003','JRI0001'),(9,'EVT0004','JRI0001'),(10,'EVT0004','JRI0002'),(11,'EVT0001','JRI0002');
/*!40000 ALTER TABLE `Event_juris` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Event_teams`
--

DROP TABLE IF EXISTS `Event_teams`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Event_teams` (
  `id` int NOT NULL AUTO_INCREMENT,
  `event_id` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `team_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `event_id` (`event_id`),
  KEY `Event_teams_team_id_fkey` (`team_id`),
  CONSTRAINT `Event_teams_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `Events` (`event_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Event_teams_team_id_fkey` FOREIGN KEY (`team_id`) REFERENCES `Teams` (`team_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Event_teams`
--

LOCK TABLES `Event_teams` WRITE;
/*!40000 ALTER TABLE `Event_teams` DISABLE KEYS */;
INSERT INTO `Event_teams` VALUES (3,'EVT0001','TM0001'),(4,'EVT0001','TM0002'),(5,'EVT0002','TM0001'),(6,'EVT0002','TM0002'),(7,'EVT0003','TM0002'),(8,'EVT0003','TM0001'),(9,'EVT0004','TM0001'),(10,'EVT0004','TM0002');
/*!40000 ALTER TABLE `Event_teams` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Events`
--

DROP TABLE IF EXISTS `Events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Events` (
  `event_id` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `event_name` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `event_kategori` enum('smp','sma_smk','mahasiswa','umum') COLLATE utf8mb4_general_ci DEFAULT NULL,
  `event_tingkat` enum('kota_kabupaten','provinsi','nasional') COLLATE utf8mb4_general_ci DEFAULT NULL,
  `event_provinsi` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `event_kota` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `event_tanggal` datetime DEFAULT NULL,
  `event_tempat` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `event_waktu` time DEFAULT NULL,
  `event_poster` text COLLATE utf8mb4_general_ci,
  `event_biaya_pendaftaran` bigint DEFAULT NULL,
  `event_deskripsi` text COLLATE utf8mb4_general_ci,
  `event_status` enum('draft','published','archived') COLLATE utf8mb4_general_ci DEFAULT 'draft',
  `koordinator_id` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`event_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Events`
--

LOCK TABLES `Events` WRITE;
/*!40000 ALTER TABLE `Events` DISABLE KEYS */;
INSERT INTO `Events` VALUES ('EVT0001','17 agustus','sma_smk','nasional','JAWA TIMUR','KOTA SURABAYA','2025-10-30 17:00:00','Lapangan','08:00:00','/uploads/events/poster-1760082430153-651032035.jpeg',250000,'Event tes lomba 17an','published','KOE0002','2025-10-10 07:47:10','2025-10-21 06:25:44'),('EVT0002','Event ke 2','sma_smk','kota_kabupaten','JAWA TENGAH','KOTA TEGAL','2025-10-22 17:00:00','Cirebon','09:00:00','/uploads/events/poster-1760235486632-334121974.jpeg',100000,'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam a aliquam lacus, ac maximus erat. Aenean placerat nec ligula et consectetur. Nulla volutpat dolor nisl, non luctus ex pharetra porta. Donec faucibus laoreet ex. Aliquam pulvinar quis ligula pretium commodo. Curabitur nec risus quis sapien cursus commodo eget sed mauris. Integer mollis nulla tristique efficitur molestie. Nunc a sapien semper, efficitur quam sed, semper quam. Maecenas quis lacus aliquet, tristique magna ac, tincidunt ante. Phasellus sem arcu, placerat vitae eros sed, blandit convallis erat. In quis fringilla urna. Fusce mollis est tellus, sed pretium nibh bibendum in.','published','KOE0002','2025-10-12 02:18:06','2025-10-20 04:29:20'),('EVT0003','Event ke 3','smp','provinsi','JAWA BARAT','KOTA CIREBON','2025-10-30 17:00:00','Lapangan','08:00:00','/uploads/events/poster-1760235524567-721130202.jpeg',150000,'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam a aliquam lacus, ac maximus erat. Aenean placerat nec ligula et consectetur. Nulla volutpat dolor nisl, non luctus ex pharetra porta. Donec faucibus laoreet ex. Aliquam pulvinar quis ligula pretium commodo. Curabitur nec risus quis sapien cursus commodo eget sed mauris. Integer mollis nulla tristique efficitur molestie. Nunc a sapien semper, efficitur quam sed, semper quam. Maecenas quis lacus aliquet, tristique magna ac, tincidunt ante. Phasellus sem arcu, placerat vitae eros sed, blandit convallis erat. In quis fringilla urna. Fusce mollis est tellus, sed pretium nibh bibendum in.','published','KOE0002','2025-10-12 02:18:44','2025-10-21 06:25:38'),('EVT0004','Event ke 4 ','sma_smk','provinsi','ACEH','KOTA BANDA ACEH','2025-10-30 17:00:00','DImana aja','08:00:00','/uploads/events/poster-1760681428349-767475593.jpg',100000,'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla sit amet ex lectus. Nullam a sem eleifend, pretium enim eu, ullamcorper mauris. Vestibulum elit augue, condimentum id tellus vitae, rutrum vestibulum orci. Nam interdum gravida nisl, sed tincidunt dui lacinia a. Etiam mattis interdum lectus vel ultrices. Integer sit amet ligula aliquet, euismod libero quis, consectetur ligula. Proin pretium et quam blandit viverra. Pellentesque vel mi turpis. Etiam sollicitudin faucibus cursus. Duis sit amet mattis nisl, et sollicitudin metus.','published','KOE0001','2025-10-17 06:10:28','2025-10-20 05:55:32');
/*!40000 ALTER TABLE `Events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Penilaians`
--

DROP TABLE IF EXISTS `Penilaians`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Penilaians` (
  `penilaian_id` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `event_id` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `team_id` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `juri_id` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `total_nilai` decimal(6,2) NOT NULL DEFAULT '0.00',
  `catatan` text COLLATE utf8mb4_general_ci,
  `is_lock` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`penilaian_id`),
  KEY `event_id` (`event_id`),
  KEY `team_id` (`team_id`),
  KEY `juri_id` (`juri_id`),
  CONSTRAINT `Penilaians_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `Events` (`event_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Penilaians_ibfk_2` FOREIGN KEY (`team_id`) REFERENCES `Teams` (`team_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Penilaians_ibfk_3` FOREIGN KEY (`juri_id`) REFERENCES `Users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Penilaians`
--

LOCK TABLES `Penilaians` WRITE;
/*!40000 ALTER TABLE `Penilaians` DISABLE KEYS */;
INSERT INTO `Penilaians` VALUES ('PEN-EVT0001-TM0001-001','EVT0001','TM0001','JRI0002',81.25,'mantap',0),('PEN-EVT0001-TM0001-002','EVT0001','TM0001','JRI0001',75.75,'ok',0),('PEN-EVT0001-TM0002-001','EVT0001','TM0002','JRI0002',74.25,'sip',0),('PEN-EVT0001-TM0002-002','EVT0001','TM0002','JRI0001',72.75,'ok',0),('PEN-EVT0002-TM0001-001','EVT0002','TM0001','JRI0001',87.15,'Keren',1),('PEN-EVT0002-TM0001-002','EVT0002','TM0001','JRI0002',84.75,'mantap dah pokona',0),('PEN-EVT0002-TM0002-001','EVT0002','TM0002','JRI0001',82.34,'mantap',1),('PEN-EVT0002-TM0002-002','EVT0002','TM0002','JRI0002',84.55,'Kurang kompak',0),('PEN-EVT0003-TM0001-001','EVT0003','TM0001','JRI0001',85.70,'',1),('PEN-EVT0003-TM0001-002','EVT0003','TM0001','JRI0002',80.60,'oke',0),('PEN-EVT0003-TM0002-001','EVT0003','TM0002','JRI0001',81.70,'',1),('PEN-EVT0003-TM0002-002','EVT0003','TM0002','JRI0002',80.80,'sip',0);
/*!40000 ALTER TABLE `Penilaians` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `SequelizeMeta`
--

DROP TABLE IF EXISTS `SequelizeMeta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `SequelizeMeta` (
  `name` varchar(255) COLLATE utf8mb3_unicode_ci NOT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `SequelizeMeta`
--

LOCK TABLES `SequelizeMeta` WRITE;
/*!40000 ALTER TABLE `SequelizeMeta` DISABLE KEYS */;
INSERT INTO `SequelizeMeta` VALUES ('20250909063628-create-users.js'),('20250910014420-create-teams.js'),('20250910020007-create-anggota-team.js'),('20250910020949-create-events.js'),('20250910021548-create-penilaian.js'),('20250910021902-create-event-teams.js'),('20250910021935-create-event-juri.js'),('20250911035243-add-photo-to-users.js'),('20251010075929-change-foreign-key-event-teams.js'),('20251011073446-add-user-status.js'),('20251013080141-create-log-akses.js'),('20251013080403-create-log-aktivitas.js'),('20251013084234-add-akses-browser.js'),('20251015022718-create-roles.js'),('20251015022807-create-menus.js'),('20251015022907-create-role-access.js'),('20251015070054-update-penilaians-structure.js'),('20251015070127-create-aspeks.js'),('20251015070127-create-sub-aspeks.js'),('20251015070128-create-aspek-nilais.js'),('20251015075247-create-sub-aspek-nilais.js'),('20251016093551-create-rekapnilai.js'),('20251017024049-add-is-lock-to-penilaians.js'),('20251020031156-add-event-details-columns.js');
/*!40000 ALTER TABLE `SequelizeMeta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `SubAspekNilais`
--

DROP TABLE IF EXISTS `SubAspekNilais`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `SubAspekNilais` (
  `id` int NOT NULL AUTO_INCREMENT,
  `aspeknilai_id` int NOT NULL,
  `subaspek_id` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `nilai` decimal(10,0) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `aspeknilai_id` (`aspeknilai_id`),
  KEY `subaspek_id` (`subaspek_id`),
  CONSTRAINT `SubAspekNilais_ibfk_1` FOREIGN KEY (`aspeknilai_id`) REFERENCES `AspekNilais` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `SubAspekNilais_ibfk_2` FOREIGN KEY (`subaspek_id`) REFERENCES `SubAspeks` (`subaspek_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=421 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `SubAspekNilais`
--

LOCK TABLES `SubAspekNilais` WRITE;
/*!40000 ALTER TABLE `SubAspekNilais` DISABLE KEYS */;
INSERT INTO `SubAspekNilais` VALUES (1,1,'SUB-ASP001-EVT0002-001',80,'2025-10-16 03:59:45','2025-10-16 03:59:45'),(2,1,'SUB-ASP001-EVT0002-002',90,'2025-10-16 03:59:45','2025-10-16 03:59:45'),(3,1,'SUB-ASP001-EVT0002-003',70,'2025-10-16 03:59:45','2025-10-16 03:59:45'),(4,2,'SUB-ASP002-EVT0002-001',90,'2025-10-16 03:59:45','2025-10-16 03:59:45'),(5,2,'SUB-ASP002-EVT0002-002',80,'2025-10-16 03:59:45','2025-10-16 03:59:45'),(6,2,'SUB-ASP002-EVT0002-003',77,'2025-10-16 03:59:45','2025-10-16 03:59:45'),(7,3,'SUB-ASP003-EVT0002-001',80,'2025-10-16 03:59:45','2025-10-16 03:59:45'),(8,3,'SUB-ASP003-EVT0002-002',90,'2025-10-16 03:59:45','2025-10-16 03:59:45'),(9,3,'SUB-ASP003-EVT0002-003',80,'2025-10-16 03:59:45','2025-10-16 03:59:45'),(10,3,'SUB-ASP003-EVT0002-004',90,'2025-10-16 03:59:45','2025-10-16 03:59:45'),(11,4,'SUB-ASP001-EVT0002-001',80,'2025-10-16 07:02:27','2025-10-16 07:02:27'),(12,4,'SUB-ASP001-EVT0002-002',90,'2025-10-16 07:02:27','2025-10-16 07:02:27'),(13,4,'SUB-ASP001-EVT0002-003',90,'2025-10-16 07:02:27','2025-10-16 07:02:27'),(14,5,'SUB-ASP002-EVT0002-001',90,'2025-10-16 07:02:27','2025-10-16 07:02:27'),(15,5,'SUB-ASP002-EVT0002-002',90,'2025-10-16 07:02:27','2025-10-16 07:02:27'),(16,5,'SUB-ASP002-EVT0002-003',85,'2025-10-16 07:02:27','2025-10-16 07:02:27'),(17,6,'SUB-ASP003-EVT0002-001',90,'2025-10-16 07:02:27','2025-10-16 07:02:27'),(18,6,'SUB-ASP003-EVT0002-002',80,'2025-10-16 07:02:27','2025-10-16 07:02:27'),(19,6,'SUB-ASP003-EVT0002-003',90,'2025-10-16 07:02:27','2025-10-16 07:02:27'),(20,6,'SUB-ASP003-EVT0002-004',85,'2025-10-16 07:02:27','2025-10-16 07:02:27'),(41,13,'SUB-ASP001-EVT0002-001',80,'2025-10-16 13:09:07','2025-10-16 13:09:07'),(42,13,'SUB-ASP001-EVT0002-002',90,'2025-10-16 13:09:07','2025-10-16 13:09:07'),(43,13,'SUB-ASP001-EVT0002-003',85,'2025-10-16 13:09:07','2025-10-16 13:09:07'),(44,14,'SUB-ASP002-EVT0002-001',80,'2025-10-16 13:09:07','2025-10-16 13:09:07'),(45,14,'SUB-ASP002-EVT0002-002',85,'2025-10-16 13:09:07','2025-10-16 13:09:07'),(46,14,'SUB-ASP002-EVT0002-003',90,'2025-10-16 13:09:07','2025-10-16 13:09:07'),(47,15,'SUB-ASP003-EVT0002-001',90,'2025-10-16 13:09:07','2025-10-16 13:09:07'),(48,15,'SUB-ASP003-EVT0002-002',85,'2025-10-16 13:09:07','2025-10-16 13:09:07'),(49,15,'SUB-ASP003-EVT0002-003',80,'2025-10-16 13:09:07','2025-10-16 13:09:07'),(50,15,'SUB-ASP003-EVT0002-004',80,'2025-10-16 13:09:07','2025-10-16 13:09:07'),(51,16,'SUB-ASP001-EVT0002-001',90,'2025-10-16 13:10:04','2025-10-16 13:10:04'),(52,16,'SUB-ASP001-EVT0002-002',80,'2025-10-16 13:10:04','2025-10-16 13:10:04'),(53,16,'SUB-ASP001-EVT0002-003',80,'2025-10-16 13:10:04','2025-10-16 13:10:04'),(54,17,'SUB-ASP002-EVT0002-001',85,'2025-10-16 13:10:04','2025-10-16 13:10:04'),(55,17,'SUB-ASP002-EVT0002-002',90,'2025-10-16 13:10:04','2025-10-16 13:10:04'),(56,17,'SUB-ASP002-EVT0002-003',85,'2025-10-16 13:10:04','2025-10-16 13:10:04'),(57,18,'SUB-ASP003-EVT0002-001',80,'2025-10-16 13:10:04','2025-10-16 13:10:04'),(58,18,'SUB-ASP003-EVT0002-002',85,'2025-10-16 13:10:04','2025-10-16 13:10:04'),(59,18,'SUB-ASP003-EVT0002-003',80,'2025-10-16 13:10:04','2025-10-16 13:10:04'),(60,18,'SUB-ASP003-EVT0002-004',85,'2025-10-16 13:10:04','2025-10-16 13:10:04'),(251,59,'SUB-ASP001-EVT0003-001',60,'2025-10-21 04:16:46','2025-10-21 04:16:46'),(252,59,'SUB-ASP001-EVT0003-002',60,'2025-10-21 04:16:46','2025-10-21 04:16:46'),(253,59,'SUB-ASP001-EVT0003-003',70,'2025-10-21 04:16:46','2025-10-21 04:16:46'),(254,59,'SUB-ASP001-EVT0003-004',90,'2025-10-21 04:16:46','2025-10-21 04:16:46'),(255,59,'SUB-ASP001-EVT0003-005',90,'2025-10-21 04:16:46','2025-10-21 04:16:46'),(256,59,'SUB-ASP001-EVT0003-006',90,'2025-10-21 04:16:46','2025-10-21 04:16:46'),(257,59,'SUB-ASP001-EVT0003-007',90,'2025-10-21 04:16:46','2025-10-21 04:16:46'),(258,59,'SUB-ASP001-EVT0003-008',90,'2025-10-21 04:16:46','2025-10-21 04:16:46'),(259,59,'SUB-ASP001-EVT0003-009',70,'2025-10-21 04:16:46','2025-10-21 04:16:46'),(260,59,'SUB-ASP001-EVT0003-010',90,'2025-10-21 04:16:46','2025-10-21 04:16:46'),(261,60,'SUB-ASP002-EVT0003-001',70,'2025-10-21 04:16:46','2025-10-21 04:16:46'),(262,60,'SUB-ASP002-EVT0003-002',80,'2025-10-21 04:16:46','2025-10-21 04:16:46'),(263,60,'SUB-ASP002-EVT0003-003',80,'2025-10-21 04:16:46','2025-10-21 04:16:46'),(264,60,'SUB-ASP002-EVT0003-004',80,'2025-10-21 04:16:46','2025-10-21 04:16:46'),(265,60,'SUB-ASP002-EVT0003-005',90,'2025-10-21 04:16:46','2025-10-21 04:16:46'),(266,60,'SUB-ASP002-EVT0003-006',80,'2025-10-21 04:16:46','2025-10-21 04:16:46'),(267,61,'SUB-ASP003-EVT0003-001',90,'2025-10-21 04:16:46','2025-10-21 04:16:46'),(268,61,'SUB-ASP003-EVT0003-002',90,'2025-10-21 04:16:46','2025-10-21 04:16:46'),(269,62,'SUB-ASP004-EVT0003-001',90,'2025-10-21 04:16:46','2025-10-21 04:16:46'),(270,63,'SUB-ASP001-EVT0003-001',80,'2025-10-21 04:16:49','2025-10-21 04:16:49'),(271,63,'SUB-ASP001-EVT0003-002',100,'2025-10-21 04:16:49','2025-10-21 04:16:49'),(272,63,'SUB-ASP001-EVT0003-003',20,'2025-10-21 04:16:49','2025-10-21 04:16:49'),(273,63,'SUB-ASP001-EVT0003-004',70,'2025-10-21 04:16:49','2025-10-21 04:16:49'),(274,63,'SUB-ASP001-EVT0003-005',90,'2025-10-21 04:16:49','2025-10-21 04:16:49'),(275,63,'SUB-ASP001-EVT0003-006',80,'2025-10-21 04:16:49','2025-10-21 04:16:49'),(276,63,'SUB-ASP001-EVT0003-007',80,'2025-10-21 04:16:49','2025-10-21 04:16:49'),(277,63,'SUB-ASP001-EVT0003-008',90,'2025-10-21 04:16:49','2025-10-21 04:16:49'),(278,63,'SUB-ASP001-EVT0003-009',80,'2025-10-21 04:16:49','2025-10-21 04:16:49'),(279,63,'SUB-ASP001-EVT0003-010',70,'2025-10-21 04:16:49','2025-10-21 04:16:49'),(280,64,'SUB-ASP002-EVT0003-001',100,'2025-10-21 04:16:49','2025-10-21 04:16:49'),(281,64,'SUB-ASP002-EVT0003-002',100,'2025-10-21 04:16:49','2025-10-21 04:16:49'),(282,64,'SUB-ASP002-EVT0003-003',90,'2025-10-21 04:16:49','2025-10-21 04:16:49'),(283,64,'SUB-ASP002-EVT0003-004',90,'2025-10-21 04:16:49','2025-10-21 04:16:49'),(284,64,'SUB-ASP002-EVT0003-005',90,'2025-10-21 04:16:49','2025-10-21 04:16:49'),(285,64,'SUB-ASP002-EVT0003-006',90,'2025-10-21 04:16:49','2025-10-21 04:16:49'),(286,65,'SUB-ASP003-EVT0003-001',100,'2025-10-21 04:16:49','2025-10-21 04:16:49'),(287,65,'SUB-ASP003-EVT0003-002',90,'2025-10-21 04:16:49','2025-10-21 04:16:49'),(288,66,'SUB-ASP004-EVT0003-001',100,'2025-10-21 04:16:49','2025-10-21 04:16:49'),(355,87,'SUB-ASP001-EVT0001-001',90,'2025-10-21 04:40:14','2025-10-21 04:40:14'),(356,87,'SUB-ASP001-EVT0001-002',80,'2025-10-21 04:40:14','2025-10-21 04:40:14'),(357,88,'SUB-ASP002-EVT0001-001',80,'2025-10-21 04:40:14','2025-10-21 04:40:14'),(358,88,'SUB-ASP002-EVT0001-002',80,'2025-10-21 04:40:14','2025-10-21 04:40:14'),(359,88,'SUB-ASP002-EVT0001-003',70,'2025-10-21 04:40:14','2025-10-21 04:40:14'),(360,89,'SUB-ASP003-EVT0001-001',80,'2025-10-21 04:40:14','2025-10-21 04:40:14'),(361,89,'SUB-ASP003-EVT0001-002',80,'2025-10-21 04:40:14','2025-10-21 04:40:14'),(362,90,'SUB-ASP001-EVT0001-001',70,'2025-10-21 04:40:17','2025-10-21 04:40:17'),(363,90,'SUB-ASP001-EVT0001-002',80,'2025-10-21 04:40:17','2025-10-21 04:40:17'),(364,91,'SUB-ASP002-EVT0001-001',80,'2025-10-21 04:40:17','2025-10-21 04:40:17'),(365,91,'SUB-ASP002-EVT0001-002',80,'2025-10-21 04:40:17','2025-10-21 04:40:17'),(366,91,'SUB-ASP002-EVT0001-003',70,'2025-10-21 04:40:17','2025-10-21 04:40:17'),(367,92,'SUB-ASP003-EVT0001-001',70,'2025-10-21 04:40:17','2025-10-21 04:40:17'),(368,92,'SUB-ASP003-EVT0001-002',70,'2025-10-21 04:40:17','2025-10-21 04:40:17'),(369,93,'SUB-ASP001-EVT0003-001',80,'2025-10-21 04:40:26','2025-10-21 04:40:26'),(370,93,'SUB-ASP001-EVT0003-002',80,'2025-10-21 04:40:26','2025-10-21 04:40:26'),(371,93,'SUB-ASP001-EVT0003-003',70,'2025-10-21 04:40:26','2025-10-21 04:40:26'),(372,93,'SUB-ASP001-EVT0003-004',80,'2025-10-21 04:40:26','2025-10-21 04:40:26'),(373,93,'SUB-ASP001-EVT0003-005',80,'2025-10-21 04:40:26','2025-10-21 04:40:26'),(374,93,'SUB-ASP001-EVT0003-006',90,'2025-10-21 04:40:26','2025-10-21 04:40:26'),(375,93,'SUB-ASP001-EVT0003-007',80,'2025-10-21 04:40:26','2025-10-21 04:40:26'),(376,93,'SUB-ASP001-EVT0003-008',80,'2025-10-21 04:40:26','2025-10-21 04:40:26'),(377,93,'SUB-ASP001-EVT0003-009',90,'2025-10-21 04:40:26','2025-10-21 04:40:26'),(378,93,'SUB-ASP001-EVT0003-010',80,'2025-10-21 04:40:26','2025-10-21 04:40:26'),(379,94,'SUB-ASP002-EVT0003-001',80,'2025-10-21 04:40:26','2025-10-21 04:40:26'),(380,94,'SUB-ASP002-EVT0003-002',70,'2025-10-21 04:40:26','2025-10-21 04:40:26'),(381,94,'SUB-ASP002-EVT0003-003',80,'2025-10-21 04:40:26','2025-10-21 04:40:26'),(382,94,'SUB-ASP002-EVT0003-004',90,'2025-10-21 04:40:26','2025-10-21 04:40:26'),(383,94,'SUB-ASP002-EVT0003-005',90,'2025-10-21 04:40:26','2025-10-21 04:40:26'),(384,94,'SUB-ASP002-EVT0003-006',80,'2025-10-21 04:40:26','2025-10-21 04:40:26'),(385,95,'SUB-ASP003-EVT0003-001',80,'2025-10-21 04:40:26','2025-10-21 04:40:26'),(386,95,'SUB-ASP003-EVT0003-002',80,'2025-10-21 04:40:26','2025-10-21 04:40:26'),(387,96,'SUB-ASP004-EVT0003-001',80,'2025-10-21 04:40:26','2025-10-21 04:40:26'),(388,97,'SUB-ASP001-EVT0003-001',80,'2025-10-21 04:40:29','2025-10-21 04:40:29'),(389,97,'SUB-ASP001-EVT0003-002',90,'2025-10-21 04:40:29','2025-10-21 04:40:29'),(390,97,'SUB-ASP001-EVT0003-003',80,'2025-10-21 04:40:29','2025-10-21 04:40:29'),(391,97,'SUB-ASP001-EVT0003-004',80,'2025-10-21 04:40:29','2025-10-21 04:40:29'),(392,97,'SUB-ASP001-EVT0003-005',80,'2025-10-21 04:40:29','2025-10-21 04:40:29'),(393,97,'SUB-ASP001-EVT0003-006',80,'2025-10-21 04:40:29','2025-10-21 04:40:29'),(394,97,'SUB-ASP001-EVT0003-007',80,'2025-10-21 04:40:29','2025-10-21 04:40:29'),(395,97,'SUB-ASP001-EVT0003-008',90,'2025-10-21 04:40:29','2025-10-21 04:40:29'),(396,97,'SUB-ASP001-EVT0003-009',70,'2025-10-21 04:40:29','2025-10-21 04:40:29'),(397,97,'SUB-ASP001-EVT0003-010',70,'2025-10-21 04:40:29','2025-10-21 04:40:29'),(398,98,'SUB-ASP002-EVT0003-001',80,'2025-10-21 04:40:29','2025-10-21 04:40:29'),(399,98,'SUB-ASP002-EVT0003-002',70,'2025-10-21 04:40:29','2025-10-21 04:40:29'),(400,98,'SUB-ASP002-EVT0003-003',80,'2025-10-21 04:40:29','2025-10-21 04:40:29'),(401,98,'SUB-ASP002-EVT0003-004',80,'2025-10-21 04:40:29','2025-10-21 04:40:29'),(402,98,'SUB-ASP002-EVT0003-005',80,'2025-10-21 04:40:29','2025-10-21 04:40:29'),(403,98,'SUB-ASP002-EVT0003-006',70,'2025-10-21 04:40:29','2025-10-21 04:40:29'),(404,99,'SUB-ASP003-EVT0003-001',80,'2025-10-21 04:40:29','2025-10-21 04:40:29'),(405,99,'SUB-ASP003-EVT0003-002',90,'2025-10-21 04:40:29','2025-10-21 04:40:29'),(406,100,'SUB-ASP004-EVT0003-001',90,'2025-10-21 04:40:29','2025-10-21 04:40:29'),(407,101,'SUB-ASP001-EVT0001-001',80,'2025-10-21 04:40:42','2025-10-21 04:40:42'),(408,101,'SUB-ASP001-EVT0001-002',70,'2025-10-21 04:40:42','2025-10-21 04:40:42'),(409,102,'SUB-ASP002-EVT0001-001',80,'2025-10-21 04:40:42','2025-10-21 04:40:42'),(410,102,'SUB-ASP002-EVT0001-002',80,'2025-10-21 04:40:42','2025-10-21 04:40:42'),(411,102,'SUB-ASP002-EVT0001-003',70,'2025-10-21 04:40:42','2025-10-21 04:40:42'),(412,103,'SUB-ASP003-EVT0001-001',80,'2025-10-21 04:40:42','2025-10-21 04:40:42'),(413,103,'SUB-ASP003-EVT0001-002',70,'2025-10-21 04:40:42','2025-10-21 04:40:42'),(414,104,'SUB-ASP001-EVT0001-001',70,'2025-10-21 04:40:44','2025-10-21 04:40:44'),(415,104,'SUB-ASP001-EVT0001-002',80,'2025-10-21 04:40:44','2025-10-21 04:40:44'),(416,105,'SUB-ASP002-EVT0001-001',70,'2025-10-21 04:40:44','2025-10-21 04:40:44'),(417,105,'SUB-ASP002-EVT0001-002',80,'2025-10-21 04:40:44','2025-10-21 04:40:44'),(418,105,'SUB-ASP002-EVT0001-003',70,'2025-10-21 04:40:44','2025-10-21 04:40:44'),(419,106,'SUB-ASP003-EVT0001-001',70,'2025-10-21 04:40:44','2025-10-21 04:40:44'),(420,106,'SUB-ASP003-EVT0001-002',70,'2025-10-21 04:40:44','2025-10-21 04:40:44');
/*!40000 ALTER TABLE `SubAspekNilais` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `SubAspeks`
--

DROP TABLE IF EXISTS `SubAspeks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `SubAspeks` (
  `subaspek_id` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `aspek_id` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `nama_subaspek` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `bobot` decimal(10,0) DEFAULT NULL,
  `urutan` int DEFAULT NULL,
  PRIMARY KEY (`subaspek_id`),
  KEY `aspek_id` (`aspek_id`),
  CONSTRAINT `SubAspeks_ibfk_1` FOREIGN KEY (`aspek_id`) REFERENCES `Aspeks` (`aspek_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `SubAspeks`
--

LOCK TABLES `SubAspeks` WRITE;
/*!40000 ALTER TABLE `SubAspeks` DISABLE KEYS */;
INSERT INTO `SubAspeks` VALUES ('SUB-ASP001-EVT0001-001','ASP001-EVT0001','Gerakan ditempat',50,1),('SUB-ASP001-EVT0001-002','ASP001-EVT0001','Gerakan berjalan',50,2),('SUB-ASP001-EVT0002-001','ASP001-EVT0002','Seragam',40,1),('SUB-ASP001-EVT0002-002','ASP001-EVT0002','Sepatu',30,2),('SUB-ASP001-EVT0002-003','ASP001-EVT0002','Attribut',30,3),('SUB-ASP001-EVT0003-001','ASP001-EVT0003','Sikap siap',10,1),('SUB-ASP001-EVT0003-002','ASP001-EVT0003','Hadap Kanan',10,2),('SUB-ASP001-EVT0003-003','ASP001-EVT0003','Hadap kiri',10,3),('SUB-ASP001-EVT0003-004','ASP001-EVT0003','Balik kanan',10,4),('SUB-ASP001-EVT0003-005','ASP001-EVT0003','Serong kanan',10,5),('SUB-ASP001-EVT0003-006','ASP001-EVT0003','Serong kiri',10,6),('SUB-ASP001-EVT0003-007','ASP001-EVT0003','Berhitung',10,7),('SUB-ASP001-EVT0003-008','ASP001-EVT0003','Hormat',10,8),('SUB-ASP001-EVT0003-009','ASP001-EVT0003','Lencang',10,9),('SUB-ASP001-EVT0003-010','ASP001-EVT0003','Setengah Lencang',10,10),('SUB-ASP002-EVT0001-001','ASP002-EVT0001','Sikap siap',50,1),('SUB-ASP002-EVT0001-002','ASP002-EVT0001','Sikap saat formasi',25,2),('SUB-ASP002-EVT0001-003','ASP002-EVT0001','Sikap saat berjalan',25,3),('SUB-ASP002-EVT0002-001','ASP002-EVT0002','Berjalan',30,1),('SUB-ASP002-EVT0002-002','ASP002-EVT0002','Formasi',40,2),('SUB-ASP002-EVT0002-003','ASP002-EVT0002','Jalan ditempat',30,3),('SUB-ASP002-EVT0003-001','ASP002-EVT0003','Jalan ditempat',20,1),('SUB-ASP002-EVT0003-002','ASP002-EVT0003','Maju jalan',20,2),('SUB-ASP002-EVT0003-003','ASP002-EVT0003','Belok Kanan',20,3),('SUB-ASP002-EVT0003-004','ASP002-EVT0003','Belok Kiri',20,4),('SUB-ASP002-EVT0003-005','ASP002-EVT0003','Halauan Kanan',10,5),('SUB-ASP002-EVT0003-006','ASP002-EVT0003','Haluan Kiri',10,10),('SUB-ASP003-EVT0001-001','ASP003-EVT0001','Makeup',50,1),('SUB-ASP003-EVT0001-002','ASP003-EVT0001','Kerapian',50,2),('SUB-ASP003-EVT0002-001','ASP003-EVT0002','Gerakan saat berjalan',30,1),('SUB-ASP003-EVT0002-002','ASP003-EVT0002','Gerakan saat buka formasi',20,2),('SUB-ASP003-EVT0002-003','ASP003-EVT0002','Gerakan saat hormat',20,3),('SUB-ASP003-EVT0002-004','ASP003-EVT0002','Gerakan saat tutup formasi',30,4),('SUB-ASP003-EVT0003-001','ASP003-EVT0003','Jumlah',50,1),('SUB-ASP003-EVT0003-002','ASP003-EVT0003','Kostum',50,2),('SUB-ASP004-EVT0003-001','ASP004-EVT0003','Makeup',100,1);
/*!40000 ALTER TABLE `SubAspeks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Teams`
--

DROP TABLE IF EXISTS `Teams`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Teams` (
  `team_id` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `team_name` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `team_sekolah_instansi` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `team_jumlah_anggota` int DEFAULT NULL,
  `team_logo` text COLLATE utf8mb4_general_ci,
  `koordinator_id` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`team_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Teams`
--

LOCK TABLES `Teams` WRITE;
/*!40000 ALTER TABLE `Teams` DISABLE KEYS */;
INSERT INTO `Teams` VALUES ('TM0001','Team 1','SMP Negeri 1',16,'/uploads/teams/logo-1760070927453-306538207.png','KOT0001','2025-10-10 04:02:18','2025-10-10 06:28:16'),('TM0002','Team 2','SMP Negeri 2',16,'/uploads/teams/logo-1760078378111-808405063.jpeg','KOT0002','2025-10-10 04:13:19','2025-10-10 06:39:38');
/*!40000 ALTER TABLE `Teams` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Users`
--

DROP TABLE IF EXISTS `Users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Users` (
  `user_id` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `user_name` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `user_email` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `user_password` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `user_role` enum('superadmin','admin','juri','koordinator_team','koordinator_event') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '0',
  `user_photo` text COLLATE utf8mb4_general_ci,
  `user_token` text COLLATE utf8mb4_general_ci,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Users`
--

LOCK TABLES `Users` WRITE;
/*!40000 ALTER TABLE `Users` DISABLE KEYS */;
INSERT INTO `Users` VALUES ('ADM0002','Admin Kocak','admin@palindo.id','$2b$10$Mgq/5qipU7i5aIOLhQlkXuMbnEfy47O/CH2v6L2ZAZkeT8rrru8Ey','admin',1,'/uploads/users/user_photo-1760499681267-294027261.jpg',NULL,'2025-10-15 03:41:21','2025-10-21 08:25:11'),('JRI0001','Juri 1','juri1@palindo.id','$2b$10$VfulPHp0DIs5STzxVpUMuO8X88p7QnkU3Cpm6GK22oItd4ShirPo2','juri',1,'/uploads/users/user_photo-1757564451167-904664012.jpg',NULL,'2025-09-09 15:02:05','2025-10-21 08:22:26'),('JRI0002','Juri 2','juri2@palindo.id','$2b$10$P97H2ZtpSoJrGFjHMhX6C.5yW.wUhfeuMnQgXhUTlkX/aJYG6fVoa','juri',1,'/uploads/users/user_photo-1760619885998-317875053.jpg',NULL,'2025-10-16 13:04:46','2025-10-21 04:40:32'),('KOE0001','Koordinator Event','koordinatorevent@palindo.id','$2b$10$.SGaTOZ9YBUyULZZOFcSY.e3IZHdoFFmO1hw7TuSWD9JgZv5i5Wn2','koordinator_event',1,'/uploads/users/user_photo-1760094856551-233093720.jpg',NULL,'2025-10-10 11:14:16','2025-10-21 09:05:25'),('KOE0002','jokowi','jokowi@gmail.com','$2b$10$8H4yui7Q51PZDjX0RpQDvuRvEhSbKbSTDP94CpGh3kAsQDTNPkgUi','koordinator_event',1,'/uploads/users/user_photo-1760170727594-297919739.jpg',NULL,'2025-10-11 08:18:47','2025-10-21 09:22:26'),('KOT0001','Koordinator 1','koordinator@palindo.id','$2b$10$adjVQ6Oni9XQvD29LeqKferdvvoZk4CMXSJ/n4X7yr4iHAAzDMoge','koordinator_team',1,'/uploads/users/user_photo-1760068543576-69031952.jpg',NULL,'2025-10-10 03:55:43','2025-10-21 09:23:00'),('KOT0002','Koordinator 2','koordinator2@palindo.id','$2b$10$nZNjovnI.wgGigciBiEPRuJg3LyzAd5CTMxX/FOn2GArtNSGKiaM6','koordinator_team',1,'/uploads/users/user_photo-1760069061514-993450614.jpg',NULL,'2025-10-10 04:04:21','2025-10-16 13:52:53'),('KOT0003','luqi','mluqi12@gmail.com','$2b$10$UHTRCH/nUcSL95EaOIeMueapWrgKyi.NHcVLuMlrBkIcS/FopU6Vm','koordinator_team',1,NULL,NULL,'2025-10-11 12:09:29','2025-10-11 12:27:28'),('SUA0001','Super Admin','superadmin@palindo.id','$2b$10$3bS9Wj9wifbNtQh3kAL2CeepOjhuILQu52nFerq7mskcCyhqKEpoq','superadmin',1,'/uploads/users/user_photo-1757564424107-798729842.jpg','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IlNVQTAwMDEiLCJyb2xlIjoic3VwZXJhZG1pbiIsImlhdCI6MTc2MTAzODU4NiwiZXhwIjoxNzYxMTI0OTg2fQ.axLnqc5KkYrkZVoTtGlg2n0kGpoweXy5rVrp4XxRAUE','2025-09-09 08:23:53','2025-10-21 09:23:06');
/*!40000 ALTER TABLE `Users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `log_akses`
--

DROP TABLE IF EXISTS `log_akses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `log_akses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `akses_user` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `akses_ip` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `akses_browser` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `akses_status` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `akses_record` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=175 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `log_akses`
--

LOCK TABLES `log_akses` WRITE;
/*!40000 ALTER TABLE `log_akses` DISABLE KEYS */;
INSERT INTO `log_akses` VALUES (1,'ADM0001','::1','Chrome','Berhasil','2025-10-13 10:12:51'),(2,'jokowi@palindo.id','::1','Chrome','Gagal','2025-10-13 10:55:03'),(3,'jokowi@palindo.id','::1','Chrome','Gagal','2025-10-13 10:55:12'),(4,'jokowi@palindo.id','::1','Chrome','Gagal','2025-10-13 10:55:21'),(5,'KOT0001','::1','Chrome','Berhasil','2025-10-13 10:55:26'),(6,'ADM0001','::1','Chrome','Berhasil','2025-10-13 10:55:56'),(7,'KOE0002','::1','Chrome','Berhasil','2025-10-13 10:56:15'),(8,'ADM0001','::1','Chrome','Berhasil','2025-10-13 10:57:07'),(9,'ADM0001','::1','Chrome','Berhasil','2025-10-14 03:57:12'),(10,'ADM0001','::1','Chrome','Berhasil','2025-10-14 05:28:09'),(11,'juri@palindo.id','::1','Chrome','Gagal','2025-10-14 06:57:03'),(12,'JRI0001','::1','Chrome','Berhasil','2025-10-14 06:57:10'),(13,'jokowi@palindo.id','::1','Chrome','Gagal','2025-10-14 07:09:40'),(14,'KOE0002','::1','Chrome','Berhasil','2025-10-14 07:09:46'),(15,'JRI0001','::1','Chrome','Berhasil','2025-10-14 07:17:06'),(16,'ADM0001','::1','Chrome','Berhasil','2025-10-14 07:25:26'),(17,'KOE0001','::1','Chrome','Berhasil','2025-10-14 07:25:53'),(18,'ADM0001','::1','Chrome','Berhasil','2025-10-14 07:26:13'),(19,'ADM0001','::1','Chrome','Berhasil','2025-10-14 09:42:57'),(20,'ADM0001','::1','Chrome','Berhasil','2025-10-14 11:34:38'),(21,'ADM0001','::1','Chrome','Berhasil','2025-10-15 01:33:55'),(22,'JRI0001','::1','Chrome','Berhasil','2025-10-15 01:34:31'),(23,'ADM0001','::1','Chrome','Berhasil','2025-10-15 02:54:18'),(24,'ADM0001','::1','Chrome','Berhasil','2025-10-15 03:12:21'),(25,'KOT0001','::1','Chrome','Berhasil','2025-10-15 03:12:42'),(26,'ADM0001','::1','Chrome','Berhasil','2025-10-15 03:18:46'),(27,'SUA0001','::1','Chrome','Berhasil','2025-10-15 03:29:29'),(28,'SUA0001','::1','Chrome','Berhasil','2025-10-15 03:31:57'),(29,'SUA0001','::1','Chrome','Berhasil','2025-10-15 03:35:31'),(30,'SUA0001','::1','Chrome','Berhasil','2025-10-15 03:35:48'),(31,'SUA0001','::1','Chrome','Berhasil','2025-10-15 03:36:59'),(32,'SUA0001','::1','Chrome','Berhasil','2025-10-15 03:39:36'),(33,'ADM0002','::1','Chrome','Berhasil','2025-10-15 04:00:35'),(34,'SUA0001','::1','Chrome','Berhasil','2025-10-15 04:00:55'),(35,'ADM0002','::1','Chrome','Berhasil','2025-10-15 04:01:33'),(36,'SUA0001','::1','Chrome','Berhasil','2025-10-15 04:07:43'),(37,'SUA0001','::1','Chrome','Berhasil','2025-10-15 04:09:53'),(38,'SUA0001','::1','Chrome','Berhasil','2025-10-15 04:10:32'),(39,'SUA0001','::1','Chrome','Berhasil','2025-10-15 04:12:57'),(40,'SUA0001','::1','Chrome','Berhasil','2025-10-15 04:26:09'),(41,'juri@palindo.id','::1','Chrome','Gagal','2025-10-15 04:40:38'),(42,'JRI0001','::1','Chrome','Berhasil','2025-10-15 04:40:43'),(43,'SUA0001','::1','Chrome','Berhasil','2025-10-15 04:41:03'),(44,'KOT0001','::1','Chrome','Berhasil','2025-10-15 04:41:12'),(45,'KOE0002','::1','Chrome','Berhasil','2025-10-15 04:41:25'),(46,'SUA0001','::1','Chrome','Berhasil','2025-10-15 04:42:00'),(47,'juri@palindo.id','::1','Chrome','Gagal','2025-10-16 02:19:28'),(48,'JRI0001','::1','Chrome','Berhasil','2025-10-16 02:19:33'),(49,'KOE0002','::1','Chrome','Berhasil','2025-10-16 02:22:52'),(50,'JRI0001','::1','Chrome','Berhasil','2025-10-16 03:13:21'),(51,'JRI0001','::1','Chrome','Berhasil','2025-10-16 04:19:33'),(52,'JRI0001','::1','Chrome','Berhasil','2025-10-16 06:00:21'),(53,'JRI0001','::1','Chrome','Berhasil','2025-10-16 06:00:42'),(54,'KOE0002','::1','Chrome','Berhasil','2025-10-16 06:34:32'),(55,'KOT0001','::1','Chrome','Berhasil','2025-10-16 06:35:30'),(56,'KOT0002','::1','Chrome','Berhasil','2025-10-16 06:35:41'),(57,'JRI0001','::1','Chrome','Berhasil','2025-10-16 06:43:26'),(58,'ADM0002','::1','Chrome','Berhasil','2025-10-16 06:44:04'),(59,'SUA0001','::1','Chrome','Berhasil','2025-10-16 06:54:49'),(60,'KOT0002','::1','Chrome','Berhasil','2025-10-16 06:55:09'),(61,'KOT0001','::1','Chrome','Berhasil','2025-10-16 06:55:26'),(62,'JRI0001','::1','Chrome','Berhasil','2025-10-16 06:58:42'),(63,'KOE0002','::1','Chrome','Berhasil','2025-10-16 06:59:16'),(64,'KOT0002','::1','Chrome','Berhasil','2025-10-16 06:59:55'),(65,'KOT0001','::1','Chrome','Berhasil','2025-10-16 07:00:08'),(66,'KOE0002','::1','Chrome','Berhasil','2025-10-16 07:00:40'),(67,'JRI0001','::1','Chrome','Berhasil','2025-10-16 07:01:09'),(68,'KOT0001','::1','Chrome','Berhasil','2025-10-16 07:10:07'),(69,'SUA0001','::1','Chrome','Berhasil','2025-10-16 07:32:21'),(70,'JRI0001','::1','Chrome','Berhasil','2025-10-16 07:32:31'),(71,'jokowi@palindo.id','::1','Chrome','Gagal','2025-10-16 07:32:50'),(72,'KOE0002','::1','Chrome','Berhasil','2025-10-16 07:32:55'),(73,'JRI0001','::1','Chrome','Berhasil','2025-10-16 07:33:23'),(74,'jokowi@palindo.id','::1','Chrome','Gagal','2025-10-16 07:33:33'),(75,'KOE0002','::1','Chrome','Berhasil','2025-10-16 07:33:39'),(76,'JRI0001','::1','Chrome','Berhasil','2025-10-16 07:34:05'),(77,'ADM0002','::1','Chrome','Berhasil','2025-10-16 07:34:17'),(78,'SUA0001','::1','Chrome','Berhasil','2025-10-16 07:34:51'),(79,'JRI0001','::1','Chrome','Berhasil','2025-10-16 07:35:56'),(80,'KOE0002','::1','Chrome','Berhasil','2025-10-16 07:36:47'),(81,'SUA0001','::1','Chrome','Berhasil','2025-10-16 07:37:15'),(82,'JRI0001','::1','Chrome','Berhasil','2025-10-16 08:41:59'),(83,'KOE0002','::1','Chrome','Berhasil','2025-10-16 08:43:36'),(84,'KOT0001','::1','Chrome','Berhasil','2025-10-16 08:45:54'),(85,'JRI0001','::1','Chrome','Berhasil','2025-10-16 08:47:46'),(86,'SUA0001','::1','Chrome','Berhasil','2025-10-16 08:52:55'),(87,'KOT0001','::1','Chrome','Berhasil','2025-10-16 08:57:04'),(88,'JRI0001','::1','Chrome','Berhasil','2025-10-16 09:08:53'),(89,'KOE0002','::1','Chrome','Gagal','2025-10-16 12:52:43'),(90,'KOE0002','::1','Chrome','Berhasil','2025-10-16 12:52:49'),(91,'KOT0001','::1','Chrome','Berhasil','2025-10-16 12:53:26'),(92,'ADM0002','::1','Chrome','Berhasil','2025-10-16 12:53:45'),(93,'SUA0001','::1','Chrome','Berhasil','2025-10-16 12:54:15'),(94,'KOT0001','::1','Chrome','Berhasil','2025-10-16 12:57:11'),(95,'SUA0001','::1','Chrome','Berhasil','2025-10-16 13:03:54'),(96,'jokowi@palindo.id','::1','Chrome','Gagal','2025-10-16 13:04:59'),(97,'KOE0002','::1','Chrome','Berhasil','2025-10-16 13:05:04'),(98,'JRI0002','::1','Chrome','Berhasil','2025-10-16 13:05:33'),(99,'KOE0002','::1','Chrome','Berhasil','2025-10-16 13:10:32'),(100,'SUA0001','::1','Chrome','Berhasil','2025-10-16 13:39:12'),(101,'SUA0001','::1','Chrome','Berhasil','2025-10-16 13:43:36'),(102,'KOT0001','::1','Chrome','Berhasil','2025-10-16 13:45:20'),(103,'KOE0002','::1','Chrome','Berhasil','2025-10-16 13:45:48'),(104,'KOT0002','::1','Chrome','Berhasil','2025-10-16 13:47:28'),(105,'KOE0002','::1','Chrome','Berhasil','2025-10-16 13:53:00'),(106,'KOT0001','::1','Chrome','Berhasil','2025-10-16 13:57:14'),(107,'ADM0002','::1','Chrome','Berhasil','2025-10-16 13:57:39'),(108,'SUA0001','::1','Chrome','Berhasil','2025-10-16 13:58:04'),(109,'JRI0001','::1','Chrome','Berhasil','2025-10-16 13:58:14'),(110,'JRI0002','::1','Chrome','Berhasil','2025-10-16 14:03:05'),(111,'SUA0001','::1','Chrome','Berhasil','2025-10-17 01:21:45'),(112,'JRI0001','::1','Chrome','Berhasil','2025-10-17 02:33:15'),(113,'ADM0002','::1','Chrome','Berhasil','2025-10-17 03:10:41'),(114,'SUA0001','::1','Chrome','Berhasil','2025-10-17 03:12:08'),(115,'KOT0001','::1','Chrome','Berhasil','2025-10-17 03:12:22'),(116,'jokowi@palindo.id','::1','Chrome','Gagal','2025-10-17 03:12:48'),(117,'KOE0002','::1','Chrome','Berhasil','2025-10-17 03:12:53'),(118,'JRI0001','::1','Chrome','Berhasil','2025-10-17 03:13:13'),(119,'KOE0002','::1','Chrome','Berhasil','2025-10-17 03:25:56'),(120,'JRI0001','::1','Chrome','Berhasil','2025-10-17 03:29:30'),(121,'KOT0001','::1','Chrome','Berhasil','2025-10-17 03:30:36'),(122,'ADM0002','::1','Chrome','Berhasil','2025-10-17 03:30:50'),(123,'KOE0002','::1','Chrome','Berhasil','2025-10-17 03:31:07'),(124,'JRI0001','::1','Chrome','Berhasil','2025-10-17 03:38:08'),(125,'ADM0002','::1','Chrome','Berhasil','2025-10-17 04:01:58'),(126,'JRI0001','::1','Chrome','Berhasil','2025-10-17 04:18:28'),(127,'ADM0002','::1','Chrome','Berhasil','2025-10-17 04:20:33'),(128,'JRI0001','::1','Chrome','Berhasil','2025-10-17 04:20:50'),(129,'KOT0001','::1','Chrome','Berhasil','2025-10-17 06:05:38'),(130,'KOE0002','::1','Chrome','Berhasil','2025-10-17 06:05:55'),(131,'SUA0001','::1','Chrome','Berhasil','2025-10-17 06:07:49'),(132,'KOE0001','::1','Chrome','Berhasil','2025-10-17 06:08:29'),(133,'SUA0001','::1','Chrome','Berhasil','2025-10-17 06:12:18'),(134,'ADM0002','::1','Chrome','Berhasil','2025-10-17 06:12:37'),(135,'KOT0001','::1','Chrome','Berhasil','2025-10-17 06:12:50'),(136,'SUA0001','::1','Chrome','Berhasil','2025-10-17 06:13:59'),(137,'SUA0001','::1','Chrome','Berhasil','2025-10-17 06:36:38'),(138,'KOE0002','::1','Chrome','Berhasil','2025-10-20 04:23:14'),(139,'KOE0001','::1','Chrome','Berhasil','2025-10-20 05:55:09'),(140,'SUA0001','::1','Chrome','Berhasil','2025-10-20 07:59:42'),(141,'SUA0001','::1','Chrome','Berhasil','2025-10-20 08:06:01'),(142,'SUA0001','::1','Chrome','Berhasil','2025-10-20 08:10:23'),(143,'SUA0001','::1','Chrome','Berhasil','2025-10-20 12:31:49'),(144,'SUA0001','::1','Chrome','Berhasil','2025-10-21 02:41:36'),(145,'KOE0002','::1','Chrome','Berhasil','2025-10-21 02:59:11'),(146,'JRI0001','::1','Chrome','Berhasil','2025-10-21 03:02:27'),(147,'KOE0002','::1','Chrome','Berhasil','2025-10-21 04:17:54'),(148,'JRI0002','::1','Chrome','Berhasil','2025-10-21 04:24:26'),(149,'JRI0001','::1','Chrome','Berhasil','2025-10-21 04:25:53'),(150,'JRI0002','::1','Chrome','Gagal','2025-10-21 04:40:01'),(151,'JRI0002','::1','Chrome','Berhasil','2025-10-21 04:40:08'),(152,'JRI0001','::1','Chrome','Berhasil','2025-10-21 04:40:36'),(153,'KOE0002','::1','Chrome','Berhasil','2025-10-21 06:25:24'),(154,'SUA0001','::1','Chrome','Berhasil','2025-10-21 07:28:56'),(155,'JRI0001','::1','Chrome','Berhasil','2025-10-21 07:29:22'),(156,'KOE0002','::1','Safari','Berhasil','2025-10-21 07:30:31'),(157,'SUA0001','::1','Chrome','Berhasil','2025-10-21 07:31:24'),(158,'JRI0001','::1','Chrome','Berhasil','2025-10-21 07:46:23'),(159,'SUA0001','::1','Chrome','Berhasil','2025-10-21 07:50:53'),(160,'KOT0001','::1','Chrome','Berhasil','2025-10-21 07:55:03'),(161,'SUA0001','::1','Chrome','Berhasil','2025-10-21 07:56:50'),(162,'KOE0002','::1','Chrome','Berhasil','2025-10-21 08:19:17'),(163,'JRI0001','::1','Chrome','Berhasil','2025-10-21 08:21:37'),(164,'SUA0001','::1','Chrome','Berhasil','2025-10-21 08:22:31'),(165,'ADM0002','::1','Chrome','Berhasil','2025-10-21 08:23:38'),(166,'KOT0001','::1','Chrome','Berhasil','2025-10-21 08:25:17'),(167,'SUA0001','::1','Chrome','Berhasil','2025-10-21 08:59:28'),(168,'KOT0001','::1','Chrome','Berhasil','2025-10-21 09:01:48'),(169,'KOE0001','::1','Chrome','Berhasil','2025-10-21 09:05:13'),(170,'KOE0002','::1','Chrome','Berhasil','2025-10-21 09:05:29'),(171,'KOT0001','::1','Chrome','Berhasil','2025-10-21 09:13:25'),(172,'KOE0002','::1','Chrome','Berhasil','2025-10-21 09:21:42'),(173,'KOT0001','::1','Chrome','Berhasil','2025-10-21 09:22:30'),(174,'SUA0001','::1','Chrome','Berhasil','2025-10-21 09:23:06');
/*!40000 ALTER TABLE `log_akses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `log_aktivitas`
--

DROP TABLE IF EXISTS `log_aktivitas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `log_aktivitas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `log_target` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `log_action` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `log_detail` text COLLATE utf8mb4_general_ci,
  `log_source` text COLLATE utf8mb4_general_ci,
  `log_record` datetime DEFAULT NULL,
  `log_owner` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `log_aktivitas`
--

LOCK TABLES `log_aktivitas` WRITE;
/*!40000 ALTER TABLE `log_aktivitas` DISABLE KEYS */;
INSERT INTO `log_aktivitas` VALUES (1,'JRI0001','UPDATE','SUCCESS',NULL,'2025-10-13 10:57:34','ADM0001'),(2,'JRI0001','UPDATE','SUCCESS','RXhlY3V0aW5nIChkZWZhdWx0KTogVVBEQVRFIGBVc2Vyc2AgU0VUIGB1c2VyX25hbWVgPT8sYHVwZGF0ZWRBdGA9PyBXSEVSRSBgdXNlcl9pZGAgPSA/','2025-10-13 11:03:17','ADM0001'),(3,'JRI0001','UPDATE','SUCCESS','RXhlY3V0aW5nIChkZWZhdWx0KTogVVBEQVRFIGBVc2Vyc2AgU0VUIGB1c2VyX25hbWVgPT8sYHVwZGF0ZWRBdGA9PyBXSEVSRSBgdXNlcl9pZGAgPSA/IC0tIERBVEE6IHsidXNlcl9uYW1lIjoiSnVyaSAxIiwidXNlcl9lbWFpbCI6Imp1cmkxQHBhbGluZG8uaWQiLCJ1c2VyX3Bhc3N3b3JkIjoiJDJiJDEwJFZmdWxQSHAwRElzNVNUenhWcFVNdU84WDg4cDdRbmtVM0NwbTZHSzIyb0l0ZDRTaGlyUG8yIiwidXNlcl9yb2xlIjoianVyaSIsInVzZXJfcGhvdG8iOiIvdXBsb2Fkcy91c2Vycy91c2VyX3Bob3RvLTE3NTc1NjQ0NTExNjctOTA0NjY0MDEyLmpwZyJ9','2025-10-13 11:13:01','ADM0001'),(4,'EVT0002','ADD_JURI','SUCCESS - Juri ID: JRI0001','RXhlY3V0aW5nIChkZWZhdWx0KTogSU5TRVJUIElOVE8gYEV2ZW50X2p1cmlzYCAoYGlkYCxgZXZlbnRfaWRgLGBqdXJpX2lkYCkgVkFMVUVTIChERUZBVUxULD8sPyk7IC0tIERBVEE6IHsiZXZlbnRfaWQiOiJFVlQwMDAyIiwianVyaV9pZCI6IkpSSTAwMDEifQ==','2025-10-14 07:10:04','KOE0002'),(5,'EVT0003','ADD_JURI','SUCCESS - Juri ID: JRI0001','RXhlY3V0aW5nIChkZWZhdWx0KTogSU5TRVJUIElOVE8gYEV2ZW50X2p1cmlzYCAoYGlkYCxgZXZlbnRfaWRgLGBqdXJpX2lkYCkgVkFMVUVTIChERUZBVUxULD8sPyk7IC0tIERBVEE6IHsiZXZlbnRfaWQiOiJFVlQwMDAzIiwianVyaV9pZCI6IkpSSTAwMDEifQ==','2025-10-14 07:16:52','KOE0002'),(6,'Role Access Matrix','UPDATE','SUCCESS - Hak akses berhasil diperbarui.',NULL,'2025-10-15 02:55:53','ADM0001'),(7,'Role Access Matrix','UPDATE','SUCCESS - Hak akses berhasil diperbarui.',NULL,'2025-10-15 02:56:00','ADM0001'),(8,'Role Access Matrix','UPDATE','SUCCESS - Hak akses berhasil diperbarui.',NULL,'2025-10-15 03:40:01','SUA0001'),(9,'ADM0002','CREATE','SUCCESS','RXhlY3V0aW5nIChkZWZhdWx0KTogSU5TRVJUIElOVE8gYFVzZXJzYCAoYHVzZXJfaWRgLGB1c2VyX25hbWVgLGB1c2VyX2VtYWlsYCxgdXNlcl9wYXNzd29yZGAsYHVzZXJfcm9sZWAsYGlzX2FjdGl2ZWAsYHVzZXJfcGhvdG9gLGBjcmVhdGVkQXRgLGB1cGRhdGVkQXRgKSBWQUxVRVMgKD8sPyw/LD8sPyw/LD8sPyw/KTsgLS0gREFUQTogeyJ1c2VyX2lkIjoiQURNMDAwMiIsInVzZXJfbmFtZSI6IkFkbWluIEtvY2FrIiwidXNlcl9lbWFpbCI6ImFkbWluQHBhbGluZG8uaWQiLCJ1c2VyX3Bhc3N3b3JkIjoiJDJiJDEwJE1ncS81cWlwVTdpNWFJT0xoUWxrWHVNYm5FZnk0N08vQ0gydjZMMlpBWmtlVDhycnJ1OEV5IiwidXNlcl9yb2xlIjoiYWRtaW4iLCJ1c2VyX3Bob3RvIjoiL3VwbG9hZHMvdXNlcnMvdXNlcl9waG90by0xNzYwNDk5NjgxMjY3LTI5NDAyNzI2MS5qcGciLCJpc19hY3RpdmUiOnRydWV9','2025-10-15 03:41:21','SUA0001'),(10,'Role Access Matrix','UPDATE','SUCCESS - Hak akses berhasil diperbarui.',NULL,'2025-10-15 04:01:24','SUA0001'),(11,'EVT0002','REMOVE_JURI','SUCCESS - Juri ID: JRI0001','RXhlY3V0aW5nIChkZWZhdWx0KTogREVMRVRFIEZST00gYEV2ZW50X2p1cmlzYCBXSEVSRSBgZXZlbnRfaWRgID0gJ0VWVDAwMDInIEFORCBganVyaV9pZGAgPSAnSlJJMDAwMScgLS0gREFUQTogeyJldmVudF9pZCI6IkVWVDAwMDIiLCJqdXJpX2lkIjoiSlJJMDAwMSJ9','2025-10-15 04:40:14','SUA0001'),(12,'EVT0002','ADD_JURI','SUCCESS - Juri ID: JRI0001','RXhlY3V0aW5nIChkZWZhdWx0KTogSU5TRVJUIElOVE8gYEV2ZW50X2p1cmlzYCAoYGlkYCxgZXZlbnRfaWRgLGBqdXJpX2lkYCkgVkFMVUVTIChERUZBVUxULD8sPyk7IC0tIERBVEE6IHsiZXZlbnRfaWQiOiJFVlQwMDAyIiwianVyaV9pZCI6IkpSSTAwMDEifQ==','2025-10-15 04:40:20','SUA0001'),(13,'EVT0002','REMOVE_JURI','SUCCESS - Juri ID: JRI0001','RXhlY3V0aW5nIChkZWZhdWx0KTogREVMRVRFIEZST00gYEV2ZW50X2p1cmlzYCBXSEVSRSBgZXZlbnRfaWRgID0gJ0VWVDAwMDInIEFORCBganVyaV9pZGAgPSAnSlJJMDAwMScgLS0gREFUQTogeyJldmVudF9pZCI6IkVWVDAwMDIiLCJqdXJpX2lkIjoiSlJJMDAwMSJ9','2025-10-15 04:41:31','KOE0002'),(14,'EVT0002','ADD_JURI','SUCCESS - Juri ID: JRI0001','RXhlY3V0aW5nIChkZWZhdWx0KTogSU5TRVJUIElOVE8gYEV2ZW50X2p1cmlzYCAoYGlkYCxgZXZlbnRfaWRgLGBqdXJpX2lkYCkgVkFMVUVTIChERUZBVUxULD8sPyk7IC0tIERBVEE6IHsiZXZlbnRfaWQiOiJFVlQwMDAyIiwianVyaV9pZCI6IkpSSTAwMDEifQ==','2025-10-15 04:41:35','KOE0002'),(15,'EVT0002','ADD_TEAM','SUCCESS - Team ID: TM0001','RXhlY3V0aW5nIChkZWZhdWx0KTogSU5TRVJUIElOVE8gYEV2ZW50X3RlYW1zYCAoYGlkYCxgZXZlbnRfaWRgLGB0ZWFtX2lkYCkgVkFMVUVTIChERUZBVUxULD8sPyk7IC0tIERBVEE6IHsiZXZlbnRfaWQiOiJFVlQwMDAyIiwidGVhbV9pZCI6IlRNMDAwMSJ9','2025-10-15 04:41:41','KOE0002'),(16,'EVT0002','ADD_TEAM','SUCCESS - Team ID: TM0002','RXhlY3V0aW5nIChkZWZhdWx0KTogSU5TRVJUIElOVE8gYEV2ZW50X3RlYW1zYCAoYGlkYCxgZXZlbnRfaWRgLGB0ZWFtX2lkYCkgVkFMVUVTIChERUZBVUxULD8sPyk7IC0tIERBVEE6IHsiZXZlbnRfaWQiOiJFVlQwMDAyIiwidGVhbV9pZCI6IlRNMDAwMiJ9','2025-10-15 04:41:44','KOE0002'),(17,'EVT0003','REMOVE_JURI','SUCCESS - Juri ID: JRI0001','RXhlY3V0aW5nIChkZWZhdWx0KTogREVMRVRFIEZST00gYEV2ZW50X2p1cmlzYCBXSEVSRSBgZXZlbnRfaWRgID0gJ0VWVDAwMDMnIEFORCBganVyaV9pZGAgPSAnSlJJMDAwMScgLS0gREFUQTogeyJldmVudF9pZCI6IkVWVDAwMDMiLCJqdXJpX2lkIjoiSlJJMDAwMSJ9','2025-10-16 07:33:58','KOE0002'),(18,'JRI0002','CREATE','SUCCESS','RXhlY3V0aW5nIChkZWZhdWx0KTogSU5TRVJUIElOVE8gYFVzZXJzYCAoYHVzZXJfaWRgLGB1c2VyX25hbWVgLGB1c2VyX2VtYWlsYCxgdXNlcl9wYXNzd29yZGAsYHVzZXJfcm9sZWAsYGlzX2FjdGl2ZWAsYHVzZXJfcGhvdG9gLGBjcmVhdGVkQXRgLGB1cGRhdGVkQXRgKSBWQUxVRVMgKD8sPyw/LD8sPyw/LD8sPyw/KTsgLS0gREFUQTogeyJ1c2VyX2lkIjoiSlJJMDAwMiIsInVzZXJfbmFtZSI6Ikp1cmkgMiIsInVzZXJfZW1haWwiOiJqdXJpMkBwYWxpbmRvLmlkIiwidXNlcl9wYXNzd29yZCI6IiQyYiQxMCRQOTdIMlp0cFNvSnJHRmpITWhYNkMuNXlXLndVaGZldU1uUWdYaFVUbGtYL2FKWUc2ZlZvYSIsInVzZXJfcm9sZSI6Imp1cmkiLCJ1c2VyX3Bob3RvIjoiL3VwbG9hZHMvdXNlcnMvdXNlcl9waG90by0xNzYwNjE5ODg1OTk4LTMxNzg3NTA1My5qcGciLCJpc19hY3RpdmUiOnRydWV9','2025-10-16 13:04:46','SUA0001'),(19,'EVT0002','ADD_JURI','SUCCESS - Juri ID: JRI0002','RXhlY3V0aW5nIChkZWZhdWx0KTogSU5TRVJUIElOVE8gYEV2ZW50X2p1cmlzYCAoYGlkYCxgZXZlbnRfaWRgLGBqdXJpX2lkYCkgVkFMVUVTIChERUZBVUxULD8sPyk7IC0tIERBVEE6IHsiZXZlbnRfaWQiOiJFVlQwMDAyIiwianVyaV9pZCI6IkpSSTAwMDIifQ==','2025-10-16 13:05:15','KOE0002'),(20,'EVT0003','ADD_TEAM','SUCCESS - Team ID: TM0002','RXhlY3V0aW5nIChkZWZhdWx0KTogSU5TRVJUIElOVE8gYEV2ZW50X3RlYW1zYCAoYGlkYCxgZXZlbnRfaWRgLGB0ZWFtX2lkYCkgVkFMVUVTIChERUZBVUxULD8sPyk7IC0tIERBVEE6IHsiZXZlbnRfaWQiOiJFVlQwMDAzIiwidGVhbV9pZCI6IlRNMDAwMiJ9','2025-10-17 01:32:34','SUA0001'),(21,'EVT0003','ADD_TEAM','SUCCESS - Team ID: TM0001','RXhlY3V0aW5nIChkZWZhdWx0KTogSU5TRVJUIElOVE8gYEV2ZW50X3RlYW1zYCAoYGlkYCxgZXZlbnRfaWRgLGB0ZWFtX2lkYCkgVkFMVUVTIChERUZBVUxULD8sPyk7IC0tIERBVEE6IHsiZXZlbnRfaWQiOiJFVlQwMDAzIiwidGVhbV9pZCI6IlRNMDAwMSJ9','2025-10-17 01:32:37','SUA0001'),(22,'EVT0003','ADD_JURI','SUCCESS - Juri ID: JRI0002','RXhlY3V0aW5nIChkZWZhdWx0KTogSU5TRVJUIElOVE8gYEV2ZW50X2p1cmlzYCAoYGlkYCxgZXZlbnRfaWRgLGBqdXJpX2lkYCkgVkFMVUVTIChERUZBVUxULD8sPyk7IC0tIERBVEE6IHsiZXZlbnRfaWQiOiJFVlQwMDAzIiwianVyaV9pZCI6IkpSSTAwMDIifQ==','2025-10-17 01:32:43','SUA0001'),(23,'EVT0003','ADD_JURI','SUCCESS - Juri ID: JRI0001','RXhlY3V0aW5nIChkZWZhdWx0KTogSU5TRVJUIElOVE8gYEV2ZW50X2p1cmlzYCAoYGlkYCxgZXZlbnRfaWRgLGBqdXJpX2lkYCkgVkFMVUVTIChERUZBVUxULD8sPyk7IC0tIERBVEE6IHsiZXZlbnRfaWQiOiJFVlQwMDAzIiwianVyaV9pZCI6IkpSSTAwMDEifQ==','2025-10-17 01:32:49','SUA0001'),(24,'EVT0004','CREATE','SUCCESS','RXhlY3V0aW5nIChkZWZhdWx0KTogSU5TRVJUIElOVE8gYEV2ZW50c2AgKGBldmVudF9pZGAsYGV2ZW50X25hbWVgLGBldmVudF90YW5nZ2FsYCxgZXZlbnRfdGVtcGF0YCxgZXZlbnRfd2FrdHVgLGBldmVudF9wb3N0ZXJgLGBldmVudF9iaWF5YV9wZW5kYWZ0YXJhbmAsYGV2ZW50X2Rlc2tyaXBzaWAsYGV2ZW50X3N0YXR1c2AsYGtvb3JkaW5hdG9yX2lkYCxgY3JlYXRlZEF0YCxgdXBkYXRlZEF0YCkgVkFMVUVTICg/LD8sPyw/LD8sPyw/LD8sPyw/LD8sPyk7IC0tIERBVEE6IHsiZXZlbnRfaWQiOiJFVlQwMDA0IiwiZXZlbnRfbmFtZSI6IkV2ZW50IGtlIDQgIiwiZXZlbnRfdGFuZ2dhbCI6IkZyaSBPY3QgMzEgMjAyNSAwMDowMDowMCBHTVQrMDcwMCAoV2VzdGVybiBJbmRvbmVzaWEgVGltZSkiLCJldmVudF90ZW1wYXQiOiJESW1hbmEgYWphIiwiZXZlbnRfd2FrdHUiOiIwODowMCIsImV2ZW50X3Bvc3RlciI6Ii91cGxvYWRzL2V2ZW50cy9wb3N0ZXItMTc2MDY4MTQyODM0OS03Njc0NzU1OTMuanBnIiwiZXZlbnRfYmlheWFfcGVuZGFmdGFyYW4iOiIxMDAwMDAiLCJldmVudF9kZXNrcmlwc2kiOiJMb3JlbSBpcHN1bSBkb2xvciBzaXQgYW1ldCwgY29uc2VjdGV0dXIgYWRpcGlzY2luZyBlbGl0LiBOdWxsYSBzaXQgYW1ldCBleCBsZWN0dXMuIE51bGxhbSBhIHNlbSBlbGVpZmVuZCwgcHJldGl1bSBlbmltIGV1LCB1bGxhbWNvcnBlciBtYXVyaXMuIFZlc3RpYnVsdW0gZWxpdCBhdWd1ZSwgY29uZGltZW50dW0gaWQgdGVsbHVzIHZpdGFlLCBydXRydW0gdmVzdGlidWx1bSBvcmNpLiBOYW0gaW50ZXJkdW0gZ3JhdmlkYSBuaXNsLCBzZWQgdGluY2lkdW50IGR1aSBsYWNpbmlhIGEuIEV0aWFtIG1hdHRpcyBpbnRlcmR1bSBsZWN0dXMgdmVsIHVsdHJpY2VzLiBJbnRlZ2VyIHNpdCBhbWV0IGxpZ3VsYSBhbGlxdWV0LCBldWlzbW9kIGxpYmVybyBxdWlzLCBjb25zZWN0ZXR1ciBsaWd1bGEuIFByb2luIHByZXRpdW0gZXQgcXVhbSBibGFuZGl0IHZpdmVycmEuIFBlbGxlbnRlc3F1ZSB2ZWwgbWkgdHVycGlzLiBFdGlhbSBzb2xsaWNpdHVkaW4gZmF1Y2lidXMgY3Vyc3VzLiBEdWlzIHNpdCBhbWV0IG1hdHRpcyBuaXNsLCBldCBzb2xsaWNpdHVkaW4gbWV0dXMuIiwiZXZlbnRfc3RhdHVzIjoicHVibGlzaGVkIiwia29vcmRpbmF0b3JfaWQiOiJLT0UwMDAxIn0=','2025-10-17 06:10:28','KOE0001'),(25,'EVT0004','ADD_TEAM','SUCCESS - Team ID: TM0001','RXhlY3V0aW5nIChkZWZhdWx0KTogSU5TRVJUIElOVE8gYEV2ZW50X3RlYW1zYCAoYGlkYCxgZXZlbnRfaWRgLGB0ZWFtX2lkYCkgVkFMVUVTIChERUZBVUxULD8sPyk7IC0tIERBVEE6IHsiZXZlbnRfaWQiOiJFVlQwMDA0IiwidGVhbV9pZCI6IlRNMDAwMSJ9','2025-10-17 06:11:11','KOE0001'),(26,'EVT0004','ADD_TEAM','SUCCESS - Team ID: TM0002','RXhlY3V0aW5nIChkZWZhdWx0KTogSU5TRVJUIElOVE8gYEV2ZW50X3RlYW1zYCAoYGlkYCxgZXZlbnRfaWRgLGB0ZWFtX2lkYCkgVkFMVUVTIChERUZBVUxULD8sPyk7IC0tIERBVEE6IHsiZXZlbnRfaWQiOiJFVlQwMDA0IiwidGVhbV9pZCI6IlRNMDAwMiJ9','2025-10-17 06:11:15','KOE0001'),(27,'EVT0004','ADD_JURI','SUCCESS - Juri ID: JRI0001','RXhlY3V0aW5nIChkZWZhdWx0KTogSU5TRVJUIElOVE8gYEV2ZW50X2p1cmlzYCAoYGlkYCxgZXZlbnRfaWRgLGBqdXJpX2lkYCkgVkFMVUVTIChERUZBVUxULD8sPyk7IC0tIERBVEE6IHsiZXZlbnRfaWQiOiJFVlQwMDA0IiwianVyaV9pZCI6IkpSSTAwMDEifQ==','2025-10-17 06:11:20','KOE0001'),(28,'EVT0004','ADD_JURI','SUCCESS - Juri ID: JRI0002','RXhlY3V0aW5nIChkZWZhdWx0KTogSU5TRVJUIElOVE8gYEV2ZW50X2p1cmlzYCAoYGlkYCxgZXZlbnRfaWRgLGBqdXJpX2lkYCkgVkFMVUVTIChERUZBVUxULD8sPyk7IC0tIERBVEE6IHsiZXZlbnRfaWQiOiJFVlQwMDA0IiwianVyaV9pZCI6IkpSSTAwMDIifQ==','2025-10-17 06:11:25','KOE0001'),(29,'EVT0002','UPDATE_FAILED','Error: Data truncated for column \'event_kategori\' at row 1',NULL,'2025-10-20 04:27:50','KOE0002'),(30,'EVT0002','UPDATE','SUCCESS','RXhlY3V0aW5nIChkZWZhdWx0KTogVVBEQVRFIGBFdmVudHNgIFNFVCBgZXZlbnRfYmlheWFfcGVuZGFmdGFyYW5gPT8sYGV2ZW50X2thdGVnb3JpYD0/LGBldmVudF90aW5na2F0YD0/LGBldmVudF9wcm92aW5zaWA9PyxgZXZlbnRfa290YWA9PyxgdXBkYXRlZEF0YD0/IFdIRVJFIGBldmVudF9pZGAgPSA/IC0tIERBVEE6IHsiZXZlbnRfbmFtZSI6IkV2ZW50IGtlIDIiLCJldmVudF90YW5nZ2FsIjoiVGh1IE9jdCAyMyAyMDI1IDAwOjAwOjAwIEdNVCswNzAwIChXZXN0ZXJuIEluZG9uZXNpYSBUaW1lKSIsImV2ZW50X3RlbXBhdCI6IkNpcmVib24iLCJldmVudF93YWt0dSI6IjA5OjAwOjAwIiwiZXZlbnRfYmlheWFfcGVuZGFmdGFyYW4iOiIxMDAwMDAiLCJldmVudF9kZXNrcmlwc2kiOiJMb3JlbSBpcHN1bSBkb2xvciBzaXQgYW1ldCwgY29uc2VjdGV0dXIgYWRpcGlzY2luZyBlbGl0LiBFdGlhbSBhIGFsaXF1YW0gbGFjdXMsIGFjIG1heGltdXMgZXJhdC4gQWVuZWFuIHBsYWNlcmF0IG5lYyBsaWd1bGEgZXQgY29uc2VjdGV0dXIuIE51bGxhIHZvbHV0cGF0IGRvbG9yIG5pc2wsIG5vbiBsdWN0dXMgZXggcGhhcmV0cmEgcG9ydGEuIERvbmVjIGZhdWNpYnVzIGxhb3JlZXQgZXguIEFsaXF1YW0gcHVsdmluYXIgcXVpcyBsaWd1bGEgcHJldGl1bSBjb21tb2RvLiBDdXJhYml0dXIgbmVjIHJpc3VzIHF1aXMgc2FwaWVuIGN1cnN1cyBjb21tb2RvIGVnZXQgc2VkIG1hdXJpcy4gSW50ZWdlciBtb2xsaXMgbnVsbGEgdHJpc3RpcXVlIGVmZmljaXR1ciBtb2xlc3RpZS4gTnVuYyBhIHNhcGllbiBzZW1wZXIsIGVmZmljaXR1ciBxdWFtIHNlZCwgc2VtcGVyIHF1YW0uIE1hZWNlbmFzIHF1aXMgbGFjdXMgYWxpcXVldCwgdHJpc3RpcXVlIG1hZ25hIGFjLCB0aW5jaWR1bnQgYW50ZS4gUGhhc2VsbHVzIHNlbSBhcmN1LCBwbGFjZXJhdCB2aXRhZSBlcm9zIHNlZCwgYmxhbmRpdCBjb252YWxsaXMgZXJhdC4gSW4gcXVpcyBmcmluZ2lsbGEgdXJuYS4gRnVzY2UgbW9sbGlzIGVzdCB0ZWxsdXMsIHNlZCBwcmV0aXVtIG5pYmggYmliZW5kdW0gaW4uIiwiZXZlbnRfc3RhdHVzIjoicHVibGlzaGVkIiwiZXZlbnRfa2F0ZWdvcmkiOiJzbWFfc21rIiwiZXZlbnRfdGluZ2thdCI6ImtvdGFfa2FidXBhdGVuIiwiZXZlbnRfcHJvdmluc2kiOiJKQVdBIFRFTkdBSCIsImV2ZW50X2tvdGEiOiJLT1RBIFRFR0FMIiwia29vcmRpbmF0b3JfaWQiOiJLT0UwMDAyIiwiZXZlbnRfcG9zdGVyIjoiL3VwbG9hZHMvZXZlbnRzL3Bvc3Rlci0xNzYwMjM1NDg2NjMyLTMzNDEyMTk3NC5qcGVnIn0=','2025-10-20 04:29:20','KOE0002'),(31,'EVT0003','UPDATE','SUCCESS','RXhlY3V0aW5nIChkZWZhdWx0KTogVVBEQVRFIGBFdmVudHNgIFNFVCBgZXZlbnRfdGVtcGF0YD0/LGBldmVudF9iaWF5YV9wZW5kYWZ0YXJhbmA9PyxgZXZlbnRfa2F0ZWdvcmlgPT8sYGV2ZW50X3RpbmdrYXRgPT8sYGV2ZW50X3Byb3ZpbnNpYD0/LGBldmVudF9rb3RhYD0/LGB1cGRhdGVkQXRgPT8gV0hFUkUgYGV2ZW50X2lkYCA9ID8gLS0gREFUQTogeyJldmVudF9uYW1lIjoiRXZlbnQga2UgMyIsImV2ZW50X3RhbmdnYWwiOiJGcmkgT2N0IDE3IDIwMjUgMDA6MDA6MDAgR01UKzA3MDAgKFdlc3Rlcm4gSW5kb25lc2lhIFRpbWUpIiwiZXZlbnRfdGVtcGF0IjoiTGFwYW5nYW4iLCJldmVudF93YWt0dSI6IjA4OjAwOjAwIiwiZXZlbnRfYmlheWFfcGVuZGFmdGFyYW4iOiIxNTAwMDAiLCJldmVudF9kZXNrcmlwc2kiOiJMb3JlbSBpcHN1bSBkb2xvciBzaXQgYW1ldCwgY29uc2VjdGV0dXIgYWRpcGlzY2luZyBlbGl0LiBFdGlhbSBhIGFsaXF1YW0gbGFjdXMsIGFjIG1heGltdXMgZXJhdC4gQWVuZWFuIHBsYWNlcmF0IG5lYyBsaWd1bGEgZXQgY29uc2VjdGV0dXIuIE51bGxhIHZvbHV0cGF0IGRvbG9yIG5pc2wsIG5vbiBsdWN0dXMgZXggcGhhcmV0cmEgcG9ydGEuIERvbmVjIGZhdWNpYnVzIGxhb3JlZXQgZXguIEFsaXF1YW0gcHVsdmluYXIgcXVpcyBsaWd1bGEgcHJldGl1bSBjb21tb2RvLiBDdXJhYml0dXIgbmVjIHJpc3VzIHF1aXMgc2FwaWVuIGN1cnN1cyBjb21tb2RvIGVnZXQgc2VkIG1hdXJpcy4gSW50ZWdlciBtb2xsaXMgbnVsbGEgdHJpc3RpcXVlIGVmZmljaXR1ciBtb2xlc3RpZS4gTnVuYyBhIHNhcGllbiBzZW1wZXIsIGVmZmljaXR1ciBxdWFtIHNlZCwgc2VtcGVyIHF1YW0uIE1hZWNlbmFzIHF1aXMgbGFjdXMgYWxpcXVldCwgdHJpc3RpcXVlIG1hZ25hIGFjLCB0aW5jaWR1bnQgYW50ZS4gUGhhc2VsbHVzIHNlbSBhcmN1LCBwbGFjZXJhdCB2aXRhZSBlcm9zIHNlZCwgYmxhbmRpdCBjb252YWxsaXMgZXJhdC4gSW4gcXVpcyBmcmluZ2lsbGEgdXJuYS4gRnVzY2UgbW9sbGlzIGVzdCB0ZWxsdXMsIHNlZCBwcmV0aXVtIG5pYmggYmliZW5kdW0gaW4uIiwiZXZlbnRfc3RhdHVzIjoicHVibGlzaGVkIiwiZXZlbnRfa2F0ZWdvcmkiOiJzbXAiLCJldmVudF90aW5na2F0IjoicHJvdmluc2kiLCJldmVudF9wcm92aW5zaSI6IkpBV0EgQkFSQVQiLCJldmVudF9rb3RhIjoiS09UQSBDSVJFQk9OIiwia29vcmRpbmF0b3JfaWQiOiJLT0UwMDAyIiwiZXZlbnRfcG9zdGVyIjoiL3VwbG9hZHMvZXZlbnRzL3Bvc3Rlci0xNzYwMjM1NTI0NTY3LTcyMTEzMDIwMi5qcGVnIn0=','2025-10-20 05:30:15','KOE0002'),(32,'EVT0001','UPDATE','SUCCESS','RXhlY3V0aW5nIChkZWZhdWx0KTogVVBEQVRFIGBFdmVudHNgIFNFVCBgZXZlbnRfYmlheWFfcGVuZGFmdGFyYW5gPT8sYGV2ZW50X2thdGVnb3JpYD0/LGBldmVudF90aW5na2F0YD0/LGBldmVudF9wcm92aW5zaWA9PyxgZXZlbnRfa290YWA9PyxgdXBkYXRlZEF0YD0/IFdIRVJFIGBldmVudF9pZGAgPSA/IC0tIERBVEE6IHsiZXZlbnRfbmFtZSI6IjE3IGFndXN0dXMiLCJldmVudF90YW5nZ2FsIjoiU3VuIEF1ZyAxNyAyMDI1IDAwOjAwOjAwIEdNVCswNzAwIChXZXN0ZXJuIEluZG9uZXNpYSBUaW1lKSIsImV2ZW50X3RlbXBhdCI6IkxhcGFuZ2FuIiwiZXZlbnRfd2FrdHUiOiIwODowMDowMCIsImV2ZW50X2JpYXlhX3BlbmRhZnRhcmFuIjoiMjUwMDAwIiwiZXZlbnRfZGVza3JpcHNpIjoiRXZlbnQgdGVzIGxvbWJhIDE3YW4iLCJldmVudF9zdGF0dXMiOiJwdWJsaXNoZWQiLCJldmVudF9rYXRlZ29yaSI6InNtYV9zbWsiLCJldmVudF90aW5na2F0IjoibmFzaW9uYWwiLCJldmVudF9wcm92aW5zaSI6IkpBV0EgVElNVVIiLCJldmVudF9rb3RhIjoiS09UQSBTVVJBQkFZQSIsImtvb3JkaW5hdG9yX2lkIjoiS09FMDAwMiIsImV2ZW50X3Bvc3RlciI6Ii91cGxvYWRzL2V2ZW50cy9wb3N0ZXItMTc2MDA4MjQzMDE1My02NTEwMzIwMzUuanBlZyJ9','2025-10-20 05:54:56','KOE0002'),(33,'EVT0004','UPDATE','SUCCESS','RXhlY3V0aW5nIChkZWZhdWx0KTogVVBEQVRFIGBFdmVudHNgIFNFVCBgZXZlbnRfYmlheWFfcGVuZGFmdGFyYW5gPT8sYGV2ZW50X2thdGVnb3JpYD0/LGBldmVudF90aW5na2F0YD0/LGBldmVudF9wcm92aW5zaWA9PyxgZXZlbnRfa290YWA9PyxgdXBkYXRlZEF0YD0/IFdIRVJFIGBldmVudF9pZGAgPSA/IC0tIERBVEE6IHsiZXZlbnRfbmFtZSI6IkV2ZW50IGtlIDQgIiwiZXZlbnRfdGFuZ2dhbCI6IkZyaSBPY3QgMzEgMjAyNSAwMDowMDowMCBHTVQrMDcwMCAoV2VzdGVybiBJbmRvbmVzaWEgVGltZSkiLCJldmVudF90ZW1wYXQiOiJESW1hbmEgYWphIiwiZXZlbnRfd2FrdHUiOiIwODowMDowMCIsImV2ZW50X2JpYXlhX3BlbmRhZnRhcmFuIjoiMTAwMDAwIiwiZXZlbnRfZGVza3JpcHNpIjoiTG9yZW0gaXBzdW0gZG9sb3Igc2l0IGFtZXQsIGNvbnNlY3RldHVyIGFkaXBpc2NpbmcgZWxpdC4gTnVsbGEgc2l0IGFtZXQgZXggbGVjdHVzLiBOdWxsYW0gYSBzZW0gZWxlaWZlbmQsIHByZXRpdW0gZW5pbSBldSwgdWxsYW1jb3JwZXIgbWF1cmlzLiBWZXN0aWJ1bHVtIGVsaXQgYXVndWUsIGNvbmRpbWVudHVtIGlkIHRlbGx1cyB2aXRhZSwgcnV0cnVtIHZlc3RpYnVsdW0gb3JjaS4gTmFtIGludGVyZHVtIGdyYXZpZGEgbmlzbCwgc2VkIHRpbmNpZHVudCBkdWkgbGFjaW5pYSBhLiBFdGlhbSBtYXR0aXMgaW50ZXJkdW0gbGVjdHVzIHZlbCB1bHRyaWNlcy4gSW50ZWdlciBzaXQgYW1ldCBsaWd1bGEgYWxpcXVldCwgZXVpc21vZCBsaWJlcm8gcXVpcywgY29uc2VjdGV0dXIgbGlndWxhLiBQcm9pbiBwcmV0aXVtIGV0IHF1YW0gYmxhbmRpdCB2aXZlcnJhLiBQZWxsZW50ZXNxdWUgdmVsIG1pIHR1cnBpcy4gRXRpYW0gc29sbGljaXR1ZGluIGZhdWNpYnVzIGN1cnN1cy4gRHVpcyBzaXQgYW1ldCBtYXR0aXMgbmlzbCwgZXQgc29sbGljaXR1ZGluIG1ldHVzLiIsImV2ZW50X3N0YXR1cyI6InB1Ymxpc2hlZCIsImV2ZW50X2thdGVnb3JpIjoic21hX3NtayIsImV2ZW50X3RpbmdrYXQiOiJwcm92aW5zaSIsImV2ZW50X3Byb3ZpbnNpIjoiQUNFSCIsImV2ZW50X2tvdGEiOiJLT1RBIEJBTkRBIEFDRUgiLCJrb29yZGluYXRvcl9pZCI6IktPRTAwMDEiLCJldmVudF9wb3N0ZXIiOiIvdXBsb2Fkcy9ldmVudHMvcG9zdGVyLTE3NjA2ODE0MjgzNDktNzY3NDc1NTkzLmpwZyJ9','2025-10-20 05:55:32','KOE0001'),(34,'Role Access Matrix','UPDATE','SUCCESS - Hak akses berhasil diperbarui.',NULL,'2025-10-20 08:08:20','SUA0001'),(35,'Role Access Matrix','UPDATE','SUCCESS - Hak akses berhasil diperbarui.',NULL,'2025-10-20 08:10:04','SUA0001'),(36,'ASP001-EVT0001','CREATE','Aspek \'PBB\' untuk Event ID: EVT0001',NULL,'2025-10-21 04:18:18','KOE0002'),(37,'ASP002-EVT0001','CREATE','Aspek \'Sikap\' untuk Event ID: EVT0001',NULL,'2025-10-21 04:22:29','KOE0002'),(38,'ASP003-EVT0001','CREATE','Aspek \'Seragam\' untuk Event ID: EVT0001',NULL,'2025-10-21 04:22:41','KOE0002'),(39,'SUB-ASP001-EVT0001-001','CREATE','Sub-Aspek \'Gerakan ditempat\' untuk Aspek ID: ASP001-EVT0001',NULL,'2025-10-21 04:23:00','KOE0002'),(40,'SUB-ASP001-EVT0001-002','CREATE','Sub-Aspek \'Gerakan berjalan\' untuk Aspek ID: ASP001-EVT0001',NULL,'2025-10-21 04:23:10','KOE0002'),(41,'SUB-ASP002-EVT0001-001','CREATE','Sub-Aspek \'Sikap siap\' untuk Aspek ID: ASP002-EVT0001',NULL,'2025-10-21 04:23:21','KOE0002'),(42,'SUB-ASP002-EVT0001-002','CREATE','Sub-Aspek \'Sikap saat formasi\' untuk Aspek ID: ASP002-EVT0001',NULL,'2025-10-21 04:23:36','KOE0002'),(43,'SUB-ASP002-EVT0001-003','CREATE','Sub-Aspek \'Sikap saat berjalan\' untuk Aspek ID: ASP002-EVT0001',NULL,'2025-10-21 04:23:51','KOE0002'),(44,'SUB-ASP003-EVT0001-001','CREATE','Sub-Aspek \'Makeup\' untuk Aspek ID: ASP003-EVT0001',NULL,'2025-10-21 04:24:04','KOE0002'),(45,'SUB-ASP003-EVT0001-002','CREATE','Sub-Aspek \'Kerapian\' untuk Aspek ID: ASP003-EVT0001',NULL,'2025-10-21 04:24:11','KOE0002'),(46,'EVT0001','ADD_JURI','SUCCESS - Juri ID: JRI0002','RXhlY3V0aW5nIChkZWZhdWx0KTogSU5TRVJUIElOVE8gYEV2ZW50X2p1cmlzYCAoYGlkYCxgZXZlbnRfaWRgLGBqdXJpX2lkYCkgVkFMVUVTIChERUZBVUxULD8sPyk7IC0tIERBVEE6IHsiZXZlbnRfaWQiOiJFVlQwMDAxIiwianVyaV9pZCI6IkpSSTAwMDIifQ==','2025-10-21 04:24:17','KOE0002'),(47,'EVT0003','UPDATE','SUCCESS','RXhlY3V0aW5nIChkZWZhdWx0KTogVVBEQVRFIGBFdmVudHNgIFNFVCBgZXZlbnRfdGFuZ2dhbGA9PyxgZXZlbnRfYmlheWFfcGVuZGFmdGFyYW5gPT8sYHVwZGF0ZWRBdGA9PyBXSEVSRSBgZXZlbnRfaWRgID0gPyAtLSBEQVRBOiB7ImV2ZW50X25hbWUiOiJFdmVudCBrZSAzIiwiZXZlbnRfdGFuZ2dhbCI6IkZyaSBPY3QgMzEgMjAyNSAwMDowMDowMCBHTVQrMDcwMCAoV2VzdGVybiBJbmRvbmVzaWEgVGltZSkiLCJldmVudF90ZW1wYXQiOiJMYXBhbmdhbiIsImV2ZW50X3dha3R1IjoiMDg6MDA6MDAiLCJldmVudF9iaWF5YV9wZW5kYWZ0YXJhbiI6IjE1MDAwMCIsImV2ZW50X2Rlc2tyaXBzaSI6IkxvcmVtIGlwc3VtIGRvbG9yIHNpdCBhbWV0LCBjb25zZWN0ZXR1ciBhZGlwaXNjaW5nIGVsaXQuIEV0aWFtIGEgYWxpcXVhbSBsYWN1cywgYWMgbWF4aW11cyBlcmF0LiBBZW5lYW4gcGxhY2VyYXQgbmVjIGxpZ3VsYSBldCBjb25zZWN0ZXR1ci4gTnVsbGEgdm9sdXRwYXQgZG9sb3IgbmlzbCwgbm9uIGx1Y3R1cyBleCBwaGFyZXRyYSBwb3J0YS4gRG9uZWMgZmF1Y2lidXMgbGFvcmVldCBleC4gQWxpcXVhbSBwdWx2aW5hciBxdWlzIGxpZ3VsYSBwcmV0aXVtIGNvbW1vZG8uIEN1cmFiaXR1ciBuZWMgcmlzdXMgcXVpcyBzYXBpZW4gY3Vyc3VzIGNvbW1vZG8gZWdldCBzZWQgbWF1cmlzLiBJbnRlZ2VyIG1vbGxpcyBudWxsYSB0cmlzdGlxdWUgZWZmaWNpdHVyIG1vbGVzdGllLiBOdW5jIGEgc2FwaWVuIHNlbXBlciwgZWZmaWNpdHVyIHF1YW0gc2VkLCBzZW1wZXIgcXVhbS4gTWFlY2VuYXMgcXVpcyBsYWN1cyBhbGlxdWV0LCB0cmlzdGlxdWUgbWFnbmEgYWMsIHRpbmNpZHVudCBhbnRlLiBQaGFzZWxsdXMgc2VtIGFyY3UsIHBsYWNlcmF0IHZpdGFlIGVyb3Mgc2VkLCBibGFuZGl0IGNvbnZhbGxpcyBlcmF0LiBJbiBxdWlzIGZyaW5naWxsYSB1cm5hLiBGdXNjZSBtb2xsaXMgZXN0IHRlbGx1cywgc2VkIHByZXRpdW0gbmliaCBiaWJlbmR1bSBpbi4iLCJldmVudF9zdGF0dXMiOiJwdWJsaXNoZWQiLCJldmVudF9rYXRlZ29yaSI6InNtcCIsImV2ZW50X3RpbmdrYXQiOiJwcm92aW5zaSIsImV2ZW50X3Byb3ZpbnNpIjoiSkFXQSBCQVJBVCIsImV2ZW50X2tvdGEiOiJLT1RBIENJUkVCT04iLCJrb29yZGluYXRvcl9pZCI6IktPRTAwMDIiLCJldmVudF9wb3N0ZXIiOiIvdXBsb2Fkcy9ldmVudHMvcG9zdGVyLTE3NjAyMzU1MjQ1NjctNzIxMTMwMjAyLmpwZWcifQ==','2025-10-21 06:25:38','KOE0002'),(48,'EVT0001','UPDATE','SUCCESS','RXhlY3V0aW5nIChkZWZhdWx0KTogVVBEQVRFIGBFdmVudHNgIFNFVCBgZXZlbnRfdGFuZ2dhbGA9PyxgZXZlbnRfYmlheWFfcGVuZGFmdGFyYW5gPT8sYHVwZGF0ZWRBdGA9PyBXSEVSRSBgZXZlbnRfaWRgID0gPyAtLSBEQVRBOiB7ImV2ZW50X25hbWUiOiIxNyBhZ3VzdHVzIiwiZXZlbnRfdGFuZ2dhbCI6IkZyaSBPY3QgMzEgMjAyNSAwMDowMDowMCBHTVQrMDcwMCAoV2VzdGVybiBJbmRvbmVzaWEgVGltZSkiLCJldmVudF90ZW1wYXQiOiJMYXBhbmdhbiIsImV2ZW50X3dha3R1IjoiMDg6MDA6MDAiLCJldmVudF9iaWF5YV9wZW5kYWZ0YXJhbiI6IjI1MDAwMCIsImV2ZW50X2Rlc2tyaXBzaSI6IkV2ZW50IHRlcyBsb21iYSAxN2FuIiwiZXZlbnRfc3RhdHVzIjoicHVibGlzaGVkIiwiZXZlbnRfa2F0ZWdvcmkiOiJzbWFfc21rIiwiZXZlbnRfdGluZ2thdCI6Im5hc2lvbmFsIiwiZXZlbnRfcHJvdmluc2kiOiJKQVdBIFRJTVVSIiwiZXZlbnRfa290YSI6IktPVEEgU1VSQUJBWUEiLCJrb29yZGluYXRvcl9pZCI6IktPRTAwMDIiLCJldmVudF9wb3N0ZXIiOiIvdXBsb2Fkcy9ldmVudHMvcG9zdGVyLTE3NjAwODI0MzAxNTMtNjUxMDMyMDM1LmpwZWcifQ==','2025-10-21 06:25:44','KOE0002');
/*!40000 ALTER TABLE `log_aktivitas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `menus`
--

DROP TABLE IF EXISTS `menus`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `menus` (
  `menu_id` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `menu_name` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `menu_path` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `menu_description` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`menu_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `menus`
--

LOCK TABLES `menus` WRITE;
/*!40000 ALTER TABLE `menus` DISABLE KEYS */;
INSERT INTO `menus` VALUES ('input_assessment','Input Penilaian','/admin/penilaian','Halaman untuk juri menginputkan nilai.'),('manage_events','Manajemen Event','/admin/events','Mengelola data event lomba.'),('manage_pending_users','Persetujuan Pengguna','/admin/pending-users','Menyetujui atau menolak pendaftaran pengguna baru.'),('manage_role_access','Manajemen Role Akses','/admin/role-access','mengelola Role akses semua users'),('manage_teams','Manajemen Tim','/admin/teams','Mengelola data tim paskibra.'),('manage_users','Manajemen Pengguna','/admin/users','Mengelola data semua pengguna aktif.'),('view_access_log','Log Akses','/admin/log-akses','Melihat log akses (login/logout) pengguna.'),('view_activity_log','Log Aktivitas','/admin/log-aktivitas','Melihat log aktivitas pengguna.'),('view_dashboard','Dashboard','/admin/dashboard','Halaman utama setelah login.'),('view_recap','Rekap Nilai','/admin/rekap','Melihat rekapitulasi nilai dari berbagai event.'),('view_statistics','Statistik','/admin/statistics','Melihat statistik event.');
/*!40000 ALTER TABLE `menus` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rekapnilai`
--

DROP TABLE IF EXISTS `rekapnilai`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rekapnilai` (
  `rekapnilai_id` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `event_id` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `team_id` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `nilai_akhir` decimal(10,0) DEFAULT NULL,
  `jumlah_juri` int DEFAULT NULL,
  PRIMARY KEY (`rekapnilai_id`),
  KEY `event_id` (`event_id`),
  KEY `team_id` (`team_id`),
  CONSTRAINT `rekapnilai_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `Events` (`event_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `rekapnilai_ibfk_2` FOREIGN KEY (`team_id`) REFERENCES `Teams` (`team_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rekapnilai`
--

LOCK TABLES `rekapnilai` WRITE;
/*!40000 ALTER TABLE `rekapnilai` DISABLE KEYS */;
INSERT INTO `rekapnilai` VALUES ('REK-EVT0001-TM0001-003','EVT0001','TM0001',79,2),('REK-EVT0001-TM0002-003','EVT0001','TM0002',74,2),('REK-EVT0002-TM0001-002','EVT0002','TM0001',86,2),('REK-EVT0002-TM0002-001','EVT0002','TM0002',83,2),('REK-EVT0003-TM0001-003','EVT0003','TM0001',83,2),('REK-EVT0003-TM0002-002','EVT0003','TM0002',81,2);
/*!40000 ALTER TABLE `rekapnilai` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role_access`
--

DROP TABLE IF EXISTS `role_access`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role_access` (
  `role_access_id` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `role_id` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `menu_id` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`role_access_id`),
  KEY `role_id` (`role_id`),
  KEY `menu_id` (`menu_id`),
  CONSTRAINT `role_access_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `role_access_ibfk_2` FOREIGN KEY (`menu_id`) REFERENCES `menus` (`menu_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role_access`
--

LOCK TABLES `role_access` WRITE;
/*!40000 ALTER TABLE `role_access` DISABLE KEYS */;
INSERT INTO `role_access` VALUES ('RA0001','superadmin','view_dashboard'),('RA0002','superadmin','manage_users'),('RA0003','superadmin','manage_pending_users'),('RA0004','superadmin','manage_teams'),('RA0005','superadmin','manage_events'),('RA0006','superadmin','view_recap'),('RA0007','superadmin','view_activity_log'),('RA0008','superadmin','view_access_log'),('RA0009','superadmin','manage_role_access'),('RA0010','superadmin','view_statistics'),('RA0011','admin','view_dashboard'),('RA0012','admin','manage_users'),('RA0013','admin','manage_pending_users'),('RA0014','admin','manage_teams'),('RA0015','admin','manage_events'),('RA0016','admin','view_recap'),('RA0017','admin','view_statistics'),('RA0018','juri','view_dashboard'),('RA0019','juri','input_assessment'),('RA0020','juri','view_recap'),('RA0021','koordinator_team','view_dashboard'),('RA0022','koordinator_team','manage_teams'),('RA0023','koordinator_team','view_recap'),('RA0024','koordinator_event','view_dashboard'),('RA0025','koordinator_event','manage_events'),('RA0026','koordinator_event','view_recap');
/*!40000 ALTER TABLE `role_access` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `role_id` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `role_name` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `role_description` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES ('admin','Administrator','Dapat mengelola pengguna, tim, dan event.'),('juri','Juri','Dapat memberikan penilaian pada event yang diikuti.'),('koordinator_event','Koordinator Event','Dapat mengelola event dan pesertanya.'),('koordinator_team','Koordinator Tim','Dapat mengelola tim dan anggota timnya.'),('superadmin','Super Administrator','Memiliki akses penuh ke semua fitur aplikasi.');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-22  2:37:27
