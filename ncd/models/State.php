<?php

namespace app\models;

use Yii;
use app\behaviours\ActiveRecordLogableBehavior;
use yii\behaviors\TimestampBehavior;
use yii\db\ActiveRecord;

/**
 * This is the model class for table "{{%labdeptmaster}}".
 *
 * @property integer $st_id
 * @property string $dept_code
 * @property string $state
 * @property string $status
 * @property integer $create_time
 * @property integer $create_user
 * @property integer $update_time
 * @property integer $update_user
 */
class State extends \yii\db\ActiveRecord
{
	 public $statusdum = [1 => "Y", 0 => "N"];
    /**
     * @inheritdoc
     */
    public static function tableName()
    {        
		return '{{%statemaster}}';
    }

    /**
     * @inheritdoc
     */
	public function behaviors()
	{
		return [
			/*
			[
				'class' => ActiveRecordLogableBehavior::className(),
				'createdAtAttribute' => 'create_time',
				'updatedAtAttribute' => 'update_time',
				'value' => date('U'),
			],
			*/
			[
				'class' => TimestampBehavior::className(),
				'createdAtAttribute' => 'create_time',
				'updatedAtAttribute' => 'update_time',
				'value' => date('U'),
			],
		];
	}

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['state','state_code'], 'required'],
            [['state'], 'string'],
			[['state'], 'unique', 'message' => '{attribute} Already Exists'],
			
			[['state_code'], 'string', 'max' => 2],			
			[['state_code'], 'string', 'length' => 2, 'notEqual' => 'Must be {length} digits'],
			[['state_code'], 'unique', 'message' => '{attribute} Already Exists'],
			[['state_code'], 'uidValidates'],
			
            [['create_time', 'create_user', 'update_time', 'update_user'], 'integer'],
            [['status'], 'string', 'max' => 1],
			[['record_date'], 'default', 'value' => strtotime(date('Y/m/d'))],
        ];
    }
	
	public function uidValidates() {
		if($this->state_code != "") :		
		if(!preg_match('/^[a-zA-Z]*$/', $this->state_code)) {
			$this->addError('state_code', 'UID Code should be contain Alphabets only');
		}
		endif;
	}

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'st_id' => Yii::t('app', 'State ID'),
            'state' => Yii::t('app', 'State Name'),
			'state_code' => Yii::t('app', 'State Code'),
            'status' => Yii::t('app', 'Status'),
            'create_time' => Yii::t('app', 'Created Time'),
            'create_user' => Yii::t('app', 'Created By'),
            'update_time' => Yii::t('app', 'Last Updated Time'),
            'update_user' => Yii::t('app', 'Last Updated By'),
        ];
    }
	
	
	 public function getStatusdum()
	 {
		return $this->statusdum[$this->status];
		
	 }
	 
	 public function beforeSave($insert)
	{
		if (parent::beforeSave($insert)) {		
			
			 $this->state_code = strtoupper($this->state_code);
			 $this->state = strtoupper($this->state);
			
	        return true;
	    } else {
	        return false;
	    }
	}
	
}
