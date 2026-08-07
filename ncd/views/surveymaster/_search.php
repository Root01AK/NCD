<?php

use yii\helpers\Html;
use yii\widgets\ActiveForm;

/* @var $this yii\web\View */
/* @var $model app\models\SurveymasterSearch */
/* @var $form yii\widgets\ActiveForm */
?>

<div class="surveymaster-search">

    <?php $form = ActiveForm::begin([
        'action' => ['index'],
        'method' => 'get',
    ]); ?>

    <?= $form->field($model, 'sur_id') ?>

    <?= $form->field($model, 'sur_code') ?>

    <?= $form->field($model, 'sur_title') ?>

    <?= $form->field($model, 'sur_url') ?>

    <?= $form->field($model, 'sur_onlne_id') ?>

    <?php // echo $form->field($model, 'sur_pri_db_name') ?>

    <?php // echo $form->field($model, 'sur_pri_db_server') ?>

    <?php // echo $form->field($model, 'sur_pri_db_usrnme') ?>

    <?php // echo $form->field($model, 'sur_pri_db_paswrd') ?>

    <?php // echo $form->field($model, 'sur_sec_db_name') ?>

    <?php // echo $form->field($model, 'sur_sec_db_server') ?>

    <?php // echo $form->field($model, 'sur_sec_db_usrnme') ?>

    <?php // echo $form->field($model, 'sur_sec_db_paswrd') ?>

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
