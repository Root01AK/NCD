<?php

use yii\helpers\Html;
use yii\widgets\ActiveForm;
use yii\data\SqlDataProvider;

use kartik\grid\GridView;
use kartik\widgets\DatePicker;
use rmrevin\yii\fontawesome\FA;
use app\base\Common;
use kartik\select2\Select2;

$Location= Common::getSitelocation();

$this->title = 'Attendance Report';
$this->params['breadcrumbs'][] = $this->title;

$services = [];
$index = 0;
$services[$index]['class'] = 'yii\grid\SerialColumn';
$index++;
foreach ($model->services as $key => $value) {
    $services[$index]['attribute'] = $key;
    $services[$index]['label'] = $value;
    $index++;
    if($index == 4 || $index == 14)
        $services[$index]['format'] = 'date';
	if($index == 5 || $index == 7 || $index == 10 || $index == 12)
        $services[$index]['format'] = 'datetime';
}

if(empty($model->frmdate))
    $model->frmdate = $model->getAttnstartdate();
if(empty($model->todate))
    $model->todate = date('d-m-Y');
?>


<div class="attandance-form">
    <h1><?= Html::encode($this->title) ?></h1>
    <div class="panel panel-default">
        <div class="panel-heading">
            
        </div>
        <div class="panel-body">
            <div class="row">
                <div class="col-lg-12">
                    <?php
                         $form = ActiveForm::begin(['enableAjaxValidation' => false, 'action' => ['index'], 'method' => 'get', 'options' => ['class' => 'form-horizontal']]);	
                        $template = [
                            'labelOptions' => ['class' => 'form-label'],
                            'template' => '<div class="col-sm-5">{label}{hint}</div><div class="col-sm-4">{input}{error}</div>',
                        ];
                    ?>
					<?php if($model->getUserrole() ==1) : ?>	
                       <?= $form->field($model, 'loc', $template)->widget(Select2::classname(), ['data' => $Location,'options' => ['prompt' => 'All Spokes']]); ?>
                    <?php endif; ?>	
					
                    <?= $form->field($model, 'frmdate', $template)->widget(DatePicker::classname(), ['options' => ['placeholder' => $model->getAttributeLabel("frmdate")]]) ?>
                    <?= $form->field($model, 'todate', $template)->widget(DatePicker::classname(), ['options' => ['placeholder' => $model->getAttributeLabel("todate")]]) ?>
                    <div class="form-group">
                        <div class="col-sm-offset-5 col-sm-7">
                            <?= Html::submitButton(Yii::t('app', 'Go'), ['class' =>'btn btn-success']) ?>
                        </div>
                    </div>
                    <?php ActiveForm::end(); ?>
                    <?php if(isset($dataProvider)) : ?>
                        <?= GridView::widget([
                            'dataProvider' => $dataProvider,
                            'layout' => '<div class="box"><div class="box-header with-border"><b>Participant Age Range-wise Summary</b></div><div class="box-body">{items}</div><div class="box-footer clearfix"></div></div>',    
                            'formatter' => ['class' => 'yii\i18n\Formatter','nullDisplay' => '-', 'dateFormat' => 'dd-MM-Y','datetimeFormat' => 'dd-MM-Y H:mm:ss'],
                             'options'=>['style' => 'white-space:nowrap;'],                         
                             'panel' => ['type' => GridView::TYPE_PRIMARY,'footer'=>false], 
                             'columns' => $services 
						
                        ]); ?>
                    <?php endif; ?>
                </div>
                <!-- /.col-lg-6 (nested) -->
            </div>
            <!-- /.row (nested) -->
        </div>
        <!-- /.panel-body -->
    </div>
    <!-- /.panel -->
</div>