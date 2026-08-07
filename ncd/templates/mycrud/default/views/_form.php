<?php

use yii\helpers\Inflector;
use yii\helpers\StringHelper;

/* @var $this yii\web\View */
/* @var $generator yii\gii\generators\crud\Generator */

/* @var $model \yii\db\ActiveRecord */
$model = new $generator->modelClass();
$safeAttributes = $model->safeAttributes();
if (empty($safeAttributes)) {
    $safeAttributes = $model->attributes();
}

echo "<?php\n";
?>

use yii\helpers\Html;
use yii\widgets\ActiveForm;

/* @var $this yii\web\View */
/* @var $model <?= ltrim($generator->modelClass, '\\') ?> */
/* @var $form yii\widgets\ActiveForm */
?>

<div class="<?= Inflector::camel2id(StringHelper::basename($generator->modelClass)) ?>-form">
	<div class="panel panel-default">
		<div class="panel-heading">
			Form Elements
		</div>
		<div class="panel-body">
			<div class="row">
				<div class="col-lg-12">
					<?= "<?php" ?>

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
					<?= "<?= \$form->errorSummary(\$model); ?>\n" ?>
					<?php foreach ($generator->getColumnNames() as $attribute) {
						if (in_array($attribute, $safeAttributes)) {
							if($attribute == "status")
								echo "<?= \$form->field(\$model, 'status', \$template)->checkbox(['label' => null])->label() ?>\n\t\t\t\t\t";
							elseif($attribute == "create_user")
								echo "<?= \$form->field(\$model, \$model->isNewRecord ? 'create_user' : 'update_user', \$htemplate)->hiddenInput(['value' => yii::\$app->user->identity->id])->label(\"\") ?>\n\t\t\t\t\t";
							elseif($attribute != "del_status" && $attribute != "create_time" && $attribute != "update_user" && $attribute != "update_time")
								echo "<?= " . $generator->generateActiveField($attribute) . " ?>\n\t\t\t\t\t";
						}
					} ?>
<div class="form-group">
						<div class="col-sm-offset-5 col-sm-7">
							<?= "<?= " ?>Html::submitButton($model->isNewRecord ? <?= $generator->generateString('Create') ?> : <?= $generator->generateString('Update') ?>, ['class' => $model->isNewRecord ? 'btn btn-success' : 'btn btn-primary']) ?>
							<?= "<?= " ?>Html::a('Cancel', ['/'.Yii::$app->controller->id], ['class' => 'btn btn-default']) ?>
						</div>
					</div>
					<?= "<?php " ?>ActiveForm::end(); ?>
				</div>
				<!-- /.col-lg-6 (nested) -->
			</div>
			<!-- /.row (nested) -->
		</div>
		<!-- /.panel-body -->
	</div>
	<!-- /.panel -->
</div>