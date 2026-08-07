<?php

namespace app\models;

use Yii;
use app\models\Mortalityform;
use yii\behaviors\TimestampBehavior;
use app\base\Converter;

/**
 * This is the model class for table "{{%trackingform}}".
 *
 * @property integer $track_form_id
 * @property string $track_form_survey
 * @property string $track_form_loc
 * @property string $track_form_part_id
 * @property integer $track_form_q1
 * @property integer $track_form_q2
 * @property integer $track_form_q3
 * @property integer $track_form_q4
 * @property string $status
 * @property integer $create_time
 * @property integer $create_user
 * @property integer $update_time
 * @property integer $update_user
 */
class Trackingform extends \yii\db\ActiveRecord
{
	public $q2 = [1 => 'Overdue for cohort study visit', 2 => 'Overdue for ARV pick-up', 3 => 'Overdue for HIV doctor visit or CD4 count', 4 => 'Overdue for HIV test', 5 => 'Other'];
	public $q3 = [1 => 'Cell phone', 2 => 'Visit home address', 3 => 'Visit hang-out or other location', 4 => 'Call or visit client\'s contacts', 5 => 'Other'];
	public $q4 = [1 => 'Client not found', 2 => 'Client migrated out of area', 3 => 'Client died (Fill out Death Form)', 4 => 'Client found and indicates willingness to follow-up', 5 => 'Client found and indicates unwillingness to follow-up', 6 => 'Client in Jail'];

	/**
	 * @inheritdoc
	 */
    public static function tableName()
	{
		return '{{%trackingform}}';
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
			[['track_form_survey', 'track_form_loc', 'track_form_part_id', 'track_form_q1', 'track_form_q2', 'track_form_q3', 'track_form_q4'], 'required', 'message' => 'Cannot be blank.'],
			[['track_form_q4', 'create_time', 'create_user', 'update_time', 'update_user'], 'integer', 'message' => 'Must be an integer'],
			[['track_form_survey', 'track_form_loc', 'track_form_part_id'], 'string', 'max' => 11],
			// [['track_form_q1', 'track_form_q2', 'track_form_q3'], 'safe'],
			[['track_form_q5'], 'string', 'max' => 250],
			[['loc_code'], 'required', 'message' => 'Cannot be blank.'],	
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
			'track_form_id' => Yii::t('app', 'Track Form ID'),
			'track_form_survey' => Yii::t('app', 'Survey'),
			'track_form_loc' => Yii::t('app', 'State'),
			'loc_code' => Yii::t('app', 'Location'),
			'track_form_part_id' => Yii::t('app', 'Client ID'),
			'track_form_q1' => Yii::t('app', '1. Date of tracking'),
			'track_form_q2' => Yii::t('app', '2. What was the reason for tracking this client (SELECT ALL THAT APPLY)'),
			'track_form_q3' => Yii::t('app', '3. What methods were used to track the client? (SELECT ALL THAT APPLY)'),
			'track_form_q4' => Yii::t('app', '4. Outcome of tracking effort?'),
			'track_form_q5' => Yii::t('app', '5. Additional information'),
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
            if($this->track_form_q1 != "")			
			$this->track_form_q1 = Converter::toStore($this->track_form_q1);   
			 return true;
	    } else {
	        return false;
	    }
	}

	public function afterSave($insert, $changedAttributes)
	{
		parent::afterSave($insert, $changedAttributes);
		if($this->track_form_q4 == 3) {
			$Model = Mortalityform::find()->where(["mortality_form_part_id" => $this->track_form_part_id])->one();
			if($Model === null) {
				$Model = new Mortalityform();
				$Model->mortality_form_survey = $this->track_form_survey;
				$Model->mortality_form_part_id = $this->track_form_part_id;
				$Model->record_date = strtotime(date('Y/m/d'));
				$Model->create_user = $this->create_user;
				$Model->status = $this->status;
				$Model->save(false);
			}
			Yii::$app->response->redirect(['mortalityform/update', 'id' => $Model->mortality_form_id])->send();
		}
        return true;
	}

	public function afterFind()
	{
		parent::afterFind();
		if(Yii::$app->controller->action->id != "view") {
			$this->track_form_q1 = Converter::toDisplay($this->track_form_q1);
		} if(Yii::$app->controller->action->id == "update") {
			$this->track_form_q2 = explode(",", $this->track_form_q2);
			$this->track_form_q3 = explode(",", $this->track_form_q3);
		}
	}
}
