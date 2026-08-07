<?php

namespace app\models;

use Yii;
use app\models\Submenu;
use yii\behaviors\TimestampBehavior;

/**
 * This is the model class for table "{{%menuprivileges}}".
 *
 * @property integer $mnu_acs_id
 * @property integer $mnu_acs_usr_id_fk
 * @property integer $mnu_acs_mnu_id_fk
 * @property integer $mnu_acs_sub_mnu_id_fk
 * @property integer $mnu_acs_usr_status
 * @property integer $mnu_acs_add
 * @property integer $mnu_acs_edit
 * @property integer $mnu_acs_delete
 * @property string $status
 * @property string $create_time
 * @property integer $create_user
 * @property string $update_time
 * @property integer $update_user
 */
class Menuprivileges extends \yii\db\ActiveRecord
{
	/**
	 * @inheritdoc
	 */
    public static function tableName()
	{
		return '{{%menuprivileges}}';
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
			[['mnu_acs_usr_id_fk'], 'required', 'message' => 'Cannot be blank.'],
			[['mnu_acs_usr_id_fk', 'mnu_acs_mnu_id_fk', 'mnu_acs_sub_mnu_id_fk', 'mnu_acs_usr_status', 'mnu_acs_add', 'mnu_acs_edit', 'mnu_acs_delete', 'create_user', 'update_user'], 'integer', 'message' => 'Must be an integer.'],
			[['create_time', 'update_time'], 'safe'],
			[['status'], 'string', 'max' => 1],
			['mnu_acs_usr_status', 'default', 'value' => 1],
			[['record_date'], 'default', 'value' => strtotime(date('Y/m/d'))],
		];
	}

	/**
	 * @inheritdoc
	 */
	public function attributeLabels()
	{
		return [
			'mnu_acs_id' => Yii::t('app', 'Mnu Acs ID'),
			'mnu_acs_usr_id_fk' => Yii::t('app', 'User Name'),
			'mnu_acs_mnu_id_fk' => Yii::t('app', 'Main Menu'),
			'mnu_acs_sub_mnu_id_fk' => Yii::t('app', 'Sub Menu'),
			'mnu_acs_usr_status' => Yii::t('app', 'User Status'),
			'mnu_acs_add' => Yii::t('app', 'Add'),
			'mnu_acs_edit' => Yii::t('app', 'Edit'),
			'mnu_acs_delete' => Yii::t('app', 'Delete'),
			'status' => Yii::t('app', 'Status'),
			'create_time' => Yii::t('app', 'Create Time'),
			'create_user' => Yii::t('app', 'Create User'),
			'update_time' => Yii::t('app', 'Update Time'),
			'update_user' => Yii::t('app', 'Update User'),
		];
	}

    public function getSubmenus()
    {
        $query = $this->hasOne(Submenu::className(), ['sub_mnu_id' => 'mnu_acs_sub_mnu_id_fk']);
        // $query->andOnCondition('status = :status', [':status' => 1]);
        return $query;
    }
}
