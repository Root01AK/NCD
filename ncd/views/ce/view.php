<?php

use yii\helpers\Html;
use yii\widgets\DetailView;
use rmrevin\yii\fontawesome\FA;
use app\base\Common;
use app\models\Surveymaster;


/* @var $this yii\web\View */
/* @var $model app\models\Ce */

$this->title = Yii::t('app', 'View {modelClass} ', [
    'modelClass' => 'Ce',
]);
$this->params['breadcrumbs'][] = ['label' => Yii::t('app', 'Ces'), 'url' => ['index']];
$this->params['breadcrumbs'][] = Yii::t('app', 'View');
$this->params['menu'] = [
	['label' => FA::icon('align-justify fa-fw'), 'linkOptions' => ['class'=>'btn btn-default', 'title'=>'List'], 'url' => ['/'.Yii::$app->controller->id]],
	['label' => FA::icon('plus fa-fw'), 'linkOptions' => ['class'=>'btn btn-default', 'title'=>'Create'], 'url' => ['create']],
	['label' => FA::icon('pencil fa-fw'), 'linkOptions' => ['class'=>'btn btn-default', 'title'=>'Update'], 'url' => ['update', 'id' => $model->ce_id]],
	['label' => FA::icon('trash fa-fw'), 'linkOptions' => ['class'=>'btn btn-default', 'title'=>'Delete', 'data' => ['confirm' => Yii::t('app', 'Are you sure you want to delete this item?'), 'method' => 'post']], 'url' => ['delete', 'id' => $model->ce_id]],
];
?>
<div class="registration-view">

    <h1><?= Html::encode($this->title) ?></h1>

    <?= DetailView::widget([
        'model' => $model,
        'attributes' => [
			// 'ce_id',
	                    
	         [		   
		        'attribute'=>'ce_survey',
	            'value'=>Surveymaster::find()->where(["=","sur_code", $model->ce_survey])->one()->sur_title,
     
            ],	
			[
	            'attribute'=>'loc_code',
	            'value'=>$model->locations->loc_name,
	        ],
			'ce_pid',
			'ce_date:date',			
			'ce_q1',           
			'ce_q2',
			'ce_q3',
			'ce_q4a',           
			'ce_q4b',
			'ce_q5a',
			'ce_q5b',
			'ce_q6',           
			'ce_q6a',
			
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