<?php

use yii\helpers\Html;
use yii\widgets\ActiveForm;

/* @var $this yii\web\View */
/* @var $model app\models\Users */
/* @var $form yii\widgets\ActiveForm */
?>

<div class="users-form">
	<div class="panel panel-default">
		<div class="panel-heading">
			
		</div>
		<div class="panel-body">
			<div class="row">
				<div class="col-lg-12">
					<?php
						$form = ActiveForm::begin(['options' => ['class' => 'form-horizontal']]);
						$template = [
							'labelOptions' => ['class' => 'control-label col-sm-2'],
							'template' => '{label} <div class="col-sm-4">{input}{error}{hint}</div>',
						];
						$htemplate = [
							'options' => ['tag' => false],
							'template' => '{input}'
						];
					?>
					<?= $form->field($model, 'user_type', $template)->textInput() ?>
					<?= $form->field($model, 'users_name', $template)->textInput(['maxlength' => true]) ?>
					<?= $form->field($model, 'password', $template)->passwordInput(['maxlength' => true]) ?>
					<?= $form->field($model, 'full_name', $template)->textInput(['maxlength' => true]) ?>
					<?= $form->field($model, 'email', $template)->textInput(['maxlength' => true]) ?>
					<?= $form->field($model, 'status', $template)->checkbox(['label' => null])->label() ?>
					<?= $form->field($model, $model->isNewRecord ? 'create_user' : 'update_user', $htemplate)->hiddenInput(['value' => yii::$app->user->identity->id])->label("") ?>
					<div class="form-group">
						<div class="col-sm-offset-2 col-sm-10">
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