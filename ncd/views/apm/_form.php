<?php

use yii\web\View;
use app\base\Common;
use yii\helpers\Url;
use yii\helpers\Html;
use yii\widgets\ActiveForm;
use kartik\select2\Select2;
use kartik\widgets\DepDrop;
use yii\helpers\ArrayHelper;

/* @var $this yii\web\View */
/* @var $model app\models\Apm */
/* @var $form yii\widgets\ActiveForm */

$Surveys = Common::getSurvey();
$Locations = Common::getLocations();
$Locmap = Common::getLocmap();
$Location= Common::getSitelocation();
$Signedinloc=Common::getSigninLoc();
$PIDs = Common::getEnrollPIDs("apm");

if(Yii::$app->params['SURVEY'] != '') {
	$Locations = Common::getSurlocations(Yii::$app->params['SURVEY']);
}
if(Yii::$app->params['SURVEY'] != '' && Yii::$app->params['LOCATION'] != '') {
	$Locations = Common::getSurlocations(Yii::$app->params['SURVEY']);
	//$PIDs = Common::getEnrollPIDs("apm",Yii::$app->params['SURVEY'], Yii::$app->params['LOCATION']);
}

$headJS = <<<JS
   function calc_bmi()
	{
		 var bmi=0;
	  	  if($('#apm-apm_q1').val() != '' &&  $('#apm-apm_q2').val() != '') {	
		   bmi = (Number($('#apm-apm_q2').val())/((Number($('#apm-apm_q1').val())/100)*(Number($('#apm-apm_q1').val())/100))).toFixed(2);		  
		   $('#apm-apm_q3').val(bmi); 
		  }
		   else 	       
			$('#apm-apm_q3').val(''); 
			
			
	}
	
	function calc_whratio()
	{
		 var whratio=0;
	  	  if($('#apm-apm_q4').val() != '' &&  $('#apm-apm_q5').val() != '') {	
		   whratio = (Number($('#apm-apm_q4').val())/Number($('#apm-apm_q5').val())).toFixed(2);		  
		   $('#apm-apm_q6').val(whratio); 
		  }
		   else 	       
			$('#apm-apm_q6').val(''); 
			
			
	}
	
JS;
$this->registerJs($headJS, View::POS_HEAD);

$JS = "
	$('.datepicker').datepicker({autoclose: true, startDate: '01-01-1900', endDate: '0', format: '".strtolower(Yii::$app->formatter->dateFormat)."'});
			
	$('#apm-apm_pid').on('select2:select', function (evt) {
		var pid = $(this)[0].value;		
		if(pid != '') {
			var link = $('#pid-info').data('link') + pid;			
			$.ajax({
				type: 'post',
				url: 'getpid',
				data: 'pid='+$(this)[0].value,
				success: function(response) {					
					if(response != null) {
						$('#apm-apm_date').val(response);						
					} else {
						$('#apm-apm_date').val('');						
					}
					
				}
			});
		}
	});		
	
	$('#apm-apm_pid').on('select2:unselect', function (evt) {
		$('#apm-apm_date').val('');		
	});
	
		
	$('#apm-apm_q1').change(function(){
		 calc_bmi();
	});
	
	$('#apm-apm_q2').change(function(){
		calc_bmi();
	});
	
	$('#apm-apm_q1').focusout(function(e){
		 calc_bmi();
	});
	
	$('#apm-apm_q2').focusout(function(e){
		calc_bmi();
	});
	
	$('#apm-apm_q1,#apm-apm_q2').trigger('change');
	
	$('#apm-apm_q4').change(function(){
		 calc_whratio();
	});
	
	$('#apm-apm_q5').change(function(){
		calc_whratio();
	});
	
	$('#apm-apm_q4').focusout(function(e){
		 calc_whratio();
	});
	
	$('#apm-apm_q5').focusout(function(e){
		calc_whratio();
	});
	
	$('#apm-apm_q4,#apm-apm_q5').trigger('change');
	
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
			       <?= Common::generateControl($form, $model, $htemplate, 'apm_survey', $Surveys, 'survey', 'getSurveyid') ?>
				
				   <?php if($model->isNewRecord) : ?>						
						  <?= $form->field($model, 'apm_loc', $template)->textInput(['value' => $Locmap,'readonly' => true]) ?>
					<?php else: ?>
						   <?= $form->field($model, 'apm_loc', $template)->textInput(['value'=>$model->apm_loc,'readonly' => true]) ?>
					<?php endif; ?>	
					
					<?php if($model->isNewRecord) : ?>	
                           <?= $form->field($model, 'loc_code', $template)->dropDownList($Location,['options'=>[$Signedinloc =>['Selected'=>'selected']],'prompt' =>'Select']) ?>	
					<?php else: ?>
						   <?= $form->field($model, 'loc_code', $template)->textInput(['value'=>$model->loc_code,'readonly' => true]) ?>
					<?php endif; ?>	
				   
					<?= Common::generateControl($form, $model, $template, 'apm_pid', $PIDs, 'pid', '', [Html::getInputId($model, 'apm_survey'), Html::getInputId($model, 'apm_loc')])?>
					
					<?php if($model->isNewRecord) : ?>		
						<?= $form->field($model, 'apm_date', $htemplate)->hiddenInput(['class' => 'form-control datepicker']) ?>
				    <?php else: ?>	
					   <?= $form->field($model, 'apm_date', $template)->textInput(['class' => 'form-control datepicker','value'=>$model->apm_date,'disabled' => true]) ?>
					<?php endif; ?>
							
				    <?= $form->field($model, 'apm_q1', Common::convertTemplate($template,"after","cm"))->textInput(['maxlength' => true]); ?>
					<?= $form->field($model, 'apm_q2', Common::convertTemplate($template,"after","kg"))->textInput(['maxlength' => true]); ?>			
					<?= $form->field($model, 'apm_q3', Common::convertTemplate($template,"after","kg/m2"))->textInput(['maxlength' => true,'readonly' => true]); ?>			
					<?= $form->field($model, 'apm_q4', Common::convertTemplate($template,"after","cm"))->textInput(['maxlength' => true]); ?>	
					<?= $form->field($model, 'apm_q5', Common::convertTemplate($template,"after","cm"))->textInput(['maxlength' => true]); ?>
					<?= $form->field($model, 'apm_q6', $template)->textInput(['maxlength' => true,'readonly' => true]); ?>
					
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