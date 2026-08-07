<?php

namespace app\models;

use Yii;
use yii\helpers\Html;
use yii\behaviors\TimestampBehavior;
use app\base\Converter;
use app\models\Applicationsettings;
use app\base\Common;

/**
 * This is the model class for table "{{%registration}}".
 *
 * @property integer $cprca_id
 * @property string $cprca_survey
 * @property string $cprca_pid
 * @property string $cprca_loc
 * @property string $cprca_q1
 * @property string $cprca_q9
 * @property integer $cprca_q3
 * @property integer $cprca_q4
 * @property integer $cprca_q5
 * @property integer $cprca_q8
 * @property integer $cprca_q7
 * @property integer $cprca_q8
 * @property integer $cprca_q9
 * @property integer $cprca_q10
 * @property string $cprca_q11
 * @property integer $cprca_q12
 * @property integer $cprca_q13
 * @property string $cprca_q14
 * @property string $cprca_q15
 * @property string $cprca_q16
 * @property integer $iccplus_date
 * @property integer $icc_date
 * @property string $status
 * @property integer $create_time
 * @property integer $create_user
 * @property integer $update_time
 * @property integer $update_user
 */
class Cprca extends \yii\db\ActiveRecord
{
	public $yes_no = [1 => "Yes", 2 => "No", 3 => "Partially"];
	public $q8 = [1 => "Poor diet", 2 => "Lack of access to healthcare", 3 => "Pollution", 4 => "Stress", 5 => "Lack of awareness", 6 => "Distance to health care facilities", 7 => "Logistical challenge to access these facilities including funds for travel"];
	
	/**
	 * @inheritdoc
	 */
	
    public static function tableName()
	{
		return '{{%cprca}}';
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
			[['cprca_survey', 'cprca_pid', 'cprca_loc', 'cprca_q8','cprca_q9','cprca_date'], 'required', 'message' => 'Cannot be blank.'],
			[['loc_code'], 'required', 'message' => 'Cannot be blank.'],	
			[['create_time', 'create_user', 'update_time', 'update_user'], 'integer', 'message' => 'Must be an integer'],
			          		
			[['cprca_survey', 'cprca_pid', 'cprca_loc'], 'string', 'max' => 100],					
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
			'cprca_id' => Yii::t('app', 'ID'),
			'cprca_survey' => Yii::t('app', 'Survey'),
			'cprca_pid' => Yii::t('app', 'Client ID'),
			'cprca_loc' => Yii::t('app', 'State'),
			'loc_code' => Yii::t('app', 'Location'),
			'cprca_date' => Yii::t('app', 'Date'),
            'cprca_q8' => Yii::t('app', '51. What are the biggest health problems in your community? (Check all that apply)'),			
		    'cprca_q9' => Yii::t('app', '52. Do you have access to clean drinking water and sanitation facilities?'),
			'status' => Yii::t('app', 'Status'),
			'create_time' => Yii::t('app', 'Create Time'),
			'create_user' => Yii::t('app', 'Create User'),
			'update_time' => Yii::t('app', 'Update Time'),
			'update_user' => Yii::t('app', 'Update User'),
		];
	}
	
	 public function getLocations()
    {
        return $this->hasOne(\app\models\Locationmaster::className(), ['loc_code' => 'loc_code']);
    }

	
	public function beforeSave($insert)
	{
		if (parent::beforeSave($insert)) {		
		 $this->cprca_pid = strtoupper($this->cprca_pid);		 
			 if($this->cprca_date != "")
				$this->cprca_date = Converter::toStore($this->cprca_date);			
	        return true;
	    } else {
	        return false;
	    }
	}
	
	public function afterFind()
	{
		parent::afterFind();
		if(Yii::$app->controller->action->id != "view") {
			if($this->cprca_date != "")
				$this->cprca_date = Converter::toDisplay($this->cprca_date);			
		}
		if(Yii::$app->controller->action->id == "update" ) {
			$this->cprca_q8 = explode(",", $this->cprca_q8);			
		}
	}
	
		
	
}


			
			
			