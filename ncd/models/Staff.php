<?php

namespace app\models;

use Yii;
use app\behaviours\ActiveRecordLogableBehavior;
use yii\behaviors\TimestampBehavior;
use yii\db\ActiveRecord;

/**
 * This is the model class for table "{{%labdeptmaster}}".
 *
 * @property integer $staff_id
 * @property string $dept_code
 * @property string $occu_name
 * @property string $status
 * @property integer $create_time
 * @property integer $create_user
 * @property integer $update_time
 * @property integer $update_user
 */
class Staff extends \yii\db\ActiveRecord
{    
     public $statusdum = [1 => "Y", 0 => "N"];
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
     
		return '{{%staffmaster}}';
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
			],
		];
	}

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['staff_code','staff_name'], 'required'],		
            [['staff_code','staff_name'], 'string'],			
			//[['staff_code'], 'unique', 'message' => '{attribute} Already Exists'],

            [['staff_code'], 'unique', 'targetAttribute' => ['staff_code'], 'message' => '{attribute} Already Exists'],
						
			[['staff_code'], 'string', 'max' =>5],			
			[['staff_code'], 'string', 'length' => 5, 'notEqual' => 'Must be {length} digits'],
			
			['staff_code', 'staffcodeValidates'],
					
            [['create_time', 'create_user', 'update_time', 'update_user'], 'integer'],			
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
			'staff_code' => Yii::t('app', 'Staff Code'),
            'staff_name' => Yii::t('app', 'Staff Name'),			
            'status' => Yii::t('app', 'Status'),
            'create_time' => Yii::t('app', 'Created Time'),
            'create_user' => Yii::t('app', 'Created By'),
            'update_time' => Yii::t('app', 'Last Updated Time'),
            'update_user' => Yii::t('app', 'Last Updated By'),
        ];
    }
	
		
	public function staffcodeValidates() {
		$this->staff_code = strtoupper($this->staff_code);
		if(!preg_match('/^[A-Za-z]{1}[0-9]*$/', $this->staff_code)) {
			$this->addError('staff_code', 'Staff Code is not Valid. Code should be like A1234');
		}
	}
	
	 public function getStatusdum()
	 {
		return $this->statusdum[$this->status];
		
	 }
	 

	public function beforeSave($insert)
	{
		if (parent::beforeSave($insert)) {		
			
			 $this->staff_code = strtoupper($this->staff_code);
			 $this->staff_name = strtoupper($this->staff_name);			
			 			 
	        return true;
	    } else {
	        return false;
	    }
	}
}
