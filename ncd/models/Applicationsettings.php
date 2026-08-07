<?php

namespace app\models;

use Yii;
use yii\behaviors\TimestampBehavior;

/**
 * This is the model class for table "{{%appsettings}}".
 *
 * @property integer $app_stngs_id
 * @property string $app_survey_id
 * @property string $app_coupons
 * @property string $app_incentive
 * @property string $app_fin_yr
 * @property string $app_fin_yr_fixed
 * @property string $app_reimbsmnt_vchr
 * @property string $app_reimbsmnt_vchr_fixed
 * @property string $app_location
 * @property string $app_location_fixed
 * @property string $app_cupn_cde_fixed
 * @property string $app_no_of_coupon
 * @property string $app_no_of_coupon_fixed
 * @property string $app_cupn_prd
 * @property string $app_cupn_prd_type
 * @property string $app_cupn_prd_fixed
 * @property string $app_incentive_amt
 * @property string $app_incentive_amt_fixed
 * @property string $app_incentive_vchr
 * @property string $app_incentive_vchr_fixed
 * @property string $status
 * @property integer $create_time
 * @property integer $create_user
 * @property integer $update_time
 * @property integer $update_user
 */
class Applicationsettings extends \yii\db\ActiveRecord
{
	public $Years = [];
	public $prd_type = [1 => "Days", 2 => "Weeks", 3 => "Month", 4 => "Year"];

	public function init()
	{
		$st_fncl_yr = 2010;
		$no_of_fncl_yr = date("Y")+1;
		for($i=$st_fncl_yr; $i<=$no_of_fncl_yr; $i++)
			$this->Years[substr($i, -2).substr(($i+1), -2)] = $i.' - '.($i+1);
	}
	/**
	 * @inheritdoc
	 */
    public static function tableName()
	{
		return '{{%appsettings}}';
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
			[['app_survey_id', 'app_fin_yr', 'app_fin_yr_fixed'], 'required'],
			[['app_cupn_cde_fixed', 'app_no_of_coupon', 'app_cupn_prd', 'app_cupn_prd_type'], 'required', 'message' => 'Cannot be blank.', 'when' => function ($model) {
				return ($model->app_coupons == 1);
			}, 'whenClient' => "function (attribute, value) {
				return ($('#applicationsettings-app_coupons').is(':checked'));
			}"],
			[['app_incentive_amt'], 'required', 'message' => 'Cannot be blank.', 'when' => function ($model) {
				return ($model->app_incentive == 1);
			}, 'whenClient' => "function (attribute, value) {
				return ($('#applicationsettings-app_incentive').is(':checked'));
			}"],
			[['app_coupons', 'app_incentive', 'app_control_site','app_idu', 'app_fin_yr_fixed', 'app_reimbsmnt_vchr_fixed', 'app_location_fixed', 'app_cupn_cde_fixed', 'app_no_of_coupon_fixed', 'app_cupn_prd_fixed', 'app_incentive_amt_fixed', 'app_incentive_vchr_fixed', 'app_ost_fixed'], 'string'],
			[['create_time', 'create_user', 'update_time', 'update_user'], 'integer'],
			[['app_survey_id'], 'string', 'max' => 11],
			[['app_fin_yr', 'app_reimbsmnt_vchr', 'app_location', 'app_no_of_coupon', 'app_cupn_prd', 'app_cupn_prd_type', 'app_incentive_amt', 'app_incentive_vchr'], 'string', 'max' => 50],
			[['status'], 'string', 'max' => 1],
		];
	}

	/**
	 * @inheritdoc
	 */
	public function attributeLabels()
	{
		return [
			'app_stngs_id' => Yii::t('app', 'App Stngs ID'),
			'app_survey_id' => Yii::t('app', 'Survey'),
			'app_coupons' => Yii::t('app', 'Coupons'),
			'app_incentive' => Yii::t('app', 'Incentive'),
			'app_control_site' => Yii::t('app', 'Control Site (Y/N)'),
			'app_idu' => Yii::t('app', 'IDU Site (Y/N)'),
			'app_fin_yr' => Yii::t('app', 'Financial Year'),
			'app_fin_yr_fixed' => Yii::t('app', 'Financial Year Is Fixed?'),
			'app_reimbsmnt_vchr' => Yii::t('app', 'Reimbursement Voucher'),
			'app_reimbsmnt_vchr_fixed' => Yii::t('app', 'Reimbursement Voucher Is Fixed?'),
			'app_location' => Yii::t('app', 'Default Location'),
			'app_location_fixed' => Yii::t('app', 'Default Location Is Fixed?'),
			'app_cupn_cde_fixed' => Yii::t('app', 'Coupon code is Participant ID?'),
			'app_no_of_coupon' => Yii::t('app', 'No of coupons per participant'),
			'app_no_of_coupon_fixed' => Yii::t('app', 'No of coupons per participant Is Fixed?'),
			'app_cupn_prd' => Yii::t('app', 'Coupon Validity Period'),
			'app_cupn_prd_type' => Yii::t('app', 'Coupon Validity Period Type'),
			'app_cupn_prd_fixed' => Yii::t('app', 'Coupon Validity Period Is Fixed?'),
			'app_incentive_amt' => Yii::t('app', 'Incentive Amount'),
			'app_incentive_amt_fixed' => Yii::t('app', 'Incentive Amount Is Fixed?'),
			'app_incentive_vchr' => Yii::t('app', 'Incentive Voucher'),
			'app_incentive_vchr_fixed' => Yii::t('app', 'Incentive Voucher Is Fixed?'),
			'app_ost_fixed' => Yii::t('app', 'OST Doses are Fixed?'),
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
			if($this->app_location == "")
				$this->app_location_fixed = 0;
			return true;
		}
	}

	public function getSurveys()
	{
		return $this->hasOne(Surveymaster::className(), ['sur_code' => 'app_survey_id']);
	}

	public function getLocations()
	{
		return $this->hasOne(Locationmaster::className(), ['loc_code' => 'app_location']);
	}
}
