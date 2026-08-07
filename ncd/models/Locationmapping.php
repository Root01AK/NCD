<?php

namespace app\models;

use Yii;
use yii\behaviors\TimestampBehavior;

/**
 * This is the model class for table "{{%locationmapping}}".
 *
 * @property integer $loc_mapng_id
 * @property string $loc_mapng_sur_id
 * @property string $loc_mapng_mstr_id
 * @property string $status
 * @property integer $create_time
 * @property integer $create_user
 * @property integer $update_time
 * @property integer $update_user
 */
class Locationmapping extends \yii\db\ActiveRecord
{
	/**
	 * @inheritdoc
	 */
    public static function tableName()
	{
		return '{{%locationmapping}}';
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
			[['loc_mapng_sur_id', 'loc_mapng_mstr_id'], 'required'],
			[['create_time', 'create_user', 'update_time', 'update_user'], 'integer'],
			[['loc_mapng_sur_id', 'loc_mapng_mstr_id'], 'string', 'max' => 11],
			[['status'], 'string', 'max' => 1],
			[['loc_mapng_sur_id', 'loc_mapng_mstr_id'], 'unique', 'targetAttribute' => ['loc_mapng_sur_id', 'loc_mapng_mstr_id'], 'message' => 'The combination of Survey and Location has already been taken.'],
			[['record_date'], 'default', 'value' => strtotime(date('Y/m/d'))],
		];
	}

	/**
	 * @inheritdoc
	 */
	public function attributeLabels()
	{
		return [
			'loc_mapng_id' => Yii::t('app', 'Loc Mapng ID'),
			'loc_mapng_sur_id' => Yii::t('app', 'Survey'),
			'loc_mapng_mstr_id' => Yii::t('app', 'Location'),
			'status' => Yii::t('app', 'Status'),
			'create_time' => Yii::t('app', 'Create Time'),
			'create_user' => Yii::t('app', 'Create User'),
			'update_time' => Yii::t('app', 'Update Time'),
			'update_user' => Yii::t('app', 'Update User'),
		];
	}

    public function getLocations()
    {
        return $this->hasOne(\app\models\Locationmaster::className(), ['loc_code' => 'loc_mapng_mstr_id']);
    }
}
