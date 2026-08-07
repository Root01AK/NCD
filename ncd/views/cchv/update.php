<?php

use yii\helpers\Html;
use rmrevin\yii\fontawesome\FA;

/* @var $this yii\web\View */
/* @var $model app\models\Cchv */

$this->title = Yii::t('app', 'Update {modelClass} ', [
    'modelClass' => 'Cchv',
]);
$this->params['breadcrumbs'][] = ['label' => Yii::t('app', 'Cchvs'), 'url' => ['index']];
$this->params['breadcrumbs'][] = Yii::t('app', 'Update');
$this->params['menu'] = [
	['label' => FA::icon('align-justify fa-fw'), 'linkOptions' => ['class'=>'btn btn-default', 'title'=>'List'], 'url' => ['/'.Yii::$app->controller->id]],
	['label' => FA::icon('plus fa-fw'), 'linkOptions' => ['class'=>'btn btn-default', 'title'=>'Create'], 'url' => ['create']],
	['label' => '<i class="glyphicon glyphicon-eye-open"></i>', 'linkOptions' => ['class'=>'btn btn-default', 'title'=>'View'], 'url' => ['view', 'id' => $model->cchv_id]],
	['label' => FA::icon('trash fa-fw'), 'linkOptions' => ['class'=>'btn btn-default', 'title'=>'Delete', 'data' => ['confirm' => Yii::t('app', 'Are you sure you want to delete this item?'), 'method' => 'post']], 'url' => ['delete', 'id' => $model->cchv_id]],
];
?>
<div class="registration-update">

    <h1><?= Html::encode($this->title) ?></h1>

    <?= $this->render('_form', [
        'model' => $model,
    ]) ?>

</div>
