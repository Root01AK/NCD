<?php

use app\base\Common;
use yii\helpers\Html;
use yii\widgets\ActiveForm;

/* @var $this yii\web\View */
/* @var $model app\models\Settings */
/* @var $form yii\widgets\ActiveForm */

$Surveys = Common::getSurvey();
if(!$model->isNewRecord && $model->smtp_server_pwd != "")
	$model->smtp_server_pwd = base64_decode($model->smtp_server_pwd);

$js = "
	$('#settings-stngs_survey_code').change(function(){
		if($(this).val() != '') {
			$('div.form-group.field-settings-stngs_survey_fixed').show();
			// $('#settings-stngs_survey_fixed').prop('checked', true);
		} else {
			$('div.form-group.field-settings-stngs_survey_fixed').hide();
			// $('#settings-stngs_survey_fixed').prop('checked', false);
		}
	});
	$('#settings-stngs_survey_code').trigger('change');
";
$this->registerJs($js);

?>

<div class="settings-form">
	<div class="panel tabs panel-default">
		<div class="panel-heading">
			<ul class="nav nav-tabs">
				<li class="active"><a data-toggle="tab" href="#general">General Settings</a></li>
				<li><a data-toggle="tab" href="#org">Organisation Settings</a></li>
				<li><a data-toggle="tab" href="#smtp">SMTP Settings</a></li>
			</ul>
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
					<?= $form->errorSummary($model); ?>
					<div class="tab-content">
						<div id="general" class="tab-pane fade in active">
							<?= $form->field($model, 'stngs_app_name', $template)->textInput() ?>
							<?= $form->field($model, 'stngs_timezone', $template)->widget(\miserenkov\TimeZonePicker::className(), ['options' => ['class' => 'form-control']]) ?>
							<?= $form->field($model, 'stngs_dateformat', $template)->dropDownList($model->dtformat, ['prompt' => $model->getAttributeLabel("stngs_dateformat")]) ?>
							<?= $form->field($model, 'stngs_survey_code', $template)->dropDownList($Surveys, ['prompt' => $model->getAttributeLabel("stngs_survey_code")]) ?>
							<?= $form->field($model, 'stngs_survey_fixed', $template)->checkbox(['label' => null])->label() ?>
							<?= $form->field($model, 'status', $template)->checkbox(['label' => null])->label() ?>
							<?php // echo $form->field($model, 'stngs_pagesize', $template)->textInput() ?>
							<?php // echo $form->field($model, 'stngs_incendv_amt', $template)->textInput() ?>
							<?php // echo $form->field($model, 'stngs_financial_year', $template)->textInput() ?>
							<?php // echo $form->field($model, 'stngs_location', $template)->textInput(['maxlength' => true]) ?>
						</div>
						<div id="org" class="tab-pane fade">
							<?php // echo $form->field($model, 'stngs_org_logo', $template)->textInput() ?>
							<?= $form->field($model, 'stngs_org_name', $template)->textInput() ?>
							<?= $form->field($model, 'stngs_org_addrs', $template)->textInput() ?>
							<?= $form->field($model, 'stngs_org_phone', $template)->textInput(['maxlength' => true]) ?>
							<?= $form->field($model, 'stngs_org_mail', $template)->textInput() ?>
							<?= $form->field($model, 'stngs_org_website', $template)->textInput() ?>
						</div>
						<div id="smtp" class="tab-pane fade">
							<?= $form->field($model, 'smtp_admin_name', $template)->textInput() ?>
							<?= $form->field($model, 'smtp_frm_mail', $template)->textInput() ?>
							<?= $form->field($model, 'smtp_server_name', $template)->textInput() ?>
							<?= $form->field($model, 'smtp_server_port', $template)->textInput() ?>
							<?= $form->field($model, 'smtp_server_usrname', $template)->textInput() ?>
							<?= $form->field($model, 'smtp_server_pwd', $template)->passwordInput() ?>
							<?= $form->field($model, 'smtp_server_ssl', $template)->checkbox(['label' => null])->label() ?>
							<?= $form->field($model, 'smtp_server_auth', $template)->checkbox(['label' => null])->label() ?>
						</div>
					</div>
					<br/>
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