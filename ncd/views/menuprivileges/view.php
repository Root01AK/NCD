<?php

use yii\helpers\Html;
use yii\widgets\DetailView;
use rmrevin\yii\fontawesome\FA;

/* @var $this yii\web\View */
/* @var $model app\models\Menuprivileges */

$this->title = Yii::t('app', 'View {modelClass} ', [
    'modelClass' => 'Menuprivileges',
]);
$this->params['breadcrumbs'][] = ['label' => Yii::t('app', 'Menuprivileges'), 'url' => ['index']];
$this->params['breadcrumbs'][] = Yii::t('app', 'View');
$this->params['menu'] = [
	['label' => FA::icon('align-justify fa-fw'), 'linkOptions' => ['class'=>'btn btn-default', 'title'=>'List'], 'url' => ['/'.Yii::$app->controller->id]],
	['label' => FA::icon('plus fa-fw'), 'linkOptions' => ['class'=>'btn btn-default', 'title'=>'Create'], 'url' => ['create']],
	['label' => FA::icon('pencil fa-fw'), 'linkOptions' => ['class'=>'btn btn-default', 'title'=>'Update'], 'url' => ['update', 'id' => $model->mnu_acs_id]],
	['label' => FA::icon('trash fa-fw'), 'linkOptions' => ['class'=>'btn btn-default', 'title'=>'Delete', 'data' => ['confirm' => Yii::t('app', 'Are you sure you want to delete this item?'), 'method' => 'post']], 'url' => ['delete', 'id' => $model->mnu_acs_id]],
];
?>
<div class="menuprivileges-view">

    <h1><?= Html::encode($this->title) ?></h1>

    <?= DetailView::widget([
        'model' => $model,
        'attributes' => [
			// 'mnu_acs_id',
			'mnu_acs_usr_id_fk',
			'mnu_acs_mnu_id_fk',
			'mnu_acs_sub_mnu_id_fk',
			'mnu_acs_usr_status',
			'mnu_acs_add',
			'mnu_acs_edit',
			'mnu_acs_delete',
			[
				'attribute' => 'status',
				'value' => ($model->status == 1) ? 'Y' : 'N',
				'visible' => ($model->status === null) ? false : true,
			],
			'create_time',
			[
				'attribute' => 'create_user',
				'visible' => ($model->update_user !== null) ? false : true,
			],
			'update_time',
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