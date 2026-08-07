<?php

use yii\web\View;
use yii\helpers\Html;
use yii\helpers\ArrayHelper;
use yii\widgets\ActiveForm;
use app\models\Surveymaster;
use app\models\State;
use wbraganca\dynamicform\DynamicFormWidget;

/* @var $this yii\web\View */
/* @var $model app\models\Locationmapping */
/* @var $form yii\widgets\ActiveForm */

$Surveys = ArrayHelper::map(Surveymaster::find()->orderBy(["sur_id" => SORT_ASC])->all(), 'sur_code', 'sur_title');
$Locations = ArrayHelper::map(State::find()->where(["status" => 1])->orderBy(["state" => SORT_ASC])->all(), 'state_code', 'state');

$headJS = <<<JS
function survey_change(ctrl) {
	// console.log($(ctrl).val());
	jQuery(".dynamicform_wrapper .item").each(function(index) {
		$("#locationmapping-" + index + "-loc_mapng_sur_id").val($(ctrl).val());
    });
}
JS;
$this->registerJs($headJS, View::POS_HEAD);

$js = <<<JS
jQuery(".dynamicform_wrapper").on("afterInsert", function(e, item) {
    jQuery(".dynamicform_wrapper .item").each(function(index) {
    	if($("#locationmapping-" + index + "-loc_mapng_sur_id").val() == "") {
			$("#locationmapping-" + index + "-loc_mapng_sur_id").val($("#locationmapping-0-loc_mapng_sur_id").val());
			jQuery(this).find(':input').each(function() {
			    switch(this.type) {
			        case 'password':
			        case 'text':
			        case 'textarea':
			        case 'file':
			        case 'select-one':
			        case 'select-multiple':
			        case 'date':
			        case 'number':
			        case 'tel':
			        case 'email':
			            jQuery(this).val('');
			            break;
			        case 'checkbox':
			        case 'radio':
			            this.checked = false;
			            break;
			    }
			  });
    	}
    });
});

jQuery(".dynamicform_wrapper").on("beforeDelete", function(e, item) {
	// console.log($(item).find(':input').first().val());
	$("#locationmapping-delrec").val($(item).find(':input').first().val() + "," + $("#locationmapping-delrec").val());
});

jQuery(".dynamicform_wrapper").on("afterDelete", function(e) {
	// console.log(e);
    jQuery(".dynamicform_wrapper .panel-title-address").each(function(index) {
        jQuery(this).html("Address: " + (index + 1))
    });
});
JS;
$this->registerJs($js);
?>

<div class="locationmapping-form">
	<div class="panel panel-default">
		<div class="panel-heading">
			
		</div>
		<div class="panel-body">
			<div class="row">
				<div class="col-lg-12">
					<?php
						$form = ActiveForm::begin(['id' => 'dynamic-form1', 'options' => ['class' => 'form-horizontal']]);
						$template = [
							'labelOptions' => ['class' => 'form-label'],
							'template' => '<div class="col-sm-5">{label}{hint}</div><div class="col-sm-4">{input}{error}</div>',
						];
						$htemplate = [
							'options' => ['tag' => false],
							'template' => '{input}'
						];
						$dynamictemplate = [
							// 'options' => ['tag' => false],
							'template' => '<div class="col-md-12">{input}{error}{hint}</div>'
						];
					?>
					<?php  $form->errorSummary($model); ?>
					<?= $form->field($model, 'loc_mapng_sur_id', $template)->dropDownList($Surveys, ['onchange' => 'survey_change(this)']) ?>
					<?php DynamicFormWidget::begin([
						'widgetContainer' => 'dynamicform_wrapper', // required: only alphanumeric characters plus "_" [A-Za-z0-9_]
						'widgetBody' => '.container-items', // required: css class selector
						'widgetItem' => '.item', // required: css class
						'limit' => 999, // the maximum times, an element can be cloned (default 999)
						'min' => 1, // 0 or 1 (default 1)
						'insertButton' => '.add-item', // css class
						'deleteButton' => '.remove-item', // css class
						'model' => $models[0],
						'formId' => 'dynamic-form1',
						'formFields' => [
							'loc_mapng_id',
							'loc_mapng_sur_id',
							'loc_mapng_mstr_id',
							'create_user',
							'update_user',
						],
					]); ?>
					<table class="table table-bordered container-items" border="0" cellpadding="0" cellspacing="0" align="center">
						<thead>
							<tr>
								<td><?= Html::activeLabel($model,'loc_mapng_mstr_id'); ?></td>
								<td align="center">
									<button type="button" class="hidden" class="add-item btn btn-success btn-xs"><i class="fa fa-plus"></i></button>
								</td>
							</tr>
						</thead>
						<tbody>
							<?php foreach ($models as $index => $modelAddress): ?>
								<tr class="item">
									<td>
										<?= $form->field($modelAddress, "[{$index}]loc_mapng_id", $htemplate)->hiddenInput()->label("") ?>
										<?= $form->field($modelAddress, "[{$index}]loc_mapng_sur_id", $htemplate)->hiddenInput()->label("") ?>
										<?= $form->field($modelAddress, "[{$index}]loc_mapng_mstr_id", $dynamictemplate)->dropDownList($Locations)->label("") ?>
									</td>
									<td align="center">
										<button type="button" class="hidden" class="remove-item btn btn-danger btn-xs"><i class="fa fa-minus"></i></button>
									</td>
								</tr>
							<?php endforeach; ?>
						</tbody>
					</table>
					<?php DynamicFormWidget::end(); ?>
					<?= $form->field($model, "delrec", $htemplate)->hiddenInput(['value' => ""])->label("") ?>
					<?= $form->field($model, 'status', $htemplate)->hiddenInput(['value' => "1"])->label("") ?>
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