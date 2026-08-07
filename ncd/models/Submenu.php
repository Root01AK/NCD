<?php

namespace app\models;

use Yii;
use app\models\Mainmenu;
use yii\behaviors\TimestampBehavior;

/**
 * This is the model class for table "{{%submenu}}".
 *
 * @property integer $sub_mnu_id
 * @property integer $min_mnu_id_fk
 * @property string $sub_mnu_name
 * @property string $sub_mnu_desc
 * @property integer $sub_mnu_preference
 * @property string $status
 * @property integer $create_time
 * @property integer $create_user
 * @property integer $update_time
 * @property integer $update_user
 */
class Submenu extends \yii\db\ActiveRecord
{
	/**
	 * @inheritdoc
	 */
    public static function tableName()
	{
		return '{{%submenu}}';
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
			[['min_mnu_id_fk', 'sub_mnu_name', 'sub_mnu_desc', 'sub_mnu_preference'], 'required', 'message' => 'Cannot be blank.'],
			[['min_mnu_id_fk', 'sub_mnu_preference', 'create_time', 'create_user', 'update_time', 'update_user'], 'integer', 'message' => 'Must be an integer.'],
			[['sub_mnu_name', 'sub_mnu_desc'], 'string'],
			[['sub_mnu_name'], 'unique', 'message' => "{value} has already been taken."],
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
			'sub_mnu_id' => Yii::t('app', 'Sub Menu ID'),
			'min_mnu_id_fk' => Yii::t('app', 'Main Menu'),
			'sub_mnu_name' => Yii::t('app', 'Sub Menu Name'),
			'sub_mnu_desc' => Yii::t('app', 'Sub Menu Title'),
			'sub_mnu_preference' => Yii::t('app', 'Sub Menu Preference'),
			'status' => Yii::t('app', 'Status'),
			'create_time' => Yii::t('app', 'Create Time'),
			'create_user' => Yii::t('app', 'Create User'),
			'update_time' => Yii::t('app', 'Update Time'),
			'update_user' => Yii::t('app', 'Update User'),
		];
	}

    public function getMainmenus()
    {
        $query = $this->hasOne(Mainmenu::className(), ['min_mnu_id' => 'min_mnu_id_fk']);
        return $query;
    }

	public function beforeSave($insert)
	{
		if (parent::beforeSave($insert)) {
            $this->sub_mnu_name = strtolower($this->sub_mnu_name);
	        return true;
	    } else {
	        return false;
	    }
	}
}
