<?php

use yii\helpers\Html;
use kartik\grid\GridView;
use rmrevin\yii\fontawesome\FA;


/* @var $this yii\web\View */
/* @var $searchModel app\models\UsersSearch */
/* @var $dataProvider yii\data\ActiveDataProvider */

$this->title = Yii::t('app', 'Users');
$this->params['breadcrumbs'][] = $this->title;
$this->params['menu'] = [
	['label' => FA::icon('plus fa-fw'), 'linkOptions' => ['class'=>'btn btn-default', 'title'=>'Create'], 'url' => ['create']],
];
?>
<div class="users-index">

    <h1><?= Html::encode($this->title) ?></h1>
    <?php // echo $this->render('_search', ['model' => $searchModel]); ?>
    <?= GridView::widget([
        'dataProvider' => $dataProvider,
         'filterModel' => $searchModel,
        'columns' => [
            ['class' => 'yii\grid\SerialColumn'],

            // 'usr_id',
            'users_name',
            // 'password:ntext',
            'full_name',
			'loc_code',
			
           // 'email:email',
            // 'status',
            // 'create_time',
            // 'create_user',
            // 'update_time',
            // 'update_user',
            // 'user_type',
			
			[
				'attribute' => 'record_date',
				'format' => 'date',
			],

            ['class' => 'app\behaviours\ActionColumns'],
        ],
    ]); ?>
</div>
