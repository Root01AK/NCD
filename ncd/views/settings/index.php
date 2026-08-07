<?php

use app\base\Common;
use yii\helpers\Html;
use kartik\grid\GridView;
use rmrevin\yii\fontawesome\FA;

/* @var $this yii\web\View */
/* @var $searchModel app\models\SettingsSearch */
/* @var $dataProvider yii\data\ActiveDataProvider */

$this->title = Yii::t('app', Common::getMenuname());
$this->params['breadcrumbs'][] = $this->title;
$this->params['menu'] = [
	['label' => FA::icon('plus fa-fw'), 'linkOptions' => ['class'=>'btn btn-default', 'title'=>'Create'], 'url' => ['create']],
];
?>
<div class="settings-index">

    <h1><?= Html::encode($this->title) ?></h1>
    <?php // echo $this->render('_search', ['model' => $searchModel]); ?>
    <?= GridView::widget([
        'dataProvider' => $dataProvider,
        'filterModel' => $searchModel,
        'columns' => [
            ['class' => 'yii\grid\SerialColumn'],

			// 'stngs_id',
			'stngs_app_name:ntext',
			'stngs_org_logo:ntext',
			'stngs_org_name:ntext',
			'stngs_org_addrs:ntext',
			// 'stngs_org_phone',
			// 'stngs_org_mail:ntext',
			// 'stngs_org_website:ntext',
			// 'smtp_admin_name:ntext',
			// 'smtp_frm_mail:ntext',
			// 'smtp_server_name:ntext',
			// 'smtp_server_port',
			// 'smtp_server_usrname:ntext',
			// 'smtp_server_pwd:ntext',
			// 'smtp_server_ssl',
			// 'smtp_server_auth',
			// 'stngs_timezone',
			// 'stngs_dateformat',
			// 'stngs_pagesize',
			// 'stngs_incendv_amt',
			// 'stngs_financial_year',
			// 'stngs_location',
			// 'stngs_survey_code',
			// 'stngs_survey_fixed',
			// 'status',
			// 'create_time:datetime',
			// 'create_user',
			// 'update_time:datetime',
			// 'update_user',

            ['class' => 'app\behaviours\ActionColumns'],
        ],
    ]); ?>
</div>
