<?php

use yii\helpers\Html;
use rmrevin\yii\fontawesome\FA;

/* @var $this yii\web\View */
/* @var $model app\models\Surveymaster */

$this->title = Yii::t('app', 'Create {modelClass} ', [
    'modelClass' => 'Survey Master',
]);
$this->params['breadcrumbs'][] = ['label' => Yii::t('app', 'Survey Master'), 'url' => ['index']];
$this->params['breadcrumbs'][] = Yii::t('app', 'Create');
$this->params['menu'] = [
	['label' => FA::icon('align-justify fa-fw'), 'linkOptions' => ['class'=>'btn btn-default', 'title'=>'List'], 'url' => ['/'.Yii::$app->controller->id]],
];
?>
<div class="surveymaster-create">

    <h1><?= Html::encode($this->title) ?></h1>

    <?= $this->render('_form', [
        'model' => $model,
    ]) ?>

</div>
