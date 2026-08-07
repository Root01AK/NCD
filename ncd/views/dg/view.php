<?php

use yii\helpers\Html;
use yii\widgets\DetailView;
use rmrevin\yii\fontawesome\FA;
use app\base\Common;
use app\models\Surveymaster;

/* @var $this yii\web\View */
/* @var $model app\models\Dg */

$this->title = Yii::t('app', 'View {modelClass} ', [
    'modelClass' => 'Dg',
]);
$this->params['breadcrumbs'][] = ['label' => Yii::t('app', 'Dgs'), 'url' => ['index']];
$this->params['breadcrumbs'][] = Yii::t('app', 'View');
$this->params['menu'] = [
	['label' => FA::icon('align-justify fa-fw'), 'linkOptions' => ['class'=>'btn btn-default', 'title'=>'List'], 'url' => ['/'.Yii::$app->controller->id]],
	['label' => FA::icon('plus fa-fw'), 'linkOptions' => ['class'=>'btn btn-default', 'title'=>'Create'], 'url' => ['create']],
	['label' => FA::icon('pencil fa-fw'), 'linkOptions' => ['class'=>'btn btn-default', 'title'=>'Update'], 'url' => ['update', 'id' => $model->dg_id]],
	['label' => FA::icon('trash fa-fw'), 'linkOptions' => ['class'=>'btn btn-default', 'title'=>'Delete', 'data' => ['confirm' => Yii::t('app', 'Are you sure you want to delete this item?'), 'method' => 'post']], 'url' => ['delete', 'id' => $model->dg_id]],
];
?>
<div class="registration-view">

    <h1><?= Html::encode($this->title) ?></h1>

    <?= DetailView::widget([
        'model' => $model,
        'attributes' => [
			// 'dg_id',
	       
            [		   
		        'attribute'=>'dg_survey',
	            'value'=>Surveymaster::find()->where(["=","sur_code", $model->dg_survey])->one()->sur_title,
     
            ],			
	   
			[
	            'attribute'=>'loc_code',
	            'value'=>$model->locations->loc_name,
	        ],
			'dg_pid',
			[
				'attribute' => 'dg_geographical_area',
				'value' => $model->garea[$model->dg_geographical_area],
			],				
			
			'dg_date:date',
			'dg_q1',
            [
				'attribute' => 'dg_q2',
				'value' => $model->q2[$model->dg_q2],
			],	
			'dg_q3',		
			[
				'attribute' => 'dg_q4',
				'value' => $model->q4[$model->dg_q4],
			],
			'dg_q4a',
			[
				'attribute' => 'dg_q5',
				'value' => $model->q5[$model->dg_q5],
			],	
            [
				'attribute' => 'dg_q5a',
				'value' => ($model->dg_q5a !== null) ? $model->q5a[$model->dg_q5a] : '',
			],	    

            [
				'attribute' => 'dg_q5b',
				'value' => ($model->dg_q5b !== null) ? $model->q5b[$model->dg_q5b] : '',
			],	 
            
            [
				'attribute' => 'dg_q5c',
				'value' => ($model->dg_q5c !== null) ? $model->q5c[$model->dg_q5c] : '',
			],   			
			
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