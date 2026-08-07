<?php

use app\base\Common;
use yii\helpers\Html;
use kartik\grid\GridView;
use app\models\Cchv;
use rmrevin\yii\fontawesome\FA;
use yii\helpers\ArrayHelper;

// print_r(Cchv::cchv_q12);
/* @var $this yii\web\View */
/* @var $searchModel app\models\CchvSearch */
/* @var $dataProvider yii\data\ActiveDataProvider */

$this->title = Yii::t('app', 'Cchvs');
$this->params['breadcrumbs'][] = $this->title;
$this->params['menu'] = [
	['label' => FA::icon('plus fa-fw'), 'linkOptions' => ['class'=>'btn btn-default', 'title'=>'Create'], 'url' => ['create']],
];
?>
<div class="registration-index">

    <h1><?= Html::encode($this->title) ?></h1>
    <?php // echo $this->render('_search', ['model' => $searchModel]); ?>
   	<?=
	   	GridView::widget([
	        'dataProvider' => $dataProvider,
	        'filterModel' => $searchModel,
	        'columns' => [
	            ['class' => 'yii\grid\SerialColumn',
				'contentOptions' => ['style' => 'width:60px;  min-width:60px;'],
				],

				[
					'attribute' => 'cchv_pid',					
					'contentOptions' => ['style' => 'width:130px;  min-width:130px;'],
	              
				],		
				[
					'attribute' => 'cchv_date',
					'format' => 'date',
					'contentOptions' => ['style' =>'width:270px;  min-width:100px;'],
					// 'contentOptions' => ['class' => 'col-md-1'],
		            'filterType'=>GridView::FILTER_DATE,
		            'filterWidgetOptions' => ['pluginOptions' => ['autoclose' => true, 'startDate' => '01-01-1900', 'endDate' => '0', 'format' => strtolower(Yii::$app->formatter->dateFormat), 'orientation' => 'bottom']],
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
	    ]);
    ?>
</div>