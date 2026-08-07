<?php

use yii\helpers\Html;
use kartik\grid\GridView;
use rmrevin\yii\fontawesome\FA;
use yii\widgets\Pjax;
/* @var $this yii\web\View */
/* @var $searchModel app\models\MortalityformSearch */
/* @var $dataProvider yii\data\ActiveDataProvider */

$this->title = Yii::t('app', 'Mortalityforms');
$this->params['breadcrumbs'][] = $this->title;
$this->params['menu'] = [
	['label' => FA::icon('plus fa-fw'), 'linkOptions' => ['class'=>'btn btn-default', 'title'=>'Create'], 'url' => ['create']],
];
?>
<div class="mortalityform-index">

    <h1><?= Html::encode($this->title) ?></h1>
    <?php // echo $this->render('_search', ['model' => $searchModel]); ?>
  <?= GridView::widget([
        'dataProvider' => $dataProvider,
         'filterModel' => $searchModel,
        'columns' => [
          //  ['class' => 'yii\grid\SerialColumn'],

			// 'mortality_form_id',
		//	'mortality_form_survey',
		//	'mortality_form_part_id',
		//	'mortality_form_q1',
		//	'mortality_form_q2',
			// 'mortality_form_q3',
			// 'mortality_form_q4',
			// 'mortality_form_q5',
			// 'status',
			// 'create_time:datetime',
			// 'create_user',
			// 'update_time:datetime',
			// 'update_user',
			['class' => 'yii\grid\SerialColumn',
			 'contentOptions' => ['style' => 'width:30px;  min-width:30px;']
			 ],
			 
			 
			 [
		    'attribute' => 'mortality_form_part_id',			
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