<?php
use yii\web\View;
use app\base\Common;
use yii\helpers\Html;
use yii\widgets\ActiveForm;
use wbraganca\dynamicform\DynamicFormWidget;

/* @var $this yii\web\View */
/* @var $model app\models\Menuprivileges */
/* @var $form yii\widgets\ActiveForm */

$mainmenus = Common::getMainmenus();
$submenus = Common::getSubmenus();
$users = Common::getUsers();

$form = ActiveForm::begin(['options' => ['class' => 'form-horizontal']]);
$template = [
	// 'enableAjaxValidation' => true,
	'labelOptions' => ['class' => 'form-label'],
	'template' => '<div class="col-sm-5">{label}{hint}</div><div class="col-sm-4">{input}{error}</div>',
];
$htemplate = [
	'options' => ['tag' => false],
	'template' => '{input}'
];
$hlabeltemplate = [
	'options' => ['tag' => false],
	'template' => '{label}{input}'
];
$dynamictemplate = [
	// 'options' => ['tag' => false],
	'template' => '<div class="col-md-12">{input}{error}{hint}</div>'
];

$headJS = <<<JS
function user_change(ctrl) {
	jQuery(".dynamicform_wrapper .item").each(function(index) {
		if($(ctrl).val() != "")
			$("#menuprivileges-" + index + "-mnu_acs_usr_id_fk").val($(ctrl).val());
    });
}

function main_change(ctrl) {
	jQuery(".dynamicform_wrapper .item").each(function(index) {
		if($(ctrl).val() != "")
			$("#menuprivileges-" + index + "-mnu_acs_mnu_id_fk").val($(ctrl).val());
    });
}
JS;
$this->registerJs($headJS, View::POS_HEAD);

$JS = "
	$('.check-all').click(function() {
		var _this = $(this);
		$('input[type=checkbox].check-' + $(this).val()).each(function() {
			$(this).prop('checked', _this.is(':checked'));
		});
	});

	$(':checkbox:not(.check-all)').click(function() {
		var chkclass = $(this).attr('class');
		var len = $('input[type=checkbox].' + chkclass).length;
		var chklen = $('input[type=checkbox].' + chkclass + ':checked').length;

		if(len == chklen)
			$('input[type=checkbox][value=' + chkclass.replace('check-', '') +']').prop('checked', true);
		else
			$('input[type=checkbox][value=' + chkclass.replace('check-', '') +']').prop('checked', false);
	});

	$('#menuprivileges-mnu_acs_usr_id_fk, #menuprivileges-mnu_acs_mnu_id_fk').trigger('change');
";

$this->registerJs($JS);
$model->mnu_acs_mnu_id_fk = '';
?>
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
		'mnu_acs_id',
		'mnu_acs_usr_id_fk',
		'mnu_acs_mnu_id_fk',
		'mnu_acs_sub_mnu_id_fk',
		'create_user',
		'update_user',
	],
]); ?>
<table class="table table-bordered container-items" border="0" cellpadding="0" cellspacing="0" align="center">
	<thead>
		<tr>
			<td class="text-left col-md-6"><?= Html::activeLabel($model,'mnu_acs_sub_mnu_id_fk'); ?></td>
			<td class="text-center col-md-2">
				<?= Html::checkbox(null, false, ['class' => 'check-all', 'value' => 'add', 'label' => $model->getAttributeLabel("mnu_acs_add")]); ?>
			</td>
			<td class="text-center col-md-2">
				<?= Html::checkbox(null, false, ['class' => 'check-all', 'value' => 'edit', 'label' => $model->getAttributeLabel("mnu_acs_edit")]); ?>
			</td>
			<td class="text-center col-md-2">
				<?= Html::checkbox(null, false, ['class' => 'check-all', 'value' => 'delete', 'label' => $model->getAttributeLabel("mnu_acs_delete")]); ?>
			</td>
		</tr>
	</thead>
	<tbody>
		<?php foreach ($models as $index => $modelAddress): ?>
			<tr class="item">
				<td>
					<?= $form->field($modelAddress, "[{$index}]mnu_acs_id", $htemplate)->hiddenInput()->label("") ?>
					<?= $form->field($modelAddress, "[{$index}]mnu_acs_usr_id_fk", $htemplate)->hiddenInput()->label("") ?>
					<?= $form->field($modelAddress, "[{$index}]mnu_acs_mnu_id_fk", $htemplate)->hiddenInput()->label("") ?>
					<?= $form->field($modelAddress, $modelAddress->isNewRecord ? "[{$index}]create_user" : "[{$index}]update_user", $htemplate)->hiddenInput(['value' => yii::$app->user->identity->id])->label("") ?>
					<?= $form->field($modelAddress, "[{$index}]mnu_acs_sub_mnu_id_fk", $hlabeltemplate)->hiddenInput()->label($modelAddress->submenus->sub_mnu_desc) ?>
				</td>
				<td class="text-center">
					<?= $form->field($modelAddress, "[{$index}]mnu_acs_add", $dynamictemplate)->checkbox(["label" => null, 'class' => 'check-add']) ?>
				</td>
				<td class="text-center">
					<?= $form->field($modelAddress, "[{$index}]mnu_acs_edit", $dynamictemplate)->checkbox(["label" => null, 'class' => 'check-edit']) ?>
				</td>
				<td class="text-center">
					<?= $form->field($modelAddress, "[{$index}]mnu_acs_delete", $dynamictemplate)->checkbox(["label" => null, 'class' => 'check-delete']) ?>
				</td>
			</tr>
		<?php endforeach; ?>
	</tbody>
</table>
<?php DynamicFormWidget::end(); ?>