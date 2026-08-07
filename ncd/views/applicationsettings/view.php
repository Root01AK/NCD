<?php

use app\base\Common;
use yii\helpers\Html;
use yii\widgets\DetailView;
use rmrevin\yii\fontawesome\FA;

/* @var $this yii\web\View */
/* @var $model app\models\Applicationsettings */

$this->title = Yii::t('app', 'View {modelClass} ', [
    'modelClass' => Common::getMenuname(),
]);
$this->params['breadcrumbs'][] = ['label' => Yii::t('app', 'Applicationsettings'), 'url' => ['index']];
$this->params['breadcrumbs'][] = Yii::t('app', 'View');
$this->params['menu'] = [
	['label' => FA::icon('align-justify fa-fw'), 'linkOptions' => ['class'=>'btn btn-default', 'title'=>'List'], 'url' => ['/'.Yii::$app->controller->id]],
	['label' => FA::icon('plus fa-fw'), 'linkOptions' => ['class'=>'btn btn-default', 'title'=>'Create'], 'url' => ['create']],
	['label' => FA::icon('pencil fa-fw'), 'linkOptions' => ['class'=>'btn btn-default', 'title'=>'Update'], 'url' => ['update', 'id' => $model->app_stngs_id]],
	['label' => FA::icon('trash fa-fw'), 'linkOptions' => ['class'=>'btn btn-default', 'title'=>'Delete', 'data' => ['confirm' => Yii::t('app', 'Are you sure you want to delete this item?'), 'method' => 'post']], 'url' => ['delete', 'id' => $model->app_stngs_id]],
];
?>
<div class="applicationsettings-view">

    <h1><?= Html::encode($this->title) ?></h1>

    <?= DetailView::widget([
        'model' => $model,
        'attributes' => [
			// 'app_stngs_id',
			'app_survey_id',
			'app_coupons',
			'app_incentive',
			'app_control_site',
			'app_idu',
			'app_fin_yr',
			'app_fin_yr_fixed',
			'app_reimbsmnt_vchr',
			'app_reimbsmnt_vchr_fixed',
			'app_location',
			'app_location_fixed',
			'app_cupn_cde_fixed',
			'app_no_of_coupon',
			'app_no_of_coupon_fixed',
			'app_cupn_prd',
			'app_cupn_prd_type',
			'app_cupn_prd_fixed',
			'app_incentive_amt',
			'app_incentive_amt_fixed',
			'app_incentive_vchr',
			'app_incentive_vchr_fixed',
			'app_ost_fixed',
			[
				'attribute' => 'status',
				'value' => ($model->status == 1) ? 'Y' : 'N',
				'visible' => ($model->status === null) ? false : true,
			],
			'create_time:datetime',
			[
				'attribute' => 'create_user',
				'visible' => ($model->update_user !== null) ? false : true,
			],
			'update_time:datetime',
			[
				'attribute' => 'update_user',
				'visible' => ($model->update_user === null) ? false : true,
			],
        ],
    ]) ?>

</div>
<div class="control-group buttons">
	<?= Html::Button('Back', array('class'=>'btn btn-default', 'onclick' => 'js:document.location.href="../'.Yii::$app->controller->id.'"')); ?>
</div>
<br/>