<?php
use yii\web\View;
use yii\helpers\Html;
use yii\widgets\ActiveForm;
use app\base\Common;
use kartik\select2\Select2;
use yii\widgets\Pjax;

$Loc = Common::getLocations();

/* @var $this yii\web\View */
/* @var $model app\models\Users */
/* @var $form yii\widgets\ActiveForm */

$JS = "	

   $('#users-selectall').click(function(){	
        if($(this).is(':checked')){			    	
			$('#distcheckboxes').find('input:checkbox').prop('checked', $(this).is(':checked'));            
        }else{                     
			$('#distcheckboxes').find('input:checkbox').prop('checked', $(this).is(':checked'));
         
        }
    });

";

$this->registerJs($JS);

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
						/*$template = [
							'labelOptions' => ['class' => 'control-label col-sm-2'],
							'template' => '{label} <div class="col-sm-4">{input}{error}{hint}</div>',
						];
						$chklist_template= [
							//'labelOptions' => ['class' => 'form-label'],
							'labelOptions' => ['class' => 'control-label col-sm-6'],
							//'template' => '{label} <div class="col-sm-4">{input}{error}{hint}</div>',
							'template' => '<div class="col-sm-4">{label}</div><div class="col-sm-6 checkbox-list">{input}{error}{hint}</div>',
						];
							
						$htemplate = [
							'options' => ['tag' => false],
							'template' => '{input}'
						];
						*/
						
					
                       $template = [
							'labelOptions' => ['class' => 'form-label'],
							'template' => '<div class="col-sm-3">{label}{hint}</div><div class="col-sm-3">{input}{error}</div>',
						];
						$htemplate = [
							'options' => ['tag' => false],
							'template' => '{input}'
						];
												
                        $chklist_template = [
							'labelOptions' => ['class' => 'form-label'],
							'template' => '<div class="col-sm-3">{label}{hint}</div><div class="col-sm-3 checkbox-list">{input}{error}</div>',
						];							
					?>
					<?= $form->field($model, 'user_type', $template)->hiddenInput()->label("") ?>
					<?= $form->field($model, 'users_name', $template)->textInput(['maxlength' => true]) ?>
					<?= $form->field($model, 'password', $template)->passwordInput(['maxlength' => true]) ?>
					<?= $form->field($model, 'full_name', $template)->textInput(['maxlength' => true]) ?>
					<?= $form->field($model, 'email', $template)->textInput(['maxlength' => true]) ?>
				    <?= $form->field($model, 'user_role', $template)->dropDownList($model->userrole,['prompt' =>'Select'])?>
					<?= $form->field($model, 'selectall', $template)->checkbox(['label' => "Select all Locations"]) ?>
					
                    <div id="distcheckboxes">					
					 <?= $form->field($model, 'loc_code', $chklist_template)->checkboxList($Loc) ?>
					</div>
					
					<?php if($model->isNewRecord) : ?>			
					  <?= $form->field($model, 'status', $htemplate)->hiddenInput(['value' => 1])->label("") ?>
					<?php else: ?>	
					  <?= $form->field($model, 'status', $template)->checkbox(['label' => null])->label() ?>
					<?php endif; ?>	
					
					<?= $form->field($model, $model->isNewRecord ? 'create_user' : 'update_user', $htemplate)->hiddenInput(['value' => yii::$app->user->identity->id])->label("") ?>
					<div class="form-group">
						<div class="col-sm-offset-3 col-sm-6">
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