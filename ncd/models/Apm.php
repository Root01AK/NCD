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
 * @property integer $apm_id
 * @property string $apm_survey
 * @property string $apm_pid
 * @property string $apm_loc
 * @property string $apm_q1
 * @property string $apm_q2
 * @property integer $apm_q3
 * @property integer $apm_q4
 * @property integer $apm_q5
 * @property integer $apm_q6
 * @property integer $apm_q7
 * @property integer $apm_q8
 * @property integer $apm_q9
 * @property integer $apm_q10
 * @property string $apm_q11
 * @property integer $apm_q12
 * @property integer $apm_q13
 * @property string $apm_q14
 * @property string $apm_q15
 * @property string $apm_q16
 * @property integer $iccplus_date
 * @property integer $icc_date
 * @property string $status
 * @property integer $create_time
 * @property integer $create_user
 * @property integer $update_time
 * @property integer $update_user
 */
class Apm extends \yii\db\ActiveRecord
{
	
	/**
	 * @inheritdoc
	 */
	
    public static function tableName()
	{
		return '{{%apm}}';
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
			[['apm_survey', 'apm_pid', 'apm_loc', 'apm_q1', 'apm_q2', 'apm_q3', 'apm_q4', 'apm_q5','apm_q6','apm_date'], 'required', 'message' => 'Cannot be blank.'],
			[['loc_code'], 'required', 'message' => 'Cannot be blank.'],	
			[['create_time', 'create_user', 'update_time', 'update_user'], 'integer', 'message' => 'Must be an integer'],
          		
			[['apm_survey', 'apm_pid', 'apm_loc'], 'string', 'max' => 100],
		    [['apm_q1'], 'string', 'max' => 6],	
			[['apm_q2','apm_q3','apm_q4','apm_q5','apm_q6'], 'string', 'max' => 5],			
			[['apm_q1','apm_q2','apm_q3','apm_q4','apm_q5','apm_q6'], 'number', 'message' => 'Must be a Numeric'],					
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
			'apm_id' => Yii::t('app', 'ID'),
			'apm_survey' => Yii::t('app', 'Survey'),
			'apm_pid' => Yii::t('app', 'Client ID'),
			'apm_loc' => Yii::t('app', 'State'),
			'loc_code' => Yii::t('app', 'Location'),
			'apm_date' => Yii::t('app', 'Date'),
			'apm_q1' => Yii::t('app', '19. Height '),
			'apm_q2' => Yii::t('app', '20. Weight '),
			'apm_q3' => Yii::t('app', '21. BMI'),
			'apm_q4' => Yii::t('app', '22. Waist circumference '),			
			'apm_q5' => Yii::t('app', '23. Hip circumference '),	
            'apm_q6' => Yii::t('app', '24. Waist to hip ratio'),			
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
		 $this->apm_pid = strtoupper($this->apm_pid);		 
			 if($this->apm_date != "")
				$this->apm_date = Converter::toStore($this->apm_date);
			
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
			if(!empty($this->apm_date) && is_numeric($this->apm_date))
				$this->apm_date = Converter::toDisplay($this->apm_date);
		}
	}
	
		
	
}

