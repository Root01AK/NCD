<?php

use app\base\Common;
use yii\helpers\Html;
use yii\helpers\ArrayHelper;
use kartik\grid\GridView;
use rmrevin\yii\fontawesome\FA;

/* @var $this yii\web\View */
/* @var $searchModel app\models\FieldmasterSearch */
/* @var $dataProvider yii\data\ActiveDataProvider */

$this->title = Yii::t('app', Common::getMenuname());
$this->params['breadcrumbs'][] = $this->title;
$this->params['menu'] = [
	['label' => FA::icon('plus fa-fw'), 'linkOptions' => ['class'=>'btn btn-default', 'title'=>'Create'], 'url' => ['create']],
];
?>
<div class="fieldmaster-index">

    <h1><?= Html::encode($this->title) ?></h1>
    <?php // echo $this->render('_search', ['model' => $searchModel]); ?>
    <?= GridView::widget([
        'dataProvider' => $dataProvider,
        'filterModel' => $searchModel,
        'columns' => [
            ['class' => 'yii\grid\SerialColumn'],

			// 'fld_mstr_id',
			// 'fld_mstr_frmfield',
			[
				'attribute' => 'fld_mstr_frmfield',
				'value' => function ($model) {
					return $model->frmfield[$model->fld_mstr_frmfield];
				},
				'filterType'=>GridView::FILTER_SELECT2,
				'filter'=>$searchModel->frmfield,
				'filterInputOptions'=>['placeholder'=>'']
			],
			'fld_mstr_code',
			'fld_mstr_desc',
			// 'status',
			[
				'attribute' => 'status',
				'value' => function ($model) {
					return $model->fldstatus[$model->status];
				},
				'filterType'=>GridView::FILTER_SELECT2,
				'filter'=>$searchModel->fldstatus,
				'filterInputOptions'=>['placeholder'=>'']
			],
			// 'create_time:datetime',
			// 'create_user',
			// 'update_time:datetime',
			// 'update_user',
			// 'record_date',

            ['class' => 'app\behaviours\ActionColumns'],
        ],
    ]); ?>
</div>
