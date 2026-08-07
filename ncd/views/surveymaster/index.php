<?php

use yii\helpers\Html;
use yii\grid\GridView;
use rmrevin\yii\fontawesome\FA;

/* @var $this yii\web\View */
/* @var $searchModel app\models\SurveymasterSearch */
/* @var $dataProvider yii\data\ActiveDataProvider */

$this->title = Yii::t('app', 'Survey Master');
$this->params['breadcrumbs'][] = $this->title;
$this->params['menu'] = [
	['label' => FA::icon('plus fa-fw'), 'linkOptions' => ['class'=>'btn btn-default', 'title'=>'Create'], 'url' => ['create']],
];
?>
<div class="surveymaster-index">

    <h1><?= Html::encode($this->title) ?></h1>
    <?php // echo $this->render('_search', ['model' => $searchModel]); ?>
    <?= GridView::widget([
        'dataProvider' => $dataProvider,
         'filterModel' => $searchModel,
        'columns' => [
            ['class' => 'yii\grid\SerialColumn'],

            // 'sur_id',
            'sur_code:ntext',
            'sur_title:ntext',
            // 'sur_url:ntext',
            'sur_onlne_id:ntext',
            // 'sur_pri_db_name:ntext',
            // 'sur_pri_db_server:ntext',
            // 'sur_pri_db_usrnme:ntext',
            // 'sur_pri_db_paswrd',
            // 'sur_sec_db_name:ntext',
            // 'sur_sec_db_server:ntext',
            // 'sur_sec_db_usrnme:ntext',
            // 'sur_sec_db_paswrd',
            // 'status',
            // 'create_time',
            // 'create_user',
            // 'update_time',
            // 'update_user',
			[
				'attribute' => 'record_date',
				'format' => 'date',
			],

            ['class' => 'app\behaviours\ActionColumns'],
        ],
    ]); ?>
</div>
