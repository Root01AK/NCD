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
 * @property integer $bsr_id
 * @property string $bsr_survey
 * @property string $bsr_pid
 * @property string $bsr_loc
 * @property string $bsr_q1
 * @property string $bsr_q2
 * @property integer $bsr_q3
 * @property integer $bsr_q4
 * @property integer $bsr_q5
 * @property integer $bsr_q6
 * @property integer $bsr_q7
 * @property integer $bsr_q8
 * @property integer $bsr_q9
 * @property integer $bsr_q10
 * @property string $bsr_q11
 * @property integer $bsr_q12
 * @property integer $bsr_q13
 * @property string $bsr_q14
 * @property string $bsr_q15
 * @property string $bsr_q16
 * @property integer $iccplus_date
 * @property integer $icc_date
 * @property string $status
 * @property integer $create_time
 * @property integer $create_user
 * @property integer $update_time
 * @property integer $update_user
 */
class Bsr extends \yii\db\ActiveRecord
{
	
	/**
	 * @inheritdoc
	 */
	
    public static function tableName()
	{
		return '{{%bsr}}';
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
			[['bsr_survey', 'bsr_pid', 'bsr_loc','bsr_date'], 'required', 'message' => 'Cannot be blank.'],
			[['loc_code'], 'required', 'message' => 'Cannot be blank.'],	
			[['create_time', 'create_user', 'update_time', 'update_user'], 'integer', 'message' => 'Must be an integer'],
			[['bsr_random_sugar', 'bsr_tot_cholesterol', 'bsr_triglycerides', 'bsr_hdl', 'bsr_ldl', 'bsr_creatinine', 'bsr_urea', 'bsr_tot_bilirubin', 'bsr_sgot', 'bsr_sgpt', 'bsr_tot_protein', 'bsr_albumin'], 'safe'],
          		
			[['bsr_survey', 'bsr_pid', 'bsr_loc'], 'string', 'max' => 100],		    
			//[['bsr_random_sugar', 'bsr_tot_cholesterol', 'bsr_triglycerides', 'bsr_hdl', 'bsr_ldl'], 'string', 'max' => 3],			
			[['bsr_random_sugar', 'bsr_tot_cholesterol', 'bsr_triglycerides', 'bsr_hdl', 'bsr_ldl','bsr_creatinine','bsr_tot_bilirubin', 'bsr_tot_protein', 'bsr_albumin', 'bsr_urea','bsr_sgot', 'bsr_sgpt'], 'string', 'max' => 6],	

           // [['bsr_random_sugar', 'bsr_tot_cholesterol', 'bsr_triglycerides', 'bsr_hdl', 'bsr_ldl'],  'integer', 'message' => 'Must be an integer'],
			
			[['bsr_random_sugar', 'bsr_tot_cholesterol', 'bsr_triglycerides', 'bsr_hdl', 'bsr_ldl','bsr_creatinine','bsr_tot_bilirubin', 'bsr_tot_protein', 'bsr_albumin', 'bsr_urea','bsr_sgot', 'bsr_sgpt'], 'number', 'message' => 'Must be a Numeric'],		
			
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
			'bsr_id' => Yii::t('app', 'ID'),
			'bsr_survey' => Yii::t('app', 'Survey'),
			'bsr_pid' => Yii::t('app', 'Client ID'),
			'bsr_loc' => Yii::t('app', 'State'),
			'loc_code' => Yii::t('app', 'Location'),
			'bsr_date' => Yii::t('app', 'Date'),
			'bsr_random_sugar' => Yii::t('app', '34. Random Blood Sugar'),
		    'bsr_tot_cholesterol' => Yii::t('app', '35. Total Cholesterol'),
		    'bsr_triglycerides' => Yii::t('app', '36. Triglycerides'),
		    'bsr_hdl' => Yii::t('app', '37. HDL'),
		    'bsr_ldl' => Yii::t('app', '38. LDL'),
		    'bsr_creatinine' => Yii::t('app', '39. Serum Creatinine '), 
		    'bsr_urea' => Yii::t('app', '40. Blood Urea '),		   
		    'bsr_tot_bilirubin' => Yii::t('app', '41. Total Serum Bilirubin '),
		    'bsr_sgot' => Yii::t('app', '42. SGOT (AST)'),
		    'bsr_sgpt' => Yii::t('app', '43. SGPT (ALT)'),
		    'bsr_tot_protein' => Yii::t('app', '44. Total Protein'),
		    'bsr_albumin' => Yii::t('app', '45. Albumin'),	
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
		 $this->bsr_pid = strtoupper($this->bsr_pid);		 
			 if($this->bsr_date != "")
				$this->bsr_date = Converter::toStore($this->bsr_date);
			
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
			if(!empty($this->bsr_date) && is_numeric($this->bsr_date))
				$this->bsr_date = Converter::toDisplay($this->bsr_date);
		}
	}
	
		
	
}

