<?php

namespace app\models;

use Yii;
use yii\helpers\Html;
use yii\behaviors\TimestampBehavior;
use app\base\Converter;


/**
 * This is the model class for table "{{%attandance}}".
 *
 * @property integer $id
 * @property string $sid
 * @property string $location
 * @property string $pid
 * @property string $participant_id
 * @property string $interviewer
 * @property string $visit
 * @property string $visit_date
 * @property integer $visit_in
 * @property string $out_interviewer
 * @property integer $visit_out
 * @property string $status
 * @property integer $create_time
 * @property integer $create_user
 * @property integer $update_time
 * @property integer $update_user
 */
class Attandance extends \yii\db\ActiveRecord
{
	/**
	 * @inheritdoc
	 */
    public static function tableName()
	{
		return '{{%attandance}}';
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
			[['sid', 'location', 'pid', 'interviewer','state_code','loc_code'], 'required', 'message' => 'Cannot be blank.'],
			[['out_interviewer','visit'], 'safe'],
			[['interviewer','out_interviewer', 'visit', 'visit_date', 'visit_in', 'visit_out', 'create_time', 'create_user', 'update_time', 'update_user'], 'integer', 'message' => 'Must be an integer'],
						
			[['out_interviewer'], 'required', 'message' => 'Cannot be blank.', 'when' => function ($model) {
				return ($model->out_interviewer == '' && $model->visit_out !==null);
			}, 'whenClient' => "function (attribute, value) {
				return ($('#attandance-out_interviewer').val() == '' && $('#attandance-visit_out').val() !==null);
			}"],
						
			[['sid', 'location', 'pid', 'participant_id'], 'string', 'max' => 20],
			[['interviewer', 'out_interviewer'], 'string', 'max' => 3],
			[['remarks'], 'string', 'max' => 250],
			[['status'], 'string', 'max' => 1],
			[['visit_date','record_date'], 'default', 'value' => strtotime(date('Y/m/d'))],		
		];
	}

	
	/**
	 * @inheritdoc
	 */
	public function attributeLabels()
	{
		return [
			'id' => Yii::t('app', 'ID'),
			'sid' => Yii::t('app', 'Survey'),
			'state_code' => Yii::t('app', 'State'),
			'loc_code' => Yii::t('app', 'Spoke'),
			'pid' => Yii::t('app', 'Client ID'),
			'participant_id' => Yii::t('app', 'Participant ID'),
			'interviewer' => Yii::t('app', 'Site Coordinator'),
			'visit' => Yii::t('app', 'Visit'),
			'visit_date' => Yii::t('app', 'Visit Date'),
			'visit_in' => Yii::t('app', 'Visit In'),
			'out_interviewer' => Yii::t('app', 'Site Coordinator'),
			'remarks' => Yii::t('app', 'Remarks'),
			'visit_out' => Yii::t('app', 'Visit Out'),
			'status' => Yii::t('app', 'Status'),
			'create_time' => Yii::t('app', 'Create Time'),
			'create_user' => Yii::t('app', 'Create User'),
			'update_time' => Yii::t('app', 'Update Time'),
			'update_user' => Yii::t('app', 'Update User'),
		];
	}

	public function beforeSave($insert)
	{
		if (parent::beforeSave($insert)) {			   
			$Vmodel = Attandance::find()->where(['pid' => $this->pid])->count();
			if ($this->isNewRecord) {
				if (empty($Vmodel))
	        		$this->visit = 1;
	        	else
	        		$this->visit = ($Vmodel+1);

	        	$this->participant_id = $this->pid;
	        	$this->visit_in = date('U');
			} else {
				    if($this->out_interviewer !='') {
				      $this->participant_id = $this->pid;				
	        		  $this->visit_out = date('U');
					}
			}
			return true;
		}
	}

    public function getSurvey()
    {
        return $this->hasOne(\app\models\Surveymaster::className(), ['sur_code' => 'sid']);
    }

    public function getLocations()
    {
        return $this->hasOne(\app\models\Locationmaster::className(), ['loc_code' => 'loc_code']);
    }

   
    public function getRegistration()
    {
        return $this->hasOne(\app\models\Registration::className(), ['corfrm_pid' => 'participant_id']);
    }
	
	
	
	
	public function getOST($fmt = "html")
	{
		$Gmodel = \app\models\Ostmaster::find()->where(["ost_master_part_id" => $this->pid])->andWhere(["IS","ost_master_q3",NULL])->one();
		if($Gmodel !== null) {
			$class = "success";
			 return Html::tag('span', $Gmodel->ost_master_q1, ['class' => 'label label-'.$class]);
	    	}
		else {
			$class = "danger";			
			return Html::tag('span', "OST ID not yet Registered", ['class' => 'label label-'.$class]);
		}
	}
	/*
	
	public function getOST()
	{
		$Gmodel = \app\models\Ostmaster::find()->where(["ost_master_part_id" => $this->pid])->andWhere(["IS","ost_master_q3",NULL])->one();
		if($Gmodel !== null)
			return $Gmodel->ost_master_q1;
		else
			return "OST ID not yet Registered";
	} 
	
	public function getClientHIVStatus($fmt = "html")
	{
		$class = "default";
		if($this->corfrm_q12 == "0") {
			$class = "danger";
		} elseif($this->corfrm_q12 == "1") {
			$class = "success";
		} elseif($this->corfrm_q12 == "2") {
			$class = "warning";
		} elseif($this->corfrm_q12 == "9") {
			$class = "info";
		}
		if($this->corfrm_q12 !== "") {
			if($fmt == "html")
				return Html::tag('span', $this->q12[$this->corfrm_q12], ['class' => 'label label-'.$class]);
			else
				return $this->q12[$this->corfrm_q12];
		}
		else
			return $this->corfrm_q12;
	}
	*/
	
	public function getOSTTaken()
	{
		$today = strtotime(date("Y/m/d"));
		$Gmodel = \app\models\Ostmaster::find()->where(["ost_master_part_id" => $this->pid])->andWhere(['IS', "ost_master_q3", Null])->one();
		$Omodel = \app\models\Ostvisit::find()->where(["ost_visit_part_id" => $this->pid])->andWhere(["record_date" => $today])->orderBy(['record_date' => SORT_DESC])->one();
				
		if($Gmodel == null)	          		
			return "N/A";
		elseif($Gmodel !== null && $Omodel !== null) 
		  return "Yes";
		else
			return "-";
	}

    

}
