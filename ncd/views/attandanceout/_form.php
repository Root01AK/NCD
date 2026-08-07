<?php

use app\base\Common;
use yii\helpers\Html;
use yii\widgets\ActiveForm;
use kartik\select2\Select2;

/* @var $this yii\web\View */
/* @var $model app\models\Attandance */
/* @var $form yii\widgets\ActiveForm */

$Surveys = Common::getSurvey();
$Locations = Common::getLocations();
$PIDs = Common::getAttendanceOutPIDs();
$Locmap = Common::getLocmap();
$Location= Common::getSitelocation();
$Signedinloc=Common::getSigninLoc();

/*
if(Yii::$app->params['SURVEY'] != '') {
	$Locations = Common::getSurlocations(Yii::$app->params['SURVEY']);
}
if(Yii::$app->params['SURVEY'] != '' && Yii::$app->params['LOCATION'] != '') {
	$Locations = Common::getSurlocations(Yii::$app->params['SURVEY']);
	$PIDs = Common::getAttendanceOutPIDs(Yii::$app->params['SURVEY'], Yii::$app->params['LOCATION']);
}
*/

?>

<div class="attandance-form">
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
						$htemplate = [
							'options' => ['tag' => false],
							'template' => '{input}'
						];
					?>
					<?= Common::generateControl($form, $model, $htemplate, 'sid', $Surveys, 'survey', 'getAttendanceOutPIDs') ?>
					<?= $form->field($model, 'location', $htemplate)->hiddenInput(['value' => $Locmap])->label("") ?>
					<?php if($model->isNewRecord) : ?>						
						   <?= $form->field($model, 'state_code', $template)->textInput(['value' => $Locmap,'readonly' => true]) ?>
					<?php else: ?>
						   <?= $form->field($model, 'state_code', $template)->textInput(['value'=>$model->state_code,'readonly' => true]) ?>
					<?php endif; ?>	
										
					<?php if($model->isNewRecord) : ?>						
						   <?= $form->field($model, 'loc_code', $template)->dropDownList($Location,['prompt' =>'Select']) ?>
					<?php else: ?>
						   <?= $form->field($model, 'loc_code', $template)->textInput(['value'=>$model->loc_code,'readonly' => true]) ?>
					<?php endif; ?>		
                    
                    <?= Common::generateControl($form, $model, $template, 'pid', $PIDs, 'pid', '', [Html::getInputId($model, 'sid'), Html::getInputId($model, 'loc_code')]) ?>	
					<div class="col-md-push-2 col-md-8" id="services"></div>
					<?= $form->field($model, 'out_interviewer', $template)->textInput(['maxlength' => true]) ?>
					<?= $form->field($model, 'remarks', $template)->textarea(['maxlength' => true,'rows' => '4']) ?>			
					<?= $form->field($model, 'status', $htemplate)->hiddenInput(['value' => 1])->label("") ?>
					<?= $form->field($model, 'update_user', $htemplate)->hiddenInput(['value' => yii::$app->user->identity->id])->label("") ?>
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