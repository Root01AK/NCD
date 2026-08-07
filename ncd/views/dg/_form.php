<?php

use yii\web\View;
use app\base\Common;
use yii\helpers\Url;
use yii\helpers\Html;
use yii\widgets\ActiveForm;


/* @var $this yii\web\View */
/* @var $model app\models\Dg */
/* @var $form yii\widgets\ActiveForm */

$Surveys = Common::getSurvey();
$Locations = Common::getLocations();
$Locmap = Common::getLocmap();
$Location= Common::getSitelocation();
$Signedinloc=Common::getSigninLoc();

$sid =Common::getSurveyid();
$sloc=Yii::$app->user->identity->signedin_loc;

$ClientID = Common::getClientid($sid,$sloc);
$PIDs = "";
if(Yii::$app->params['SURVEY'] != '') {
	$Locations = Common::getSurlocations(Yii::$app->params['SURVEY']);
}
if(Yii::$app->params['SURVEY'] != '' && Yii::$app->params['LOCATION'] != '') {
	$Locations = Common::getSurlocations(Yii::$app->params['SURVEY']);
	$PIDs = Common::getClientid(Yii::$app->params['SURVEY'], Yii::$app->params['LOCATION']);
}


$JS = "
	$('.datepicker').datepicker({autoclose: true, startDate: '01-01-1900', endDate: '0', format: '".strtolower(Yii::$app->formatter->dateFormat)."'});
	
	$('#dg-dg_q4').change(function(){
		// $('div.form-group').show();
		$('div.help-block').html('');
		$('div.form-group').removeClass('has-success').removeClass('has-error');
		if($(this).val() == 8) {
			$('div.form-group.field-dg-dg_q4a').addClass('required').show();
		} else {
			$('div.form-group.field-dg-dg_q4a').removeClass('required').hide();
			
			$('#dg-dg_q4a').val('');
		}
	});
	$('#dg-dg_q4').trigger('change');
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
			      <?= Common::generateControl($form, $model, $htemplate, 'dg_survey', $Surveys, 'survey', 'getSurveyid') ?>
						
				   <?php if($model->isNewRecord) : ?>						
						  <?= $form->field($model, 'dg_loc', $template)->textInput(['value' => $Locmap,'readonly' => true]) ?>
					<?php else: ?>
						   <?= $form->field($model, 'dg_loc', $template)->textInput(['value'=>$model->dg_loc,'readonly' => true]) ?>
					<?php endif; ?>	
					
					<?php if($model->isNewRecord) : ?>	
                           <?= $form->field($model, 'loc_code', $template)->dropDownList($Location,['options'=>[$Signedinloc =>['Selected'=>'selected']],'prompt' =>'Select']) ?>	
					<?php else: ?>
						   <?= $form->field($model, 'loc_code', $template)->textInput(['value'=>$model->loc_code,'readonly' => true]) ?>
					<?php endif; ?>	
					
				
					<?php if($model->isNewRecord) : ?>
						 <?= $form->field($model, 'dg_pid', $template)->textInput(['value'=>$ClientID,'readonly' => true]) ?>	
                    <?php else: ?>	
                    	<?= $form->field($model, 'dg_pid', $template)->textInput(['value'=>$model->dg_pid,'maxlength' => true, 'class' => 'form-control text-uppercase','readonly' => true]) ?>						
					<?php endif; ?>	
										
					<?php if($model->isNewRecord) : ?>		
						<?= $form->field($model, 'dg_date', $template)->textInput(['class' => 'form-control datepicker']) ?>
				    <?php else: ?>	
					   <?= $form->field($model, 'dg_date', $template)->textInput(['class' => 'form-control datepicker','value'=>$model->dg_date,'disabled' => true]) ?>
					<?php endif; ?>		
					
                    <?= $form->field($model, 'dg_geographical_area', $template)->dropDownList($model->garea, ['prompt'=>'Select']); ?>					
				  
					<?= $form->field($model, 'dg_q1', Common::convertTemplate($template,"after","Years"))->textInput(['maxlength' => true, 'data-min' => 16, 'data-max' => 60, 'data-msg' => 'Please double-check that this answer is correct']) ?>	
					
					<?= $form->field($model, 'dg_q2', $template)->dropDownList($model->q2, ['prompt'=>'Select']); ?>
					<?= $form->field($model, 'dg_q3', $template)->textInput(['maxlength' => true]); ?>
					<?= $form->field($model, 'dg_q4', $template)->dropDownList($model->q4, ['prompt'=>'Select']); ?>
					<?= $form->field($model, 'dg_q4a', $template)->textInput(['maxlength' => true]); ?>
					<?= $form->field($model, 'dg_q5', $template)->dropDownList($model->q5, ['prompt'=>'Select']); ?>
					<?= $form->field($model, 'dg_q5a', $template)->dropDownList($model->q5a, ['prompt'=>'Select']); ?>
					<?= $form->field($model, 'dg_q5b', $template)->dropDownList($model->q5b, ['prompt'=>'Select']); ?>
					<?= $form->field($model, 'dg_q5c', $template)->dropDownList($model->q5c, ['prompt'=>'Select']); ?>					
					
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