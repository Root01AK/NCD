<?php

use app\base\Common;
use yii\helpers\Html;
use kartik\grid\GridView;
use rmrevin\yii\fontawesome\FA;

/* @var $this yii\web\View */
/* @var $searchModel app\models\ReimbursementmasterSearch */
/* @var $dataProvider yii\data\ActiveDataProvider */

$this->title = Yii::t('app', Common::getMenuname());
$this->params['breadcrumbs'][] = $this->title;
$this->params['menu'] = [
	['label' => FA::icon('plus fa-fw'), 'linkOptions' => ['class'=>'btn btn-default', 'title'=>'Create'], 'url' => ['create']],
];
   // print_r($dataProvider->getModels()[0]->linkage);
?>
<div class="reimbursementmaster-index">
  
    <?php // echo $this->render('_search', ['model' => $searchModel]); ?>
    <?= GridView::widget([
        'dataProvider' => $dataProvider,
		'panel' => ['type' => GridView::TYPE_PRIMARY,'heading' => '<b>Forms Status</b>','afterOptions'=>['class'=>'grid_panel_remove']],
		'showHeader' => true,
		
		'columns' => [
           // ['class' => 'yii\grid\SerialColumn'],		  
			[
                'attribute' => 'pid',                
				'header' => 'Client ID',	                 				
				'headerOptions' => ['style'=>'color:black;font-weight: bold;background-color:#ADD8E6','class' => 'text-center'],		
				'contentOptions' => ['style'=>'color:black;font-weight: bold;background-color:#ADD8E6','class' => 'text-center'],
				
            ],
            [
				'attribute' => 'dg_date',
				'format' => 'date',
				'headerOptions' => ['style'=>'color:black;font-weight: bold;background-color:#ADD8E6','class' => 'text-center'],	
				'contentOptions' => ['style'=>'color:black;font-weight: bold;background-color:#ADD8E6','class' => 'text-center'],
			],

			[
				'attribute' => 'mdhl_pid',
				'header' => 'Medical History',
				'headerOptions' => ['style'=>'color:green;','class' => 'text-center'],
				'contentOptions' => ['class' => 'text-center'],
                
				
				'value'=> function ($model) {
					if($model->mdhl_pid == 1)
                     return "Completed";	
				   else
				     return "Not Completed";		
              	}				
			],
			
			[
				'attribute' => 'apm_pid',
				'header' => 'Anthropometric',
				'headerOptions' => ['style'=>'color:green;','class' => 'text-center'],
				'contentOptions' => ['class' => 'text-center'],
                
				
				'value'=> function ($model) {
					if($model->apm_pid == 1)
                     return "Completed";	
				   else
				     return "Not Completed";		
              	}				
			],
			
			[
				'attribute' => 'vital_pid',
				'header' => 'Vital',
				'headerOptions' => ['style'=>'color:green;','class' => 'text-center'],
				'contentOptions' => ['class' => 'text-center'],
                
				
				'value'=> function ($model) {
					if($model->vital_pid == 1)
                     return "Completed";	
				   else
				     return "Not Completed";		
              	}				
			],
			
			[
				'attribute' => 'ce_pid',
				'header' => 'Clinical Examination',
				'headerOptions' => ['style'=>'color:green;','class' => 'text-center'],
				'contentOptions' => ['class' => 'text-center'],
                
				
				'value'=> function ($model) {
					if($model->ce_pid == 1)
                     return "Completed";	
				   else
				     return "Not Completed";		
              	}				
			],
			
			[
				'attribute' => 'bsr_pid',
				'header' => 'Sample Result',
				'headerOptions' => ['style'=>'color:green;','class' => 'text-center'],
				'contentOptions' => ['class' => 'text-center'],
                
				
				'value'=> function ($model) {
					if($model->bsr_pid == 1)
                     return "Completed";	
				   else
				     return "Not Completed";		
              	}				
			],
						
			
			[
				'attribute' => 'cml_pid',
				'header' => 'Case Management',
				'headerOptions' => ['style'=>'color:green;','class' => 'text-center'],
				'contentOptions' => ['class' => 'text-center'],
                
				
				'value'=> function ($model) {
					if($model->cml_pid == 1)
                     return "Completed";	
				   else
				     return "Not Completed";		
              	}				
			],
			
						
			[
				'attribute' => 'fupm_pid',
				'header' => '   Follow-Up',
				'headerOptions' => ['style'=>'color:green;','class' => 'text-center'],
				'contentOptions' => ['class' => 'text-center','style' => 'width:105px; min-width:105px; max-width:50px;'],
                
				
				'value'=> function ($model) {
					if($model->fupm_pid == 1)
                     return "Completed";	
				   else
				     return "Not Completed";		
              	}				
			],
			
			[
				'attribute' => 'cprca_pid',
				'header' => 'Community Perception',
				'headerOptions' => ['style'=>'color:green;','class' => 'text-center'],
				'contentOptions' => ['class' => 'text-center'],
                
				
				'value'=> function ($model) {
					if($model->cprca_pid == 1)
                     return "Completed";	
				   else
				     return "Not Completed";		
              	}				
			],
			
						
        ],
    ]); ?>
</div>
