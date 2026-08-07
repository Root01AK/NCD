<?php

use yii\helpers\Html;
use yii\widgets\DetailView;
use rmrevin\yii\fontawesome\FA;
use app\base\Common;
use app\models\Surveymaster;


/* @var $this yii\web\View */
/* @var $model app\models\Cml */

$this->title = Yii::t('app', 'View {modelClass} ', [
    'modelClass' => 'Cml',
]);
$this->params['breadcrumbs'][] = ['label' => Yii::t('app', 'Cmls'), 'url' => ['index']];
$this->params['breadcrumbs'][] = Yii::t('app', 'View');
$this->params['menu'] = [
	['label' => FA::icon('align-justify fa-fw'), 'linkOptions' => ['class'=>'btn btn-default', 'title'=>'List'], 'url' => ['/'.Yii::$app->controller->id]],
	['label' => FA::icon('plus fa-fw'), 'linkOptions' => ['class'=>'btn btn-default', 'title'=>'Create'], 'url' => ['create']],
	['label' => FA::icon('pencil fa-fw'), 'linkOptions' => ['class'=>'btn btn-default', 'title'=>'Update'], 'url' => ['update', 'id' => $model->cml_id]],
	['label' => FA::icon('trash fa-fw'), 'linkOptions' => ['class'=>'btn btn-default', 'title'=>'Delete', 'data' => ['confirm' => Yii::t('app', 'Are you sure you want to delete this item?'), 'method' => 'post']], 'url' => ['delete', 'id' => $model->cml_id]],
];
?>
<div class="registration-view">

    <h1><?= Html::encode($this->title) ?></h1>

    <?= DetailView::widget([
        'model' => $model,
        'attributes' => [
			// 'cml_id',
	                      
	         [		   
		        'attribute'=>'cml_survey',
	            'value'=>Surveymaster::find()->where(["=","sur_code", $model->cml_survey])->one()->sur_title,
     
            ],	
			[
	            'attribute'=>'loc_code',
	            'value'=>$model->locations->loc_name,
	        ],
			'cml_pid',
			'cml_date:date',
			'cml_q2',
            'cml_q2a',				
			'cml_q4',
			'cml_q4_date:date',	
			'cml_q5',			
			'cml_q6',
			'cml_q6a',
						
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