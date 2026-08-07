<?php

use yii\helpers\Html;
use kartik\grid\GridView;
use rmrevin\yii\fontawesome\FA;
use app\models\Locationmaster;

$SModel=new Locationmaster();

/* @var $this yii\web\View */
/* @var $dataProvider yii\data\ActiveDataProvider */

$this->title = Yii::t('app', 'Locationmaster');
$this->params['breadcrumbs'][] = $this->title;
$this->params['menu'] = [
	['label' => FA::icon('plus fa-fw'), 'linkOptions' => ['class'=>'btn btn-default', 'title'=>'Create'], 'url' => ['create']],
];
?>
<div class="departments-index">

    <h1><?= Html::encode($this->title) ?></h1>
    <?= GridView::widget([
        'dataProvider' => $dataProvider,
		'filterModel' => $searchModel,
        'columns' => [
            ['class' => 'yii\grid\SerialColumn'],

            'loc_code',
            'loc_name',
		
			[
				'attribute' => 'status',
				'label' => 'Status',
                'contentOptions' => ['style' =>'width:125px;  min-width:125px;'],				 
                        			   
                'value' => function($data) {
                    return $data->getStatusdum();
                },
	            'filterType'=>GridView::FILTER_SELECT2,
	            'filter'=>$SModel->statusdum, 
	            'filterInputOptions'=>['placeholder'=>''],
				
			],
            // 'create_time:datetime',
            // 'create_user',
            // 'update_time:datetime',
            // 'update_user',

            ['class' => 'app\behaviours\ActionColumns'],
        ],
    ]); ?>
</div>
