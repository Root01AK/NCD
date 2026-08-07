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
 * @property integer $cml_id
 * @property string $cml_survey
 * @property string $cml_pid
 * @property string $cml_loc
 * @property string $cml_q1
 * @property string $cml_q2
 * @property integer $cml_q3
 * @property integer $cml_q4
 * @property integer $cml_q5
 * @property integer $cml_q6
 * @property integer $cml_q7
 * @property integer $cml_q8
 * @property integer $cml_q9
 * @property integer $cml_q10
 * @property string $cml_q11
 * @property integer $cml_q12
 * @property integer $cml_q13
 * @property string $cml_q14
 * @property string $cml_q15
 * @property string $cml_q16
 * @property integer $iccplus_date
 * @property integer $icc_date
 * @property string $status
 * @property integer $create_time
 * @property integer $create_user
 * @property integer $update_time
 * @property integer $update_user
 */
class Cml extends \yii\db\ActiveRecord
{
	public $yes_no = [1 => "Yes", 2 => "No"];
	public $q6 = [1 => "Diet", 2 => "Exercise", 3 => "Stress Management", 4 => "Tobacco Cessation", 5 => "Alcohol Reduction", 6 => "Other"];
	
	/**
	 * @inheritdoc
	 */
	
    public static function tableName()
	{
		return '{{%cml}}';
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
			[['cml_survey', 'cml_pid', 'cml_loc',  'cml_q2', 'cml_q4','cml_q5','cml_q6','cml_date'], 'required', 'message' => 'Cannot be blank.'],
			[['loc_code'], 'required', 'message' => 'Cannot be blank.'],	
			[['create_time', 'create_user', 'update_time', 'update_user'], 'integer', 'message' => 'Must be an integer'],
			
			[['cml_q2a'], 'required', 'message' => 'Cannot be blank.', 'when' => function ($model) {
				return $model->cml_q2 == 1;
			}, 'whenClient' => "function (attribute, value) {
				return $('#cml-cml_q2').val() == '1';
			}"],
			
	       [['cml_q4_date'], 'required', 'message' => 'Cannot be blank.', 'when' => function ($model) {
				return $model->cml_q4 == 1;
			}, 'whenClient' => "function (attribute, value) {
				return $('#cml-cml_q4').val() == '1';
			}"],
			
		   [['cml_q6a'], 'required', 'message' => 'Cannot be blank.', 'when' => function ($model) {		
			}, 'whenClient' => "function (attribute, value) {				
				return $('#cml-cml_q6-6').prop('checked');
			}"],	
          		
			[['cml_survey', 'cml_pid', 'cml_loc'], 'string', 'max' => 100],					
			[['status'], 'string', 'max' => 1],		
            [['cml_q4_date'], 'fupdateValidate'],			
			
			[['record_date'], 'default', 'value' => strtotime(date('Y/m/d'))],
		];
	}
	
	public function fupdateValidate($attribute, $params) {
        if($this->cml_pid != "" && $this->cml_q4_date != "" ) :
		   $this->cml_q4_date = Converter::toStore($this->cml_q4_date);
		   
        $Pid=$this->cml_pid ;
		$Dmodel = Dg::find()->where(["dg_pid" => $Pid])->one();
			
	    if($Dmodel !== null && $Dmodel->dg_date !="" && $this->cml_q4_date <= Converter::toStore($Dmodel->dg_date)) {
	    	   $this->addError($attribute, 'Follow-up Date Cannot be Lesser than or Equal to Enrollment Date');
			   $this->cml_q4_date = Converter::toDisplay($this->cml_q4_date);	
	         }
		    else
			  $this->cml_q4_date = Converter::toDisplay($this->cml_q4_date);	
	    		
        endif;
	}


	/**
	 * @inheritdoc
	 */
	public function attributeLabels()
	{
		return [
			'cml_id' => Yii::t('app', 'ID'),
			'cml_survey' => Yii::t('app', 'Survey'),
			'cml_pid' => Yii::t('app', 'Client ID'),
			'cml_loc' => Yii::t('app', 'State'),
			'loc_code' => Yii::t('app', 'Location'),
			'cml_date' => Yii::t('app', 'Date'),
			'cml_q2' => Yii::t('app', '46. Linked for further diagnosis or treatment? '),
			'cml_q2a' => Yii::t('app', '46a. If Yes, linked to which facility?'),
			'cml_q4' => Yii::t('app', '47. Was a follow-up schedule provided?'),	
            'cml_q4_date' => Yii::t('app', 'Date'),			
			'cml_q5' => Yii::t('app', '48. Linked to a community health worker or support group?'),
            'cml_q6' => Yii::t('app', '49. Health education provided on lifestyle modifications? (Select all that apply)'),			
			'cml_q6a' => Yii::t('app', '49a. Specify Other'),			
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
		 $this->cml_pid = strtoupper($this->cml_pid);		 
			 if($this->cml_date != "")
				$this->cml_date = Converter::toStore($this->cml_date);
			if($this->cml_q4_date != "")
				$this->cml_q4_date = Converter::toStore($this->cml_q4_date);
			
	        return true;
	    } else {
	        return false;
	    }
	}
	
	public function afterFind()
	{
		parent::afterFind();
		if(Yii::$app->controller->action->id != "view") {
			if($this->cml_date != "")
				$this->cml_date = Converter::toDisplay($this->cml_date);
			if($this->cml_q4_date != "")
				$this->cml_q4_date = Converter::toDisplay($this->cml_q4_date);			
		}
		if(Yii::$app->controller->action->id == "update" ) {
			$this->cml_q6 = explode(",", $this->cml_q6);			
		}
	}
	
		
	
}


			
			
			