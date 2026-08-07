<?php

use app\base\Common;
use yii\helpers\Html;
use yii\widgets\ActiveForm;
use kartik\select2\Select2;

/* @var $this yii\web\View */
/* @var $model app\models\Trackingform */
/* @var $form yii\widgets\ActiveForm */

$Surveys = Common::getSurvey();
$Locations = Common::getLocations();
$Locmap = Common::getLocmap();
$Location= Common::getSitelocation();
$Signedinloc=Common::getSigninLoc();
$PIDs = Common::getEnrollPIDs("track");

if(Yii::$app->params['SURVEY'] != '') {
	$Locations = Common::getSurlocations(Yii::$app->params['SURVEY']);
}
if(Yii::$app->params['SURVEY'] != '' && Yii::$app->params['LOCATION'] != '') {
	$Locations = Common::getSurlocations(Yii::$app->params['SURVEY']);
	
}

$JS = "
	$('.datepicker').datepicker({autoclose: true, startDate: '01-01-1900', endDate: '0', format: '".strtolower(Yii::$app->formatter->dateFormat)."'});
	
	$('#trackingform-track_form_part_id').on('select2:select', function (evt) {
		var pid = $(this)[0].value;
		if(pid != '') {
			var link = $('#pid-info').data('link') + pid;
			$.ajax({
				type: 'post',
				url: 'getscrdetails',
				data: 'pid='+$(this)[0].value,
				success: function(response) {
					
					if(response.mem_scrn_q25 != 1 || response.mem_scrn_q25 == null) {
						$('#trackingform-track_form_q2-1').prop('checked', false).prop('disabled', true);
					} else {
						$('#trackingform-track_form_q2-1').prop('disabled', false);	
					}
					
					if(response.mem_scrn_q19 == '' || response.mem_scrn_q19 == null) {
						$('#trackingform-track_form_q2-2').prop('checked', false).prop('disabled', true);
					} else {
						$('#trackingform-track_form_q2-2').prop('disabled', false);	
					}
				}
			});
		}
	});
	
	$('#trackingform-track_form_part_id').on('select2:select', function (evt) {
		var pid = $(this)[0].value;
		if(pid != '') {
			var link = $('#pid-info').data('link') + pid;
			$.ajax({
				type: 'post',
				url: 'getregdetails',
				data: 'pid='+$(this)[0].value,
				success: function(response) {
					
					if(response.corfrm_q12 == 1 || response.corfrm_q12 == 9 ) {
						$('#trackingform-track_form_q2-4').prop('checked', false).prop('disabled', true);
					} else {
						$('#trackingform-track_form_q2-4').prop('disabled', false);	
					}					
					
				}
			});
		}
	});
	
	$('#trackingform-track_form_part_id').on('select2:unselect', function (evt) {
		$('#trackingform-track_form_q2-1').prop('disabled', false);	
		$('#trackingform-track_form_q2-2').prop('disabled', false);	
		$('#trackingform-track_form_q2-4').prop('disabled', false);	
	});

	$('#trackingform-track_form_q4').change(function(){
		if($(this).val() == 3) {
			showmsg('Please Fill the Mortality Form');
		}
	});
";

$this->registerJs($JS);
?>

<div class="trackingform-form">
	<div class="panel panel-default">
		<div class="panel-heading">
			
		</div>
		<div class="panel-body">
			<div class="row">
				<div class="col-lg-12">
					<?php
						$form = ActiveForm::begin(['options' => ['class' => 'form-horizontal']]);
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
					<?= Common::generateControl($form, $model, $htemplate, 'track_form_survey', $Surveys, 'survey', 'getTrackingPIDs') ?>
					<?php if($model->isNewRecord) : ?>						
						   <?= $form->field($model, 'track_form_loc', $template)->textInput(['value' => $Locmap,'readonly' => true]) ?>
					<?php else: ?>
						   <?= $form->field($model, 'track_form_loc', $template)->textInput(['value'=>$model->track_form_loc,'readonly' => true]) ?>
					<?php endif; ?>	
					
					<?php if($model->isNewRecord) : ?>	
                           <?= $form->field($model, 'loc_code', $template)->dropDownList($Location,['options'=>[$Signedinloc =>['Selected'=>'selected']],'prompt' =>'Select']) ?>	
					<?php else: ?>
						   <?= $form->field($model, 'loc_code', $template)->textInput(['value'=>$model->loc_code,'readonly' => true]) ?>
					<?php endif; ?>	
				
					<?= Common::generateControl($form, $model, $template, 'track_form_part_id', $PIDs, 'pid', '', [Html::getInputId($model, 'track_form_survey'), Html::getInputId($model, 'track_form_loc')])?>
					
					<?= $form->field($model, 'track_form_q1', $template)->textInput(['class' => 'form-control datepicker']) ?>
					<?= $form->field($model, 'track_form_q2', $chklist_template)->checkboxList($model->q2) ?>
					<?= $form->field($model, 'track_form_q3', $chklist_template)->checkboxList($model->q3) ?>
					<?= $form->field($model, 'track_form_q4', $template)->dropDownList($model->q4, ['prompt'=>'Select']); ?>
					 <?= $form->field($model, 'track_form_q5', $template)->textarea(['maxlength' => true,'rows' => '4']) ?>
					<?= $form->field($model, 'status', $htemplate)->hiddenInput(['value' => 1])->label() ?>
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