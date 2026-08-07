<?php

use yii\helpers\Html;
use yii\grid\GridView;
use rmrevin\yii\fontawesome\FA;
use yii\widgets\Pjax;
/* @var $this yii\web\View */
/* @var $searchModel app\models\MenuprivilegesSearch */
/* @var $dataProvider yii\data\ActiveDataProvider */

$this->title = Yii::t('app', 'Menuprivileges');
$this->params['breadcrumbs'][] = $this->title;
$this->params['menu'] = [
	['label' => FA::icon('plus fa-fw'), 'linkOptions' => ['class'=>'btn btn-default', 'title'=>'Create'], 'url' => ['create']],
];
?>
<div class="menuprivileges-index">

    <h1><?= Html::encode($this->title) ?></h1>
    <?php // echo $this->render('_search', ['model' => $searchModel]); ?>
<?php Pjax::begin(['enablePushState' => false, 'clientOptions' => ['method' => 'POST']]); ?>    <?= GridView::widget([
        'dataProvider' => $dataProvider,
         'filterModel' => $searchModel,
        'columns' => [
            ['class' => 'yii\grid\SerialColumn'],

			// 'mnu_acs_id',
			'mnu_acs_usr_id_fk',
			'mnu_acs_mnu_id_fk',
			[
				'attribute' => 'mnu_acs_sub_mnu_id_fk',
				'value' => 'submenus.sub_mnu_desc',
			],
			// 'mnu_acs_usr_status',
			// 'mnu_acs_add',
			// 'mnu_acs_edit',
			// 'mnu_acs_delete',
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
<?php Pjax::end(); ?></div>
