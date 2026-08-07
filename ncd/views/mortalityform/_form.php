<?php

use app\base\Common;
use yii\helpers\Html;
use yii\widgets\ActiveForm;
use kartik\select2\Select2;

/* @var $this yii\web\View */
/* @var $model app\models\Mortalityform */
/* @var $form yii\widgets\ActiveForm */

$Surveys = Common::getSurvey();
$Locations = Common::getLocations();
$Locmap = Common::getLocmap();
$Location= Common::getSitelocation();
$Signedinloc=Common::getSigninLoc();
$PIDs = Common::getEnrollPIDs("mor");

/*
if(Yii::$app->params['SURVEY'] != '') {
	$Locations = Common::getSurlocations(Yii::$app->params['SURVEY']);
}
if(Yii::$app->params['SURVEY'] != '' && Yii::$app->params['LOCATION'] != '') {
	$Locations = Common::getSurlocations(Yii::$app->params['SURVEY']);
	$PIDs = Common::getMortalityPIDs(Yii::$app->params['SURVEY'], Yii::$app->params['LOCATION']);
}
*/

$JS = "
	$('.datepicker').datepicker({autoclose: true, startDate: '01-01-1900', endDate: '0', format: '".strtolower(Yii::$app->formatter->dateFormat)."'});

	$('#mortalityform-mortality_form_q4').change(function(){
		// $('div.form-group').show();
		$('div.help-block').html('');
		$('div.form-group').removeClass('has-success').removeClass('has-error');
		if($(this).val() == 9) {
			$('div.form-group.field-mortalityform-mortality_form_q5').addClass('required').show();
		} else {
			$('div.form-group.field-mortalityform-mortality_form_q5').removeClass('required').hide();
			
			$('#mortalityform-mortality_form_q5').val('');
		}
	});
	$('#mortalityform-mortality_form_q4').trigger('change');
";

$this->registerJs($JS);
?>

<div class="mortalityform-form">
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
					<?= Common::generateControl($form, $model, $htemplate, 'mortality_form_survey', $Surveys, 'survey', 'getMortalityPIDs') ?>
					<?php if($model->isNewRecord) : ?>						
						   <?= $form->field($model, 'mortality_form_loc', $template)->textInput(['value' => $Locmap,'readonly' => true]) ?>
					<?php else: ?>
						   <?= $form->field($model, 'mortality_form_loc', $template)->textInput(['value'=>$model->mortality_form_loc,'readonly' => true]) ?>
					<?php endif; ?>	
					
				<?php if($model->isNewRecord) : ?>	
                           <?= $form->field($model, 'loc_code', $template)->dropDownList($Location,['options'=>[$Signedinloc =>['Selected'=>'selected']],'prompt' =>'Select']) ?>	
					<?php else: ?>
						   <?= $form->field($model, 'loc_code', $template)->textInput(['value'=>$model->loc_code,'readonly' => true]) ?>
					<?php endif; ?>	
								
					<?= Common::generateControl($form, $model, $template, 'mortality_form_part_id', $PIDs, 'pid', '', [Html::getInputId($model, 'mortality_form_survey'), Html::getInputId($model, 'mortality_form_loc')])?>
					
					<?= $form->field($model, 'mortality_form_q1', $chklist_template)->checkboxList($model->q1) ?>
					<?= $form->field($model, 'mortality_form_q2', $chklist_template)->checkboxList($model->q2) ?>
					<?= $form->field($model, 'mortality_form_q3', $template)->textInput(['class' => 'form-control datepicker']) ?>
					<?= $form->field($model, 'mortality_form_q4', $template)->dropDownList($model->q4, ['prompt'=>'Select']); ?>
					<?= $form->field($model, 'mortality_form_q5', $template)->textInput(['maxlength' => true]) ?>
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