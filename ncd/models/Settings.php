<?php

namespace app\models;

use Yii;
use yii\behaviors\TimestampBehavior;

/**
 * This is the model class for table "{{%settings}}".
 *
 * @property integer $stngs_id
 * @property string $stngs_app_name
 * @property string $stngs_org_logo
 * @property string $stngs_org_name
 * @property string $stngs_org_addrs
 * @property string $stngs_org_phone
 * @property string $stngs_org_mail
 * @property string $stngs_org_website
 * @property string $smtp_admin_name
 * @property string $smtp_frm_mail
 * @property string $smtp_server_name
 * @property integer $smtp_server_port
 * @property string $smtp_server_usrname
 * @property string $smtp_server_pwd
 * @property string $smtp_server_ssl
 * @property string $smtp_server_auth
 * @property string $stngs_timezone
 * @property string $stngs_dateformat
 * @property integer $stngs_pagesize
 * @property integer $stngs_incendv_amt
 * @property integer $stngs_financial_year
 * @property string $stngs_location
 * @property string $stngs_survey_code
 * @property string $stngs_survey_fixed
 * @property string $status
 * @property integer $create_time
 * @property integer $create_user
 * @property integer $update_time
 * @property integer $update_user
 */
class Settings extends \yii\db\ActiveRecord
{
	public $dtformat = ["dd-mm-yyyy" => "dd-mm-yyyy", "mm-dd-yyyy" => "mm-dd-yyyy", "yyyy-mm-dd" => "yyyy-mm-dd"];
	/**
	 * @inheritdoc
	 */
    public static function tableName()
	{
		return '{{%settings}}';
	}

	/**
	 * @inheritdoc
	 */
	public function behaviors()
	{
		return [
			[
				'class' => TimestampBehavior::className(),
				'createdAtAttribute' => 'create_time',
				'updatedAtAttribute' => 'update_time',
				'value' => date('U'),
			]
		];
	}

	/**
	 * @inheritdoc
	 */
	public function rules()
	{
		return [
			[['stngs_app_name', 'stngs_org_logo', 'stngs_org_name', 'stngs_org_addrs', 'stngs_org_phone', 'stngs_org_mail', 'stngs_timezone', 'stngs_dateformat'], 'required'],
			[['stngs_app_name', 'stngs_org_logo', 'stngs_org_name', 'stngs_org_addrs', 'stngs_org_mail', 'stngs_org_website', 'smtp_admin_name', 'smtp_frm_mail', 'smtp_server_name', 'smtp_server_usrname', 'smtp_server_pwd', 'smtp_server_ssl', 'smtp_server_auth', 'stngs_survey_fixed'], 'string'],
			[['smtp_server_port', 'stngs_pagesize', 'stngs_incendv_amt', 'stngs_financial_year', 'create_time', 'create_user', 'update_time', 'update_user'], 'integer'],
			[['stngs_org_phone', 'stngs_dateformat', 'stngs_location', 'stngs_survey_code'], 'string', 'max' => 11],
			[['stngs_timezone'], 'string', 'max' => 50],
			[['stngs_org_mail', 'smtp_frm_mail', 'smtp_server_usrname'], 'email'],
			['stngs_org_website', 'url', 'defaultScheme' => 'http'],
			[['status'], 'string', 'max' => 1],
		];
	}

	/**
	 * @inheritdoc
	 */
	public function attributeLabels()
	{
		return [
			'stngs_id' => Yii::t('app', 'Stngs ID'),
			'stngs_app_name' => Yii::t('app', 'Application Name'),
			'stngs_org_logo' => Yii::t('app', 'Organisation Logo'),
			'stngs_org_name' => Yii::t('app', 'Organisation Name'),
			'stngs_org_addrs' => Yii::t('app', 'Address'),
			'stngs_org_phone' => Yii::t('app', 'Phone Number'),
			'stngs_org_mail' => Yii::t('app', 'E-Mail'),
			'stngs_org_website' => Yii::t('app', 'Website'),
			'smtp_admin_name' => Yii::t('app', 'Admin Name'),
			'smtp_frm_mail' => Yii::t('app', 'Admin E-Mail'),
			'smtp_server_name' => Yii::t('app', 'SMTP Host'),
			'smtp_server_port' => Yii::t('app', 'SMTP Port'),
			'smtp_server_usrname' => Yii::t('app', 'SMTP Username'),
			'smtp_server_pwd' => Yii::t('app', 'SMTP Password'),
			'smtp_server_ssl' => Yii::t('app', 'SMTP SSL'),
			'smtp_server_auth' => Yii::t('app', 'SMTP Auth'),
			'stngs_timezone' => Yii::t('app', 'Time Zone'),
			'stngs_dateformat' => Yii::t('app', 'Date Format'),
			'stngs_pagesize' => Yii::t('app', 'Page Size'),
			'stngs_incendv_amt' => Yii::t('app', 'Incentive Amount'),
			'stngs_financial_year' => Yii::t('app', 'Financial Year'),
			'stngs_location' => Yii::t('app', 'Default Spoke'),
			'stngs_survey_code' => Yii::t('app', 'Survey'),
			'stngs_survey_fixed' => Yii::t('app', 'Survey Is Fixed?'),
			'status' => Yii::t('app', 'Status'),
			'create_time' => Yii::t('app', 'Create Time'),
			'create_user' => Yii::t('app', 'Create User'),
			'update_time' => Yii::t('app', 'Update Time'),
			'update_user' => Yii::t('app', 'Update User'),
		];
	}

	public function beforeSave($insert)
	{
		if (parent::beforeSave($insert)) {
			if($this->stngs_survey_code == "")
				$this->stngs_survey_fixed = 0;
			$this->smtp_server_pwd = base64_encode($this->smtp_server_pwd);
			return true;
		}
	}

	public function getSurveys()
	{
		return $this->hasOne(Surveymaster::className(), ['sur_code' => 'stngs_survey_code']);
	}
}
