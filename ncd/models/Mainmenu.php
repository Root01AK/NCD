<?php

namespace app\models;

use Yii;
use yii\behaviors\TimestampBehavior;

/**
 * This is the model class for table "{{%mainmenu}}".
 *
 * @property integer $min_mnu_id
 * @property string $min_mnu_name
 * @property string $min_mnu_desc
 * @property integer $min_mnu_preference
 * @property string $status
 * @property integer $create_time
 * @property integer $create_user
 * @property integer $update_time
 * @property integer $update_user
 */
class Mainmenu extends \yii\db\ActiveRecord
{
	/**
	 * @inheritdoc
	 */
    public static function tableName()
	{
		return '{{%mainmenu}}';
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
			[['min_mnu_name', 'min_mnu_desc', 'min_mnu_preference'], 'required', 'message' => 'Cannot be blank.'],
			[['min_mnu_name', 'min_mnu_desc', 'min_mnu_preference'], 'required'],
			[['min_mnu_name', 'min_mnu_desc'], 'string'],
			[['min_mnu_preference', 'create_time', 'create_user', 'update_time', 'update_user'], 'integer', 'message' => 'Must be an integer.'],
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
			'min_mnu_id' => Yii::t('app', 'Main Menu ID'),
			'min_mnu_name' => Yii::t('app', 'Main Menu Name'),
			'min_mnu_desc' => Yii::t('app', 'Main Menu Title'),
			'min_mnu_preference' => Yii::t('app', 'Main Menu Preference'),
			'status' => Yii::t('app', 'Status'),
			'create_time' => Yii::t('app', 'Create Time'),
			'create_user' => Yii::t('app', 'Create User'),
			'update_time' => Yii::t('app', 'Update Time'),
			'update_user' => Yii::t('app', 'Update User'),
		];
	}
}
