<?php

use yii\helpers\Url;
use yii\helpers\Html;
use kartik\grid\GridView;
use rmrevin\yii\fontawesome\FA;
use yii\widgets\Pjax;
/* @var $this yii\web\View */
/* @var $searchModel app\models\AttandanceSearch */
/* @var $dataProvider yii\data\ActiveDataProvider */

?>
<div class="attandance-index">

    <?= GridView::widget([
        'dataProvider' => $dataProvider,
		'formatter' => ['class' => 'yii\i18n\Formatter','nullDisplay' => '-', 'dateFormat' => 'dd-MM-Y'],
        'layout' => '<div class="box"><div class="box-header with-border"><b>Today\'s Attendance Client Status</b>{summary}</div><div class="box-body">{items}</div><div class="box-footer clearfix">{pager}</div></div>',
		'panel' => ['type' => GridView::TYPE_PRIMARY,'heading' => '<b>Today\'s Attendance Client Status</b>','afterOptions'=>['class'=>'grid_panel_remove']],
    	// 'filterModel' => $searchModel,
        // 'showOnEmpty' => true,
        // 'emptyCell' => '-',
        'columns' => [
            ['class' => 'yii\grid\SerialColumn'],
            [
                'attribute' => 'pid',
                'label' => 'Client ID',
				//'contentOptions' => ['style' =>'width:100px;  min-width:100px;'],
                'format' => 'raw',                
                'options' => ['class' => 'col-md-2']
            ],
			[
					'attribute' => 'visit_in',
					//'contentOptions' => ['style' =>'width:100px;  min-width:100px;'],
					'label'=>'In time',
					'format' => 'time',
		            
				],
				[
					'attribute' => 'visit_out',
					//'contentOptions' => ['style' =>'width:100px;  min-width:100px;'],
					'label'=>'Out time',
					'format' => 'time',
				],
            
            [
                'label' => 'OST ID',
                //'format' => 'raw',				
				'format' => 'html',
				'contentOptions' => ['style' => 'font-size:18px;'],
                'value' => function($data) {
                    return $data->getOST();
                }
		             
			],	
            
			[	
				'label' => 'OST Taken',
				'contentOptions' => ['style' =>'font-size:15px; width:400px;  min-width:400px;'],
				'format' => 'raw',
				'value'=> function ($data) {
					if($data->getOSTTaken()== "N/A")
					 return "N/A";	
				    elseif($data->getOSTTaken()== "Yes")
                     return FA::icon('check text-success');	
					else
				     return FA::icon('close text-danger');		
              	}
			],
           
        ],
    ]); ?>
</div>