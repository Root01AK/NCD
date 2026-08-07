<?php

use yii\helpers\Html;
use yii\widgets\ActiveForm;

/* @var $this yii\web\View */
/* @var $model app\models\Mainmenu */
/* @var $form yii\widgets\ActiveForm */
if($model->isNewRecord)
	$model->status = 1;
?>

<div class="mainmenu-form">
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
					<?= $form->errorSummary($model); ?>
					<?= $form->field($model, 'min_mnu_name', $template)->textInput(['maxlength' => true]) ?>
					<?= $form->field($model, 'min_mnu_desc', $template)->textInput(['maxlength' => true]) ?>
					<?= $form->field($model, 'min_mnu_preference', $template)->textInput() ?>
					<?= $form->field($model, 'status', $template)->checkbox(['label' => null])->label() ?>
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