<?php

use yii\web\View;
use app\base\Common;
use yii\helpers\Url;
use yii\helpers\Html;
use yii\widgets\ActiveForm;

/* @var $this yii\web\View */
/* @var $model app\models\Vital */
/* @var $form yii\widgets\ActiveForm */

$Surveys = Common::getSurvey();
$Locations = Common::getLocations();
$Locmap = Common::getLocmap();
$Location= Common::getSitelocation();
$Signedinloc=Common::getSigninLoc();
$PIDs = Common::getEnrollPIDs("vital");

if(Yii::$app->params['SURVEY'] != '') {
	$Locations = Common::getSurlocations(Yii::$app->params['SURVEY']);
}
if(Yii::$app->params['SURVEY'] != '' && Yii::$app->params['LOCATION'] != '') {
	$Locations = Common::getSurlocations(Yii::$app->params['SURVEY']);
	//$PIDs = Common::getClientid(Yii::$app->params['SURVEY'], Yii::$app->params['LOCATION']);
}


$JS = "
	$('.datepicker').datepicker({autoclose: true, startDate: '01-01-1900', endDate: '0', format: '".strtolower(Yii::$app->formatter->dateFormat)."'});
			
	$('#vital-vital_pid').on('select2:select', function (evt) {
		var pid = $(this)[0].value;		
		if(pid != '') {
			var link = $('#pid-info').data('link') + pid;			
			$.ajax({
				type: 'post',
				url: 'getpid',
				data: 'pid='+$(this)[0].value,
				success: function(response) {					
					if(response != null) {
						$('#vital-vital_date').val(response);						
					} else {
						$('#vital-vital_date').val('');						
					}
					
				}
			});
		}
	});		
	
	$('#vital-vital_pid').on('select2:unselect', function (evt) {
		$('#vital-vital_date').val('');		
	});
";

$this->registerJs($JS);

?>

<div class="registration-form">
	<div class="panel panel-default">
		<div class="panel-heading">
			
		</div>
		<div class="panel-body">
			<div class="row">
				<div class="col-lg-12">
					<?php
						$form = ActiveForm::begin(['enableAjaxValidation' => true, 'options' => ['class' => 'form-horizontal']]);
						$template = [
							'labelOptions' => ['class' => 'form-label'],
							'template' => '<div class="col-sm-5">{label}{hint}</div><div class="col-sm-4">{input}{error}</div>',
						];
						$htemplate = [
							'options' => ['tag' => false],
							'template' => '{input}'
						];
					?>
					
					
					<?php // echo $form->errorSummary($model); ?>		
			      <?= Common::generateControl($form, $model, $htemplate, 'vital_survey', $Surveys, 'survey', 'getSurveyid') ?>
						
				   <?php if($model->isNewRecord) : ?>						
						  <?= $form->field($model, 'vital_loc', $template)->textInput(['value' => $Locmap,'readonly' => true]) ?>
					<?php else: ?>
						   <?= $form->field($model, 'vital_loc', $template)->textInput(['value'=>$model->vital_loc,'readonly' => true]) ?>
					<?php endif; ?>	
					
					<?php if($model->isNewRecord) : ?>	
                           <?= $form->field($model, 'loc_code', $template)->dropDownList($Location,['options'=>[$Signedinloc =>['Selected'=>'selected']],'prompt' =>'Select']) ?>	
					<?php else: ?>
						   <?= $form->field($model, 'loc_code', $template)->textInput(['value'=>$model->loc_code,'readonly' => true]) ?>
					<?php endif; ?>	
					
					<?= Common::generateControl($form, $model, $template, 'vital_pid', $PIDs, 'pid', '', [Html::getInputId($model, 'vital_survey'), Html::getInputId($model, 'vital_loc')])?>
					
					<?php if($model->isNewRecord) : ?>		
						<?= $form->field($model, 'vital_date', $htemplate)->hiddenInput(['class' => 'form-control datepicker']) ?>
				    <?php else: ?>	
					   <?= $form->field($model, 'vital_date', $template)->textInput(['class' => 'form-control datepicker','value'=>$model->vital_date,'disabled' => true]) ?>
					<?php endif; ?>	
                   
					<?= $form->field($model, 'vital_pulse_rate', Common::convertTemplate($template,"after","bpm"))->textInput(['maxlength' => true]); ?>
					<div class="form-group">
						  <div class="col-sm-7">
						   <div class="lblcolor">
							  <?= Html::label('26. Blood Pressure') ?>
						   </div>
         				</div>	  
					   </div> 
					 <?= $form->field($model, 'vital_bp_diastolic', Common::convertTemplate($template,"after","mmHg"))->textInput(['maxlength' => true]); ?>
					 <?= $form->field($model, 'vital_bp_systolic', Common::convertTemplate($template,"after","mmHg"))->textInput(['maxlength' => true]); ?>			
					<?= $form->field($model, 'vital_spo2', Common::convertTemplate($template,"after","%"))->textInput(['maxlength' => true]); ?>			
									
					<?= $form->field($model, 'status', $htemplate)->hiddenInput(['value' => 1])->label("") ?>
					<?= $form->field($model, $model->isNewRecord ? 'create_user' : 'update_user', $htemplate)->hiddenInput(['value' => yii::$app->user->identity->id])->label("") ?>
					<div class="form-group">
						<div class="col-sm-offset-5 col-sm-7">
						<?= Html::submitButton($model->isNewRecord ? Yii::t('app', 'Create') : Yii::t('app', 'Update'), ['class' => $model->isNewRecord ? 'btn btn-success' : 'btn btn-primary']) ?>
											 
						<?= Html::a('Cancel', ['/'.Yii::$app->controller->id], ['class' => 'btn btn-default']) ?>
						</div>
					</div>
					<?php ActiveForm::end(); ?>
				</div>
				<!-- /.col-lg-6 (nested) -->
			</div>
			<!-- /.row (nested) -->
		</div>
		<!-- /.panel-body -->
	</div>
	<!-- /.panel -->
</div>