<?php

use yii\helpers\Html;
use rmrevin\yii\fontawesome\FA;

/* @var $this yii\web\View */
/* @var $model app\models\Ce */

$this->title = Yii::t('app', 'Create {modelClass} ', [
    'modelClass' => 'Ce',
]);
$this->params['breadcrumbs'][] = ['label' => Yii::t('app', 'Ces'), 'url' => ['index']];
$this->params['breadcrumbs'][] = Yii::t('app', 'Create');
$this->params['menu'] = [
	['label' => FA::icon('align-justify fa-fw'), 'linkOptions' => ['class'=>'btn btn-default', 'title'=>'List'], 'url' => ['/'.Yii::$app->controller->id]],
];
?>
<div class="registration-create">

    <h1><?= Html::encode($this->title) ?></h1>

    <?= $this->render('_form', [
        'model' => $model,
    ]) ?>

</div>
