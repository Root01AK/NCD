<?php

use yii\helpers\Html;
use kartik\grid\GridView;
use rmrevin\yii\fontawesome\FA;
use yii\widgets\Pjax;
/* @var $this yii\web\View */
/* @var $searchModel app\models\AttandanceSearch */
/* @var $dataProvider yii\data\ActiveDataProvider */

?>
<div class="attandance-index">

 <?php Pjax::begin(); ?>       <?= GridView::widget([
        'dataProvider' => $dataProvider,		
        'panel' => ['type' => GridView::TYPE_PRIMARY,'heading' => '<b>Forms Summary</b>','afterOptions'=>['class'=>'grid_panel_remove']],
		'showHeader' => true,		        
          'columns' => [
           // ['class' => 'yii\grid\SerialColumn'],		  
			[
                'attribute' => 'dg',                
				'header' => 'Demographics',	       
				'headerOptions' => ['style'=>'color:black;font-weight: bold;background-color:#FFC0CB','class' => 'text-center'],		
				'contentOptions' => ['style'=>'font-weight: bold;','class' => 'text-center'],
            ],
            
			[
				'attribute' => 'mdhl',
				'header' => 'Medical History',						
			    'headerOptions' => ['style'=>'color:black;font-weight: bold;background-color:#FFC0CB','class' => 'text-center'],		
				'contentOptions' => ['style'=>'font-weight: bold;','class' => 'text-center'],
            ],
			
			[
				'attribute' => 'apm',
				'header' => 'Anthropometric',
			    'headerOptions' => ['style'=>'color:black;font-weight: bold;background-color:#FFC0CB','class' => 'text-center'],		
				'contentOptions' => ['style'=>'font-weight: bold;','class' => 'text-center'],
            ],
			
			[
				'attribute' => 'vital',
				'header' => 'Vitals',
			    'headerOptions' => ['style'=>'color:black;font-weight: bold;background-color:#FFC0CB','class' => 'text-center'],		
				'contentOptions' => ['style'=>'font-weight: bold;','class' => 'text-center'],
            ],
			
			[
				'attribute' => 'ce',
				'header' => 'Clinical Examination',
			    'headerOptions' => ['style'=>'color:black;font-weight: bold;background-color:#FFC0CB','class' => 'text-center'],		
				'contentOptions' => ['style'=>'font-weight: bold;','class' => 'text-center'],
            ],
			
			[
				'attribute' => 'bsr',
				'header' => 'Sample Results',				
			    'headerOptions' => ['style'=>'color:black;font-weight: bold;background-color:#FFC0CB','class' => 'text-center'],		
				'contentOptions' => ['style'=>'font-weight: bold;','class' => 'text-center'],
            ],
			
			[
				'attribute' => 'cml',
				'header' => 'Case Management',				
			    'headerOptions' => ['style'=>'color:black;font-weight: bold;background-color:#FFC0CB','class' => 'text-center'],		
				'contentOptions' => ['style'=>'font-weight: bold;','class' => 'text-center'],
            ],
						
			[
				'attribute' => 'fupm',
				'header' => 'Follow-Up',
			    'headerOptions' => ['style'=>'color:black;font-weight: bold;background-color:#FFC0CB','class' => 'text-center'],		
				'contentOptions' => ['style'=>'font-weight: bold;','class' => 'text-center'],
            ],
			
			[
				'attribute' => 'cprca',
				'header' => 'Community Perceptions',
			    'headerOptions' => ['style'=>'color:black;font-weight: bold;background-color:#FFC0CB','class' => 'text-center'],		
				'contentOptions' => ['style'=>'font-weight: bold;','class' => 'text-center'],
            ],
			
		],
    ]); ?>
<?php Pjax::end(); ?></div>
