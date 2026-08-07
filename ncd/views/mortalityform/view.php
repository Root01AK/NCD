<?php

use yii\helpers\Html;
use yii\widgets\DetailView;
use rmrevin\yii\fontawesome\FA;
use app\models\Surveymaster;

/* @var $this yii\web\View */
/* @var $model app\models\Mortalityform */

$this->title = Yii::t('app', 'View {modelClass} ', [
    'modelClass' => 'Mortalityform',
]);
$this->params['breadcrumbs'][] = ['label' => Yii::t('app', 'Mortalityforms'), 'url' => ['index']];
$this->params['breadcrumbs'][] = Yii::t('app', 'View');
$this->params['menu'] = [
	['label' => FA::icon('align-justify fa-fw'), 'linkOptions' => ['class'=>'btn btn-default', 'title'=>'List'], 'url' => ['/'.Yii::$app->controller->id]],
	['label' => FA::icon('plus fa-fw'), 'linkOptions' => ['class'=>'btn btn-default', 'title'=>'Create'], 'url' => ['create']],
	['label' => FA::icon('pencil fa-fw'), 'linkOptions' => ['class'=>'btn btn-default', 'title'=>'Update'], 'url' => ['update', 'id' => $model->mortality_form_id]],
	['label' => FA::icon('trash fa-fw'), 'linkOptions' => ['class'=>'btn btn-default', 'title'=>'Delete', 'data' => ['confirm' => Yii::t('app', 'Are you sure you want to delete this item?'), 'method' => 'post']], 'url' => ['delete', 'id' => $model->mortality_form_id]],
];
?>
<div class="mortalityform-view">

    <h1><?= Html::encode($this->title) ?></h1>

    <?= DetailView::widget([
        'model' => $model,
        'attributes' => [
			// 'mortality_form_id',
			
			 [		   
		        'attribute'=>'mortality_form_survey',
	            'value'=>Surveymaster::find()->where(["=","sur_code", $model->mortality_form_survey])->one()->sur_title,
     
            ],	
			'mortality_form_loc',
			'mortality_form_part_id',
			'mortality_form_q1',
			'mortality_form_q2',
			
			 [
				'attribute' => 'mortality_form_q3',
				'format' => 'date',				
			],	
			'mortality_form_q4',
			'mortality_form_q5',
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
				'visible' => ($model->update_user !== null) ? false : true,
			],
			[
				'attribute' => 'update_time',
				'format' => 'datetime',
				'visible' => ($model->update_user === null) ? false : true,
			],
			[
				'attribute' => 'update_user',
				'visible' => ($model->update_user === null) ? false : true,
			],
        ],
    ]) ?>

</div>
<div class="control-group buttons">
	<?= Html::Button('Back', array('class'=>'btn btn-default', 'onclick' => 'js:document.location.href="../'.Yii::$app->controller->id.'"')); ?>
</div>
<br/>