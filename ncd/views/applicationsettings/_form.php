<?php

use app\base\Common;
use yii\helpers\Url;
use yii\helpers\Html;
use yii\widgets\ActiveForm;
use kartik\widgets\DepDrop;

/* @var $this yii\web\View */
/* @var $model app\models\Applicationsettings */
/* @var $form yii\widgets\ActiveForm */

$Surveys = Common::getSurvey();
//if(!$model->isNewRecord)
	//$Locs = Common::getSurlocations($model->app_survey_id);
//else
	//$Locs = [];
$Locs = Common::getLocations();

if($model->isNewRecord)
	$model->status = 1;

$js = "
	$('#applicationsettings-app_coupons').change(function(){
		if($(this).is(':checked') == 1) {
			$('#cupn_cde_chk_row, #no_of_coupon_row, #cupn_prd_row, #cupn_prdtype_row').show();
			$('#no_of_coupon_row, #cupn_prd_row, #cupn_prdtype_row').find('label').addClass('required');
		} else {
			$('#cupn_cde_chk_row, #no_of_coupon_row, #cupn_prd_row, #cupn_prdtype_row').hide();
			$('#no_of_coupon_row, #cupn_prd_row, #cupn_prdtype_row').find('label').removeClass('required');
		}
	});

	$('#applicationsettings-app_incentive').change(function(){
		if($(this).is(':checked') == 1) {
			$('#incentive_amt_row').show();
			$('#incentive_amt_row').find('label').addClass('required');
		} else {
			$('#incentive_amt_row').hide();
			$('#incentive_amt_row').find('label').removeClass('required');
		}
	});

	$('#applicationsettings-app_location').change(function(){
		if($(this).val() != '') {
			$('div.form-group.field-applicationsettings-app_location_fixed').show();
			// $('#applicationsettings-app_location_fixed').prop('checked', true);
		} else {
			$('div.form-group.field-applicationsettings-app_location_fixed').hide();
			// $('#applicationsettings-app_location_fixed').prop('checked', false);
		}
	});
	$('#applicationsettings-app_coupons, #applicationsettings-app_incentive, #applicationsettings-app_location').trigger('change');
";
$this->registerJs($js);
?>

<div class="applicationsettings-form">
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
						$templatewithoutlabel = [
							'labelOptions' => ['class' => 'form-label'],
							'template' => '<div class="col-sm-12">{hint}{input}{error}</div>',
						];
						$htemplate = [
							'options' => ['tag' => false],
							'template' => '{input}'
						];
					?>
					<?php // echo $form->errorSummary($model); ?>
					<?php if(!Yii::$app->params['SURVEY_FIXED']): ?>
						<?= $form->field($model, 'app_survey_id', $template)->dropDownList($Surveys, ['prompt' => $model->getAttributeLabel("app_survey_id")]) ?>
					<?php else: ?>
						<?= $form->field($model, 'app_survey_id', $htemplate)->hiddenInput(['value' => Yii::$app->params['SURVEY']]) ?>
						<div class="form-group">
							<div class="col-sm-5"><?= Html::activeLabel($model, 'app_survey_id', ['class'=> 'form-label']); ?></div>
							<div class="col-sm-4"><span><?= Yii::$app->params['SURVEY_TITLE'] ?></span></div>
						</div>
					<?php endif; ?>
					<?= $form->field($model, 'app_coupons', $template)->checkbox(['label' => null])->label() ?>
					<?= $form->field($model, 'app_incentive', $template)->checkbox(['label' => null])->label() ?>
					<?= $form->field($model, 'app_control_site', $template)->checkbox(['label' => null])->label() ?>
					<?= $form->field($model, 'app_idu', $template)->checkbox(['label' => null])->label() ?>
					<?= $form->field($model, 'app_ost_fixed', $template)->checkbox(['label' => null])->label() ?>
					<?= $form->field($model, 'status', $template)->checkbox(['label' => null])->label() ?>
					<br/>
					<table class="table table-bordered">
						<thead>
							<tr>
								<th class="col-md-5"></th>
								<th class="col-md-5"></th>
								<th>Fixed</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td><?= Html::activeLabel($model,'app_fin_yr', ['class'=> 'app_fin_yr']); ?></td>
								<td><?= $form->field($model, 'app_fin_yr', $templatewithoutlabel)->dropDownList($model->Years, ['prompt' => $model->getAttributeLabel("app_fin_yr")]) ?></td>
								<td><?= $form->field($model, 'app_fin_yr_fixed', $htemplate)->hiddenInput(['value' => 1]) ?></td>
							</tr>
							<tr>
								<td><?= Html::activeLabel($model,'app_location', ['class'=> 'app_location']); ?></td>
								<td><?= $form->field($model, 'app_location', $templatewithoutlabel)->widget(DepDrop::classname(), ['data' => $Locs, 'options' => ['prompt' => $model->getAttributeLabel("app_location")], 'pluginOptions'=>['depends'=>[Html::getInputId($model, 'app_survey_id')], 'placeholder'=>'Select...', 'url'=>Url::to(['/dashboard/getloc'])]]) ?></td>
								<td><?= $form->field($model, 'app_location_fixed', $templatewithoutlabel)->checkbox(['label' => null]) ?></td>
							</tr>
							<tr id="cupn_cde_chk_row">
								<td><?= Html::activeLabel($model,'app_cupn_cde_fixed', ['class'=> 'app_cupn_cde_fixed']); ?></td>
								<td><?= $form->field($model, 'app_cupn_cde_fixed', $templatewithoutlabel)->checkbox(['label' => null]) ?></td>
								<td>&nbsp;</td>
							</tr>
							<tr id="no_of_coupon_row">
								<td><?= Html::activeLabel($model,'app_no_of_coupon', ['class'=> 'app_no_of_coupon']); ?></td>
								<td><?= $form->field($model, 'app_no_of_coupon', $templatewithoutlabel)->textInput(['maxlength' => true]) ?></td>
								<td><?= $form->field($model, 'app_no_of_coupon_fixed', $templatewithoutlabel)->checkbox(['label' => null]) ?></td>
							</tr>
							<tr id="cupn_prd_row">
								<td><?= Html::activeLabel($model,'app_cupn_prd', ['class'=> 'app_cupn_prd']); ?></td>
								<td><?= $form->field($model, 'app_cupn_prd', $templatewithoutlabel)->textInput(['maxlength' => true]) ?></td>
								<td style="vertical-align: middle;" rowspan="2"><?= $form->field($model, 'app_cupn_prd_fixed', $templatewithoutlabel)->checkbox(['label' => null]) ?></td>
							</tr>
							<tr id="cupn_prdtype_row">
								<td><?= Html::activeLabel($model,'app_cupn_prd_type', ['class'=> 'app_cupn_prd_type']); ?></td>
								<td><?= $form->field($model, 'app_cupn_prd_type', $templatewithoutlabel)->dropDownList($model->prd_type, ['prompt' => $model->getAttributeLabel("app_cupn_prd_type")]) ?></td>
							</tr>
							<tr id="incentive_amt_row">
								<td><?= Html::activeLabel($model,'app_incentive_amt', ['class'=> 'app_incentive_amt']); ?></td>
								<td><?= $form->field($model, 'app_incentive_amt', $templatewithoutlabel)->textInput(['maxlength' => true]) ?></td>
								<td><?= $form->field($model, 'app_incentive_amt_fixed', $templatewithoutlabel)->checkbox(['label' => null]) ?></td>
							</tr>
						</tbody>
					</table>
					<!--
					<?php // echo $form->field($model, 'app_reimbsmnt_vchr', $template)->textInput(['maxlength' => true]) ?>
					<?php // echo $form->field($model, 'app_reimbsmnt_vchr_fixed', $template)->checkbox(['label' => null])->label() ?>
					<?php // echo $form->field($model, 'app_location', $template)->textInput(['maxlength' => true]) ?>
					<?php // echo $form->field($model, 'app_location_fixed', $template)->checkbox(['label' => null])->label() ?>
					<?php // echo $form->field($model, 'app_cupn_cde_fixed', $template)->checkbox(['label' => null])->label() ?>
					<?php // echo $form->field($model, 'app_no_of_coupon', $template)->textInput(['maxlength' => true]) ?>
					<?php // echo $form->field($model, 'app_no_of_coupon_fixed', $template)->checkbox(['label' => null])->label() ?>
					<?php // echo $form->field($model, 'app_cupn_prd', $template)->textInput(['maxlength' => true]) ?>
					<?php // echo $form->field($model, 'app_cupn_prd_type', $template)->textInput(['maxlength' => true]) ?>
					<?php // echo $form->field($model, 'app_cupn_prd_fixed', $template)->checkbox(['label' => null])->label() ?>
					<?php // echo $form->field($model, 'app_incentive_amt', $template)->textInput(['maxlength' => true]) ?>
					<?php // echo $form->field($model, 'app_incentive_amt_fixed', $template)->checkbox(['label' => null])->label() ?>
					<?php // echo $form->field($model, 'app_incentive_vchr', $template)->textInput(['maxlength' => true]) ?>
					<?php // echo $form->field($model, 'app_incentive_vchr_fixed', $template)->checkbox(['label' => null])->label() ?>
					-->
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