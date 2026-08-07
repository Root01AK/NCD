<?php

namespace app\models;

use Yii;
use yii\behaviors\TimestampBehavior;

/**
 * This is the model class for table "{{%fieldmaster}}".
 *
 * @property integer $fld_mstr_id
 * @property string $fld_mstr_frmfield
 * @property string $fld_mstr_code
 * @property string $fld_mstr_desc
 * @property string $status
 * @property integer $create_time
 * @property integer $create_user
 * @property integer $update_time
 * @property integer $update_user
 * @property integer $record_date
 */
class Fieldmaster extends \yii\db\ActiveRecord
{
	public $fldstatus = [0 => "N", 1 => "Y"];
	public $frmfield = [1 => "OST Visit"];
	
	/**
	 * @inheritdoc
	 */
    public static function tableName()
	{
		return '{{%fieldmaster}}';
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
			[['fld_mstr_frmfield', 'fld_mstr_code', 'fld_mstr_desc'], 'required'],
			[['fld_mstr_code'], 'unique', 'targetAttribute' => ['fld_mstr_frmfield', 'fld_mstr_code'], 'message' => 'The combination of Form Field and Code has already been taken.', 'comboNotUnique' => 'The combination of Form Field and Code has already been taken.'],
			[['create_time', 'create_user', 'update_time', 'update_user', 'record_date'], 'integer'],
			[['fld_mstr_frmfield', 'fld_mstr_code', 'fld_mstr_desc'], 'string', 'max' => 300],
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
			'fld_mstr_id' => Yii::t('app', 'Fld Mstr ID'),
			'fld_mstr_frmfield' => Yii::t('app', 'Form Field'),
			'fld_mstr_code' => Yii::t('app', 'Code'),
			'fld_mstr_desc' => Yii::t('app', 'Description'),
			'status' => Yii::t('app', 'Status'),
			'create_time' => Yii::t('app', 'Create Time'),
			'create_user' => Yii::t('app', 'Create User'),
			'update_time' => Yii::t('app', 'Update Time'),
			'update_user' => Yii::t('app', 'Update User'),
			'record_date' => Yii::t('app', 'Record Date'),
		];
	}
}
