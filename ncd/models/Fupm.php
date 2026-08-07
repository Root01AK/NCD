<?php

namespace app\models;

use Yii;
use yii\helpers\Html;
use yii\behaviors\TimestampBehavior;
use app\base\Converter;
use app\models\Applicationsettings;
use app\base\Common;
use app\models\Dg;

/**
 * This is the model class for table "{{%registration}}".
 *
 * @property integer $fupm_id
 * @property string $fupm_survey
 * @property string $fupm_pid
 * @property string $fupm_loc
 * @property string $fupm_q1
 * @property string $fupm_q9
 * @property integer $fupm_q3
 * @property integer $fupm_q4
 * @property integer $fupm_q5
 * @property integer $fupm_q8
 * @property integer $fupm_q7
 * @property integer $fupm_q8
 * @property integer $fupm_q9
 * @property integer $fupm_q10
 * @property string $fupm_q11
 * @property integer $fupm_q12
 * @property integer $fupm_q13
 * @property string $fupm_q14
 * @property string $fupm_q15
 * @property string $fupm_q16
 * @property integer $iccplus_date
 * @property integer $icc_date
 * @property string $status
 * @property integer $create_time
 * @property integer $create_user
 * @property integer $update_time
 * @property integer $update_user
 */
class Fupm extends \yii\db\ActiveRecord
{
	public $yes_no = [1 => "Yes", 2 => "No"];	
	
	/**
	 * @inheritdoc
	 */
	
    public static function tableName()
	{
		return '{{%fupm}}';
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
			[['fupm_survey', 'fupm_pid', 'fupm_loc', 'fupm_q7','fupm_date'], 'required', 'message' => 'Cannot be blank.'],
			[['loc_code'], 'required', 'message' => 'Cannot be blank.'],	
			[['create_time', 'create_user', 'update_time', 'update_user'], 'integer', 'message' => 'Must be an integer'],			    
            [['fupm_fupdate1','fupm_fupremarks1','fupm_fupdate2','fupm_fupremarks2','fupm_fupdate3','fupm_fupremarks3'], 'safe'],	    		
			[['fupm_survey', 'fupm_pid', 'fupm_loc'], 'string', 'max' => 100],					
			[['status'], 'string', 'max' => 1],			
			[['fupm_fupdate1'], 'fupdate1Validate'],
			[['fupm_fupdate2'], 'fupdate2Validate'],
			[['fupm_fupdate3'], 'fupdate3Validate'],
			[['record_date'], 'default', 'value' => strtotime(date('Y/m/d'))],
		];
	}
	
	public function fupdate1Validate($attribute, $params) {
        if($this->fupm_pid != "" && $this->fupm_fupdate1 != "" ) :
		   $this->fupm_fupdate1 = Converter::toStore($this->fupm_fupdate1);
		   
        $Pid=$this->fupm_pid ;
		$Dmodel = Dg::find()->where(["dg_pid" => $Pid])->one();
			
	    if($Dmodel !== null && $Dmodel->dg_date !="" && $this->fupm_fupdate1 <= Converter::toStore($Dmodel->dg_date)) {
	    	   $this->addError($attribute, 'Follow-up Date Cannot be Lesser than or Equal to Enrollment Date');
			   $this->fupm_fupdate1 = Converter::toDisplay($this->fupm_fupdate1);	
	         }
		    else
			  $this->fupm_fupdate1 = Converter::toDisplay($this->fupm_fupdate1);	
	    		
        endif;
	}
	
	public function fupdate2Validate($attribute, $params) {
        if($this->fupm_pid != "" && $this->fupm_fupdate2 != "" ) :
		   $this->fupm_fupdate2 = Converter::toStore($this->fupm_fupdate2);
		   
        $Pid=$this->fupm_pid ;
		$Dmodel = Dg::find()->where(["dg_pid" => $Pid])->one();
			
	    if($Dmodel !== null && $Dmodel->dg_date !="" && $this->fupm_fupdate2 <= Converter::toStore($Dmodel->dg_date)) {
	    	   $this->addError($attribute, 'Follow-up Date Cannot be Lesser than or Equal to Enrollment Date');
			   $this->fupm_fupdate2 = Converter::toDisplay($this->fupm_fupdate2);	
	         }
		    else
			  $this->fupm_fupdate2 = Converter::toDisplay($this->fupm_fupdate2);	
	    		
        endif;
	}
	
	
	public function fupdate3Validate($attribute, $params) {
        if($this->fupm_pid != "" && $this->fupm_fupdate3 != "" ) :
		   $this->fupm_fupdate3 = Converter::toStore($this->fupm_fupdate3);
		   
        $Pid=$this->fupm_pid ;
		$Dmodel = Dg::find()->where(["dg_pid" => $Pid])->one();
			
	    if($Dmodel !== null && $Dmodel->dg_date !="" && $this->fupm_fupdate3 <= Converter::toStore($Dmodel->dg_date)) {
	    	   $this->addError($attribute, 'Follow-up Date Cannot be Lesser than or Equal to Enrollment Date');
			   $this->fupm_fupdate3 = Converter::toDisplay($this->fupm_fupdate3);	
	         }
		    else
			  $this->fupm_fupdate3 = Converter::toDisplay($this->fupm_fupdate3);	
	    		
        endif;
	}
	


	/**
	 * @inheritdoc
	 */
	public function attributeLabels()
	{
		return [
			'fupm_id' => Yii::t('app', 'ID'),
			'fupm_survey' => Yii::t('app', 'Survey'),
			'fupm_pid' => Yii::t('app', 'Client ID'),
			'fupm_loc' => Yii::t('app', 'State'),
			'loc_code' => Yii::t('app', 'Location'),
			'fupm_date' => Yii::t('app', 'Date'),
            'fupm_q7' => Yii::t('app', '50. Follow-up Date Outcome/Notes Follow-Up Required? '),	
            'fupm_fupdate1' => Yii::t('app', '1. Date'),
            'fupm_fupremarks1' => Yii::t('app', '1. Remarks'),	
			'fupm_fupdate2' => Yii::t('app', '2. Date'),
            'fupm_fupremarks2' => Yii::t('app', '2. Remarks'),	
			'fupm_fupdate3' => Yii::t('app', '3. Date'),
            'fupm_fupremarks3' => Yii::t('app', '3. Remarks'),	
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
		 $this->fupm_pid = strtoupper($this->fupm_pid);		 
			 if($this->fupm_date != "")
				$this->fupm_date = Converter::toStore($this->fupm_date);
            if($this->fupm_fupdate1 != "")
				$this->fupm_fupdate1 = Converter::toStore($this->fupm_fupdate1);	
            if($this->fupm_fupdate2 != "")
				$this->fupm_fupdate2 = Converter::toStore($this->fupm_fupdate2);	
            if($this->fupm_fupdate3 != "")
				$this->fupm_fupdate3 = Converter::toStore($this->fupm_fupdate3);				
	        return true;
	    } else {
	        return false;
	    }
	}
	
	public function afterFind()
	{
		parent::afterFind();
		if(Yii::$app->controller->action->id != "view") {
			if($this->fupm_date != "")
				$this->fupm_date = Converter::toDisplay($this->fupm_date);
            if($this->fupm_fupdate1 != "")
				$this->fupm_fupdate1 = Converter::toDisplay($this->fupm_fupdate1);
            if($this->fupm_fupdate2 != "")
				$this->fupm_fupdate2 = Converter::toDisplay($this->fupm_fupdate2);		
           if($this->fupm_fupdate3 != "")
				$this->fupm_fupdate3 = Converter::toDisplay($this->fupm_fupdate3);					
		}
		
	}
	
		
	
}


			
			
			