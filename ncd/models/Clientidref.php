<?php

namespace app\models;

use Yii;
use yii\behaviors\TimestampBehavior;

/**
 * This is the model class for table "{{%clientidref}}".
 *
 * @property string $clientid_ref_sur
 * @property string $clientid_ref_loc
 * @property integer $clientid_ref_code
 * @property integer $record_date
 * @property integer $update_time
 */
class Clientidref extends \yii\db\ActiveRecord
{
	
	/**
	 * @inheritdoc
	 */
	public static function tableName()
	{
		return '{{%clientidref}}';
	}

	/**
	 * @inheritdoc
	 */
	public function behaviors()
	{
		return [
			[
				'class' => TimestampBehavior::className(),
				'createdAtAttribute' => null,
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
			[['clientid_ref_sur', 'clientid_ref_loc', 'clientid_ref_code'], 'required'],
			[['clientid_ref_code', 'record_date', 'update_time'], 'integer'],
			[['clientid_ref_sur', 'clientid_ref_loc'], 'string', 'max' => 11],
			[['clientid_ref_sur', 'clientid_ref_loc'], 'unique', 'targetAttribute' => ['clientid_ref_sur', 'clientid_ref_loc'], 'message' => 'The combination of Survey, Location and Type has already been taken.'],
			[['record_date'], 'default', 'value' => strtotime(date('Y/m/d'))],
		];
	}

	/**
	 * @inheritdoc
	 */
	public function attributeLabels()
	{
		return [
			'clientid_ref_sur' => Yii::t('app', 'Survey'),
			'clientid_ref_loc' => Yii::t('app', 'Location'),
			'clientid_ref_code' => Yii::t('app', 'Last Client Id Number'),
			'record_date' => Yii::t('app', 'Record Date'),
			'update_time' => Yii::t('app', 'Update Date'),
		];
	}

	public static function generateClientidno($sur, $loc)
	{
		 if ($loc != "") {
			$Refmodel = self::find()->where(['clientid_ref_sur' => $sur])->andWhere(['clientid_ref_loc' => $loc])->one();
			if ($Refmodel === null)
				$Refmodel = new self;
			if ($Refmodel->clientid_ref_sur == null){
			 $ref_code = 0;
			}
		    else {
			 $ref_code=$Refmodel->clientid_ref_code;
			} 
			$refid = ($ref_code+1);
		} else { 
			$Refmodel = new self;
			$refid = 1;
		}
		
		if($loc == "")
            $code = '';
        else
            $code = $loc;

		$clientid = $code.$refid;
		$cidno = str_pad($refid, 4, 0, STR_PAD_LEFT);
		$Refmodel->clientid_ref_sur = $sur;
		$Refmodel->clientid_ref_loc = $loc;
		$Refmodel->clientid_ref_code = $refid;
		return $Refmodel;
    }
	
}
