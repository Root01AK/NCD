<?php

namespace app\models;

use Yii;
use yii\behaviors\TimestampBehavior;

/**
 * This is the model class for table "{{%locationmaster}}".
 *
 * @property integer $loc_id
 * @property string $loc_code
 * @property string $loc_name
 * @property string $status
 * @property integer $del_status
 * @property integer $create_time
 * @property integer $create_user
 * @property integer $update_time
 * @property integer $update_user
 */
class Locationmaster extends \yii\db\ActiveRecord
{
	/**
	 * @inheritdoc
	 */
	public $statusdum = [1 => "Y", 0 => "N"];
	 
    public static function tableName()
	{
		return '{{%locationmaster}}';
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
			[['loc_code', 'loc_name','state_code'], 'required'],
			[['del_status', 'create_time', 'create_user', 'update_time', 'update_user'], 'integer'],
			[['loc_id'], 'safe'],
			//[['loc_code'], 'unique', 'message' => '{attribute} Already Exists'],
			//[['loc_name'], 'unique', 'message' => '{attribute} Already Exists'],
			
			[['loc_code'], 'unique', 'targetAttribute' => ['state_code', 'loc_code'], 'message' => '{attribute} Already Exists'],	
			[['loc_name'], 'unique', 'targetAttribute' => ['loc_name','state_code', 'loc_code'], 'message' => '{attribute} Already Exists'],						
			[['loc_code'], 'string', 'max' => 2],
			[['loc_code'], 'string', 'length' => 2, 'notEqual' => 'Must be {length} digits'],
			
			[['loc_name'], 'string', 'max' => 255],
			[['status'], 'string', 'max' => 1],
			 
			['loc_code', 'codeValidates'],
			['loc_code', 'codecharValidates'],
			 
			// ['loc_code', 'ucodeValidates'],
			// ['loc_name', 'ulocValidates'],
			  
			[['record_date'], 'default', 'value' => strtotime(date('Y/m/d'))],
			[['del_status'], 'default', 'value' =>0],
		];
	}
	
	 public function getStatusdum()
	 {
		return $this->statusdum[$this->status];
		
	 }
	 
	 public function codecharValidates($attribute, $params) {
		if($this->loc_code != "") :		
		if(!preg_match('/^[a-zA-Z]*$/', substr($this->loc_code,0,2))) {
			$this->addError($attribute, 'First 2 characters of Location Code should be contain Alphabets only');
		}
		endif;
	}
	 
	 public function codeValidates($attribute, $params) {
		if($this->loc_code != "") :		
		if(!preg_match('/^[0-9a-zA-Z]*$/', $this->loc_code)) {
			$this->addError($attribute, 'Location Code should be contain Alphabets and Numbers only');
		}
		endif;
	}	
	
	 public function ucodeValidates($attribute, $params) {
		if($this->state_code != "" and $this->loc_code != "") {
			$Model = parent::find()->where(["loc_code" => $this->loc_code])->andWhere(["state_code" => $this->state_code])->one();
			if($Model !== null && count($Model) != 0)
				$this->addError($attribute, 'Location Code Already Exists');
		}
	}
	
	 public function ulocValidates($attribute, $params) {
		if($this->state_code != "" and $this->loc_code != "" and $this->loc_name != "") {
			$Model = parent::find()->where(["loc_code" => $this->loc_code])->andWhere(["state_code" => $this->state_code])->andWhere(["loc_name" => $this->loc_name])->one();
			if($Model !== null && count($Model) != 0)
				$this->addError($attribute, 'Location Name Already Exists');
		}
	}
	
	 public function getStatename()
    {
        return $this->hasOne(\app\models\State::className(), ['state_code' => 'state_code']);
    }

	/**
	 * @inheritdoc
	 */
	public function attributeLabels()
	{
		return [
			'loc_id' => Yii::t('app', 'Loc ID'),
			'loc_code' => Yii::t('app', 'Location Code'),
			'loc_name' => Yii::t('app', 'Location Name'),
			'state_code' => Yii::t('app', 'State'),
			'status' => Yii::t('app', 'Status'),
			'del_status' => Yii::t('app', 'Del Status'),
			'create_time' => Yii::t('app', 'Create Time'),
			'create_user' => Yii::t('app', 'Create User'),
			'update_time' => Yii::t('app', 'Update Time'),
			'update_user' => Yii::t('app', 'Update User'),
		];
	}
	
	public function beforeSave($insert)
	{
		if (parent::beforeSave($insert)) {
			$this->loc_code = strtoupper($this->loc_code);			
			return true;
		}
	}
}
