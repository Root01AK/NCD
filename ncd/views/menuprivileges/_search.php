<?php

use yii\helpers\Html;
use yii\widgets\ActiveForm;

/* @var $this yii\web\View */
/* @var $model app\models\MenuprivilegesSearch */
/* @var $form yii\widgets\ActiveForm */
?>

<div class="menuprivileges-search">

    <?php $form = ActiveForm::begin([
        'action' => ['index'],
        'method' => 'get',
    ]); ?>

    <?= $form->field($model, 'mnu_acs_id') ?>

    <?= $form->field($model, 'mnu_acs_usr_id_fk') ?>

    <?= $form->field($model, 'mnu_acs_mnu_id_fk') ?>

    <?= $form->field($model, 'mnu_acs_sub_mnu_id_fk') ?>

    <?= $form->field($model, 'mnu_acs_usr_status') ?>

    <?php // echo $form->field($model, 'mnu_acs_add') ?>

    <?php // echo $form->field($model, 'mnu_acs_edit') ?>

    <?php // echo $form->field($model, 'mnu_acs_delete') ?>

    <?php // echo $form->field($model, 'status') ?>

    <?php // echo $form->field($model, 'create_time') ?>

    <?php // echo $form->field($model, 'create_user') ?>

    <?php // echo $form->field($model, 'update_time') ?>

    <?php // echo $form->field($model, 'update_user') ?>

    <div class="form-group">
        <?= Html::submitButton(Yii::t('app', 'Search'), ['class' => 'btn btn-primary']) ?>
        <?= Html::resetButton(Yii::t('app', 'Reset'), ['class' => 'btn btn-default']) ?>
    </div>

    <?php ActiveForm::end(); ?>

</div>
