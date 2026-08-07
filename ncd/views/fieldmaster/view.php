<?php

use app\base\Common;
use yii\helpers\Html;
use yii\widgets\DetailView;
use rmrevin\yii\fontawesome\FA;

/* @var $this yii\web\View */
/* @var $model app\models\Fieldmaster */

$this->title = Yii::t('app', 'View {modelClass} ', [
    'modelClass' => 'Fieldmaster',
]);
$this->params['breadcrumbs'][] = ['label' => Yii::t('app', 'Fieldmasters'), 'url' => ['index']];
$this->params['breadcrumbs'][] = Yii::t('app', 'View');
$this->params['menu'] = [
	['label' => FA::icon('align-justify fa-fw'), 'linkOptions' => ['class'=>'btn btn-default', 'title'=>'List'], 'url' => ['/'.Yii::$app->controller->id]],
	['label' => FA::icon('plus fa-fw'), 'linkOptions' => ['class'=>'btn btn-default', 'title'=>'Create'], 'url' => ['create']],
	['label' => FA::icon('pencil fa-fw'), 'linkOptions' => ['class'=>'btn btn-default', 'title'=>'Update'], 'url' => ['update', 'id' => $model->fld_mstr_id]],
	['label' => FA::icon('trash fa-fw'), 'linkOptions' => ['class'=>'btn btn-default', 'title'=>'Delete', 'data' => ['confirm' => Yii::t('app', 'Are you sure you want to delete this item?'), 'method' => 'post']], 'url' => ['delete', 'id' => $model->fld_mstr_id]],
];
?>
<div class="fieldmaster-view">

    <h1><?= Html::encode($this->title) ?></h1>

    <?= DetailView::widget([
        'model' => $model,
        'attributes' => [
			// 'fld_mstr_id',
			// 'fld_mstr_frmfield',
			[
				'attribute' => 'fld_mstr_frmfield',
				'value' => $model->frmfield[$model->fld_mstr_frmfield],
			],
			'fld_mstr_code',
			'fld_mstr_desc',
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
			'record_date:date',
        ],
    ]) ?>

</div>
<div class="control-group buttons">
	<?= Html::Button('Back', array('class'=>'btn btn-default', 'onclick' => 'js:document.location.href="../'.Yii::$app->controller->id.'"')); ?>
</div>
<br/>