<?php

use yii\web\View;
use app\base\Common;
use yii\helpers\Url;
use yii\helpers\Html;
use yii\widgets\ActiveForm;

/* @var $this yii\web\View */
/* @var $model app\models\Fupm */
/* @var $form yii\widgets\ActiveForm */

$Surveys = Common::getSurvey();
$Locations = Common::getLocations();
$Locmap = Common::getLocmap();
$Location= Common::getSitelocation();
$Signedinloc=Common::getSigninLoc();
$PIDs = Common::getEnrollPIDs("fupm");

if(Yii::$app->params['SURVEY'] != '') {
	$Locations = Common::getSurlocations(Yii::$app->params['SURVEY']);
}
if(Yii::$app->params['SURVEY'] != '' && Yii::$app->params['LOCATION'] != '') {
	$Locations = Common::getSurlocations(Yii::$app->params['SURVEY']);
	//$PIDs = Common::getClientid(Yii::$app->params['SURVEY'], Yii::$app->params['LOCATION']);
}


$JS = "
	$('.datepicker').datepicker({autoclose: true, startDate: '01-01-1900', format: '".strtolower(Yii::$app->formatter->dateFormat)."'});	
			
	$('#fupm-fupm_pid').on('select2:select', function (evt) {
		var pid = $(this)[0].value;		
		if(pid != '') {
			var link = $('#pid-info').data('link') + pid;			
			$.ajax({
				type: 'post',
				url: 'getpid',
				data: 'pid='+$(this)[0].value,
				success: function(response) {					
					if(response != null) {
						$('#fupm-fupm_date').val(response);						
					} else {
						$('#fupm-fupm_date').val('');						
					}
					
				}
			});
		}
	});		
	
	$('#fupm-fupm_pid').on('select2:unselect', function (evt) {
		$('#fupm-fupm_date').val('');		
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
						
						$template1 = [
							'labelOptions' => ['class' => 'form-label'],
							'template' => '<div class="col-sm-12">{hint}{input}{error}</div>',
							//'template' => '<div class="col-sm-5">{label}{hint}</div><div class="col-sm-4">{input}{error}</div>',
						];
						
						$htemplate = [
							'options' => ['tag' => false],
							'template' => '{input}'
						];
					?>
					
					
					<?php // echo $form->errorSummary($model); ?>		
			      <?= Common::generateControl($form, $model, $htemplate, 'fupm_survey', $Surveys, 'survey', 'getSurveyid') ?>
						
				   <?php if($model->isNewRecord) : ?>						
						  <?= $form->field($model, 'fupm_loc', $template)->textInput(['value' => $Locmap,'readonly' => true]) ?>
					<?php else: ?>
						   <?= $form->field($model, 'fupm_loc', $template)->textInput(['value'=>$model->fupm_loc,'readonly' => true]) ?>
					<?php endif; ?>	
					
					<?php if($model->isNewRecord) : ?>	
                           <?= $form->field($model, 'loc_code', $template)->dropDownList($Location,['options'=>[$Signedinloc =>['Selected'=>'selected']],'prompt' =>'Select']) ?>	
					<?php else: ?>
						   <?= $form->field($model, 'loc_code', $template)->textInput(['value'=>$model->loc_code,'readonly' => true]) ?>
					<?php endif; ?>	
					
					<?= Common::generateControl($form, $model, $template, 'fupm_pid', $PIDs, 'pid', '', [Html::getInputId($model, 'fupm_survey'), Html::getInputId($model, 'fupm_loc')])?>
					
					<?php if($model->isNewRecord) : ?>		
						<?= $form->field($model, 'fupm_date', $htemplate)->hiddenInput(['class' => 'form-control datepicker']) ?>
				    <?php else: ?>	
					   <?= $form->field($model, 'fupm_date', $template)->textInput(['class' => 'form-control datepicker','value'=>$model->fupm_date,'disabled' => true]) ?>
					<?php endif; ?>
				   				
					<?= $form->field($model, 'fupm_q7', $template)->dropDownList($model->yes_no, ['prompt'=>'Select
					']); ?>	
					
                      <div class="row ">
					     <div class="col-sm-2">						  		
						 </div>
						 <div class="col-sm-3">						  		
						 </div>
						
						 <div class="col-sm-2">
						   <?= Html::label('&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp Date') ?>		
						 </div>
						  <div class="col-sm-3">
						   <?= Html::label('&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp Remarks'); ?>
						 </div>		
				    </div>						  
                         	
                     <div class="row ">
					     <div class="col-sm-2">						  		
						 </div>
						 <div class="col-sm-3">						  		
						 </div>
						
						 <div class="col-sm-2">
						  <?= $form->field($model, 'fupm_fupdate1', $template1)->textInput(['class' => 'form-control datepicker']) ?>		
						 </div>
						  <div class="col-sm-3">
						   <?= $form->field($model, 'fupm_fupremarks1', $template1)->textarea(['maxlength' => true,'rows' => '3']) ?>
						 </div>		
				    </div>	
					
					<div class="row ">	
                          <div class="col-sm-2">						  		
						 </div>
						 <div class="col-sm-3">						  		
						 </div>				    
						 <div class="col-sm-2">
						  <?= $form->field($model, 'fupm_fupdate2', $template1)->textInput(['class' => 'form-control datepicker']) ?>			
						  </div>
						  <div class="col-sm-3">
						   <?= $form->field($model, 'fupm_fupremarks2', $template1)->textarea(['maxlength' => true,'rows' => '3']) ?>
						 </div>		
				    </div>	
					
					<div class="row ">
					      <div class="col-sm-2">						  		
						 </div>
						 <div class="col-sm-3">						  		
						 </div>
						 <div class="col-sm-2">
						  <?= $form->field($model, 'fupm_fupdate3', $template1)->textInput(['class' => 'form-control datepicker']) ?>			
						  </div>
						  <div class="col-sm-3">
						   <?= $form->field($model, 'fupm_fupremarks3', $template1)->textarea(['maxlength' => true,'rows' => '3']) ?>
						 </div>		
				    </div>						
									
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