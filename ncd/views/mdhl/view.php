<?php

use yii\helpers\Html;
use yii\widgets\DetailView;
use rmrevin\yii\fontawesome\FA;
use app\base\Common;
use app\models\Surveymaster;


/* @var $this yii\web\View */
/* @var $model app\models\Mdhl */

$this->title = Yii::t('app', 'View {modelClass} ', [
    'modelClass' => 'Mdhl',
]);
$this->params['breadcrumbs'][] = ['label' => Yii::t('app', 'Mdhls'), 'url' => ['index']];
$this->params['breadcrumbs'][] = Yii::t('app', 'View');
$this->params['menu'] = [
	['label' => FA::icon('align-justify fa-fw'), 'linkOptions' => ['class'=>'btn btn-default', 'title'=>'List'], 'url' => ['/'.Yii::$app->controller->id]],
	['label' => FA::icon('plus fa-fw'), 'linkOptions' => ['class'=>'btn btn-default', 'title'=>'Create'], 'url' => ['create']],
	['label' => FA::icon('pencil fa-fw'), 'linkOptions' => ['class'=>'btn btn-default', 'title'=>'Update'], 'url' => ['update', 'id' => $model->mdhl_id]],
	['label' => FA::icon('trash fa-fw'), 'linkOptions' => ['class'=>'btn btn-default', 'title'=>'Delete', 'data' => ['confirm' => Yii::t('app', 'Are you sure you want to delete this item?'), 'method' => 'post']], 'url' => ['delete', 'id' => $model->mdhl_id]],
];
?>
<div class="registration-view">

    <h1><?= Html::encode($this->title) ?></h1>

    <?= DetailView::widget([
        'model' => $model,
        'attributes' => [
			// 'mdhl_id',
	                    
	         [		   
		        'attribute'=>'mdhl_survey',
	            'value'=>Surveymaster::find()->where(["=","sur_code", $model->mdhl_survey])->one()->sur_title,
     
            ],	
			[
	            'attribute'=>'loc_code',
	            'value'=>$model->locations->loc_name,
	        ],
			'mdhl_pid',
			'mdhl_date:date',
			'mdhl_q6',
		    'mdhl_q6a',
		    'mdhl_q7',
		    'mdhl_q7a',
		    'mdhl_q8',
		    'mdhl_q8a',
		    'mdhl_q9',
		    'mdhl_q9a',
		    'mdhl_q10',
		    'mdhl_q11',
		    'mdhl_q12',
		    'mdhl_q13a',
		    'mdhl_q13b',
		    'gad_q1',
			'gad_q2',
			'gad_q3',
			'gad_q4',
			'gad_q5',
			'gad_q6',
			'gad_q7',	
			'gad_tot_score',	
		    [
				'attribute' => 'gad_anxiety_severity',
				'value' =>($model->gad_anxiety_severity !== null) ? $model->severity_gad[$model->gad_anxiety_severity] : "",
			],	
		
		    [
				'attribute' => 'gad_q8',
				'value' =>($model->gad_q8 !== null) ? $model->q8[$model->gad_q8] : "", 				
			],	
			
		    'mdhl_q15a',
		    'mdhl_q15b',
			'phq_q1',
			'phq_q2',
			'phq_q3',
			'phq_q4',
			'phq_q5',
			'phq_q6',
			'phq_q7',
			'phq_q8',
			'phq_q9',
			'phq_tot_score',	
	        [
				'attribute' => 'phq_depression_severity',
				'value' => ($model->phq_depression_severity !== null) ? $model->severity_phq[$model->phq_depression_severity] : "",
			],			
		    [
				'attribute' =>'phq_q10',
				'value' =>($model->phq_q10 !== null) ? $model->q10[$model->phq_q10] : "", 
			],	
		    'mdhl_q16',
		    'mdhl_q17',
		    'mdhl_q18',
		    'mdhl_q19',
		    'mdhl_q19a',
		    'mdhl_q19b',           
			
			[
				'attribute' => 'status',
				'value' => ($model->status == 1) ? 'Y' : 'N',
				'visible' => ($model->status === null) ? false : true,
			],
			[
				'attribute' => 'create_time',
				'format' => 'datetime',
				'visible' => ($model->update_user !== null) ? false : true,
			],
			[
				'attribute' => 'create_user',
				'value' => Common :: getUsername($model->create_user),
				'visible' => ($model->update_user !== null) ? false : true,
			],
			[
				'attribute' => 'update_time',
				'format' => 'datetime',
				'visible' => ($model->update_user === null) ? false : true,
			],
			[
				'attribute' => 'update_user',
				'value' => Common :: getUsername($model->update_user),
				'visible' => ($model->update_user === null) ? false : true,
			],
        ],
    ]) ?>

</div>
<div class="control-group buttons">
	<?= Html::Button('Back', array('class'=>'btn btn-default', 'onclick' => 'js:document.location.href="../'.Yii::$app->controller->id.'"')); ?>
</div>
<br/>