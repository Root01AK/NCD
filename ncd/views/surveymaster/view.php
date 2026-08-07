<?php

use yii\helpers\Html;
use yii\widgets\DetailView;
use rmrevin\yii\fontawesome\FA;

/* @var $this yii\web\View */
/* @var $model app\models\Surveymaster */

$this->title = Yii::t('app', 'View {modelClass} ', [
    'modelClass' => 'Survey Master',
]);
$this->params['breadcrumbs'][] = ['label' => Yii::t('app', 'Survey Master'), 'url' => ['index']];
$this->params['breadcrumbs'][] = Yii::t('app', 'View');
$this->params['menu'] = [
	['label' => FA::icon('align-justify fa-fw'), 'linkOptions' => ['class'=>'btn btn-default', 'title'=>'List'], 'url' => ['/'.Yii::$app->controller->id]],
	['label' => FA::icon('plus fa-fw'), 'linkOptions' => ['class'=>'btn btn-default', 'title'=>'Create'], 'url' => ['create']],
	['label' => FA::icon('pencil fa-fw'), 'linkOptions' => ['class'=>'btn btn-default', 'title'=>'Update'], 'url' => ['update', 'id' => $model->sur_id]],
	['label' => FA::icon('trash fa-fw'), 'linkOptions' => ['class'=>'btn btn-default', 'title'=>'Delete', 'data' => ['confirm' => Yii::t('app', 'Are you sure you want to delete this item?'), 'method' => 'post']], 'url' => ['delete', 'id' => $model->sur_id]],
];
?>
<div class="surveymaster-view">

    <h1><?= Html::encode($this->title) ?></h1>

    <?= DetailView::widget([
        'model' => $model,
        'attributes' => [
            // 'sur_id',
            'sur_code:ntext',
            'sur_title:ntext',
            'sur_url:ntext',
            'sur_onlne_id:ntext',
            'sur_pri_db_name:ntext',
            'sur_pri_db_server:ntext',
            'sur_pri_db_usrnme:ntext',
            // 'sur_pri_db_paswrd',
            [
                'attribute' => 'sur_sec_db_name',
                'format' => 'ntext',
                'visible' => ($model->sur_sec_db_name === "") ? false : true,
            ],
            [
                'attribute' => 'sur_sec_db_server',
                'format' => 'ntext',
                'visible' => ($model->sur_sec_db_server === "") ? false : true,
            ],
            [
                'attribute' => 'sur_sec_db_usrnme',
                'format' => 'ntext',
                'visible' => ($model->sur_sec_db_usrnme === "") ? false : true,
            ],
            // 'sur_sec_db_paswrd',
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