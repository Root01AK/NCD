<?php

use yii\helpers\Html;
use yii\grid\GridView;
use rmrevin\yii\fontawesome\FA;
use yii\widgets\Pjax;
/* @var $this yii\web\View */
/* @var $dataProvider yii\data\ActiveDataProvider */

$this->title = Yii::t('app', 'Locationmappings');
$this->params['breadcrumbs'][] = $this->title;
$this->params['menu'] = [
	['label' => FA::icon('plus fa-fw'), 'linkOptions' => ['class'=>'btn btn-default', 'title'=>'Create'], 'url' => ['create']],
];
?>
<div class="locationmapping-index">

    <h1><?= Html::encode($this->title) ?></h1>
<?php Pjax::begin(['enablePushState' => false, 'clientOptions' => ['method' => 'POST']]); ?>   <?= GridView::widget([
        'dataProvider' => $dataProvider,
        'columns' => [
            ['class' => 'yii\grid\SerialColumn'],

			// 'loc_mapng_id',
			'loc_mapng_sur_id',
			// 'loc_mapng_mstr_id',
            [
                'attribute' => 'status',
                'value' => function($model, $key, $index, $widget) {
                    return ($model->status == 1) ? 'Y' : 'N';
                },
            ],
			// 'create_time',
			// 'create_user',
			// 'update_time',
			// 'update_user',

            [
                'class' => 'app\behaviours\ActionColumns',
                'template' => '{update} {delete}',
            ]
        ],
    ]); ?>
<?php Pjax::end(); ?></div>
