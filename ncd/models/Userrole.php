<?php

namespace app\models;

use Yii;
use yii\behaviors\TimestampBehavior;

/**
 * This is the model class for table "{{%locationmaster}}".
 *
 * @property integer $id
 * @property string $loc_code
 * @property string $loc_name
 * @property string $status
 * @property integer $del_status
 * @property integer $create_time
 * @property integer $create_user
 * @property integer $update_time
 * @property integer $update_user
 */
class Userrole extends \yii\db\ActiveRecord
{
	/**
	 * @inheritdoc
	 */
    public static function tableName()
	{

		return '{{%userrole}}';
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
			[['authorized_locs'], 'required'],
			[['create_time', 'create_user', 'update_time', 'update_user'], 'integer'],					
			[['record_date'], 'default', 'value' => strtotime(date('Y/m/d'))],
		];
	}

	/**
	 * @inheritdoc
	 */
	public function attributeLabels()
	{
		return [			
			'create_time' => Yii::t('app', 'Create Time'),
			'create_user' => Yii::t('app', 'Create User'),
			'update_time' => Yii::t('app', 'Update Time'),
			'update_user' => Yii::t('app', 'Update User'),
		];
	}
}
