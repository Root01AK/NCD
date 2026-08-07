<?php

namespace app\models;

use Yii;
use yii\behaviors\TimestampBehavior;

/**
 * This is the model class for table "{{%surveymaster}}".
 *
 * @property integer $sur_id
 * @property string $sur_code
 * @property string $sur_title
 * @property string $sur_url
 * @property string $sur_onlne_id
 * @property string $sur_pri_db_name
 * @property string $sur_pri_db_server
 * @property string $sur_pri_db_usrnme
 * @property resource $sur_pri_db_paswrd
 * @property string $sur_sec_db_name
 * @property string $sur_sec_db_server
 * @property string $sur_sec_db_usrnme
 * @property resource $sur_sec_db_paswrd
 * @property string $status
 * @property integer $create_time
 * @property integer $create_user
 * @property integer $update_time
 * @property integer $update_user
 */
class Surveymaster extends \yii\db\ActiveRecord
{
	/**
	 * @inheritdoc
	 */
    public static function tableName()
	{
		return '{{%surveymaster}}';
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
			[['sur_code', 'sur_title', 'sur_url', 'sur_onlne_id', 'sur_pri_db_name', 'sur_pri_db_server', 'sur_pri_db_usrnme', 'sur_pri_db_paswrd'], 'required'],
			[['sur_code', 'sur_title', 'sur_url', 'sur_onlne_id', 'sur_pri_db_name', 'sur_pri_db_server', 'sur_pri_db_usrnme', 'sur_pri_db_paswrd', 'sur_sec_db_name', 'sur_sec_db_server', 'sur_sec_db_usrnme', 'sur_sec_db_paswrd'], 'string'],
			[['create_time', 'create_user', 'update_time', 'update_user'], 'integer'],
			[['status'], 'string', 'max' => 1],
			[['record_date'], 'default', 'value' => strtotime(date('Y/m/d'))],
		];
	}

	/**
	 * @inheritdoc
	 */
	public function attributeLabels()
	{
		return [
			'sur_id' => Yii::t('app', 'Survey ID'),
			'sur_code' => Yii::t('app', 'Survey Code'),
			'sur_title' => Yii::t('app', 'Survey Title'),
			'sur_url' => Yii::t('app', 'Survey Url'),
			'sur_onlne_id' => Yii::t('app', 'Online Survey ID'),
			'sur_pri_db_name' => Yii::t('app', 'Local DB Name'),
			'sur_pri_db_server' => Yii::t('app', 'Local DB Server'),
			'sur_pri_db_usrnme' => Yii::t('app', 'Local DB Username'),
			'sur_pri_db_paswrd' => Yii::t('app', 'Local DB Password'),
			'sur_sec_db_name' => Yii::t('app', 'Central DB Name'),
			'sur_sec_db_server' => Yii::t('app', 'Central DB Server'),
			'sur_sec_db_usrnme' => Yii::t('app', 'Central DB Username'),
			'sur_sec_db_paswrd' => Yii::t('app', 'Central DB Password'),
			'status' => Yii::t('app', 'Status'),
			'create_time' => Yii::t('app', 'Create Time'),
			'create_user' => Yii::t('app', 'Create User'),
			'update_time' => Yii::t('app', 'Update Time'),
			'update_user' => Yii::t('app', 'Update User'),
		];
	}
}
