<?php

namespace app\models;

use Yii;
use yii\behaviors\TimestampBehavior;
use app\base\Converter;

/**
 * This is the model class for table "{{%mortalityform}}".
 *
 * @property integer $mortality_form_id
 * @property string $mortality_form_survey
 * @property string $mortality_form_loc
 * @property string $mortality_form_part_id
 * @property string $mortality_form_q1
 * @property string $mortality_form_q2
 * @property integer $mortality_form_q3
 * @property integer $mortality_form_q4
 * @property string $mortality_form_q5
 * @property string $status
 * @property integer $create_time
 * @property integer $create_user
 * @property integer $update_time
 * @property integer $update_user
 */
class Mortalityform extends \yii\db\ActiveRecord
{
	public $q1 = [1 => 'Spouse', 2 => 'Parent', 3 => 'Child', 4 => 'Friend', 5 => 'ICC client',7 => 'Photographic evidence', 6 => 'Other'];
	public $q2 = [1 => 'Outreach worker', 2 => 'Site coordinator', 3 => 'Cohort manager', 4 => 'Nurse/Doctor', 5 => 'Counselor', 6 => 'Other'];
	public $q4 = [1 => 'Accident/trauma', 2 => 'Suicide', 3 => 'Homicide', 4 => 'Overdose', 5 => 'HIV/AIDS', 6 => 'TB', 7 => 'HCV / Liver', 8 => 'Other medical illness', 9 => 'Other', 10 => 'No information on cause of death'];

	/**
	 * @inheritdoc
	 */
    public static function tableName()
	{
		return '{{%mortalityform}}';
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
			[['mortality_form_survey', 'mortality_form_loc', 'mortality_form_part_id', 'mortality_form_q1', 'mortality_form_q2', 'mortality_form_q3', 'mortality_form_q4'], 'required', 'message' => 'Cannot be blank.'],
			[['mortality_form_q4', 'create_time', 'create_user', 'update_time', 'update_user'], 'integer', 'message' => 'Must be an integer'],
			[['mortality_form_q3'], 'safe'],
			[['mortality_form_q5'], 'required', 'message' => 'Cannot be blank.', 'when' => function ($model) {
				return $model->mortality_form_q4 == 9;
			}, 'whenClient' => "function (attribute, value) {
				return $('#mortalityform-mortality_form_q4').val() == '9';
			}"],
			[['mortality_form_survey', 'mortality_form_loc', 'mortality_form_part_id'], 'string', 'max' => 11],			
			[['mortality_form_q5'], 'string', 'max' => 50],
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
			'mortality_form_id' => Yii::t('app', 'Mortality Form ID'),
			'mortality_form_survey' => Yii::t('app', 'Survey'),
			'mortality_form_loc' => Yii::t('app', 'State'),
			'loc_code' => Yii::t('app', 'Location'),
			'mortality_form_part_id' => Yii::t('app', 'Client ID'),
			'mortality_form_q1' => Yii::t('app', '1. Please indicate data source(s) for entry (SELECT ALL THAT APPLY)'),
			'mortality_form_q2' => Yii::t('app', '2. Staff member who took report directly (SELECT ALL THAT APPLY)'),
			'mortality_form_q3' => Yii::t('app', '3. Date of death'),
			'mortality_form_q4' => Yii::t('app', '4. Cause of death'),
			'mortality_form_q5' => Yii::t('app', '5. Specify Other'),
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
			if($this->mortality_form_q3 != "")
				$this->mortality_form_q3 = Converter::toStore($this->mortality_form_q3);
	        return true;
	    } else {
	        return false;
	    }
	}

	public function afterFind()
	{
		parent::afterFind();
		if(Yii::$app->controller->action->id != "index" && Yii::$app->controller->action->id != "view") {
			$this->mortality_form_q1 = explode(",", $this->mortality_form_q1);
			$this->mortality_form_q2 = explode(",", $this->mortality_form_q2);
			if($this->mortality_form_q3 != "")
				$this->mortality_form_q3 = Converter::toDisplay($this->mortality_form_q3);
		}
	}
}
