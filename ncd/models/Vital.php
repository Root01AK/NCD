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
 * @property integer $vital_id
 * @property string $vital_survey
 * @property string $vital_pid
 * @property string $vital_loc
 * @property string $vital_q1
 * @property string $vital_pulse_rate
 * @property integer $vital_spo2
 * @property integer $vital_q4
 * @property integer $vital_q5
 * @property integer $vital_q6
 * @property integer $vital_q7
 * @property integer $vital_q8
 * @property integer $vital_q9
 * @property integer $vital_q10
 * @property string $vital_q11
 * @property integer $vital_q12
 * @property integer $vital_q13
 * @property string $vital_q14
 * @property string $vital_q15
 * @property string $vital_q16
 * @property integer $iccplus_date
 * @property integer $icc_date
 * @property string $status
 * @property integer $create_time
 * @property integer $create_user
 * @property integer $update_time
 * @property integer $update_user
 */
class Vital extends \yii\db\ActiveRecord
{
	
	/**
	 * @inheritdoc
	 */
	
    public static function tableName()
	{
		return '{{%vital}}';
	}

	/**
	 * @inheritdoc
	 */
	public function behaviors()
	{
		return [
			[
				'class' => TimestampBehavior::class,
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
			[['vital_survey', 'vital_pid', 'vital_loc','vital_bp_diastolic','vital_bp_systolic',  'vital_pulse_rate', 'vital_spo2','vital_date'], 'required', 'message' => 'Cannot be blank.'],
			[['loc_code'], 'required', 'message' => 'Cannot be blank.'],	
			[['vital_bp_diastolic','vital_bp_systolic','create_time', 'create_user', 'update_time', 'update_user'], 'integer', 'message' => 'Must be an integer'],
          		
			[['vital_survey', 'vital_pid', 'vital_loc'], 'string', 'max' => 100],
			[['vital_pulse_rate','vital_spo2'], 'string', 'max' => 3],			
			[['vital_pulse_rate','vital_spo2'], 'integer', 'message' => 'Must be an integer'],	
            [['vital_bp_diastolic','vital_bp_systolic'], 'string', 'max' => 3],				
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
			'vital_id' => Yii::t('app', 'ID'),
			'vital_survey' => Yii::t('app', 'Survey'),
			'vital_pid' => Yii::t('app', 'Client ID'),
			'vital_loc' => Yii::t('app', 'State'),
			'loc_code' => Yii::t('app', 'Location'),
			'vital_date' => Yii::t('app', 'Date'),	
            'vital_bp_diastolic' => Yii::t('app', 'Systolic'),
			'vital_bp_systolic' => Yii::t('app', 'Diastolic'),			
			'vital_pulse_rate' => Yii::t('app', '25. Pulse rate'),
			'vital_spo2' => Yii::t('app', '27. SpO2'),			
			'status' => Yii::t('app', 'Status'),
			'create_time' => Yii::t('app', 'Create Time'),
			'create_user' => Yii::t('app', 'Create User'),
			'update_time' => Yii::t('app', 'Update Time'),
			'update_user' => Yii::t('app', 'Update User'),
		];
	}
	
	 public function getLocations()
    {
        return $this->hasOne(\app\models\Locationmaster::class, ['loc_code' => 'loc_code']);
    }

	
	public function beforeSave($insert)
	{
		if (parent::beforeSave($insert)) {		
		 $this->vital_pid = strtoupper($this->vital_pid);		 
			 if($this->vital_date != "")
				$this->vital_date = Converter::toStore($this->vital_date);
			
	        return true;
	    } else {
	        return false;
	    }
	}
	
	public function afterFind()
	{
		parent::afterFind();
		$actionId = isset(Yii::$app->controller->action->id) ? Yii::$app->controller->action->id : '';
		if($actionId != "view" && $actionId != "") {
			if(!empty($this->vital_date) && is_numeric($this->vital_date))
				$this->vital_date = Converter::toDisplay($this->vital_date);
		}
	}
	
		
	
}

