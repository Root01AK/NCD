<?php

use yii\helpers\Html;
use rmrevin\yii\fontawesome\FA;

/* @var $this yii\web\View */
/* @var $model app\models\Locationmapping */

$this->title = Yii::t('app', 'Create {modelClass} ', [
    'modelClass' => 'Locationmapping',
]);
$this->params['breadcrumbs'][] = ['label' => Yii::t('app', 'Locationmappings'), 'url' => ['index']];
$this->params['breadcrumbs'][] = Yii::t('app', 'Create');
$this->params['menu'] = [
	['label' => FA::icon('align-justify fa-fw'), 'linkOptions' => ['class'=>'btn btn-default', 'title'=>'List'], 'url' => ['/'.Yii::$app->controller->id]],
];
?>
<div class="locationmapping-create">

    <h1><?= Html::encode($this->title) ?></h1>

    <?= $this->render('_form', [
        'model' => $model,
        'models' => $models,
    ]) ?>

</div>
