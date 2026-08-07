<?php

use app\base\Common;
use yii\helpers\Html;
use kartik\grid\GridView;
use rmrevin\yii\fontawesome\FA;
use yii\helpers\ArrayHelper;
use app\models\Surveymaster;
use app\models\Locationmaster;

/* @var $this yii\web\View */
/* @var $searchModel app\models\AttandanceSearch */
/* @var $dataProvider yii\data\ActiveDataProvider */

$this->title = Yii::t('app', Common::getMenuname());
$this->params['breadcrumbs'][] = $this->title;
$this->params['menu'] = [
	['label' => FA::icon('plus fa-fw'), 'linkOptions' => ['class'=>'btn btn-default', 'title'=>'Create'], 'url' => ['create']],
];
?>
<div class="attandance-index">

    <h1><?= Html::encode($this->title) ?></h1>
    <?php // echo $this->render('_search', ['model' => $searchModel]); ?>
   	<?=
	   	GridView::widget([
	        'dataProvider' => $dataProvider,
	         'filterModel' => $searchModel,
	        'responsiveWrap' => true,
	        'columns' => [
	            ['class' => 'yii\grid\SerialColumn',
				'contentOptions' => ['style' => 'width:50px;  min-width:50px;'],                			
				],

				// 'id',
				// 'sid',
				// 'location',
				/*[
		            'attribute'=>'sid',
		            'value'=>function ($model, $key, $index, $widget) { 
		                return $model->survey->sur_title;
		            },
		            'noWrap' => true,
		            'filterType'=>GridView::FILTER_SELECT2,
		            'filter'=>ArrayHelper::map(Surveymaster::find()->orderBy('sur_title')->asArray()->all(), 'sur_code', 'sur_title'), 
		            'filterInputOptions'=>['placeholder'=>'']
		        ],
				[
		            'attribute'=>'loc_code',
		            'value'=>function ($model, $key, $index, $widget) { 
		                return $model->locations->loc_name;
		            },
		            'noWrap' => true,
		            'filterType'=>GridView::FILTER_SELECT2,
		            'filter'=>ArrayHelper::map(Locationmaster::find()->orderBy('loc_name')->asArray()->all(), 'loc_code', 'loc_name'), 
		            'filterInputOptions'=>['placeholder'=>'']
		        ],
				*/
								
				// 'participant_id',
				// 'interviewer',
				// 'visit',
				// 'visit_date',				
				
				
				[
					'attribute' => 'pid',					
					'contentOptions' => ['style' => 'width:200px;  min-width:200px;'],	               
				],
				[
		            'attribute' => 'visit_date',
		            'format' => 'date',
					'contentOptions' => ['style' => 'width:300px;  min-width:300px;'],
		            'filterType'=>GridView::FILTER_DATE,
		            'filterWidgetOptions' => ['pluginOptions' => ['autoclose' => true, 'startDate' => '01-01-1900', 'endDate' => '0', 'format' => strtolower(Yii::$app->formatter->dateFormat), 'orientation' => 'bottom']],
		            // 'value' => 'visit_date',
		            // 'filterInputOptions' => ['class' => 'form-control datepicker'],
		            // 'filter' => \yii\jui\DatePicker::widget(['model'=>$searchModel, 'attribute'=>'visit_date', 'options' => ['class' => 'form-control'], 'clientOptions' => ['autoclose' => true, 'startDate' => '01-01-1900', 'endDate' => '0', 'format' => strtolower(Yii::$app->formatter->dateFormat), 'orientation' => 'bottom']]),
		            // 'format' => 'raw',
		        ],
				
				[
					'attribute' => 'visit_in',
					'format' => 'time',
		            // 'filterType'=>GridView::FILTER_TIME,
				],
				[
					'attribute' => 'visit_out',
					'format' => 'time',
				],
			 
				// 'visit_in',
				// 'out_interviewer',
				// 'visit_out',
				// 'status',
				// 'create_time:datetime',
				// 'create_user',
				// 'update_time:datetime',
				// 'update_user',

	            ['class' => 'app\behaviours\ActionColumns'],
	        ],
	    ]);
    ?>
</div>
