<?php

namespace app\models;

use Yii;
use yii\helpers\Html;
use app\base\Converter;
use rmrevin\yii\fontawesome\FA;
use yii\behaviors\TimestampBehavior;
use app\models\Attandance;
use yii\db\Query;

/**
 * This is the model class for table "v_visitstatus".
 *
 * @property string $participant_id
 * @property integer $demographics_part_id
 * @property integer $quality_of_life_part_id
 * @property integer $hiv_continuum_part_id
 * @property integer $pre_art_beliefs_part_id
 * @property integer $post_art_beliefs_part_id
 * @property integer $substance_use_part_id
 * @property integer $risk_behavior_part_id
 * @property integer $depression_part_id
 * @property integer $health_care_utilization_part_id
 * @property integer $hiv_visit_part_id
 * @property integer $cd4_test_part_id
 */
class Vformstatus extends \yii\db\ActiveRecord
{
	/**
	 * @inheritdoc
	 */
    public static function tableName()
	{
		return 'v_formstatus';
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
			[['pid'], 'required'],           		
		];
	}

	/**
	 * @inheritdoc
	 */
	public function attributeLabels()
	{
		return [
			'pid' => Yii::t('app', 'Participant ID'),
			'dg_date'=> Yii::t('app', 'Visit Date'),			
			'apm_pid' => Yii::t('app', 'Anthropometric Measurements'),
			'bsr_pid' => Yii::t('app', 'Sample Results'),
			'ce_pid' => Yii::t('app', 'Clinical Examination'),
			'cml_pid' => Yii::t('app', 'Case Management Linkages'),
			'cprca_pid' => Yii::t('app', 'Community Perceptions'),
			'fupm_pid' => Yii::t('app', 'Follow-Up and Monitoring'),
			'mdhl_pid' => Yii::t('app', 'Medical History'),
			'vital_pid' => Yii::t('app', 'Vitals'),			
		];
	}
   

}
