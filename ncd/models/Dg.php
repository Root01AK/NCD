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
 * @property integer $dg_id
 * @property string $dg_survey
 * @property string $dg_pid
 * @property string $dg_loc
 * @property string $dg_q1
 * @property string $dg_q2
 * @property integer $dg_q3
 * @property integer $dg_q4
 * @property integer $dg_q5
 * @property integer $dg_q6
 * @property integer $dg_q7
 * @property integer $dg_q8
 * @property integer $dg_q9
 * @property integer $dg_q10
 * @property string $dg_q11
 * @property integer $dg_q12
 * @property integer $dg_q13
 * @property string $dg_q14
 * @property string $dg_q15
 * @property string $dg_q16
 * @property integer $iccplus_date
 * @property integer $icc_date
 * @property string $status
 * @property integer $create_time
 * @property integer $create_user
 * @property integer $update_time
 * @property integer $update_user
 */
class Dg extends \yii\db\ActiveRecord
{
	public $q2 = [1 => "Male", 2 => "Female", 3 => "Transgender", 4 => "Prefer not to say"];	
	public $q4= [1 => 'Unemployed', 2 => 'Daily wage labourer', 3 => 'Domestic worker', 4 => 'Vendor', 5 => 'Driver', 6 => 'Artisan', 7 => 'Housewife/Home-based work', 8 => 'Other'];
	public $q5 = [1 => 'No formal education', 2 => 'Primary School', 3 => 'Secondary School', 4 => 'High School', 5 => 'College/University'];
	public $garea = ['G1' => "North", 'G2' => "South", 'G3' => "East", 'G4' => "West", 'G5' => "Center"];
	
	public $q5a = [0 => "0",1 => "1", 2 => "2", 3 => "3", 4 => "4", 5 => "5"];
	public $q5b = [1 => "Rented", 2 => "Owned"];	
	public $q5c = [1 => "Slum", 2 => "Flat", 3 => "Independent house", 4 => "Street dwellers"];
	
	/**
	 * @inheritdoc
	 */
	
    public static function tableName()
	{
		return '{{%dg}}';
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
			[['dg_survey', 'dg_pid', 'dg_loc', 'dg_q1', 'dg_q2', 'dg_q3', 'dg_q4', 'dg_q5', 'dg_q5a', 'dg_q5b', 'dg_q5c','dg_date','dg_geographical_area'], 'required', 'message' => 'Cannot be blank.'],
			[['loc_code'], 'required', 'message' => 'Cannot be blank.'],	
			[['dg_q1', 'dg_q2', 'dg_q4','dg_q5', 'create_time', 'create_user', 'update_time', 'update_user'], 'integer', 'message' => 'Must be an integer'],

           [['dg_q4a'], 'required', 'message' => 'Cannot be blank.', 'when' => function ($model) {
				return $model->dg_q4 == 8;
			}, 'whenClient' => "function (attribute, value) {
				return $('#dg-dg_q4').val() == '8';
			}"],			
			[['dg_survey', 'dg_pid', 'dg_loc'], 'string', 'max' => 100],
			[['dg_q1'], 'string', 'max' => 2],
			[['dg_q1'], 'string', 'length' => 2, 'notEqual' => 'Must be {length} digits'],				
			[['dg_q3'], 'string', 'max' => 150],
			[['dg_q4a'], 'string', 'max' => 50],		
			[['dg_pid'], 'pidValidates'],	
            [['dg_q4a'], 'occuValidate'],	            			
			
			[['status'], 'string', 'max' => 1],		
			
			[['record_date'], 'default', 'value' => strtotime(date('Y/m/d'))],
		];
	}
	
		public function occuValidate() {			
		if($this->dg_q4a !== ""){		  
		   if(!preg_match('/^[a-zA-Z]/', $this->dg_q4a))			  
			$this->addError('dg_q4a', 'Occupation Name starting with Alphapet');
		}
	}


	/**
	 * @inheritdoc
	 */
	public function attributeLabels()
	{
		return [
			'dg_id' => Yii::t('app', 'ID'),
			'dg_survey' => Yii::t('app', 'Survey'),
			'dg_pid' => Yii::t('app', 'Client ID'),
			'dg_loc' => Yii::t('app', 'State'),
			'loc_code' => Yii::t('app', 'Location'),
			'dg_geographical_area' => Yii::t('app', 'Geographical Area'),
			'dg_date' => Yii::t('app', 'Date'),
			'dg_q1' => Yii::t('app', '1. Age'),
			'dg_q2' => Yii::t('app', '2. Gender'),
			'dg_q3' => Yii::t('app', '3. Area/Locality (Slum)'),
			'dg_q4' => Yii::t('app', '4. Occupation'),
			'dg_q4a' => Yii::t('app', '4a. Specify Other'),
			'dg_q5' => Yii::t('app', '5. Education Level'),	
            'dg_q5a' => Yii::t('app', '5a. Number of dependents'),	
            'dg_q5b' => Yii::t('app', '5b. Living place is'),	
            'dg_q5c' => Yii::t('app', '5c. Type'),				
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
	
	
	public function pidValidates($attribute, $params) {
		if($this->dg_pid != "") {
		 if((substr($this->dg_pid, 3, 4)) >3335) {
			$this->addError('dg_pid', 'Reached Maximum Number of Participants Limit');
		 }
		}
	}

	
	public function beforeSave($insert)
	{
		if (parent::beforeSave($insert)) {		
		 $this->dg_pid = strtoupper($this->dg_pid);	
         $this->dg_q3 = strtoupper($this->dg_q3);			 
			 if($this->dg_date != "")
				$this->dg_date = Converter::toStore($this->dg_date);
			
	        return true;
	    } else {
	        return false;
	    }
	}
	
	public function afterFind()
	{
		parent::afterFind();
		if(Yii::$app->controller->action->id != "view") {
			if($this->dg_date != "")
				$this->dg_date = Converter::toDisplay($this->dg_date);
			
		}
	}
	
		
	
}

