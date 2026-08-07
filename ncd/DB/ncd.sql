-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 07, 2025 at 12:11 PM
-- Server version: 10.4.25-MariaDB
-- PHP Version: 7.4.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ncd`
--

-- --------------------------------------------------------

--
-- Table structure for table `cms_apm`
--

DROP TABLE IF EXISTS `cms_apm`;
CREATE TABLE `cms_apm` (
  `apm_id` int(11) NOT NULL,
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
  `loc_code` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `cms_appsettings`
--

DROP TABLE IF EXISTS `cms_appsettings`;
CREATE TABLE `cms_appsettings` (
  `app_stngs_id` int(11) NOT NULL,
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
  `update_user` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `cms_appsettings`
--

INSERT INTO `cms_appsettings` (`app_stngs_id`, `app_survey_id`, `app_coupons`, `app_incentive`, `app_control_site`, `app_idu`, `app_fin_yr`, `app_fin_yr_fixed`, `app_reimbsmnt_vchr`, `app_reimbsmnt_vchr_fixed`, `app_location`, `app_location_fixed`, `app_cupn_cde_fixed`, `app_no_of_coupon`, `app_no_of_coupon_fixed`, `app_cupn_prd`, `app_cupn_prd_type`, `app_cupn_prd_fixed`, `app_incentive_amt`, `app_incentive_amt_fixed`, `app_incentive_vchr`, `app_incentive_vchr_fixed`, `app_ost_fixed`, `status`, `create_time`, `create_user`, `update_time`, `update_user`) VALUES
(1, 'NCD', '0', '0', '0', '1', '2526', '1', NULL, NULL, 'DH', '1', '0', '', '0', '', '', '0', '', '0', NULL, NULL, '0', '1', 1745646415, 2, 1746011222, 2);

-- --------------------------------------------------------

--
-- Table structure for table `cms_attandance`
--

DROP TABLE IF EXISTS `cms_attandance`;
CREATE TABLE `cms_attandance` (
  `id` int(11) NOT NULL,
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
  `loc_code` varchar(50) DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

--
-- Triggers `cms_attandance`
--
DROP TRIGGER IF EXISTS `attandance_update_trigger`;
DELIMITER $$
CREATE TRIGGER `attandance_update_trigger` BEFORE INSERT ON `cms_attandance` FOR EACH ROW BEGIN





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





     


	


 


END
$$
DELIMITER ;
DROP TRIGGER IF EXISTS `trig_cms_attandance_INSERT`;
DELIMITER $$
CREATE TRIGGER `trig_cms_attandance_INSERT` AFTER INSERT ON `cms_attandance` FOR EACH ROW BEGIN








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





INSERT INTO cms_ostvisit(ost_visit_survey,ost_visit_loc,ost_visit_part_id,ost_visit_q1,ost_visit_q2,ost_visit_q3,ost_visit_q4,ost_visit_q5,ost_visit_q6,ost_visit_q7,status,create_time,create_user,update_time,update_user,record_date,loc_code,ost_visit_q8,update_allow_flag) VALUES(NEW.sid,NEW.location,NEW.pid,@ostvisit_q1,@ostvisit_q2,@ostvisit_q3,@ostvisit_q4,@ostvisit_q5,'',NEW.record_date,NEW.status,NEW.create_time,NEW.create_user,NEW.update_time,NEW.update_user,NEW.record_date,NEW.loc_code,1,1);





END IF;








END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `cms_bsr`
--

DROP TABLE IF EXISTS `cms_bsr`;
CREATE TABLE `cms_bsr` (
  `bsr_id` int(11) NOT NULL,
  `bsr_survey` varchar(11) NOT NULL,
  `bsr_loc` varchar(11) NOT NULL,
  `bsr_date` int(11) NOT NULL,
  `bsr_pid` varchar(50) NOT NULL,
  `bsr_random_sugar` smallint(6) DEFAULT NULL,
  `bsr_tot_cholesterol` smallint(6) DEFAULT NULL,
  `bsr_triglycerides` smallint(6) DEFAULT NULL,
  `bsr_hdl` smallint(6) DEFAULT NULL,
  `bsr_ldl` smallint(6) DEFAULT NULL,
  `bsr_creatinine` decimal(10,2) DEFAULT NULL,
  `bsr_urea` smallint(6) DEFAULT NULL,
  `bsr_tot_bilirubin` decimal(10,2) DEFAULT NULL,
  `bsr_sgot` smallint(6) DEFAULT NULL,
  `bsr_sgpt` smallint(6) DEFAULT NULL,
  `bsr_tot_protein` decimal(10,2) DEFAULT NULL,
  `bsr_albumin` decimal(10,2) DEFAULT NULL,
  `status` varchar(1) DEFAULT NULL,
  `create_time` int(11) DEFAULT NULL,
  `create_user` smallint(6) DEFAULT NULL,
  `update_time` int(11) DEFAULT NULL,
  `update_user` smallint(6) DEFAULT NULL,
  `record_date` int(11) DEFAULT NULL,
  `loc_code` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `cms_ce`
--

DROP TABLE IF EXISTS `cms_ce`;
CREATE TABLE `cms_ce` (
  `ce_id` int(11) NOT NULL,
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
  `loc_code` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `cms_clientidref`
--

DROP TABLE IF EXISTS `cms_clientidref`;
CREATE TABLE `cms_clientidref` (
  `clientid_ref_sur` varchar(11) NOT NULL COMMENT 'Survey',
  `clientid_ref_loc` varchar(11) NOT NULL COMMENT 'Location',
  `clientid_ref_code` int(11) NOT NULL COMMENT 'Last Client id Number',
  `record_date` int(11) DEFAULT NULL,
  `update_time` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `cms_cml`
--

DROP TABLE IF EXISTS `cms_cml`;
CREATE TABLE `cms_cml` (
  `cml_id` int(11) NOT NULL,
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
  `loc_code` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `cms_cprca`
--

DROP TABLE IF EXISTS `cms_cprca`;
CREATE TABLE `cms_cprca` (
  `cprca_id` int(11) NOT NULL,
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
  `loc_code` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `cms_dg`
--

DROP TABLE IF EXISTS `cms_dg`;
CREATE TABLE `cms_dg` (
  `dg_id` int(11) NOT NULL,
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
  `status` varchar(1) DEFAULT NULL,
  `create_time` int(11) DEFAULT NULL,
  `create_user` smallint(6) DEFAULT NULL,
  `update_time` int(11) DEFAULT NULL,
  `update_user` smallint(6) DEFAULT NULL,
  `record_date` int(11) DEFAULT NULL,
  `loc_code` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `cms_fieldmaster`
--

DROP TABLE IF EXISTS `cms_fieldmaster`;
CREATE TABLE `cms_fieldmaster` (
  `fld_mstr_id` int(11) NOT NULL,
  `fld_mstr_frmfield` varchar(300) NOT NULL COMMENT 'Form Field',
  `fld_mstr_code` varchar(300) NOT NULL COMMENT 'Code',
  `fld_mstr_desc` varchar(300) NOT NULL COMMENT 'Description',
  `status` varchar(1) DEFAULT NULL,
  `create_time` int(11) DEFAULT NULL,
  `create_user` int(11) DEFAULT NULL,
  `update_time` int(11) DEFAULT NULL,
  `update_user` int(11) DEFAULT NULL,
  `record_date` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `cms_fupm`
--

DROP TABLE IF EXISTS `cms_fupm`;
CREATE TABLE `cms_fupm` (
  `fupm_id` int(11) NOT NULL,
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
  `loc_code` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `cms_locationmapping`
--

DROP TABLE IF EXISTS `cms_locationmapping`;
CREATE TABLE `cms_locationmapping` (
  `loc_mapng_id` int(11) NOT NULL,
  `loc_mapng_sur_id` varchar(11) NOT NULL COMMENT 'Survey',
  `loc_mapng_mstr_id` varchar(11) NOT NULL COMMENT 'Location',
  `status` varchar(1) DEFAULT NULL,
  `create_time` int(11) DEFAULT NULL,
  `create_user` int(11) DEFAULT NULL,
  `update_time` int(11) DEFAULT NULL,
  `update_user` int(11) DEFAULT NULL,
  `record_date` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `cms_locationmapping`
--

INSERT INTO `cms_locationmapping` (`loc_mapng_id`, `loc_mapng_sur_id`, `loc_mapng_mstr_id`, `status`, `create_time`, `create_user`, `update_time`, `update_user`, `record_date`) VALUES
(1, 'NCD', 'DH', '1', 1745646415, 2, 1745648195, 2, 1745605800);

-- --------------------------------------------------------

--
-- Table structure for table `cms_locationmaster`
--

DROP TABLE IF EXISTS `cms_locationmaster`;
CREATE TABLE `cms_locationmaster` (
  `loc_id` int(11) NOT NULL,
  `loc_code` varchar(20) NOT NULL COMMENT 'Location Code',
  `loc_name` varchar(255) NOT NULL COMMENT 'Location Name',
  `state_code` varchar(10) DEFAULT NULL,
  `status` varchar(1) DEFAULT NULL,
  `del_status` int(11) NOT NULL,
  `create_time` int(11) DEFAULT NULL,
  `create_user` int(11) DEFAULT NULL,
  `update_time` int(11) DEFAULT NULL,
  `update_user` int(11) DEFAULT NULL,
  `record_date` int(11) DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

--
-- Dumping data for table `cms_locationmaster`
--

INSERT INTO `cms_locationmaster` (`loc_id`, `loc_code`, `loc_name`, `state_code`, `status`, `del_status`, `create_time`, `create_user`, `update_time`, `update_user`, `record_date`) VALUES
(1, 'DH', 'Dharavi', 'MH', '1', 0, 1745646415, 2, 1745646415, NULL, 1745605800);

-- --------------------------------------------------------

--
-- Table structure for table `cms_mainmenu`
--

DROP TABLE IF EXISTS `cms_mainmenu`;
CREATE TABLE `cms_mainmenu` (
  `min_mnu_id` int(11) NOT NULL,
  `min_mnu_name` text NOT NULL,
  `min_mnu_desc` text NOT NULL,
  `min_mnu_preference` int(11) NOT NULL,
  `status` varchar(1) DEFAULT NULL,
  `create_time` int(11) DEFAULT NULL,
  `create_user` int(11) DEFAULT NULL,
  `update_time` int(11) DEFAULT NULL,
  `update_user` int(11) DEFAULT NULL,
  `record_date` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `cms_mainmenu`
--

INSERT INTO `cms_mainmenu` (`min_mnu_id`, `min_mnu_name`, `min_mnu_desc`, `min_mnu_preference`, `status`, `create_time`, `create_user`, `update_time`, `update_user`, `record_date`) VALUES
(1, 'master', 'Masters', 1, '1', 1745646415, 2, 1745646415, NULL, 1745605800),
(2, 'DE', 'Data Entry Forms', 2, '1', 1745646415, 2, 1745646415, NULL, 1745605800),
(3, 'administrator', 'Admin', 5, '1', 1745646415, 2, 1745646415, NULL, 1745605800),
(4, 'reports', 'Reports', 3, '1', 1745646415, 2, 1745646415, NULL, 1745605800),
(5, 'Export', 'Data Export', 4, '1', 1745646415, 2, 1745646415, NULL, 1745605800);

-- --------------------------------------------------------

--
-- Table structure for table `cms_mdhl`
--

DROP TABLE IF EXISTS `cms_mdhl`;
CREATE TABLE `cms_mdhl` (
  `mdhl_id` int(11) NOT NULL,
  `mdhl_survey` varchar(11) NOT NULL,
  `mdhl_loc` varchar(11) NOT NULL,
  `mdhl_date` int(11) NOT NULL,
  `mdhl_pid` varchar(50) NOT NULL,
  `mdhl_q6` varchar(50) DEFAULT NULL,
  `mdhl_q6a` varchar(50) DEFAULT NULL,
  `mdhl_q7` smallint(6) DEFAULT NULL,
  `mdhl_q7a` varchar(50) DEFAULT NULL,
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
  `mdhl_q19a` smallint(6) DEFAULT NULL,
  `mdhl_q19b` varchar(50) DEFAULT NULL,
  `status` varchar(1) DEFAULT NULL,
  `create_time` int(11) DEFAULT NULL,
  `create_user` smallint(6) DEFAULT NULL,
  `update_time` int(11) DEFAULT NULL,
  `update_user` smallint(6) DEFAULT NULL,
  `record_date` int(11) DEFAULT NULL,
  `loc_code` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `cms_menuprivileges`
--

DROP TABLE IF EXISTS `cms_menuprivileges`;
CREATE TABLE `cms_menuprivileges` (
  `mnu_acs_id` int(11) NOT NULL,
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
  `record_date` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `cms_menuprivileges`
--

INSERT INTO `cms_menuprivileges` (`mnu_acs_id`, `mnu_acs_usr_id_fk`, `mnu_acs_mnu_id_fk`, `mnu_acs_sub_mnu_id_fk`, `mnu_acs_usr_status`, `mnu_acs_add`, `mnu_acs_edit`, `mnu_acs_delete`, `status`, `create_time`, `create_user`, `update_time`, `update_user`, `record_date`) VALUES
(1, 2, 1, 1, 1, 1, 1, 1, '1', 1745646415, 2, 1745646415, NULL, 1745605800),
(2, 2, 1, 2, 1, 1, 1, 1, '1', 1745646415, 2, 1745646415, NULL, 1745605800),
(3, 2, 1, 3, 1, 1, 1, 1, '1', 1745646415, 2, 1745646415, NULL, 1745605800),
(4, 2, 1, 4, 1, 1, 1, 1, '1', 1745646415, 2, 1745646415, NULL, 1745605800),
(5, 2, 1, 5, 1, 1, 1, 1, '1', 1745646415, 2, 1745646415, NULL, 1745605800),
(6, 2, 1, 6, 1, 1, 1, 1, '1', 1745646415, 2, 1745646415, NULL, 1745605800),
(7, 2, 1, 7, 1, 1, 1, 1, '1', 1745646415, 2, 1745646415, NULL, 1745605800),
(8, 2, 1, 8, 1, 1, 1, 1, '1', 1745646415, 2, 1745646415, NULL, 1745605800),
(9, 2, 2, 9, 1, 1, 1, 1, '1', 1745646415, 2, 1745646415, NULL, 1745605800),
(10, 2, 2, 10, 1, 1, 1, 1, '1', 1745646415, 2, 1745646415, NULL, 1745605800),
(11, 2, 2, 11, 1, 1, 1, 1, '1', 1745646415, 2, 1745646415, NULL, 1745605800),
(12, 2, 2, 12, 1, 1, 1, 1, '1', 1745646415, 2, 1745646415, NULL, 1745605800),
(13, 2, 2, 13, 1, 1, 1, 1, '1', 1745646415, 2, 1745646415, NULL, 1745605800),
(14, 2, 2, 14, 1, 1, 1, 1, '1', 1745646415, 2, 1745646415, NULL, 1745605800),
(15, 2, 2, 15, 1, 1, 1, 1, '1', 1745646415, 2, 1745646415, NULL, 1745605800),
(16, 2, 2, 16, 1, 1, 1, 1, '1', 1745646415, 2, 1745646415, NULL, 1745605800),
(17, 2, 2, 17, 1, 1, 1, 1, '1', 1745646415, 2, 1745646415, NULL, 1745605800),
(18, 2, 2, 18, 1, 1, 1, 1, '1', 1745646415, 2, 1745646415, NULL, 1745605800),
(19, 2, 2, 19, 1, 1, 1, 1, '1', 1745646415, 2, 1745646415, NULL, 1745605800),
(20, 2, 3, 20, 1, 1, 1, 1, '1', 1745646415, 2, 1745646415, NULL, 1745605800),
(21, 2, 3, 21, 1, 1, 1, 1, '1', 1745646415, 2, 1745646415, NULL, 1745605800),
(22, 2, 3, 22, 1, 1, 1, 1, '1', 1745646415, 2, 1745646415, NULL, 1745605800),
(23, 2, 3, 23, 1, 1, 1, 1, '1', 1745646415, 2, 1745646415, NULL, 1745605800),
(24, 2, 3, 24, 1, 1, 1, 1, '1', 1745646415, 2, 1745646415, NULL, 1745605800),
(25, 2, 3, 25, 1, 1, 1, 1, '1', 1745646415, 2, 1745646415, NULL, 1745605800),
(26, 2, 3, 26, 1, 1, 1, 1, '1', 1745646415, 2, 1745646415, NULL, 1745605800);

-- --------------------------------------------------------

--
-- Table structure for table `cms_mortalityform`
--

DROP TABLE IF EXISTS `cms_mortalityform`;
CREATE TABLE `cms_mortalityform` (
  `mortality_form_id` int(11) NOT NULL,
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
  `loc_code` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `cms_settings`
--

DROP TABLE IF EXISTS `cms_settings`;
CREATE TABLE `cms_settings` (
  `stngs_id` int(11) NOT NULL,
  `stngs_app_name` text NOT NULL COMMENT 'Application Name',
  `stngs_org_logo` text NOT NULL COMMENT 'Organisation Logo',
  `stngs_org_name` text NOT NULL COMMENT 'Organisation Name',
  `stngs_org_addrs` text NOT NULL COMMENT 'Address',
  `stngs_org_phone` varchar(11) NOT NULL COMMENT 'Phone Number',
  `stngs_org_mail` text NOT NULL COMMENT 'E-Mail',
  `stngs_org_website` text DEFAULT NULL COMMENT 'Website',
  `smtp_admin_name` text DEFAULT NULL COMMENT 'Admin Name',
  `smtp_frm_mail` text DEFAULT NULL COMMENT 'Admin E-Mail',
  `smtp_server_name` text DEFAULT NULL COMMENT 'SMTP Host',
  `smtp_server_port` int(11) DEFAULT NULL COMMENT 'SMTP Port',
  `smtp_server_usrname` text DEFAULT NULL COMMENT 'SMTP Username',
  `smtp_server_pwd` text DEFAULT NULL COMMENT 'SMTP Password',
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
  `update_user` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `cms_settings`
--

INSERT INTO `cms_settings` (`stngs_id`, `stngs_app_name`, `stngs_org_logo`, `stngs_org_name`, `stngs_org_addrs`, `stngs_org_phone`, `stngs_org_mail`, `stngs_org_website`, `smtp_admin_name`, `smtp_frm_mail`, `smtp_server_name`, `smtp_server_port`, `smtp_server_usrname`, `smtp_server_pwd`, `smtp_server_ssl`, `smtp_server_auth`, `stngs_timezone`, `stngs_dateformat`, `stngs_pagesize`, `stngs_incendv_amt`, `stngs_financial_year`, `stngs_location`, `stngs_survey_code`, `stngs_survey_fixed`, `status`, `create_time`, `create_user`, `update_time`, `update_user`) VALUES
(1, 'NCD DATABASE', 'test', 'NCD-MUMBAI-01', 'MAHARASHTRA - MUMBAI', '9953792372', 'lhmcostc@yahoo.com', 'http://www.yrgcare.org', 'Santhanam Anand', 'anand@yrgcare.org', 'pop.bizmail.yahoo.com', 25, 'anand@yrgcare.org', 'TlRNek16TTJOVFk9', '0', '1', 'Asia/Kolkata', 'dd-mm-yyyy', 0, 500, 1112, 'MH', 'NCD', '1', '1', 1745646415, 0, 1745646415, 2);

-- --------------------------------------------------------

--
-- Table structure for table `cms_staffmaster`
--

DROP TABLE IF EXISTS `cms_staffmaster`;
CREATE TABLE `cms_staffmaster` (
  `staff_id` int(11) NOT NULL,
  `staff_code` varchar(50) DEFAULT NULL,
  `staff_name` varchar(100) DEFAULT NULL,
  `status` varchar(1) DEFAULT NULL,
  `create_time` int(11) DEFAULT NULL,
  `create_user` smallint(6) DEFAULT NULL,
  `update_time` int(11) DEFAULT NULL,
  `update_user` smallint(6) DEFAULT NULL,
  `record_date` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- --------------------------------------------------------

--
-- Table structure for table `cms_statemaster`
--

DROP TABLE IF EXISTS `cms_statemaster`;
CREATE TABLE `cms_statemaster` (
  `st_id` int(11) NOT NULL,
  `state` varchar(50) DEFAULT NULL,
  `state_code` varchar(10) DEFAULT NULL,
  `status` varchar(1) DEFAULT NULL,
  `create_time` int(11) DEFAULT NULL,
  `create_user` smallint(6) DEFAULT NULL,
  `update_time` int(11) DEFAULT NULL,
  `update_user` smallint(6) DEFAULT NULL,
  `record_date` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `cms_statemaster`
--

INSERT INTO `cms_statemaster` (`st_id`, `state`, `state_code`, `status`, `create_time`, `create_user`, `update_time`, `update_user`, `record_date`) VALUES
(1, 'TAMILNADU', 'TN', '1', 1627367826, 2, 1628836912, 2, 1627324200),
(2, 'DELHI', 'DH', '1', 1627368622, 2, 1628836906, 2, 1627324200),
(3, 'UTTAR PRADESH', 'UP', '1', 1628836676, 2, 1628836676, NULL, 1628793000),
(4, 'PUNJAB', 'PB', '1', 1628836687, 2, 1628836687, NULL, 1628793000),
(5, 'HARYANA', 'HY', '1', 1628836694, 2, 1628836694, NULL, 1628793000),
(6, 'UTTARKHAND', 'UT', '1', 1628836708, 2, 1628836708, NULL, 1628793000),
(7, 'RAJASTHAN', 'RJ', '1', 1628836718, 2, 1628836718, NULL, 1628793000),
(8, 'MAHARASHTRA', 'MH', '1', 1628836726, 2, 1628836726, NULL, 1628793000),
(9, 'MIZORAM', 'MZ', '1', 1628836733, 2, 1628836733, NULL, 1628793000),
(10, 'ASSAM', 'AS', '1', 1628836739, 2, 1628836739, NULL, 1628793000),
(11, 'WEST BENGAL', 'WB', '1', 1628836748, 2, 1628836748, NULL, 1628793000),
(12, 'CHATTISGARH', 'CT', '1', 1628836763, 2, 1628836763, NULL, 1628793000),
(13, 'JAMMU & KASHMIR', 'JK', '1', 1628836778, 2, 1628836778, NULL, 1628793000),
(14, 'MADHYA PRADESH', 'MP', '1', 1628836797, 2, 1628836797, NULL, 1628793000),
(15, 'ANDHRA PRADESH', 'AP', '1', 1628836806, 2, 1628836806, NULL, 1628793000),
(16, 'TELENGANA', 'TE', '1', 1628836812, 2, 1628836812, NULL, 1628793000),
(17, 'KARNATAKA', 'KA', '1', 1628836820, 2, 1628836820, NULL, 1628793000),
(18, 'KERELA', 'KE', '1', 1628836827, 2, 1628836827, NULL, 1628793000),
(19, 'ORISSA', 'OR', '1', 1628836843, 2, 1628836843, NULL, 1628793000),
(20, 'JHARKAND', 'JH', '1', 1628836853, 2, 1628836853, NULL, 1628793000),
(21, 'MANIPUR', 'MN', '1', 1628836861, 2, 1628836861, NULL, 1628793000),
(22, 'NAGALAND', 'NG', '1', 1628836867, 2, 1628836867, NULL, 1628793000),
(23, 'TRIPURRA', 'TR', '1', 1628836881, 2, 1628836881, NULL, 1628793000),
(24, 'ARUNACHAN PRADESH', 'AR', '1', 1628836895, 2, 1628836895, NULL, 1628793000),
(25, 'GOA', 'GO', '1', 1628836944, 2, 1628836944, NULL, 1628793000),
(26, 'GUJURAT', 'GJ', '1', 1628836952, 2, 1628836952, NULL, 1628793000),
(27, 'PONDICHERRY', 'PD', '1', 1628836961, 2, 1628836961, NULL, 1628793000),
(28, 'BIHAR', 'BH', '1', 1628836976, 2, 1628836976, NULL, 1628793000);

-- --------------------------------------------------------

--
-- Table structure for table `cms_submenu`
--

DROP TABLE IF EXISTS `cms_submenu`;
CREATE TABLE `cms_submenu` (
  `sub_mnu_id` int(11) NOT NULL,
  `min_mnu_id_fk` int(11) NOT NULL,
  `sub_mnu_name` text NOT NULL,
  `sub_mnu_desc` text NOT NULL,
  `sub_mnu_preference` int(11) NOT NULL,
  `status` varchar(1) DEFAULT NULL,
  `create_time` int(11) DEFAULT NULL,
  `create_user` int(11) DEFAULT NULL,
  `update_time` int(11) DEFAULT NULL,
  `update_user` int(11) DEFAULT NULL,
  `record_date` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `cms_submenu`
--

INSERT INTO `cms_submenu` (`sub_mnu_id`, `min_mnu_id_fk`, `sub_mnu_name`, `sub_mnu_desc`, `sub_mnu_preference`, `status`, `create_time`, `create_user`, `update_time`, `update_user`, `record_date`) VALUES
(1, 1, 'state', 'State Master', 1, '1', 1745646415, 2, 1745646415, NULL, 1745605800),
(2, 1, 'locationmaster', 'Location Master', 2, '1', 1745646415, 2, 1745646415, NULL, 1745605800),
(3, 1, 'locationmapping', 'Location Mapping', 3, '1', 1745646415, 2, 1745646415, NULL, 1745605800),
(4, 1, 'surveymaster', 'Surveymaster', 4, '1', 1745646415, 2, 1745646415, NULL, 1745605800),
(5, 1, 'applicationsettings', 'Application Settings', 5, '1', 1745646415, 2, 1745646415, NULL, 1745605800),
(6, 1, 'exportmaster', 'Export Master', 6, '1', 1745646415, 2, 1745646415, NULL, 1745605800),
(7, 1, 'fieldmaster', 'Field Master', 7, '0', 1745646415, 2, 1746554073, 2, 1745605800),
(8, 1, 'staff', 'Staff Master', 8, '0', 1745646415, 2, 1746554085, 2, 1745605800),
(9, 2, 'dg/create', 'Demographics', 1, '1', 1745646415, 2, 1745646415, NULL, 1745605800),
(10, 2, 'mdhl/create', 'Medical History and Lifestyle', 2, '1', 1745646415, 2, 1745646415, NULL, 1745605800),
(11, 2, 'apm/create', 'Anthropometric Measurements', 3, '1', 1745646415, 2, 1745646415, NULL, 1745605800),
(12, 2, 'vital/create', 'Vitals', 4, '1', 1745646415, 2, 1745646415, NULL, 1745605800),
(13, 2, 'bsr/create', 'Biological Sample Results', 6, '1', 1745646415, 2, 1746553976, 2, 1745605800),
(14, 2, 'ce/create', 'Clinical Examination', 5, '1', 1745646415, 2, 1746553959, 2, 1745605800),
(15, 2, 'cml/create', 'Case Management Linkages', 7, '1', 1745646415, 2, 1745646415, NULL, 1745605800),
(16, 2, 'fupm/create', 'Follow-Up and Monitoring', 8, '1', 1745646415, 2, 1745646415, NULL, 1745605800),
(17, 2, 'cprca/create', 'Community Perceptions and Root Cause Analysis', 9, '1', 1745646415, 2, 1745646415, NULL, 1745605800),
(18, 2, 'mortalityform/create', 'Mortality Form', 10, '0', 1745646415, 2, 1746097178, 2, 1745605800),
(19, 2, 'trackingform/create', 'Client Tracking Form', 11, '0', 1745646415, 2, 1746097190, 2, 1745605800),
(20, 3, 'mainmenu', 'Mainmenu', 1, '1', 1745646415, 2, 1745646415, NULL, 1745605800),
(21, 3, 'submenu', 'Submenu', 2, '1', 1745646415, 2, 1745646415, NULL, 1745605800),
(22, 3, 'users', 'User Creation', 3, '1', 1745646415, 2, 1745646415, NULL, 1745605800),
(23, 3, 'menuprivileges', 'User Privileges', 4, '1', 1745646415, 2, 1745646415, NULL, 1745605800),
(24, 3, 'export', 'Data Export - DMC', 5, '1', 1745646415, 2, 1745646415, NULL, 1745605800),
(25, 3, 'import', 'Data Import - DMC', 6, '1', 1745646415, 2, 1745646415, NULL, 1745605800),
(26, 3, 'settings', 'Main Settings', 7, '1', 1745646415, 2, 1745646415, NULL, 1745605800);

-- --------------------------------------------------------

--
-- Table structure for table `cms_surveymaster`
--

DROP TABLE IF EXISTS `cms_surveymaster`;
CREATE TABLE `cms_surveymaster` (
  `sur_id` int(11) NOT NULL,
  `sur_code` text NOT NULL,
  `sur_title` text NOT NULL,
  `sur_url` text NOT NULL,
  `sur_onlne_id` text NOT NULL,
  `sur_pri_db_name` text NOT NULL,
  `sur_pri_db_server` text NOT NULL,
  `sur_pri_db_usrnme` text NOT NULL,
  `sur_pri_db_paswrd` blob NOT NULL,
  `sur_sec_db_name` text DEFAULT NULL,
  `sur_sec_db_server` text DEFAULT NULL,
  `sur_sec_db_usrnme` text DEFAULT NULL,
  `sur_sec_db_paswrd` blob DEFAULT NULL,
  `status` varchar(1) DEFAULT NULL,
  `create_time` int(11) DEFAULT NULL,
  `create_user` int(11) DEFAULT NULL,
  `update_time` int(11) DEFAULT NULL,
  `update_user` int(11) DEFAULT NULL,
  `record_date` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `cms_surveymaster`
--

INSERT INTO `cms_surveymaster` (`sur_id`, `sur_code`, `sur_title`, `sur_url`, `sur_onlne_id`, `sur_pri_db_name`, `sur_pri_db_server`, `sur_pri_db_usrnme`, `sur_pri_db_paswrd`, `sur_sec_db_name`, `sur_sec_db_server`, `sur_sec_db_usrnme`, `sur_sec_db_paswrd`, `status`, `create_time`, `create_user`, `update_time`, `update_user`, `record_date`) VALUES
(1, 'NCD', 'SWASTH ABHIYAN', '-', '12345', 'ncd', 'localhost', 'yrgbs', 0x5952476273313233, '', '', '', '', '1', 1745646415, 2, 1746078226, 2, 1745605800);

-- --------------------------------------------------------

--
-- Table structure for table `cms_trackingform`
--

DROP TABLE IF EXISTS `cms_trackingform`;
CREATE TABLE `cms_trackingform` (
  `track_form_id` int(11) NOT NULL,
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
  `loc_code` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `cms_userrole`
--

DROP TABLE IF EXISTS `cms_userrole`;
CREATE TABLE `cms_userrole` (
  `role_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `authorized_loc` varchar(100) DEFAULT NULL,
  `status` varchar(1) DEFAULT NULL,
  `create_time` int(11) DEFAULT NULL,
  `create_user` int(11) DEFAULT NULL,
  `update_time` int(11) DEFAULT NULL,
  `update_user` int(11) DEFAULT NULL,
  `record_date` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `cms_users`
--

DROP TABLE IF EXISTS `cms_users`;
CREATE TABLE `cms_users` (
  `usr_id` int(11) NOT NULL,
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
  `loc_code` text CHARACTER SET latin1 DEFAULT NULL,
  `signedin_loc` varchar(50) CHARACTER SET latin1 DEFAULT NULL,
  `state_code` varchar(50) CHARACTER SET latin1 DEFAULT NULL,
  `user_role` smallint(6) DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `cms_users`
--

INSERT INTO `cms_users` (`usr_id`, `users_name`, `password`, `auth_key`, `password_reset_token`, `full_name`, `email`, `status`, `create_time`, `create_user`, `update_time`, `update_user`, `user_type`, `record_date`, `loc_code`, `signedin_loc`, `state_code`, `user_role`) VALUES
(1, 'Admin', '09c99a8ee810a156b60f1aa6ff1f3424', 'TEsvrTcu9hDQUk7_NJDPUolyA7Fu0zFU', '', 'Santhanam Anand', 'anand@yrgcare.org', '1', 1745646415, 2, 1745646415, 2, 0, 1745605800, 'DH', 'DH', 'MH', 1),
(2, 'Administrator', 'ebfaf968ba8e04d258014462075c8128', 'TEsvrTcu9hDQUk7_NJDPUolyA7Fu0zFU', '', 'Santhanam Anand', 'anand@yrgcare.org', '1', 1745646415, 2, 1745646415, 2, 0, 1745605800, 'DH', 'DH', 'MH', 1);

-- --------------------------------------------------------

--
-- Table structure for table `cms_vital`
--

DROP TABLE IF EXISTS `cms_vital`;
CREATE TABLE `cms_vital` (
  `vital_id` int(11) NOT NULL,
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
  `loc_code` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `cms_apm`
--
ALTER TABLE `cms_apm`
  ADD PRIMARY KEY (`apm_id`);

--
-- Indexes for table `cms_appsettings`
--
ALTER TABLE `cms_appsettings`
  ADD PRIMARY KEY (`app_stngs_id`);

--
-- Indexes for table `cms_attandance`
--
ALTER TABLE `cms_attandance`
  ADD PRIMARY KEY (`id`),
  ADD KEY `pid` (`pid`);

--
-- Indexes for table `cms_bsr`
--
ALTER TABLE `cms_bsr`
  ADD PRIMARY KEY (`bsr_id`);

--
-- Indexes for table `cms_ce`
--
ALTER TABLE `cms_ce`
  ADD PRIMARY KEY (`ce_id`);

--
-- Indexes for table `cms_clientidref`
--
ALTER TABLE `cms_clientidref`
  ADD UNIQUE KEY `clientid_ref_sur` (`clientid_ref_sur`,`clientid_ref_loc`);

--
-- Indexes for table `cms_cml`
--
ALTER TABLE `cms_cml`
  ADD PRIMARY KEY (`cml_id`);

--
-- Indexes for table `cms_cprca`
--
ALTER TABLE `cms_cprca`
  ADD PRIMARY KEY (`cprca_id`);

--
-- Indexes for table `cms_dg`
--
ALTER TABLE `cms_dg`
  ADD PRIMARY KEY (`dg_id`);

--
-- Indexes for table `cms_fieldmaster`
--
ALTER TABLE `cms_fieldmaster`
  ADD PRIMARY KEY (`fld_mstr_id`);

--
-- Indexes for table `cms_fupm`
--
ALTER TABLE `cms_fupm`
  ADD PRIMARY KEY (`fupm_id`);

--
-- Indexes for table `cms_locationmapping`
--
ALTER TABLE `cms_locationmapping`
  ADD PRIMARY KEY (`loc_mapng_id`),
  ADD UNIQUE KEY `loc_mapng_sur_id` (`loc_mapng_sur_id`,`loc_mapng_mstr_id`);

--
-- Indexes for table `cms_locationmaster`
--
ALTER TABLE `cms_locationmaster`
  ADD PRIMARY KEY (`loc_id`);

--
-- Indexes for table `cms_mainmenu`
--
ALTER TABLE `cms_mainmenu`
  ADD PRIMARY KEY (`min_mnu_id`);

--
-- Indexes for table `cms_mdhl`
--
ALTER TABLE `cms_mdhl`
  ADD PRIMARY KEY (`mdhl_id`);

--
-- Indexes for table `cms_menuprivileges`
--
ALTER TABLE `cms_menuprivileges`
  ADD PRIMARY KEY (`mnu_acs_id`);

--
-- Indexes for table `cms_mortalityform`
--
ALTER TABLE `cms_mortalityform`
  ADD PRIMARY KEY (`mortality_form_id`);

--
-- Indexes for table `cms_settings`
--
ALTER TABLE `cms_settings`
  ADD PRIMARY KEY (`stngs_id`);

--
-- Indexes for table `cms_staffmaster`
--
ALTER TABLE `cms_staffmaster`
  ADD PRIMARY KEY (`staff_id`);

--
-- Indexes for table `cms_statemaster`
--
ALTER TABLE `cms_statemaster`
  ADD PRIMARY KEY (`st_id`);

--
-- Indexes for table `cms_submenu`
--
ALTER TABLE `cms_submenu`
  ADD PRIMARY KEY (`sub_mnu_id`);

--
-- Indexes for table `cms_surveymaster`
--
ALTER TABLE `cms_surveymaster`
  ADD PRIMARY KEY (`sur_id`);

--
-- Indexes for table `cms_trackingform`
--
ALTER TABLE `cms_trackingform`
  ADD PRIMARY KEY (`track_form_id`);

--
-- Indexes for table `cms_userrole`
--
ALTER TABLE `cms_userrole`
  ADD PRIMARY KEY (`role_id`);

--
-- Indexes for table `cms_users`
--
ALTER TABLE `cms_users`
  ADD PRIMARY KEY (`usr_id`),
  ADD UNIQUE KEY `users_name` (`users_name`);

--
-- Indexes for table `cms_vital`
--
ALTER TABLE `cms_vital`
  ADD PRIMARY KEY (`vital_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `cms_apm`
--
ALTER TABLE `cms_apm`
  MODIFY `apm_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cms_appsettings`
--
ALTER TABLE `cms_appsettings`
  MODIFY `app_stngs_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `cms_attandance`
--
ALTER TABLE `cms_attandance`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cms_bsr`
--
ALTER TABLE `cms_bsr`
  MODIFY `bsr_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cms_ce`
--
ALTER TABLE `cms_ce`
  MODIFY `ce_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cms_cml`
--
ALTER TABLE `cms_cml`
  MODIFY `cml_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cms_cprca`
--
ALTER TABLE `cms_cprca`
  MODIFY `cprca_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cms_dg`
--
ALTER TABLE `cms_dg`
  MODIFY `dg_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cms_fieldmaster`
--
ALTER TABLE `cms_fieldmaster`
  MODIFY `fld_mstr_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cms_fupm`
--
ALTER TABLE `cms_fupm`
  MODIFY `fupm_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cms_locationmapping`
--
ALTER TABLE `cms_locationmapping`
  MODIFY `loc_mapng_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `cms_locationmaster`
--
ALTER TABLE `cms_locationmaster`
  MODIFY `loc_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `cms_mainmenu`
--
ALTER TABLE `cms_mainmenu`
  MODIFY `min_mnu_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `cms_mdhl`
--
ALTER TABLE `cms_mdhl`
  MODIFY `mdhl_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cms_menuprivileges`
--
ALTER TABLE `cms_menuprivileges`
  MODIFY `mnu_acs_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `cms_mortalityform`
--
ALTER TABLE `cms_mortalityform`
  MODIFY `mortality_form_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cms_settings`
--
ALTER TABLE `cms_settings`
  MODIFY `stngs_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `cms_staffmaster`
--
ALTER TABLE `cms_staffmaster`
  MODIFY `staff_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cms_statemaster`
--
ALTER TABLE `cms_statemaster`
  MODIFY `st_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT for table `cms_submenu`
--
ALTER TABLE `cms_submenu`
  MODIFY `sub_mnu_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `cms_surveymaster`
--
ALTER TABLE `cms_surveymaster`
  MODIFY `sur_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `cms_trackingform`
--
ALTER TABLE `cms_trackingform`
  MODIFY `track_form_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cms_userrole`
--
ALTER TABLE `cms_userrole`
  MODIFY `role_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cms_users`
--
ALTER TABLE `cms_users`
  MODIFY `usr_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `cms_vital`
--
ALTER TABLE `cms_vital`
  MODIFY `vital_id` int(11) NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
