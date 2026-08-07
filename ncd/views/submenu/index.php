<?php

use yii\helpers\Html;
use yii\grid\GridView;
use rmrevin\yii\fontawesome\FA;
use yii\widgets\Pjax;
/* @var $this yii\web\View */
/* @var $searchModel app\models\SubmenuSearch */
/* @var $dataProvider yii\data\ActiveDataProvider */

$this->title = Yii::t('app', 'Submenus');
$this->params['breadcrumbs'][] = $this->title;
$this->params['menu'] = [
	['label' => FA::icon('plus fa-fw'), 'linkOptions' => ['class'=>'btn btn-default', 'title'=>'Create'], 'url' => ['create']],
];
?>
<div class="submenu-index">

    <h1><?= Html::encode($this->title) ?></h1>
    <?php // echo $this->render('_search', ['model' => $searchModel]); ?>
<?php Pjax::begin(['enablePushState' => false, 'clientOptions' => ['method' => 'POST']]); ?>   <?= GridView::widget([
        'dataProvider' => $dataProvider,
         'filterModel' => $searchModel,
        'columns' => [
            ['class' => 'yii\grid\SerialColumn'],

			// 'sub_mnu_id',
			'min_mnu_id_fk',
			'sub_mnu_name:ntext',
			'sub_mnu_desc:ntext',
			'sub_mnu_preference',
			// 'status',
			// 'create_time:datetime',
			// 'create_user',
			// 'update_time:datetime',
			// 'update_user',
			[
				'attribute' => 'record_date',
				'format' => 'date',
			],

            ['class' => 'app\behaviours\ActionColumns'],
        ],
    ]); ?>
<?php Pjax::end(); ?></div>
