-- MySQL dump 10.16  Distrib 10.1.13-MariaDB, for Win32 (AMD64)
--
-- Host: localhost    Database: NCD
-- ------------------------------------------------------
-- Server version	10.1.13-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `cms_apm`
--

DROP TABLE IF EXISTS `cms_apm`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cms_apm` (
  `apm_id` int(11) NOT NULL AUTO_INCREMENT,
  `apm_survey` varchar(11) NOT NULL,
  `apm_loc` varchar(11) NOT NULL,
  `apm_date` int(11) NOT NULL,
  `apm_pid` varchar(50) NOT NULL,
  `apm_q1` decimal(10,2) DEFAULT NULL,
  `apm_q2` decimal(10,2) DEFAULT NULL,
  `apm_q3` decimal(10,2) DEFAULT NULL,
  `apm_q4` decimal(10,2) DEFAULT NULL,
  `apm_q5` decimal(10,2) DEFAULT NULL,
  `apm_q6` decimal(10,2) DEFAULT NULL,
  `status` varchar(1) DEFAULT NULL,
  `create_time` int(11) DEFAULT NULL,
  `create_user` smallint(6) DEFAULT NULL,
  `update_time` int(11) DEFAULT NULL,
  `update_user` smallint(6) DEFAULT NULL,
  `record_date` int(11) DEFAULT NULL,
  `loc_code` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`apm_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3422 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cms_apm`
--

LOCK TABLES `cms_apm` WRITE;
/*!40000 ALTER TABLE `cms_apm` DISABLE KEYS */;
/*!40000 ALTER TABLE `cms_apm` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cms_appsettings`
--

DROP TABLE IF EXISTS `cms_appsettings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cms_appsettings` (
  `app_stngs_id` int(11) NOT NULL AUTO_INCREMENT,
  `app_survey_id` varchar(11) NOT NULL COMMENT 'Survey',
  `app_coupons` enum('0','1') DEFAULT NULL COMMENT 'Coupons',
  `app_incentive` enum('0','1') DEFAULT NULL COMMENT 'Incentive',
  `app_control_site` enum('0','1') DEFAULT NULL COMMENT 'Control Site Flag',
  `app_idu` enum('0','1') DEFAULT NULL,
  `app_fin_yr` varchar(50) NOT NULL COMMENT 'Financial Year',
  `app_fin_yr_fixed` enum('0','1') NOT NULL COMMENT 'Financial Year Is Fixed?',
  `app_reimbsmnt_vchr` varchar(50) DEFAULT NULL COMMENT 'Reimbursement Voucher',
  `app_reimbsmnt_vchr_fixed` enum('0','1') DEFAULT NULL COMMENT 'Reimbursement Voucher Is Fixed?',
  `app_location` varchar(50) DEFAULT NULL COMMENT 'Default Location',
  `app_location_fixed` enum('0','1') DEFAULT NULL COMMENT 'Default Location Is Fixed?',
  `app_cupn_cde_fixed` enum('0','1') DEFAULT NULL COMMENT 'Coupon code is Participant ID?',
  `app_no_of_coupon` varchar(50) DEFAULT NULL COMMENT 'No of coupons per participant',
  `app_no_of_coupon_fixed` enum('0','1') DEFAULT NULL COMMENT 'No of coupons per participant Is Fixed?',
  `app_cupn_prd` varchar(50) DEFAULT NULL COMMENT 'Coupon Validity Period',
  `app_cupn_prd_type` varchar(50) DEFAULT NULL COMMENT 'Coupon Validity Period Type',
  `app_cupn_prd_fixed` enum('0','1') DEFAULT NULL COMMENT 'Coupon Validity Period Is Fixed?',
  `app_incentive_amt` varchar(50) DEFAULT NULL COMMENT 'Incentive Amount',
  `app_incentive_amt_fixed` enum('0','1') DEFAULT NULL COMMENT 'Incentive Amount Is Fixed?',
  `app_incentive_vchr` varchar(50) DEFAULT NULL COMMENT 'Incentive Voucher',
  `app_incentive_vchr_fixed` enum('0','1') DEFAULT NULL COMMENT 'Incentive Voucher Is Fixed?',
  `app_ost_fixed` enum('0','1') DEFAULT NULL COMMENT 'OST Doses are Fixed?',
  `status` varchar(1) DEFAULT NULL,
  `create_time` int(11) DEFAULT NULL,
  `create_user` int(11) DEFAULT NULL,
  `update_time` int(11) DEFAULT NULL,
  `update_user` int(11) DEFAULT NULL,
  PRIMARY KEY (`app_stngs_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cms_appsettings`
--

LOCK TABLES `cms_appsettings` WRITE;
/*!40000 ALTER TABLE `cms_appsettings` DISABLE KEYS */;
INSERT INTO `cms_appsettings` VALUES (1,'NCD','0','0','0','1','2526','1',NULL,NULL,'DH','1','0','','0','','','0','','0',NULL,NULL,'0','1',1745646415,2,1752668862,2);
/*!40000 ALTER TABLE `cms_appsettings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cms_attandance`
--

DROP TABLE IF EXISTS `cms_attandance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cms_attandance` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sid` varchar(20) NOT NULL,
  `location` varchar(20) NOT NULL,
  `pid` varchar(100) NOT NULL,
  `participant_id` varchar(100) DEFAULT NULL,
  `interviewer` varchar(3) NOT NULL DEFAULT '999',
  `visit` int(11) NOT NULL,
  `visit_date` int(11) NOT NULL,
  `visit_in` int(11) DEFAULT NULL,
  `out_interviewer` varchar(3) DEFAULT NULL,
  `visit_out` int(11) DEFAULT NULL,
  `remarks` varchar(250) DEFAULT NULL,
  `status` varchar(1) DEFAULT NULL,
  `create_time` int(11) DEFAULT NULL,
  `create_user` int(11) DEFAULT NULL,
  `update_time` int(11) DEFAULT NULL,
  `update_user` int(11) DEFAULT NULL,
  `record_date` int(11) DEFAULT NULL,
  `NextVisit_Date` int(11) DEFAULT NULL,
  `Injection` varchar(1) DEFAULT NULL,
  `ARM` int(11) DEFAULT NULL,
  `state_code` varchar(50) DEFAULT NULL,
  `loc_code` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `pid` (`pid`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cms_attandance`
--

LOCK TABLES `cms_attandance` WRITE;
/*!40000 ALTER TABLE `cms_attandance` DISABLE KEYS */;
/*!40000 ALTER TABLE `cms_attandance` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `attandance_update_trigger` BEFORE INSERT ON `cms_attandance` FOR EACH ROW BEGIN

























  IF ((NEW.pid IS NULL OR NEW.pid = '') AND (NEW.participant_id IS NOT NULL OR NEW.participant_id != '')) THEN






































    SET NEW.pid = NEW.participant_id;






































  END IF;



















































  IF ((NEW.pid IS NOT NULL OR NEW.pid != '') AND (NEW.participant_id IS NULL OR NEW.participant_id = '')) THEN



















































    SET NEW.participant_id = NEW.pid;



















































  END IF;



















































  IF (NEW.location IS NULL OR NEW.location = '') THEN



















































    SET @Loc :=(SELECT app_location FROM cms_appsettings);

























    SET NEW.location = @Loc;



















































  END IF;



















































  IF (NEW.sid IS NULL OR NEW.sid = '') THEN






































      SET NEW.sid = 'OST'; 



















































  END IF;



















































  IF (NEW.visit_in IS NULL OR NEW.visit_in = '') THEN



















































    SET NEW.visit_in = UNIX_TIMESTAMP(NOW());



















































  END IF;



















































  IF (NEW.status IS NULL OR NEW.status = '') THEN



















































    SET NEW.status = 1;



















































  END IF;



















































  IF (NEW.create_time IS NULL OR NEW.create_time = '') THEN



















































    SET NEW.create_time = UNIX_TIMESTAMP(NOW());



















































  END IF;



















































  IF (NEW.record_date IS NULL OR NEW.record_date = '') THEN



















































    SET NEW.record_date = NEW.visit_date;



















































  END IF;












  












  IF (NEW.visit_in IS Not NULL  and  NEW.visit_in != '') THEN



















































    SET NEW.visit_out = NEW.visit_in;



















































  END IF;












  












   IF (NEW.interviewer IS Not NULL  and  NEW.interviewer != '') THEN



















































    SET NEW.out_interviewer = NEW.interviewer;



















































  END IF;

























     












	












 












END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trig_cms_attandance_INSERT` AFTER INSERT ON `cms_attandance` FOR EACH ROW BEGIN






































IF (NEW.pid IS NOT NULL OR NEW.pid != '') THEN

























    SET @ostvisit_pid =(select ost_master_part_id from cms_ostmaster where ost_master_part_id=NEW.pid and ost_master_q3 is Null);

























	SET @ostvisit_q1 =(select ost_master_q1 from cms_ostmaster where ost_master_part_id=NEW.pid and ost_master_q3 is Null);

























	SET @ostvisit_q2 =(select ost_master_q4 from cms_ostmaster where ost_master_part_id=NEW.pid and ost_master_q3 is Null);

























	SET @ostvisit_q3 =(select ost_master_q5 from cms_ostmaster where ost_master_part_id=NEW.pid and ost_master_q3 is Null);

























	SET @ostvisit_q4 =(select ost_master_q6 from cms_ostmaster where ost_master_part_id=NEW.pid and ost_master_q3 is Null);

























	SET @ostvisit_q5 =(select ost_master_q7 from cms_ostmaster where ost_master_part_id=NEW.pid and ost_master_q3 is Null);

























   

























END IF;



















































IF (@ostvisit_pid IS NOT NULL OR @ostvisit_pid != '') THEN

























 SET @ostvisit_recorddate =(select max(record_date) from cms_ostvisit where ost_visit_part_id=NEW.pid);

























END IF;



















































IF ((@ostvisit_pid IS NOT NULL OR @ostvisit_pid != '') && (@ostvisit_recorddate !=NEW.record_date OR @ostvisit_recorddate is NULL )) THEN


















































END IF;






































END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `cms_bsr`
--

DROP TABLE IF EXISTS `cms_bsr`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cms_bsr` (
  `bsr_id` int(11) NOT NULL AUTO_INCREMENT,
  `bsr_survey` varchar(11) NOT NULL,
  `bsr_loc` varchar(11) NOT NULL,
  `bsr_date` int(11) NOT NULL,
  `bsr_pid` varchar(50) NOT NULL,
  `bsr_random_sugar` decimal(10,2) DEFAULT NULL,
  `bsr_tot_cholesterol` decimal(10,2) DEFAULT NULL,
  `bsr_triglycerides` decimal(10,2) DEFAULT NULL,
  `bsr_hdl` decimal(10,2) DEFAULT NULL,
  `bsr_ldl` decimal(10,2) DEFAULT NULL,
  `bsr_creatinine` decimal(10,2) DEFAULT NULL,
  `bsr_urea` decimal(10,2) DEFAULT NULL,
  `bsr_tot_bilirubin` decimal(10,2) DEFAULT NULL,
  `bsr_sgot` decimal(10,2) DEFAULT NULL,
  `bsr_sgpt` decimal(10,2) DEFAULT NULL,
  `bsr_tot_protein` decimal(10,2) DEFAULT NULL,
  `bsr_albumin` decimal(10,2) DEFAULT NULL,
  `status` varchar(1) DEFAULT NULL,
  `create_time` int(11) DEFAULT NULL,
  `create_user` smallint(6) DEFAULT NULL,
  `update_time` int(11) DEFAULT NULL,
  `update_user` smallint(6) DEFAULT NULL,
  `record_date` int(11) DEFAULT NULL,
  `loc_code` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`bsr_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3422 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cms_bsr`
--

LOCK TABLES `cms_bsr` WRITE;
/*!40000 ALTER TABLE `cms_bsr` DISABLE KEYS */;
/*!40000 ALTER TABLE `cms_bsr` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cms_cchv`
--

DROP TABLE IF EXISTS `cms_cchv`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cms_cchv` (
  `cchv_id` int(11) NOT NULL AUTO_INCREMENT,
  `cchv_survey` varchar(11) NOT NULL,
  `cchv_loc` varchar(11) NOT NULL,
  `cchv_date` int(11) NOT NULL,
  `cchv_pid` varchar(50) NOT NULL,
  `cchv_q53` smallint(6) DEFAULT NULL,
  `cchv_q54` smallint(6) DEFAULT NULL,
  `cchv_q55` smallint(6) DEFAULT NULL,
  `cchv_q55a` varchar(50) DEFAULT NULL,
  `cchv_q56` varchar(50) DEFAULT NULL,
  `cchv_q56a` varchar(50) DEFAULT NULL,
  `cchv_q57` smallint(6) DEFAULT NULL,
  `cchv_q58` smallint(6) DEFAULT NULL,
  `cchv_q58a` varchar(11) DEFAULT NULL,
  `cchv_q59` smallint(6) DEFAULT NULL,
  `cchv_q60` smallint(6) DEFAULT NULL,
  `cchv_q61` varchar(50) DEFAULT NULL,
  `cchv_q61a` varchar(50) DEFAULT NULL,
  `cchv_q62` smallint(6) DEFAULT NULL,
  `cchv_q63` smallint(6) DEFAULT NULL,
  `cchv_q64` smallint(6) DEFAULT NULL,
  `cchv_q65` smallint(6) DEFAULT NULL,
  `cchv_q66` smallint(6) DEFAULT NULL,
  `cchv_q67` smallint(6) DEFAULT NULL,
  `cchv_q68` smallint(6) DEFAULT NULL,
  `cchv_q69` smallint(6) DEFAULT NULL,
  `cchv_q70` smallint(6) DEFAULT NULL,
  `cchv_q71` smallint(6) DEFAULT NULL,
  `cchv_q72` smallint(6) DEFAULT NULL,
  `cchv_q73` smallint(6) DEFAULT NULL,
  `cchv_q74` smallint(6) DEFAULT NULL,
  `cchv_q75` smallint(6) DEFAULT NULL,
  `cchv_q76` smallint(6) DEFAULT NULL,
  `cchv_q77` smallint(6) DEFAULT NULL,
  `cchv_q78` smallint(6) DEFAULT NULL,
  `cchv_q79` smallint(6) DEFAULT NULL,
  `cchv_q80` smallint(6) DEFAULT NULL,
  `cchv_q81` smallint(6) DEFAULT NULL,
  `cchv_q82` smallint(6) DEFAULT NULL,
  `cchv_q83` smallint(6) DEFAULT NULL,
  `cchv_q84` smallint(6) DEFAULT NULL,
  `cchv_q85` smallint(6) DEFAULT NULL,
  `cchv_q86` smallint(6) DEFAULT NULL,
  `cchv_q87` smallint(6) DEFAULT NULL,
  `cchv_q88` smallint(6) DEFAULT NULL,
  `cchv_q89` smallint(6) DEFAULT NULL,
  `cchv_q90` smallint(6) DEFAULT NULL,
  `cchv_q91` smallint(6) DEFAULT NULL,
  `cchv_q92` smallint(6) DEFAULT NULL,
  `cchv_q93` smallint(6) DEFAULT NULL,
  `cchv_q94` smallint(6) DEFAULT NULL,
  `cchv_q95` smallint(6) DEFAULT NULL,
  `cchv_q96` smallint(6) DEFAULT NULL,
  `cchv_q97` smallint(6) DEFAULT NULL,
  `cchv_q98` smallint(6) DEFAULT NULL,
  `cchv_q99` varchar(50) DEFAULT NULL,
  `cchv_q99a` varchar(50) DEFAULT NULL,
  `cchv_q100` smallint(6) DEFAULT NULL,
  `cchv_q101` smallint(6) DEFAULT NULL,
  `cchv_q101a` varchar(50) DEFAULT NULL,
  `cchv_q102` smallint(6) DEFAULT NULL,
  `cchv_q103` smallint(6) DEFAULT NULL,
  `cchv_q104` varchar(50) DEFAULT NULL,
  `cchv_q104a` varchar(50) DEFAULT NULL,
  `cchv_q105` smallint(6) DEFAULT NULL,
  `cchv_q106` smallint(6) DEFAULT NULL,
  `cchv_q107` smallint(6) DEFAULT NULL,
  `cchv_q108` smallint(6) DEFAULT NULL,
  `cchv_q109` smallint(6) DEFAULT NULL,
  `cchv_q110` smallint(6) DEFAULT NULL,
  `cchv_q111` smallint(6) DEFAULT NULL,
  `cchv_q112` smallint(6) DEFAULT NULL,
  `cchv_q113` smallint(6) DEFAULT NULL,
  `cchv_q114` smallint(6) DEFAULT NULL,
  `cchv_q115` smallint(6) DEFAULT NULL,
  `cchv_q116` smallint(6) DEFAULT NULL,
  `cchv_q117` smallint(6) DEFAULT NULL,
  `cchv_q118` smallint(6) DEFAULT NULL,
  `cchv_q119` text,
  `cchv_q120` text,
  `cchv_q121` text,
  `cchv_q122` text,
  `status` varchar(1) DEFAULT NULL,
  `create_time` int(11) DEFAULT NULL,
  `create_user` smallint(6) DEFAULT NULL,
  `update_time` int(11) DEFAULT NULL,
  `update_user` smallint(6) DEFAULT NULL,
  `record_date` int(11) DEFAULT NULL,
  `loc_code` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`cchv_id`)
) ENGINE=InnoDB AUTO_INCREMENT=247 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cms_cchv`
--

LOCK TABLES `cms_cchv` WRITE;
/*!40000 ALTER TABLE `cms_cchv` DISABLE KEYS */;
/*!40000 ALTER TABLE `cms_cchv` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cms_ce`
--

DROP TABLE IF EXISTS `cms_ce`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cms_ce` (
  `ce_id` int(11) NOT NULL AUTO_INCREMENT,
  `ce_survey` varchar(11) NOT NULL,
  `ce_loc` varchar(11) NOT NULL,
  `ce_date` int(11) NOT NULL,
  `ce_pid` varchar(50) NOT NULL,
  `ce_q1` varchar(250) DEFAULT NULL,
  `ce_q2` varchar(250) DEFAULT NULL,
  `ce_q3` varchar(250) DEFAULT NULL,
  `ce_q4a` varchar(250) DEFAULT NULL,
  `ce_q4b` varchar(250) DEFAULT NULL,
  `ce_q5a` varchar(250) DEFAULT NULL,
  `ce_q5b` varchar(250) DEFAULT NULL,
  `ce_q6` smallint(6) DEFAULT NULL,
  `ce_q6a` varchar(150) DEFAULT NULL,
  `status` varchar(1) DEFAULT NULL,
  `create_time` int(11) DEFAULT NULL,
  `create_user` smallint(6) DEFAULT NULL,
  `update_time` int(11) DEFAULT NULL,
  `update_user` smallint(6) DEFAULT NULL,
  `record_date` int(11) DEFAULT NULL,
  `loc_code` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`ce_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3424 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cms_ce`
--

LOCK TABLES `cms_ce` WRITE;
/*!40000 ALTER TABLE `cms_ce` DISABLE KEYS */;
/*!40000 ALTER TABLE `cms_ce` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cms_clientidref`
--

DROP TABLE IF EXISTS `cms_clientidref`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cms_clientidref` (
  `clientid_ref_sur` varchar(11) NOT NULL COMMENT 'Survey',
  `clientid_ref_loc` varchar(11) NOT NULL COMMENT 'Location',
  `clientid_ref_code` int(11) NOT NULL COMMENT 'Last Client id Number',
  `record_date` int(11) DEFAULT NULL,
  `update_time` int(11) DEFAULT NULL,
  UNIQUE KEY `clientid_ref_sur` (`clientid_ref_sur`,`clientid_ref_loc`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cms_clientidref`
--

LOCK TABLES `cms_clientidref` WRITE;
/*!40000 ALTER TABLE `cms_clientidref` DISABLE KEYS */;
/*!40000 ALTER TABLE `cms_clientidref` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cms_cml`
--

DROP TABLE IF EXISTS `cms_cml`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cms_cml` (
  `cml_id` int(11) NOT NULL AUTO_INCREMENT,
  `cml_survey` varchar(11) NOT NULL,
  `cml_loc` varchar(11) NOT NULL,
  `cml_date` int(11) NOT NULL,
  `cml_pid` varchar(50) NOT NULL,
  `cml_q2` smallint(6) DEFAULT NULL,
  `cml_q2a` varchar(100) DEFAULT NULL,
  `cml_q4` smallint(6) DEFAULT NULL,
  `cml_q4_date` int(11) DEFAULT NULL,
  `cml_q5` smallint(6) DEFAULT NULL,
  `cml_q6` varchar(50) DEFAULT NULL,
  `cml_q6a` varchar(100) DEFAULT NULL,
  `status` varchar(1) DEFAULT NULL,
  `create_time` int(11) DEFAULT NULL,
  `create_user` smallint(6) DEFAULT NULL,
  `update_time` int(11) DEFAULT NULL,
  `update_user` smallint(6) DEFAULT NULL,
  `record_date` int(11) DEFAULT NULL,
  `loc_code` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`cml_id`)
) ENGINE=InnoDB AUTO_INCREMENT=984 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cms_cml`
--

LOCK TABLES `cms_cml` WRITE;
/*!40000 ALTER TABLE `cms_cml` DISABLE KEYS */;
/*!40000 ALTER TABLE `cms_cml` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cms_cprca`
--

DROP TABLE IF EXISTS `cms_cprca`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cms_cprca` (
  `cprca_id` int(11) NOT NULL AUTO_INCREMENT,
  `cprca_survey` varchar(11) NOT NULL,
  `cprca_loc` varchar(11) NOT NULL,
  `cprca_date` int(11) NOT NULL,
  `cprca_pid` varchar(50) NOT NULL,
  `cprca_q8` varchar(100) DEFAULT NULL,
  `cprca_q9` smallint(6) DEFAULT NULL,
  `status` varchar(1) DEFAULT NULL,
  `create_time` int(11) DEFAULT NULL,
  `create_user` smallint(6) DEFAULT NULL,
  `update_time` int(11) DEFAULT NULL,
  `update_user` smallint(6) DEFAULT NULL,
  `record_date` int(11) DEFAULT NULL,
  `loc_code` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`cprca_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3408 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cms_cprca`
--

LOCK TABLES `cms_cprca` WRITE;
/*!40000 ALTER TABLE `cms_cprca` DISABLE KEYS */;
/*!40000 ALTER TABLE `cms_cprca` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cms_dg`
--

DROP TABLE IF EXISTS `cms_dg`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cms_dg` (
  `dg_id` int(11) NOT NULL AUTO_INCREMENT,
  `dg_survey` varchar(11) NOT NULL,
  `dg_loc` varchar(11) NOT NULL,
  `dg_geographical_area` varchar(2) DEFAULT NULL,
  `dg_date` int(11) NOT NULL,
  `dg_pid` varchar(50) NOT NULL,
  `dg_q1` smallint(6) NOT NULL,
  `dg_q2` smallint(6) NOT NULL,
  `dg_q3` varchar(150) DEFAULT NULL,
  `dg_q4` smallint(6) NOT NULL,
  `dg_q4a` varchar(50) DEFAULT NULL,
  `dg_q5` smallint(6) NOT NULL,
  `dg_q5a` smallint(6) DEFAULT NULL,
  `dg_q5b` smallint(6) DEFAULT NULL,
  `dg_q5c` smallint(6) DEFAULT NULL,
  `status` varchar(1) DEFAULT NULL,
  `create_time` int(11) DEFAULT NULL,
  `create_user` smallint(6) DEFAULT NULL,
  `update_time` int(11) DEFAULT NULL,
  `update_user` smallint(6) DEFAULT NULL,
  `record_date` int(11) DEFAULT NULL,
  `loc_code` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`dg_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3425 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cms_dg`
--

LOCK TABLES `cms_dg` WRITE;
/*!40000 ALTER TABLE `cms_dg` DISABLE KEYS */;
/*!40000 ALTER TABLE `cms_dg` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cms_fieldmaster`
--

DROP TABLE IF EXISTS `cms_fieldmaster`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cms_fieldmaster` (
  `fld_mstr_id` int(11) NOT NULL AUTO_INCREMENT,
  `fld_mstr_frmfield` varchar(300) NOT NULL COMMENT 'Form Field',
  `fld_mstr_code` varchar(300) NOT NULL COMMENT 'Code',
  `fld_mstr_desc` varchar(300) NOT NULL COMMENT 'Description',
  `status` varchar(1) DEFAULT NULL,
  `create_time` int(11) DEFAULT NULL,
  `create_user` int(11) DEFAULT NULL,
  `update_time` int(11) DEFAULT NULL,
  `update_user` int(11) DEFAULT NULL,
  `record_date` int(11) DEFAULT NULL,
  PRIMARY KEY (`fld_mstr_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cms_fieldmaster`
--

LOCK TABLES `cms_fieldmaster` WRITE;
/*!40000 ALTER TABLE `cms_fieldmaster` DISABLE KEYS */;
/*!40000 ALTER TABLE `cms_fieldmaster` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cms_fupm`
--

DROP TABLE IF EXISTS `cms_fupm`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cms_fupm` (
  `fupm_id` int(11) NOT NULL AUTO_INCREMENT,
  `fupm_survey` varchar(11) NOT NULL,
  `fupm_loc` varchar(11) NOT NULL,
  `fupm_date` int(11) NOT NULL,
  `fupm_pid` varchar(50) NOT NULL,
  `fupm_q7` smallint(6) DEFAULT NULL,
  `fupm_fupdate1` int(11) DEFAULT NULL,
  `fupm_fupremarks1` varchar(250) DEFAULT NULL,
  `fupm_fupdate2` int(11) DEFAULT NULL,
  `fupm_fupremarks2` varchar(250) DEFAULT NULL,
  `fupm_fupdate3` int(11) DEFAULT NULL,
  `fupm_fupremarks3` varchar(250) DEFAULT NULL,
  `status` varchar(1) DEFAULT NULL,
  `create_time` int(11) DEFAULT NULL,
  `create_user` smallint(6) DEFAULT NULL,
  `update_time` int(11) DEFAULT NULL,
  `update_user` smallint(6) DEFAULT NULL,
  `record_date` int(11) DEFAULT NULL,
  `loc_code` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`fupm_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1641 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cms_fupm`
--

LOCK TABLES `cms_fupm` WRITE;
/*!40000 ALTER TABLE `cms_fupm` DISABLE KEYS */;
/*!40000 ALTER TABLE `cms_fupm` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cms_locationmapping`
--

DROP TABLE IF EXISTS `cms_locationmapping`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cms_locationmapping` (
  `loc_mapng_id` int(11) NOT NULL AUTO_INCREMENT,
  `loc_mapng_sur_id` varchar(11) NOT NULL COMMENT 'Survey',
  `loc_mapng_mstr_id` varchar(11) NOT NULL COMMENT 'Location',
  `status` varchar(1) DEFAULT NULL,
  `create_time` int(11) DEFAULT NULL,
  `create_user` int(11) DEFAULT NULL,
  `update_time` int(11) DEFAULT NULL,
  `update_user` int(11) DEFAULT NULL,
  `record_date` int(11) DEFAULT NULL,
  PRIMARY KEY (`loc_mapng_id`),
  UNIQUE KEY `loc_mapng_sur_id` (`loc_mapng_sur_id`,`loc_mapng_mstr_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cms_locationmapping`
--

LOCK TABLES `cms_locationmapping` WRITE;
/*!40000 ALTER TABLE `cms_locationmapping` DISABLE KEYS */;
/*!40000 ALTER TABLE `cms_locationmapping` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cms_locationmaster`
--

DROP TABLE IF EXISTS `cms_locationmaster`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cms_locationmaster` (
  `loc_id` int(11) NOT NULL AUTO_INCREMENT,
  `loc_code` varchar(20) NOT NULL COMMENT 'Location Code',
  `loc_name` varchar(255) NOT NULL COMMENT 'Location Name',
  `state_code` varchar(10) DEFAULT NULL,
  `status` varchar(1) DEFAULT NULL,
  `del_status` int(11) NOT NULL,
  `create_time` int(11) DEFAULT NULL,
  `create_user` int(11) DEFAULT NULL,
  `update_time` int(11) DEFAULT NULL,
  `update_user` int(11) DEFAULT NULL,
  `record_date` int(11) DEFAULT NULL,
  PRIMARY KEY (`loc_id`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cms_locationmaster`
--

LOCK TABLES `cms_locationmaster` WRITE;
/*!40000 ALTER TABLE `cms_locationmaster` DISABLE KEYS */;
INSERT INTO `cms_locationmaster` VALUES (1,'DH','Dharavi','MH','1',0,1745646415,2,1752668556,2,1745605800),(2,'ML','MALVANI','MH','1',0,1747916357,2,1747916357,NULL,1747852200);
/*!40000 ALTER TABLE `cms_locationmaster` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cms_mainmenu`
--

DROP TABLE IF EXISTS `cms_mainmenu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cms_mainmenu` (
  `min_mnu_id` int(11) NOT NULL AUTO_INCREMENT,
  `min_mnu_name` text NOT NULL,
  `min_mnu_desc` text NOT NULL,
  `min_mnu_preference` int(11) NOT NULL,
  `status` varchar(1) DEFAULT NULL,
  `create_time` int(11) DEFAULT NULL,
  `create_user` int(11) DEFAULT NULL,
  `update_time` int(11) DEFAULT NULL,
  `update_user` int(11) DEFAULT NULL,
  `record_date` int(11) DEFAULT NULL,
  PRIMARY KEY (`min_mnu_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cms_mainmenu`
--

LOCK TABLES `cms_mainmenu` WRITE;
/*!40000 ALTER TABLE `cms_mainmenu` DISABLE KEYS */;
INSERT INTO `cms_mainmenu` VALUES (1,'master','Masters',1,'1',1745646415,2,1745646415,NULL,1745605800),(2,'DE','Data Entry Forms',2,'1',1745646415,2,1745646415,NULL,1745605800),(3,'administrator','Admin',5,'1',1745646415,2,1745646415,NULL,1745605800),(4,'reports','Reports',3,'1',1745646415,2,1745646415,NULL,1745605800),(5,'Export','Data Export',4,'1',1745646415,2,1745646415,NULL,1745605800);
/*!40000 ALTER TABLE `cms_mainmenu` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cms_mdhl`
--

DROP TABLE IF EXISTS `cms_mdhl`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cms_mdhl` (
  `mdhl_id` int(11) NOT NULL AUTO_INCREMENT,
  `mdhl_survey` varchar(11) NOT NULL,
  `mdhl_loc` varchar(11) NOT NULL,
  `mdhl_date` int(11) NOT NULL,
  `mdhl_pid` varchar(50) NOT NULL,
  `mdhl_q6` varchar(50) DEFAULT NULL,
  `mdhl_q6a` varchar(50) DEFAULT NULL,
  `mdhl_q7` smallint(6) DEFAULT NULL,
  `mdhl_q7a` varchar(50) DEFAULT NULL,
  `mdhl_q7b` varchar(50) DEFAULT NULL,
  `mdhl_q8` smallint(6) DEFAULT NULL,
  `mdhl_q8a` smallint(6) DEFAULT NULL,
  `mdhl_q9` smallint(6) DEFAULT NULL,
  `mdhl_q9a` smallint(6) DEFAULT NULL,
  `mdhl_q10` smallint(6) DEFAULT NULL,
  `mdhl_q11` smallint(6) DEFAULT NULL,
  `mdhl_q12` smallint(6) DEFAULT NULL,
  `mdhl_q13a` smallint(6) DEFAULT NULL,
  `mdhl_q13b` smallint(6) DEFAULT NULL,
  `gad_q1` smallint(6) DEFAULT NULL,
  `gad_q2` smallint(6) DEFAULT NULL,
  `gad_q3` smallint(6) DEFAULT NULL,
  `gad_q4` smallint(6) DEFAULT NULL,
  `gad_q5` smallint(6) DEFAULT NULL,
  `gad_q6` smallint(6) DEFAULT NULL,
  `gad_q7` smallint(6) DEFAULT NULL,
  `gad_q8` smallint(6) DEFAULT NULL,
  `gad_tot_score` smallint(6) DEFAULT NULL,
  `gad_anxiety_severity` smallint(6) DEFAULT NULL,
  `mdhl_q15a` smallint(6) DEFAULT NULL,
  `mdhl_q15b` smallint(6) DEFAULT NULL,
  `phq_q1` smallint(6) DEFAULT NULL,
  `phq_q2` smallint(6) DEFAULT NULL,
  `phq_q3` smallint(6) DEFAULT NULL,
  `phq_q4` smallint(6) DEFAULT NULL,
  `phq_q5` smallint(6) DEFAULT NULL,
  `phq_q6` smallint(6) DEFAULT NULL,
  `phq_q7` smallint(6) DEFAULT NULL,
  `phq_q8` smallint(6) DEFAULT NULL,
  `phq_q9` smallint(6) DEFAULT NULL,
  `phq_q10` smallint(6) DEFAULT NULL,
  `phq_tot_score` smallint(6) DEFAULT NULL,
  `phq_depression_severity` smallint(6) DEFAULT NULL,
  `mdhl_q16` smallint(6) DEFAULT NULL,
  `mdhl_q17` smallint(6) DEFAULT NULL,
  `mdhl_q18` smallint(6) DEFAULT NULL,
  `mdhl_q19` smallint(6) DEFAULT NULL,
  `mdhl_q19a` varchar(50) DEFAULT NULL,
  `mdhl_q19b` varchar(50) DEFAULT NULL,
  `status` varchar(1) DEFAULT NULL,
  `create_time` int(11) DEFAULT NULL,
  `create_user` smallint(6) DEFAULT NULL,
  `update_time` int(11) DEFAULT NULL,
  `update_user` smallint(6) DEFAULT NULL,
  `record_date` int(11) DEFAULT NULL,
  `loc_code` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`mdhl_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3424 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cms_mdhl`
--

LOCK TABLES `cms_mdhl` WRITE;
/*!40000 ALTER TABLE `cms_mdhl` DISABLE KEYS */;
/*!40000 ALTER TABLE `cms_mdhl` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cms_menuprivileges`
--

DROP TABLE IF EXISTS `cms_menuprivileges`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cms_menuprivileges` (
  `mnu_acs_id` int(11) NOT NULL AUTO_INCREMENT,
  `mnu_acs_usr_id_fk` int(11) NOT NULL,
  `mnu_acs_mnu_id_fk` int(11) NOT NULL,
  `mnu_acs_sub_mnu_id_fk` int(11) NOT NULL,
  `mnu_acs_usr_status` int(11) DEFAULT NULL,
  `mnu_acs_add` int(1) DEFAULT NULL,
  `mnu_acs_edit` int(1) DEFAULT NULL,
  `mnu_acs_delete` int(1) DEFAULT NULL,
  `status` varchar(1) DEFAULT NULL,
  `create_time` int(11) DEFAULT NULL,
  `create_user` int(11) DEFAULT NULL,
  `update_time` int(11) DEFAULT NULL,
  `update_user` int(11) DEFAULT NULL,
  `record_date` int(11) DEFAULT NULL,
  PRIMARY KEY (`mnu_acs_id`)
) ENGINE=InnoDB AUTO_INCREMENT=74 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cms_menuprivileges`
--

LOCK TABLES `cms_menuprivileges` WRITE;
/*!40000 ALTER TABLE `cms_menuprivileges` DISABLE KEYS */;
INSERT INTO `cms_menuprivileges` VALUES (1,2,1,1,1,1,1,1,'1',1745646415,2,1771586043,2,1745605800),(2,2,1,2,1,1,1,1,'1',1745646415,2,1771586043,2,1745605800),(3,2,1,3,1,1,1,1,'1',1745646415,2,1771586043,2,1745605800),(4,2,1,4,1,1,1,1,'1',1745646415,2,1771586043,2,1745605800),(5,2,1,5,1,1,1,1,'1',1745646415,2,1771586043,2,1745605800),(6,2,1,6,1,1,1,1,'1',1745646415,2,1771586043,2,1745605800),(7,2,1,7,1,1,1,1,'1',1745646415,2,1745646415,NULL,1745605800),(8,2,1,8,1,1,1,1,'1',1745646415,2,1745646415,NULL,1745605800),(9,2,2,9,1,1,1,1,'1',1745646415,2,1771586043,2,1745605800),(10,2,2,10,1,1,1,1,'1',1745646415,2,1771586043,2,1745605800),(11,2,2,11,1,1,1,1,'1',1745646415,2,1771586043,2,1745605800),(12,2,2,12,1,1,1,1,'1',1745646415,2,1771586043,2,1745605800),(13,2,2,13,1,1,1,1,'1',1745646415,2,1771586043,2,1745605800),(14,2,2,14,1,1,1,1,'1',1745646415,2,1771586043,2,1745605800),(15,2,2,15,1,1,1,1,'1',1745646415,2,1771586043,2,1745605800),(16,2,2,16,1,1,1,1,'1',1745646415,2,1771586043,2,1745605800),(17,2,2,17,1,1,1,1,'1',1745646415,2,1771586043,2,1745605800),(18,2,2,18,1,1,1,1,'1',1745646415,2,1745646415,NULL,1745605800),(19,2,2,19,1,1,1,1,'1',1745646415,2,1745646415,NULL,1745605800),(20,2,3,20,1,1,1,1,'1',1745646415,2,1771586043,2,1745605800),(21,2,3,21,1,1,1,1,'1',1745646415,2,1771586043,2,1745605800),(22,2,3,22,1,1,1,1,'1',1745646415,2,1771586043,2,1745605800),(23,2,3,23,1,1,1,1,'1',1745646415,2,1771586043,2,1745605800),(24,2,3,24,1,1,1,1,'1',1745646415,2,1771586043,2,1745605800),(25,2,3,25,1,1,1,1,'1',1745646415,2,1771586043,2,1745605800),(26,2,3,26,1,1,1,1,'1',1745646415,2,1771586043,2,1745605800),(27,3,1,5,1,0,0,0,'1',1747916484,2,1775120216,2,1747852200),(28,3,1,6,1,0,0,0,'1',1747916484,2,1775120216,2,1747852200),(29,3,1,3,1,0,0,0,'1',1747916484,2,1775120216,2,1747852200),(30,3,1,2,1,0,0,0,'1',1747916484,2,1775120216,2,1747852200),(31,3,1,1,1,0,0,0,'1',1747916484,2,1775120216,2,1747852200),(32,3,1,4,1,0,0,0,'1',1747916484,2,1775120216,2,1747852200),(33,3,2,11,1,1,1,0,'1',1747916484,2,1775120216,2,1747852200),(34,3,2,13,1,1,1,0,'1',1747916484,2,1775120216,2,1747852200),(35,3,2,15,1,1,0,0,'1',1747916484,2,1775120216,2,1747852200),(36,3,2,14,1,1,1,0,'1',1747916484,2,1775120216,2,1747852200),(37,3,2,17,1,1,0,0,'1',1747916484,2,1775120216,2,1747852200),(38,3,2,9,1,1,0,0,'1',1747916484,2,1775120216,2,1747852200),(39,3,2,16,1,1,0,0,'1',1747916484,2,1775120216,2,1747852200),(40,3,2,10,1,1,1,0,'1',1747916484,2,1775120216,2,1747852200),(41,3,2,12,1,1,1,0,'1',1747916484,2,1775120216,2,1747852200),(42,3,3,24,1,0,0,0,'1',1747916484,2,1775120216,2,1747852200),(43,3,3,25,1,0,0,0,'1',1747916484,2,1775120216,2,1747852200),(44,3,3,26,1,0,0,0,'1',1747916484,2,1775120216,2,1747852200),(45,3,3,20,1,0,0,0,'1',1747916484,2,1775120216,2,1747852200),(46,3,3,21,1,0,0,0,'1',1747916484,2,1775120216,2,1747852200),(47,3,3,22,1,0,0,0,'1',1747916484,2,1775120216,2,1747852200),(48,3,3,23,1,0,0,0,'1',1747916484,2,1775120216,2,1747852200),(49,4,1,5,1,0,0,0,'1',1757331611,2,1771586031,2,1757269800),(50,4,1,6,1,0,0,0,'1',1757331611,2,1771586031,2,1757269800),(51,4,1,3,1,0,0,0,'1',1757331611,2,1771586031,2,1757269800),(52,4,1,2,1,0,0,0,'1',1757331611,2,1771586031,2,1757269800),(53,4,1,1,1,0,0,0,'1',1757331611,2,1771586031,2,1757269800),(54,4,1,4,1,0,0,0,'1',1757331611,2,1771586031,2,1757269800),(55,4,2,11,1,1,0,0,'1',1757331611,2,1771586031,2,1757269800),(56,4,2,13,1,1,0,0,'1',1757331611,2,1771586031,2,1757269800),(57,4,2,15,1,1,0,0,'1',1757331611,2,1771586031,2,1757269800),(58,4,2,14,1,1,0,0,'1',1757331611,2,1771586031,2,1757269800),(59,4,2,17,1,1,0,0,'1',1757331611,2,1771586031,2,1757269800),(60,4,2,9,1,1,0,0,'1',1757331611,2,1771586031,2,1757269800),(61,4,2,16,1,1,0,0,'1',1757331611,2,1771586031,2,1757269800),(62,4,2,10,1,1,0,0,'1',1757331611,2,1771586031,2,1757269800),(63,4,2,12,1,1,0,0,'1',1757331611,2,1771586031,2,1757269800),(64,4,3,24,1,1,0,0,'1',1757331611,2,1771586031,2,1757269800),(65,4,3,25,1,0,0,0,'1',1757331611,2,1771586031,2,1757269800),(66,4,3,26,1,0,0,0,'1',1757331611,2,1771586031,2,1757269800),(67,4,3,20,1,0,0,0,'1',1757331611,2,1771586031,2,1757269800),(68,4,3,21,1,0,0,0,'1',1757331611,2,1771586031,2,1757269800),(69,4,3,22,1,0,0,0,'1',1757331611,2,1771586031,2,1757269800),(70,4,3,23,1,0,0,0,'1',1757331611,2,1771586031,2,1757269800),(71,3,2,27,1,1,0,0,'1',1771586017,2,1775120216,2,1771525800),(72,4,2,27,1,1,0,0,'1',1771586031,2,1771586031,2,1771525800),(73,2,2,27,1,1,1,1,'1',1771586043,2,1771586043,2,1771525800);
/*!40000 ALTER TABLE `cms_menuprivileges` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cms_mortalityform`
--

DROP TABLE IF EXISTS `cms_mortalityform`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cms_mortalityform` (
  `mortality_form_id` int(11) NOT NULL AUTO_INCREMENT,
  `mortality_form_survey` varchar(11) NOT NULL,
  `mortality_form_loc` varchar(11) NOT NULL,
  `mortality_form_part_id` varchar(100) NOT NULL,
  `mortality_form_q1` varchar(100) NOT NULL,
  `mortality_form_q2` varchar(100) NOT NULL,
  `mortality_form_q3` int(11) DEFAULT NULL,
  `mortality_form_q4` int(11) DEFAULT NULL,
  `mortality_form_q5` varchar(100) DEFAULT NULL,
  `status` varchar(1) DEFAULT NULL,
  `create_time` int(11) DEFAULT NULL,
  `create_user` int(11) DEFAULT NULL,
  `update_time` int(11) DEFAULT NULL,
  `update_user` int(11) DEFAULT NULL,
  `record_date` int(11) DEFAULT NULL,
  `loc_code` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`mortality_form_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cms_mortalityform`
--

LOCK TABLES `cms_mortalityform` WRITE;
/*!40000 ALTER TABLE `cms_mortalityform` DISABLE KEYS */;
/*!40000 ALTER TABLE `cms_mortalityform` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cms_settings`
--

DROP TABLE IF EXISTS `cms_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cms_settings` (
  `stngs_id` int(11) NOT NULL AUTO_INCREMENT,
  `stngs_app_name` text NOT NULL COMMENT 'Application Name',
  `stngs_org_logo` text NOT NULL COMMENT 'Organisation Logo',
  `stngs_org_name` text NOT NULL COMMENT 'Organisation Name',
  `stngs_org_addrs` text NOT NULL COMMENT 'Address',
  `stngs_org_phone` varchar(11) NOT NULL COMMENT 'Phone Number',
  `stngs_org_mail` text NOT NULL COMMENT 'E-Mail',
  `stngs_org_website` text COMMENT 'Website',
  `smtp_admin_name` text COMMENT 'Admin Name',
  `smtp_frm_mail` text COMMENT 'Admin E-Mail',
  `smtp_server_name` text COMMENT 'SMTP Host',
  `smtp_server_port` int(11) DEFAULT NULL COMMENT 'SMTP Port',
  `smtp_server_usrname` text COMMENT 'SMTP Username',
  `smtp_server_pwd` text COMMENT 'SMTP Password',
  `smtp_server_ssl` enum('0','1') DEFAULT NULL COMMENT 'SMTP SSL',
  `smtp_server_auth` enum('0','1') DEFAULT NULL COMMENT 'SMTP Auth',
  `stngs_timezone` varchar(50) NOT NULL COMMENT 'Time Zone',
  `stngs_dateformat` varchar(11) NOT NULL COMMENT 'Date Format',
  `stngs_pagesize` int(11) DEFAULT NULL COMMENT 'Page Size',
  `stngs_incendv_amt` int(11) DEFAULT NULL COMMENT 'Incentive Amount',
  `stngs_financial_year` int(11) DEFAULT NULL COMMENT 'Financial Year',
  `stngs_location` varchar(11) DEFAULT NULL COMMENT 'Default Location',
  `stngs_survey_code` varchar(11) DEFAULT NULL COMMENT 'Survey',
  `stngs_survey_fixed` enum('0','1') DEFAULT NULL COMMENT 'Survey Is Fixed?',
  `status` varchar(1) DEFAULT NULL,
  `create_time` int(11) DEFAULT NULL,
  `create_user` int(11) DEFAULT NULL,
  `update_time` int(11) DEFAULT NULL,
  `update_user` int(11) DEFAULT NULL,
  PRIMARY KEY (`stngs_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cms_settings`
--

LOCK TABLES `cms_settings` WRITE;
/*!40000 ALTER TABLE `cms_settings` DISABLE KEYS */;
INSERT INTO `cms_settings` VALUES (1,'NCD DATABASE','test','NCD-MUMBAI-01','MAHARASHTRA - MUMBAI','9953792372','lhmcostc@yahoo.com','http://www.yrgcare.org','Santhanam Anand','anand@yrgcare.org','pop.bizmail.yahoo.com',25,'anand@yrgcare.org','TlRNek16TTJOVFk9','0','1','Asia/Kolkata','dd-mm-yyyy',0,500,1112,'MH','NCD','1','1',1745646415,0,1745646415,2);
/*!40000 ALTER TABLE `cms_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cms_staffmaster`
--

DROP TABLE IF EXISTS `cms_staffmaster`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cms_staffmaster` (
  `staff_id` int(11) NOT NULL AUTO_INCREMENT,
  `staff_code` varchar(50) DEFAULT NULL,
  `staff_name` varchar(100) DEFAULT NULL,
  `status` varchar(1) DEFAULT NULL,
  `create_time` int(11) DEFAULT NULL,
  `create_user` smallint(6) DEFAULT NULL,
  `update_time` int(11) DEFAULT NULL,
  `update_user` smallint(6) DEFAULT NULL,
  `record_date` int(11) DEFAULT NULL,
  PRIMARY KEY (`staff_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cms_staffmaster`
--

LOCK TABLES `cms_staffmaster` WRITE;
/*!40000 ALTER TABLE `cms_staffmaster` DISABLE KEYS */;
/*!40000 ALTER TABLE `cms_staffmaster` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cms_statemaster`
--

DROP TABLE IF EXISTS `cms_statemaster`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cms_statemaster` (
  `st_id` int(11) NOT NULL AUTO_INCREMENT,
  `state` varchar(50) DEFAULT NULL,
  `state_code` varchar(10) DEFAULT NULL,
  `status` varchar(1) DEFAULT NULL,
  `create_time` int(11) DEFAULT NULL,
  `create_user` smallint(6) DEFAULT NULL,
  `update_time` int(11) DEFAULT NULL,
  `update_user` smallint(6) DEFAULT NULL,
  `record_date` int(11) DEFAULT NULL,
  PRIMARY KEY (`st_id`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cms_statemaster`
--

LOCK TABLES `cms_statemaster` WRITE;
/*!40000 ALTER TABLE `cms_statemaster` DISABLE KEYS */;
/*!40000 ALTER TABLE `cms_statemaster` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cms_submenu`
--

DROP TABLE IF EXISTS `cms_submenu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cms_submenu` (
  `sub_mnu_id` int(11) NOT NULL AUTO_INCREMENT,
  `min_mnu_id_fk` int(11) NOT NULL,
  `sub_mnu_name` text NOT NULL,
  `sub_mnu_desc` text NOT NULL,
  `sub_mnu_preference` int(11) NOT NULL,
  `status` varchar(1) DEFAULT NULL,
  `create_time` int(11) DEFAULT NULL,
  `create_user` int(11) DEFAULT NULL,
  `update_time` int(11) DEFAULT NULL,
  `update_user` int(11) DEFAULT NULL,
  `record_date` int(11) DEFAULT NULL,
  PRIMARY KEY (`sub_mnu_id`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cms_submenu`
--

LOCK TABLES `cms_submenu` WRITE;
/*!40000 ALTER TABLE `cms_submenu` DISABLE KEYS */;
INSERT INTO `cms_submenu` VALUES (1,1,'state','State Master',1,'1',1745646415,2,1745646415,NULL,1745605800),(2,1,'locationmaster','Location Master',2,'1',1745646415,2,1745646415,NULL,1745605800),(3,1,'locationmapping','Location Mapping',3,'1',1745646415,2,1745646415,NULL,1745605800),(4,1,'surveymaster','Surveymaster',4,'1',1745646415,2,1745646415,NULL,1745605800),(5,1,'applicationsettings','Application Settings',5,'1',1745646415,2,1745646415,NULL,1745605800),(6,1,'exportmaster','Export Master',6,'1',1745646415,2,1745646415,NULL,1745605800),(7,1,'fieldmaster','Field Master',7,'0',1745646415,2,1746554073,2,1745605800),(8,1,'staff','Staff Master',8,'0',1745646415,2,1746554085,2,1745605800),(9,2,'dg/create','Demographics',1,'1',1745646415,2,1745646415,NULL,1745605800),(10,2,'mdhl/create','Medical History and Lifestyle',2,'1',1745646415,2,1745646415,NULL,1745605800),(11,2,'apm/create','Anthropometric Measurements',3,'1',1745646415,2,1745646415,NULL,1745605800),(12,2,'vital/create','Vitals',4,'1',1745646415,2,1745646415,NULL,1745605800),(13,2,'bsr/create','Biological Sample Results',6,'1',1745646415,2,1746553976,2,1745605800),(14,2,'ce/create','Clinical Examination',5,'1',1745646415,2,1746553959,2,1745605800),(15,2,'cml/create','Case Management Linkages',7,'1',1745646415,2,1745646415,NULL,1745605800),(16,2,'fupm/create','Follow-Up and Monitoring',8,'1',1745646415,2,1745646415,NULL,1745605800),(17,2,'cprca/create','Community Perceptions and Root Cause Analysis',9,'1',1745646415,2,1745646415,NULL,1745605800),(18,2,'mortalityform/create','Mortality Form',10,'0',1745646415,2,1746097178,2,1745605800),(19,2,'trackingform/create','Client Tracking Form',11,'0',1745646415,2,1746097190,2,1745605800),(20,3,'mainmenu','Mainmenu',1,'1',1745646415,2,1745646415,NULL,1745605800),(21,3,'submenu','Submenu',2,'1',1745646415,2,1745646415,NULL,1745605800),(22,3,'users','User Creation',3,'1',1745646415,2,1745646415,NULL,1745605800),(23,3,'menuprivileges','User Privileges',4,'1',1745646415,2,1745646415,NULL,1745605800),(24,3,'export','Data Export - DMC',5,'1',1745646415,2,1745646415,NULL,1745605800),(25,3,'import','Data Import - DMC',6,'1',1745646415,2,1745646415,NULL,1745605800),(26,3,'settings','Main Settings',7,'1',1745646415,2,1745646415,NULL,1745605800),(27,2,'cchv','Climate Change and Health Vulnerabilities:',12,'1',1771585987,2,1771585987,NULL,1771525800);
/*!40000 ALTER TABLE `cms_submenu` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cms_surveymaster`
--

DROP TABLE IF EXISTS `cms_surveymaster`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cms_surveymaster` (
  `sur_id` int(11) NOT NULL AUTO_INCREMENT,
  `sur_code` text NOT NULL,
  `sur_title` text NOT NULL,
  `sur_url` text NOT NULL,
  `sur_onlne_id` text NOT NULL,
  `sur_pri_db_name` text NOT NULL,
  `sur_pri_db_server` text NOT NULL,
  `sur_pri_db_usrnme` text NOT NULL,
  `sur_pri_db_paswrd` blob NOT NULL,
  `sur_sec_db_name` text,
  `sur_sec_db_server` text,
  `sur_sec_db_usrnme` text,
  `sur_sec_db_paswrd` blob,
  `status` varchar(1) DEFAULT NULL,
  `create_time` int(11) DEFAULT NULL,
  `create_user` int(11) DEFAULT NULL,
  `update_time` int(11) DEFAULT NULL,
  `update_user` int(11) DEFAULT NULL,
  `record_date` int(11) DEFAULT NULL,
  PRIMARY KEY (`sur_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cms_surveymaster`
--

LOCK TABLES `cms_surveymaster` WRITE;
/*!40000 ALTER TABLE `cms_surveymaster` DISABLE KEYS */;
INSERT INTO `cms_surveymaster` VALUES (1,'NCD','SWASTH ABHIYAN','-','12345','ncd','localhost','yrgbs','YRGbs123','','','','','1',1745646415,2,1746078226,2,1745605800);
/*!40000 ALTER TABLE `cms_surveymaster` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cms_trackingform`
--

DROP TABLE IF EXISTS `cms_trackingform`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cms_trackingform` (
  `track_form_id` int(11) NOT NULL AUTO_INCREMENT,
  `track_form_survey` varchar(11) NOT NULL,
  `track_form_loc` varchar(11) NOT NULL,
  `track_form_part_id` varchar(100) NOT NULL,
  `track_form_q1` int(11) NOT NULL,
  `track_form_q2` varchar(100) NOT NULL,
  `track_form_q3` varchar(100) NOT NULL,
  `track_form_q4` int(11) NOT NULL,
  `track_form_q5` varchar(250) DEFAULT NULL,
  `status` varchar(1) DEFAULT NULL,
  `create_time` int(11) DEFAULT NULL,
  `create_user` int(11) DEFAULT NULL,
  `update_time` int(11) DEFAULT NULL,
  `update_user` int(11) DEFAULT NULL,
  `record_date` int(11) DEFAULT NULL,
  `loc_code` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`track_form_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cms_trackingform`
--

LOCK TABLES `cms_trackingform` WRITE;
/*!40000 ALTER TABLE `cms_trackingform` DISABLE KEYS */;
/*!40000 ALTER TABLE `cms_trackingform` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cms_userrole`
--

DROP TABLE IF EXISTS `cms_userrole`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cms_userrole` (
  `role_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `authorized_loc` varchar(100) DEFAULT NULL,
  `status` varchar(1) DEFAULT NULL,
  `create_time` int(11) DEFAULT NULL,
  `create_user` int(11) DEFAULT NULL,
  `update_time` int(11) DEFAULT NULL,
  `update_user` int(11) DEFAULT NULL,
  `record_date` int(11) DEFAULT NULL,
  PRIMARY KEY (`role_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cms_userrole`
--

LOCK TABLES `cms_userrole` WRITE;
/*!40000 ALTER TABLE `cms_userrole` DISABLE KEYS */;
INSERT INTO `cms_userrole` VALUES (3,3,'DH','1',1748601367,2,1748601367,NULL,1747852200),(4,1,'DH','1',1748601377,2,1748601377,NULL,1745605800),(5,2,'DH','1',1748601389,2,1748601389,NULL,1745605800),(6,4,'DH','1',1757331588,2,1757331588,NULL,1757269800);
/*!40000 ALTER TABLE `cms_userrole` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cms_users`
--

DROP TABLE IF EXISTS `cms_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cms_users` (
  `usr_id` int(11) NOT NULL AUTO_INCREMENT,
  `users_name` varchar(64) CHARACTER SET latin1 NOT NULL DEFAULT '',
  `password` longtext CHARACTER SET latin1 NOT NULL,
  `auth_key` varchar(64) CHARACTER SET latin1 NOT NULL,
  `password_reset_token` varchar(255) CHARACTER SET latin1 DEFAULT NULL,
  `full_name` varchar(50) CHARACTER SET latin1 NOT NULL,
  `email` varchar(320) CHARACTER SET latin1 DEFAULT NULL,
  `status` varchar(1) CHARACTER SET latin1 DEFAULT NULL,
  `create_time` int(11) DEFAULT NULL,
  `create_user` int(11) DEFAULT NULL,
  `update_time` int(11) DEFAULT NULL,
  `update_user` int(11) DEFAULT NULL,
  `user_type` int(11) DEFAULT NULL,
  `record_date` int(11) DEFAULT NULL,
  `loc_code` text CHARACTER SET latin1,
  `signedin_loc` varchar(50) CHARACTER SET latin1 DEFAULT NULL,
  `state_code` varchar(50) CHARACTER SET latin1 DEFAULT NULL,
  `user_role` smallint(6) DEFAULT NULL,
  PRIMARY KEY (`usr_id`),
  UNIQUE KEY `users_name` (`users_name`)
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cms_users`
--

LOCK TABLES `cms_users` WRITE;
/*!40000 ALTER TABLE `cms_users` DISABLE KEYS */;
INSERT INTO `cms_users` VALUES (1,'Admin','09c99a8ee810a156b60f1aa6ff1f3424','TEsvrTcu9hDQUk7_NJDPUolyA7Fu0zFU','','Santhanam Anand','anand@yrgcare.org','1',1745646415,2,1748601377,2,0,1745605800,'DH','DH','MH',1),(2,'Administrator','ebfaf968ba8e04d258014462075c8128','TEsvrTcu9hDQUk7_NJDPUolyA7Fu0zFU','','Santhanam Anand','anand@yrgcare.org','1',1745646415,2,1748601389,2,0,1745605800,'DH','DH','MH',1),(3,'DEO','b6021989509396b1aebbd448f81fd400','45Lw4_uWkvtQfEOSGN0doQExB4aZK5vy',NULL,'DATA ENTRY OPERATOR','','1',1747916396,2,1748601367,2,NULL,1747852200,'DH','DH','MH',3),(4,'AUDIT','c33367701511b4f6020ec61ded352059','KRWJSb0HMeaPwDEkmMYaqCjmtK6VARVt',NULL,'AUDIT','','1',1757331588,2,1757331588,NULL,NULL,1757269800,'DH','DH','MH',1);
/*!40000 ALTER TABLE `cms_users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cms_vital`
--

DROP TABLE IF EXISTS `cms_vital`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cms_vital` (
  `vital_id` int(11) NOT NULL AUTO_INCREMENT,
  `vital_survey` varchar(11) NOT NULL,
  `vital_loc` varchar(11) NOT NULL,
  `vital_date` int(11) NOT NULL,
  `vital_pid` varchar(50) NOT NULL,
  `vital_bp_systolic` smallint(6) DEFAULT NULL,
  `vital_bp_diastolic` smallint(6) DEFAULT NULL,
  `vital_pulse_rate` smallint(6) DEFAULT NULL,
  `vital_spo2` smallint(6) DEFAULT NULL,
  `status` varchar(1) DEFAULT NULL,
  `create_time` int(11) DEFAULT NULL,
  `create_user` smallint(6) DEFAULT NULL,
  `update_time` int(11) DEFAULT NULL,
  `update_user` smallint(6) DEFAULT NULL,
  `record_date` int(11) DEFAULT NULL,
  `loc_code` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`vital_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3414 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cms_vital`
--

LOCK TABLES `cms_vital` WRITE;
/*!40000 ALTER TABLE `cms_vital` DISABLE KEYS */;
/*!40000 ALTER TABLE `cms_vital` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary table structure for view `v_allforms`
--

DROP TABLE IF EXISTS `v_allforms`;
/*!50001 DROP VIEW IF EXISTS `v_allforms`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE TABLE `v_allforms` (
  `pid` tinyint NOT NULL,
  `location` tinyint NOT NULL,
  `visit_date` tinyint NOT NULL,
  `dg_geographical_area` tinyint NOT NULL,
  `dg_q1` tinyint NOT NULL,
  `dg_q2` tinyint NOT NULL,
  `dg_q3` tinyint NOT NULL,
  `dg_q4` tinyint NOT NULL,
  `dg_q4a` tinyint NOT NULL,
  `dg_q5` tinyint NOT NULL,
  `mdhl_q6` tinyint NOT NULL,
  `mdhl_q6a` tinyint NOT NULL,
  `mdhl_q7` tinyint NOT NULL,
  `mdhl_q7a` tinyint NOT NULL,
  `mdhl_q7b` tinyint NOT NULL,
  `mdhl_q8` tinyint NOT NULL,
  `mdhl_q8a` tinyint NOT NULL,
  `mdhl_q9` tinyint NOT NULL,
  `mdhl_q9a` tinyint NOT NULL,
  `mdhl_q10` tinyint NOT NULL,
  `mdhl_q11` tinyint NOT NULL,
  `mdhl_q12` tinyint NOT NULL,
  `mdhl_q13a` tinyint NOT NULL,
  `mdhl_q13b` tinyint NOT NULL,
  `gad_q1` tinyint NOT NULL,
  `gad_q2` tinyint NOT NULL,
  `gad_q3` tinyint NOT NULL,
  `gad_q4` tinyint NOT NULL,
  `gad_q5` tinyint NOT NULL,
  `gad_q6` tinyint NOT NULL,
  `gad_q7` tinyint NOT NULL,
  `gad_q8` tinyint NOT NULL,
  `gad_tot_score` tinyint NOT NULL,
  `gad_anxiety_severity` tinyint NOT NULL,
  `mdhl_q14a` tinyint NOT NULL,
  `mdhl_q14b` tinyint NOT NULL,
  `phq_q1` tinyint NOT NULL,
  `phq_q2` tinyint NOT NULL,
  `phq_q3` tinyint NOT NULL,
  `phq_q4` tinyint NOT NULL,
  `phq_q5` tinyint NOT NULL,
  `phq_q6` tinyint NOT NULL,
  `phq_q7` tinyint NOT NULL,
  `phq_q8` tinyint NOT NULL,
  `phq_q9` tinyint NOT NULL,
  `phq_q10` tinyint NOT NULL,
  `phq_tot_score` tinyint NOT NULL,
  `phq_depression_severity` tinyint NOT NULL,
  `mdhl_q15` tinyint NOT NULL,
  `mdhl_q16` tinyint NOT NULL,
  `mdhl_q17` tinyint NOT NULL,
  `mdhl_q18` tinyint NOT NULL,
  `mdhl_q18a` tinyint NOT NULL,
  `mdhl_q18b` tinyint NOT NULL,
  `apm_q19` tinyint NOT NULL,
  `apm_q20` tinyint NOT NULL,
  `apm_q21` tinyint NOT NULL,
  `apm_q22` tinyint NOT NULL,
  `apm_q23` tinyint NOT NULL,
  `apm_q24` tinyint NOT NULL,
  `vital_pulse_rate_q25` tinyint NOT NULL,
  `vital_bp_systolic_q26` tinyint NOT NULL,
  `vital_bp_diastolic_q26` tinyint NOT NULL,
  `vital_spo2_q27` tinyint NOT NULL,
  `ce_q28` tinyint NOT NULL,
  `ce_q29` tinyint NOT NULL,
  `ce_q30` tinyint NOT NULL,
  `ce_q31a` tinyint NOT NULL,
  `ce_q31b` tinyint NOT NULL,
  `ce_q32a` tinyint NOT NULL,
  `ce_q32b` tinyint NOT NULL,
  `ce_q33` tinyint NOT NULL,
  `ce_q33a` tinyint NOT NULL,
  `bsr_random_sugar_q34` tinyint NOT NULL,
  `bsr_tot_cholesterol_q35` tinyint NOT NULL,
  `bsr_triglycerides_q36` tinyint NOT NULL,
  `bsr_hdl_q37` tinyint NOT NULL,
  `bsr_ldl_q38` tinyint NOT NULL,
  `bsr_creatinine_q39` tinyint NOT NULL,
  `bsr_urea_q40` tinyint NOT NULL,
  `bsr_tot_bilirubin_q41` tinyint NOT NULL,
  `bsr_sgot_q42` tinyint NOT NULL,
  `bsr_sgpt_q43` tinyint NOT NULL,
  `bsr_tot_protein_q44` tinyint NOT NULL,
  `bsr_albumin_q45` tinyint NOT NULL,
  `cml_q46` tinyint NOT NULL,
  `cml_q46a` tinyint NOT NULL,
  `cml_q47` tinyint NOT NULL,
  `cml_q47_date` tinyint NOT NULL,
  `cml_q48` tinyint NOT NULL,
  `cml_q49` tinyint NOT NULL,
  `cml_q49a` tinyint NOT NULL,
  `fupm_q50` tinyint NOT NULL,
  `fupm_fupdate1` tinyint NOT NULL,
  `fupm_fupremarks1` tinyint NOT NULL,
  `fupm_fupdate2` tinyint NOT NULL,
  `fupm_fupremarks2` tinyint NOT NULL,
  `fupm_fupdate3` tinyint NOT NULL,
  `fupm_fupremarks3` tinyint NOT NULL,
  `cprca_q51` tinyint NOT NULL,
  `cprca_q52` tinyint NOT NULL
) ENGINE=MyISAM */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_formstatus`
--

DROP TABLE IF EXISTS `v_formstatus`;
/*!50001 DROP VIEW IF EXISTS `v_formstatus`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE TABLE `v_formstatus` (
  `pid` tinyint NOT NULL,
  `dg_date` tinyint NOT NULL,
  `apm_pid` tinyint NOT NULL,
  `bsr_pid` tinyint NOT NULL,
  `ce_pid` tinyint NOT NULL,
  `cml_pid` tinyint NOT NULL,
  `cprca_pid` tinyint NOT NULL,
  `fupm_pid` tinyint NOT NULL,
  `mdhl_pid` tinyint NOT NULL,
  `vital_pid` tinyint NOT NULL
) ENGINE=MyISAM */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_formsummary`
--

DROP TABLE IF EXISTS `v_formsummary`;
/*!50001 DROP VIEW IF EXISTS `v_formsummary`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE TABLE `v_formsummary` (
  `dg` tinyint NOT NULL,
  `apm` tinyint NOT NULL,
  `bsr` tinyint NOT NULL,
  `ce` tinyint NOT NULL,
  `cml` tinyint NOT NULL,
  `cprca` tinyint NOT NULL,
  `fupm` tinyint NOT NULL,
  `mdhl` tinyint NOT NULL,
  `vital` tinyint NOT NULL
) ENGINE=MyISAM */;
SET character_set_client = @saved_cs_client;

--
-- Final view structure for view `v_allforms`
--

/*!50001 DROP TABLE IF EXISTS `v_allforms`*/;
/*!50001 DROP VIEW IF EXISTS `v_allforms`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_allforms` AS select distinct `cms_dg`.`dg_pid` AS `pid`,`cms_locationmaster`.`loc_name` AS `location`,`cms_dg`.`dg_date` AS `visit_date`,`cms_dg`.`dg_geographical_area` AS `dg_geographical_area`,`cms_dg`.`dg_q1` AS `dg_q1`,`cms_dg`.`dg_q2` AS `dg_q2`,`cms_dg`.`dg_q3` AS `dg_q3`,`cms_dg`.`dg_q4` AS `dg_q4`,`cms_dg`.`dg_q4a` AS `dg_q4a`,`cms_dg`.`dg_q5` AS `dg_q5`,`cms_mdhl`.`mdhl_q6` AS `mdhl_q6`,`cms_mdhl`.`mdhl_q6a` AS `mdhl_q6a`,`cms_mdhl`.`mdhl_q7` AS `mdhl_q7`,`cms_mdhl`.`mdhl_q7a` AS `mdhl_q7a`,`cms_mdhl`.`mdhl_q7b` AS `mdhl_q7b`,`cms_mdhl`.`mdhl_q8` AS `mdhl_q8`,`cms_mdhl`.`mdhl_q8a` AS `mdhl_q8a`,`cms_mdhl`.`mdhl_q9` AS `mdhl_q9`,`cms_mdhl`.`mdhl_q9a` AS `mdhl_q9a`,`cms_mdhl`.`mdhl_q10` AS `mdhl_q10`,`cms_mdhl`.`mdhl_q11` AS `mdhl_q11`,`cms_mdhl`.`mdhl_q12` AS `mdhl_q12`,`cms_mdhl`.`mdhl_q13a` AS `mdhl_q13a`,`cms_mdhl`.`mdhl_q13b` AS `mdhl_q13b`,`cms_mdhl`.`gad_q1` AS `gad_q1`,`cms_mdhl`.`gad_q2` AS `gad_q2`,`cms_mdhl`.`gad_q3` AS `gad_q3`,`cms_mdhl`.`gad_q4` AS `gad_q4`,`cms_mdhl`.`gad_q5` AS `gad_q5`,`cms_mdhl`.`gad_q6` AS `gad_q6`,`cms_mdhl`.`gad_q7` AS `gad_q7`,`cms_mdhl`.`gad_q8` AS `gad_q8`,`cms_mdhl`.`gad_tot_score` AS `gad_tot_score`,`cms_mdhl`.`gad_anxiety_severity` AS `gad_anxiety_severity`,`cms_mdhl`.`mdhl_q15a` AS `mdhl_q14a`,`cms_mdhl`.`mdhl_q15b` AS `mdhl_q14b`,`cms_mdhl`.`phq_q1` AS `phq_q1`,`cms_mdhl`.`phq_q2` AS `phq_q2`,`cms_mdhl`.`phq_q3` AS `phq_q3`,`cms_mdhl`.`phq_q4` AS `phq_q4`,`cms_mdhl`.`phq_q5` AS `phq_q5`,`cms_mdhl`.`phq_q6` AS `phq_q6`,`cms_mdhl`.`phq_q7` AS `phq_q7`,`cms_mdhl`.`phq_q8` AS `phq_q8`,`cms_mdhl`.`phq_q9` AS `phq_q9`,`cms_mdhl`.`phq_q10` AS `phq_q10`,`cms_mdhl`.`phq_tot_score` AS `phq_tot_score`,`cms_mdhl`.`phq_depression_severity` AS `phq_depression_severity`,`cms_mdhl`.`mdhl_q16` AS `mdhl_q15`,`cms_mdhl`.`mdhl_q17` AS `mdhl_q16`,`cms_mdhl`.`mdhl_q18` AS `mdhl_q17`,`cms_mdhl`.`mdhl_q19` AS `mdhl_q18`,`cms_mdhl`.`mdhl_q19a` AS `mdhl_q18a`,`cms_mdhl`.`mdhl_q19b` AS `mdhl_q18b`,`cms_apm`.`apm_q1` AS `apm_q19`,`cms_apm`.`apm_q2` AS `apm_q20`,`cms_apm`.`apm_q3` AS `apm_q21`,`cms_apm`.`apm_q4` AS `apm_q22`,`cms_apm`.`apm_q5` AS `apm_q23`,`cms_apm`.`apm_q6` AS `apm_q24`,`cms_vital`.`vital_pulse_rate` AS `vital_pulse_rate_q25`,`cms_vital`.`vital_bp_systolic` AS `vital_bp_systolic_q26`,`cms_vital`.`vital_bp_diastolic` AS `vital_bp_diastolic_q26`,`cms_vital`.`vital_spo2` AS `vital_spo2_q27`,`cms_ce`.`ce_q1` AS `ce_q28`,`cms_ce`.`ce_q2` AS `ce_q29`,`cms_ce`.`ce_q3` AS `ce_q30`,`cms_ce`.`ce_q4a` AS `ce_q31a`,`cms_ce`.`ce_q4b` AS `ce_q31b`,`cms_ce`.`ce_q5a` AS `ce_q32a`,`cms_ce`.`ce_q5b` AS `ce_q32b`,`cms_ce`.`ce_q6` AS `ce_q33`,`cms_ce`.`ce_q6a` AS `ce_q33a`,`cms_bsr`.`bsr_random_sugar` AS `bsr_random_sugar_q34`,`cms_bsr`.`bsr_tot_cholesterol` AS `bsr_tot_cholesterol_q35`,`cms_bsr`.`bsr_triglycerides` AS `bsr_triglycerides_q36`,`cms_bsr`.`bsr_hdl` AS `bsr_hdl_q37`,`cms_bsr`.`bsr_ldl` AS `bsr_ldl_q38`,`cms_bsr`.`bsr_creatinine` AS `bsr_creatinine_q39`,`cms_bsr`.`bsr_urea` AS `bsr_urea_q40`,`cms_bsr`.`bsr_tot_bilirubin` AS `bsr_tot_bilirubin_q41`,`cms_bsr`.`bsr_sgot` AS `bsr_sgot_q42`,`cms_bsr`.`bsr_sgpt` AS `bsr_sgpt_q43`,`cms_bsr`.`bsr_tot_protein` AS `bsr_tot_protein_q44`,`cms_bsr`.`bsr_albumin` AS `bsr_albumin_q45`,`cms_cml`.`cml_q2` AS `cml_q46`,`cms_cml`.`cml_q2a` AS `cml_q46a`,`cms_cml`.`cml_q4` AS `cml_q47`,`cms_cml`.`cml_q4_date` AS `cml_q47_date`,`cms_cml`.`cml_q5` AS `cml_q48`,`cms_cml`.`cml_q6` AS `cml_q49`,`cms_cml`.`cml_q6a` AS `cml_q49a`,`cms_fupm`.`fupm_q7` AS `fupm_q50`,`cms_fupm`.`fupm_fupdate1` AS `fupm_fupdate1`,`cms_fupm`.`fupm_fupremarks1` AS `fupm_fupremarks1`,`cms_fupm`.`fupm_fupdate2` AS `fupm_fupdate2`,`cms_fupm`.`fupm_fupremarks2` AS `fupm_fupremarks2`,`cms_fupm`.`fupm_fupdate3` AS `fupm_fupdate3`,`cms_fupm`.`fupm_fupremarks3` AS `fupm_fupremarks3`,`cms_cprca`.`cprca_q8` AS `cprca_q51`,`cms_cprca`.`cprca_q9` AS `cprca_q52` from (((((((((`cms_dg` left join `cms_apm` on((`cms_dg`.`dg_pid` = `cms_apm`.`apm_pid`))) left join `cms_bsr` on((`cms_dg`.`dg_pid` = `cms_bsr`.`bsr_pid`))) left join `cms_ce` on((`cms_dg`.`dg_pid` = `cms_ce`.`ce_pid`))) left join `cms_cml` on((`cms_dg`.`dg_pid` = `cms_cml`.`cml_pid`))) left join `cms_cprca` on((`cms_dg`.`dg_pid` = `cms_cprca`.`cprca_pid`))) left join `cms_fupm` on((`cms_dg`.`dg_pid` = `cms_fupm`.`fupm_pid`))) left join `cms_mdhl` on((`cms_dg`.`dg_pid` = `cms_mdhl`.`mdhl_pid`))) left join `cms_vital` on((`cms_dg`.`dg_pid` = `cms_vital`.`vital_pid`))) join `cms_locationmaster` on((`cms_dg`.`loc_code` = `cms_locationmaster`.`loc_code`))) order by `cms_dg`.`dg_pid` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_formstatus`
--

/*!50001 DROP TABLE IF EXISTS `v_formstatus`*/;
/*!50001 DROP VIEW IF EXISTS `v_formstatus`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 VIEW `v_formstatus` AS select `cms_dg`.`dg_pid` AS `pid`,max(`cms_dg`.`dg_date`) AS `dg_date`,(case when (max(`cms_apm`.`apm_pid`) is not null) then 1 else 0 end) AS `apm_pid`,(case when (max(`cms_bsr`.`bsr_pid`) is not null) then 1 else 0 end) AS `bsr_pid`,(case when (max(`cms_ce`.`ce_pid`) is not null) then 1 else 0 end) AS `ce_pid`,(case when (max(`cms_cml`.`cml_pid`) is not null) then 1 else 0 end) AS `cml_pid`,(case when (max(`cms_cprca`.`cprca_pid`) is not null) then 1 else 0 end) AS `cprca_pid`,(case when (max(`cms_fupm`.`fupm_pid`) is not null) then 1 else 0 end) AS `fupm_pid`,(case when (max(`cms_mdhl`.`mdhl_pid`) is not null) then 1 else 0 end) AS `mdhl_pid`,(case when (max(`cms_vital`.`vital_pid`) is not null) then 1 else 0 end) AS `vital_pid` from ((((((((`cms_dg` left join `cms_apm` on((`cms_dg`.`dg_pid` = `cms_apm`.`apm_pid`))) left join `cms_bsr` on((`cms_dg`.`dg_pid` = `cms_bsr`.`bsr_pid`))) left join `cms_ce` on((`cms_dg`.`dg_pid` = `cms_ce`.`ce_pid`))) left join `cms_cml` on((`cms_dg`.`dg_pid` = `cms_cml`.`cml_pid`))) left join `cms_cprca` on((`cms_dg`.`dg_pid` = `cms_cprca`.`cprca_pid`))) left join `cms_fupm` on((`cms_dg`.`dg_pid` = `cms_fupm`.`fupm_pid`))) left join `cms_mdhl` on((`cms_dg`.`dg_pid` = `cms_mdhl`.`mdhl_pid`))) left join `cms_vital` on((`cms_dg`.`dg_pid` = `cms_vital`.`vital_pid`))) group by `cms_dg`.`dg_pid` order by `cms_dg`.`dg_pid` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_formsummary`
--

/*!50001 DROP TABLE IF EXISTS `v_formsummary`*/;
/*!50001 DROP VIEW IF EXISTS `v_formsummary`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_formsummary` AS select count(`v_formstatus`.`pid`) AS `dg`,sum(`v_formstatus`.`apm_pid`) AS `apm`,sum(`v_formstatus`.`bsr_pid`) AS `bsr`,sum(`v_formstatus`.`ce_pid`) AS `ce`,sum(`v_formstatus`.`cml_pid`) AS `cml`,sum(`v_formstatus`.`cprca_pid`) AS `cprca`,sum(`v_formstatus`.`fupm_pid`) AS `fupm`,sum(`v_formstatus`.`mdhl_pid`) AS `mdhl`,sum(`v_formstatus`.`vital_pid`) AS `vital` from `v_formstatus` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-02 17:18:49
