<?php

use app\base\Common;
use yii\helpers\Html;
use kartik\grid\GridView;
use rmrevin\yii\fontawesome\FA;

/* @var $this yii\web\View */
/* @var $searchModel app\models\ApplicationsettingsSearch */
/* @var $dataProvider yii\data\ActiveDataProvider */

$this->title = Yii::t('app', Common::getMenuname());
$this->params['breadcrumbs'][] = $this->title;
$this->params['menu'] = [
	['label' => FA::icon('plus fa-fw'), 'linkOptions' => ['class'=>'btn btn-default', 'title'=>'Create'], 'url' => ['create']],
];
?>
<div class="applicationsettings-index">

    <h1><?= Html::encode($this->title) ?></h1>
    <?php // echo $this->render('_search', ['model' => $searchModel]); ?>
    <?= GridView::widget([
        'dataProvider' => $dataProvider,
        'filterModel' => $searchModel,
        'columns' => [
            ['class' => 'yii\grid\SerialColumn'],

			// 'app_stngs_id',
			'app_survey_id',
			'app_coupons',
			'app_incentive',
			'app_control_site',
			'app_idu',			
			'app_ost_fixed',
			'app_fin_yr',
			// 'app_fin_yr_fixed',
			// 'app_reimbsmnt_vchr',
			// 'app_reimbsmnt_vchr_fixed',
			// 'app_location',
			// 'app_location_fixed',
			// 'app_cupn_cde_fixed',
			// 'app_no_of_coupon',
			// 'app_no_of_coupon_fixed',
			// 'app_cupn_prd',
			// 'app_cupn_prd_type',
			// 'app_cupn_prd_fixed',
			// 'app_incentive_amt',
			// 'app_incentive_amt_fixed',
			// 'app_incentive_vchr',
			// 'app_incentive_vchr_fixed',
			// 'status',
			// 'create_time',
			// 'create_user',
			// 'update_time',
			// 'update_user',

            ['class' => 'app\behaviours\ActionColumns'],
        ],
    ]); ?>
</div>
