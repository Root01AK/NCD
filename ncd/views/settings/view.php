<?php

use app\base\Common;
use yii\helpers\Html;
use yii\widgets\DetailView;
use rmrevin\yii\fontawesome\FA;

/* @var $this yii\web\View */
/* @var $model app\models\Settings */

$this->title = Yii::t('app', 'View {modelClass} ', [
    'modelClass' => 'Settings',
]);
$this->params['breadcrumbs'][] = ['label' => Yii::t('app', 'Settings'), 'url' => ['index']];
$this->params['breadcrumbs'][] = Yii::t('app', 'View');
$this->params['menu'] = [
	['label' => FA::icon('align-justify fa-fw'), 'linkOptions' => ['class'=>'btn btn-default', 'title'=>'List'], 'url' => ['/'.Yii::$app->controller->id]],
	['label' => FA::icon('plus fa-fw'), 'linkOptions' => ['class'=>'btn btn-default', 'title'=>'Create'], 'url' => ['create']],
	['label' => FA::icon('pencil fa-fw'), 'linkOptions' => ['class'=>'btn btn-default', 'title'=>'Update'], 'url' => ['update', 'id' => $model->stngs_id]],
	['label' => FA::icon('trash fa-fw'), 'linkOptions' => ['class'=>'btn btn-default', 'title'=>'Delete', 'data' => ['confirm' => Yii::t('app', 'Are you sure you want to delete this item?'), 'method' => 'post']], 'url' => ['delete', 'id' => $model->stngs_id]],
];
?>
<div class="settings-view">

    <h1><?= Html::encode($this->title) ?></h1>

    <?= DetailView::widget([
        'model' => $model,
        'attributes' => [
			// 'stngs_id',
			[
				'attribute' => 'stngs_app_name',
				'format' => 'ntext',
				'visible' => ($model->stngs_app_name) 
			],
			'stngs_timezone',
			'stngs_dateformat',
			'stngs_survey_code',
			'stngs_survey_fixed',
			// [
			// 	'attribute' => 'stngs_org_logo',
			// 	'format' => 'ntext',
			// 	'visible' => ($model->stngs_org_logo) 
			// ],
			[
				'attribute' => 'stngs_org_name',
				'format' => 'ntext',
				'visible' => ($model->stngs_org_name) 
			],
			[
				'attribute' => 'stngs_org_addrs',
				'format' => 'ntext',
				'visible' => ($model->stngs_org_addrs) 
			],
			'stngs_org_phone',
			[
				'attribute' => 'stngs_org_mail',
				'format' => 'ntext',
				'visible' => ($model->stngs_org_mail) 
			],
			[
				'attribute' => 'stngs_org_website',
				'format' => 'ntext',
				'visible' => ($model->stngs_org_website) 
			],
			[
				'attribute' => 'smtp_admin_name',
				'format' => 'ntext',
				'visible' => ($model->smtp_admin_name) 
			],
			[
				'attribute' => 'smtp_frm_mail',
				'format' => 'ntext',
				'visible' => ($model->smtp_frm_mail) 
			],
			[
				'attribute' => 'smtp_server_name',
				'format' => 'ntext',
				'visible' => ($model->smtp_server_name) 
			],
			'smtp_server_port',
			[
				'attribute' => 'smtp_server_usrname',
				'format' => 'ntext',
				'visible' => ($model->smtp_server_usrname) 
			],
			// [
			// 	'attribute' => 'smtp_server_pwd',
			// 	'format' => 'ntext',
			// 	'visible' => ($model->smtp_server_pwd) 
			// ],
			'smtp_server_ssl',
			'smtp_server_auth',
			// 'stngs_pagesize',
			// 'stngs_incendv_amt',
			// 'stngs_financial_year',
			// 'stngs_location',
			[
				'attribute' => 'status',
				'value' => ($model->status == 1) ? 'Y' : 'N',
				'visible' => ($model->status === null) ? false : true,
			],
			[
				'attribute' => 'create_time',
				'format' => 'datetime',
				'visible' => ($model->update_user !== null) ? false : true,
			],
			[
				'attribute' => 'create_user',
				'visible' => ($model->update_user !== null) ? false : true,
			],
			[
				'attribute' => 'update_time',
				'format' => 'datetime',
				'visible' => ($model->update_user === null) ? false : true,
			],
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