<?php

use yii\helpers\Html;
use yii\widgets\ActiveForm;

/* @var $this yii\web\View */
/* @var $model app\models\TrackingformSearch */
/* @var $form yii\widgets\ActiveForm */
?>

<div class="trackingform-search">

    <?php $form = ActiveForm::begin([
        'action' => ['index'],
        'method' => 'get',
    ]); ?>

    <?= $form->field($model, 'track_form_id') ?>

    <?= $form->field($model, 'track_form_survey') ?>

    <?= $form->field($model, 'track_form_part_id') ?>

    <?= $form->field($model, 'track_form_q1') ?>

    <?= $form->field($model, 'track_form_q2') ?>

    <?php // echo $form->field($model, 'track_form_q3') ?>

    <?php // echo $form->field($model, 'track_form_q4') ?>

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
