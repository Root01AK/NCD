<?php

use yii\helpers\Html;
use yii\widgets\ActiveForm;
use yii\bootstrap\Tabs;

/* @var $this yii\web\View */
/* @var $model app\models\Surveymaster */
/* @var $form yii\widgets\ActiveForm */
?>

<div class="surveymaster-form">
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
					
					<?php
						/*
						echo Tabs::widget([
						    'items' => [
						        [
						            'label' => 'One',
						            'content' => 'Anim pariatur cliche...',
						            'active' => true
						        ],
						        [
						            'label' => 'Two',
						            'content' => 'Anim pariatur cliche...',
						            'headerOptions' => ['Testing'],
						            'options' => ['id' => 'myveryownID'],
						        ],
						        [
						            'label' => 'Example',
						            'url' => 'http://www.example.com',
						        ],
						        [
						            'label' => 'Dropdown',
						            'items' => [
						                 [
						                     'label' => 'DropdownA',
						                     'content' => 'DropdownA, Anim pariatur cliche...',
						                 ],
						                 [
						                     'label' => 'DropdownB',
						                     'content' => 'DropdownB, Anim pariatur cliche...',
						                 ],
						                 [
						                     'label' => 'External Link',
						            		 'content' => '',
						                     'url' => 'http://www.example.com',
						                 ],
						            ],
						        ],
						    ],
						]);
						*/
					?>
					<?= $form->field($model, 'sur_code', $template)->textInput(['maxlength' => true]) ?>
					<?= $form->field($model, 'sur_title', $template)->textInput(['maxlength' => true]) ?>
					<?= $form->field($model, 'sur_url', $template)->textInput(['maxlength' => true]) ?>
					<?= $form->field($model, 'sur_onlne_id', $template)->textInput(['maxlength' => true])->hint("<b>Example</b>: 12345, 54321, ..") ?>
					<?= $form->field($model, 'sur_pri_db_name', $template)->textInput(['maxlength' => true]) ?>
					<?= $form->field($model, 'sur_pri_db_server', $template)->textInput(['maxlength' => true]) ?>
					<?= $form->field($model, 'sur_pri_db_usrnme', $template)->textInput(['maxlength' => true]) ?>
					<?= $form->field($model, 'sur_pri_db_paswrd', $template)->passwordInput(['maxlength' => true]) ?>
					<?= $form->field($model, 'sur_sec_db_name', $template)->textInput(['maxlength' => true]) ?>
					<?= $form->field($model, 'sur_sec_db_server', $template)->textInput(['maxlength' => true]) ?>
					<?= $form->field($model, 'sur_sec_db_usrnme', $template)->textInput(['maxlength' => true]) ?>
					<?= $form->field($model, 'sur_sec_db_paswrd', $template)->passwordInput(['maxlength' => true]) ?>
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