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
 * @property integer $ce_id
 * @property string $ce_survey
 * @property string $ce_pid
 * @property string $ce_loc
 * @property string $ce_q1
 * @property string $ce_q2
 * @property integer $ce_q3
 * @property integer $ce_q4
 * @property integer $ce_q5
 * @property integer $ce_q6
 * @property integer $ce_q7
 * @property integer $ce_q8
 * @property integer $ce_q9
 * @property integer $ce_q10
 * @property string $ce_q11
 * @property integer $ce_q12
 * @property integer $ce_q13
 * @property string $ce_q14
 * @property string $ce_q15
 * @property string $ce_q16
 * @property integer $iccplus_date
 * @property integer $icc_date
 * @property string $status
 * @property integer $create_time
 * @property integer $create_user
 * @property integer $update_time
 * @property integer $update_user
 */
class Ce extends \yii\db\ActiveRecord
{
	public $yes_no = [1 => "Yes", 2 => "No", 3 => "Referral after laboratory diagnosis"];
    public $patsex;
	/**
	 * @inheritdoc
	 */
	
    public static function tableName()
	{
		return '{{%ce}}';
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
			[['ce_survey', 'ce_pid', 'ce_loc', 'ce_date', 'ce_q1', 'ce_q2', 'ce_q3', 'ce_q4a', 'ce_q4b','ce_q6'], 'required', 'message' => 'Cannot be blank.'],
			[['status','record_date'], 'safe'],
			[['loc_code'], 'required', 'message' => 'Cannot be blank.'],	
			[['create_time', 'create_user', 'update_time', 'update_user'], 'integer', 'message' => 'Must be an integer'],
			
			 [['ce_q6a'], 'required', 'message' => 'Cannot be blank.', 'when' => function ($model) {
				return $model->ce_q6 == 1;
			}, 'whenClient' => "function (attribute, value) {
				return $('#ce-ce_q6').val() == '1';
			}"],
			
			 [['ce_q5a', 'ce_q5b'], 'required', 'message' => 'Cannot be blank.', 'when' => function ($model) {
				return $model->patsex == 2;
			}, 'whenClient' => "function (attribute, value) {
				return $('#ce-patsex').val() == '2';
			}"],
			          		
			[['ce_survey', 'ce_pid', 'ce_loc'], 'string', 'max' => 100],
			[['ce_q1', 'ce_q2', 'ce_q3', 'ce_q4a', 'ce_q4b','ce_q5a', 'ce_q5b',], 'string', 'max' => 250],	
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
			'ce_id' => Yii::t('app', 'ID'),
			'ce_survey' => Yii::t('app', 'Survey'),
			'ce_pid' => Yii::t('app', 'Client ID'),
			'ce_loc' => Yii::t('app', 'State'),
			'loc_code' => Yii::t('app', 'Location'),
			'ce_date' => Yii::t('app', 'Date'),			
			'ce_q1' => Yii::t('app', '28. General Examination: PICCLE  '),
			'ce_q2' => Yii::t('app', '29. Examination of oral cavity: any infective changes, precancerous lesions, submucous fibrosis  '),
			'ce_q3' => Yii::t('app', '30. Examination of cervical, axillary and epitrochlear lymph nodes: '),
			'ce_q4a' => Yii::t('app', 'a. Cardiovascular system: Normal heart sounds, any murmurs or extra sounds heard'),	
			'ce_q4b' => Yii::t('app', 'b. Respiratory system: Normal breath sounds, any added sounds '),		
			'ce_q5a' => Yii::t('app', 'a. Breast clinical examination findings:  '),
            'ce_q5b' => Yii::t('app', 'b. VIA findings: '),			
            'ce_q6' => Yii::t('app', '33. Referred for further diagnosis or treatment?'),			
			'ce_q6a' => Yii::t('app', '33a. If Yes, referred to which facility? '),				
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
		 $this->ce_pid = strtoupper($this->ce_pid);		 
			 if($this->ce_date != "")
				$this->ce_date = Converter::toStore($this->ce_date);
			
	        return true;
	    } else {
	        return false;
	    }
	}
	
	public function afterFind()
	{
		parent::afterFind();
		if(Yii::$app->controller->action->id != "view") {
			if($this->ce_date != "")
				$this->ce_date = Converter::toDisplay($this->ce_date);
			
		}
	}
	
		
	
}

