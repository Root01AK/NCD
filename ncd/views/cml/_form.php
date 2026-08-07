<?php

use yii\web\View;
use app\base\Common;
use yii\helpers\Url;
use yii\helpers\Html;
use yii\widgets\ActiveForm;

/* @var $this yii\web\View */
/* @var $model app\models\Cml */
/* @var $form yii\widgets\ActiveForm */

$Surveys = Common::getSurvey();
$Locations = Common::getLocations();
$Locmap = Common::getLocmap();
$Location= Common::getSitelocation();
$Signedinloc=Common::getSigninLoc();
$PIDs = Common::getEnrollPIDs("cml");

if(Yii::$app->params['SURVEY'] != '') {
	$Locations = Common::getSurlocations(Yii::$app->params['SURVEY']);
}
if(Yii::$app->params['SURVEY'] != '' && Yii::$app->params['LOCATION'] != '') {
	$Locations = Common::getSurlocations(Yii::$app->params['SURVEY']);
	//$PIDs = Common::getClientid(Yii::$app->params['SURVEY'], Yii::$app->params['LOCATION']);
}


$JS = "
	$('.datepicker').datepicker({autoclose: true, startDate: '01-01-1900', endDate: '0', format: '".strtolower(Yii::$app->formatter->dateFormat)."'});
			
	$('#cml-cml_pid').on('select2:select', function (evt) {
		var pid = $(this)[0].value;		
		if(pid != '') {
			var link = $('#pid-info').data('link') + pid;			
			$.ajax({
				type: 'post',
				url: 'getpid',
				data: 'pid='+$(this)[0].value,
				success: function(response) {					
					if(response != null) {
						$('#cml-cml_date').val(response);						
					} else {
						$('#cml-cml_date').val('');						
					}
					
				}
			});
		}
	});		
	
	$('#cml-cml_pid').on('select2:unselect', function (evt) {
		$('#cml-cml_date').val('');		
	});
	
	$('#cml-cml_q2').change(function(){
		// $('div.form-group').show();
		$('div.help-block').html('');
		$('div.form-group').removeClass('has-success').removeClass('has-error');
		if($(this).val() == '1') {
			$('div.form-group.field-cml-cml_q2a').addClass('required').show();
		} else {
			$('div.form-group.field-cml-cml_q2a').removeClass('required').hide();
			
			$('#cml-cml_q2a').val('');
		}
	});
	
	
	$('#cml-cml_q4').change(function(){
		// $('div.form-group').show();
		$('div.help-block').html('');
		$('div.form-group').removeClass('has-success').removeClass('has-error');
		if($(this).val() == '1') {
			$('div.form-group.field-cml-cml_q4_date').addClass('required').show();
		} else {
			$('div.form-group.field-cml-cml_q4_date').removeClass('required').hide();
			
			$('#cml-cml_q4_date').val('');
		}
	});
	
	 $('#cml-cml_q6-6').change(function(){
		// $('div.form-group').show();
		$('div.help-block').html('');
		$('div.form-group').removeClass('has-success').removeClass('has-error');
		if($(this).prop('checked')) {
			$('div.form-group.field-cml-cml_q6a').addClass('required').show();
		  } 
	    else { $('div.form-group.field-cml-cml_q6a').removeClass('required').hide();
           $('#cml-cml_q6a').val('');			
		}
	});
	
	$('#cml-cml_q6 input[type=checkbox],#cml-cml_q2,#cml-cml_q4').trigger('change');
	
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
						
						$chklist_template = [
							'labelOptions' => ['class' => 'form-label'],
							'template' => '<div class="col-sm-5">{label}{hint}</div><div class="col-sm-4 checkbox-list">{input}{error}</div>',
						];
						
						$htemplate = [
							'options' => ['tag' => false],
							'template' => '{input}'
						];
					?>
					
					
					<?php // echo $form->errorSummary($model); ?>		
			      <?= Common::generateControl($form, $model, $htemplate, 'cml_survey', $Surveys, 'survey', 'getSurveyid') ?>
						
				   <?php if($model->isNewRecord) : ?>						
						  <?= $form->field($model, 'cml_loc', $template)->textInput(['value' => $Locmap,'readonly' => true]) ?>
					<?php else: ?>
						   <?= $form->field($model, 'cml_loc', $template)->textInput(['value'=>$model->cml_loc,'readonly' => true]) ?>
					<?php endif; ?>	
					
					<?php if($model->isNewRecord) : ?>	
                           <?= $form->field($model, 'loc_code', $template)->dropDownList($Location,['options'=>[$Signedinloc =>['Selected'=>'selected']],'prompt' =>'Select']) ?>	
					<?php else: ?>
						   <?= $form->field($model, 'loc_code', $template)->textInput(['value'=>$model->loc_code,'readonly' => true]) ?>
					<?php endif; ?>	
					
					<?= Common::generateControl($form, $model, $template, 'cml_pid', $PIDs, 'pid', '', [Html::getInputId($model, 'cml_survey'), Html::getInputId($model, 'cml_loc')])?>
					
					<?php if($model->isNewRecord) : ?>		
						<?= $form->field($model, 'cml_date', $htemplate)->hiddenInput(['class' => 'form-control datepicker']) ?>
				    <?php else: ?>	
					   <?= $form->field($model, 'cml_date', $template)->textInput(['class' => 'form-control datepicker','value'=>$model->cml_date,'disabled' => true]) ?>
					<?php endif; ?>
				   
					<?= $form->field($model, 'cml_q2', $template)->dropDownList($model->yes_no, ['prompt'=>'Select']); ?>
					<?= $form->field($model, 'cml_q2a', $template)->textInput(['maxlength' => true]); ?>
	                <?= $form->field($model, 'cml_q4', $template)->dropDownList($model->yes_no, ['prompt'=>'Select']); ?>
					<?= $form->field($model, 'cml_q4_date', $template)->textInput(['class' => 'form-control datepicker']) ?>
					<?= $form->field($model, 'cml_q5', $template)->dropDownList($model->yes_no, ['prompt'=>'Select']); ?>
                    <?= $form->field($model, 'cml_q6', $chklist_template)->checkboxList($model->q6); ?>	
	                <?= $form->field($model, 'cml_q6a', $template)->textInput(['maxlength' => true]); ?>						
									
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