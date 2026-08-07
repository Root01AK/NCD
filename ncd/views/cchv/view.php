<?php

use yii\helpers\Html;
use yii\widgets\DetailView;
use rmrevin\yii\fontawesome\FA;
use app\base\Common;
use app\models\Surveymaster;


/* @var $this yii\web\View */
/* @var $model app\models\Cchv */

$this->title = Yii::t('app', 'View {modelClass} ', [
    'modelClass' => 'Cchv',
]);
$this->params['breadcrumbs'][] = ['label' => Yii::t('app', 'Cchvs'), 'url' => ['index']];
$this->params['breadcrumbs'][] = Yii::t('app', 'View');
$this->params['menu'] = [
	['label' => FA::icon('align-justify fa-fw'), 'linkOptions' => ['class'=>'btn btn-default', 'title'=>'List'], 'url' => ['/'.Yii::$app->controller->id]],
	['label' => FA::icon('plus fa-fw'), 'linkOptions' => ['class'=>'btn btn-default', 'title'=>'Create'], 'url' => ['create']],
	['label' => FA::icon('pencil fa-fw'), 'linkOptions' => ['class'=>'btn btn-default', 'title'=>'Update'], 'url' => ['update', 'id' => $model->cchv_id]],
	['label' => FA::icon('trash fa-fw'), 'linkOptions' => ['class'=>'btn btn-default', 'title'=>'Delete', 'data' => ['confirm' => Yii::t('app', 'Are you sure you want to delete this item?'), 'method' => 'post']], 'url' => ['delete', 'id' => $model->cchv_id]],
];
?>
<div class="registration-view">

    <h1><?= Html::encode($this->title) ?></h1>

    <?= DetailView::widget([
        'model' => $model,
        'attributes' => [
				                    
	         [		   
		        'attribute'=>'cchv_survey',
	            'value'=>Surveymaster::find()->where(["=","sur_code", $model->cchv_survey])->one()->sur_title,
     
            ],	
			[
	            'attribute'=>'loc_code',
	            'value'=>$model->locations->loc_name,
	        ],
			'cchv_pid',
			'cchv_date:date',	
'cchv_q53',
'cchv_q54',
'cchv_q55',
'cchv_q55a',
'cchv_q56',
'cchv_q56a',
'cchv_q57',
'cchv_q58',
'cchv_q58a',
'cchv_q59',
'cchv_q60',
'cchv_q61',
'cchv_q61a',
'cchv_q62',
'cchv_q63',
'cchv_q64',
'cchv_q65',
'cchv_q66',
'cchv_q67',
'cchv_q68',
'cchv_q69',
'cchv_q70',
'cchv_q71',
'cchv_q72',
'cchv_q73',
'cchv_q74',
'cchv_q75',
'cchv_q76',
'cchv_q77',
'cchv_q78',
'cchv_q79',
'cchv_q80',
'cchv_q81',
'cchv_q82',
'cchv_q83',
'cchv_q84',
'cchv_q85',
'cchv_q86',
'cchv_q87',
'cchv_q88',
'cchv_q89',
'cchv_q90',
'cchv_q91',
'cchv_q92',
'cchv_q93',
'cchv_q94',
'cchv_q95',
'cchv_q96',
'cchv_q97',
'cchv_q98',
'cchv_q99',
'cchv_q99a',
'cchv_q100',
'cchv_q101',
'cchv_q101a',
'cchv_q102',
'cchv_q103',
'cchv_q104',
'cchv_q104a',
'cchv_q105',
'cchv_q106',
'cchv_q107',
'cchv_q108',
'cchv_q109',
'cchv_q110',
'cchv_q111',
'cchv_q112',
'cchv_q113',
'cchv_q114',
'cchv_q115',
'cchv_q116',
'cchv_q117',
'cchv_q118',
'cchv_q119',
'cchv_q120',
'cchv_q121',
'cchv_q122',
			
			
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
				'value' => Common :: getUsername($model->create_user),
				'visible' => ($model->update_user !== null) ? false : true,
			],
			[
				'attribute' => 'update_time',
				'format' => 'datetime',
				'visible' => ($model->update_user === null) ? false : true,
			],
			[
				'attribute' => 'update_user',
				'value' => Common :: getUsername($model->update_user),
				'visible' => ($model->update_user === null) ? false : true,
			],
        ],
    ]) ?>

</div>
<div class="control-group buttons">
	<?= Html::Button('Back', array('class'=>'btn btn-default', 'onclick' => 'js:document.location.href="../'.Yii::$app->controller->id.'"')); ?>
</div>
<br/>