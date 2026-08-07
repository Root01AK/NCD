<?php

use yii\helpers\Html;
use kartik\grid\GridView;
use rmrevin\yii\fontawesome\FA;
use yii\widgets\Pjax;
/* @var $this yii\web\View */
/* @var $searchModel app\models\AttandanceSearch */
/* @var $dataProvider yii\data\ActiveDataProvider */

?>
<div class="attandance-index">

    <?= GridView::widget([
        'dataProvider' => $dataProvider,
		'formatter' => ['class' => 'yii\i18n\Formatter','nullDisplay' => '-', 'dateFormat' => 'dd-MM-Y'],
        'layout' => '<div class="box"><div class="box-header with-border"><b>Please reconfirm the mobile number and update the moblie number updation form for the following participants</b>{summary}</div><div class="box-body">{items}</div><div class="box-footer clearfix">{pager}</div></div>',
			
	    'panel' => ['type' => GridView::TYPE_PRIMARY,'heading' => '<b>Please reconfirm the mobile number and update the moblie number updation form for the following participants</b>','afterOptions'=>['class'=>'grid_panel_remove']],
		
    	// 'filterModel' => $searchModel,
        // 'showOnEmpty' => true,
        // 'emptyCell' => '-',
        'columns' => [
            ['class' => 'yii\grid\SerialColumn'],
            [
                'attribute' => 'corfrm_pid',
                'label' => 'Client ID'
            ],
			
			[
				'attribute' => 'record_date',
				'label' => 'Client Registration Date',
				'format' => 'date',
			],
                        
        ],
    ]); ?>
</div>
