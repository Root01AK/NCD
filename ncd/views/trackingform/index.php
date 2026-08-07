<?php

use yii\helpers\Html;
use kartik\grid\GridView;
use rmrevin\yii\fontawesome\FA;
use yii\widgets\Pjax;
/* @var $this yii\web\View */
/* @var $searchModel app\models\TrackingformSearch */
/* @var $dataProvider yii\data\ActiveDataProvider */

$this->title = Yii::t('app', 'Trackingforms');
$this->params['breadcrumbs'][] = $this->title;
$this->params['menu'] = [
	['label' => FA::icon('plus fa-fw'), 'linkOptions' => ['class'=>'btn btn-default', 'title'=>'Create'], 'url' => ['create']],
];
?>
<div class="trackingform-index">

    <h1><?= Html::encode($this->title) ?></h1>
    <?php // echo $this->render('_search', ['model' => $searchModel]); ?>
 <?= GridView::widget([
        'dataProvider' => $dataProvider,
         'filterModel' => $searchModel,
        'columns' => [
          //  ['class' => 'yii\grid\SerialColumn'],

			// 'track_form_id',
			//'track_form_survey',
		//	'track_form_part_id',
		//	'track_form_q1',
		//	'track_form_q2',
			// 'track_form_q3',
			// 'track_form_q4',
			// 'status',
			// 'create_time:datetime',
			// 'create_user',
			// 'update_time:datetime',
			// 'update_user',
			['class' => 'yii\grid\SerialColumn',
			 'contentOptions' => ['style' => 'width:30px;  min-width:30px;']
			 ],
			 
			 
			 [
		    'attribute' =>'track_form_part_id',			
			'contentOptions' => ['style' => 'width:160px;  min-width:100px;'],
		],
			 
			
			 
			 [
					'attribute' => 'record_date',
					'format' => 'date',
					'contentOptions' => ['style' =>'width:270px;  min-width:100px;'],
					// 'contentOptions' => ['class' => 'col-md-1'],
		            'filterType'=>GridView::FILTER_DATE,
		            'filterWidgetOptions' => ['pluginOptions' => ['autoclose' => true, 'startDate' => '01-01-1900', 'endDate' => '0', 'format' => strtolower(Yii::$app->formatter->dateFormat), 'orientation' => 'bottom']],
				],

            ['class' => 'app\behaviours\ActionColumns'],
        ],
    ]); ?>
</div>